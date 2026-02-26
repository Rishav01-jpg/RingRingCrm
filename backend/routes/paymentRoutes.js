// backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const Payment = require('../models/payment');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// helper to calculate plan price
function getAmountForPlan(plan) {
  if (plan === 'half') return 2 * 100;   // 2999 INR → 299900 paise
  if (plan === 'yearly') return 4999 * 100; // 4999 INR → 499900 paise
  throw new Error('Invalid plan');
}


// ✅ Create Razorpay order
// POST /api/payments/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { email, plan } = req.body;
    if (!email || !plan) {
      return res.status(400).json({ message: 'Email and plan are required' });
    }

    const amount = getAmountForPlan(plan);

    const options = {
      amount,
      currency: 'INR',
       receipt: `r_${uuidv4().slice(0, 32)}` 
    };

    const order = await razorpay.orders.create(options);

    // Save Payment record
    const payment = new Payment({
      email: email.toLowerCase(),
      plan,
      amount,
      razorpay_order_id: order.id,
      status: 'created'
    });
    await payment.save();

    res.json({ order, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// ✅ Verify payment after checkout
// POST /api/payments/verify
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    // verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // find payment record
    const payment = await Payment.findOne({ razorpay_order_id, email: email.toLowerCase() });
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });

    // mark as paid
    payment.status = 'paid';
    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;

    // set expiry (6 months or 1 year)
    const expiresAt = new Date();
    if (payment.plan === 'half') {
      expiresAt.setMonth(expiresAt.getMonth() + 6);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }
    payment.expiresAt = expiresAt;

    await payment.save();

    res.json({ message: 'Payment verified successfully', expiresAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error verifying payment' });
  }
});
// ✅ Check subscription by email
// Example: GET /api/payments/status?email=test@test.com
router.get('/status', async (req, res) => {
  try {
    const email = (req.query.email || '').toLowerCase();
    if (!email) return res.status(400).json({ message: 'email is required' });

    // Find the most recent PAID payment for this email
    const latest = await Payment.findOne({ email, status: 'paid' })
      .sort({ createdAt: -1 });

    if (!latest) {
      return res.json({ subscription: 'inactive' });
    }

    const now = new Date();
    if (latest.expiresAt && latest.expiresAt > now) {
      return res.json({ subscription: 'active', expiresAt: latest.expiresAt });
    } else {
      return res.json({ subscription: 'inactive', expiresAt: latest.expiresAt });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error checking subscription status' });
  }
});

module.exports = router;

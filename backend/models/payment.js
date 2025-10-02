// backend/models/payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  plan: { type: String, enum: ['half','yearly'], required: true },
  amount: { type: Number, required: true }, // in paise
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  status: { type: String, enum: ['created','paid','failed'], default: 'created' },
  used: { type: Boolean, default: false }, // true when consumed at signup
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);

const express = require('express');
const router = express.Router();
const InstantLead = require('../models/instantLeadModel');

router.post('/instant-leads', async (req, res) => {
  try {
    const { name, email, phone, businessType, description, paymentStatus } = req.body;

    if (paymentStatus !== 'PAID') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const newLeadRequest = new InstantLead({
      name,
      email,
      phone,
      businessType,
      description,
      status: 'pending'
    });

    await newLeadRequest.save();
    res.status(201).json({ message: 'Lead request submitted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting lead request' });
  }
});

module.exports = router;

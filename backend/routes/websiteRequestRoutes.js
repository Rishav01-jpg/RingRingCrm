// routes/getWebsiteRoutes.js
const express = require('express');
const router = express.Router();
const GetWebsite = require('../models/GetWebsite'); // import model

router.post('/', async (req, res) => {
  try {
    const { businessName, email, phone, description } = req.body;

    // Create new document and save to DB
    const newRequest = new GetWebsite({
      businessName,
      email,
      phone,
      description
    });

    await newRequest.save();

    console.log('New Website Request Saved:', newRequest);
    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (err) {
    console.error('Error saving form:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const requests = await GetWebsite.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error('Error fetching website requests:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;



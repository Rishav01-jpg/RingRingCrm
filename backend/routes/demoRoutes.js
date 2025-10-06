const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const DemoBooking = require('../models/demoBooking');
require('dotenv').config();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Book a demo
router.post('/book', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Validate input
    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Set demo date to tomorrow at 12:00 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);

    // Create new booking
    const newBooking = new DemoBooking({
      name,
      email,
      phone,
      date: tomorrow
    });

    // Save booking to database
    await newBooking.save();

    // Send confirmation email
    const confirmationMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '✅ Demo Booked Successfully',
      html: `<p>Hi ${name},</p><p>Your demo is booked for tomorrow at 12:00 PM.</p>`
    };

    await transporter.sendMail(confirmationMailOptions);

    // Schedule reminder email for testing at 8:51 PM today
    const reminderTime = new Date();
    reminderTime.setHours(10, 10, 0, 0); // 10:10am

    const currentTime = new Date();
    const timeUntilReminder = reminderTime.getTime() - currentTime.getTime();

    if (timeUntilReminder > 0) {
      // Schedule the reminder email
      setTimeout(async () => {
        const reminderMailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: '📢 Reminder: Live Demo Today at 12:00 PM',
          html: `<p>Hi ${name},</p><p>Your live demo starts today at 12:00 PM.</p><p>Zoom Link: <a href="https://us05web.zoom.us/j/85672639183?pwd=F9yrR2bOrgOuShEWWy2AaDHU2GKlO1.1">https://us05web.zoom.us/j/85672639183?pwd=F9yrR2bOrgOuShEWWy2AaDHU2GKlO1.1</a></p>`
        };

        try {
          await transporter.sendMail(reminderMailOptions);
          console.log(`Reminder email sent to ${email}`);
        } catch (error) {
          console.error('Error sending reminder email:', error);
        }
      }, timeUntilReminder);
    }

    res.status(201).json({ success: true, message: 'Demo booked successfully' });
  } catch (error) {
    console.error('Error booking demo:', error);
    res.status(500).json({ success: false, message: 'Failed to book demo' });
  }
});

module.exports = router;
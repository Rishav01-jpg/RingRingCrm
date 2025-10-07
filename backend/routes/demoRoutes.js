const express = require("express");
const router = express.Router();
const { Resend } = require("resend");
const DemoBooking = require("../models/demoBooking");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Book a demo
router.post("/book", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all required fields" });
    }

    // Set demo date to tomorrow at 12:00 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);

    const newBooking = new DemoBooking({
      name,
      email,
      phone,
      date: tomorrow,
    });

    await newBooking.save();

    // ✅ Send confirmation email
    await resend.emails.send({
      from: "Ring Ring CRM <onboarding@resend.dev>", // sender name updated
      to: email,
      subject: "✅ Demo Booked Successfully",
      html: `<p>Hi ${name},</p><p>Your demo is booked for tomorrow at 12:00 PM.</p>`,
    });

    // 🕒 Schedule reminder email (10:10 AM same day)
    const reminderTime = new Date();
    reminderTime.setHours(19, 25, 0, 0);
    const currentTime = new Date();
    const timeUntilReminder = reminderTime.getTime() - currentTime.getTime();

    if (timeUntilReminder > 0) {
      setTimeout(async () => {
        try {
          await resend.emails.send({
            from: "Ring Ring CRM <onboarding@resend.dev>", // sender name updated
            to: email,
            subject: "📢 Reminder: Live Demo Today at 12:00 PM",
            html: `<p>Hi ${name},</p><p>Your live demo starts today at 12:00 PM.</p>
                   <p>Zoom Link: <a href="https://us05web.zoom.us/j/85672639183?pwd=F9yrR2bOrgOuShEWWy2AaDHU2GKlO1.1">Join Demo</a></p>`,
          });
          console.log(`Reminder email sent to ${email}`);
        } catch (error) {
          console.error("Error sending reminder email:", error);
        }
      }, timeUntilReminder);
    }

    res
      .status(201)
      .json({ success: true, message: "Demo booked successfully" });
  } catch (error) {
    console.error("Error booking demo:", error);
    res.status(500).json({ success: false, message: "Failed to book demo" });
  }
});

module.exports = router;

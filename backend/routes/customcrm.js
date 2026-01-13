const express = require("express");
const router = express.Router();
const moment = require("moment-timezone");

const CustomCRM = require("../models/customcrm");
const sendCustomCrmEmail = require("../utils/sendCustomCrmEmail");

// POST /customcrm/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, company, crmType } = req.body;

    if (!name || !email || !crmType) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Tomorrow 12:00 PM IST
    const demoDateTime = moment
      .tz("Asia/Kolkata")
      .add(1, "day")
      .set({ hour: 12, minute: 0, second: 0 })
      .toDate();

    // Temporary Zoom link (replace later)
    const zoomLink = "https://zoom.us/j/1234567890";

    const demo = await CustomCRM.create({
      name,
      email,
      phone,
      company,
      crmType,
      demoDateTime,
      zoomLink,
    });

    // Confirmation email
    await sendCustomCrmEmail({
      to: email,
      subject: "Your CRM Live Demo is Confirmed – Tomorrow 12:00 PM (IST)",
      html: `
        <h2>Hello ${name},</h2>
        <p>Your <b>${crmType} CRM live demo</b> has been scheduled.</p>
        <p><b>Date & Time:</b> Tomorrow at 12:00 PM (IST)</p>
        <p><b>Zoom Link:</b><br/>
        <a href="${zoomLink}">${zoomLink}</a></p>
        <p>We look forward to seeing you!</p>
        <br/>
        <p>– Team CRM</p>
      `,
    });

    res.json({
      message: "Demo registered successfully",
      demoId: demo._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

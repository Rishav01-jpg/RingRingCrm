const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendCustomCrmEmail = async ({ to, subject, html }) => {
  await resend.emails.send({
    from: "Ring Ring CRM <onboarding@resend.dev>", // ✅ verified
    to,
    subject,
    html,
  });
};

module.exports = sendCustomCrmEmail;

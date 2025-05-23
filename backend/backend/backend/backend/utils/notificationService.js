const nodemailer = require('nodemailer');

// Configure nodemailer for email notifications
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD    // Use the password with spaces as shown in Gmail
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Format date to IST
const formatToIST = (date) => {
    return new Date(date).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'long'
    });
};

// Send email reminder
const sendEmailReminder = async (call) => {
    try {
        // Add debug logging
        console.log('Email configuration:', {
            user: process.env.EMAIL_USER,
            hasPassword: !!process.env.EMAIL_PASSWORD
        });

        const mailOptions = {
            from: `"TeleCRM" <${process.env.EMAIL_USER}>`,
            to: call.notificationPreferences.email.address,
            subject: 'Upcoming Call Reminder - TeleCRM',
            html: `
                <h2>Upcoming Call Reminder</h2>
                <p>Dear User,</p>
                <p>This is a reminder for your upcoming call:</p>
                <ul>
                    <li><strong>Lead Name:</strong> ${call.lead?.name || 'Unknown'}</li>
                    <li><strong>Scheduled Time:</strong> ${formatToIST(call.scheduledTime)}</li>
                    <li><strong>Duration:</strong> ${call.duration} minutes</li>
                    <li><strong>Notes:</strong> ${call.notes || 'No notes added'}</li>
                </ul>
                <p>Please be prepared for the call.</p>
                <p>Best regards,<br>TeleCRM Team</p>
            `
        };

        // Verify transporter before sending
        await transporter.verify();
        console.log('Transporter verified successfully');

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        console.error('Error details:', {
            code: error.code,
            command: error.command,
            response: error.response
        });
        return false;
    }
};

// Send browser notification
const sendBrowserNotification = (call) => {
    return {
        title: 'Upcoming Call Reminder',
        message: `Call with ${call.lead.name} in ${call.notificationPreferences.reminderTime} minutes`,
        sound: call.notificationPreferences.popup.soundEnabled ? '/notification-sound.mp3' : null
    };
};

// Check if reminder should be sent
const shouldSendReminder = (call) => {
    const now = new Date();
    // Convert both dates to IST for comparison
    const istOptions = { timeZone: 'Asia/Kolkata' };
    const nowIST = new Date(now.toLocaleString('en-US', istOptions));
    const callTimeIST = new Date(call.scheduledTime);
    const minutesUntilCall = Math.floor((callTimeIST - nowIST) / (1000 * 60));
    
    return (
        !call.reminderSent &&
        minutesUntilCall <= call.notificationPreferences.reminderTime &&
        minutesUntilCall > 0
    );
};

module.exports = {
    sendEmailReminder,
    sendBrowserNotification,
    shouldSendReminder,
    formatToIST
};
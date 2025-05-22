const mongoose = require('mongoose');

const scheduledCallSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    scheduledTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        default: 30
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'missed'],
        default: 'scheduled'
    },
    notes: {
        type: String
    },
    reminder: {
        type: Boolean,
        default: true
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    notificationPreferences: {
        email: {
            enabled: { type: Boolean, default: true },
            address: { type: String }
        },
        sms: {
            enabled: { type: Boolean, default: false },
            number: { type: String }
        },
        popup: {
            enabled: { type: Boolean, default: true },
            soundEnabled: { type: Boolean, default: true }
        },
        reminderTime: { type: Number, default: 15 } // minutes before call
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ScheduledCall', scheduledCallSchema);
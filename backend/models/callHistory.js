const mongoose = require('mongoose');

const callHistorySchema = new mongoose.Schema({
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
    contact: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact'
    },
    scheduledCall: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ScheduledCall'
    },
    actualStartTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    outcome: {
        type: String,
        enum: [
            'in-progress',
            'completed',
            'successful',
            'no-answer',
            'wrong-number',
            'busy',
            'rescheduled',
            'cancelled',
            'skipped'
        ],
        required: true
    },
    notes: String,
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpDate: Date,
    deviceInfo: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CallHistory', callHistorySchema);

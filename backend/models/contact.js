const mongoose = require('mongoose');

// How a Contact should look
const contactSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',   // Which user owns this contact
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    notes: {
        type: String
    }
}, {
    timestamps: true // To track when contact created or updated
});

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;

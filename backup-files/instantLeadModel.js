const mongoose = require('mongoose');

const instantLeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  businessType: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: 'pending' }, // pending | fulfilled | rejected
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InstantLead', instantLeadSchema);



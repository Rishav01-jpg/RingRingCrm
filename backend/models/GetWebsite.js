const mongoose = require('mongoose');

const getWebsiteSchema = new mongoose.Schema({
  businessName: String,
  email: String,
  phone: String,
  description: String
}, {
  timestamps: true  // ✅ This adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('GetWebsite', getWebsiteSchema);


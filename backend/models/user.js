const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For hashing passwords

// Define how a user should look
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // no two users can have same email
    },
    password: {
        type: String,
        required: true
    },
    subscription: {
  plan: { type: String, enum: ['free','half','yearly'], default: 'free' },
  isPaid: { type: Boolean, default: false },
  expiresAt: Date,
  razorpayPaymentId: String
},

    isAdmin: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
        
    },
    resetToken: String,
resetTokenExpiration: Date

}, {
    timestamps: true // it adds createdAt and updatedAt automatically
});

// Hash password before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next(); // If password is not modified, move on
    }
    // Hash the password using bcrypt
    this.password = await bcrypt.hash(this.password, 10);
    next(); // Proceed with saving the user
});

// Method to compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model
const User = mongoose.model('User', userSchema);
module.exports = User;

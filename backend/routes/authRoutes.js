const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs'); // To protect passwords
const jwt = require('jsonwebtoken'); // To create tokens
const { check, validationResult } = require('express-validator'); // To check user inputs
const crypto = require('crypto'); // To generate reset tokens
const User = require('../models/user'); // This connects to the User model

const router = express.Router();

// Sign Up Route (For new users)
router.post('/signup', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please provide a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
], async (req, res) => {
    const errors = validationResult(req); // Check if inputs are okay
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email }); // Check if the user already exists
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ name, email, password }); // Let pre-save hook hash it
        await user.save(); // Save user in the database

        const payload = { user: { id: user.id } }; // User id inside token
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // Generate token

        res.status(201).json({ token }); // Send token to user
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// POST /request-reset-password
router.post('/request-reset-password', async (req, res) => {
    const { email } = req.body;  // User gives us their email

    try {
        const user = await User.findOne({ email }); // Check if the user is real
        if (!user) {
            return res.status(400).json({ msg: 'User does not exist' });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex'); // Create a random code
        user.resetToken = resetToken;  // Save token in the user
        user.resetTokenExpiration = Date.now() + 3600000;  // Set an expiration time for 1 hour
        await user.save();  // Save the changes to the user

        // Now we send the email with the reset link (token in the URL)
        const resetLink = `https://ring-ring-1.onrender.com/reset-password/${resetToken}`;   // local dev
 // Reset link with token

        // Send the email (we'll pretend we have a working email service here)
       // --- EMAIL SENDING TEMPORARILY DISABLED ---
// await transporter.sendMail({
//     to: email,
//     subject: 'Password Reset Request',
//     html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
// });

// Instead just print reset link
console.log('Reset Link:', resetLink);


       res.json({
  msg: 'Reset link generated',
  resetLink: resetLink
});
 // Tell them the email was sent
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });  // If something goes wrong
    }
});
// POST /reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;  // We get the token from the URL
    const { newPassword } = req.body;  // New password the user wants to set

    try {
        // Check if the token is valid (not expired)
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }  // Check if the token hasn’t expired
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid or expired reset token' });  // Token is invalid or expired
        }

        // Update the user's password
      user.password = newPassword; // ✅ let the pre('save') hook hash it  // Hash the new password
        user.resetToken = undefined;  // Remove the reset token (so they can’t use it again)
        user.resetTokenExpiration = undefined;  // Remove the expiration time

        await user.save();  // Save the new password

        res.json({ msg: 'Password has been successfully updated' });  // Tell the user it's done
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });  // If something goes wrong
    }
});

// Login Route (For existing users)
router.post('/login', [
    check('email', 'Please provide a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email }); // Find user by email
      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }
  
      const isMatch = await user.matchPassword(password); // Use the matchPassword method
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }
  
      const payload = { user: { id: user.id, role: user.role } };
  
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Send both token and user data
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  });
  

// Route to logout user
router.post('/logout', authMiddleware, (req, res) => {
    res.json({ msg: 'User logged out. Please delete the token on client side.' });
});
// Get current user's profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

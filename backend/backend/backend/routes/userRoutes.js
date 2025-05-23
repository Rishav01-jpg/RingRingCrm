const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware'); // This is the key checker
const adminMiddleware = require('../middleware/adminMiddleware');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Route to show the profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        // Find the user using their ID (from the key)
        const user = await User.findById(req.user.id).select('-password'); // We don’t show their password
        if (!user) {
            return res.status(404).json({ msg: 'User not found!' });
        }
        res.json(user); // Show the user's information
    } catch (err) {
        res.status(500).send('There was an error. Please try again.');
    }
});

// Route: POST /register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const newUser = new User({ name, email, password });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Route: POST /login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin || false
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to update user profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update fields if sent in the request
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        // If user wants to change password
        if (req.body.password) {
            const bcrypt = require('bcryptjs');
            user.password = await bcrypt.hash(req.body.password, 10);
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
        });
    } catch (err) {
        res.status(500).json({ msg: 'Something went wrong' });
    }
});
// Route: GET /api/users
router.get('/', authMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Get all users but hide passwords
        res.json(users); // Send all users to frontend
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
});
// TEMPORARY: Make first user admin (delete this route after use)
router.post('/make-me-admin', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.isAdmin = true;
        await user.save();

        res.json({ msg: 'You are now an admin!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Admin can see all users with search and filter
router.get('/all-users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            query.role = role;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find(query)
            .select('-password')
            .skip(skip)
            .limit(parseInt(limit));

        const totalUsers = await User.countDocuments(query);

        res.json({
            totalUsers,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalUsers / parseInt(limit)),
            users,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }

});


// Delete any user (admin only)
router.delete('/delete-user/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// Edit any user (admin only)
router.put('/edit-user/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Update fields
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
  
      const updatedUser = await user.save();
      res.json({
        message: "User updated successfully",
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isAdmin: updatedUser.isAdmin
        }
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
module.exports = router;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/user'); // Make sure the path is correct

const fixPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const updates = [
      {
        email: 'rishav@example.com',
        plainPassword: 'secure123'
      },
      {
        email: 'johndoe@example.com',
        plainPassword: 'password123'
      }
    ];

    for (const user of updates) {
      const hashedPassword = await bcrypt.hash(user.plainPassword, 10);
      await User.updateOne(
        { email: user.email },
        { $set: { password: hashedPassword } }
      );
      console.log(`Password updated for ${user.email}`);
    }

    mongoose.disconnect();
    console.log('Done and disconnected from DB');
  } catch (err) {
    console.error('Error:', err);
  }
};

fixPasswords();

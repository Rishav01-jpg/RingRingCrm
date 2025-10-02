require('dotenv').config();// Import necessary libraries
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
const scheduledCallRoutes = require('./routes/scheduledCallRoutes');
const callHistoryRoutes = require('./routes/callHistoryRoutes');
const instantLeadRoutes = require('./routes/instantLeadRoutes');
const websiteRequestRoutes = require('./routes/websiteRequestRoutes');
const paymentRoutes = require('./routes/paymentRoutes');


require('dotenv').config();

const app = express();
const cors = require('cors');
app.use(cors());

// ✅ Health check (works in dev and production always)
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Middleware to parse JSON bodies
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/contacts', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scheduled-calls', scheduledCallRoutes);
app.use('/api/call-history', callHistoryRoutes);
app.use('/api', instantLeadRoutes);
app.use('/api/website-request', websiteRequestRoutes);
app.use('/api/payments', paymentRoutes);





// Database connection (using the MONGO_URI from .env)
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('📂 Connected to Database:', mongoose.connection.name);
  })

  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, 'frontend', 'build')));


  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
  });  
} else {
  // Basic route for testing in development
  app.get('/', (req, res) => {
    res.send('Hello, Rishav Mishra CRM!');
  });
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


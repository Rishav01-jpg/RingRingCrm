import React, { useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';

const BookDemoForm = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/demo/book', formData);
      
      if (response.data.success) {
        setSuccess(true);
        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          phone: ''
        });
        
        // Close the dialog after 3 seconds
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book demo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, rgb(11, 61, 36) 0%, rgb(52, 130, 91) 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        Book a Live Demo
      </DialogTitle>
      <DialogContent>
        {success ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Demo booked successfully!
            </Alert>
            <Typography variant="body1">
              We've sent a confirmation email to your inbox. Your demo is scheduled for tomorrow at 12:00 PM.
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Typography variant="body2" sx={{ mb: 3 }}>
              Fill out the form below to book a personalized demo of our CRM system. Our team will guide you through all features.
            </Typography>
            
            <TextField
              fullWidth
              label="Your Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              margin="normal"
            />
          </Box>
        )}
      </DialogContent>
      
      {!success && (
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{ 
              background: 'linear-gradient(135deg, rgb(11, 61, 36) 0%, rgb(52, 130, 91) 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, rgb(9, 48, 28) 0%, rgb(42, 105, 73) 100%)'
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Book Demo'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default BookDemoForm;
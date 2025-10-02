import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetLink, setResetLink] = useState('');

 const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage('');
  setResetLink('');
  try {
    const res = await axios.post(`${config.API_URL}/api/auth/request-reset-password`, { email });

    if (res.data.resetLink) {
      setResetLink(res.data.resetLink);
      setMessage('✅ Reset link generated below:');
    } else {
      setMessage('⚠️ Something went wrong. Please try again.');
    }
  } catch (err) {
    setMessage(err.response?.data?.msg || '❌ Something went wrong.');
  }
};


  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Forgot Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" fullWidth>
            Send Reset Link
          </Button>
        </form>

        {message && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {message}
            {resetLink && (
              <>
                <br />
                <a
                  href={resetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1976d2', textDecoration: 'underline' }}
                >
                  👉 Click here to reset your password
                </a>
              </>
            )}
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default ForgotPassword;

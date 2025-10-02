import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate(); // ✅ for redirect
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${config.API_URL}/api/auth/reset-password/${token}`, {
        newPassword,
      });
      setMessage(res.data.msg || 'Password updated!');

      // ✅ Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Reset failed.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Reset Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" fullWidth>
            Reset Password
          </Button>
        </form>
        {message && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default ResetPassword;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';

function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post('http://192.168.199.49:5000/api/auth/signup', formData);
      setMessage('Signup successful! You can now log in.');
      setFormData({ name: '', email: '', password: '' });
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Card sx={{ padding: 4, borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h4" textAlign="center" fontWeight="bold" mb={3}>
            Sign Up
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />

            <Box mt={3} display="flex" justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ px: 5 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
              </Button>
            </Box>
            <Button
  component={Link}
  to="/login"
  variant="outlined"
  fullWidth
  sx={{ mt: 2 }}
>
  Already have an account? Login
</Button>

          </form>

          {message && (
            <Typography
              mt={3}
              textAlign="center"
              color={message.includes('success') ? 'green' : 'error'}
            >
              {message}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default Signup;

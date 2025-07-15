// src/pages/InstantLeads.js
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #1f4037, #99f2c8)',
  color: '#fff',
  boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
  maxWidth: 500,
  margin: 'auto',
  marginTop: theme.spacing(10),
}));

const StyledTextField = styled(TextField)({
  backgroundColor: '#ffffff',
  borderRadius: '8px',
});

function InstantLeads() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('https://ring-ring-eq46.onrender.com/api/instant-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, paymentStatus: 'PAID' }),
      });

      const data = await res.json();
      if (res.status === 201) {
        setSnackbar({ open: true, message: '✅ Lead submitted successfully!', severity: 'success' });
        setFormData({
          name: '',
          email: '',
          phone: '',
          businessType: '',
          description: '',
        });
      } else {
        setSnackbar({ open: true, message: `❌ ${data.message}`, severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: '❌ Something went wrong.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <StyledPaper elevation={6}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
          🚀 Get Instant Leads
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
  Fill the form below to get leads. Our team member will get to you soon for more details.
</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <StyledTextField
            fullWidth
            required
            id="name"
            label="Name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
          />
          <StyledTextField
            fullWidth
            required
            id="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            type="email"
          />
          <StyledTextField
            fullWidth
            required
            id="phone"
            label="Phone"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
            type="tel"
          />
          <StyledTextField
            fullWidth
            required
            id="businessType"
            label="Business Type"
            value={formData.businessType}
            onChange={handleChange}
            margin="normal"
          />
          <StyledTextField
            fullWidth
            required
            id="description"
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
            margin="normal"
          />
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            type="submit"
            size="large"
            startIcon={<PaymentIcon />}
            sx={{
              mt: 3,
              borderRadius: '10px',
              fontWeight: 'bold',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
          </Button>
        </Box>
      </StyledPaper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default InstantLeads;

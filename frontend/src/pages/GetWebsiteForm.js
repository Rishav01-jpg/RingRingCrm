// src/pages/GetWebsiteForm.js
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
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FaGlobe } from 'react-icons/fa';


const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #1f4037, #99f2c8)',
  color: '#fff',
  boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
  maxWidth: 600,
  margin: 'auto',
  marginTop: theme.spacing(6),
}));

const StyledTextField = styled(TextField)(() => ({
  backgroundColor: '#ffffff',
  borderRadius: '8px',
}));

const sampleWebsites = [
  {
    title: 'Restaurant Website',
    image: 'https://i.postimg.cc/fy2vGKxy/Screenshot-2025-07-18-144355.png',
    link: 'https://subbayyagarihotel.com/'
  },
  {
    title: 'Portfolio Website',
    image: 'https://i.postimg.cc/tCGvFX5m/Screenshot-2025-07-18-144801.png',
    link: 'https://www.balmukundsharma.com/'
  },
  {
    title: 'E-commerce Store',
    image: 'https://i.postimg.cc/TPhqbSWP/Screenshot-2025-07-18-150307.png',
    link: 'https://thelaxmikullushawl.com/'
  }
];

function GetYourWebsite() {
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
      const res = await fetch('https://ring-ring-eq46.onrender.com/api/website-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, paymentStatus: 'PAID' }),
      });

      const data = await res.json();
      if (res.ok) {
        setSnackbar({ open: true, message: '✅ Form submitted successfully!', severity: 'success' });
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
          🌐 Get Your Website
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          <strong>Your request has been received. Our team will follow up soon.</strong>    
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <StyledTextField
            fullWidth required id="name" label="Name"
            value={formData.name} onChange={handleChange} margin="normal"
          />
          <StyledTextField
            fullWidth required id="email" label="Email"
            value={formData.email} onChange={handleChange} margin="normal" type="email"
          />
          <StyledTextField
            fullWidth required id="phone" label="Phone"
            value={formData.phone} onChange={handleChange} margin="normal" type="tel"
          />
          <StyledTextField
            fullWidth required id="businessType" label="Business Type"
            value={formData.businessType} onChange={handleChange} margin="normal"
          />
          <StyledTextField
            fullWidth required id="description" label="Website Description"
            multiline rows={3} value={formData.description}
            onChange={handleChange} margin="normal"
          />
          <Button
            fullWidth variant="contained" color="secondary" type="submit" size="large"
            startIcon={<FaGlobe />} sx={{
              mt: 3, borderRadius: '10px', fontWeight: 'bold',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
            }} disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
          </Button>
        </Box>
      </StyledPaper>

      {/* Sample Websites Section */}
      <Typography variant="h4" align="center" sx={{ mt: 2, mb: 2 }}>
        🌐 Sample Website Templates
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {sampleWebsites.map((site, idx) => (
          <Grid item key={idx} xs={12} sm={6} md={4}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: '0.3s',
                '&:hover': { transform: 'scale(1.03)' },
                borderRadius: '16px',
                boxShadow: '0 6px 15px rgba(0,0,0,0.1)'
              }}
              onClick={() => window.open(site.link, '_blank')}
            >
              <CardMedia
                component="img"
                height="160"
                image={site.image}
                alt={site.title}
              />
              <CardContent>
                <Typography variant="h6" align="center">
                  {site.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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

export default GetYourWebsite;

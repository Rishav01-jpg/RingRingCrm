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
import { FaRobot } from 'react-icons/fa';
import config from '../config';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #232526, #414345)',
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

function AiTemplate() {
  const [formData, setFormData] = useState({
    prompt: '',
    image: null,
    logo: null,
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [id]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append('prompt', formData.prompt);
      form.append('image', formData.image);
      form.append('logo', formData.logo);

      const res = await fetch(`${config.API_URL}/api/ai-template`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
        setSnackbar({ open: true, message: '✅ Template generated successfully!', severity: 'success' });
        setFormData({ prompt: '', image: null, logo: null });
      } else {
        setSnackbar({ open: true, message: `❌ ${data.message || 'Failed to generate template.'}`, severity: 'error' });
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
          🤖 AI Marketing Template Generator
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          Enter a prompt, upload an image and a logo to generate a marketing template using AI.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <StyledTextField
            fullWidth required id="prompt" label="Prompt"
            value={formData.prompt} onChange={handleChange} margin="normal"
          />
          <Button
            variant="contained" component="label" fullWidth sx={{ mt: 2, mb: 1 }}
          >
            Upload Image
            <input
              id="image"
              type="file"
              accept="image/*"
              hidden
              onChange={handleChange}
            />
          </Button>
          {formData.image && <Typography variant="caption">Selected: {formData.image.name}</Typography>}
          <Button
            variant="contained" component="label" fullWidth sx={{ mt: 2, mb: 1 }}
          >
            Upload Logo
            <input
              id="logo"
              type="file"
              accept="image/*"
              hidden
              onChange={handleChange}
            />
          </Button>
          {formData.logo && <Typography variant="caption">Selected: {formData.logo.name}</Typography>}
          <Button
            fullWidth variant="contained" color="secondary" type="submit" size="large"
            startIcon={<FaRobot />} sx={{ mt: 3, borderRadius: '10px', fontWeight: 'bold', boxShadow: '0 6px 20px rgba(0,0,0,0.2)' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Template'}
          </Button>
        </Box>
      </StyledPaper>

      {result && (
        <Paper elevation={4} sx={{ mt: 4, p: 3, borderRadius: '16px', background: '#f5f5f5' }}>
          <Typography variant="h5" gutterBottom>Generated Template</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>{result.template}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardMedia
                  component="img"
                  height="160"
                  image={result.imageURL}
                  alt="Uploaded Image"
                />
                <CardContent>
                  <Typography variant="subtitle1" align="center">Image</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardMedia
                  component="img"
                  height="160"
                  image={result.logoURL}
                  alt="Uploaded Logo"
                />
                <CardContent>
                  <Typography variant="subtitle1" align="center">Logo</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

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

export default AiTemplate;
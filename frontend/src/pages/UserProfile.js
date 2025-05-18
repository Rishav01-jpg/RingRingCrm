import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Avatar,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://192.168.199.49:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error('Error fetching profile', err);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" mt={5} px={2}>
      <Card
        sx={{
          width: isMobile ? '100%' : '500px',
          padding: 4,
          boxShadow: 6,
          borderRadius: 4,
          background: '#f5f7fa'
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar sx={{ width: 100, height: 100, fontSize: 36, mb: 2, bgcolor: '#1976d2' }}>
            {profile.name.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            {profile.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {profile.email}
          </Typography>
        </Box>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <strong>Role:</strong> {profile.role}
          </Typography>
          <Typography variant="h6">
            <strong>Admin:</strong> {profile.isAdmin ? 'Yes' : 'No'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default UserProfile;

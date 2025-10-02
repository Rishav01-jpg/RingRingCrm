import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config';

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    isAdmin: false
  });
  const [websiteRequests, setWebsiteRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [errorRequests, setErrorRequests] = useState(null);
  
  const fetchWebsiteRequests = async () => {
    try {
      setLoadingRequests(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/api/website-request`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWebsiteRequests(response.data);
      setErrorRequests(null);
    } catch (err) {
      setErrorRequests('Failed to fetch website requests');
      console.error('Error fetching website requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };
  
  useEffect(() => {
    fetchUsers(setUsers, setLoading, setError);
    fetchWebsiteRequests();
  }, []);

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role || 'user',
        isAdmin: user.isAdmin || false
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        isAdmin: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (selectedUser) {
        await axios.put(
          `${config.API_URL}/api/admin/users/${selectedUser._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${config.API_URL}/api/admin/users`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      setError(`Failed to ${selectedUser ? 'update' : 'create'} user`);
      console.error('Error saving user:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${config.API_URL}/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user');
        console.error('Error deleting user:', err);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Panel
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">User Management</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog()}
                  >
                    Add New User
                  </Button>
                </Box>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Admin Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role || 'user'}</TableCell>
                            <TableCell>{user.isAdmin ? 'Admin' : 'User'}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                onClick={() => handleOpenDialog(user)}
                                sx={{ mr: 1 }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Website Requests</Typography>
                {errorRequests && (
                  <Alert severity="error" sx={{ mb: 2 }}>{errorRequests}</Alert>
                )}
                {loadingRequests ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Business Type</TableCell>
                          <TableCell>Business Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Created At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {websiteRequests.map((req) => (
                          <TableRow key={req._id}>
                            <TableCell>{req.name}</TableCell>
                            <TableCell>{req.businessType}</TableCell>
                            <TableCell>{req.businessName}</TableCell>
                            <TableCell>{req.email}</TableCell>
                            <TableCell>{req.phone}</TableCell>
                            <TableCell>{req.description}</TableCell>
                            <TableCell>{new Date(req.createdAt).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                required
              />
              {!selectedUser && (
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  margin="normal"
                  required
                />
              )}
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Admin Status</InputLabel>
                <Select
                  value={formData.isAdmin}
                  label="Admin Status"
                  onChange={(e) => setFormData({ ...formData, isAdmin: e.target.value })}
                >
                  <MenuItem value={false}>Regular User</MenuItem>
                  <MenuItem value={true}>Admin</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Admin;

const fetchUsers = async (setUsers, setLoading, setError) => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    const response = await axios.get(`${config.API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(response.data);
    setError(null);
  } catch (err) {
    setError('Failed to fetch users');
    console.error('Error fetching users:', err);
  } finally {
    setLoading(false);
  }
};
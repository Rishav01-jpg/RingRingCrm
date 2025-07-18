import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Stack,
  FormHelperText,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Notifications as NotificationsIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config';

// Helper function to format date for datetime-local input
const formatDateForInput = (date) => {
  try {
    const d = date ? new Date(date) : new Date();
    if (isNaN(d.getTime())) {
      // If date is invalid, return current date/time
      return new Date().toISOString().slice(0, 16);
    }
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date().toISOString().slice(0, 16);
  }
};

// Helper function to format date for display
const formatDateTime = (date) => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return 'Invalid Date';
    }
    return d.toLocaleString();
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return 'Invalid Date';
  }
};

const ScheduledCalls = () => {
  const { user } = useAuth();
  const [scheduledCalls, setScheduledCalls] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    leadId: '',
    scheduledTime: new Date(),
    duration: 30,
    notes: '',
    status: 'scheduled',
    reminder: true,
    notificationPreferences: {
      email: {
        enabled: true,
        address: ''
      },
      sms: {
        enabled: false,
        number: ''
      },
      popup: {
        enabled: true,
        soundEnabled: true
      },
      reminderTime: 15
    }
  });

  const statusOptions = ['scheduled', 'completed', 'cancelled', 'missed'];

  // Add state for lead search
  const [searchInputValue, setSearchInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);

  // Add state for contacts
  const [contacts, setContacts] = useState([]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Get all leads in one request with a high limit
      const response = await axios.get(`${config.API_URL}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          limit: 100, // High limit to get all leads
          search: searchInputValue // Add search term if present
        }
      });

      const allLeads = response.data.leads || [];

      // Format leads
      const formattedLeads = allLeads
        .filter(lead => lead && lead._id && lead.name)
        .map(lead => ({
          _id: lead._id,
          name: lead.name,
          phone: lead.phone || '',
          email: lead.email || '',
          type: 'lead'
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log('Total leads fetched:', formattedLeads.length);
      setLeads(formattedLeads);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/api/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const contactsData = Array.isArray(response.data) ? response.data : [];
      const formattedContacts = contactsData
        .filter(contact => contact && contact._id && contact.name)
        .map(contact => ({
          _id: contact._id,
          name: contact.name,
          phone: contact.phone || '',
          email: contact.email || '',
          type: 'contact'
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log('Total contacts fetched:', formattedContacts.length);
      setContacts(formattedContacts);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setContacts([]);
    }
  };

  const fetchScheduledCalls = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = {};
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (dateFilter.startDate && dateFilter.endDate) {
        params.startDate = dateFilter.startDate;
        params.endDate = dateFilter.endDate;
      }

      const response = await axios.get(`${config.API_URL}/api/scheduled-calls`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      // Ensure each call has the required data
      const validatedCalls = response.data.map(call => ({
        _id: call._id,
        scheduledTime: call.scheduledTime,
        duration: call.duration || 30,
        status: call.status || 'scheduled',
        notes: call.notes || '',
        reminder: call.reminder ?? true,
        lead: {
          _id: call.lead?._id || '',
          name: call.lead?.name || 'N/A',
          phone: call.lead?.phone || '',
          email: call.lead?.email || '',
          status: call.lead?.status || 'unknown'
        }
      }));

      setScheduledCalls(validatedCalls);
      setError(null);
    } catch (err) {
      console.error('Error fetching scheduled calls:', err);
      setError('Failed to fetch scheduled calls');
      setScheduledCalls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchContacts();
    fetchScheduledCalls();
  }, [statusFilter, dateFilter]);

  // Add useEffect for search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchInputValue) {
        fetchLeads();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInputValue]);

  const handleOpenDialog = (call = null) => {
    if (call) {
      setSelectedCall(call);
      setFormData({
        leadId: call.lead?._id || '',
        scheduledTime: call.scheduledTime ? new Date(call.scheduledTime) : new Date(),
        duration: call.duration || 30,
        notes: call.notes || '',
        status: call.status || 'scheduled',
        reminder: call.reminder ?? true,
        notificationPreferences: {
          email: {
            enabled: call.notificationPreferences?.email?.enabled ?? true,
            address: call.notificationPreferences?.email?.address || user?.email || ''
          },
          sms: {
            enabled: call.notificationPreferences?.sms?.enabled ?? false,
            number: call.notificationPreferences?.sms?.number || ''
          },
          popup: {
            enabled: call.notificationPreferences?.popup?.enabled ?? true,
            soundEnabled: call.notificationPreferences?.popup?.soundEnabled ?? true
          },
          reminderTime: call.notificationPreferences?.reminderTime ?? 15
        }
      });
    } else {
      setSelectedCall(null);
      setFormData({
        leadId: '',
        scheduledTime: new Date(),
        duration: 30,
        notes: '',
        status: 'scheduled',
        reminder: true,
        notificationPreferences: {
          email: {
            enabled: true,
            address: user?.email || ''
          },
          sms: {
            enabled: false,
            number: ''
          },
          popup: {
            enabled: true,
            soundEnabled: true
          },
          reminderTime: 15
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCall(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        scheduledTime: new Date(formData.scheduledTime).toISOString()
      };

      if (selectedCall) {
        await axios.put(
          `${config.API_URL}/api/scheduled-calls/${selectedCall._id}`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({ open: true, message: 'Call updated successfully', severity: 'success' });
      } else {
        await axios.post(
          `${config.API_URL}/api/scheduled-calls`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({ open: true, message: 'Call scheduled successfully', severity: 'success' });
      }
      handleCloseDialog();
      fetchScheduledCalls();
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: `Failed to ${selectedCall ? 'update' : 'schedule'} call: ${err.message}`, 
        severity: 'error' 
      });
      console.error('Error saving scheduled call:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this scheduled call?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${config.API_URL}/api/scheduled-calls/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSnackbar({ open: true, message: 'Scheduled call deleted successfully', severity: 'success' });
        fetchScheduledCalls();
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to delete scheduled call', severity: 'error' });
        console.error('Error deleting scheduled call:', err);
      }
    }
  };

  const handleCall = (call) => {
    if (!call.lead?.phone) {
      setSnackbar({
        open: true,
        message: 'No phone number available for this lead',
        severity: 'warning'
      });
      return;
    }

    // Clean the phone number - remove all non-digit characters except +
    const cleanNumber = call.lead.phone.replace(/[^\d+]/g, '');
    
    if (!cleanNumber) {
      setSnackbar({
        open: true,
        message: 'Invalid phone number format',
        severity: 'error'
      });
      return;
    }

    // Check if on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = `tel:${cleanNumber}`;
    } else {
      setSnackbar({
        open: true,
        message: `Phone number: ${cleanNumber} (Calling is only available on mobile devices)`,
        severity: 'info'
      });
    }
  };

  // Function to get combined and formatted options
  const getFormattedOptions = () => {
    const validLeads = leads.filter(lead => lead && lead._id && lead.name);
    const validContacts = contacts.filter(contact => contact && contact._id && contact.name);
    let options = [...validLeads, ...validContacts];
    if (searchInputValue) {
      const searchTerm = searchInputValue.toLowerCase();
      options = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm) ||
        option.email?.toLowerCase().includes(searchTerm) ||
        option.phone?.includes(searchTerm)
      );
      // Sort so exact matches or startsWith appear first
      options.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        if (aName === searchTerm && bName !== searchTerm) return -1;
        if (bName === searchTerm && aName !== searchTerm) return 1;
        if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
        if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
        return aName.localeCompare(bName);
      });
    } else {
      options.sort((a, b) => a.name.localeCompare(b.name));
    }
    return options;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Scheduled Calls
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Schedule New Call
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} mb={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Start Date"
              type="datetime-local"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="datetime-local"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              label="Status Filter"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {statusOptions.map(status => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Lead</TableCell>
                  <TableCell>Scheduled Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scheduledCalls.length > 0 ? (
                  scheduledCalls.map((call) => {
                    const leadName = call?.lead?.name || 'Unknown Lead';
                    const leadPhone = call?.lead?.phone || 'N/A';
                    const leadEmail = call?.lead?.email || '';                    
                    
                    return (
                      <TableRow key={call._id}>
                        <TableCell>
                          <Box display="flex" flexDirection="column">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography>{leadName}</Typography>
                              {leadPhone && (
  <Tooltip title="Call Lead">
    <IconButton
      color="primary"
      onClick={() => handleCall(call)}
      size="small"
      aria-label="call lead"
    >
      <PhoneIcon />
    </IconButton>
  </Tooltip>
)}

                            </Box>
                            {leadEmail && (
                              <Typography variant="caption" color="textSecondary">
                                {leadEmail}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{formatDateTime(call.scheduledTime)}</TableCell>
                        <TableCell>{call.duration || 0} minutes</TableCell>
                        <TableCell>
                          <Typography
                            component="span"
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              backgroundColor: (() => {
                                switch (call.status) {
                                  case 'scheduled': return '#e3f2fd';
                                  case 'completed': return '#c8e6c9';
                                  case 'cancelled': return '#ffcdd2';
                                  case 'missed': return '#fff3e0';
                                  default: return '#e0e0e0';
                                }
                              })(),
                            }}
                          >
                            {(call.status?.charAt(0).toUpperCase() + call.status?.slice(1)) || 'Unknown'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {call.notes || ''}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenDialog(call)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(call._id)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" color="textSecondary">
                        No scheduled calls found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Call Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCall ? 'Edit Scheduled Call' : 'Schedule New Call'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Autocomplete
                  options={getFormattedOptions()}
                  getOptionLabel={(option) => option.name || ''}
                  groupBy={(option) => option.type === 'lead' ? 'Leads' : 'Contacts'}
                  loading={loading}
                  onInputChange={(event, newValue) => {
                    setSearchInputValue(newValue);
                  }}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      leadId: newValue?._id || ''
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Lead"
                      required
                      error={!formData.leadId}
                      helperText={!formData.leadId ? 'Please select a lead' : ''}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {option.name}
                          <span style={{ 
                            marginLeft: '8px',
                            color: option.type === 'lead' ? '#1976d2' : '#9c27b0',
                            fontSize: '0.85em'
                          }}>
                            ({option.type})
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'gray' }}>
                          {option.phone && `📞 ${option.phone}`}
                          {option.email && ` ✉️ ${option.email}`}
                        </div>
                      </div>
                    </Box>
                  )}
                  filterOptions={(options, { inputValue }) => {
                    // Custom filter function that uses both client-side and server-side filtering
                    if (!inputValue) return options;
                    
                    return options.filter(option => 
                      option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                      option.email?.toLowerCase().includes(inputValue.toLowerCase()) ||
                      option.phone?.includes(inputValue)
                    );
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Scheduled Time"
                  type="datetime-local"
                  value={formatDateForInput(formData.scheduledTime)}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : new Date();
                    setFormData(prev => ({
                      ...prev,
                      scheduledTime: isNaN(newDate.getTime()) ? new Date() : newDate
                    }));
                  }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  error={!formData.scheduledTime || isNaN(new Date(formData.scheduledTime).getTime())}
                  helperText={!formData.scheduledTime || isNaN(new Date(formData.scheduledTime).getTime()) ? 'Please select a valid date and time' : ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Duration (minutes)"
                  type="number"
                  fullWidth
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {statusOptions.map(status => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={!formData.leadId || !formData.scheduledTime}
            >
              {selectedCall ? 'Update' : 'Schedule'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ScheduledCalls;

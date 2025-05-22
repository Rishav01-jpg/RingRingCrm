import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import config from '../config';
// Add this at the top with other imports
import useMediaQuery from '@mui/material/useMediaQuery';
import { IconButton } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';

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

const CallHistory = () => {
  // Add isMobile check back
  const isMobile = useMediaQuery('(max-width:600px)');
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    outcome: '',
    leadName: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const outcomeOptions = [
    'completed',
    'successful',
    'no-answer',
    'wrong-number',
    'busy',
    'rescheduled',
    'cancelled',
    'skipped'
  ];

  const fetchCallHistory = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/api/call-history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });

      setCalls(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching call history:', err);
      setError('Failed to fetch call history');
      setSnackbar({
        open: true,
        message: 'Failed to fetch call history',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [filters]); // Add filters as dependency

  useEffect(() => {
    fetchCallHistory();
  }, [fetchCallHistory]);

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

 const handleCall = async (leadId, leadName) => {
  // Only proceed if on mobile device
  if (!isMobile) {
    setSnackbar({
      open: true,
      message: 'Calling is only available on mobile devices',
      severity: 'info'
    });
    return;
  }

  console.log("🔍 Starting handleCall for", leadName, leadId);
  let currentCall = null;
  try {
    if (!leadId) {
      throw new Error('Lead ID is not available');
    }

    currentCall = calls.find(call => call.lead?._id === leadId);
    if (!currentCall || !currentCall.lead || !currentCall.lead.phone) {
      throw new Error('No phone number available for this lead');
    }

    const phoneNumber = currentCall.lead.phone;
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    
    window.location.href = `tel:${formattedPhone}`;

    console.log("📱 Attempting to call:", formattedPhone);

    setSnackbar({
      open: true,
      message: `Initiating call to ${leadName}...`,
      severity: 'success'
    });

  } catch (err) {
    console.error('❌ Error initiating call:', err);
    setSnackbar({
      open: true,
      message: `Failed to call ${leadName}. Please dial ${currentCall?.lead?.phone || 'unknown'} manually`,
      severity: 'error'
    });
  }
};

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Call History
        </Typography>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={filters.startDate}
                onChange={handleFilterChange('startDate')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={filters.endDate}
                onChange={handleFilterChange('endDate')}
              />
            </Grid>
            <Grid item xs={12} sm={8} md={4}>
              <FormControl fullWidth>
                <InputLabel>Outcome</InputLabel>
                <Select
                  value={filters.outcome}
                  label="Outcome"
                  onChange={handleFilterChange('outcome')}
                  sx={{ 
                    minHeight: '56px',
                    minWidth: '250px',
                    '& .MuiSelect-select': {
                      padding: '12px 16px'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        width: 'auto',
                        minWidth: '250px'
                      }
                    }
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {outcomeOptions.map(option => (
                    <MenuItem 
                      key={option} 
                      value={option}
                      sx={{ padding: '12px 16px' }}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Lead Name"
                value={filters.leadName}
                onChange={handleFilterChange('leadName')}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Call History Table */}
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Lead Name</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Duration (min)</TableCell>
                  <TableCell>Outcome</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Follow-up Required</TableCell>
                  <TableCell>Follow-up Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calls.map((call) => (
                  <TableRow key={call._id}>
                    {/* Lead name cell with call button */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {call.lead?.name || 'N/A'}
                        {call.lead?.name && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleCall(call.lead?._id, call.lead?.name)}
                            disabled={!isMobile}
                            sx={{ 
                              ml: 1,
                              '&.Mui-disabled': {
                                color: 'rgba(0, 0, 0, 0.26)'
                              }
                            }}
                          >
                            <PhoneIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDateTime(call.actualStartTime)}</TableCell>
                    <TableCell>{call.duration}</TableCell>
                    <TableCell>
                      {call.outcome.charAt(0).toUpperCase() + call.outcome.slice(1)}
                    </TableCell>
                    <TableCell>{call.notes || '-'}</TableCell>
                    <TableCell>{call.followUpRequired ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      {call.followUpDate ? formatDateTime(call.followUpDate) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {calls.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No call history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

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
      </Box>
    </Container>
  );
};

export default CallHistory;


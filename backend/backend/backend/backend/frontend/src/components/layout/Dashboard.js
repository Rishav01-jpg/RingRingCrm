import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  Tooltip
} from '@mui/material';
import {
  People as PeopleIcon,
  ContactPhone as ContactPhoneIcon,
  Assessment as AssessmentIcon,
  Phone as PhoneIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import config from '../../config';

// Add this near the top of the file, after imports
const DEBOUNCE_DELAY = 1000; // 1 second delay

// Add debounce utility at the top after imports
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Statistic Card Component
const StatCard = ({ title, value, icon, color, onClick, isLoading, isMobile }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading && onClick) {
      onClick();
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 3,
          transition: 'all 0.2s'
        } : {},
        position: 'relative'
      }}
      onClick={handleClick}
    >
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              color="textSecondary" 
              gutterBottom
            >
              {title}
            </Typography>
            <Typography variant={isMobile ? "h5" : "h4"}>
              {isLoading ? (
                <Box display="flex" alignItems="center">
                  <CircularProgress size={isMobile ? 20 : 24} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Refreshing...
                  </Typography>
                </Box>
              ) : value}
            </Typography>
          </Box>
          <IconButton 
            sx={{ 
              backgroundColor: color, 
              color: 'white',
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
              '&:hover': { backgroundColor: color },
              opacity: isLoading ? 0.7 : 1,
              pointerEvents: 'none'
            }}
          >
            {icon}
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    leads: { total: 0, loading: false },
    contacts: { total: 0, loading: false },
    calls: { total: 0, loading: false },
    scheduled: { total: 0, loading: false, upcoming: [] },
    conversionRate: 0
  });

  // Prevent multiple simultaneous refreshes
  const isRefreshing = useRef(false);
  const mountedRef = useRef(true);

  const setError3Seconds = React.useCallback((errorMessage) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 3000);
  }, []);

  const handleAuthError = React.useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  // Create stable refresh functions
  const debouncedRefresh = React.useCallback(
    debounce(async (type) => {
      if (!mountedRef.current || isRefreshing.current) return;
      
      const token = localStorage.getItem('token');
      if (!token) {
        handleAuthError();
        return;
      }

      const baseURL = config.API_URL;
      const headers = { Authorization: `Bearer ${token}` };
      let response;

      try {
        isRefreshing.current = true;
        if (!mountedRef.current) return;
        
        setData(prev => ({
          ...prev,
          [type]: { ...prev[type], loading: true }
        }));

        switch(type) {
          // Inside the debouncedRefresh function, in the 'leads' case:
          case 'leads': {
            try {
              response = await axios.get(`${baseURL}/api/leads`, { 
                headers,
                params: { page: 1, limit: 100 } // Get all leads
              });
              
              if (!response.data || !mountedRef.current) return;
              
              console.log('Leads response:', response.data);
              let leads = [];
              
              // Handle different response structures
              if (Array.isArray(response.data)) {
                leads = response.data;
              } else if (response.data.leads) {
                leads = response.data.leads;
              } else if (response.data.data) {
                leads = response.data.data;
              }
              
              // Make sure leads is always an array
              if (!Array.isArray(leads)) {
                console.error('Leads data is not in expected format:', response.data);
                leads = [];
              }
              
              const totalLeads = leads.length;
              // Make sure we're checking for the correct status value
              const convertedLeads = leads.filter(lead => 
                lead.status && lead.status.toLowerCase() === 'converted'
              ).length;
              
              // Calculate conversion rate with proper error handling
              let rate = '0.0';
              if (totalLeads > 0) {
                rate = ((convertedLeads / totalLeads) * 100).toFixed(1);
              }
              
              console.log(`Conversion rate calculation: ${convertedLeads} converted out of ${totalLeads} total = ${rate}%`);
              
              setData(prev => ({
                ...prev,
                leads: { total: totalLeads, loading: false },
                conversionRate: rate
              }));
            } catch (error) {
              console.error('Error fetching leads data:', error);
              setData(prev => ({
                ...prev,
                leads: { total: 0, loading: false },
                conversionRate: '0.0'
              }));
            }
            break;
          }
          
          case 'contacts': {
            response = await axios.get(`${baseURL}/api/contacts`, { 
              headers,
              params: { page: 1, limit: 100 } // Get all contacts
            });
            if (!response.data || !mountedRef.current) return;

            console.log('Contacts response:', response.data);
            let contacts;
            if (Array.isArray(response.data)) {
              contacts = response.data;
            } else if (response.data.contacts) {
              contacts = response.data.contacts;
            } else if (response.data.data) {
              contacts = response.data.data;
            } else {
              contacts = [];
            }
            
            setData(prev => ({
              ...prev,
              contacts: { total: contacts.length, loading: false }
            }));
            break;
          }
          
          case 'calls': {
            response = await axios.get(`${baseURL}/api/call-history`, { 
              headers,
              params: { page: 1, limit: 100 } // Get all calls
            });
            if (!response.data || !mountedRef.current) return;

            console.log('Calls response:', response.data);
            let calls;
            if (Array.isArray(response.data)) {
              calls = response.data;
            } else if (response.data.calls) {
              calls = response.data.calls;
            } else if (response.data.data) {
              calls = response.data.data;
            } else {
              calls = [];
            }
            
            setData(prev => ({
              ...prev,
              calls: { total: calls.length, loading: false }
            }));
            break;
          }
          
          case 'scheduled': {
            response = await axios.get(`${baseURL}/api/scheduled-calls`, { 
              headers,
              params: { page: 1, limit: 100 } // Get all scheduled calls
            });
            if (!response.data || !mountedRef.current) return;

            console.log('Scheduled calls response:', response.data);
            let scheduled;
            if (Array.isArray(response.data)) {
              scheduled = response.data;
            } else if (response.data.scheduledCalls) {
              scheduled = response.data.scheduledCalls;
            } else if (response.data.data) {
              scheduled = response.data.data;
            } else {
              scheduled = [];
            }

            // Process scheduled calls to ensure leadName exists
            const processedScheduled = scheduled.map(call => {
              // Check for different possible property names for the lead name
              const leadName = call.leadName || call.contactName || call.name || call.lead?.name || call.contact?.name || 'Unknown';
              // Extract phone number from various possible properties
              const phoneNumber = call.phoneNumber || call.phone || call.lead?.phoneNumber || call.lead?.phone || 
                              call.contact?.phoneNumber || call.contact?.phone || '';
              return {
                ...call,
                leadName,
                phoneNumber
              };
            });

            const upcomingCalls = processedScheduled
              .filter(call => new Date(call.scheduledTime) > new Date())
              .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
              .slice(0, 5);
            
            setData(prev => ({
              ...prev,
              scheduled: { 
                total: scheduled.length, 
                loading: false,
                upcoming: upcomingCalls
              }
            }));
            break;
          }
        }
      } catch (err) {
        console.error(`Error refreshing ${type}:`, err);
        if (err.response?.status === 401) {
          handleAuthError();
          return;
        }
        setError3Seconds(`Failed to refresh ${type}`);
      } finally {
        isRefreshing.current = false;
        if (mountedRef.current) {
          setData(prev => ({
            ...prev,
            [type]: { ...prev[type], loading: false }
          }));
        }
      }
    }, 1000),
    [handleAuthError, setError3Seconds]
  );

  // Update the initial data load
  useEffect(() => {
    mountedRef.current = true;
    
    const loadInitialData = async () => {
      if (!mountedRef.current) return;
      
      const token = localStorage.getItem('token');
      if (!token) {
        handleAuthError();
        return;
      }

      try {
        setLoading(true);
        const baseURL = config.API_URL;
        const headers = { Authorization: `Bearer ${token}` };
        const params = { page: 1, limit: 100 }; // Get all records

        // Fetch all data in parallel
        const [leadsRes, contactsRes, callsRes, scheduledRes] = await Promise.all([
          axios.get(`${baseURL}/api/leads`, { headers, params }),
          axios.get(`${baseURL}/api/contacts`, { headers, params }),
          axios.get(`${baseURL}/api/call-history`, { headers, params }),
          axios.get(`${baseURL}/api/scheduled-calls`, { headers, params })
        ]);

        if (mountedRef.current) {
          console.log('Initial load responses:', {
            leads: leadsRes.data,
            contacts: contactsRes.data,
            calls: callsRes.data,
            scheduled: scheduledRes.data
          });

          // Process leads
          let leads;
          if (Array.isArray(leadsRes.data)) {
            leads = leadsRes.data;
          } else if (leadsRes.data.leads) {
            leads = leadsRes.data.leads;
          } else if (leadsRes.data.data) {
            leads = leadsRes.data.data;
          } else {
            leads = [];
          }

          const totalLeads = leads.length;
          const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
          const rate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

          // Process contacts
          let contacts;
          if (Array.isArray(contactsRes.data)) {
            contacts = contactsRes.data;
          } else if (contactsRes.data.contacts) {
            contacts = contactsRes.data.contacts;
          } else if (contactsRes.data.data) {
            contacts = contactsRes.data.data;
          } else {
            contacts = [];
          }

          // Process calls
          let calls;
          if (Array.isArray(callsRes.data)) {
            calls = callsRes.data;
          } else if (callsRes.data.calls) {
            calls = callsRes.data.calls;
          } else if (callsRes.data.data) {
            calls = callsRes.data.data;
          } else {
            calls = [];
          }

          // Process scheduled calls
          let scheduled;
          if (Array.isArray(scheduledRes.data)) {
            scheduled = scheduledRes.data;
          } else if (scheduledRes.data.scheduledCalls) {
            scheduled = scheduledRes.data.scheduledCalls;
          } else if (scheduledRes.data.data) {
            scheduled = scheduledRes.data.data;
          } else {
            scheduled = [];
          }

          // Add console log to debug scheduled calls structure
          if (scheduled.length > 0) {
            console.log('Scheduled call data structure:', JSON.stringify(scheduled[0], null, 2));
          }

          // Map the scheduled calls to ensure they have the required properties
          const processedScheduled = scheduled.map(call => {
            // Check for different possible property names for the lead name
            const leadName = call.leadName || call.contactName || call.name || call.lead?.name || call.contact?.name || 'Unknown';
            // Extract phone number from various possible properties
            const phoneNumber = call.phoneNumber || call.phone || call.lead?.phoneNumber || call.lead?.phone || 
                            call.contact?.phoneNumber || call.contact?.phone || '';
            return {
              ...call,
              leadName,
              phoneNumber
            };
          });

          const upcomingCalls = processedScheduled
            .filter(call => new Date(call.scheduledTime) > new Date())
            .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
            .slice(0, 5);

          setData({
            leads: { total: totalLeads, loading: false },
            contacts: { total: contacts.length, loading: false },
            calls: { total: calls.length, loading: false },
            scheduled: { 
              total: scheduled.length,
              loading: false,
              upcoming: upcomingCalls
            },
            conversionRate: rate
          });
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        if (err.response?.status === 401) {
          handleAuthError();
          return;
        }
        setError3Seconds('Failed to load dashboard data');
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      mountedRef.current = false;
    };
  }, [handleAuthError]);

  // Simplified click handlers using the debounced refresh
  const refreshLeads = () => debouncedRefresh('leads');
  const refreshContacts = () => debouncedRefresh('contacts');
  const refreshCalls = () => debouncedRefresh('calls');
  const refreshScheduled = () => debouncedRefresh('scheduled');

  // Add function to handle calls
  const handleCall = async (call) => {
    if (!isMobileDevice()) {
      setError3Seconds('Calling is only available on mobile devices');
      return;
    }

    try {
      // Check if phone number exists
      if (!call.phoneNumber) {
        setError3Seconds('No phone number available for this contact');
        return;
      }
      
      const cleanNumber = call.phoneNumber.replace(/[^\d+]/g, '');
      window.location.href = `tel:${cleanNumber}`;
    } catch (error) {
      console.error('Error making call:', error);
      setError3Seconds('Failed to initiate call');
    }
  };

  // Add isMobileDevice function
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: isMobile ? 2 : 4, mb: isMobile ? 2 : 4 }}>
      {error && (
        <Paper 
          sx={{ 
            p: 2, 
            mb: 2, 
            backgroundColor: theme.palette.error.light,
            color: theme.palette.error.contrastText
          }}
        >
          <Typography>{error}</Typography>
        </Paper>
      )}

      <Grid container spacing={isMobile ? 2 : 3}>
        {/* Stats Grid */}
        <Grid item xs={12}>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Leads"
                value={data.leads.total}
                icon={<PeopleIcon />}
                color={theme.palette.primary.main}
                onClick={() => navigate('/leads')}
                isLoading={data.leads.loading}
                isMobile={isMobile}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Contacts"
                value={data.contacts.total}
                icon={<ContactPhoneIcon />}
                color={theme.palette.secondary.main}
                onClick={() => navigate('/contacts')}
                isLoading={data.contacts.loading}
                isMobile={isMobile}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Calls"
                value={data.calls.total}
                icon={<PhoneIcon />}
                color={theme.palette.success.main}
                onClick={() => navigate('/call-history')}
                isLoading={data.calls.loading}
                isMobile={isMobile}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Conversion Rate"
                value={`${data.conversionRate}%`}
                icon={<TrendingUpIcon />}
                color={theme.palette.info.main}
                isLoading={data.leads.loading}
                isMobile={isMobile}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Upcoming Calls Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: isMobile ? 2 : 3, mt: isMobile ? 2 : 3 }}>
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
              Upcoming Calls
            </Typography>
            <Box sx={{ mt: 2 }}>
              {data.scheduled.upcoming && data.scheduled.upcoming.length > 0 ? (
                data.scheduled.upcoming.map((call, index) => (
                  <Box key={call._id || index}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: isMobile ? 1 : 2
                      }}
                    >
                      <Box>
                        <Typography variant={isMobile ? "body1" : "h6"}>
                          {call.leadName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(call.scheduledTime).toLocaleString()}
                        </Typography>
                        {call.phoneNumber && (
                          <Typography variant="body2" color="primary">
                            {call.phoneNumber}
                          </Typography>
                        )}
                      </Box>
                      <Tooltip title={isMobileDevice() ? "Call Now" : "Calling only available on mobile devices"}>
                        <span>
                          <IconButton
                            color="primary"
                            onClick={() => handleCall(call)}
                            disabled={!isMobileDevice()}
                          >
                            <PhoneIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                    {index < data.scheduled.upcoming.length - 1 && <Divider />}
                  </Box>
                ))
              ) : (
                <Typography variant="body1" color="textSecondary">
                  No upcoming calls scheduled
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
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
  Pagination,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Stack,
  Divider,
  Input,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  CallEnd as CallEndIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  SkipNext as SkipNextIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  DeleteSweep as DeleteSweepIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config';

const CallNotesDialog = ({ open, onClose, onSave, loading, initialData = {} }) => {
  const [formData, setFormData] = useState({
    outcome: '',
    notes: ''
  });

  useEffect(() => {
    if (open) {
      setFormData({
        outcome: initialData.outcome || '',
        notes: initialData.notes || ''
      });
    }
  }, [open, initialData.outcome, initialData.notes]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: { minWidth: '300px' }
      }}
    >
      <DialogTitle>Call Notes</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>Call Outcome</InputLabel>
          <Select
            value={formData.outcome}
            onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
            label="Call Outcome"
            disabled={loading}
          >
            <MenuItem value="successful">Successful</MenuItem>
            <MenuItem value="no-answer">No Answer</MenuItem>
            <MenuItem value="wrong-number">Wrong Number</MenuItem>
            <MenuItem value="busy">Busy</MenuItem>
            <MenuItem value="rescheduled">Rescheduled</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          multiline
          rows={4}
          margin="normal"
          label="Notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained"
          disabled={loading || !formData.outcome}
        >
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Leads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Bulk delete state
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  // Auto-calling state
  const [isAutoCalling, setIsAutoCalling] = useState(false);
  const [currentCallIndex, setCurrentCallIndex] = useState(0);
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState(null);
  const [callStatus, setCallStatus] = useState('');
  const [currentCall, setCurrentCall] = useState(null);
  const [savingNotes, setSavingNotes] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'new',
    notes: ''
  });

  const [callFormData, setCallFormData] = useState({
    outcome: '',
    notes: '',
    status:''
  });

  const statusOptions = ['new', 'contacted', 'qualified', 'lost', 'converted', 'in-progress'];

  // Add new state variables for CSV import
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreviewData, setCsvPreviewData] = useState(null);
  const [importing, setImporting] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: searchTerm,
          status: statusFilter,
          page,
          limit: 16
        }
      });

      setLeads(response.data.leads);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch leads');
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, searchTerm, statusFilter]);

  const handleOpenDialog = (lead = null) => {
    if (lead) {
      setSelectedLead(lead);
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        notes: lead.notes
      });
    } else {
      setSelectedLead(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        status: 'new',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLead(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (selectedLead) {
        await axios.put(
          `${config.API_URL}/api/leads/${selectedLead._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({ open: true, message: 'Lead updated successfully', severity: 'success' });
      } else {
        await axios.post(
          `${config.API_URL}/api/leads`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({ open: true, message: 'Lead created successfully', severity: 'success' });
      }
      handleCloseDialog();
      fetchLeads();
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: `Failed to ${selectedLead ? 'update' : 'create'} lead`, 
        severity: 'error' 
      });
      console.error('Error saving lead:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${config.API_URL}/api/leads/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSnackbar({ open: true, message: 'Lead deleted successfully', severity: 'success' });
        fetchLeads();
        // Clear selection if the deleted lead was selected
        setSelectedLeads(prev => prev.filter(leadId => leadId !== id));
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to delete lead', severity: 'error' });
        console.error('Error deleting lead:', err);
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) {
      setSnackbar({ open: true, message: 'No leads selected for deletion', severity: 'warning' });
      return;
    }

    setBulkDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${config.API_URL}/api/leads/bulk/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { leadIds: selectedLeads }
      });

      setSnackbar({ 
        open: true, 
        message: `Successfully deleted ${response.data.count} leads`, 
        severity: 'success' 
      });
      
      // Clear selections and refresh leads
      setSelectedLeads([]);
      fetchLeads();
      setBulkDeleteConfirmOpen(false);
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to delete leads: ' + (err.response?.data?.msg || err.message), 
        severity: 'error' 
      });
      console.error('Error bulk deleting leads:', err);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // Handle lead selection
  const handleSelectLead = (leadId) => {
    setSelectedLeads(prev => {
      if (prev.includes(leadId)) {
        return prev.filter(id => id !== leadId);
      } else {
        return [...prev, leadId];
      }
    });
  };

  // Handle select all leads
  const handleSelectAllLeads = (event) => {
    if (event.target.checked) {
      const allLeadIds = leads.map(lead => lead._id);
      setSelectedLeads(allLeadIds);
    } else {
      setSelectedLeads([]);
    }
  };

  // Auto-calling functions
  const startAutoCalling = async () => {
    if (!isMobileDevice()) {
      setSnackbar({ 
        open: true, 
        message: 'Auto-calling is only available on mobile devices', 
        severity: 'warning' 
      });
      return;
    }

    if (leads.length === 0) {
      setSnackbar({ 
        open: true, 
        message: 'No leads available to call', 
        severity: 'warning' 
      });
      return;
    }

    // Filter leads that haven't been called or need follow-up
    const availableLeads = leads.filter(lead => 
      !lead.lastCallOutcome || 
      ['no-answer', 'busy', 'skipped'].includes(lead.lastCallOutcome)
    );

    if (availableLeads.length === 0) {
      setSnackbar({
        open: true,
        message: 'No leads available for calling - all leads have been contacted',
        severity: 'info'
      });
      return;
    }

    setIsAutoCalling(true);
    setCurrentCallIndex(0);
    setCallDialogOpen(true);
    setCallStatus('');
    setCallDuration(0);

    // Start with the first lead
    const firstLead = availableLeads[0];
    await handleCall(firstLead);
  };

  const stopAutoCalling = () => {
    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }
    setIsAutoCalling(false);
    setCallDialogOpen(false);
    setCurrentCallIndex(0);
    setCallDuration(0);
    setCallStatus('');
  };

  const handleCallComplete = async (status = 'completed') => {
    if (!selectedLead || savingNotes) return;
    
    setSavingNotes(true);
    try {
      const token = localStorage.getItem('token');
      
     

      // Update lead status based on call outcome
     const updatedStatus = callFormData.status || selectedLead.status;
      await axios.put(`${config.API_URL}/api/leads/${selectedLead._id}`, {
  ...selectedLead,
  status: updatedStatus, // ✅ NEW LINE
  lastCallOutcome: callFormData.outcome,
  lastCallNotes: callFormData.notes
}, {
  headers: { Authorization: `Bearer ${token}` }
});

      if (currentCall?._id) {
        await updateCallStatus(
          currentCall._id,
          callFormData.notes,
          callFormData.outcome,
          callDuration // Pass the duration in seconds
        );
      }
// 🧠 THIS WILL UPDATE THE CALL HISTORY
if (!callFormData.outcome) {
  setSnackbar({ open: true, message: 'Please select an outcome', severity: 'warning' });
  return;
}
console.log("🧪 currentCall is", currentCall);
if (currentCall?._id) {
  console.log("📞 Updating call-history with:", {
    callId: currentCall._id,
    notes: callFormData.notes,
    outcome: callFormData.outcome,
    duration: callDuration
  });

  await updateCallStatus(
    currentCall._id,
    callFormData.notes,
    callFormData.outcome,
    callDuration
  );

  console.log("✅ Call history updated");
}


      setCallDialogOpen(false);
      setSelectedLead(null);
      setCallDuration(0);
      if (callTimer) {
        clearInterval(callTimer);
        setCallTimer(null);
      }
      
      // Reset call form data
     setCallFormData({ outcome: '', notes: '', status: '' });
      
      setSnackbar({
        open: true,
        message: 'Call notes saved successfully',
        severity: 'success'
      });

      // Refresh leads list
      fetchLeads();

      // If auto-calling is active, move to next lead
      if (isAutoCalling) {
        moveToNextCall();
      }
    } catch (error) {
      console.error('Error saving call notes:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save call notes: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setSavingNotes(false);
    }
  };

  const startCallTimer = () => {
    if (callTimer) {
      clearInterval(callTimer);
    }
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    setCallTimer(timer);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const previewRows = lines.slice(1, 6).map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim() || '';
            return obj;
          }, {});
        });
        setCsvPreviewData({ headers, rows: previewRows });
      };
      reader.readAsText(file);
    }
  };

  const handleImportCsv = async () => {
    if (!csvFile) return;

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', csvFile);

      const token = localStorage.getItem('token');
      await axios.post(`${config.API_URL}/api/leads/import-csv`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSnackbar({ open: true, message: 'Leads imported successfully', severity: 'success' });
      setCsvDialogOpen(false);
      setCsvFile(null);
      setCsvPreviewData(null);
      fetchLeads();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to import leads', severity: 'error' });
      console.error('Error importing leads:', err);
    } finally {
      setImporting(false);
    }
  };
const handleExportCsv = () => {
  const token = localStorage.getItem('token');
  const url = `${config.API_URL}/api/leads/export-csv`;

  const a = document.createElement('a');
  a.href = `${url}?token=${token}`;
  a.download = 'leads.csv';
  a.rel = 'noopener';
  a.target = '_blank';
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setSnackbar({ open: true, message: 'Leads export started', severity: 'success' });
};


  // Function to initiate call tracking
  const initiateCallTracking = async (lead) => {
    try {
      // Clean and validate phone number
      const cleanNumber = lead.phone.replace(/[^\d+]/g, '');
      if (!cleanNumber || cleanNumber.length < 10) {
        throw new Error('Invalid phone number format');
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(`${config.API_URL}/api/call-history/initiate`, {
        leadId: lead._id,
        phoneNumber: cleanNumber,
        deviceInfo: navigator.userAgent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentCall(response.data);
      return response.data;
    } catch (error) {
      console.error('Error initiating call tracking:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to track call',
        severity: 'error'
      });
      throw error;
    }
  };

  // Function to update call status
  const updateCallStatus = async (callId, notes, outcome, duration) => {
    try {
      const token = localStorage.getItem('token');
      console.log("🔁 PUT request sent to backend:", {
        url: `${config.API_URL}/api/call-history/${callId}/status`,
        data: {
          outcome,
          notes
        }
      });
      await axios.put(`${config.API_URL}/api/call-history/${callId}/status`, {
        outcome,
        notes,
        duration, // <- Add duration
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error updating call status:', error);
    }
  };

  // Update the handleCall function to initialize the form data
  const handleCall = async (lead) => {
    try {
      if (!lead?.phone) {
        throw new Error('No phone number available for this lead');
      }

      // Reset form data for new call
      setCallFormData({
        outcome: '',
        notes: ''
      });
      
      // Start call tracking
      const callRecord = await initiateCallTracking(lead);
      
      // Set the selected lead
      setSelectedLead(lead);
      
      // Clean the phone number and format it for mobile dialing
      const cleanNumber = lead.phone.replace(/[^\d+]/g, '');
      
      if (isMobileDevice()) {
        // For mobile devices, use tel: protocol
        window.location.href = `tel:${cleanNumber}`;
        
        // Open dialog for call notes after a short delay to allow the call to start
        setTimeout(() => {
          setCurrentCall(callRecord);
          setCallDialogOpen(true);
          startCallTimer();
        }, 1000);
      } else {
        setSnackbar({
          open: true,
          message: 'Calling is only available on mobile devices',
          severity: 'warning'
        });
      }
    } catch (error) {
      console.error('Error handling call:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to initiate call',
        severity: 'error'
      });
      
      if (isAutoCalling) {
        moveToNextCall();
      }
    }
  };

  // Add this function to check if we're on a mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Add function to handle moving to next call
  const moveToNextCall = async () => {
    if (!isAutoCalling) return;

    const availableLeads = leads.filter(lead => 
      !lead.lastCallOutcome || 
      ['no-answer', 'busy', 'skipped'].includes(lead.lastCallOutcome)
    );

    const nextIndex = currentCallIndex + 1;
    
    if (nextIndex < availableLeads.length) {
      setCurrentCallIndex(nextIndex);
      const nextLead = availableLeads[nextIndex];
      
      // Add a small delay before next call
      setTimeout(async () => {
        await handleCall(nextLead);
      }, 2000);
    } else {
      stopAutoCalling();
      setSnackbar({
        open: true,
        message: 'Auto-calling completed for all available leads',
        severity: 'success'
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Leads Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color={isAutoCalling ? "error" : "success"}
            startIcon={isAutoCalling ? <StopIcon /> : <PlayArrowIcon />}
            onClick={startAutoCalling}
          >
            {isAutoCalling ? "Stop Auto-Calling" : "Start Auto-Calling"}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<UploadIcon />}
            onClick={() => setCsvDialogOpen(true)}
          >
            Import CSV
          </Button>
          <Button
            variant="contained"
            color="info"
            startIcon={<DownloadIcon />}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={() => setBulkDeleteConfirmOpen(true)}
            disabled={selectedLeads.length === 0}
          >
            Delete Selected ({selectedLeads.length})
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Lead
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} mb={3}>
          <TextField
            label="Search Leads"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
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
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedLeads.length > 0 && selectedLeads.length < leads.length}
                        checked={leads.length > 0 && selectedLeads.length === leads.length}
                        onChange={handleSelectAllLeads}
                      />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow 
                      key={lead._id}
                      selected={selectedLeads.includes(lead._id)}
                      hover
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedLeads.includes(lead._id)}
                          onChange={() => handleSelectLead(lead._id)}
                        />
                      </TableCell>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>
                        <Typography
                          component="span"
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: (() => {
                              switch (lead.status) {
                                case 'new': return '#e3f2fd';
                                case 'contacted': return '#f0f4c3';
                                case 'qualified': return '#c8e6c9';
                                case 'lost': return '#ffcdd2';
                                case 'converted': return '#b2dfdb';
                                case 'in-progress': return '#fff3e0';
                                default: return '#e0e0e0';
                              }
                            })(),
                          }}
                        >
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title={isMobileDevice() ? "Call" : "Call (only available on mobile)"}>
                            <span>
                              <IconButton
                                color="primary"
                                onClick={() => handleCall(lead)}
                                disabled={!isMobileDevice()}
                                size="small"
                              >
                                <PhoneIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(lead)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(lead._id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </>
        )}
      </Paper>

      {/* Add/Edit Lead Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedLead ? 'Edit Lead' : 'Add New Lead'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Phone"
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <FormControl fullWidth margin="dense">
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
            <TextField
              margin="dense"
              label="Notes"
              fullWidth
              multiline
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedLead ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Auto-calling Dialog */}
      <Dialog 
        open={callDialogOpen} 
        onClose={() => {
          if (!isAutoCalling) {
            setCallDialogOpen(false);
          }
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '60vh',
            m: isMobileDevice() ? 1 : 3,
            width: isMobileDevice() ? 'calc(100% - 16px)' : '800px',
            position: 'relative'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, fontSize: '1.5rem' }}>
          {isAutoCalling ? 'Auto-Calling Session' : 'Call Details'}
        </DialogTitle>
        <DialogContent>
          {leads[currentCallIndex] && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h5" gutterBottom>
                {leads[currentCallIndex].name}
              </Typography>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Phone Number
                  </Typography>
                  <Typography variant="h6">
                    {leads[currentCallIndex].phone}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="h6">
                    {leads[currentCallIndex].email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Typography variant="h6">
                    {leads[currentCallIndex].status}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="primary">
                    Call Duration: {formatDuration(callDuration)}
                  </Typography>
                </Box>
                <FormControl fullWidth size="large" margin="dense">
                  <InputLabel sx={{ fontSize: '1.4rem' }}>Call Outcome</InputLabel>
                  <Select
                    value={callFormData.outcome}
                    onChange={(e) => setCallFormData(prev => ({ ...prev, outcome: e.target.value }))}
                    label="Call Outcome"
                    sx={{
                      minHeight: 80,
                      fontSize: '1.6rem',
                      '& .MuiSelect-select': {
                        padding: '20px 32px',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '2px',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '3px',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '3px',
                      }
                    }}
                  >
                    <MenuItem value="successful" sx={{ fontSize: '1.4rem', padding: '16px 32px' }}>Successful</MenuItem>
                    <MenuItem value="no-answer" sx={{ fontSize: '1.4rem', padding: '16px 32px' }}>No Answer</MenuItem>
                    <MenuItem value="wrong-number" sx={{ fontSize: '1.4rem', padding: '16px 32px' }}>Wrong Number</MenuItem>
                    <MenuItem value="busy" sx={{ fontSize: '1.4rem', padding: '16px 32px' }}>Busy</MenuItem>
                    <MenuItem value="rescheduled" sx={{ fontSize: '1.4rem', padding: '16px 32px' }}>Rescheduled</MenuItem>
                    <MenuItem value="other" sx={{ fontSize: '1.4rem', padding: '16px 32px' }}>Other</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="large" margin="dense">
  <InputLabel sx={{ fontSize: '1.4rem' }}>Call Status</InputLabel>
  <Select
    value={callFormData.status}
    onChange={(e) => setCallFormData(prev => ({ ...prev, status: e.target.value }))}
    label="Call Status"
    sx={{
      minHeight: 80,
      fontSize: '1.6rem',
      '& .MuiSelect-select': {
        padding: '20px 32px',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: '2px',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderWidth: '3px',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderWidth: '3px',
      }
    }}
  >
    <MenuItem value="" sx={{ fontSize: '1.4rem', padding: '16px 32px' }}></MenuItem>
    {statusOptions.map(status => (
      <MenuItem key={status} value={status} sx={{ fontSize: '1.4rem', padding: '16px 32px' }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </MenuItem>
    ))}
  </Select>
</FormControl>

                <TextField
                  label="Call Notes"
                  multiline
                  rows={6}
                  value={callFormData.notes}
                  onChange={(e) => setCallFormData(prev => ({ ...prev, notes: e.target.value }))}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1rem',
                      lineHeight: '1.5',
                      minHeight: '150px'
                    },
                    '& .MuiInputBase-inputMultiline': {
                      minHeight: '130px !important'
                    }
                  }}
                />
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          flexDirection: 'column', 
          gap: 3, 
          p: 4,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#f5f5f5'
        }}>
          <Box display="flex" gap={3} width="100%">
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
              onClick={() => handleCallComplete('completed')}
              disabled={!callFormData.outcome || savingNotes}
              fullWidth
              size="large"
              sx={{
                py: 5,
                fontSize: '1.8rem',
                fontWeight: 600,
                boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 8px 12px rgba(0,0,0,0.22)',
                },
                minHeight: '120px'
              }}
            >
              Save Notes
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CallEndIcon sx={{ fontSize: 40 }} />}
              onClick={() => {
                if (callTimer) {
                  clearInterval(callTimer);
                  setCallTimer(null);
                }
                if (!callFormData.outcome) {
                  setCallFormData(prev => ({ ...prev, outcome: 'no-answer' }));
                }
                handleCallComplete('ended');
              }}
              fullWidth
              size="large"
              sx={{
                py: 5,
                fontSize: '1.8rem',
                fontWeight: 600,
                boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 8px 12px rgba(0,0,0,0.22)',
                },
                minHeight: '120px'
              }}
            >
              End Call
            </Button>
          </Box>
          {isAutoCalling && (
            <Box display="flex" gap={3} width="100%">
              <Button
                variant="outlined"
                color="warning"
                startIcon={<SkipNextIcon sx={{ fontSize: 40 }} />}
                onClick={() => {
                  setCallFormData(prev => ({ ...prev, outcome: 'skipped' }));
                  handleCallComplete('skipped');
                }}
                fullWidth
                size="large"
                sx={{
                  py: 5,
                  fontSize: '1.8rem',
                  fontWeight: 600,
                  borderWidth: 4,
                  '&:hover': {
                    borderWidth: 4,
                  },
                  minHeight: '120px'
                }}
              >
                Skip Lead
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<StopIcon sx={{ fontSize: 40 }} />}
                onClick={stopAutoCalling}
                fullWidth
                size="large"
                sx={{
                  py: 5,
                  fontSize: '1.8rem',
                  fontWeight: 600,
                  borderWidth: 4,
                  '&:hover': {
                    borderWidth: 4,
                  },
                  minHeight: '120px'
                }}
              >
                Stop Auto-Calling
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>

      {/* Add CSV Import Dialog */}
      <Dialog
        open={csvDialogOpen}
        onClose={() => {
          setCsvDialogOpen(false);
          setCsvFile(null);
          setCsvPreviewData(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Leads from CSV</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Input
              type="file"
              inputProps={{ accept: '.csv' }}
              onChange={handleCsvUpload}
              sx={{ mb: 2 }}
            />
            {csvPreviewData && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Preview (first 5 rows):</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {csvPreviewData.headers.map((header, index) => (
                          <TableCell key={index}>{header}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {csvPreviewData.rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {csvPreviewData.headers.map((header, cellIndex) => (
                            <TableCell key={cellIndex}>{row[header]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCsvDialogOpen(false);
              setCsvFile(null);
              setCsvPreviewData(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImportCsv}
            variant="contained"
            color="primary"
            disabled={!csvFile || importing}
          >
            {importing ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Import'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        aria-labelledby="bulk-delete-dialog-title"
      >
        <DialogTitle id="bulk-delete-dialog-title">
          Confirm Bulk Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedLeads.length} selected lead{selectedLeads.length !== 1 ? 's' : ''}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteConfirmOpen(false)} disabled={bulkDeleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkDelete} 
            color="error" 
            variant="contained"
            disabled={bulkDeleteLoading}
            startIcon={bulkDeleteLoading ? <CircularProgress size={20} /> : <DeleteSweepIcon />}
          >
            {bulkDeleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
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

export default Leads;

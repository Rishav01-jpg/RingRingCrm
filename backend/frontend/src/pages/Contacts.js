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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config';

const Contacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // CSV import state
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreviewData, setCsvPreviewData] = useState(null);
  const [importing, setImporting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/api/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: searchTerm,
          page,
          limit: 10
        }
      });

      setContacts(response.data.contacts);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch contacts');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page, searchTerm]);

  const handleOpenDialog = (contact = null) => {
    if (contact) {
      setSelectedContact(contact);
      setFormData({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        notes: contact.notes
      });
    } else {
      setSelectedContact(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedContact(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (selectedContact) {
        await axios.put(
          `${config.API_URL}/api/contacts/${selectedContact._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({ open: true, message: 'Contact updated successfully', severity: 'success' });
      } else {
        await axios.post(
          `${config.API_URL}/api/contacts`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({ open: true, message: 'Contact created successfully', severity: 'success' });
      }
      handleCloseDialog();
      fetchContacts();
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: `Failed to ${selectedContact ? 'update' : 'create'} contact`, 
        severity: 'error' 
      });
      console.error('Error saving contact:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${config.API_URL}/api/contacts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSnackbar({ open: true, message: 'Contact deleted successfully', severity: 'success' });
        fetchContacts();
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to delete contact', severity: 'error' });
        console.error('Error deleting contact:', err);
      }
    }
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
      await axios.post(`${config.API_URL}/api/contacts/import-csv`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSnackbar({ open: true, message: 'Contacts imported successfully', severity: 'success' });
      setCsvDialogOpen(false);
      setCsvFile(null);
      setCsvPreviewData(null);
      fetchContacts();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to import contacts', severity: 'error' });
      console.error('Error importing contacts:', err);
    } finally {
      setImporting(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/api/contacts/export-csv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contacts-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: 'Contacts exported successfully', severity: 'success' });
    } catch (err) {
      console.error('Error exporting contacts:', err);
      setSnackbar({ 
        open: true, 
        message: 'Failed to export contacts', 
        severity: 'error' 
      });
    }
  };

  const handleCall = async (contact) => {
    const phone = contact.phone;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = `tel:${phone}`;
  
      // Send to backend to create call history
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${config.API_URL}/api/call-history/initiate`, {
          contactId: contact._id,
          phoneNumber: contact.phone,
          deviceInfo: navigator.userAgent
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Failed to create contact call history:', err);
      }
  
    } else {
      setSnackbar({
        open: true,
        message: 'Calling is only available on mobile devices',
        severity: 'warning'
      });
    }
  };
  

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Contacts Management
        </Typography>
        <Box display="flex" gap={2}>
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
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Contact
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} mb={3}>
          <TextField
            label="Search Contacts"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
            }}
          />
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
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact._id}>
                      <TableCell>{contact.name}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.notes}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Call">
                            <IconButton
                              color="primary"
                              onClick={() => handleCall(contact)}
                              size="small"
                            >
                              <PhoneIcon />
                            </IconButton>
                          </Tooltip>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(contact)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(contact._id)}
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

      {/* Add/Edit Contact Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedContact ? 'Edit Contact' : 'Add New Contact'}
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
              {selectedContact ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* CSV Import Dialog */}
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
        <DialogTitle>Import Contacts from CSV</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              style={{ marginBottom: '16px' }}
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
            {importing ? <CircularProgress size={24} /> : 'Import'}
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

export default Contacts; 

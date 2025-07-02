import UserProfile from './pages/UserProfile';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/auth/Login';
import Dashboard from './components/layout/Dashboard';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Leads from './pages/Leads';
import Contacts from './pages/Contacts';
import ScheduledCalls from './pages/ScheduledCalls';
import InstantLeads from './pages/InstantLeads';
// Add import at the top
import CallHistory from './pages/CallHistory';
import Admin from './pages/Admin';
import Signup from './components/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import logo from './logo.svg';



const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

  function App() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to right, #141e30, #243b55)',
        color: '#fff',
        fontFamily: 'Arial',
      }}>
        <img src={logo} alt="Logo" style={{ width: 120, marginBottom: 20 }} />
        <h1>Welcome to Ring Ring CRM</h1>
        <p>Loading your dashboard...</p>
      </div>
    );
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/leads"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Leads />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Contacts />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/scheduled-calls"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ScheduledCalls />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/call-history"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CallHistory />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Admin />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Layout>
        <UserProfile />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route path="/instant-leads" element={<InstantLeads />} />

          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

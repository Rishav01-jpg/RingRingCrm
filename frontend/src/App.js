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
import logo from './logo.png';
import GetWebsiteForm from './pages/GetWebsiteForm';
import LandingPage from './pages/LandingPage';
import PaymentPage from './pages/PaymentPage';


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
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg,rgb(8, 37, 25),rgb(19, 89, 61),)',
      color: '#ffffff',
      padding: '20px',
      boxSizing: 'border-box',
      textAlign: 'center',
    }}>
      <img
        src={logo}
        alt="Logo"
        style={{
          width: '500px',
          maxWidth: '100%',
          height: 'auto',
          marginBottom: '10px',
        }}
      />
      <h2 style={{
        fontSize: '1.6rem',
        fontWeight: '600',
        marginBottom: '6px',
        lineHeight: '1.3',
      }}>
        Welcome to Ring Ring CRM
      </h2>
      <p style={{
        fontSize: '1rem',
        opacity: 0.8,
      }}>
        Preparing your dashboard...
      </p>
    </div>
  );
}

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
<Route path="/" element={<LandingPage />} />          
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
<Route
  path="/get-website"
  element={
    <ProtectedRoute>
      <GetWebsiteForm />
    </ProtectedRoute>
  }
/>

 <Route path="/payment" element={<PaymentPage />} />


          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}


export default App;

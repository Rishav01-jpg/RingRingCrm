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
// Add import at the top
import CallHistory from './pages/CallHistory';
import Admin from './pages/Admin';
import Signup from './components/Signup';


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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
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
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

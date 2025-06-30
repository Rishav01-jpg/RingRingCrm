import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${config.API_URL}/api/auth/login`, {
        email,
        password
      });
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return response.data;
      }
      throw new Error('Invalid response from server');
    } catch (err) {
      throw err;
    }
  };
  const signup = async (name, email, password) => {
    try {
      const response = await axios.post(`${config.API_URL}/api/auth/signup`, {
        name,
        email,
        password,
      });
  
      if (response.data.token) {
        // Optional: Auto-login after signup
        const profile = await axios.get(`${config.API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${response.data.token}` },
        });
  
        localStorage.setItem('token', response.data.token);
        setUser(profile.data);
      }
  
      return response.data;
    } catch (err) {
      throw err;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${config.API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (err) {
        localStorage.removeItem('token');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      signup
      
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.success) {
        setCurrentUser(response.data);
      } else {
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });

      // Check if the response contains a token
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setCurrentUser(response.user);
        return { success: true };
      } else {
        const errorMessage = response.message || 'Login failed. Please check your credentials.';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during login';
      console.error('Login error:', err);
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', userData);

      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setCurrentUser(response.user);
        return { success: true };
      } else {
        const errorMessage = response.message || 'Registration failed';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during registration';
      console.error('Registration error:', err);
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint but don't wait for it
      api.get('/auth/logout').catch(err => console.error('Logout API error:', err));
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

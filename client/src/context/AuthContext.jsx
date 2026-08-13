import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password });
      const data = response.data;
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        profileInfo: data.profileInfo,
      });
      setToken(data.token);
      setLoading(false);
      return { success: true, role: data.role };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/register', userData);
      const data = response.data;
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        profileInfo: data.profileInfo,
      });
      setToken(data.token);
      setLoading(false);
      return { success: true, role: data.role };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const updateProfile = async (updatedFields) => {
    setLoading(true);
    try {
      const response = await API.put('/auth/profile', updatedFields);
      const data = response.data;
      const updatedUser = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        profileInfo: data.profileInfo,
      };
      setUser(updatedUser);
      if (data.token) {
        setToken(data.token);
      }
      setLoading(false);
      return { success: true, user: updatedUser };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const res = await client.get('/notifications/unread-count');
      setUnreadCount(res.data.unread_count || 0);
    } catch (e) {
      // Ignore background notification fetch errors
    }
  };

  const refreshProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await client.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      await fetchUnreadCount();
    } catch (e) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [token]);

  const login = async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    await fetchUnreadCount();
    return userData;
  };

  const register = async (formData) => {
    await client.post('/auth/register', formData);
    return await login(formData.email, formData.password);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setUnreadCount(0);
  };

  const demoLogin = async (type = 'alex') => {
    const accounts = {
      alex: { email: 'alex@campus.edu', password: 'Student@123' },
      jordan: { email: 'jordan@campus.edu', password: 'Student@123' },
      sarah: { email: 'sarah@campus.edu', password: 'Student@123' },
      admin: { email: 'admin@lostandfound.edu', password: 'AdminPassword@123' }
    };
    const creds = accounts[type] || accounts.alex;
    return await login(creds.email, creds.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        unreadCount,
        login,
        register,
        logout,
        refreshProfile,
        fetchUnreadCount,
        demoLogin,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

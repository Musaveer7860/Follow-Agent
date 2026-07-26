import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('meetmind_user');
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error("Error reading user from localStorage:", err);
      localStorage.removeItem('meetmind_user');
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('meetmind_token') || null;
    } catch (err) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
          localStorage.setItem('meetmind_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Auth verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('meetmind_token', access_token);
    localStorage.setItem('meetmind_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password, role) => {
    const res = await authAPI.register({ name, email, password, role });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('meetmind_token', access_token);
    localStorage.setItem('meetmind_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('meetmind_token');
    localStorage.removeItem('meetmind_user');
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('meetmind_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

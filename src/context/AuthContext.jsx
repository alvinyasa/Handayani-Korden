import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin } from '../services/api';

const AuthContext = createContext();

const ADMIN_STORAGE_KEY = 'korden_admin_session';

const DEFAULT_TEKNISI = {
  role: 'teknisi',
  name: 'Teknisi Lapangan',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.role === 'admin' || parsed.username === 'manyu')) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_TEKNISI;
  });

  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await loginAdmin({ username, password });
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(res.user));
        return { success: true, message: res.message };
      } else {
        return { success: false, message: res.message || 'Login gagal' };
      }
    } catch (err) {
      return { success: false, message: 'Koneksi error saat login admin' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setUser(DEFAULT_TEKNISI);
  };

  const isAdmin = user?.role === 'admin' || user?.username === 'manyu';
  const canEdit = isAdmin;
  const isTeknisi = !isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        canEdit,
        isTeknisi,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

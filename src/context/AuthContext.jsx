import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin } from '../services/api';

const AuthContext = createContext();

const ADMIN_STORAGE_KEY = 'korden_admin_session';
const ADMIN_SESSION_TIMEOUT_MS = 25 * 60 * 1000; // 25 Menit (in ms)

const DEFAULT_TEKNISI = {
  role: 'teknisi',
  name: 'Teknisi Lapangan',
};

export function AuthProvider({ children }) {
  const [sessionExpiredToast, setSessionExpiredToast] = useState(false);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.role === 'admin' || parsed.username === 'manyu')) {
          const lastActive = parsed.lastActive || parsed.loginTimestamp || Date.now();
          // Check if session has already expired
          if (Date.now() - lastActive < ADMIN_SESSION_TIMEOUT_MS) {
            return { ...parsed, lastActive };
          } else {
            localStorage.removeItem(ADMIN_STORAGE_KEY);
          }
        }
      } catch (e) {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
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
        const userWithSession = {
          ...res.user,
          lastActive: Date.now(),
          loginTimestamp: Date.now(),
        };
        setUser(userWithSession);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(userWithSession));
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

  const logout = (isAuto = false) => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setUser(DEFAULT_TEKNISI);
    if (isAuto) {
      setSessionExpiredToast(true);
    }
  };

  // Activity tracking & session timeout check
  useEffect(() => {
    const isAdminUser = user?.role === 'admin' || user?.username === 'manyu';
    if (!isAdminUser) return;

    // Periodically check session expiration
    const checkInterval = setInterval(() => {
      const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.lastActive) {
            const idleTime = Date.now() - parsed.lastActive;
            if (idleTime >= ADMIN_SESSION_TIMEOUT_MS) {
              logout(true);
            }
          }
        } catch (e) {
          logout(true);
        }
      } else {
        logout(false);
      }
    }, 5000);

    // User activity listeners to refresh lastActive
    let lastSaveTime = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle localStorage updates to once every 10 seconds
      if (now - lastSaveTime > 10000) {
        lastSaveTime = now;
        setUser((prev) => {
          if (!prev || (prev.role !== 'admin' && prev.username !== 'manyu')) return prev;
          const updated = { ...prev, lastActive: now };
          localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    };

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((evt) =>
      window.addEventListener(evt, handleUserActivity, { passive: true })
    );

    return () => {
      clearInterval(checkInterval);
      activityEvents.forEach((evt) =>
        window.removeEventListener(evt, handleUserActivity)
      );
    };
  }, [user]);

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
        sessionExpiredToast,
        clearSessionExpiredToast: () => setSessionExpiredToast(false),
        sessionTimeoutMinutes: 25,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, LogOut, Sun, Moon } from 'lucide-react';

export default function Navbar({ onNavigateToAdmin, onLogout }) {
  const { isAdmin } = useAuth();

  // Dark mode state
  const [isDark, setIsDark] = useState(() => {
    return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-[#444444] shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-5 py-2.5 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-[#2A2A2A] border border-slate-200/80 dark:border-[#444444] shadow-xs p-1 flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-slate-100 dark:ring-[#444444]/60">
            <img
              src="/logo.png"
              alt="Handayani Korden"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-normal text-slate-900 dark:text-[#E0E0E0] leading-tight">
                HANDAYANI KORDEN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-[#888888] font-semibold tracking-wider uppercase mt-0.5">
              Katalog & Manajemen Stok
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Fitur Dark Mode / Light Mode (Di Samping Kiri Admin / Teknisi) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-50 dark:bg-[#2A2A2A] hover:bg-slate-100 dark:hover:bg-[#444444] transition-all active-press shadow-xs"
            title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            aria-label="Toggle Dark/Light Mode"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* User Role Status Badge */}
          {isAdmin ? (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={onNavigateToAdmin}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-orange-200/80 dark:border-[#444444] bg-orange-50 dark:bg-orange-950/40 text-[#d96b27] dark:text-orange-400 text-xs font-bold active-press shadow-xs"
                title="Panel Admin"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#d96b27] dark:text-orange-400" />
                <span className="truncate max-w-[70px] sm:max-w-none">Admin</span>
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-[#444444] active-press transition-colors"
                title="Logout Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-50 dark:bg-[#2A2A2A] text-slate-700 dark:text-[#B0B0B0] text-xs font-semibold shadow-xs">
              <UserCheck className="w-3.5 h-3.5 text-slate-400 dark:text-[#888888]" />
              <span>Teknisi</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

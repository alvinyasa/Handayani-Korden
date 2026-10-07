import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ChevronLeft
} from 'lucide-react';

export default function AdminLoginPage({ onNavigateToApp }) {
  const { isAdmin, login, loading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Jika sudah dalam sesi admin, langsung buka web admin
  useEffect(() => {
    if (isAdmin && onNavigateToApp) {
      onNavigateToApp('stock');
    }
  }, [isAdmin, onNavigateToApp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await login(username.trim(), password);
    if (res.success) {
      // Langsung masuk ke web admin tanpa perantara tambahan
      if (onNavigateToApp) {
        onNavigateToApp('stock');
      }
    } else {
      setError(res.message || 'Username atau sandi salah.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#121212] flex flex-col justify-center items-center p-4 transition-colors">
      <div className="w-full max-w-sm bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-xl border border-slate-200 dark:border-[#444444] overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-[#2A2A2A] dark:via-[#333333] dark:to-[#2A2A2A] p-6 text-white dark:text-[#E0E0E0] text-center relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#444444] shadow-md p-1.5 flex items-center justify-center mb-3">
            <img src="/logo.png" alt="Handayani Korden" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase">HANDAYANI KORDEN</h2>
          <p className="text-xs text-slate-300 dark:text-[#B0B0B0] mt-1 font-medium">
            Masuk Akun Admin
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 dark:text-[#E0E0E0]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#B0B0B0] mb-1">
                Username Admin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 dark:text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username..."
                  className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-50 dark:bg-[#2A2A2A] text-slate-900 dark:text-[#E0E0E0] placeholder:text-slate-400 dark:placeholder:text-[#888888] focus:bg-white dark:focus:bg-[#2A2A2A] focus:ring-2 focus:ring-[#d96b27] focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#B0B0B0] mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan sandi..."
                  className="w-full text-xs pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-50 dark:bg-[#2A2A2A] text-slate-900 dark:text-[#E0E0E0] placeholder:text-slate-400 dark:placeholder:text-[#888888] focus:bg-white dark:focus:bg-[#2A2A2A] focus:ring-2 focus:ring-[#d96b27] focus:outline-none font-medium font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#888888] hover:text-slate-600 dark:hover:text-[#E0E0E0] p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#d96b27] hover:bg-[#c25a1d] text-white font-extrabold text-xs shadow-md shadow-orange-600/20 flex items-center justify-center space-x-2 active-press disabled:opacity-50 transition-colors"
            >
              <span>{loading ? 'Memproses Masuk...' : 'Masuk ke Web Admin'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Back to Public / Teknisi View */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#444444] text-center">
            <button
              onClick={() => onNavigateToApp && onNavigateToApp('stock')}
              className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 dark:text-[#888888] hover:text-slate-800 dark:hover:text-[#E0E0E0] p-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Teknisi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  LogOut,
  CheckCircle2,
  Table,
  LayoutGrid,
  Image as ImageIcon,
  Sparkles,
  Eye,
  EyeOff,
  ChevronLeft
} from 'lucide-react';

export default function AdminLoginPage({ onNavigateToApp }) {
  const { user, isAdmin, login, logout, loading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const res = await login(username.trim(), password);
    if (res.success) {
      setSuccessMsg(res.message || 'Login berhasil! Akses penuh SPV / Kepala Toko telah aktif.');
      setTimeout(() => {
        if (onNavigateToApp) onNavigateToApp('stock');
      }, 700);
    } else {
      setError(res.message || 'Username atau sandi salah.');
    }
  };

  const handleLogout = () => {
    logout();
    setSuccessMsg('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#121212] flex flex-col justify-center items-center p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-xl border border-slate-200 dark:border-[#444444] overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-[#2A2A2A] dark:via-[#333333] dark:to-[#2A2A2A] p-6 text-white dark:text-[#E0E0E0] text-center relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#444444] shadow-md p-1.5 flex items-center justify-center mb-3">
            <img src="/logo.png" alt="Handayani Korden" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase">HANDAYANI KORDEN</h2>
          <p className="text-xs text-slate-300 dark:text-[#B0B0B0] mt-1 font-medium">
            Panel Admin SPV & Kepala Toko
          </p>

          <div className="mt-3 inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/10 text-[10px] text-emerald-300 font-mono">
            <span>URL Khusus: /admin</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 dark:text-[#E0E0E0]">
          {isAdmin ? (
            /* Logged-In State */
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-extrabold text-base">Akun Admin Aktif</h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Masuk sebagai: <strong>{user?.name || 'Manyu (SPV / Kepala Toko)'}</strong>
                </p>
                <p className="text-[11px] text-emerald-600 mt-2 bg-white/60 p-2 rounded-xl">
                  ✓ Hak Akses Penuh (CRUD Stok, Model & Foto Pemasangan)
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => onNavigateToApp && onNavigateToApp('stock')}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md active-press"
                >
                  <Table className="w-4 h-4 text-emerald-400" />
                  <span>Buka Kelola Stok Kain (Excel Grid)</span>
                </button>

                <button
                  onClick={() => onNavigateToApp && onNavigateToApp('models')}
                  className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center space-x-2 border border-slate-200 active-press"
                >
                  <LayoutGrid className="w-4 h-4 text-indigo-600" />
                  <span>Buka Kelola Model Korden</span>
                </button>

                <button
                  onClick={() => onNavigateToApp && onNavigateToApp('installations')}
                  className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center space-x-2 border border-slate-200 active-press"
                >
                  <ImageIcon className="w-4 h-4 text-teal-600" />
                  <span>Buka Kelola Foto Pemasangan</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center space-x-1.5 border border-rose-200 active-press"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Admin (Logout)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
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
                    placeholder="Masukkan username (manyu)"
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-50 dark:bg-[#2A2A2A] text-slate-900 dark:text-[#E0E0E0] placeholder:text-slate-400 dark:placeholder:text-[#888888] focus:bg-white dark:focus:bg-[#2A2A2A] focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
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
                    className="w-full text-xs pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-50 dark:bg-[#2A2A2A] text-slate-900 dark:text-[#E0E0E0] placeholder:text-slate-400 dark:placeholder:text-[#888888] focus:bg-white dark:focus:bg-[#2A2A2A] focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium font-mono"
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
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 dark:bg-[#444444] hover:bg-slate-800 dark:hover:bg-[#333333] text-white dark:text-[#E0E0E0] font-extrabold text-xs shadow-lg shadow-slate-900/20 flex items-center justify-center space-x-2 active-press disabled:opacity-50"
              >
                <span>{loading ? 'Memproses Masuk...' : 'Masuk Panel Admin (Full Akses)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Back to Public / Teknisi View */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#444444] text-center">
            <button
              onClick={() => onNavigateToApp && onNavigateToApp('stock')}
              className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 dark:text-[#888888] hover:text-slate-800 dark:hover:text-[#E0E0E0] p-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Web Teknisi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

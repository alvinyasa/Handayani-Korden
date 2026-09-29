import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  UserCheck,
  Table,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  Info,
  LogOut,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function AccountPage({ stats, onNavigateToAdmin }) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="space-y-4 pb-4">
      {/* Current User Card */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-4 border border-slate-200 dark:border-[#444444] shadow-xs">
        <div className="flex items-center space-x-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
              isAdmin
                ? 'bg-purple-600 shadow-purple-600/30'
                : 'bg-blue-600 shadow-blue-600/30'
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <UserCheck className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-[#E0E0E0] truncate">
              {isAdmin ? 'Manyu (SPV / Kepala Toko)' : 'Teknisi Lapangan'}
            </h2>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  isAdmin
                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                    : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                }`}
              >
                {isAdmin ? 'Akses Penuh CRUD' : 'Mode Lihat Saja'}
              </span>
            </div>
          </div>

          {isAdmin ? (
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-[#444444] text-xs font-bold flex items-center space-x-1 active-press"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          ) : (
            <button
              onClick={onNavigateToAdmin}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-[#444444] hover:bg-slate-800 dark:hover:bg-[#333333] text-white dark:text-[#E0E0E0] text-xs font-bold flex items-center space-x-1 active-press border border-transparent dark:border-[#444444]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login Admin</span>
            </button>
          )}
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-[#444444] text-xs text-slate-600 dark:text-[#B0B0B0]">
          {isAdmin ? (
            <p className="text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
              ✓ Anda memiliki <strong>Akses Penuh (Full Akses CRUD)</strong> untuk mengubah status stok Ready/Kosong dengan 1-tap, menambah katalog/motif/warna, serta mengunggah foto model dan foto pemasangan.
            </p>
          ) : (
            <div>
              <p className="text-slate-500 dark:text-[#B0B0B0] leading-relaxed">
                Anda sedang dalam mode <strong>Teknisi Lapangan</strong> (Hanya melihat stok, model & foto pemasangan untuk klien).
              </p>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#444444] flex items-center justify-between text-slate-400 dark:text-[#888888] text-[11px]">
                <span>Untuk akses SPV / Kepala Toko:</span>
                <button
                  onClick={onNavigateToAdmin}
                  className="font-bold text-slate-700 dark:text-[#E0E0E0] hover:text-slate-900 dark:hover:text-white underline flex items-center space-x-0.5"
                >
                  <span>Buka /admin</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="space-y-2.5">
          <h3 className="font-bold text-xs text-slate-500 dark:text-[#888888] uppercase tracking-wider px-1">
            Ringkasan Data Toko Korden
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Ready Stock */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-3.5 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-emerald-900 dark:text-emerald-300">{stats.readyVariants || 0}</div>
                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Varian Ready (✓)</div>
              </div>
            </div>

            {/* Kosong Stock */}
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-3.5 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-rose-900 dark:text-rose-300">{stats.emptyVariants || 0}</div>
                <div className="text-[11px] font-bold text-rose-700 dark:text-rose-400">Varian Kosong (✗)</div>
              </div>
            </div>

            {/* Total Catalogs */}
            <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#444444] rounded-2xl p-3.5 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-[#2A2A2A] text-white dark:text-[#E0E0E0] border border-transparent dark:border-[#444444] flex items-center justify-center shadow-xs">
                <Table className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-slate-900 dark:text-[#E0E0E0]">{stats.totalCatalogs || 0}</div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-[#888888]">Katalog Kain</div>
              </div>
            </div>

            {/* Total Models */}
            <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#444444] rounded-2xl p-3.5 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-900/60 text-white dark:text-indigo-300 flex items-center justify-center shadow-xs">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-slate-900 dark:text-[#E0E0E0]">{stats.totalModels || 0}</div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-[#888888]">Model Korden</div>
              </div>
            </div>

            {/* Total Installation Photos */}
            <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#444444] rounded-2xl p-3.5 flex items-center space-x-3 col-span-2">
              <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-900/60 text-white dark:text-teal-300 flex items-center justify-center shadow-xs">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-slate-900 dark:text-[#E0E0E0]">{stats.totalInstallationPhotos || 0}</div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-[#888888]">
                  Foto Hasil Pemasangan Terverifikasi
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* App Guide & Help */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-4 border border-slate-200 dark:border-[#444444] shadow-xs space-y-2 text-xs">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-[#E0E0E0]">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Informasi Akses Sistem:</span>
        </div>
        <ul className="space-y-1.5 text-slate-600 dark:text-[#B0B0B0] pl-4 list-disc">
          <li>
            <strong>URL Teknisi (Utama):</strong> <code>/</code> (Lihat stok, model & foto pemasangan).
          </li>
          <li>
            <strong>URL Admin:</strong> <code>/admin</code> (Akun: <code>manyu</code>, Sandi: <code>sk21korden</code>).
          </li>
          <li>
            <strong>Full Akses:</strong> Admin dapat mengubah status stok, menambah katalog baru, serta mengunggah foto.
          </li>
        </ul>
      </div>
    </div>
  );
}

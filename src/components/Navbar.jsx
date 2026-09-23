import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, LogOut } from 'lucide-react';

export default function Navbar({ onNavigateToAdmin, onLogout }) {
  const { isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-5 py-2.5 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200/80 shadow-xs p-1 flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-slate-100">
            <img
              src="/logo.png"
              alt="Handayani Korden"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 leading-none">
                HANDAYANI KORDEN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
              Katalog & Management Stok
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* User Role Status Badge */}
          {isAdmin ? (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={onNavigateToAdmin}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-orange-200 bg-orange-50 text-[#d96b27] text-xs font-bold active-press shadow-xs"
                title="Panel Admin"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#d96b27]" />
                <span className="truncate max-w-[70px] sm:max-w-none">Admin</span>
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 active-press"
                title="Logout Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Teknisi</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

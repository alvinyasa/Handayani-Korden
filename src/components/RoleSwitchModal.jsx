import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Shield, UserCheck, ShieldAlert, KeyRound, Check, ArrowRight } from 'lucide-react';

export default function RoleSwitchModal({ onClose }) {
  const { user, availableUsers, switchRole, loginWithPin } = useAuth();
  const [selectedRole, setSelectedRole] = useState(user?.role || 'teknisi');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'teknisi',
      title: 'Teknisi Lapangan',
      sub: 'Akses Lihat & Cari',
      desc: 'Dapat melihat ketersediaan stok ready/kosong secara real-time di lapangan, mencari katalog, serta melihat referensi foto model & hasil pemasangan untuk customer.',
      icon: UserCheck,
      color: 'blue',
      requiresPin: false,
    },
    {
      id: 'spv',
      title: 'Supervisor (SPV)',
      sub: 'Akses Penuh CRUD',
      desc: 'Dapat mengubah status stok Ready/Kosong (1-tap toggle), menambah katalog/motif/warna baru, mengunggah foto model korden & foto pemasangan.',
      icon: Shield,
      color: 'emerald',
      requiresPin: true,
      defaultPin: '5678',
    },
    {
      id: 'kepala_toko',
      title: 'Kepala Toko',
      sub: 'Akses Penuh Admin',
      desc: 'Hak akses tertinggi untuk seluruh manajemen operasional stok kain, model korden, foto pemasangan, dan penghapusan data.',
      icon: ShieldAlert,
      color: 'purple',
      requiresPin: true,
      defaultPin: '9999',
    },
  ];

  const handleQuickSwitch = async (roleObj) => {
    setSelectedRole(roleObj.id);
    if (!roleObj.requiresPin) {
      setLoading(true);
      setError('');
      const res = await switchRole(roleObj.id);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.message);
      }
    } else {
      // Pre-fill PIN for quick demo convenience if user wishes
      setPin(roleObj.defaultPin || '');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await loginWithPin(selectedRole, pin);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'PIN salah');
    }
  };

  const activeRoleObj = roles.find((r) => r.id === selectedRole);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">Ganti Peran Pengguna</h3>
            <p className="text-xs text-slate-400">Pilih mode akses sesuai tugas Anda</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
              {error}
            </div>
          )}

          {/* Role Cards */}
          <div className="space-y-2">
            {roles.map((r) => {
              const isSelected = selectedRole === r.id;
              const isCurrent = user?.role === r.id;
              const Icon = r.icon;

              return (
                <div
                  key={r.id}
                  onClick={() => handleQuickSwitch(r)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all active-press ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 shadow-sm ring-1 ring-slate-900/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          r.id === 'kepala_toko'
                            ? 'bg-purple-100 text-purple-700'
                            : r.id === 'spv'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-slate-900">{r.title}</h4>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                              Aktif
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{r.sub}</span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{r.desc}</p>
                </div>
              );
            })}
          </div>

          {/* PIN Input if selected role requires authentication */}
          {activeRoleObj?.requiresPin && (
            <form onSubmit={handleLoginSubmit} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5 mt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span>Masukkan PIN {activeRoleObj.title}</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  (Default demo: <span className="font-bold text-emerald-600">{activeRoleObj.defaultPin}</span>)
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  autoFocus
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Ketik PIN..."
                  className="flex-1 text-center font-mono font-bold tracking-widest text-base p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
                <button
                  type="submit"
                  disabled={loading || !pin}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md active-press disabled:opacity-50 flex items-center space-x-1"
                >
                  <span>Masuk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

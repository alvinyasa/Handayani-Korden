import React, { useState, useMemo } from 'react';
import { X, Layers, Sparkles, Table2, Tag, Palette } from 'lucide-react';
import { parseCodeRange } from '../utils/codeParser';

export default function AddCatalogModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [initialMotifs, setInitialMotifs] = useState('A');
  const [initialColors, setInitialColors] = useState('1-10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parsedColors = useMemo(() => parseCodeRange(initialColors), [initialColors]);
  const parsedMotifs = useMemo(() => parseCodeRange(initialMotifs).map((m) => m.toUpperCase()), [initialMotifs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama katalog wajib diisi');
      return;
    }

    if (parsedMotifs.length === 0) {
      setError('Minimal isi 1 kode motif (misal: A)');
      return;
    }

    if (parsedColors.length === 0) {
      setError('Minimal isi 1 nomor seri warna (misal: 1-10)');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('description', description.trim());
    formData.append('initial_motifs', parsedMotifs.join(', '));
    formData.append('initial_colors', parsedColors.join(', '));

    const res = await onSubmit(formData);
    setLoading(false);

    if (res && !res.success) {
      setError(res.message || 'Gagal menambahkan katalog');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-backdrop">
      <div className="w-full max-w-lg bg-white dark:bg-[#1E1E1E] rounded-t-[28px] sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200/80 dark:border-[#444444] overflow-hidden animate-bottom-sheet max-h-[92vh] flex flex-col">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-[#333333] rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-[#444444] bg-white dark:bg-[#1E1E1E] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-[#d96b27] dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200/60 dark:border-orange-900/50">
              <Table2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-[#E0E0E0] leading-tight">
                Tambah Katalog Kain Baru
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#888888] font-medium">
                Atur struktur baris motif & nomor warna tabel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-[#E0E0E0] p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#333333] transition-colors active-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800/60">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#B0B0B0] mb-1.5">
              Nama Katalog Kain <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: ARONA, MAROKO, SANTORINI..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-50 dark:bg-[#2A2A2A] text-slate-900 dark:text-[#E0E0E0] placeholder:text-slate-400 dark:placeholder:text-[#888888] focus:bg-white dark:focus:bg-[#2A2A2A] focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none uppercase font-bold transition-all"
            />
          </div>

          {/* Description / Subtitle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#B0B0B0] mb-1.5">
              Keterangan / Jenis Kain <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Blackout 100%, Dimout Lebar 280cm, Vitrase..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-50 dark:bg-[#2A2A2A] text-slate-900 dark:text-[#E0E0E0] placeholder:text-slate-400 dark:placeholder:text-[#888888] focus:bg-white dark:focus:bg-[#2A2A2A] focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none font-medium transition-all"
            />
          </div>

          {/* Section: Table Setup (Motifs & Colors) */}
          <div className="p-4 bg-slate-50 dark:bg-[#2A2A2A] rounded-2xl border border-slate-200/80 dark:border-[#444444] space-y-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#d96b27] dark:text-orange-400" />
              <span className="font-bold text-xs text-slate-800 dark:text-[#E0E0E0]">
                Desain Format Tabel Stok
              </span>
            </div>

            {/* Motifs configuration */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-[#B0B0B0]">
                  Baris Kode Motif:
                </label>
                <span className="text-[10px] text-slate-400 dark:text-[#888888]">
                  Default: 1 motif (A)
                </span>
              </div>

              {/* Motif Presets */}
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                {[
                  { label: 'Hanya Motif A', val: 'A' },
                  { label: 'Motif A & B', val: 'A, B' },
                  { label: 'Motif A, B, C', val: 'A, B, C' },
                  { label: 'Motif 1', val: '1' },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setInitialMotifs(p.val)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border shrink-0 transition-all active-press ${
                      initialMotifs === p.val
                        ? 'bg-[#d96b27] text-white border-[#d96b27]'
                        : 'bg-white dark:bg-[#1E1E1E] text-slate-700 dark:text-[#B0B0B0] border-slate-200 dark:border-[#444444] hover:border-orange-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={initialMotifs}
                onChange={(e) => setInitialMotifs(e.target.value.toUpperCase())}
                placeholder="Contoh: A atau A, B atau A-C"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#444444] bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-[#E0E0E0] placeholder:text-slate-400 font-mono font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none uppercase"
              />

              {parsedMotifs.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {parsedMotifs.map((m) => (
                    <span
                      key={m}
                      className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-[#333333] text-white font-mono text-[10px] font-bold"
                    >
                      Motif {m}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Colors configuration */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-[#B0B0B0]">
                  Kolom Nomor Seri Warna:
                </label>
                <span className="text-[10px] text-slate-400 dark:text-[#888888]">
                  Bisa rentang: 1-10
                </span>
              </div>

              {/* Color Presets */}
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                {[
                  { label: '1-10', val: '1-10' },
                  { label: '1-12', val: '1-12' },
                  { label: '1-15', val: '1-15' },
                  { label: '1-20', val: '1-20' },
                  { label: '1-5', val: '1-5' },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setInitialColors(p.val)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border shrink-0 transition-all active-press ${
                      initialColors === p.val
                        ? 'bg-[#d96b27] text-white border-[#d96b27]'
                        : 'bg-white dark:bg-[#1E1E1E] text-slate-700 dark:text-[#B0B0B0] border-slate-200 dark:border-[#444444] hover:border-orange-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={initialColors}
                onChange={(e) => setInitialColors(e.target.value)}
                placeholder="Contoh: 1-10 atau 1, 2, 3"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#444444] bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-[#E0E0E0] placeholder:text-slate-400 font-mono font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none"
              />

              {parsedColors.length > 0 && (
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pt-1">
                  {parsedColors.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[10px] font-bold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Table structure summary */}
            <div className="p-2.5 rounded-xl bg-orange-50/80 dark:bg-[#1E1E1E] border border-orange-200/80 dark:border-[#444444] flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#d96b27] dark:text-orange-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  Ukuran Tabel: {parsedMotifs.length} Motif × {parsedColors.length} Warna
                </span>
              </span>
              <span className="font-semibold text-slate-500 dark:text-[#888888] text-[10px]">
                {parsedMotifs.length * parsedColors.length} sel stok
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-[#444444] text-slate-700 dark:text-[#B0B0B0] text-xs font-bold active-press transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || parsedMotifs.length === 0 || parsedColors.length === 0}
              className="flex-1 py-3 px-4 rounded-xl bg-[#d96b27] hover:bg-[#c25a1d] text-white text-xs font-bold shadow-md shadow-orange-600/20 active-press disabled:opacity-50 transition-colors flex items-center justify-center space-x-1.5"
            >
              <Table2 className="w-4 h-4" />
              <span>{loading ? 'Memproses...' : 'Buat & Buka Edit Tabel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

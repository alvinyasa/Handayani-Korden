import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Layers,
  Palette,
  Edit3,
  Check,
  Tag,
  Sparkles
} from 'lucide-react';
import { parseCodeRange } from '../utils/codeParser';

export default function EditCatalogModal({
  catalog,
  onClose,
  onUpdateCatalogInfo,
  onAddMotif,
  onDeleteMotif,
  onAddColor,
  onDeleteColor,
  onBulkSetStock,
}) {
  if (!catalog) return null;

  // Active Tab inside modal: 'info' | 'motifs' | 'colors' | 'quick_stock'
  const [activeTab, setActiveTab] = useState('info');

  // Info Tab fields
  const [name, setName] = useState(catalog.name || '');
  const [subtitle, setSubtitle] = useState(catalog.subtitle || catalog.description || '');
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // New Motif fields
  const [newMotifCode, setNewMotifCode] = useState('');
  const [newMotifName, setNewMotifName] = useState('');
  const [isAddingMotif, setIsAddingMotif] = useState(false);
  const [motifError, setMotifError] = useState('');

  // New Color fields
  const [newColorCode, setNewColorCode] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [colorError, setColorError] = useState('');

  const [message, setMessage] = useState('');

  // Save Catalog Info
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSavingInfo(true);
    setMessage('');

    const res = await onUpdateCatalogInfo(catalog.id, {
      name: name.trim(),
      subtitle: subtitle.trim(),
      description: subtitle.trim(),
      last_updated_date: new Date().toISOString().split('T')[0],
    });

    setIsSavingInfo(false);
    if (res.success) {
      setMessage('Informasi katalog berhasil diperbarui!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Natural sorting for existing motifs and colors
  const sortedMotifs = useMemo(() => {
    return (catalog.motifs || []).slice().sort((a, b) =>
      a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [catalog.motifs]);

  const sortedColors = useMemo(() => {
    return (catalog.colors || []).slice().sort((a, b) =>
      a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [catalog.colors]);

  // Parsed Motifs preview
  const parsedMotifCodes = useMemo(() => {
    return parseCodeRange(newMotifCode).map((m) => m.toUpperCase());
  }, [newMotifCode]);

  const existingMotifSet = useMemo(() => {
    return new Set((catalog.motifs || []).map((m) => String(m.code).toUpperCase()));
  }, [catalog.motifs]);

  const newUniqueMotifs = useMemo(() => {
    return parsedMotifCodes.filter((m) => !existingMotifSet.has(m));
  }, [parsedMotifCodes, existingMotifSet]);

  // Parsed Colors preview
  const parsedColorCodes = useMemo(() => {
    return parseCodeRange(newColorCode);
  }, [newColorCode]);

  const existingColorSet = useMemo(() => {
    return new Set((catalog.colors || []).map((c) => String(c.code).toLowerCase()));
  }, [catalog.colors]);

  const newUniqueColors = useMemo(() => {
    return parsedColorCodes.filter((c) => !existingColorSet.has(c.toLowerCase()));
  }, [parsedColorCodes, existingColorSet]);

  // Add New Motif (Single / Batch)
  const handleAddMotifSubmit = async (e) => {
    e.preventDefault();
    if (parsedMotifCodes.length === 0) {
      setMotifError('Kode motif wajib diisi (misal: C atau C, D atau C-E)');
      return;
    }
    if (newUniqueMotifs.length === 0) {
      setMotifError('Semua kode motif tersebut sudah ada di katalog ini');
      return;
    }
    setMotifError('');
    setIsAddingMotif(true);

    const res = await onAddMotif(catalog.id, {
      code: newMotifCode.trim(),
      codes: newUniqueMotifs,
      name: newMotifName.trim() || undefined,
    });

    setIsAddingMotif(false);
    if (res && res.success) {
      setNewMotifCode('');
      setNewMotifName('');
      setMessage(res.message || `${newUniqueMotifs.length} kode motif berhasil ditambahkan!`);
      setTimeout(() => setMessage(''), 3500);
    } else {
      setMotifError(res?.message || 'Gagal menambahkan motif');
    }
  };

  // Add New Color (Single / Batch Range)
  const handleAddColorSubmit = async (e) => {
    e.preventDefault();
    if (parsedColorCodes.length === 0) {
      setColorError('Nomor warna wajib diisi (misal: 1-10 atau 9, 10)');
      return;
    }
    if (newUniqueColors.length === 0) {
      setColorError('Semua nomor warna tersebut sudah ada di katalog ini');
      return;
    }
    setColorError('');
    setIsAddingColor(true);

    const res = await onAddColor(catalog.id, {
      code: newColorCode.trim(),
      codes: newUniqueColors,
      name: newColorName.trim() || undefined,
      hex_code: '#cbd5e1',
    });

    setIsAddingColor(false);
    if (res && res.success) {
      setNewColorCode('');
      setNewColorName('');
      setMessage(res.message || `${newUniqueColors.length} nomor seri warna berhasil ditambahkan!`);
      setTimeout(() => setMessage(''), 3500);
    } else {
      setColorError(res?.message || 'Gagal menambahkan warna');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-backdrop">
      <div className="w-full max-w-lg bg-white dark:bg-[#1E1E1E] rounded-t-[28px] sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200/80 dark:border-[#444444] overflow-hidden animate-bottom-sheet max-h-[92vh] flex flex-col">
        {/* Mobile Swipe Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-[#333333] rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-[#444444] bg-white dark:bg-[#1E1E1E] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-[#d96b27] dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200/60 dark:border-orange-900/50">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-[#E0E0E0] leading-tight">
                Kelola Tabel: {catalog.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#888888] font-medium">
                Edit info, tambah kode motif & nomor warna
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

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 dark:border-[#444444] bg-slate-50/80 dark:bg-[#1E1E1E] px-3 pt-2 text-xs font-bold overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-[#d96b27] text-[#d96b27] dark:text-orange-400 bg-white dark:bg-[#1E1E1E]'
                : 'border-transparent text-slate-500 dark:text-[#888888] hover:text-slate-800 dark:hover:text-[#E0E0E0]'
            }`}
          >
            Info Tabel
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('motifs')}
            className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'motifs'
                ? 'border-[#d96b27] text-[#d96b27] dark:text-orange-400 bg-white dark:bg-[#1E1E1E]'
                : 'border-transparent text-slate-500 dark:text-[#888888] hover:text-slate-800 dark:hover:text-[#E0E0E0]'
            }`}
          >
            <span>+ Kode Motif</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-[#2A2A2A] text-[10px]">
              {catalog.motifs?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'colors'
                ? 'border-[#d96b27] text-[#d96b27] dark:text-orange-400 bg-white dark:bg-[#1E1E1E]'
                : 'border-transparent text-slate-500 dark:text-[#888888] hover:text-slate-800 dark:hover:text-[#E0E0E0]'
            }`}
          >
            <span>+ Nomor Warna</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-[#2A2A2A] text-[10px]">
              {catalog.colors?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quick_stock')}
            className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'quick_stock'
                ? 'border-[#d96b27] text-[#d96b27] dark:text-orange-400 bg-white dark:bg-[#1E1E1E]'
                : 'border-transparent text-slate-500 dark:text-[#888888] hover:text-slate-800 dark:hover:text-[#E0E0E0]'
            }`}
          >
            Aksi Stok
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {message && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/60 flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* TAB 1: INFO TABEL */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#B0B0B0] mb-1.5">
                  Nama Katalog
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: MAROKO, BERLIN, HAWAI"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-50 dark:bg-[#2A2A2A] text-slate-900 dark:text-[#E0E0E0] placeholder:text-slate-400 dark:placeholder:text-[#888888] focus:bg-white dark:focus:bg-[#2A2A2A] focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none uppercase font-bold transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#B0B0B0] mb-1.5">
                  Keterangan / Jenis Kain (Subtitle)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Contoh: Blackout / Dimout, Vitrase & Sheer"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-50 dark:bg-[#2A2A2A] text-slate-900 dark:text-[#E0E0E0] placeholder:text-slate-400 dark:placeholder:text-[#888888] focus:bg-white dark:focus:bg-[#2A2A2A] focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none font-medium transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingInfo}
                  className="px-5 py-3 text-xs font-bold text-white bg-[#d96b27] hover:bg-[#c25a1d] rounded-xl shadow-md shadow-orange-600/20 flex items-center space-x-1.5 active-press transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingInfo ? 'Menyimpan...' : 'Simpan Info Katalog'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: KELOLA MOTIF */}
          {activeTab === 'motifs' && (
            <div className="space-y-4">
              {motifError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800/60">
                  {motifError}
                </div>
              )}

              {/* Form Tambah Kode Motif Baru (Single / Batch) */}
              <form onSubmit={handleAddMotifSubmit} className="p-4 bg-slate-50 dark:bg-[#2A2A2A] rounded-2xl border border-slate-200/80 dark:border-[#444444] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-800 dark:text-[#E0E0E0] flex items-center space-x-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#d96b27] dark:text-orange-400" />
                    <span>Tambah Kode Motif Baru:</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-[#888888]">Bisa rentang: C-E atau C, D</span>
                </div>

                {/* Quick Presets for Motifs */}
                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] text-slate-400 dark:text-[#888888] font-bold shrink-0">Preset:</span>
                  {['B', 'C, D', 'B, C, D', 'C-E'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewMotifCode(preset)}
                      className="px-2 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-[#d96b27] dark:text-orange-400 text-[10px] font-bold border border-orange-200/80 dark:border-orange-800/40 shrink-0 transition-all active-press"
                    >
                      + Motif {preset}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="text"
                      required
                      value={newMotifCode}
                      onChange={(e) => setNewMotifCode(e.target.value.toUpperCase())}
                      placeholder="Kode (C, D)"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#444444] uppercase font-mono font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none text-center bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-[#E0E0E0]"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="text"
                      value={newMotifName}
                      onChange={(e) => setNewMotifName(e.target.value)}
                      placeholder="Keterangan opsional (untuk 1 motif)"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#444444] focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-[#E0E0E0] font-medium"
                    />
                  </div>
                </div>

                {/* Live Preview Motifs to add */}
                {parsedMotifCodes.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-[#1E1E1E] border border-orange-200/80 dark:border-[#444444] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#d96b27] dark:text-orange-400 flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Akan menambahkan {newUniqueMotifs.length} kode motif:</span>
                      </span>
                      {parsedMotifCodes.length - newUniqueMotifs.length > 0 && (
                        <span className="text-[10px] text-slate-400 dark:text-[#888888]">
                          ({parsedMotifCodes.length - newUniqueMotifs.length} sudah ada)
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {parsedMotifCodes.map((code) => {
                        const isExisting = existingMotifSet.has(code);
                        return (
                          <span
                            key={code}
                            className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                              isExisting
                                ? 'bg-slate-200 dark:bg-[#333333] text-slate-400 dark:text-[#888888] line-through'
                                : 'bg-slate-900 dark:bg-[#333333] text-white border border-slate-700'
                            }`}
                          >
                            Motif {code}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAddingMotif || (parsedMotifCodes.length > 0 && newUniqueMotifs.length === 0)}
                  className="w-full py-2.5 bg-[#d96b27] hover:bg-[#c25a1d] text-white text-xs font-bold rounded-xl active-press shrink-0 shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isAddingMotif
                      ? 'Menambahkan...'
                      : newUniqueMotifs.length > 1
                      ? `Tambahkan ${newUniqueMotifs.length} Kode Motif Sekaligus`
                      : 'Tambah Kode Motif'}
                  </span>
                </button>
              </form>

              {/* List Motif Aktif (Naturally Sorted: A, B, C...) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#B0B0B0] mb-2">
                  Daftar Kode Motif Aktif ({sortedMotifs.length}):
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {sortedMotifs.map((motif) => (
                    <div
                      key={motif.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#2A2A2A] border border-slate-200/80 dark:border-[#444444] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-[#333333] text-white font-mono font-bold flex items-center justify-center text-xs">
                          {motif.code}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-[#E0E0E0]">{motif.name || `Motif ${motif.code}`}</div>
                          {motif.description && (
                            <div className="text-[10px] text-slate-400 dark:text-[#888888]">{motif.description}</div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteMotif(motif.id, motif.code)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title={`Hapus Motif ${motif.code}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KELOLA WARNA */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              {colorError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800/60">
                  {colorError}
                </div>
              )}

              {/* Form Tambah Warna Baru (Single / Batch Range) */}
              <form onSubmit={handleAddColorSubmit} className="p-4 bg-slate-50 dark:bg-[#2A2A2A] rounded-2xl border border-slate-200/80 dark:border-[#444444] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-800 dark:text-[#E0E0E0] flex items-center space-x-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#d96b27] dark:text-orange-400" />
                    <span>Tambah Nomor Seri Warna:</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-[#888888]">Bisa rentang: 1-10 atau 1, 2, 3</span>
                </div>

                {/* Quick Presets for Numbers */}
                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] text-slate-400 dark:text-[#888888] font-bold shrink-0">Preset Cepat:</span>
                  {[
                    { label: '1 s/d 10', value: '1-10' },
                    { label: '1 s/d 12', value: '1-12' },
                    { label: '1 s/d 15', value: '1-15' },
                    { label: '1 s/d 20', value: '1-20' },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setNewColorCode(preset.value)}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-[#d96b27] dark:text-orange-400 text-[10px] font-bold border border-orange-200/80 dark:border-orange-800/40 shrink-0 transition-all active-press"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="text"
                      required
                      value={newColorCode}
                      onChange={(e) => setNewColorCode(e.target.value)}
                      placeholder="Nomor (1-10)"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#444444] font-mono font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none text-center bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-[#E0E0E0]"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="Keterangan opsional (untuk 1 warna)"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#444444] focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-[#E0E0E0] font-medium"
                    />
                  </div>
                </div>

                {/* Live Preview Colors to add */}
                {parsedColorCodes.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-[#1E1E1E] border border-orange-200/80 dark:border-[#444444] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#d96b27] dark:text-orange-400 flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Akan menambahkan {newUniqueColors.length} nomor seri baru:</span>
                      </span>
                      {parsedColorCodes.length - newUniqueColors.length > 0 && (
                        <span className="text-[10px] text-slate-400 dark:text-[#888888]">
                          ({parsedColorCodes.length - newUniqueColors.length} sudah ada)
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {parsedColorCodes.map((code) => {
                        const isExisting = existingColorSet.has(code.toLowerCase());
                        return (
                          <span
                            key={code}
                            className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                              isExisting
                                ? 'bg-slate-200 dark:bg-[#333333] text-slate-400 dark:text-[#888888] line-through'
                                : 'bg-emerald-600 text-white shadow-xs'
                            }`}
                          >
                            {code}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAddingColor || (parsedColorCodes.length > 0 && newUniqueColors.length === 0)}
                  className="w-full py-2.5 bg-[#d96b27] hover:bg-[#c25a1d] text-white text-xs font-bold rounded-xl active-press shrink-0 shadow-md shadow-orange-600/20 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isAddingColor
                      ? 'Menambahkan...'
                      : newUniqueColors.length > 1
                      ? `Tambahkan ${newUniqueColors.length} Nomor Sekaligus`
                      : 'Tambah Nomor Warna'}
                  </span>
                </button>
              </form>

              {/* List Warna Aktif (Naturally Sorted: 1, 2, ... 9, 10, 11, 12, 13) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#B0B0B0] mb-2">
                  Daftar Nomor Seri Warna Aktif ({sortedColors.length}):
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {sortedColors.map((col) => (
                    <div
                      key={col.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#2A2A2A] border border-slate-200/80 dark:border-[#444444] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-mono font-bold flex items-center justify-center text-xs">
                          {col.code}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-[#E0E0E0] truncate">
                          {col.name || `Warna ${col.code}`}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteColor(col.id, col.code)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                        title={`Hapus Warna ${col.code}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AKSI CEPAT STOK */}
          {activeTab === 'quick_stock' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-[#2A2A2A] rounded-2xl border border-slate-200 dark:border-[#444444] text-slate-600 dark:text-[#B0B0B0]">
                Ubah ketersediaan seluruh varian pada katalog <strong>{catalog.name}</strong> secara instan:
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={async () => {
                    await onBulkSetStock(catalog.id, true);
                    setMessage(`Semua varian katalog ${catalog.name} diset READY (✓)!`);
                    setTimeout(() => setMessage(''), 3000);
                  }}
                  className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center space-x-1.5 shadow-sm active-press transition-colors"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Set Semua READY (✓)</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await onBulkSetStock(catalog.id, false);
                    setMessage(`Semua varian katalog ${catalog.name} diset KOSONG (✗)!`);
                    setTimeout(() => setMessage(''), 3000);
                  }}
                  className="py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center space-x-1.5 shadow-sm active-press transition-colors"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>Set Semua KOSONG (✗)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#1E1E1E] border-t border-slate-100 dark:border-[#444444] flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-[#B0B0B0] bg-white dark:bg-[#2A2A2A] hover:bg-slate-100 dark:hover:bg-[#444444] border border-slate-200 dark:border-[#444444] rounded-xl active-press transition-colors"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

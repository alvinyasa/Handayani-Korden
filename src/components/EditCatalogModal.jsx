import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Layers,
  Palette,
  Edit3,
  Check,
  MapPin,
  Tag
} from 'lucide-react';

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
  const [rackLocation, setRackLocation] = useState(catalog.rack_location || '');
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
      rack_location: rackLocation.trim(),
      last_updated_date: new Date().toISOString().split('T')[0],
    });

    setIsSavingInfo(false);
    if (res.success) {
      setMessage('Informasi katalog berhasil diperbarui!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Add New Motif (Kode Baru)
  const handleAddMotifSubmit = async (e) => {
    e.preventDefault();
    if (!newMotifCode.trim()) {
      setMotifError('Kode motif wajib diisi (misal: C, D)');
      return;
    }
    setMotifError('');
    setIsAddingMotif(true);

    const res = await onAddMotif(catalog.id, {
      code: newMotifCode.trim(),
      name: newMotifName.trim() || `Motif ${newMotifCode.trim()}`,
    });

    setIsAddingMotif(false);
    if (res && res.success) {
      setNewMotifCode('');
      setNewMotifName('');
      setMessage(`Kode motif ${newMotifCode.toUpperCase()} berhasil ditambahkan!`);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMotifError(res?.message || 'Gagal menambahkan motif');
    }
  };

  // Add New Color (Nomor Seri Baru)
  const handleAddColorSubmit = async (e) => {
    e.preventDefault();
    if (!newColorCode.trim()) {
      setColorError('Nomor warna wajib diisi (misal: 9, 10)');
      return;
    }
    setColorError('');
    setIsAddingColor(true);

    const res = await onAddColor(catalog.id, {
      code: newColorCode.trim(),
      name: newColorName.trim() || `Warna ${newColorCode.trim()}`,
      hex_code: '#cbd5e1',
    });

    setIsAddingColor(false);
    if (res && res.success) {
      setNewColorCode('');
      setNewColorName('');
      setMessage(`Nomor seri warna ${newColorCode} berhasil ditambahkan!`);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setColorError(res?.message || 'Gagal menambahkan warna');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-backdrop">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-bottom-sheet max-h-[92vh] flex flex-col">
        {/* Mobile Swipe Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-[#d96b27] dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200/60 dark:border-orange-900/50">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                Kelola Tabel: {catalog.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Edit info, tambah kode motif & nomor warna
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 px-3 pt-2 text-xs font-bold overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-[#d96b27] text-[#d96b27] dark:text-orange-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Info Tabel
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('motifs')}
            className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'motifs'
                ? 'border-[#d96b27] text-[#d96b27] dark:text-orange-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>+ Kode Motif</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px]">
              {catalog.motifs?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'colors'
                ? 'border-[#d96b27] text-[#d96b27] dark:text-orange-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>+ Nomor Warna</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px]">
              {catalog.colors?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quick_stock')}
            className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'quick_stock'
                ? 'border-[#d96b27] text-[#d96b27] dark:text-orange-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Katalog
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: MAROKO, BERLIN, HAWAI"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none uppercase font-bold transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Keterangan / Jenis Kain (Subtitle)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Contoh: Blackout / Dimout, Vitrase & Sheer"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Lokasi Rak Gudang
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rackLocation}
                    onChange={(e) => setRackLocation(e.target.value)}
                    placeholder="Contoh: Rak M-01, Rak D-02"
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none font-medium transition-all"
                  />
                </div>
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

              {/* Form Tambah Kode Motif Baru */}
              <form onSubmit={handleAddMotifSubmit} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#d96b27] dark:text-orange-400" />
                  <span>Tambah Kode Motif Baru (Contoh: C, D):</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={newMotifCode}
                      onChange={(e) => setNewMotifCode(e.target.value.toUpperCase())}
                      placeholder="Kode (C)"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 uppercase font-mono font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="col-span-2 flex space-x-1.5">
                    <input
                      type="text"
                      value={newMotifName}
                      onChange={(e) => setNewMotifName(e.target.value)}
                      placeholder="Keterangan (Opsional)"
                      className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                    <button
                      type="submit"
                      disabled={isAddingMotif}
                      className="px-4 py-2.5 bg-[#d96b27] hover:bg-[#c25a1d] text-white text-xs font-bold rounded-xl active-press shrink-0 shadow-xs transition-colors"
                    >
                      {isAddingMotif ? '...' : '+ Tambah'}
                    </button>
                  </div>
                </div>
              </form>

              {/* List Motif Aktif */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Daftar Kode Motif Aktif ({catalog.motifs?.length || 0}):
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {catalog.motifs?.map((motif) => (
                    <div
                      key={motif.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-700 text-white font-mono font-bold flex items-center justify-center text-xs">
                          {motif.code}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{motif.name || `Motif ${motif.code}`}</div>
                          {motif.description && (
                            <div className="text-[10px] text-slate-400 dark:text-slate-400">{motif.description}</div>
                          )}
                        </div>
                      </div>

                      {catalog.motifs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteMotif(motif.id, motif.code)}
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Hapus Motif"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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

              {/* Form Tambah Warna Baru */}
              <form onSubmit={handleAddColorSubmit} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#d96b27] dark:text-orange-400" />
                  <span>Tambah Nomor Seri Warna Baru (Contoh: 9, 10):</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="text"
                      required
                      value={newColorCode}
                      onChange={(e) => setNewColorCode(e.target.value)}
                      placeholder="Nomor (9)"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="col-span-2 flex space-x-1.5">
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="Nama warna (Opsional)"
                      className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                    <button
                      type="submit"
                      disabled={isAddingColor}
                      className="px-4 py-2.5 bg-[#d96b27] hover:bg-[#c25a1d] text-white text-xs font-bold rounded-xl active-press shrink-0 shadow-xs transition-colors"
                    >
                      {isAddingColor ? '...' : '+ Tambah'}
                    </button>
                  </div>
                </div>
              </form>

              {/* List Warna Aktif */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Daftar Nomor Seri Warna Aktif ({catalog.colors?.length || 0}):
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {catalog.colors?.map((col) => (
                    <div
                      key={col.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-mono font-bold flex items-center justify-center text-xs">
                          {col.code}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {col.name || `Warna ${col.code}`}
                        </span>
                      </div>

                      {catalog.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteColor(col.id, col.code)}
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                          title="Hapus Warna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AKSI CEPAT STOK */}
          {activeTab === 'quick_stock' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
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
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl active-press transition-colors"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

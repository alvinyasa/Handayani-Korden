import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Layers,
  Palette,
  Edit3,
  Sparkles,
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
      code: newMotifCode.trim().toUpperCase(),
      name: newMotifName.trim() || `Motif ${newMotifCode.trim().toUpperCase()}`,
    });

    setIsAddingMotif(false);
    if (res && res.success) {
      setNewMotifCode('');
      setNewMotifName('');
      setMessage(`Motif baru ${newMotifCode.trim().toUpperCase()} berhasil ditambahkan ke tabel!`);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMotifError(res?.message || 'Gagal menambahkan motif');
    }
  };

  // Add New Color (Warna / Nomor Seri Baru)
  const handleAddColorSubmit = async (e) => {
    e.preventDefault();
    if (!newColorCode.trim()) {
      setColorError('Nomor seri / kode warna wajib diisi (misal: 9, 10)');
      return;
    }
    setColorError('');
    setIsAddingColor(true);

    const res = await onAddColor(catalog.id, {
      code: newColorCode.trim(),
      name: newColorName.trim() || `Warna ${newColorCode.trim()}`,
    });

    setIsAddingColor(false);
    if (res && res.success) {
      setNewColorCode('');
      setNewColorName('');
      setMessage(`Nomor seri warna ${newColorCode.trim()} berhasil ditambahkan ke tabel!`);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setColorError(res?.message || 'Gagal menambahkan warna');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="p-4 bg-[#d96b27] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-none">
                Kelola Tabel: {catalog.name}
              </h3>
              <p className="text-[11px] text-white/80 mt-0.5">
                Edit info, tambah kode motif & nomor seri warna
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-2 pt-2 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-3.5 py-2 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-[#d96b27] text-[#d96b27] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Info Tabel
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('motifs')}
            className={`px-3.5 py-2 rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'motifs'
                ? 'border-[#d96b27] text-[#d96b27] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>+ Kode Motif</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-[10px]">
              {catalog.motifs?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`px-3.5 py-2 rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'colors'
                ? 'border-[#d96b27] text-[#d96b27] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>+ Nomor Warna</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-[10px]">
              {catalog.colors?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quick_stock')}
            className={`px-3.5 py-2 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'quick_stock'
                ? 'border-[#d96b27] text-[#d96b27] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Aksi Stok
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {message && (
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center space-x-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* TAB 1: INFO TABEL */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveInfo} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Katalog
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: MAROKO, BERLIN, HAWAI"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#d96b27] focus:outline-none uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan / Jenis Kain (Subtitle)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Contoh: Blackout / Dimout, Vitrase & Sheer"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#d96b27] focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lokasi Rak Gudang
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rackLocation}
                    onChange={(e) => setRackLocation(e.target.value)}
                    placeholder="Contoh: Rak M-01, Rak D-02"
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#d96b27] focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingInfo}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#d96b27] hover:bg-[#c25a1d] rounded-xl shadow-md flex items-center space-x-1.5 active-press"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingInfo ? 'Menyimpan...' : 'Simpan Info Katalog'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: KELOLA MOTIF (KODE BARU) */}
          {activeTab === 'motifs' && (
            <div className="space-y-4">
              {motifError && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                  {motifError}
                </div>
              )}

              {/* Form Tambah Kode Motif Baru */}
              <form onSubmit={handleAddMotifSubmit} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#d96b27]" />
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
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 uppercase font-mono font-bold focus:ring-2 focus:ring-[#d96b27] focus:outline-none text-center bg-white"
                    />
                  </div>

                  <div className="col-span-2 flex space-x-1.5">
                    <input
                      type="text"
                      value={newMotifName}
                      onChange={(e) => setNewMotifName(e.target.value)}
                      placeholder="Keterangan (Opsional)"
                      className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#d96b27] focus:outline-none bg-white font-medium"
                    />
                    <button
                      type="submit"
                      disabled={isAddingMotif}
                      className="px-4 py-2.5 bg-[#d96b27] hover:bg-[#c25a1d] text-white text-xs font-bold rounded-xl active-press shrink-0 shadow-xs"
                    >
                      {isAddingMotif ? '...' : '+ Tambah'}
                    </button>
                  </div>
                </div>
              </form>

              {/* List Motif Aktif */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Daftar Kode Motif Aktif di Tabel ({catalog.motifs?.length || 0}):
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {catalog.motifs?.map((motif) => (
                    <div
                      key={motif.id}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs">
                          {motif.code}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{motif.name || `Motif ${motif.code}`}</div>
                          {motif.description && (
                            <div className="text-[10px] text-slate-400">{motif.description}</div>
                          )}
                        </div>
                      </div>

                      {catalog.motifs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteMotif(motif.id, motif.code)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
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

          {/* TAB 3: KELOLA WARNA (NOMOR SERI BARU) */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              {colorError && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                  {colorError}
                </div>
              )}

              {/* Form Tambah Warna Baru */}
              <form onSubmit={handleAddColorSubmit} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#d96b27]" />
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
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-[#d96b27] focus:outline-none text-center bg-white"
                    />
                  </div>

                  <div className="col-span-2 flex space-x-1.5">
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="Nama warna (Opsional)"
                      className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#d96b27] focus:outline-none bg-white font-medium"
                    />
                    <button
                      type="submit"
                      disabled={isAddingColor}
                      className="px-4 py-2.5 bg-[#d96b27] hover:bg-[#c25a1d] text-white text-xs font-bold rounded-xl active-press shrink-0 shadow-xs"
                    >
                      {isAddingColor ? '...' : '+ Tambah'}
                    </button>
                  </div>
                </div>
              </form>

              {/* List Warna Aktif */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Daftar Nomor Seri Warna Aktif di Tabel ({catalog.colors?.length || 0}):
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                  {catalog.colors?.map((col) => (
                    <div
                      key={col.id}
                      className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-900 font-mono font-bold flex items-center justify-center text-xs">
                          {col.code}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">
                          {col.name || `Warna ${col.code}`}
                        </span>
                      </div>

                      {catalog.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteColor(col.id, col.code)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
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
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600">
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
                  className="py-3 px-3 rounded-xl bg-[#1c7446] hover:bg-[#166039] text-white font-bold flex items-center justify-center space-x-1.5 shadow-sm active-press"
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
                  className="py-3 px-3 rounded-xl bg-[#a6343f] hover:bg-[#8f2832] text-white font-bold flex items-center justify-center space-x-1.5 shadow-sm active-press"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>Set Semua KOSONG (✗)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

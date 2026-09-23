import React, { useState } from 'react';
import { X, Plus, Layers, Palette } from 'lucide-react';

export default function AddVariantModal({ type = 'motif', catalogId, catalogName, onClose, onSubmit }) {
  const isMotif = type === 'motif';

  // Motif fields
  const [motifCode, setMotifCode] = useState('');
  const [motifName, setMotifName] = useState('');
  const [motifDesc, setMotifDesc] = useState('');

  // Color fields
  const [colorCode, setColorCode] = useState('');
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#b0b8c1');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultPalette = [
    { name: 'Cream Gold', hex: '#e8d7a9' },
    { name: 'Silver Grey', hex: '#b0b8c1' },
    { name: 'Mocca Brown', hex: '#8c6d58' },
    { name: 'Emerald', hex: '#2f5d50' },
    { name: 'Navy Blue', hex: '#1e293b' },
    { name: 'Ivory White', hex: '#fdfbf7' },
    { name: 'Champagne', hex: '#fad6a5' },
    { name: 'Dusty Rose', hex: '#c08081' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let res;
    if (isMotif) {
      if (!motifCode.trim()) {
        setError('Kode motif wajib diisi');
        setLoading(false);
        return;
      }
      res = await onSubmit(catalogId, {
        code: motifCode.trim().toUpperCase(),
        name: motifName.trim() || `Motif ${motifCode.trim().toUpperCase()}`,
        description: motifDesc.trim(),
      });
    } else {
      if (!colorCode.trim()) {
        setError('Kode warna wajib diisi');
        setLoading(false);
        return;
      }
      res = await onSubmit(catalogId, {
        code: colorCode.trim(),
        name: colorName.trim() || `Warna ${colorCode.trim()}`,
        hex_code: colorHex,
      });
    }

    setLoading(false);
    if (res && !res.success) {
      setError(res.message || 'Gagal menambahkan data');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isMotif ? (
              <Layers className="w-5 h-5 text-emerald-400" />
            ) : (
              <Palette className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <h3 className="font-bold text-base leading-none">
                {isMotif ? 'Tambah Motif Baru (Baris)' : 'Tambah Warna Baru (Kolom)'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Katalog: {catalogName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
              {error}
            </div>
          )}

          {isMotif ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kode Motif (Huruf) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={motifCode}
                  onChange={(e) => setMotifCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: A, B, C, D..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 uppercase font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Motif / Corak
                </label>
                <input
                  type="text"
                  value={motifName}
                  onChange={(e) => setMotifName(e.target.value)}
                  placeholder="Contoh: Motif Daun Mewah, Salur Minimalis"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Tekstur / Pola (Opsional)
                </label>
                <textarea
                  value={motifDesc}
                  onChange={(e) => setMotifDesc(e.target.value)}
                  placeholder="Contoh: Emboss emas timbul, tenun jacquard rapat"
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kode Warna (Angka) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={colorCode}
                  onChange={(e) => setColorCode(e.target.value)}
                  placeholder="Contoh: 1, 2, 3, 4..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Warna
                </label>
                <input
                  type="text"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="Contoh: Cream Gold, Silver Grey, Mocca"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Warna Indikator
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="flex-1 text-xs p-2.5 font-mono rounded-xl border border-slate-200"
                  />
                </div>
                {/* Palette quick picks */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {defaultPalette.map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => {
                        setColorHex(p.hex);
                        if (!colorName) setColorName(p.name);
                      }}
                      className="flex items-center space-x-1 px-2 py-1 rounded-lg border border-slate-200 text-[10px] bg-slate-50 hover:bg-slate-100"
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-slate-300" style={{ backgroundColor: p.hex }} />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md active-press"
            >
              {loading ? 'Menyimpan...' : isMotif ? 'Tambah Baris Motif' : 'Tambah Kolom Warna'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

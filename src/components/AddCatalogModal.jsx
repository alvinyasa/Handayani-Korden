import React, { useState } from 'react';
import { X, Layers, Image as ImageIcon } from 'lucide-react';

export default function AddCatalogModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama katalog wajib diisi');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('description', description.trim());
    if (file) {
      formData.append('image', file);
    }

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
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-bottom-sheet max-h-[92vh] flex flex-col">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-[#d96b27] dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200/60 dark:border-orange-900/50">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                Tambah Katalog Kain
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Buat lembar tabel stok kain baru
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800/60">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Katalog Kain <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Arona, Maroko, Dublin, Santorini..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none font-semibold transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Keterangan / Jenis Kain <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Blackout 100%, Dimout Lebar 280cm, Semi-Blackout..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none font-medium transition-all"
            />
          </div>

          {/* Photo (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Sampul Sampel Kain <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              {preview ? (
                <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-xs">
                      Ganti Foto
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-[#d96b27] dark:text-orange-400 flex items-center justify-center mb-1.5 border border-orange-200/50 dark:border-orange-900/50">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Pilih Foto Sampul Buku Katalog
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Bisa ditambahkan nanti
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold active-press transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-[#d96b27] hover:bg-[#c25a1d] text-white text-xs font-bold shadow-md shadow-orange-600/20 active-press disabled:opacity-50 transition-colors"
            >
              {loading ? 'Memproses...' : 'Buat Katalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

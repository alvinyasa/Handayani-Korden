import React, { useState } from 'react';
import { X, Camera, LayoutGrid, Plus, Image as ImageIcon } from 'lucide-react';

export default function AddModelModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Gorden Utama');
  const [notes, setNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (index) => {
    const updatedFiles = selectedFiles.filter((_, idx) => idx !== index);
    const updatedPreviews = previews.filter((_, idx) => idx !== index);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Nama model korden wajib diisi');
      return;
    }
    if (selectedFiles.length === 0) {
      setError('Minimal upload 1 foto model korden');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('category', category);
    formData.append('notes', notes.trim());

    // Append all selected photos
    selectedFiles.forEach((f) => {
      formData.append('photos', f);
    });

    const res = await onSubmit(formData);
    setLoading(false);

    if (res && !res.success) {
      setError(res.message || 'Gagal menambahkan model korden');
    } else {
      onClose();
    }
  };

  const categoryOptions = [
    'Gorden Utama',
    'Vitrase / Sheer',
    'Roman Shade',
    'Roller Blind',
    'Wooden / Venetian Blind',
    'Vertical Blind',
    'Kombinasi / Custom',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-backdrop">
      <div className="w-full max-w-lg bg-white dark:bg-[#1E1E1E] rounded-t-[28px] sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200/80 dark:border-[#444444] overflow-hidden animate-bottom-sheet max-h-[92vh] flex flex-col">
        {/* Mobile Swipe / Drag Handle Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-[#333333] rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-[#444444] bg-white dark:bg-[#1E1E1E] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-[#d96b27] dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200/60 dark:border-orange-900/50">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-[#E0E0E0] leading-tight">
                Tambah Model Korden Baru
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#888888] font-medium">
                Bisa upload beberapa foto sekaligus untuk 1 model
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

          {/* Model Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#B0B0B0] mb-1.5">
              Nama Model Korden <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Model Smokering, Triple Pleat, Roman Shade..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-50 dark:bg-[#2A2A2A] text-slate-900 dark:text-[#E0E0E0] placeholder:text-slate-400 dark:placeholder:text-[#888888] focus:bg-white dark:focus:bg-[#2A2A2A] focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none font-semibold transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#B0B0B0] mb-1.5">
              Kategori Produk
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-50 dark:bg-[#2A2A2A] text-slate-900 dark:text-[#E0E0E0] focus:bg-white dark:focus:bg-[#2A2A2A] focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none font-medium transition-all"
            >
              {categoryOptions.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Multiple Photos Upload Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-[#B0B0B0]">
                Foto Model Korden <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-[#d96b27] dark:text-orange-400 font-bold">
                {previews.length > 0 ? `${previews.length} Foto Dipilih` : 'Bisa Banyak Foto'}
              </span>
            </div>

            {/* Photo Previews Grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2.5">
                {previews.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 dark:border-[#444444] bg-slate-100 dark:bg-[#2A2A2A] group"
                  >
                    <img src={item.url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors"
                      title="Hapus foto ini"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white">
                      {idx === 0 ? 'Utama' : `#${idx + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button Box */}
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-[#444444] rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-[#333333] transition-colors group">
              <div className="flex flex-col items-center py-2">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-[#d96b27] dark:text-orange-400 flex items-center justify-center mb-1.5 border border-orange-200/50 dark:border-orange-900/50 group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-[#E0E0E0]">
                  {previews.length > 0 ? '+ Tambah Foto Lainnya' : 'Pilih Foto (Bisa Banyak Sekaligus)'}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-[#888888] mt-0.5">
                  Bisa pilih beberapa gambar dari galeri HP / Kamera
                </span>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Notes / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#B0B0B0] mb-1.5">
              Catatan / Deskripsi Model <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Cocok untuk jendela tinggi, memakai smokering diameter 4.5 cm, lipatan 1:2..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-50 dark:bg-[#2A2A2A] text-slate-900 dark:text-[#E0E0E0] placeholder:text-slate-400 dark:placeholder:text-[#888888] focus:bg-white dark:focus:bg-[#2A2A2A] focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none transition-all resize-none"
            />
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
              disabled={loading || selectedFiles.length === 0}
              className="flex-1 py-3 px-4 rounded-xl bg-[#d96b27] hover:bg-[#c25a1d] text-white text-xs font-bold shadow-md shadow-orange-600/20 active-press disabled:opacity-50 transition-colors"
            >
              {loading ? 'Menyimpan...' : `Simpan Model (${selectedFiles.length} Foto)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

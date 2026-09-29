import React, { useState } from 'react';
import { X, Camera, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function AddInstallationModal({
  existingCatalogs = [],
  initialCatalogName = '',
  onClose,
  onSubmit,
}) {
  const [catalogName, setCatalogName] = useState(initialCatalogName || '');
  const [roomType, setRoomType] = useState('Ruang Tamu');
  const [caption, setCaption] = useState('');
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
    if (!catalogName.trim()) {
      setError('Nama Katalog wajib diisi');
      return;
    }
    if (!file) {
      setError('Foto hasil pemasangan wajib diupload');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('catalog_name', catalogName.trim());
    formData.append('room_type', roomType);
    formData.append('caption', caption.trim());
    formData.append('photo', file);

    const res = await onSubmit(formData);
    setLoading(false);

    if (res && !res.success) {
      setError(res.message || 'Gagal mengupload foto pemasangan');
    } else {
      onClose();
    }
  };

  const roomOptions = [
    'Ruang Tamu',
    'Kamar Tidur Utama',
    'Kamar Tidur Anak',
    'Ruang Keluarga',
    'Kamar Tamu',
    'Ruang Kerja / Kantor',
    'Ruang Makan',
    'Villa / Penginapan',
    'Mushola Rumah',
    'Apartemen / Studio',
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
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-[#E0E0E0] leading-tight">
                Tambah Foto Pemasangan
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#888888] font-medium">
                Dokumentasi hasil pengerjaan di lapangan
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

          {/* Catalog Name Input with Datalist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#B0B0B0] mb-1.5">
              Nama Katalog <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              list="catalog-suggestions"
              value={catalogName}
              onChange={(e) => setCatalogName(e.target.value)}
              placeholder="Ketik nama katalog (misal: Arona, Maroko, Minimalis...)"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-50 dark:bg-[#2A2A2A] text-slate-900 dark:text-[#E0E0E0] placeholder:text-slate-400 dark:placeholder:text-[#888888] focus:bg-white dark:focus:bg-[#2A2A2A] focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none font-semibold transition-all"
            />
            <datalist id="catalog-suggestions">
              {existingCatalogs.map((cat, idx) => (
                <option key={idx} value={cat} />
              ))}
            </datalist>
            <p className="text-[11px] text-slate-400 dark:text-[#888888] mt-1">
              Bisa ketik nama katalog baru secara bebas atau pilih dari saran yang ada.
            </p>
          </div>

          {/* Photo Upload Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#B0B0B0] mb-1.5">
              Foto Pemasangan (HP / Galeri) <span className="text-rose-500">*</span>
            </label>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-[#444444] rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-[#333333] transition-colors group">
              {preview ? (
                <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 dark:border-[#444444] relative">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-xs">
                      Ganti Foto
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-[#d96b27] dark:text-orange-400 flex items-center justify-center mb-2 border border-orange-200/50 dark:border-orange-900/50 group-hover:scale-105 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-[#E0E0E0]">
                    Ambil Foto / Pilih dari Galeri HP
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-[#888888] mt-0.5">
                    Format gambar JPG, PNG, atau WEBP
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

          {/* Room Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#B0B0B0] mb-1.5">
              Tipe Ruangan / Lokasi Pemasangan
            </label>
            <input
              type="text"
              list="room-suggestions"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              placeholder="Contoh: Ruang Tamu, Kamar Utama, Villa Bali..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-50 dark:bg-[#2A2A2A] text-slate-900 dark:text-[#E0E0E0] placeholder:text-slate-400 dark:placeholder:text-[#888888] focus:bg-white dark:focus:bg-[#2A2A2A] focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none font-medium transition-all"
            />
            <datalist id="room-suggestions">
              {roomOptions.map((r, idx) => (
                <option key={idx} value={r} />
              ))}
            </datalist>
          </div>

          {/* Caption / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#B0B0B0] mb-1.5">
              Keterangan Tambahan <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Catatan pemasangan, nama customer, atau jenis rel..."
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
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-[#d96b27] hover:bg-[#c25a1d] text-white text-xs font-bold shadow-md shadow-orange-600/20 active-press disabled:opacity-50 transition-colors"
            >
              {loading ? 'Menyimpan...' : 'Simpan Foto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

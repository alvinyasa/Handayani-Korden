import React, { useState } from 'react';
import { X, Camera, Image as ImageIcon } from 'lucide-react';

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
    'Ruang Kerja / Kantor',
    'Dapur / Dining',
    'Apartemen / Penthouse',
    'Villa / Hotel',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="p-4 bg-[#d96b27] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-white" />
            <h3 className="font-extrabold text-base">Tambah Foto Pemasangan</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
              {error}
            </div>
          )}

          {/* Catalog Name Input with Datalist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Katalog <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              list="catalog-suggestions"
              value={catalogName}
              onChange={(e) => setCatalogName(e.target.value)}
              placeholder="Contoh: Arona, Maroko, Minimalis 2026..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#d96b27] focus:outline-none bg-white font-bold text-slate-900"
            />
            <datalist id="catalog-suggestions">
              {existingCatalogs.map((cat, idx) => (
                <option key={idx} value={cat} />
              ))}
            </datalist>
            <p className="text-[10px] text-slate-400 mt-1">
              Bisa ketik nama katalog baru secara bebas atau pilih dari saran.
            </p>
          </div>

          {/* Photo Upload Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Foto dari HP / Galeri <span className="text-rose-500">*</span>
            </label>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors group">
              {preview ? (
                <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-200 relative">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">Ganti Foto</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-[#d96b27] flex items-center justify-center mb-2">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Ambil Foto / Pilih dari Galeri HP</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Tampilan nyata hasil pemasangan</span>
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

          {/* Room Type (Free Text Input with Suggestions) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tipe Ruangan / Lokasi Pemasangan
            </label>
            <input
              type="text"
              list="room-suggestions"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              placeholder="Contoh: Ruang Tamu, Kamar Tidur Utama, Villa Bali..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#d96b27] focus:outline-none bg-white font-medium text-slate-900"
            />
            <datalist id="room-suggestions">
              {roomOptions.map((r, idx) => (
                <option key={idx} value={r} />
              ))}
            </datalist>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan / Keterangan Pemasangan
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Contoh: Pemasangan korden Smokering bahan blackout 90% di Ruang Tamu."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#d96b27] focus:outline-none"
            />
          </div>

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
              className="px-5 py-2 text-xs font-bold text-white bg-[#d96b27] hover:bg-[#c25a1d] rounded-xl shadow-md shadow-orange-600/20 active-press"
            >
              {loading ? 'Mengunggah...' : 'Simpan Foto Pemasangan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

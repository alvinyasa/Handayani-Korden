import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Check,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  Maximize2,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function StockCellModal({
  data,
  onClose,
  onUpdateStock,
  onOpenUploadPhoto,
  installationPhotos = [],
}) {
  const { canEdit, isTeknisi } = useAuth();
  if (!data) return null;

  const { catalog, motif, color, item } = data;
  const isReady = item ? Number(item.is_ready) === 1 : false;

  const [currentReady, setCurrentReady] = useState(isReady);
  const [notes, setNotes] = useState(item?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Filter installation photos for this specific variant
  const variantPhotos = installationPhotos.filter(
    (p) =>
      Number(p.catalog_id) === Number(catalog.id) &&
      Number(p.motif_id) === Number(motif.id) &&
      Number(p.color_id) === Number(color.id)
  );

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdateStock({
      catalog_id: catalog.id,
      motif_id: motif.id,
      color_id: color.id,
      is_ready: currentReady ? 1 : 0,
      notes: notes.trim(),
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div
              className="w-8 h-8 rounded-xl border-2 border-white/40 shadow-inner"
              style={{ backgroundColor: color.hex_code || '#cbd5e1' }}
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Katalog {catalog.name}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  Motif {motif.code} - Warna {color.code}
                </span>
              </div>
              <h3 className="font-bold text-base text-white truncate max-w-[240px]">
                {motif.name || `Motif ${motif.code}`} ({color.name || `Warna ${color.code}`})
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* 1. Status Section */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
              Ketersediaan Stok Kain
            </div>

            {canEdit ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentReady(true)}
                  className={`py-3 px-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all active-press ${
                    currentReady
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-600'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>READY (✓)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentReady(false)}
                  className={`py-3 px-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all active-press ${
                    !currentReady
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-600'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>KOSONG (✗)</span>
                </button>
              </div>
            ) : (
              <div
                className={`py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center space-x-2 ${
                  isReady ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {isReady ? (
                  <>
                    <Check className="w-5 h-5 stroke-[3] text-emerald-700" />
                    <span>STOK KAIN READY DI GUDANG</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 stroke-[3] text-rose-700" />
                    <span>STOK KOSONG / HABIS</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 2. Notes / Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center space-x-1">
              <span>Catatan Khusus Varian</span>
            </label>
            {canEdit ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Roll baru tiba, sisa 15 meter, atau menunggu batch pabrik..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                {notes || 'Tidak ada catatan khusus.'}
              </div>
            )}
          </div>

          {/* 3. Linked Installation Photos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-slate-600" />
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Foto Pemasangan Varian Ini ({variantPhotos.length})
                </h4>
              </div>

              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUploadPhoto({
                      catalog_id: catalog.id,
                      motif_id: motif.id,
                      color_id: color.id,
                    });
                  }}
                  className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Upload Foto</span>
                </button>
              )}
            </div>

            {variantPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {variantPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedImage(photo)}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video cursor-pointer"
                  >
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || 'Foto Pemasangan'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[10px] text-white font-medium truncate">
                        {photo.room_type || 'Hasil Terpasang'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                Belum ada foto pemasangan yang ditautkan ke varian ini.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl"
          >
            Tutup
          </button>
          {canEdit && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 active-press"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Photo */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/20 hover:bg-white/30"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage.photo_url}
            alt={selectedImage.caption}
            className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl"
          />
          {selectedImage.caption && (
            <p className="text-white text-xs mt-3 max-w-md text-center bg-black/50 p-2 rounded-xl">
              {selectedImage.caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

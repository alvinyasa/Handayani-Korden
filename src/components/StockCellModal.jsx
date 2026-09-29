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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-backdrop">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-bottom-sheet max-h-[92vh] flex flex-col">
        {/* Mobile Swipe / Drag Handle Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl border-2 border-white/60 dark:border-slate-700 shadow-xs shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
              style={{ backgroundColor: color.hex_code || '#cbd5e1' }}
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black text-[#d96b27] dark:text-orange-400 uppercase tracking-wider">
                  Katalog {catalog.name}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  Motif {motif.code} - {color.code}
                </span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate max-w-[250px]">
                {motif.name || `Motif ${motif.code}`} ({color.name || `Warna ${color.code}`})
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Status Section */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2.5 uppercase tracking-wider">
              Status Ketersediaan Stok
            </div>

            {canEdit ? (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentReady(true)}
                  className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all active-press ${
                    currentReady
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>READY (✓)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentReady(false)}
                  className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all active-press ${
                    !currentReady
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 ring-2 ring-rose-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>KOSONG (✗)</span>
                </button>
              </div>
            ) : (
              <div
                className={`py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 ${
                  isReady
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                }`}
              >
                {isReady ? (
                  <>
                    <Check className="w-5 h-5 stroke-[3] text-emerald-600 dark:text-emerald-400" />
                    <span>STOK KAIN TERSEDIA (READY)</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 stroke-[3] text-rose-600 dark:text-rose-400" />
                    <span>STOK SAAT INI KOSONG / HABIS</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Catatan Khusus Varian
            </label>
            {canEdit ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Roll baru tiba, sisa 15 meter, atau menunggu kiriman pabrik..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none transition-all resize-none font-medium"
              />
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                {notes || 'Tidak ada catatan khusus.'}
              </div>
            )}
          </div>

          {/* Linked Photos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
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
                      catalog_name: catalog.name,
                      motif_id: motif.id,
                      color_id: color.id,
                    });
                  }}
                  className="text-[11px] font-bold text-[#d96b27] dark:text-orange-400 hover:underline flex items-center space-x-1 active-press"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Foto</span>
                </button>
              )}
            </div>

            {variantPhotos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {variantPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedImage(photo.photo_url)}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer group bg-slate-100 dark:bg-slate-800"
                  >
                    <img src={photo.photo_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  Belum ada foto terpasang untuk varian motif {motif.code} warna {color.code}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold active-press transition-colors"
          >
            Tutup
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3 px-4 rounded-xl bg-[#d96b27] hover:bg-[#c25a1d] text-white text-xs font-bold shadow-md shadow-orange-600/20 active-press disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          )}
        </div>
      </div>

      {/* Lightbox Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-backdrop"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={selectedImage} alt="" className="w-full max-h-[80vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}

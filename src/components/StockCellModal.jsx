import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
import { parsePhotoUrls } from '../utils/photoUtils';
import { useLockBodyScroll } from '../utils/useLockBodyScroll';

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

  // Swipe / Drag down to dismiss state
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);
  const currentDragY = useRef(0);
  const backdropTouchStartY = useRef(0);

  // Lock body scroll while modal is open (iOS & Android safe)
  useLockBodyScroll(true);

  // Handle drag down on modal header / handle
  const handleDragTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    touchStartY.current = e.touches[0].clientY;
    currentDragY.current = 0;
    setIsDragging(true);
  };

  const handleDragTouchMove = (e) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) {
      if (e.cancelable) e.preventDefault();
      currentDragY.current = deltaY;
      setDragY(deltaY);
    } else {
      currentDragY.current = 0;
      setDragY(0);
    }
  };

  const handleDragTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (currentDragY.current > 70) {
      onClose();
    }
    setDragY(0);
    currentDragY.current = 0;
  };

  // Handle backdrop touch gestures
  const handleBackdropTouchStart = (e) => {
    if (e.target === e.currentTarget && e.touches.length === 1) {
      backdropTouchStartY.current = e.touches[0].clientY;
    }
  };

  const handleBackdropTouchEnd = (e) => {
    if (e.target === e.currentTarget && e.changedTouches.length === 1) {
      const deltaY = e.changedTouches[0].clientY - backdropTouchStartY.current;
      // If tapped or dragged down on backdrop, dismiss
      if (Math.abs(deltaY) < 15 || deltaY > 30) {
        onClose();
      }
    }
  };

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

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        margin: 0,
        touchAction: 'none',
        overscrollBehavior: 'none',
      }}
      onClick={onClose}
      onTouchStart={handleBackdropTouchStart}
      onTouchEnd={handleBackdropTouchEnd}
      onTouchMove={(e) => {
        if (e.cancelable) e.preventDefault();
      }}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1E1E1E] rounded-t-[28px] sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200/80 dark:border-[#444444] overflow-hidden animate-bottom-sheet max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        style={{
          touchAction: 'auto',
          overscrollBehavior: 'contain',
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Mobile Swipe / Drag Handle Indicator */}
        <div
          className="w-full pt-3 pb-2 sm:hidden shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={handleDragTouchStart}
          onTouchMove={handleDragTouchMove}
          onTouchEnd={handleDragTouchEnd}
        >
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-[#444444] rounded-full" />
        </div>

        {/* Header */}
        <div
          className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100 dark:border-[#444444] bg-white dark:bg-[#1E1E1E] shrink-0 touch-none select-none"
          onTouchStart={handleDragTouchStart}
          onTouchMove={handleDragTouchMove}
          onTouchEnd={handleDragTouchEnd}
        >
          <div className="flex items-center space-x-3 pointer-events-none">
            {!isTeknisi && color.hex_code && color.hex_code !== '#cbd5e1' && (
              <div
                className="w-9 h-9 rounded-xl border-2 border-white/60 dark:border-[#444444] shadow-xs shrink-0 ring-1 ring-slate-200 dark:ring-[#444444]"
                style={{ backgroundColor: color.hex_code }}
              />
            )}
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black text-[#d96b27] dark:text-orange-400 uppercase tracking-wider">
                  Katalog {catalog.name}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-[#B0B0B0]">
                  Motif {motif.code} - {color.code}
                </span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-[#E0E0E0] truncate max-w-[280px]">
                {motif.name || `Motif ${motif.code}`} ({color.name || `Warna ${color.code}`})
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            onTouchStart={(e) => e.stopPropagation()}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-[#E0E0E0] p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#333333] transition-colors active-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Status Section */}
          <div className="bg-slate-50 dark:bg-[#2A2A2A] p-4 rounded-2xl border border-slate-200/80 dark:border-[#444444]">
            <div className="text-[11px] font-bold text-slate-500 dark:text-[#888888] mb-2.5 uppercase tracking-wider">
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
                      : 'bg-white dark:bg-[#2A2A2A] text-slate-600 dark:text-[#B0B0B0] border border-slate-200 dark:border-[#444444] hover:bg-slate-100 dark:hover:bg-[#444444]'
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
                      : 'bg-white dark:bg-[#2A2A2A] text-slate-600 dark:text-[#B0B0B0] border border-slate-200 dark:border-[#444444] hover:bg-slate-100 dark:hover:bg-[#444444]'
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
            <label className="text-xs font-bold text-slate-700 dark:text-[#B0B0B0]">
              Catatan Khusus Varian
            </label>
            {canEdit ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Roll baru tiba, sisa 15 meter, atau menunggu kiriman pabrik..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-50 dark:bg-[#2A2A2A] text-slate-900 dark:text-[#E0E0E0] placeholder:text-slate-400 dark:placeholder:text-[#888888] focus:bg-white dark:focus:bg-[#2A2A2A] focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none transition-all resize-none font-medium"
              />
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-[#2A2A2A] rounded-xl border border-slate-200 dark:border-[#444444] text-xs text-slate-600 dark:text-[#B0B0B0]">
                {notes || 'Tidak ada catatan khusus.'}
              </div>
            )}
          </div>

          {/* Linked Photos (Bukan Teknisi) */}
          {!isTeknisi && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4 text-slate-500 dark:text-[#888888]" />
                  <h4 className="text-xs font-bold text-slate-700 dark:text-[#B0B0B0] uppercase tracking-wider">
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
                  {variantPhotos.map((photo) => {
                    const urls = parsePhotoUrls(photo.photo_url);
                    const displayUrl = urls[0] || photo.photo_url;
                    return (
                      <div
                        key={photo.id}
                        onClick={() => setSelectedImage(displayUrl)}
                        className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-[#444444] cursor-pointer group bg-slate-100 dark:bg-[#2A2A2A]"
                      >
                        <img src={displayUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        {urls.length > 1 && (
                          <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white shadow-xs">
                            {urls.length} Foto
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-[#444444] bg-slate-50/50 dark:bg-[#2A2A2A]/40 text-center">
                  <p className="text-[11px] text-slate-400 dark:text-[#888888] font-medium">
                    Belum ada foto terpasang untuk varian motif {motif.code} warna {color.code}.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-[#444444] bg-white dark:bg-[#1E1E1E] flex items-center space-x-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-[#444444] bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-[#444444] text-slate-700 dark:text-[#B0B0B0] text-xs font-bold active-press transition-colors"
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
          className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 10000,
            margin: 0,
          }}
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

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Maximize2, MapPin, Tag, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { parsePhotoUrls } from '../utils/photoUtils';

export default function InstallationCard({ photo, onDelete, onPreviewImage }) {
  const { canEdit } = useAuth();
  const photos = parsePhotoUrls(photo.photo_url);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const currentPhoto = photos[activePhotoIdx] || photo.photo_url || '';

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e) => {
    if (photos.length <= 1) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (photos.length <= 1 || touchStart === null) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (photos.length <= 1 || touchStart === null || touchEnd === null) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 35;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-slate-200/90 dark:border-[#444444] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Image Preview Container (4:3 aspect ratio) */}
        <div
          className={`relative aspect-4/3 bg-slate-100 dark:bg-[#2A2A2A] overflow-hidden touch-pan-y ${
            photos.length > 1 ? 'cursor-grab select-none' : ''
          }`}
          onTouchStart={photos.length > 1 ? handleTouchStart : undefined}
          onTouchMove={photos.length > 1 ? handleTouchMove : undefined}
          onTouchEnd={photos.length > 1 ? handleTouchEnd : undefined}
        >
          <img
            src={currentPhoto}
            alt={photo.caption || photo.catalog_name || 'Foto Pemasangan'}
            draggable={false}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
          />

          {/* Catalog & Room Badge Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wide border border-white/20 flex items-center space-x-1 shadow-xs">
              <Tag className="w-3 h-3 text-orange-400" />
              <span>{photo.catalog_name}</span>
            </span>
            {photo.room_type && (
              <span className="px-2 py-1 rounded-lg bg-black/65 backdrop-blur-md text-white font-semibold text-[10px] border border-white/10 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{photo.room_type}</span>
              </span>
            )}
          </div>

          {/* Multiple Photos Indicator Badge */}
          {photos.length > 1 && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white font-mono font-bold text-[10px] flex items-center space-x-1 border border-white/20 shadow-xs">
                <Layers className="w-3 h-3 text-amber-400" />
                <span>
                  {activePhotoIdx + 1} / {photos.length}
                </span>
              </span>
            </div>
          )}

          {/* Carousel Left / Right Arrows */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs transition-all active:scale-95 shadow-md z-10"
                title="Foto sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs transition-all active:scale-95 shadow-md z-10"
                title="Foto berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Lightbox Zoom Trigger */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreviewImage({ ...photo, activePhoto: currentPhoto, photos, activeIndex: activePhotoIdx });
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-all active-press z-10"
            title="Perbesar Foto"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail Dots for Multiple Photos */}
        {photos.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-50 dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-[#444444]">
            {photos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIdx(idx);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className={`h-2 rounded-full transition-all ${
                  idx === activePhotoIdx
                    ? 'w-6 bg-[#d96b27]'
                    : 'w-2 bg-slate-300 dark:bg-[#444444] hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}

        {/* Content Body */}
        <div className="p-3.5">
          <div className="flex items-start justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-[#E0E0E0] leading-snug">
              Katalog {photo.catalog_name}
            </h3>
            {canEdit && (
              <button
                onClick={() => onDelete(photo.id)}
                className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg transition-colors shrink-0 ml-2 active-press"
                title="Hapus Foto Pemasangan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Room type label if present */}
          {photo.room_type && (
            <p className="text-[11px] font-semibold text-slate-500 dark:text-[#888888] mt-0.5">
              Lokasi: {photo.room_type}
            </p>
          )}

          {/* Caption text */}
          {photo.caption && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#444444]">
              <p className="text-xs text-slate-600 dark:text-[#B0B0B0] whitespace-pre-line leading-relaxed">
                {photo.caption}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

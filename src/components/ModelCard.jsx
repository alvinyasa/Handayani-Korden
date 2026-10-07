import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Maximize2, Tag, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { parsePhotoUrls } from '../utils/photoUtils';

export default function ModelCard({ model, onDelete, onPreviewImage }) {
  const { canEdit } = useAuth();
  const photos = parsePhotoUrls(model.photo_url);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const currentPhoto = photos[activePhotoIdx] || model.photo_url || '';

  const handlePrev = (e) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-slate-200/90 dark:border-[#444444] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Image Preview Container */}
        <div className="relative aspect-4/3 bg-slate-100 dark:bg-[#2A2A2A] overflow-hidden">
          <img
            src={currentPhoto}
            alt={model.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Category Tag Overlay */}
          {model.category && (
            <div className="absolute top-2.5 left-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md text-white font-bold text-[10px] tracking-wide border border-white/20 flex items-center space-x-1 shadow-xs">
                <Tag className="w-3 h-3 text-orange-400" />
                <span>{model.category}</span>
              </span>
            </div>
          )}

          {/* Multiple Photos Indicator Badge */}
          {photos.length > 1 && (
            <div className="absolute top-2.5 right-2.5">
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
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors active-press"
                title="Foto sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors active-press"
                title="Foto berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Zoom Lightbox Trigger */}
          <button
            onClick={() => onPreviewImage({ ...model, activePhoto: currentPhoto, photos, activeIndex: activePhotoIdx })}
            className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-all active-press"
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
                onClick={() => setActivePhotoIdx(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === activePhotoIdx
                    ? 'w-5 bg-[#d96b27]'
                    : 'w-1.5 bg-slate-300 dark:bg-[#444444] hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}

        {/* Card Content Body */}
        <div className="p-3.5">
          <div className="flex items-start justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-[#E0E0E0] leading-snug">
              {model.title}
            </h3>
            {canEdit && (
              <button
                onClick={() => onDelete(model.id, model.title)}
                className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg transition-colors shrink-0 ml-2 active-press"
                title="Hapus Model"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Simple Notes */}
          {model.notes && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#444444]">
              <p className="text-xs text-slate-600 dark:text-[#B0B0B0] whitespace-pre-line leading-relaxed">
                {model.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

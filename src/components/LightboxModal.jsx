import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export default function LightboxModal({ photos = [], activeIndex = 0, onClose, onIndexChange }) {
  const [currentIdx, setCurrentIdx] = useState(activeIndex);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const activePhotoList = Array.isArray(photos) && photos.length > 0 ? photos : [];
  const currentUrl = activePhotoList[currentIdx] || activePhotoList[0] || '';

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    const nextIdx = currentIdx > 0 ? currentIdx - 1 : activePhotoList.length - 1;
    setCurrentIdx(nextIdx);
    if (onIndexChange) onIndexChange(nextIdx);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    const nextIdx = currentIdx < activePhotoList.length - 1 ? currentIdx + 1 : 0;
    setCurrentIdx(nextIdx);
    if (onIndexChange) onIndexChange(nextIdx);
  };

  const handleTouchStart = (e) => {
    if (activePhotoList.length <= 1) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (activePhotoList.length <= 1 || touchStart === null) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (activePhotoList.length <= 1 || touchStart === null || touchEnd === null) {
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
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-backdrop"
      onClick={onClose}
    >
      <div className="relative max-w-3xl w-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 active-press"
          title="Tutup"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Photo Counter Badge */}
        {activePhotoList.length > 1 && (
          <div className="absolute -top-12 left-0 px-3 py-1 rounded-lg bg-white/15 backdrop-blur-md text-white font-mono font-bold text-xs flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {currentIdx + 1} / {activePhotoList.length} Foto
            </span>
          </div>
        )}

        {/* Image Container with touch swipe */}
        <div
          className={`relative w-full flex items-center justify-center overflow-hidden touch-pan-y ${
            activePhotoList.length > 1 ? 'cursor-grab select-none' : ''
          }`}
          onTouchStart={activePhotoList.length > 1 ? handleTouchStart : undefined}
          onTouchMove={activePhotoList.length > 1 ? handleTouchMove : undefined}
          onTouchEnd={activePhotoList.length > 1 ? handleTouchEnd : undefined}
        >
          <img
            src={currentUrl}
            alt="Preview"
            draggable={false}
            className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl pointer-events-none select-none"
          />

          {/* Prev / Next Arrows */}
          {activePhotoList.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs transition-colors active-press shadow-md z-10"
                title="Foto sebelumnya"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs transition-colors active-press shadow-md z-10"
                title="Foto berikutnya"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Dot Indicators */}
        {activePhotoList.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {activePhotoList.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIdx(idx);
                  if (onIndexChange) onIndexChange(idx);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIdx ? 'w-6 bg-[#d96b27]' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

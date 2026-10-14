import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { useLockBodyScroll } from '../utils/useLockBodyScroll';

export default function LightboxModal({ photos = [], activeIndex = 0, onClose, onIndexChange }) {
  const [currentIdx, setCurrentIdx] = useState(activeIndex);

  // Zoom & Pan State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Touch and Drag refs
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef(0);
  const pinchStartDistRef = useRef(null);
  const pinchStartScaleRef = useRef(1);

  // Carousel swipe state (when scale === 1)
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Lock body scroll when lightbox is open (iOS & Android safe)
  useLockBodyScroll(true);

  const activePhotoList = Array.isArray(photos) && photos.length > 0 ? photos : [];
  const currentUrl = activePhotoList[currentIdx] || activePhotoList[0] || '';

  // Reset zoom & pan when image changes or reset button is clicked
  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    resetZoom();
    const nextIdx = currentIdx > 0 ? currentIdx - 1 : activePhotoList.length - 1;
    setCurrentIdx(nextIdx);
    if (onIndexChange) onIndexChange(nextIdx);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    resetZoom();
    const nextIdx = currentIdx < activePhotoList.length - 1 ? currentIdx + 1 : 0;
    setCurrentIdx(nextIdx);
    if (onIndexChange) onIndexChange(nextIdx);
  };

  const handleZoomIn = (e) => {
    if (e) e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e) => {
    if (e) e.stopPropagation();
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleDoubleTap = () => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Touch Handlers for Pinch, Pan, Double-Tap & Swipe
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // 2 fingers: Pinch to zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartScaleRef.current = scale;
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const now = Date.now();

      // Check double tap (within 300ms)
      if (now - lastTapRef.current < 300) {
        handleDoubleTap();
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      if (scale > 1) {
        // Pan zoomed image
        setIsDragging(true);
        dragStartRef.current = {
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        };
      } else {
        // Carousel swipe
        setTouchEnd(null);
        setTouchStart(touch.clientX);
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchStartDistRef.current) {
      if (e.cancelable) e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / pinchStartDistRef.current;
      const newScale = Math.min(Math.max(pinchStartScaleRef.current * factor, 1), 4);
      setScale(newScale);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (scale > 1 && isDragging) {
        if (e.cancelable) e.preventDefault();
        const nextX = touch.clientX - dragStartRef.current.x;
        const nextY = touch.clientY - dragStartRef.current.y;
        setPosition({ x: nextX, y: nextY });
      } else if (scale === 1 && activePhotoList.length > 1 && touchStart !== null) {
        setTouchEnd(touch.clientX);
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      pinchStartDistRef.current = null;
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
    }

    if (scale === 1 && activePhotoList.length > 1 && touchStart !== null && touchEnd !== null) {
      const distance = touchStart - touchEnd;
      const minSwipeDistance = 35;
      if (distance > minSwipeDistance) {
        handleNext();
      } else if (distance < -minSwipeDistance) {
        handlePrev();
      }
      setTouchStart(null);
      setTouchEnd(null);
    }
  };

  // Mouse Wheel Zoom (Desktop)
  const handleWheel = (e) => {
    if (e.cancelable) e.preventDefault();
    const delta = -e.deltaY * 0.002;
    setScale((prev) => {
      const next = Math.min(Math.max(prev + delta, 1), 4);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse Drag to Pan (Desktop)
  const handleMouseDown = (e) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  const handleMouseMove = (e) => {
    if (scale > 1 && isDragging) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const content = (
    <div
      className="fixed inset-0 z-[9999] bg-black/92 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-5 animate-backdrop select-none"
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
      onClick={() => {
        if (scale > 1) {
          resetZoom();
        } else {
          onClose();
        }
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget && e.cancelable) e.preventDefault();
      }}
    >
      {/* Top Bar: Counter & Close Button */}
      <div
        className="w-full max-w-4xl flex items-center justify-between z-20 shrink-0 py-1"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo Counter Badge */}
        {activePhotoList.length > 1 ? (
          <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-white font-mono font-bold text-xs flex items-center space-x-1.5 border border-white/10">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {currentIdx + 1} / {activePhotoList.length} Foto
            </span>
          </div>
        ) : (
          <div />
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active-press border border-white/10"
          title="Tutup (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Interactive Image Viewport */}
      <div
        className={`relative w-full max-w-4xl flex-1 flex items-center justify-center overflow-hidden my-auto ${
          scale > 1
            ? isDragging
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : activePhotoList.length > 1
            ? 'cursor-grab'
            : 'cursor-default'
        }`}
        style={{ touchAction: 'none' }}
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleTap}
      >
        <img
          src={currentUrl}
          alt="Preview Foto Full"
          draggable={false}
          className="max-w-full max-h-[75vh] sm:max-h-[80vh] object-contain rounded-xl sm:rounded-2xl shadow-2xl pointer-events-none select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            transformOrigin: 'center center',
          }}
        />

        {/* Prev / Next Arrows */}
        {activePhotoList.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 shadow-lg border border-white/15 z-10"
              title="Foto sebelumnya"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 shadow-lg border border-white/15 z-10"
              title="Foto berikutnya"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Floating Bar: Zoom Controls & Carousel Dots */}
      <div
        className="w-full max-w-4xl flex flex-col items-center justify-center gap-2 z-20 shrink-0 pb-1"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Zoom Toolbar */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-white shadow-2xl">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="p-1.5 rounded-full hover:bg-white/20 active:scale-90 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Perkecil (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="font-mono text-xs font-bold px-1.5 min-w-[45px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 4}
            className="p-1.5 rounded-full hover:bg-white/20 active:scale-90 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Perbesar (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {scale > 1 && (
            <>
              <div className="w-[1px] h-4 bg-white/20 mx-0.5" />
              <button
                type="button"
                onClick={resetZoom}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#d96b27] hover:bg-[#c25a1d] text-white flex items-center space-x-1 active:scale-95 transition-all shadow-sm"
                title="Reset Ukuran (100%)"
              >
                <RotateCcw className="w-3 h-3" />
                <span>100%</span>
              </button>
            </>
          )}
        </div>

        {/* Dot Indicators */}
        {activePhotoList.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {activePhotoList.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetZoom();
                  setCurrentIdx(idx);
                  if (onIndexChange) onIndexChange(idx);
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIdx ? 'w-6 bg-[#d96b27]' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
                title={`Lihat foto ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
}

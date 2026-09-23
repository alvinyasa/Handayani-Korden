import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Maximize2, ChevronDown, ChevronUp, MapPin, Tag } from 'lucide-react';

export default function InstallationCard({ photo, onDelete, onPreviewImage }) {
  const { canEdit } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Image Preview Container (4:3 aspect ratio, identical to ModelCard) */}
        <div className="relative aspect-4/3 bg-slate-100 overflow-hidden group">
          <img
            src={photo.photo_url}
            alt={photo.caption || photo.catalog_name || 'Foto Pemasangan'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Catalog Badge Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wide border border-white/20 flex items-center space-x-1">
              <Tag className="w-3 h-3 text-orange-400" />
              <span>{photo.catalog_name}</span>
            </span>
            {photo.room_type && (
              <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-semibold text-[10px] border border-white/10 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{photo.room_type}</span>
              </span>
            )}
          </div>

          {/* Lightbox Zoom Trigger */}
          <button
            onClick={() => onPreviewImage(photo)}
            className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            title="Perbesar Foto"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5">
          <div className="flex items-start justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
              Katalog {photo.catalog_name}
            </h3>
            {canEdit && (
              <button
                onClick={() => onDelete(photo.id)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors shrink-0 ml-2"
                title="Hapus Foto Pemasangan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Caption / Description text with read more */}
          {photo.caption && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                {isExpanded ? (
                  photo.caption
                ) : (
                  <div className="line-clamp-2">{photo.caption}</div>
                )}
              </div>

              {photo.caption.length > 70 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 text-[11px] font-bold text-[#d96b27] hover:underline flex items-center space-x-0.5"
                >
                  <span>{isExpanded ? 'Sembunyikan' : 'Baca Selengkapnya'}</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

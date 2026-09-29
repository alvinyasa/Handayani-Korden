import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Maximize2, Tag } from 'lucide-react';

export default function ModelCard({ model, onDelete, onPreviewImage }) {
  const { canEdit } = useAuth();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Image Preview Container */}
        <div className="relative aspect-4/3 bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img
            src={model.photo_url}
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

          {/* Zoom Lightbox Trigger */}
          <button
            onClick={() => onPreviewImage(model)}
            className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-all active-press"
            title="Perbesar Foto"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Card Content Body */}
        <div className="p-3.5">
          <div className="flex items-start justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
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
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {model.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

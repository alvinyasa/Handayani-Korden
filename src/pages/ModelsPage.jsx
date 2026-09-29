import React, { useState } from 'react';
import ModelCard from '../components/ModelCard';
import AddModelModal from '../components/AddModelModal';
import { LayoutGrid, Plus, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ModelsPage({
  models = [],
  onCreateModel,
  onDeleteModel,
  loading,
}) {
  const { canEdit } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const filteredModels = models.filter((m) => {
    return (
      !searchQuery.trim() ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-normal leading-tight">
            Model Korden
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
            Katalog model jahitan & foto referensi bentuk korden
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#d96b27] hover:bg-[#c25a1d] text-white rounded-xl font-bold text-xs shadow-md shadow-orange-600/20 flex items-center space-x-1.5 active-press transition-colors shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Model</span>
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari model korden (misal: Smokering, Triple Pleat, Roman Shade...)"
          className="w-full text-xs pl-10 pr-8 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-orange-500/20 focus:border-[#d96b27] focus:outline-none font-medium shadow-xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Models Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-pulse">
              <div className="aspect-4/3 bg-slate-200 dark:bg-slate-800" />
              <div className="p-3.5 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredModels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredModels.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              onDelete={onDeleteModel}
              onPreviewImage={(m) => setPreviewImage(m.photo_url)}
            />
          ))}
        </div>
      ) : (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/50 text-[#d96b27] dark:text-orange-400 flex items-center justify-center mx-auto mb-3 border border-orange-200/60 dark:border-orange-900/50">
            <LayoutGrid className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">Belum Ada Model Korden</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Tidak ada model korden yang cocok dengan kata kunci pencarian.'
              : 'Tambahkan model korden untuk memudahkan customer memilih jenis jahitan dan lekukan kain.'}
          </p>
          {canEdit && !searchQuery && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2.5 bg-[#d96b27] hover:bg-[#c25a1d] text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 inline-flex items-center space-x-1.5 active-press transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Model Pertama</span>
            </button>
          )}
        </div>
      )}

      {/* Add Model Modal */}
      {showAddModal && (
        <AddModelModal
          onClose={() => setShowAddModal(false)}
          onSubmit={onCreateModel}
        />
      )}

      {/* Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-backdrop"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

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
      (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Model Korden</h1>
          <p className="text-xs text-slate-500">Katalog model & foto referensi korden</p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-[#d96b27] hover:bg-[#c25a1d] active:bg-[#a84c16] text-white rounded-xl font-bold text-xs shadow-md shadow-orange-600/20 flex items-center space-x-1.5 active-press"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Model</span>
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari model korden (misal: Smokering, Triple Pleat, Roman...)"
          className="w-full text-xs pl-10 pr-8 py-2.5 rounded-full border border-slate-200 bg-white focus:ring-2 focus:ring-[#d96b27] focus:outline-none font-medium shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Model Cards Grid */}
      {filteredModels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredModels.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              onDelete={onDeleteModel}
              onPreviewImage={(m) => setPreviewImage(m)}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
          <LayoutGrid className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <span className="font-semibold text-slate-600 block text-sm">Tidak ada model korden</span>
          <span className="mt-1 block">Silakan ubah kata kunci pencarian atau tambah model baru.</span>
        </div>
      )}

      {/* Modal: Add Model */}
      {showAddModal && (
        <AddModelModal
          onClose={() => setShowAddModal(false)}
          onSubmit={onCreateModel}
        />
      )}

      {/* Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/20 hover:bg-white/30"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewImage.photo_url}
            alt={previewImage.title}
            className="max-w-full max-h-[75vh] rounded-2xl object-contain shadow-2xl"
          />
          <div className="mt-3 max-w-md text-center bg-slate-900/90 text-white p-3 rounded-2xl border border-white/10">
            <h3 className="font-bold text-sm">{previewImage.title}</h3>
            {previewImage.notes && (
              <p className="text-xs text-slate-300 mt-1 whitespace-pre-line text-left leading-relaxed">
                {previewImage.notes}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

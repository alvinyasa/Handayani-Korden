import React, { useState, useMemo } from 'react';
import InstallationCard from '../components/InstallationCard';
import AddInstallationModal from '../components/AddInstallationModal';
import { Image as ImageIcon, Plus, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function InstallationsPage({
  installationPhotos = [],
  onUploadInstallation,
  onDeleteInstallation,
  loading,
}) {
  const { canEdit } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatalogFilter, setSelectedCatalogFilter] = useState('Semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Extract unique catalog names from installation photos
  const catalogNames = useMemo(() => {
    const set = new Set();
    installationPhotos.forEach((p) => {
      if (p.catalog_name) set.add(p.catalog_name);
    });
    return Array.from(set).sort();
  }, [installationPhotos]);

  // Filter installation photos by search query & selected catalog chip
  const filteredPhotos = useMemo(() => {
    return installationPhotos.filter((photo) => {
      // Catalog filter
      if (selectedCatalogFilter !== 'Semua' && photo.catalog_name !== selectedCatalogFilter) {
        return false;
      }
      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const catMatch = photo.catalog_name && photo.catalog_name.toLowerCase().includes(q);
      const roomMatch = photo.room_type && photo.room_type.toLowerCase().includes(q);
      const captionMatch = photo.caption && photo.caption.toLowerCase().includes(q);
      return catMatch || roomMatch || captionMatch;
    });
  }, [installationPhotos, selectedCatalogFilter, searchQuery]);

  return (
    <div className="space-y-4 pb-4">
      {/* Top Header (Matching ModelsPage UI) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Foto Pemasangan</h1>
          <p className="text-xs text-slate-500">Katalog foto hasil pemasangan korden di lapangan</p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-[#d96b27] hover:bg-[#c25a1d] active:bg-[#a84c16] text-white rounded-xl font-bold text-xs shadow-md shadow-orange-600/20 flex items-center space-x-1.5 active-press"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Foto</span>
          </button>
        )}
      </div>

      {/* Search Filter Box (Identical to ModelsPage Search) */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari foto pemasangan (misal: Katalog Arona, Ruang Tamu, Minimalis...)"
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

      {/* Catalog Filter Chips */}
      {catalogNames.length > 0 && (
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCatalogFilter('Semua')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              selectedCatalogFilter === 'Semua'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua ({installationPhotos.length})
          </button>
          {catalogNames.map((catName) => {
            const count = installationPhotos.filter((p) => p.catalog_name === catName).length;
            const isSelected = selectedCatalogFilter === catName;
            return (
              <button
                key={catName}
                onClick={() => setSelectedCatalogFilter(catName)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#d96b27] text-white shadow-xs font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {catName} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Photo Cards Grid (Identical Grid to ModelsPage) */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredPhotos.map((photo) => (
            <InstallationCard
              key={photo.id}
              photo={photo}
              onDelete={onDeleteInstallation}
              onPreviewImage={(p) => setPreviewImage(p)}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <span className="font-semibold text-slate-600 block text-sm">Tidak ada foto pemasangan</span>
          <span className="mt-1 block">Silakan ubah kata kunci pencarian atau tambah foto pemasangan baru.</span>
        </div>
      )}

      {/* Modal: Add Installation Photo */}
      {showAddModal && (
        <AddInstallationModal
          existingCatalogs={catalogNames}
          onClose={() => setShowAddModal(false)}
          onSubmit={onUploadInstallation}
        />
      )}

      {/* Lightbox Preview Modal */}
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
            alt={previewImage.caption || previewImage.catalog_name || 'Foto Pemasangan'}
            className="max-w-full max-h-[75vh] rounded-2xl object-contain shadow-2xl"
          />
          <div className="mt-3 max-w-md text-center bg-slate-900/90 text-white p-3.5 rounded-2xl border border-white/10">
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-orange-400">
              Katalog {previewImage.catalog_name}
            </h3>
            {previewImage.room_type && (
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                {previewImage.room_type}
              </p>
            )}
            {previewImage.caption && (
              <p className="text-xs text-slate-300 mt-2 whitespace-pre-line text-left leading-relaxed">
                {previewImage.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

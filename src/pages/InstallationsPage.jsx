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
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Foto Pemasangan</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Katalog foto hasil pemasangan korden di lapangan</p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-[#d96b27] hover:bg-[#c25a1d] text-white rounded-xl font-bold text-xs shadow-md shadow-orange-600/20 flex items-center space-x-1.5 active-press transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Foto</span>
          </button>
        )}
      </div>

      {/* Search Filter Box */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari foto pemasangan (misal: Arona, Ruang Tamu, Villa...)"
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

      {/* Catalog Filter Chips */}
      {catalogNames.length > 0 && (
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
          <button
            onClick={() => setSelectedCatalogFilter('Semua')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active-press ${
              selectedCatalogFilter === 'Semua'
                ? 'bg-[#d96b27] text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active-press ${
                  isSelected
                    ? 'bg-[#d96b27] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {catName} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Loading Skeleton */}
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
      ) : filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredPhotos.map((photo) => (
            <InstallationCard
              key={photo.id}
              photo={photo}
              onDelete={onDeleteInstallation}
              onPreviewImage={(p) => setPreviewImage(p.photo_url)}
            />
          ))}
        </div>
      ) : (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/50 text-[#d96b27] dark:text-orange-400 flex items-center justify-center mx-auto mb-3 border border-orange-200/60 dark:border-orange-900/50">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">Belum Ada Foto Pemasangan</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            {searchQuery || selectedCatalogFilter !== 'Semua'
              ? 'Tidak ada foto yang cocok dengan pencarian atau filter yang dipilih.'
              : 'Dokumentasikan hasil pemasangan gorden di lapangan agar customer bisa melihat contoh aslinya.'}
          </p>
          {canEdit && !searchQuery && selectedCatalogFilter === 'Semua' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2.5 bg-[#d96b27] hover:bg-[#c25a1d] text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 inline-flex items-center space-x-1.5 active-press transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Foto Pertama</span>
            </button>
          )}
        </div>
      )}

      {/* Add Installation Modal */}
      {showAddModal && (
        <AddInstallationModal
          existingCatalogs={catalogNames}
          onClose={() => setShowAddModal(false)}
          onSubmit={onUploadInstallation}
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

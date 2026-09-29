import React, { useState, useEffect } from 'react';
import { Search, X, Table, LayoutGrid, Image as ImageIcon, Check, ChevronRight } from 'lucide-react';
import { searchAll } from '../services/api';

export default function GlobalSearchModal({
  onClose,
  onSelectCatalog,
  onSelectModel,
  onSelectPhoto,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ catalogs: [], models: [], photos: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ catalogs: [], models: [], photos: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchAll(query);
        if (res.success) {
          setResults(res.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const totalFound =
    results.catalogs.length + results.models.length + results.photos.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-xs p-3 pt-6 sm:pt-16">
      <div className="w-full max-w-md bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#444444] overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-top-4">
        {/* Search Input Bar */}
        <div className="p-3.5 bg-slate-900 dark:bg-[#121212] text-white dark:text-[#E0E0E0] border-b border-transparent dark:border-[#444444] flex items-center space-x-2">
          <Search className="w-5 h-5 text-slate-400 dark:text-[#888888] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari katalog (Arona), motif (A), warna, model..."
            className="flex-1 bg-transparent text-sm text-white dark:text-[#E0E0E0] placeholder-slate-400 dark:placeholder-[#888888] focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-slate-800 dark:hover:bg-[#333333] text-slate-400 dark:text-[#888888] hover:text-white dark:hover:text-[#E0E0E0]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2.5 py-1 bg-slate-800 dark:bg-[#2A2A2A] hover:bg-slate-700 dark:hover:bg-[#333333] text-slate-300 dark:text-[#B0B0B0] rounded-lg border border-transparent dark:border-[#444444]"
          >
            Tutup
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 bg-white dark:bg-[#1E1E1E]">
          {loading && (
            <div className="text-center py-6 text-xs font-semibold text-slate-400 dark:text-[#888888] animate-pulse">
              Mencari data stok & katalog...
            </div>
          )}

          {!loading && !query && (
            <div className="py-8 text-center text-slate-400 dark:text-[#888888] text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400 dark:text-[#888888]" />
              <span>Ketik nama katalog, kode motif (A, B..), kode warna (1, 2..), atau nama model korden.</span>
            </div>
          )}

          {!loading && query && totalFound === 0 && (
            <div className="py-8 text-center text-slate-400 dark:text-[#888888] text-xs">
              Tidak ditemukan data yang cocok dengan "{query}".
            </div>
          )}

          {/* 1. Catalogs & Variants Match */}
          {results.catalogs.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-extrabold text-slate-400 dark:text-[#888888] uppercase tracking-wider flex items-center space-x-1">
                <Table className="w-3.5 h-3.5" />
                <span>Katalog & Stok Kain ({results.catalogs.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.catalogs.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      onSelectCatalog(cat.id);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] hover:bg-emerald-50/60 dark:hover:bg-[#333333] border border-slate-200 dark:border-[#444444] cursor-pointer flex items-center justify-between transition-colors active-press"
                  >
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-[#E0E0E0]">
                        Katalog {cat.name}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-slate-500 dark:text-[#B0B0B0]">
                        <span>{cat.motifs?.length || 0} Motif</span>
                        <span>•</span>
                        <span>{cat.colors?.length || 0} Warna</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#888888]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Models Match */}
          {results.models.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-extrabold text-slate-400 dark:text-[#888888] uppercase tracking-wider flex items-center space-x-1">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Model Korden ({results.models.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.models.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => {
                      onSelectModel(model);
                      onClose();
                    }}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] hover:bg-slate-100 dark:hover:bg-[#333333] border border-slate-200 dark:border-[#444444] cursor-pointer flex items-center space-x-3 transition-colors active-press"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-[#333333] shrink-0 border border-slate-200 dark:border-[#444444]">
                      <img src={model.photo_url} alt={model.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-[#E0E0E0] truncate">{model.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-[#B0B0B0] truncate mt-0.5">{model.notes || model.category}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#888888] shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Photos Match */}
          {results.photos.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-extrabold text-slate-400 dark:text-[#888888] uppercase tracking-wider flex items-center space-x-1">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Foto Pemasangan ({results.photos.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => {
                      onSelectPhoto(photo);
                      onClose();
                    }}
                    className="p-2 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] hover:bg-slate-100 dark:hover:bg-[#333333] border border-slate-200 dark:border-[#444444] cursor-pointer flex items-center space-x-3 transition-colors active-press"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-[#333333] shrink-0 border border-slate-200 dark:border-[#444444]">
                      <img src={photo.photo_url} alt={photo.caption} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-[#E0E0E0]">{photo.catalog_name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-[#888888]">•</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">M:{photo.motif_code} W:{photo.color_code}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-[#B0B0B0] truncate mt-0.5">{photo.caption || photo.room_type}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#888888] shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Check,
  X,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Layers,
  Plus,
  Trash2,
  Edit,
  Sparkles
} from 'lucide-react';

export default function StockCardGrid({
  catalogs = [],
  onToggleStock,
  onBulkSetStock,
  onSelectCell,
  onOpenAddCatalog,
  onEditCatalog,
  onDeleteCatalog,
  installationPhotos = [],
}) {
  const { canEdit, isAdmin } = useAuth();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatalogFilter, setSelectedCatalogFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua'); // 'Semua' | 'Ready' | 'Kosong'

  // Calculate global summary counts
  const { totalVariants, totalReady, totalKosong } = useMemo(() => {
    let variants = 0;
    let ready = 0;
    let kosong = 0;

    catalogs.forEach((cat) => {
      const motifs = cat.motifs || [];
      const colors = cat.colors || [];
      const matrix = cat.stockMatrix || {};

      motifs.forEach((m) => {
        colors.forEach((c) => {
          variants++;
          const item = matrix[m.id]?.[c.id];
          if (item && Number(item.is_ready) === 1) ready++;
          else kosong++;
        });
      });
    });

    return { totalVariants: variants, totalReady: ready, totalKosong: kosong };
  }, [catalogs]);

  // Filter catalogs based on search query, catalog chip, and status filter
  const filteredCatalogs = useMemo(() => {
    return catalogs.filter((cat) => {
      // 1. Catalog chip filter
      if (selectedCatalogFilter !== 'Semua' && cat.name.toLowerCase() !== selectedCatalogFilter.toLowerCase()) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = cat.name.toLowerCase().includes(q);
        const matchSub = (cat.subtitle || cat.description || '').toLowerCase().includes(q);
        const matchRack = (cat.rack_location || '').toLowerCase().includes(q);
        const matchColorCode = cat.colors?.some((c) => c.code.toLowerCase() === q);
        const matchMotifCode = cat.motifs?.some((m) => m.code.toLowerCase() === q);

        if (!matchName && !matchSub && !matchRack && !matchColorCode && !matchMotifCode) {
          return false;
        }
      }

      return true;
    });
  }, [catalogs, selectedCatalogFilter, searchQuery]);

  const handleToggleClick = (e, cat, motif, color, item) => {
    e.stopPropagation();
    if (canEdit) {
      const currentReady = item ? Number(item.is_ready) === 1 : false;
      onToggleStock({
        catalog_id: cat.id,
        motif_id: motif.id,
        color_id: color.id,
        is_ready: !currentReady ? 1 : 0,
        notes: item?.notes || '',
      });
    } else {
      // For Teknisi: open detail modal / photos
      onSelectCell({
        catalog: cat,
        motif,
        color,
        item,
      });
    }
  };

  return (
    <div className="space-y-3.5 pb-6">
      {/* 1. Top Search Bar & Stat Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
        {/* Search Bar Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari katalog (misal: Maroko, Berlin, Arona) atau nomor seri..."
            className="w-full text-xs pl-10 pr-8 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#d96b27] shadow-xs font-medium transition-all"
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

        {/* Stat Filter Badges */}
        <div className="flex items-center space-x-1.5 shrink-0 self-start sm:self-auto overflow-x-auto no-scrollbar">
          {/* Semua */}
          <button
            onClick={() => setStatusFilter('Semua')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active-press flex items-center space-x-1 ${
              statusFilter === 'Semua'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>Semua</span>
            <span className="font-mono ml-0.5 opacity-90">{totalVariants}</span>
          </button>

          {/* Ready */}
          <button
            onClick={() => setStatusFilter(statusFilter === 'Ready' ? 'Semua' : 'Ready')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active-press flex items-center space-x-1 ${
              statusFilter === 'Ready'
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20'
                : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-500/50 dark:border-emerald-600/40 hover:bg-emerald-50 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Ready</span>
            <span className="font-mono ml-0.5 font-extrabold">{totalReady}</span>
          </button>

          {/* Kosong */}
          <button
            onClick={() => setStatusFilter(statusFilter === 'Kosong' ? 'Semua' : 'Kosong')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active-press flex items-center space-x-1 ${
              statusFilter === 'Kosong'
                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/20'
                : 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-rose-400/60 dark:border-rose-600/40 hover:bg-rose-50 dark:hover:bg-slate-800'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            <span>Kosong</span>
            <span className="font-mono ml-0.5 font-extrabold">{totalKosong}</span>
          </button>
        </div>
      </div>

      {/* 2. Horizontal Catalog Filter Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar text-xs">
        <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 font-bold px-1 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>Katalog:</span>
        </div>

        {/* Chip 'Semua' */}
        <button
          onClick={() => setSelectedCatalogFilter('Semua')}
          className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all active-press ${
            selectedCatalogFilter === 'Semua'
              ? 'bg-[#d96b27] text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Semua
        </button>

        {/* Dynamic Catalog Chips */}
        {catalogs.map((cat) => {
          const isActive = selectedCatalogFilter.toLowerCase() === cat.name.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCatalogFilter(cat.name)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all active-press ${
                isActive
                  ? 'bg-[#d96b27] text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </button>
          );
        })}

        {/* Admin Add Catalog Button */}
        {canEdit && (
          <button
            onClick={onOpenAddCatalog}
            className="px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap bg-orange-50 dark:bg-orange-950/40 text-[#d96b27] dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 hover:bg-orange-100 flex items-center space-x-1 active-press"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Katalog Baru</span>
          </button>
        )}
      </div>

      {/* 3. Catalog Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCatalogs.map((catalog) => {
          const motifs = catalog.motifs || [];
          const colors = catalog.colors || [];
          const matrix = catalog.stockMatrix || {};

          // Calculate ready vs total for this catalog card
          let catTotal = 0;
          let catReady = 0;
          motifs.forEach((m) => {
            colors.forEach((c) => {
              catTotal++;
              const itm = matrix[m.id]?.[c.id];
              if (itm && Number(itm.is_ready) === 1) catReady++;
            });
          });

          // If status filter is active, check if card matches
          if (statusFilter === 'Ready' && catReady === 0) return null;
          if (statusFilter === 'Kosong' && catReady === catTotal) return null;

          // Group motifs into pairs (e.g. A & B, C & D)
          const motifPairs = [];
          for (let i = 0; i < motifs.length; i += 2) {
            motifPairs.push(motifs.slice(i, i + 2));
          }

          return (
            <div
              key={catalog.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-all"
            >
              {/* Card Header (Terracotta Orange) */}
              <div className="bg-[#d96b27] px-3.5 py-2.5 text-white flex items-center justify-between">
                <div className="flex items-baseline space-x-1.5 min-w-0 pr-2">
                  <h3 className="font-black text-sm uppercase tracking-wide truncate">
                    {catalog.name}
                  </h3>
                  <span className="text-[11px] font-normal text-white/90 truncate">
                    ({catalog.subtitle || catalog.description || 'Kain Korden'})
                  </span>
                </div>

                {/* Admin Edit/Delete Actions */}
                <div className="flex items-center space-x-1.5 shrink-0">
                  {canEdit && (
                    <div className="flex items-center space-x-0.5">
                      {/* Edit Table Button */}
                      <button
                        onClick={() => onEditCatalog(catalog)}
                        className="p-1 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"
                        title="Edit Tabel (Tambah Kode/Warna)"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Catalog Button */}
                      <button
                        onClick={() => onDeleteCatalog(catalog.id, catalog.name)}
                        className="p-1 rounded-md hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                        title="Hapus Katalog"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body - Table Grid */}
              <div className="flex-1 bg-white dark:bg-slate-900">
                {motifPairs.map((pair, pairIdx) => {
                  const motifA = pair[0];
                  const motifB = pair[1];

                  return (
                    <div key={pairIdx} className="w-full">
                      {/* Sub-header Row (Warm Amber Background) */}
                      <div className="grid grid-cols-4 bg-[#faecd8] dark:bg-amber-950/40 text-slate-800 dark:text-amber-200 text-xs font-bold text-center border-b border-slate-200 dark:border-slate-800 py-1.5 px-2">
                        <div className="font-mono text-slate-900 dark:text-white">{motifA?.code || '-'}</div>
                        <div className="text-[11px] font-semibold text-slate-600 dark:text-amber-300/80">status</div>
                        <div className="font-mono text-slate-900 dark:text-white">{motifB ? motifB.code : ''}</div>
                        <div className="text-[11px] font-semibold text-slate-600 dark:text-amber-300/80">
                          {motifB ? 'status' : ''}
                        </div>
                      </div>

                      {/* Rows for each color index */}
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {colors.map((color) => {
                          const itemA = motifA ? matrix[motifA.id]?.[color.id] : null;
                          const isReadyA = itemA ? Number(itemA.is_ready) === 1 : false;

                          const itemB = motifB ? matrix[motifB.id]?.[color.id] : null;
                          const isReadyB = itemB ? Number(itemB.is_ready) === 1 : false;

                          return (
                            <div
                              key={color.id}
                              className="grid grid-cols-4 items-center py-1.5 px-2 text-center text-xs hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              {/* Motif A: Color Number */}
                              <div
                                onClick={() =>
                                  onSelectCell({
                                    catalog,
                                    motif: motifA,
                                    color,
                                    item: itemA,
                                  })
                                }
                                className="font-extrabold text-slate-800 dark:text-slate-200 font-mono text-xs cursor-pointer hover:text-[#d96b27] dark:hover:text-orange-400"
                              >
                                {color.code}
                              </div>

                              {/* Motif A: Status Capsule Button */}
                              <div className="flex justify-center px-1">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleClick(e, catalog, motifA, color, itemA)}
                                  className={`w-full max-w-[58px] py-1 px-2 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all active:scale-95 ${
                                    isReadyA
                                      ? 'bg-[#1c7446] hover:bg-[#166039] text-white'
                                      : 'bg-[#a6343f] hover:bg-[#8f2832] text-white'
                                  }`}
                                  title={canEdit ? 'Klik untuk toggle status' : 'Klik untuk lihat detail'}
                                >
                                  {isReadyA ? (
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  ) : (
                                    <X className="w-3.5 h-3.5 stroke-[3]" />
                                  )}
                                </button>
                              </div>

                              {/* Motif B: Color Number (if exists) */}
                              {motifB ? (
                                <>
                                  <div
                                    onClick={() =>
                                      onSelectCell({
                                        catalog,
                                        motif: motifB,
                                        color,
                                        item: itemB,
                                      })
                                    }
                                    className="font-extrabold text-slate-800 dark:text-slate-200 font-mono text-xs cursor-pointer hover:text-[#d96b27] dark:hover:text-orange-400"
                                  >
                                    {color.code}
                                  </div>

                                  {/* Motif B: Status Capsule Button */}
                                  <div className="flex justify-center px-1">
                                    <button
                                      type="button"
                                      onClick={(e) => handleToggleClick(e, catalog, motifB, color, itemB)}
                                      className={`w-full max-w-[58px] py-1 px-2 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all active:scale-95 ${
                                        isReadyB
                                          ? 'bg-[#1c7446] hover:bg-[#166039] text-white'
                                          : 'bg-[#a6343f] hover:bg-[#8f2832] text-white'
                                      }`}
                                      title={canEdit ? 'Klik untuk toggle status' : 'Klik untuk lihat detail'}
                                    >
                                      {isReadyB ? (
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      ) : (
                                        <X className="w-3.5 h-3.5 stroke-[3]" />
                                      )}
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div></div>
                                  <div></div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Quick Add Motif / Color Row for Admin */}
                {canEdit && (
                  <div className="p-2 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
                    <button
                      onClick={() => onEditCatalog(catalog)}
                      className="w-full py-1.5 px-3 rounded-xl border border-dashed border-[#d96b27]/40 text-[#d96b27] dark:text-orange-400 hover:bg-[#d96b27]/10 text-xs font-bold flex items-center justify-center space-x-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Edit Tabel / Tambah Kode & Warna</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Card Footer (Last Update Date only) */}
              <div className="bg-slate-50/80 dark:bg-slate-850/80 border-t border-slate-100 dark:border-slate-800 px-3 py-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-end font-medium">
                <div className="flex items-center space-x-1 shrink-0">
                  <span className="text-slate-400 dark:text-slate-500">Update:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">
                    {catalog.last_updated_date || '2026-08-26'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCatalogs.length === 0 && (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs shadow-xs">
          <Layers className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <span className="font-bold text-slate-700 dark:text-slate-200 block text-sm">Tidak ada katalog kain yang cocok</span>
          <span className="mt-1 block">Silakan sesuaikan kata kunci pencarian atau filter katalog.</span>
        </div>
      )}
    </div>
  );
}

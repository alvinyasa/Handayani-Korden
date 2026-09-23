import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Check,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  Layers,
  Palette,
  AlertCircle
} from 'lucide-react';

export default function StockExcelTable({
  catalogs,
  activeCatalogId,
  setActiveCatalogId,
  onToggleStock,
  onSelectCell,
  onOpenAddCatalog,
  onOpenAddMotif,
  onOpenAddColor,
  onDeleteCatalog,
  onDeleteMotif,
  onDeleteColor,
  onBulkSet,
  installationPhotos = [],
}) {
  const { canEdit, isTeknisi } = useAuth();
  const [animatingCell, setAnimatingCell] = useState(null);

  const activeCatalog = catalogs.find((c) => Number(c.id) === Number(activeCatalogId)) || catalogs[0];

  if (!activeCatalog) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-200">
        <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-lg">Belum Ada Katalog Kain</h3>
        <p className="text-slate-500 text-sm mt-1 mb-4">Mulai dengan menambahkan katalog korden pertama Anda.</p>
        {canEdit && (
          <button
            onClick={onOpenAddCatalog}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20 active-press"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Katalog Baru</span>
          </button>
        )}
      </div>
    );
  }

  const { motifs = [], colors = [], stockMatrix = {} } = activeCatalog;

  // Calculate stats for current catalog
  let totalReady = 0;
  let totalKosong = 0;
  motifs.forEach((m) => {
    colors.forEach((c) => {
      const item = stockMatrix[m.id]?.[c.id];
      if (item && Number(item.is_ready) === 1) totalReady++;
      else totalKosong++;
    });
  });

  const handleCellClick = (motif, color, currentItem) => {
    if (canEdit) {
      const currentReady = currentItem ? Number(currentItem.is_ready) === 1 : false;
      const nextReady = !currentReady;
      const cellKey = `${motif.id}-${color.id}`;
      setAnimatingCell(cellKey);
      setTimeout(() => setAnimatingCell(null), 300);

      onToggleStock({
        catalog_id: activeCatalog.id,
        motif_id: motif.id,
        color_id: color.id,
        is_ready: nextReady ? 1 : 0,
        notes: currentItem?.notes || '',
      });
    } else {
      // For Teknisi, open detail modal
      onSelectCell({
        catalog: activeCatalog,
        motif,
        color,
        item: currentItem,
      });
    }
  };

  const getPhotosForCell = (motifId, colorId) => {
    return installationPhotos.filter(
      (p) =>
        Number(p.catalog_id) === Number(activeCatalog.id) &&
        Number(p.motif_id) === Number(motifId) &&
        Number(p.color_id) === Number(colorId)
    );
  };

  return (
    <div className="space-y-3">
      {/* 1. Catalog Selector Tabs (Horizontal Scrollable) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-0.5 px-0.5 no-scrollbar">
        {catalogs.map((cat) => {
          const isActive = Number(cat.id) === Number(activeCatalog.id);
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCatalogId(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 active-press ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 ring-2 ring-slate-900/10'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <span>{cat.name}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>
          );
        })}

        {canEdit && (
          <button
            onClick={onOpenAddCatalog}
            className="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center space-x-1 active-press"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Katalog Baru</span>
          </button>
        )}
      </div>

      {/* 2. Catalog Header & Summary Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-extrabold text-slate-900">Katalog {activeCatalog.name}</h2>
              {canEdit && (
                <button
                  onClick={() => onDeleteCatalog(activeCatalog.id, activeCatalog.name)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                  title="Hapus Katalog"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {activeCatalog.description && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{activeCatalog.description}</p>
            )}
          </div>

          {/* Ready / Kosong Stats */}
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{totalReady}</span>
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
              <XCircle className="w-3.5 h-3.5" />
              <span>{totalKosong}</span>
            </div>
          </div>
        </div>

        {/* Quick Instructions & Legend */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-emerald-800">✓ Ready</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="font-semibold text-rose-800">✗ Kosong</span>
            </span>
          </div>

          <div className="text-slate-400 font-medium">
            {canEdit ? '💡 Tap sel untuk toggle status' : '💡 Tap sel untuk detail varian'}
          </div>
        </div>
      </div>

      {/* 3. Excel Matrix Table with Horizontal & Vertical Scroll */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto excel-scroll max-w-full">
          <table className="w-full border-collapse text-left select-none">
            <thead>
              <tr className="bg-slate-800 text-white divide-x divide-slate-700">
                {/* Top-Left Header Cell: Motif \ Warna */}
                <th className="sticky left-0 z-20 bg-slate-900 p-2.5 min-w-[110px] sm:min-w-[130px] border-b border-slate-700 shadow-sm">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Motif ↓</span>
                      <span>Warna →</span>
                    </div>
                    {canEdit && (
                      <div className="flex items-center space-x-1 mt-1.5">
                        <button
                          onClick={() => onOpenAddMotif(activeCatalog.id)}
                          className="flex-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-emerald-400 font-semibold border border-slate-700 flex items-center justify-center space-x-0.5"
                          title="Tambah Baris Motif"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>+Motif</span>
                        </button>
                        <button
                          onClick={() => onOpenAddColor(activeCatalog.id)}
                          className="flex-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-400 font-semibold border border-slate-700 flex items-center justify-center space-x-0.5"
                          title="Tambah Kolom Warna"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>+Warna</span>
                        </button>
                      </div>
                    )}
                  </div>
                </th>

                {/* Color Columns */}
                {colors.map((color) => (
                  <th
                    key={color.id}
                    className="p-2.5 min-w-[90px] sm:min-w-[105px] border-b border-slate-700 text-center relative group"
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-1">
                        <div
                          className="w-3 h-3 rounded-full border border-white/40 shadow-xs"
                          style={{ backgroundColor: color.hex_code || '#94a3b8' }}
                        />
                        <span className="font-mono text-xs font-black text-amber-300">
                          {color.code}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-200 mt-0.5 truncate max-w-[85px]">
                        {color.name || `Warna ${color.code}`}
                      </span>

                      {canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteColor(color.id, color.code);
                          }}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 p-0.5 transition-opacity"
                          title="Hapus Kolom Warna"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {motifs.map((motif) => (
                <tr key={motif.id} className="divide-x divide-slate-200 hover:bg-slate-50/60 transition-colors">
                  {/* Sticky Motif Header (Left Column) */}
                  <th className="sticky left-0 z-10 bg-slate-50 p-2.5 font-medium text-slate-900 border-r border-slate-300 group">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-800 text-white font-mono text-xs font-bold shadow-xs">
                            {motif.code}
                          </span>
                          <span className="text-xs font-bold text-slate-800 truncate max-w-[70px] sm:max-w-[90px]">
                            {motif.name || `Motif ${motif.code}`}
                          </span>
                        </div>
                        {motif.description && (
                          <div className="text-[10px] text-slate-400 font-normal truncate max-w-[100px] mt-0.5">
                            {motif.description}
                          </div>
                        )}
                      </div>

                      {canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMotif(motif.id, motif.code);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition-opacity"
                          title="Hapus Baris Motif"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>

                  {/* Stock Matrix Cells */}
                  {colors.map((color) => {
                    const item = stockMatrix[motif.id]?.[color.id];
                    const isReady = item ? Number(item.is_ready) === 1 : false;
                    const cellKey = `${motif.id}-${color.id}`;
                    const isAnimating = animatingCell === cellKey;
                    const cellPhotos = getPhotosForCell(motif.id, color.id);

                    return (
                      <td
                        key={color.id}
                        onClick={() => handleCellClick(motif, color, item)}
                        className={`p-2 text-center cursor-pointer transition-all duration-150 ${
                          isReady ? 'bg-emerald-50/40 hover:bg-emerald-100/50' : 'bg-rose-50/40 hover:bg-rose-100/50'
                        } ${isAnimating ? 'animate-ready ring-2 ring-inset ring-emerald-500' : ''}`}
                      >
                        <div className="flex flex-col items-center justify-center py-1">
                          {/* Ready / Kosong Badge */}
                          <div
                            className={`w-full py-1.5 px-2 rounded-xl flex items-center justify-center space-x-1 font-bold text-xs shadow-xs transition-transform active:scale-95 ${
                              isReady
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-600/20'
                                : 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/20'
                            }`}
                          >
                            {isReady ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span className="tracking-tight text-[11px]">READY</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5 stroke-[3]" />
                                <span className="tracking-tight text-[11px]">KOSONG</span>
                              </>
                            )}
                          </div>

                          {/* Photos or Notes indicator */}
                          <div className="flex items-center space-x-1 mt-1">
                            {cellPhotos.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectCell({
                                    catalog: activeCatalog,
                                    motif,
                                    color,
                                    item,
                                    initialTab: 'photos',
                                  });
                                }}
                                className="inline-flex items-center space-x-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded-md border border-blue-200"
                                title={`${cellPhotos.length} Foto Pemasangan`}
                              >
                                <ImageIcon className="w-2.5 h-2.5" />
                                <span>{cellPhotos.length} Foto</span>
                              </button>
                            )}

                            {/* Detail info button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectCell({
                                  catalog: activeCatalog,
                                  motif,
                                  color,
                                  item,
                                });
                              }}
                              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                              title="Lihat Detail & Catatan"
                            >
                              <Info className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Bulk Quick Actions for SPV / Kepala Toko */}
      {canEdit && (
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
          <div className="font-bold text-slate-700 mb-2 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aksi Cepat SPV / Kepala Toko:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onBulkSet(activeCatalog.id, true)}
              className="py-2 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl font-semibold flex items-center justify-center space-x-1.5 active-press border border-emerald-300"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Set Semua Ready</span>
            </button>
            <button
              onClick={() => onBulkSet(activeCatalog.id, false)}
              className="py-2 px-3 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl font-semibold flex items-center justify-center space-x-1.5 active-press border border-rose-300"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
              <span>Set Semua Kosong</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

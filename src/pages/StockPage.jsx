import React, { useState } from 'react';
import StockCardGrid from '../components/StockCardGrid';
import StockCellModal from '../components/StockCellModal';
import AddCatalogModal from '../components/AddCatalogModal';
import EditCatalogModal from '../components/EditCatalogModal';
import AddInstallationModal from '../components/AddInstallationModal';
import { RefreshCw, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StockPage({
  catalogs,
  onToggleStock,
  onBulkSetStock,
  onCreateCatalog,
  onUpdateCatalog,
  onDeleteCatalog,
  onAddMotif,
  onDeleteMotif,
  onAddColor,
  onDeleteColor,
  onUploadInstallation,
  installationPhotos,
  onRefresh,
  loading,
}) {
  const { canEdit, isAdmin } = useAuth();

  // Modals state
  const [selectedCell, setSelectedCell] = useState(null);
  const [showAddCatalog, setShowAddCatalog] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState(null);
  const [uploadPhotoConfig, setUploadPhotoConfig] = useState(null);

  // Keep editingCatalog data in sync with latest catalogs list
  const currentEditingCatalog = editingCatalog
    ? catalogs.find((c) => Number(c.id) === Number(editingCatalog.id)) || editingCatalog
    : null;

  return (
    <div className="space-y-3 pb-4">
      {/* Top Title Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Ketersediaan Stok Kain</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Katalog kain, motif & nomor seri warna</p>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs active-press disabled:opacity-50 transition-colors"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#d96b27]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stock Cards Grid */}
      <StockCardGrid
        catalogs={catalogs}
        onToggleStock={onToggleStock}
        onBulkSetStock={onBulkSetStock}
        onSelectCell={(cellData) => setSelectedCell(cellData)}
        onOpenAddCatalog={() => setShowAddCatalog(true)}
        onEditCatalog={(cat) => setEditingCatalog(cat)}
        onDeleteCatalog={onDeleteCatalog}
        installationPhotos={installationPhotos}
      />

      {/* Modal: Edit Catalog Table / Add Motif / Add Color */}
      {currentEditingCatalog && (
        <EditCatalogModal
          catalog={currentEditingCatalog}
          onClose={() => setEditingCatalog(null)}
          onUpdateCatalogInfo={onUpdateCatalog}
          onAddMotif={onAddMotif}
          onDeleteMotif={onDeleteMotif}
          onAddColor={onAddColor}
          onDeleteColor={onDeleteColor}
          onBulkSetStock={onBulkSetStock}
        />
      )}

      {/* Modal: Cell Detail / Variant Info / Direct Installation Photos */}
      {selectedCell && (
        <StockCellModal
          data={selectedCell}
          onClose={() => setSelectedCell(null)}
          onUpdateStock={async (params) => {
            await onToggleStock(params);
          }}
          onOpenUploadPhoto={(config) => {
            setUploadPhotoConfig(config);
          }}
          installationPhotos={installationPhotos}
        />
      )}

      {/* Modal: Add New Catalog */}
      {showAddCatalog && (
        <AddCatalogModal
          onClose={() => setShowAddCatalog(false)}
          onSubmit={async (formData) => {
            const res = await onCreateCatalog(formData);
            return res;
          }}
        />
      )}

      {/* Modal: Add Installation Photo */}
      {uploadPhotoConfig && (
        <AddInstallationModal
          existingCatalogs={catalogs.map((c) => c.name)}
          initialCatalogName={
            catalogs.find((c) => Number(c.id) === Number(uploadPhotoConfig.catalog_id))?.name || ''
          }
          onClose={() => setUploadPhotoConfig(null)}
          onSubmit={onUploadInstallation}
        />
      )}
    </div>
  );
}

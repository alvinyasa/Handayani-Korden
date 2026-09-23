import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import StockPage from './pages/StockPage';
import ModelsPage from './pages/ModelsPage';
import InstallationsPage from './pages/InstallationsPage';
import AccountPage from './pages/AccountPage';
import AdminLoginPage from './pages/AdminLoginPage';
import GlobalSearchModal from './components/GlobalSearchModal';
import {
  fetchCatalogs,
  fetchModels,
  fetchInstallations,
  fetchStats,
  toggleStockStatus,
  bulkSetStock,
  createCatalog,
  updateCatalog,
  deleteCatalog,
  addMotif,
  deleteMotif,
  addColor,
  deleteColor,
  createModel,
  deleteModel,
  createInstallation,
  deleteInstallation,
} from './services/api';
import { CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

function AppContent() {
  const { canEdit, isAdmin, user, logout } = useAuth();

  // Route State: 'app' (main mobile view) | 'admin' (dedicated /admin page)
  const [route, setRoute] = useState(() => {
    return window.location.pathname.startsWith('/admin') ? 'admin' : 'app';
  });

  // Navigation Tab State: 'stock' | 'models' | 'installations' | 'account'
  const [activeTab, setActiveTab] = useState('stock');

  // Data States
  const [catalogs, setCatalogs] = useState([]);
  const [activeCatalogId, setActiveCatalogId] = useState(null);
  const [models, setModels] = useState([]);
  const [installationPhotos, setInstallationPhotos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search Modal State
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null); // { message, type: 'success'|'error' }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Browser History & URL syncing
  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname.startsWith('/admin') ? 'admin' : 'app');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (targetRoute, tab = 'stock') => {
    if (targetRoute === 'admin') {
      window.history.pushState(null, '', '/admin');
      setRoute('admin');
    } else {
      window.history.pushState(null, '', '/');
      setRoute('app');
      setActiveTab(tab);
    }
  };

  // Load all initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [catsRes, modelsRes, photosRes, statsRes] = await Promise.all([
        fetchCatalogs(),
        fetchModels(),
        fetchInstallations(),
        fetchStats(),
      ]);

      if (catsRes.success) {
        setCatalogs(catsRes.data);
        if (catsRes.data.length > 0 && !activeCatalogId) {
          setActiveCatalogId(catsRes.data[0].id);
        }
      }
      if (modelsRes.success) setModels(modelsRes.data);
      if (photosRes.success) setInstallationPhotos(photosRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      showToast('Koneksi ke server bermasalah', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeCatalogId]);

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for Stock operations
  const handleToggleStock = async (params) => {
    // Optimistic UI update
    setCatalogs((prevCats) =>
      prevCats.map((cat) => {
        if (Number(cat.id) === Number(params.catalog_id)) {
          const newMatrix = { ...cat.stockMatrix };
          if (!newMatrix[params.motif_id]) newMatrix[params.motif_id] = {};
          newMatrix[params.motif_id][params.color_id] = {
            ...(newMatrix[params.motif_id][params.color_id] || {}),
            catalog_id: Number(params.catalog_id),
            motif_id: Number(params.motif_id),
            color_id: Number(params.color_id),
            is_ready: params.is_ready,
            notes: params.notes !== undefined ? params.notes : newMatrix[params.motif_id][params.color_id]?.notes || '',
          };
          return { ...cat, stockMatrix: newMatrix };
        }
        return cat;
      })
    );

    try {
      const res = await toggleStockStatus(params);
      if (res.success) {
        const statsRes = await fetchStats();
        if (statsRes.success) setStats(statsRes.data);
      } else {
        showToast('Gagal mengubah stok', 'error');
        loadData();
      }
    } catch (err) {
      showToast('Error koneksi saat ubah stok', 'error');
      loadData();
    }
  };

  const handleBulkSetStock = async (catalogId, isReady) => {
    try {
      const res = await bulkSetStock({
        catalog_id: catalogId,
        is_ready: isReady,
      });
      if (res.success && res.data) {
        setCatalogs((prev) =>
          prev.map((c) => (Number(c.id) === Number(catalogId) ? res.data : c))
        );
        showToast(`Semua varian diset ke ${isReady ? 'READY (✓)' : 'KOSONG (✗)'}`);
        const statsRes = await fetchStats();
        if (statsRes.success) setStats(statsRes.data);
      }
    } catch (err) {
      showToast('Gagal update massal', 'error');
    }
  };

  // Handlers for Catalogs
  const handleCreateCatalog = async (formData) => {
    try {
      const res = await createCatalog(formData);
      if (res.success && res.data) {
        setCatalogs((prev) => [...prev, res.data]);
        setActiveCatalogId(res.data.id);
        showToast('Katalog baru berhasil dibuat');
        const statsRes = await fetchStats();
        if (statsRes.success) setStats(statsRes.data);
        return { success: true, data: res.data };
      }
      return res;
    } catch (err) {
      return { success: false, message: 'Koneksi error' };
    }
  };

  const handleUpdateCatalog = async (catalogId, data) => {
    try {
      const res = await updateCatalog(catalogId, data);
      if (res.success && res.data) {
        setCatalogs((prev) =>
          prev.map((c) => (Number(c.id) === Number(catalogId) ? res.data : c))
        );
        showToast('Informasi katalog diperbarui');
        return { success: true, data: res.data };
      }
      return res;
    } catch (err) {
      return { success: false, message: 'Koneksi error' };
    }
  };

  const handleDeleteCatalog = async (catalogId, catalogName) => {
    if (!window.confirm(`Yakin ingin menghapus Katalog "${catalogName}" beserta semua motif & warnanya?`)) {
      return;
    }
    try {
      const res = await deleteCatalog(catalogId);
      if (res.success) {
        const nextCats = catalogs.filter((c) => Number(c.id) !== Number(catalogId));
        setCatalogs(nextCats);
        if (nextCats.length > 0) setActiveCatalogId(nextCats[0].id);
        showToast(`Katalog "${catalogName}" berhasil dihapus`);
        loadData();
      }
    } catch (err) {
      showToast('Gagal menghapus katalog', 'error');
    }
  };

  // Handlers for Motifs
  const handleAddMotif = async (catalogId, data) => {
    try {
      const res = await addMotif(catalogId, data);
      if (res.success && res.data) {
        setCatalogs((prev) =>
          prev.map((c) => (Number(c.id) === Number(catalogId) ? res.data : c))
        );
        showToast(`Motif ${data.code} berhasil ditambahkan`);
        const statsRes = await fetchStats();
        if (statsRes.success) setStats(statsRes.data);
        return { success: true };
      }
      return res;
    } catch (err) {
      return { success: false, message: 'Koneksi error' };
    }
  };

  const handleDeleteMotif = async (motifId, motifCode) => {
    if (!window.confirm(`Hapus baris Motif ${motifCode}?`)) return;
    try {
      const res = await deleteMotif(motifId);
      if (res.success && res.data) {
        setCatalogs((prev) =>
          prev.map((c) => (Number(c.id) === Number(res.data.id) ? res.data : c))
        );
        showToast(`Motif ${motifCode} dihapus`);
        const statsRes = await fetchStats();
        if (statsRes.success) setStats(statsRes.data);
      }
    } catch (err) {
      showToast('Gagal menghapus motif', 'error');
    }
  };

  // Handlers for Colors
  const handleAddColor = async (catalogId, data) => {
    try {
      const res = await addColor(catalogId, data);
      if (res.success && res.data) {
        setCatalogs((prev) =>
          prev.map((c) => (Number(c.id) === Number(catalogId) ? res.data : c))
        );
        showToast(`Warna ${data.code} berhasil ditambahkan`);
        const statsRes = await fetchStats();
        if (statsRes.success) setStats(statsRes.data);
        return { success: true };
      }
      return res;
    } catch (err) {
      return { success: false, message: 'Koneksi error' };
    }
  };

  const handleDeleteColor = async (colorId, colorCode) => {
    if (!window.confirm(`Hapus kolom Warna ${colorCode}?`)) return;
    try {
      const res = await deleteColor(colorId);
      if (res.success && res.data) {
        setCatalogs((prev) =>
          prev.map((c) => (Number(c.id) === Number(res.data.id) ? res.data : c))
        );
        showToast(`Warna ${colorCode} dihapus`);
        const statsRes = await fetchStats();
        if (statsRes.success) setStats(statsRes.data);
      }
    } catch (err) {
      showToast('Gagal menghapus warna', 'error');
    }
  };

  // Handlers for Curtain Models
  const handleCreateModel = async (formData) => {
    try {
      const res = await createModel(formData);
      if (res.success && res.data) {
        setModels((prev) => [res.data, ...prev]);
        showToast('Model korden berhasil ditambahkan');
        const statsRes = await fetchStats();
        if (statsRes.success) setStats(statsRes.data);
        return { success: true };
      }
      return res;
    } catch (err) {
      return { success: false, message: 'Gagal mengupload model' };
    }
  };

  const handleDeleteModel = async (modelId, modelTitle) => {
    if (!window.confirm(`Hapus model "${modelTitle}"?`)) return;
    try {
      const res = await deleteModel(modelId);
      if (res.success) {
        setModels((prev) => prev.filter((m) => Number(m.id) !== Number(modelId)));
        showToast('Model korden dihapus');
        const statsRes = await fetchStats();
        if (statsRes.success) setStats(statsRes.data);
      }
    } catch (err) {
      showToast('Gagal menghapus model', 'error');
    }
  };

  // Handlers for Installation Photos
  const handleUploadInstallation = async (formData) => {
    try {
      const res = await createInstallation(formData);
      if (res.success && res.data) {
        setInstallationPhotos((prev) => [res.data, ...prev]);
        showToast('Foto pemasangan berhasil diupload');
        const statsRes = await fetchStats();
        if (statsRes.success) setStats(statsRes.data);
        return { success: true };
      }
      return res;
    } catch (err) {
      return { success: false, message: 'Gagal mengupload foto pemasangan' };
    }
  };

  const handleDeleteInstallation = async (photoId) => {
    if (!window.confirm('Hapus foto pemasangan ini?')) return;
    try {
      const res = await deleteInstallation(photoId);
      if (res.success) {
        setInstallationPhotos((prev) => prev.filter((p) => Number(p.id) !== Number(photoId)));
        showToast('Foto pemasangan berhasil dihapus');
        const statsRes = await fetchStats();
        if (statsRes.success) setStats(statsRes.data);
      }
    } catch (err) {
      showToast('Gagal menghapus foto', 'error');
    }
  };

  // Dedicated /admin view
  if (route === 'admin') {
    return (
      <div className="min-h-screen bg-slate-100 font-sans">
        <AdminLoginPage
          onNavigateToApp={(targetTab) => {
            navigateTo('app', targetTab);
            showToast('Selamat datang, Admin Manyu!');
          }}
        />
        {/* Toast */}
        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-3 max-w-sm w-[90%] pointer-events-none">
            <div
              className={`p-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-bold border backdrop-blur-md ${
                toast.type === 'error'
                  ? 'bg-rose-900/90 text-white border-rose-700'
                  : 'bg-slate-900/90 text-white border-slate-700'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="flex-1">{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Regular Mobile App View (Teknisi / Admin logged-in view)
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onNavigateToAdmin={() => navigateTo('admin')}
        onLogout={() => {
          logout();
          showToast('Telah keluar dari akun Admin');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-5">
        {activeTab === 'stock' && (
          <StockPage
            catalogs={catalogs}
            onToggleStock={handleToggleStock}
            onBulkSetStock={handleBulkSetStock}
            onCreateCatalog={handleCreateCatalog}
            onUpdateCatalog={handleUpdateCatalog}
            onDeleteCatalog={handleDeleteCatalog}
            onAddMotif={handleAddMotif}
            onDeleteMotif={handleDeleteMotif}
            onAddColor={handleAddColor}
            onDeleteColor={handleDeleteColor}
            onUploadInstallation={handleUploadInstallation}
            installationPhotos={installationPhotos}
            onRefresh={loadData}
            loading={loading}
          />
        )}

        {activeTab === 'models' && (
          <ModelsPage
            models={models}
            onCreateModel={handleCreateModel}
            onDeleteModel={handleDeleteModel}
            loading={loading}
          />
        )}

        {activeTab === 'installations' && (
          <InstallationsPage
            catalogs={catalogs}
            installationPhotos={installationPhotos}
            onUploadInstallation={handleUploadInstallation}
            onDeleteInstallation={handleDeleteInstallation}
            loading={loading}
          />
        )}

      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Global Search Modal */}
      {showSearchModal && (
        <GlobalSearchModal
          onClose={() => setShowSearchModal(false)}
          onSelectCatalog={(catId) => {
            setActiveCatalogId(catId);
            setActiveTab('stock');
          }}
          onSelectModel={(model) => {
            setActiveTab('models');
          }}
          onSelectPhoto={(photo) => {
            setActiveTab('installations');
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-3 max-w-sm w-[90%] pointer-events-none">
          <div
            className={`p-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-bold border backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-700 shadow-rose-900/20'
                : 'bg-slate-900/90 text-white border-slate-700 shadow-slate-900/30'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

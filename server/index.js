import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from './db.js';
import { upload } from './upload.js';
import { runSeed } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads serving
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Static frontend serving if built
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

// Run initial seed if db is fresh
runSeed();

// ==========================================
// 1. AUTH & USERS
// ==========================================
app.get('/api/auth/users', (req, res) => {
  const users = db.find('users').map(({ password, pin, ...u }) => u);
  res.json({ success: true, data: users });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan sandi wajib diisi' });
  }

  const user = db.find('users', (u) => u.username.toLowerCase() === username.trim().toLowerCase())[0];

  if (!user) {
    return res.status(404).json({ success: false, message: 'Akun admin tidak ditemukan' });
  }

  const validPassword = user.password || user.pin;
  if (password !== validPassword) {
    return res.status(401).json({ success: false, message: 'Sandi yang Anda masukkan salah' });
  }

  const { password: _, pin: __, ...safeUser } = user;
  res.json({ success: true, user: safeUser, message: 'Berhasil masuk sebagai Admin (SPV / Kepala Toko)' });
});

// ==========================================
// 2. DASHBOARD STATS
// ==========================================
app.get('/api/stats', (req, res) => {
  const catalogs = db.find('catalogs');
  const motifs = db.find('motifs');
  const colors = db.find('colors');
  const stockItems = db.find('stock_items');
  const models = db.find('curtain_models');
  const photos = db.find('installation_photos');

  const readyCount = stockItems.filter((s) => Number(s.is_ready) === 1).length;
  const emptyCount = stockItems.filter((s) => Number(s.is_ready) === 0).length;

  res.json({
    success: true,
    data: {
      totalCatalogs: catalogs.length,
      totalMotifs: motifs.length,
      totalColors: colors.length,
      totalStockVariants: stockItems.length,
      readyVariants: readyCount,
      emptyVariants: emptyCount,
      totalModels: models.length,
      totalInstallationPhotos: photos.length,
    },
  });
});

// ==========================================
// 3. CATALOGS & STOCK MATRIX
// ==========================================
app.get('/api/catalogs', (req, res) => {
  const catalogs = db.getAllCatalogsFull();
  res.json({ success: true, data: catalogs });
});

app.get('/api/catalogs/:id', (req, res) => {
  const catalog = db.getCatalogFull(req.params.id);
  if (!catalog) return res.status(404).json({ success: false, message: 'Katalog tidak ditemukan' });
  res.json({ success: true, data: catalog });
});

app.post('/api/catalogs', upload.single('image'), (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Nama katalog wajib diisi' });

  const existing = db.find('catalogs', (c) => c.name.toLowerCase() === name.trim().toLowerCase())[0];
  if (existing) {
    return res.status(400).json({ success: false, message: 'Katalog dengan nama tersebut sudah ada' });
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const newCat = db.insert('catalogs', {
    name: name.trim(),
    description: description || '',
    image_url: imageUrl,
  });

  // Default motif A and color 1
  const defaultMotif = db.insert('motifs', {
    catalog_id: newCat.id,
    code: 'A',
    name: 'Motif A',
    description: 'Motif Utama',
  });
  const defaultColor = db.insert('colors', {
    catalog_id: newCat.id,
    code: '1',
    name: 'Warna 1',
    hex_code: '#94a3b8',
  });
  db.insert('stock_items', {
    catalog_id: newCat.id,
    motif_id: defaultMotif.id,
    color_id: defaultColor.id,
    is_ready: 1,
    notes: 'Inisialisasi katalog baru',
  });

  res.status(201).json({ success: true, data: db.getCatalogFull(newCat.id) });
});

app.put('/api/catalogs/:id', (req, res) => {
  const { name, description, subtitle, rack_location, last_updated_date } = req.body;
  const updates = {
    ...(name ? { name: name.trim() } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(subtitle !== undefined ? { subtitle } : {}),
    ...(rack_location !== undefined ? { rack_location } : {}),
    last_updated_date: last_updated_date || new Date().toISOString().split('T')[0],
  };

  const updated = db.update('catalogs', req.params.id, updates);
  if (!updated) return res.status(404).json({ success: false, message: 'Katalog tidak ditemukan' });
  res.json({ success: true, data: db.getCatalogFull(req.params.id) });
});

app.delete('/api/catalogs/:id', (req, res) => {
  const id = Number(req.params.id);
  const deleted = db.delete('catalogs', id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Katalog tidak ditemukan' });

  // Cascade delete
  db.data.motifs = db.data.motifs.filter((m) => Number(m.catalog_id) !== id);
  db.data.colors = db.data.colors.filter((c) => Number(c.catalog_id) !== id);
  db.data.stock_items = db.data.stock_items.filter((s) => Number(s.catalog_id) !== id);
  db.data.installation_photos = db.data.installation_photos.filter((p) => Number(p.catalog_id) !== id);
  db.save();

  res.json({ success: true, message: 'Katalog dan semua variasinya berhasil dihapus' });
});

// Motif routes
app.post('/api/catalogs/:id/motifs', (req, res) => {
  const catalogId = Number(req.params.id);
  const { code, name, description } = req.body;

  if (!code) return res.status(400).json({ success: false, message: 'Kode motif wajib diisi (misal A, B, C)' });

  const upperCode = code.trim().toUpperCase();
  const existing = db.find('motifs', (m) => Number(m.catalog_id) === catalogId && m.code === upperCode)[0];
  if (existing) {
    return res.status(400).json({ success: false, message: `Kode motif ${upperCode} sudah ada pada katalog ini` });
  }

  const newMotif = db.insert('motifs', {
    catalog_id: catalogId,
    code: upperCode,
    name: name || `Motif ${upperCode}`,
    description: description || '',
  });

  // Initialize stock for all existing colors of this catalog
  const catalogColors = db.find('colors', (c) => Number(c.catalog_id) === catalogId);
  for (const c of catalogColors) {
    db.toggleStock(catalogId, newMotif.id, c.id, 1, 'Stok baru ditambahkan');
  }

  res.status(201).json({ success: true, data: db.getCatalogFull(catalogId) });
});

app.delete('/api/motifs/:id', (req, res) => {
  const motifId = Number(req.params.id);
  const motif = db.findById('motifs', motifId);
  if (!motif) return res.status(404).json({ success: false, message: 'Motif tidak ditemukan' });

  const catalogId = motif.catalog_id;
  db.delete('motifs', motifId);
  db.data.stock_items = db.data.stock_items.filter((s) => Number(s.motif_id) !== motifId);
  db.data.installation_photos = db.data.installation_photos.filter((p) => Number(p.motif_id) !== motifId);
  db.save();

  res.json({ success: true, data: db.getCatalogFull(catalogId) });
});

// Color routes
app.post('/api/catalogs/:id/colors', (req, res) => {
  const catalogId = Number(req.params.id);
  const { code, name, hex_code } = req.body;

  if (!code) return res.status(400).json({ success: false, message: 'Kode warna wajib diisi (misal 1, 2, 3)' });

  const trimmedCode = code.trim();
  const existing = db.find('colors', (c) => Number(c.catalog_id) === catalogId && c.code === trimmedCode)[0];
  if (existing) {
    return res.status(400).json({ success: false, message: `Kode warna ${trimmedCode} sudah ada pada katalog ini` });
  }

  const newColor = db.insert('colors', {
    catalog_id: catalogId,
    code: trimmedCode,
    name: name || `Warna ${trimmedCode}`,
    hex_code: hex_code || '#cbd5e1',
  });

  // Initialize stock for all existing motifs of this catalog
  const catalogMotifs = db.find('motifs', (m) => Number(m.catalog_id) === catalogId);
  for (const m of catalogMotifs) {
    db.toggleStock(catalogId, m.id, newColor.id, 1, 'Stok baru ditambahkan');
  }

  res.status(201).json({ success: true, data: db.getCatalogFull(catalogId) });
});

app.delete('/api/colors/:id', (req, res) => {
  const colorId = Number(req.params.id);
  const color = db.findById('colors', colorId);
  if (!color) return res.status(404).json({ success: false, message: 'Warna tidak ditemukan' });

  const catalogId = color.catalog_id;
  db.delete('colors', colorId);
  db.data.stock_items = db.data.stock_items.filter((s) => Number(s.color_id) !== colorId);
  db.data.installation_photos = db.data.installation_photos.filter((p) => Number(p.color_id) !== colorId);
  db.save();

  res.json({ success: true, data: db.getCatalogFull(catalogId) });
});

// ==========================================
// 4. STOCK TOGGLE & BULK UPDATE
// ==========================================
app.post('/api/stock/toggle', (req, res) => {
  const { catalog_id, motif_id, color_id, is_ready, notes } = req.body;
  if (!catalog_id || !motif_id || !color_id) {
    return res.status(400).json({ success: false, message: 'Parameter catalog_id, motif_id, color_id wajib diisi' });
  }

  const item = db.toggleStock(catalog_id, motif_id, color_id, is_ready, notes);
  res.json({ success: true, data: item });
});

app.post('/api/stock/bulk-set', (req, res) => {
  const { catalog_id, motif_id, color_id, is_ready, notes } = req.body;
  if (!catalog_id) return res.status(400).json({ success: false, message: 'catalog_id wajib diisi' });

  const targetState = is_ready ? 1 : 0;
  const items = db.find('stock_items', (s) => {
    let match = Number(s.catalog_id) === Number(catalog_id);
    if (motif_id) match = match && Number(s.motif_id) === Number(motif_id);
    if (color_id) match = match && Number(s.color_id) === Number(color_id);
    return match;
  });

  items.forEach((item) => {
    item.is_ready = targetState;
    if (notes !== undefined) item.notes = notes;
    item.updated_at = new Date().toISOString();
  });
  db.save();

  res.json({ success: true, updatedCount: items.length, data: db.getCatalogFull(catalog_id) });
});

// ==========================================
// 5. CURTAIN MODELS
// ==========================================
app.get('/api/models', (req, res) => {
  const models = db.find('curtain_models').sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  res.json({ success: true, data: models });
});

app.post('/api/models', upload.single('photo'), (req, res) => {
  const { title, notes, category } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Judul model korden wajib diisi' });
  if (!req.file && !req.body.photo_url) {
    return res.status(400).json({ success: false, message: 'Foto model wajib diupload' });
  }

  const photoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.photo_url;
  const newModel = db.insert('curtain_models', {
    title: title.trim(),
    photo_url: photoUrl,
    notes: notes || '',
    category: category || 'Gorden Utama',
  });

  res.status(201).json({ success: true, data: newModel });
});

app.put('/api/models/:id', upload.single('photo'), (req, res) => {
  const { title, notes, category } = req.body;
  const updates = {};
  if (title) updates.title = title.trim();
  if (notes !== undefined) updates.notes = notes;
  if (category) updates.category = category;
  if (req.file) updates.photo_url = `/uploads/${req.file.filename}`;

  const updated = db.update('curtain_models', req.params.id, updates);
  if (!updated) return res.status(404).json({ success: false, message: 'Model korden tidak ditemukan' });
  res.json({ success: true, data: updated });
});

app.delete('/api/models/:id', (req, res) => {
  const deleted = db.delete('curtain_models', req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Model korden tidak ditemukan' });
  res.json({ success: true, message: 'Model korden berhasil dihapus' });
});

// ==========================================
// 6. INSTALLATION PHOTOS
// ==========================================
app.get('/api/installations', (req, res) => {
  const { catalog_id, motif_id, color_id, search } = req.query;
  const photos = db.getInstallationPhotos({ catalog_id, motif_id, color_id, search });
  res.json({ success: true, data: photos });
});

app.post('/api/installations', upload.single('photo'), (req, res) => {
  const { catalog_name, catalog_id, motif_id, color_id, caption, room_type } = req.body;

  let catName = (catalog_name || '').trim();
  let catId = catalog_id ? Number(catalog_id) : 0;

  if (!catName && catId) {
    const existingCat = db.findById('catalogs', catId);
    if (existingCat) catName = existingCat.name;
  }

  if (!catName) {
    return res.status(400).json({ success: false, message: 'Nama Katalog wajib diisi' });
  }

  if (!req.file && !req.body.photo_url) {
    return res.status(400).json({ success: false, message: 'Foto hasil pemasangan wajib diupload' });
  }

  const photoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.photo_url;
  const newPhoto = db.insert('installation_photos', {
    catalog_name: catName,
    catalog_id: catId,
    motif_id: motif_id ? Number(motif_id) : 0,
    color_id: color_id ? Number(color_id) : 0,
    photo_url: photoUrl,
    caption: caption || '',
    room_type: room_type || '',
  });

  const allPhotos = db.getInstallationPhotos();
  const enriched = allPhotos.find((p) => p.id === newPhoto.id);
  res.status(201).json({ success: true, data: enriched || newPhoto });
});

app.delete('/api/installations/:id', (req, res) => {
  const deleted = db.delete('installation_photos', req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Foto pemasangan tidak ditemukan' });
  res.json({ success: true, message: 'Foto pemasangan berhasil dihapus' });
});

// ==========================================
// 7. GLOBAL SEARCH
// ==========================================
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (!q) return res.json({ success: true, data: { catalogs: [], models: [], photos: [] } });

  const allCatalogs = db.getAllCatalogsFull();
  const matchedCatalogs = allCatalogs.filter((c) => {
    const matchCatName = c.name.toLowerCase().includes(q);
    const matchMotif = c.motifs.some((m) => m.code.toLowerCase().includes(q) || (m.name && m.name.toLowerCase().includes(q)));
    const matchColor = c.colors.some((col) => col.code.toLowerCase().includes(q) || (col.name && col.name.toLowerCase().includes(q)));
    return matchCatName || matchMotif || matchColor;
  });

  const allModels = db.find('curtain_models');
  const matchedModels = allModels.filter((m) => m.title.toLowerCase().includes(q) || (m.notes && m.notes.toLowerCase().includes(q)));

  const matchedPhotos = db.getInstallationPhotos({ search: q });

  res.json({
    success: true,
    data: {
      catalogs: matchedCatalogs,
      models: matchedModels,
      photos: matchedPhotos,
    },
  });
});

// SPA wildcard fallback
if (fs.existsSync(distDir)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 KordenPro Backend Server berjalan di http://localhost:${PORT}`);
});

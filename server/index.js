import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { upload } from './upload.js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zecdzrxaytxvrxasqxip.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_ufUbgUI_WEC7NnvyBGS6RA_S_ctB_d7';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend static serving is handled by Vercel directly

// ─── HELPER SUPABASE STORAGE ───────────────────────────────────────────────
async function uploadToSupabaseStorage(file, folderPath) {
  if (!file) return null;
  const fileExt = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
  const fileName = `${folderPath}/${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('uploads')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype || 'image/jpeg',
      upsert: true
    });

  if (error) {
    console.error('Storage Upload Error:', error);
    throw new Error(`Gagal upload gambar ke Supabase (${error.message || 'Error Storage'})`);
  }

  const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
  return data.publicUrl;
}

// ─── HELPERS DATABASE ──────────────────────────────────────────────────────
async function getCatalogFull(catalogId) {
  const { data: catalog, error } = await supabase
    .from('catalogs').select('*').eq('id', catalogId).single();
  if (!catalog || error) return null;

  const [{ data: motifs }, { data: colors }, { data: stockItems }, { data: photos }] =
    await Promise.all([
      supabase.from('motifs').select('*').eq('catalog_id', catalogId).order('code'),
      supabase.from('colors').select('*').eq('catalog_id', catalogId).order('code'),
      supabase.from('stock_items').select('*').eq('catalog_id', catalogId),
      supabase.from('installation_photos').select('*').eq('catalog_id', catalogId),
    ]);

  const safeMotifs = motifs || [];
  const safeColors = colors || [];
  const safeStock = stockItems || [];

  const matrix = {};
  for (const m of safeMotifs) {
    matrix[m.id] = {};
    for (const c of safeColors) {
      const item = safeStock.find(
        s => Number(s.motif_id) === Number(m.id) && Number(s.color_id) === Number(c.id)
      );
      matrix[m.id][c.id] = item || {
        id: null, catalog_id: Number(catalogId),
        motif_id: m.id, color_id: c.id, is_ready: 0, notes: '',
      };
    }
  }

  return {
    ...catalog,
    motifs: safeMotifs,
    colors: safeColors,
    stockMatrix: matrix,
    photosCount: (photos || []).length,
  };
}

async function getAllCatalogsFull() {
  const { data: catalogs } = await supabase.from('catalogs').select('*').order('name');
  if (!catalogs) return [];
  return Promise.all(catalogs.map(c => getCatalogFull(c.id)));
}

async function getInstallationPhotos(filter = {}) {
  let query = supabase.from('installation_photos').select('*');
  if (filter.catalog_id) query = query.eq('catalog_id', Number(filter.catalog_id));
  if (filter.search) {
    const s = `%${filter.search}%`;
    query = query.or(`caption.ilike.${s},room_type.ilike.${s},catalog_name.ilike.${s}`);
  }
  const { data: photos } = await query.order('created_at', { ascending: false });
  return (photos || []).map(p => ({ ...p, catalog_name: p.catalog_name || 'Umum' }));
}

// ==========================================
// 1. AUTH & USERS
// ==========================================
app.get('/api/auth/users', async (req, res) => {
  const { data } = await supabase.from('users').select('id, username, name, role, phone, created_at');
  res.json({ success: true, data: data || [] });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: 'Username dan sandi wajib diisi' });

  const { data: users } = await supabase.from('users').select('*').ilike('username', username.trim()).limit(1);
  const user = users?.[0];
  if (!user) return res.status(404).json({ success: false, message: 'Akun admin tidak ditemukan' });
  if (password !== (user.password || user.pin)) return res.status(401).json({ success: false, message: 'Sandi yang Anda masukkan salah' });

  const { password: _, pin: __, ...safeUser } = user;
  res.json({ success: true, user: safeUser, message: 'Berhasil masuk' });
});

// ==========================================
// 2. DASHBOARD STATS
// ==========================================
app.get('/api/stats', async (req, res) => {
  const [
    { count: totalCatalogs }, { count: totalMotifs }, { count: totalColors },
    { count: totalStockVariants }, { count: readyVariants }, { count: emptyVariants },
    { count: totalModels }, { count: totalInstallationPhotos },
  ] = await Promise.all([
    supabase.from('catalogs').select('*', { count: 'exact', head: true }),
    supabase.from('motifs').select('*', { count: 'exact', head: true }),
    supabase.from('colors').select('*', { count: 'exact', head: true }),
    supabase.from('stock_items').select('*', { count: 'exact', head: true }),
    supabase.from('stock_items').select('*', { count: 'exact', head: true }).eq('is_ready', 1),
    supabase.from('stock_items').select('*', { count: 'exact', head: true }).eq('is_ready', 0),
    supabase.from('curtain_models').select('*', { count: 'exact', head: true }),
    supabase.from('installation_photos').select('*', { count: 'exact', head: true }),
  ]);

  res.json({
    success: true,
    data: { totalCatalogs, totalMotifs, totalColors, totalStockVariants, readyVariants, emptyVariants, totalModels, totalInstallationPhotos },
  });
});

// ==========================================
// 3. CATALOGS & STOCK MATRIX
// ==========================================
app.get('/api/catalogs', async (req, res) => {
  res.json({ success: true, data: await getAllCatalogsFull() });
});

app.get('/api/catalogs/:id', async (req, res) => {
  const catalog = await getCatalogFull(req.params.id);
  if (!catalog) return res.status(404).json({ success: false, message: 'Katalog tidak ditemukan' });
  res.json({ success: true, data: catalog });
});

app.post('/api/catalogs', upload.single('image'), async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Nama katalog wajib diisi' });

  try {
    const imageUrl = req.file ? await uploadToSupabaseStorage(req.file, 'catalogs') : null;
    const { data: newCat, error } = await supabase
      .from('catalogs').insert({ name: name.trim(), description: description || '', image_url: imageUrl })
      .select().single();
    if (error) return res.status(500).json({ success: false, message: error.message });

    const { data: newMotif } = await supabase.from('motifs').insert({ catalog_id: newCat.id, code: 'A', name: 'Motif A' }).select().single();
    const { data: newColor } = await supabase.from('colors').insert({ catalog_id: newCat.id, code: '1', name: 'Warna 1' }).select().single();
    await supabase.from('stock_items').insert({ catalog_id: newCat.id, motif_id: newMotif.id, color_id: newColor.id, is_ready: 1, notes: 'Init' });

    res.status(201).json({ success: true, data: await getCatalogFull(newCat.id) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/catalogs/:id', async (req, res) => {
  const { name, description, subtitle, rack_location, last_updated_date } = req.body;
  const updates = {
    ...(name && { name: name.trim() }),
    ...(description !== undefined && { description }),
    ...(subtitle !== undefined && { subtitle }),
    ...(rack_location !== undefined && { rack_location }),
    last_updated_date: last_updated_date || new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString(),
  };
  await supabase.from('catalogs').update(updates).eq('id', req.params.id);
  res.json({ success: true, data: await getCatalogFull(req.params.id) });
});

app.delete('/api/catalogs/:id', async (req, res) => {
  await supabase.from('catalogs').delete().eq('id', Number(req.params.id));
  res.json({ success: true, message: 'Terhapus' });
});

// Motif & Color
app.post('/api/catalogs/:id/motifs', async (req, res) => {
  const catalogId = Number(req.params.id);
  const { code, name } = req.body;
  const upperCode = code.trim().toUpperCase();
  const { data: newMotif } = await supabase.from('motifs').insert({ catalog_id: catalogId, code: upperCode, name: name || `Motif ${upperCode}` }).select().single();
  const { data: colors } = await supabase.from('colors').select('*').eq('catalog_id', catalogId);
  if (colors?.length) {
    await supabase.from('stock_items').insert(colors.map(c => ({ catalog_id: catalogId, motif_id: newMotif.id, color_id: c.id, is_ready: 1 })));
  }
  res.status(201).json({ success: true, data: await getCatalogFull(catalogId) });
});

app.post('/api/catalogs/:id/colors', async (req, res) => {
  const catalogId = Number(req.params.id);
  const { code, name } = req.body;
  const trimmedCode = code.trim();
  const { data: newColor } = await supabase.from('colors').insert({ catalog_id: catalogId, code: trimmedCode, name: name || `Warna ${trimmedCode}` }).select().single();
  const { data: motifs } = await supabase.from('motifs').select('*').eq('catalog_id', catalogId);
  if (motifs?.length) {
    await supabase.from('stock_items').insert(motifs.map(m => ({ catalog_id: catalogId, motif_id: m.id, color_id: newColor.id, is_ready: 1 })));
  }
  res.status(201).json({ success: true, data: await getCatalogFull(catalogId) });
});

// Stock Toggle
app.post('/api/stock/toggle', async (req, res) => {
  const { catalog_id, motif_id, color_id, is_ready, notes } = req.body;
  const { data: existing } = await supabase.from('stock_items').select('*').eq('catalog_id', catalog_id).eq('motif_id', motif_id).eq('color_id', color_id).limit(1);
  let item;
  if (existing?.length) {
    const nextReady = is_ready !== undefined ? (is_ready ? 1 : 0) : (existing[0].is_ready ? 0 : 1);
    const { data } = await supabase.from('stock_items').update({ is_ready: nextReady, notes: notes ?? existing[0].notes }).eq('id', existing[0].id).select().single();
    item = data;
  } else {
    const { data } = await supabase.from('stock_items').insert({ catalog_id: Number(catalog_id), motif_id: Number(motif_id), color_id: Number(color_id), is_ready: is_ready !== undefined ? (is_ready ? 1 : 0) : 1 }).select().single();
    item = data;
  }
  res.json({ success: true, data: item });
});

// ==========================================
// 5. CURTAIN MODELS
// ==========================================
app.get('/api/models', async (req, res) => {
  const { data } = await supabase.from('curtain_models').select('*').order('created_at', { ascending: false });
  res.json({ success: true, data: data || [] });
});

app.post('/api/models', upload.single('photo'), async (req, res) => {
  try {
    const { title, notes, category } = req.body;
    const photoUrl = req.file ? await uploadToSupabaseStorage(req.file, 'models') : req.body.photo_url;
    
    if (!photoUrl) return res.status(400).json({ success: false, message: 'Foto model wajib diupload' });

    const { data } = await supabase.from('curtain_models').insert({ title: title.trim(), photo_url: photoUrl, notes: notes || '', category: category || 'Gorden Utama' }).select().single();
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/models/:id', async (req, res) => {
  await supabase.from('curtain_models').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// ==========================================
// 6. INSTALLATION PHOTOS
// ==========================================
app.get('/api/installations', async (req, res) => {
  const photos = await getInstallationPhotos(req.query);
  res.json({ success: true, data: photos });
});

app.post('/api/installations', upload.single('photo'), async (req, res) => {
  try {
    const { catalog_name, catalog_id, caption, room_type } = req.body;
    let catName = (catalog_name || '').trim();
    const catId = catalog_id ? Number(catalog_id) : 0;
    
    const photoUrl = req.file ? await uploadToSupabaseStorage(req.file, 'installations') : req.body.photo_url;
    if (!photoUrl) return res.status(400).json({ success: false, message: 'Foto pemasangan wajib diupload' });

    const { data } = await supabase.from('installation_photos').insert({ catalog_name: catName, catalog_id: catId, photo_url: photoUrl, caption: caption || '', room_type: room_type || '' }).select().single();
    res.status(201).json({ success: true, data: { ...data, catalog_name: data.catalog_name || 'Umum' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/installations/:id', async (req, res) => {
  await supabase.from('installation_photos').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// ==========================================
// 7. GLOBAL SEARCH
// ==========================================
app.get('/api/search', async (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (!q) return res.json({ success: true, data: { catalogs: [], models: [], photos: [] } });

  const s = `%${q}%`;
  const [{ data: rawCatalogs }, { data: models }, photos] = await Promise.all([
    supabase.from('catalogs').select('*').ilike('name', s),
    supabase.from('curtain_models').select('*').or(`title.ilike.${s},notes.ilike.${s}`),
    getInstallationPhotos({ search: q }),
  ]);

  const catalogs = await Promise.all((rawCatalogs || []).map(c => getCatalogFull(c.id)));
  res.json({ success: true, data: { catalogs, models: models || [], photos } });
});

// Vercel routes all non-api requests to index.html natively.

// Hanya jalankan app.listen jika TIDAK sedang di Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 KordenPro (Supabase) berjalan di http://localhost:${PORT}`));
}

// Export agar dikenali sebagai serverless function oleh Vercel
export default app;

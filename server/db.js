import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbFile = path.join(dataDir, 'db.json');

const initialData = {
  users: [],
  catalogs: [],
  motifs: [],
  colors: [],
  stock_items: [],
  curtain_models: [],
  installation_photos: [],
};

class Database {
  constructor() {
    this.filePath = dbFile;
    this.data = this.load();
  }

  load() {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        return { ...initialData, ...JSON.parse(raw) };
      } catch (e) {
        console.error('Error loading DB, resetting:', e);
        return { ...initialData };
      }
    }
    this.save(initialData);
    return { ...initialData };
  }

  save(data = this.data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Helper for auto-increment ID
  nextId(collection) {
    const list = this.data[collection] || [];
    if (list.length === 0) return 1;
    return Math.max(...list.map((item) => Number(item.id) || 0)) + 1;
  }

  // Generic methods
  find(collection, filterFn = null) {
    const list = this.data[collection] || [];
    return filterFn ? list.filter(filterFn) : [...list];
  }

  findById(collection, id) {
    const list = this.data[collection] || [];
    return list.find((item) => String(item.id) === String(id)) || null;
  }

  insert(collection, item) {
    if (!this.data[collection]) this.data[collection] = [];
    const newItem = {
      ...item,
      id: item.id || this.nextId(collection),
      created_at: item.created_at || new Date().toISOString(),
    };
    this.data[collection].push(newItem);
    this.save();
    return newItem;
  }

  update(collection, id, updates) {
    const list = this.data[collection] || [];
    const index = list.findIndex((item) => String(item.id) === String(id));
    if (index === -1) return null;
    this.data[collection][index] = {
      ...this.data[collection][index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data[collection][index];
  }

  delete(collection, id) {
    const list = this.data[collection] || [];
    const initialLen = list.length;
    this.data[collection] = list.filter((item) => String(item.id) !== String(id));
    const deleted = this.data[collection].length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // Custom relational queries
  getCatalogFull(catalogId) {
    const catalog = this.findById('catalogs', catalogId);
    if (!catalog) return null;

    const motifs = this.find('motifs', (m) => String(m.catalog_id) === String(catalogId))
      .sort((a, b) => a.code.localeCompare(b.code));
    const colors = this.find('colors', (c) => String(c.catalog_id) === String(catalogId))
      .sort((a, b) => {
        const numA = parseInt(a.code, 10);
        const numB = parseInt(b.code, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.code.localeCompare(b.code);
      });
    const stockItems = this.find('stock_items', (s) => String(s.catalog_id) === String(catalogId));
    const photos = this.find('installation_photos', (p) => String(p.catalog_id) === String(catalogId));

    // Matrix lookup: { [motif_id]: { [color_id]: stockItem } }
    const matrix = {};
    for (const m of motifs) {
      matrix[m.id] = {};
      for (const c of colors) {
        const item = stockItems.find(
          (s) => String(s.motif_id) === String(m.id) && String(s.color_id) === String(c.id)
        );
        matrix[m.id][c.id] = item || {
          id: null,
          catalog_id: Number(catalogId),
          motif_id: m.id,
          color_id: c.id,
          is_ready: 0,
          notes: '',
        };
      }
    }

    return {
      ...catalog,
      motifs,
      colors,
      stockMatrix: matrix,
      photosCount: photos.length,
    };
  }

  getAllCatalogsFull() {
    const catalogs = this.find('catalogs').sort((a, b) => a.name.localeCompare(b.name));
    return catalogs.map((cat) => this.getCatalogFull(cat.id));
  }

  toggleStock(catalog_id, motif_id, color_id, is_ready, notes = '') {
    const existing = this.data.stock_items.find(
      (s) =>
        String(s.catalog_id) === String(catalog_id) &&
        String(s.motif_id) === String(motif_id) &&
        String(s.color_id) === String(color_id)
    );

    if (existing) {
      existing.is_ready = is_ready !== undefined ? (is_ready ? 1 : 0) : existing.is_ready ? 0 : 1;
      if (notes !== undefined) existing.notes = notes;
      existing.updated_at = new Date().toISOString();
      this.save();
      return existing;
    } else {
      const newItem = {
        id: this.nextId('stock_items'),
        catalog_id: Number(catalog_id),
        motif_id: Number(motif_id),
        color_id: Number(color_id),
        is_ready: is_ready !== undefined ? (is_ready ? 1 : 0) : 1,
        notes: notes || '',
        updated_at: new Date().toISOString(),
      };
      this.data.stock_items.push(newItem);
      this.save();
      return newItem;
    }
  }

  getInstallationPhotos(filter = {}) {
    let photos = [...this.data.installation_photos];
    if (filter.catalog_id) {
      photos = photos.filter((p) => String(p.catalog_id) === String(filter.catalog_id));
    }
    if (filter.motif_id) {
      photos = photos.filter((p) => String(p.motif_id) === String(filter.motif_id));
    }
    if (filter.color_id) {
      photos = photos.filter((p) => String(p.color_id) === String(filter.color_id));
    }
    if (filter.search) {
      const s = filter.search.toLowerCase();
      photos = photos.filter((p) => {
        const catName = p.catalog_name || (this.findById('catalogs', p.catalog_id)?.name || '');
        return (
          (p.caption && p.caption.toLowerCase().includes(s)) ||
          (p.room_type && p.room_type.toLowerCase().includes(s)) ||
          catName.toLowerCase().includes(s)
        );
      });
    }

    // Enrich with catalog, motif, color metadata
    return photos.map((p) => {
      const catalog = this.findById('catalogs', p.catalog_id);
      const motif = this.findById('motifs', p.motif_id);
      const color = this.findById('colors', p.color_id);
      const catalogName = p.catalog_name || (catalog ? catalog.name : 'Umum');
      return {
        ...p,
        catalog_name: catalogName,
        motif_code: motif ? motif.code : '-',
        motif_name: motif ? motif.name : '',
        color_code: color ? color.code : '-',
        color_name: color ? color.name : '',
        color_hex: color ? color.hex_code : '#cbd5e1',
      };
    }).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }
}

const db = new Database();
export default db;

const API_BASE = '/api';

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/auth/users`);
  return res.json();
}

export async function loginAdmin({ username, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

// Catalogs
export async function fetchCatalogs() {
  const res = await fetch(`${API_BASE}/catalogs`);
  return res.json();
}

export async function fetchCatalogById(id) {
  const res = await fetch(`${API_BASE}/catalogs/${id}`);
  return res.json();
}

export async function createCatalog(formData) {
  const res = await fetch(`${API_BASE}/catalogs`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function updateCatalog(id, data) {
  const res = await fetch(`${API_BASE}/catalogs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCatalog(id) {
  const res = await fetch(`${API_BASE}/catalogs/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

// Motifs & Colors
export async function addMotif(catalogId, data) {
  const res = await fetch(`${API_BASE}/catalogs/${catalogId}/motifs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteMotif(motifId) {
  const res = await fetch(`${API_BASE}/motifs/${motifId}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function addColor(catalogId, data) {
  const res = await fetch(`${API_BASE}/catalogs/${catalogId}/colors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteColor(colorId) {
  const res = await fetch(`${API_BASE}/colors/${colorId}`, {
    method: 'DELETE',
  });
  return res.json();
}

// Stock
export async function toggleStockStatus({ catalog_id, motif_id, color_id, is_ready, notes }) {
  const res = await fetch(`${API_BASE}/stock/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ catalog_id, motif_id, color_id, is_ready, notes }),
  });
  return res.json();
}

export async function bulkSetStock({ catalog_id, motif_id, color_id, is_ready, notes }) {
  const res = await fetch(`${API_BASE}/stock/bulk-set`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ catalog_id, motif_id, color_id, is_ready, notes }),
  });
  return res.json();
}

// Curtain Models
export async function fetchModels() {
  const res = await fetch(`${API_BASE}/models`);
  return res.json();
}

export async function createModel(formData) {
  const res = await fetch(`${API_BASE}/models`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function updateModel(id, formData) {
  const res = await fetch(`${API_BASE}/models/${id}`, {
    method: 'PUT',
    body: formData,
  });
  return res.json();
}

export async function deleteModel(id) {
  const res = await fetch(`${API_BASE}/models/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

// Installation Photos
export async function fetchInstallations(filters = {}) {
  const params = new URLSearchParams();
  if (filters.catalog_id) params.append('catalog_id', filters.catalog_id);
  if (filters.motif_id) params.append('motif_id', filters.motif_id);
  if (filters.color_id) params.append('color_id', filters.color_id);
  if (filters.search) params.append('search', filters.search);

  const res = await fetch(`${API_BASE}/installations?${params.toString()}`);
  return res.json();
}

export async function createInstallation(formData) {
  const res = await fetch(`${API_BASE}/installations`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function deleteInstallation(id) {
  const res = await fetch(`${API_BASE}/installations/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

// Global Search
export async function searchAll(query) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  return res.json();
}

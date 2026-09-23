# KordenPro - Aplikasi Web Mobile Manajemen Stok & Katalog Korden

Aplikasi web mobile modern untuk bisnis gorden (korden) yang dirancang khusus untuk kemudahan akses teknisi di lapangan dan kontrol penuh bagi Supervisor (SPV) / Kepala Toko.

---

## 🌟 Fitur Utama

### 1. 📊 Matriks Stok Kain Excel (Interactive Excel Grid)
- Hirarki data: **Katalog** (contoh: *Arona, Valery, Hermes*) $\rightarrow$ **Motif** (Kode Huruf: *A, B, C...*) $\rightarrow$ **Warna** (Kode Angka: *1, 2, 3...*).
- Status stok visual:
  - **✓ READY (Hijau)**: Kain tersedia di gudang.
  - **✗ KOSONG (Merah)**: Stok habis / menunggu pengiriman pabrik.
- **Role SPV & Kepala Toko**: 1-Tap langsung pada sel tabel untuk toggle status Ready $\leftrightarrow$ Kosong secara instan (optimistic UI), update catatan khusus, dan bulk update ("Set Semua Ready/Kosong").
- **Role Teknisi**: Mode read-only untuk mengecek stok secara akurat saat survey di rumah klien.
- Sticky row & column header untuk scrolling yang nyaman di smartphone.

### 2. 🪟 Model Korden & Catatan Teknis
- Katalog gaya/model korden (*Smokering, Triple Pleat / Minimalis, Roman Shade, Vitrage*).
- Upload foto langsung dari perangkat (kamera atau galeri HP).
- Catatan teknis & rumus perhitungan bahan kain (contoh: *Pemakaian bahan 2.5x lebar jendela, ring 4.5cm, rel pipa 28mm*).
- Filter per kategori (*Gorden Utama, Vitrage, Blind / Lipat, dll*).

### 3. 📸 Galeri Foto Pemasangan Terhubung Varian
- Foto hasil pemasangan nyata yang **ditautkan langsung ke kombinasi Katalog + Motif + Warna** (contoh: *Katalog Arona $\rightarrow$ Motif A $\rightarrow$ Warna 1*).
- Upload foto dari HP teknisi/SPV dengan form pemilihan varian yang saling terhubung dinamis.
- Tag tipe ruangan (*Ruang Tamu, Kamar Tidur, Apartemen, Villa*).
- Shortcut langsung dari tabel stok: klik sel varian untuk melihat foto terpasangnya.

### 4. 👥 Manajemen Akses & Akun Terpisah
- **Halaman Teknisi Lapangan (URL Utama: `/`)**:
  - Akses Lihat (Read-Only) & Pencarian Cepat.
  - Cek stok real-time, lihat model & galeri foto referensi untuk pelanggan.
  - Tidak ada tombol edit/toggle atau selector role publik yang membingungkan.
- **Panel Admin SPV & Kepala Toko (URL Terpisah: `/admin`)**:
  - Akun Tunggal Admin:
    - **Username**: `manyu`
    - **Sandi**: `sk21korden`
  - Akses Penuh (CRUD): Toggle stok 1-tap, tambah/hapus katalog, motif, warna, upload foto model korden & foto pemasangan.
  - Tombol Logout untuk kembali ke mode Teknisi.

---

## 🚀 Cara Menjalankan Aplikasi

1. Masuk ke direktori project:
   ```bash
   cd "C:\Users\Alvin Yasa\.gemini\antigravity\scratch\korden-stock-app"
   ```

2. Jalankan server (Fullstack Mode):
   ```bash
   node server/index.js
   ```
   Buka browser di HP atau Laptop: `http://localhost:5000`

3. Mode Pengembangan (Hot Reload Frontend):
   ```bash
   npm.cmd run dev
   ```
   Akses Vite di `http://localhost:3000` (otomatis proxy API ke `http://localhost:5000`).

---

## 📁 Struktur Folder
```
korden-stock-app/
├── server/
│   ├── index.js          # Express server & static serving
│   ├── db.js             # Persistent JSON/Database engine
│   ├── seed.js           # Seeder data awal katalog, motif, warna & foto
│   └── upload.js         # Multer handler untuk upload gambar
├── src/
│   ├── components/       # StockExcelTable, ModelCard, InstallationCard, Modals, Navbar, BottomNav
│   ├── context/          # AuthContext (RBAC)
│   ├── pages/            # StockPage, ModelsPage, InstallationsPage, AccountPage
│   ├── services/api.js   # Client API
│   ├── App.jsx           # Root layout & routing
│   └── main.jsx          # React entry point
├── data/
│   └── db.json           # File database lokal
└── uploads/              # Folder penyimpanan foto yang diupload
```

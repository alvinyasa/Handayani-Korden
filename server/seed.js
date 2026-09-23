import db from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function createSampleSvg(filename, title, subtitle, bgColor = '#0f766e', accentColor = '#2dd4bf') {
  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgColor}" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg)" />
      
      <!-- Curtain Visual Representation -->
      <g opacity="0.85" transform="translate(150, 60)">
        <rect x="0" y="20" width="500" height="14" rx="7" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
        <circle cx="20" cy="27" r="16" fill="#f59e0b"/>
        <circle cx="480" cy="27" r="16" fill="#f59e0b"/>
        
        <path d="M 40 34 C 70 80, 50 250, 45 420 C 70 420, 90 410, 110 420 C 100 250, 130 80, 90 34 Z" fill="${accentColor}" opacity="0.9"/>
        <path d="M 110 34 C 140 80, 120 250, 115 420 C 140 420, 160 410, 180 420 C 170 250, 200 80, 160 34 Z" fill="${accentColor}" opacity="0.75"/>
        <path d="M 180 34 C 210 80, 190 250, 185 420 C 210 420, 230 410, 250 420 C 240 250, 270 80, 230 34 Z" fill="${accentColor}" opacity="0.9"/>
        <path d="M 250 34 C 280 80, 260 250, 255 420 C 280 420, 300 410, 320 420 C 310 250, 340 80, 300 34 Z" fill="${accentColor}" opacity="0.75"/>
        <path d="M 320 34 C 350 80, 330 250, 325 420 C 350 420, 370 410, 390 420 C 380 250, 410 80, 370 34 Z" fill="${accentColor}" opacity="0.9"/>
        <path d="M 390 34 C 420 80, 400 250, 395 420 C 420 420, 440 410, 460 420 C 450 250, 480 80, 440 34 Z" fill="${accentColor}" opacity="0.75"/>
      </g>

      <rect x="50" y="470" width="700" height="90" rx="16" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
      <text x="80" y="512" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold">${title}</text>
      <text x="80" y="542" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="16">${subtitle}</text>
    </svg>`;
    fs.writeFileSync(filePath, svgContent);
  }
  return `/uploads/${filename}`;
}

export function runSeed(force = true) {
  console.log('🌱 Menjalankan Seeder Data Korden...');

  // 1. Users (Admin: manyu / sk21korden)
  db.data.users = [
    {
      id: 1,
      username: 'manyu',
      name: 'Manyu (SPV / Kepala Toko)',
      role: 'admin',
      password: 'sk21korden',
      phone: '081234567890',
      created_at: new Date().toISOString(),
    },
  ];

  // 2. Catalogs Data (Matching the reference UI exactly)
  db.data.catalogs = [];
  db.data.motifs = [];
  db.data.colors = [];
  db.data.stock_items = [];
  db.data.curtain_models = [];
  db.data.installation_photos = [];

  const catalogDefinitions = [
    {
      name: 'Maroko',
      subtitle: 'Blackout / Dimout',
      rack: 'Rak M-01',
      date: '2026-08-26',
      motifs: ['A', 'B'],
      colorsCount: 8,
      stock: {
        A: [0, 0, 1, 1, 0, 0, 0, 1], // 1..8
        B: [1, 1, 1, 1, 1, 1, 1, 1],
      },
    },
    {
      name: 'Dublin',
      subtitle: 'Dimout Premium',
      rack: 'Rak D-02',
      date: '2026-08-26',
      motifs: ['A', 'B'],
      colorsCount: 8,
      stock: {
        A: [1, 1, 1, 1, 1, 1, 1, 1],
        B: [1, 1, 1, 1, 1, 1, 0, 1],
      },
    },
    {
      name: 'Berlin',
      subtitle: 'Blackout Heavy',
      rack: 'Rak B-04',
      date: '2026-08-26',
      motifs: ['A', 'B'],
      colorsCount: 9,
      stock: {
        A: [1, 1, 1, 1, 1, 1, 1, 1, 0],
        B: [1, 1, 1, 1, 0, 0, 0, 0, 1],
      },
    },
    {
      name: 'Hawai',
      subtitle: 'Vitrase & Sheer',
      rack: 'Rak H-01',
      date: '2026-08-26',
      motifs: ['A', 'B'],
      colorsCount: 9,
      stock: {
        A: [0, 1, 1, 0, 0, 1, 0, 0, 0],
        B: [0, 1, 0, 0, 1, 1, 0, 0, 0],
      },
    },
    {
      name: 'Luxilla',
      subtitle: 'Jacquard Modern',
      rack: 'Rak L-03',
      date: '2026-08-28',
      motifs: ['A', 'B'],
      colorsCount: 8,
      stock: {
        A: [1, 1, 0, 1, 1, 0, 1, 1],
        B: [1, 0, 1, 1, 1, 1, 1, 0],
      },
    },
    {
      name: 'Eria',
      subtitle: 'Linen Soft Natural',
      rack: 'Rak E-02',
      date: '2026-08-29',
      motifs: ['A', 'B'],
      colorsCount: 7,
      stock: {
        A: [1, 1, 1, 1, 0, 1, 1],
        B: [1, 1, 1, 0, 1, 1, 1],
      },
    },
    {
      name: 'Nolina',
      subtitle: 'Velvet Satin Glow',
      rack: 'Rak N-01',
      date: '2026-08-30',
      motifs: ['A', 'B'],
      colorsCount: 8,
      stock: {
        A: [1, 0, 1, 1, 1, 0, 1, 1],
        B: [0, 1, 1, 1, 0, 1, 1, 1],
      },
    },
    {
      name: 'Arona',
      subtitle: 'Blackout 90% Emboss',
      rack: 'Rak A-01',
      date: '2026-09-01',
      motifs: ['A', 'B'],
      colorsCount: 8,
      stock: {
        A: [1, 1, 0, 1, 0, 1, 1, 0],
        B: [1, 0, 1, 1, 1, 1, 0, 1],
      },
    },
  ];

  for (const def of catalogDefinitions) {
    const cat = db.insert('catalogs', {
      name: def.name,
      description: def.subtitle,
      subtitle: def.subtitle,
      rack_location: def.rack,
      last_updated_date: def.date,
      image_url: createSampleSvg(`cat-${def.name.toLowerCase()}.svg`, `Katalog ${def.name}`, def.subtitle),
    });

    const motifMap = {};
    for (const mCode of def.motifs) {
      const m = db.insert('motifs', {
        catalog_id: cat.id,
        code: mCode,
        name: `Motif ${mCode}`,
      });
      motifMap[mCode] = m.id;
    }

    const colorMap = {};
    for (let c = 1; c <= def.colorsCount; c++) {
      const cCode = String(c);
      const col = db.insert('colors', {
        catalog_id: cat.id,
        code: cCode,
        name: `Warna ${cCode}`,
      });
      colorMap[cCode] = col.id;
    }

    // Insert Stock items
    for (const mCode of def.motifs) {
      const stockArr = def.stock[mCode] || [];
      for (let i = 0; i < def.colorsCount; i++) {
        const cCode = String(i + 1);
        const isReady = stockArr[i] !== undefined ? stockArr[i] : 1;
        db.insert('stock_items', {
          catalog_id: cat.id,
          motif_id: motifMap[mCode],
          color_id: colorMap[cCode],
          is_ready: isReady,
          notes: isReady ? 'Ready di ' + def.rack : 'Kosong / Menunggu pabrik',
        });
      }
    }
  }

  // 3. Curtain Models
  const imgModel1 = createSampleSvg('model-smokering.svg', 'Model Smokering 12 Ring', 'Gaya Modern Minimalis & Gelombang Tegas', '#047857', '#34d399');
  const imgModel2 = createSampleSvg('model-triple-pleat.svg', 'Model Triple Pleat / Kupu-Kupu', 'Gaya Klasik Elegan dengan Rel Aluminium', '#1e3a8a', '#60a5fa');
  const imgModel3 = createSampleSvg('model-roman-shade.svg', 'Model Roman Shade (Lipat)', 'Hemat Bahan, Rapi & Elegan untuk Jendela Sempit', '#b45309', '#fbbf24');
  const imgModel4 = createSampleSvg('model-vitrage.svg', 'Model Vitrage Plisket / Sheer', 'Kain Tipis Lembut Penyaring Cahaya Matahari', '#701a75', '#f472b6');

  db.insert('curtain_models', {
    title: 'Model Smokering Modern (10-12 Lubang)',
    photo_url: imgModel1,
    notes: '• Pemakaian bahan 2.5x s/d 3x lebar kusen jendela.\n• Menggunakan ring teflon diameter 4.5cm.\n• Jarak antar ring 14-16cm.\n• Cocok untuk ruang tamu utama dan kamar tidur master.',
    category: 'Gorden Utama',
  });

  db.insert('curtain_models', {
    title: 'Model Triple Pleat (Lipat Cubit 3)',
    photo_url: imgModel2,
    notes: '• Pemakaian bahan 2.5x lebar rel.\n• Menggunakan hook kawat S dan rel roda aluminium hening (silent track).\n• Memberikan kesan sangat rapi, simetris, dan mewah pada ruangan bergaya kontemporer/klasik.',
    category: 'Gorden Utama',
  });

  db.insert('curtain_models', {
    title: 'Model Roman Shade (Gorden Lipat)',
    photo_url: imgModel3,
    notes: '• Pemakaian bahan 1:1 ditambah lipatan atas-bawah 20cm.\n• Menggunakan mekanisme chain/tarikan kerek.\n• Sangat hemat ruangan, minimalis, dan pas untuk jendela kecil di dapur/ruang kerja.',
    category: 'Blind / Lipat',
  });

  db.insert('curtain_models', {
    title: 'Model Vitrage Plisket Lembut',
    photo_url: imgModel4,
    notes: '• Pemakaian bahan 2.5x lebar jendela.\n• Berfungsi sebagai lapisan dalam penyaring cahaya matahari dan menjaga privasi ruangan di siang hari.',
    category: 'Vitrage',
  });

  // 4. Installation Photos
  const marokoCat = db.find('catalogs', (c) => c.name === 'Maroko')[0];
  const marokoMotifA = db.find('motifs', (m) => m.catalog_id === marokoCat.id && m.code === 'A')[0];
  const marokoColor3 = db.find('colors', (c) => c.catalog_id === marokoCat.id && c.code === '3')[0];

  const berlinCat = db.find('catalogs', (c) => c.name === 'Berlin')[0];
  const berlinMotifA = db.find('motifs', (m) => m.catalog_id === berlinCat.id && m.code === 'A')[0];
  const berlinColor1 = db.find('colors', (c) => c.catalog_id === berlinCat.id && c.code === '1')[0];

  if (marokoCat && marokoMotifA && marokoColor3) {
    db.insert('installation_photos', {
      catalog_id: marokoCat.id,
      motif_id: marokoMotifA.id,
      color_id: marokoColor3.id,
      photo_url: createSampleSvg('inst-maroko-a3.svg', 'Pemasangan Maroko A3', 'Villa Bandung - Model Smokering', '#1e40af', '#93c5fd'),
      caption: 'Pemasangan di Ruang Tamu Villa Bandung dengan gorden blackout Maroko Motif A Warna 3.',
      room_type: 'Ruang Tamu',
    });
  }

  if (berlinCat && berlinMotifA && berlinColor1) {
    db.insert('installation_photos', {
      catalog_id: berlinCat.id,
      motif_id: berlinMotifA.id,
      color_id: berlinColor1.id,
      photo_url: createSampleSvg('inst-berlin-a1.svg', 'Pemasangan Berlin A1', 'Apartemen Sudirman - Blackout Heavy', '#374151', '#9ca3af'),
      caption: 'Pemasangan Kamar Tidur Utama Apartemen Sudirman Lantai 28.',
      room_type: 'Kamar Tidur',
    });
  }

  db.save();
  console.log('✅ Seeding data baru (Maroko, Dublin, Berlin, Hawai, Luxilla, Eria, Nolina, Arona) selesai!\n');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed();
}

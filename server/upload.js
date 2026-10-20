import multer from 'multer';

// Memory storage agar kompatibel dengan Vercel (serverless/stateless)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // maks 25MB
  fileFilter: (req, file, cb) => {
    const isImageMime = file.mimetype && file.mimetype.startsWith('image/');
    const isImageExt = /\.(jpg|jpeg|png|webp|gif|heic|heif|jfif|bmp)$/i.test(file.originalname || '');
    if (isImageMime || isImageExt || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diizinkan'), false);
    }
  },
});

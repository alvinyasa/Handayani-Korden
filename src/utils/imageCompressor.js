/**
 * Utility to compress and normalize images client-side before uploading.
 * Converts heavy camera photos (5-15MB) into lightweight JPEGs (~200-400KB)
 * with max dimensions of 1600x1600 to prevent Vercel 4.5MB payload limit errors
 * and Supabase Storage mime-type incompatibilities (e.g. HEIC/HEIF).
 */

export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    outputType = 'image/jpeg',
  } = options;

  // If not a file or blob, return as is
  if (!file || !(file instanceof Blob)) return file;

  return new Promise((resolve) => {
    // If it's a small file (< 250KB) and already JPEG, no need to compress
    if (file.size <= 250 * 1024 && file.type === 'image/jpeg') {
      return resolve(file);
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      // Draw onto canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        // Fallback if canvas context fails
        return resolve(file);
      }

      // White background for transparent PNGs converted to JPEG
      if (outputType === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }

          // Create a new File object with .jpg extension
          const originalName = file.name || 'photo.jpg';
          const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
          const newFileName = `${baseName}.jpg`;

          const compressedFile = new File([blob], newFileName, {
            type: outputType,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // If image loading fails (e.g. unsupported browser format), return original file
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Compress an array of files in parallel
 */
export async function compressImages(files, options = {}) {
  if (!Array.isArray(files)) return [];
  return Promise.all(files.map((file) => compressImage(file, options)));
}

/**
 * Client-side image upload and compression utility.
 * Converts local files (JPG, PNG, WEBP) to optimized Data URLs for instant preview and persistent storage.
 */

export const compressAndReadImage = (
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.82
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)/i)) {
      return reject(new Error('Format file tidak didukung. Harap pilih gambar JPG, PNG, atau WEBP.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar dari perangkat.'));
    reader.onload = (readerEvent) => {
      const resultStr = readerEvent.target?.result as string;
      if (!resultStr) {
        return reject(new Error('Data gambar kosong.'));
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback to raw data url if canvas image loading fails
        resolve(resultStr);
      };
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect-ratio preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(resultStr);
          return;
        }

        // Draw image onto canvas
        ctx.fillStyle = '#0f172a';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        try {
          const compressedDataUrl = canvas.toDataURL(mimeType, quality);
          resolve(compressedDataUrl);
        } catch {
          resolve(resultStr);
        }
      };

      img.src = resultStr;
    };

    reader.readAsDataURL(file);
  });
};

import fs from 'fs';
import zlib from 'zlib';

// Function to generate a valid uncompressed/deflated PNG buffer
function createSolidPng(width, height, r, g, b, a = 255) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each line
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Draw stylized gaming shield emblem colors
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const maxR = Math.min(width, height) / 2;

      // Border and inner theme
      if (dist < maxR * 0.95 && dist > maxR * 0.88) {
        // Cyan / Orange neon rim
        rawData[pxOffset] = 249; // R
        rawData[pxOffset + 1] = 115; // G
        rawData[pxOffset + 2] = 22; // B
        rawData[pxOffset + 3] = 255;
      } else if (dist <= maxR * 0.88 && dist >= maxR * 0.82) {
        // Cyan accent ring
        rawData[pxOffset] = 56;
        rawData[pxOffset + 1] = 189;
        rawData[pxOffset + 2] = 248;
        rawData[pxOffset + 3] = 255;
      } else if (dist < maxR * 0.82) {
        // Inner dark theme #0a0c14 with gradient
        const t = y / height;
        rawData[pxOffset] = Math.round(10 + t * 25);
        rawData[pxOffset + 1] = Math.round(12 + t * 20);
        rawData[pxOffset + 2] = Math.round(20 + t * 45);
        rawData[pxOffset + 3] = 255;

        // Controller / Diamond highlight in center
        const cDist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (cDist < maxR * 0.35) {
          rawData[pxOffset] = 249;
          rawData[pxOffset + 1] = 115;
          rawData[pxOffset + 2] = 22;
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Background dark #0a0c14
        rawData[pxOffset] = 10;
        rawData[pxOffset + 1] = 12;
        rawData[pxOffset + 2] = 20;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', deflated);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuf, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(calculateCrc32(crcData), 0);

  return Buffer.concat([len, typeBuf, data, crc]);
}

function calculateCrc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if ((crc & 1) !== 0) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate the required PWA and Apple touch icon sizes
const icon192 = createSolidPng(192, 192, 10, 12, 20);
fs.writeFileSync('public/pwa-192x192.png', icon192);

const icon512 = createSolidPng(512, 512, 10, 12, 20);
fs.writeFileSync('public/pwa-512x512.png', icon512);

const maskable512 = createSolidPng(512, 512, 10, 12, 20);
fs.writeFileSync('public/pwa-maskable-512x512.png', maskable512);

const appleIcon = createSolidPng(180, 180, 10, 12, 20);
fs.writeFileSync('public/apple-touch-icon.png', appleIcon);

console.log('PWA icons successfully generated in /public/');

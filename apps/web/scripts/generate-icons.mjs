import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const appDir = join(root, 'src', 'app');
const svgPath = join(publicDir, 'icon.svg');

async function png(size, outPath) {
  await sharp(svgPath, { density: Math.max(72, size * 3) })
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log('wrote', outPath);
}

async function ico(outPath) {
  // Multi-size ICO: 16 + 32
  const sizes = [16, 32];
  const images = await Promise.all(
    sizes.map((size) =>
      sharp(svgPath, { density: size * 4 })
        .resize(size, size)
        .png()
        .toBuffer(),
    ),
  );

  // Minimal ICO writer (PNG-compressed images)
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = headerSize + dirEntrySize * images.length;
  let offset = dirSize;
  const entries = images.map((buf, i) => {
    const size = sizes[i];
    const entry = {
      width: size === 256 ? 0 : size,
      height: size === 256 ? 0 : size,
      offset,
      size: buf.length,
      buf,
    };
    offset += buf.length;
    return entry;
  });

  const out = Buffer.alloc(offset);
  out.writeUInt16LE(0, 0); // reserved
  out.writeUInt16LE(1, 2); // icon
  out.writeUInt16LE(entries.length, 4);
  entries.forEach((entry, i) => {
    const o = headerSize + i * dirEntrySize;
    out.writeUInt8(entry.width, o);
    out.writeUInt8(entry.height, o + 1);
    out.writeUInt8(0, o + 2); // colors
    out.writeUInt8(0, o + 3); // reserved
    out.writeUInt16LE(1, o + 4); // planes
    out.writeUInt16LE(32, o + 6); // bpp
    out.writeUInt32LE(entry.size, o + 8);
    out.writeUInt32LE(entry.offset, o + 12);
    entry.buf.copy(out, entry.offset);
  });

  writeFileSync(outPath, out);
  console.log('wrote', outPath);
}

await png(16, join(publicDir, 'favicon-16.png'));
await png(32, join(publicDir, 'favicon-32.png'));
await png(180, join(publicDir, 'apple-touch-icon.png'));
await png(192, join(publicDir, 'icon-192.png'));
await png(512, join(publicDir, 'icon-512.png'));
await png(180, join(appDir, 'apple-icon.png'));
await png(512, join(appDir, 'icon.png'));
// Keep favicon only in public/ — a copy in src/app/ conflicts and 500s in Next.js.
await ico(join(publicDir, 'favicon.ico'));

console.log('Elca Airbridge icons generated.');

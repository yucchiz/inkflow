import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = resolve(__dirname, 'icon-master.svg');
const outputDir = resolve(__dirname, '..', 'public', 'icons');

const sizes = [
  { width: 512, height: 512, name: 'icon-512x512.png' },
  { width: 192, height: 192, name: 'icon-192x192.png' },
  { width: 180, height: 180, name: 'apple-touch-icon-180x180.png' },
];

async function generate() {
  await mkdir(outputDir, { recursive: true });
  const svg = readFileSync(svgPath);

  for (const { width, height, name } of sizes) {
    await sharp(svg, { density: 300 }).resize(width, height).png().toFile(resolve(outputDir, name));
    console.log(`Generated ${name} (${width}x${height})`);
  }
}

generate().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});

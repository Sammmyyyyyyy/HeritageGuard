import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, '../public/assets');

async function makeTransparent(filename, outputName) {
  const input = path.join(outputDir, filename);
  const { data, info } = await sharp(input)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const outputData = Buffer.alloc(width * height * 4);

  // Background color is approx [250, 248, 242]
  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    // Compute lightness / darkness from background
    const bgLum = 249;
    const currentLum = (r * 0.299 + g * 0.587 + b * 0.114);
    
    // If pixel is darker than background, calculate alpha proportional to darkness
    const darkness = Math.max(0, bgLum - currentLum);
    const alpha = Math.min(255, Math.round(darkness * 4.2));

    // Keep warm brown/gold stroke color
    outputData[i * 4] = r;
    outputData[i * 4 + 1] = g;
    outputData[i * 4 + 2] = b;
    outputData[i * 4 + 3] = alpha;
  }

  await sharp(outputData, {
    raw: { width, height, channels: 4 }
  })
  .png()
  .toFile(path.join(outputDir, outputName));

  console.log(`Saved transparent: ${outputName}`);
}

async function run() {
  await makeTransparent('heritage-left.png', 'heritage-left-transparent.png');
  await makeTransparent('heritage-right.png', 'heritage-right-transparent.png');
}

run().catch(console.error);

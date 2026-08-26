import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = '/Users/sumitkumarmaurya/.gemini/antigravity-ide/brain/a8fb8e62-36ee-4618-8a02-ee4e752de944/.user_uploaded/media_1787604100186.png';
const outputDir = path.join(__dirname, '../public/assets');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function processImage() {
  const metadata = await sharp(inputPath).metadata();
  console.log('Original metadata:', metadata);

  // The label is in the top left ~16px, border is ~4px.
  // Crop area: left 6, top 18, width: width - 12, height: height - 24
  const cropLeft = 8;
  const cropTop = 18;
  const cropWidth = metadata.width - 16;
  const cropHeight = metadata.height - 24;

  const croppedBuffer = await sharp(inputPath)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .toBuffer();

  // Save clean full cropped background
  await sharp(croppedBuffer)
    .toFile(path.join(outputDir, 'heritage-navbar-bg.png'));
  console.log('Saved heritage-navbar-bg.png');

  // Extract Left side illustration (width ~260px)
  const leftWidth = Math.round(cropWidth * 0.28);
  await sharp(croppedBuffer)
    .extract({ left: 0, top: 0, width: leftWidth, height: cropHeight })
    .toFile(path.join(outputDir, 'heritage-left.png'));
  console.log('Saved heritage-left.png');

  // Extract Right side illustration (width ~260px)
  const rightWidth = Math.round(cropWidth * 0.28);
  const rightLeft = cropWidth - rightWidth;
  await sharp(croppedBuffer)
    .extract({ left: rightLeft, top: 0, width: rightWidth, height: cropHeight })
    .toFile(path.join(outputDir, 'heritage-right.png'));
  console.log('Saved heritage-right.png');
}

processImage().catch(console.error);

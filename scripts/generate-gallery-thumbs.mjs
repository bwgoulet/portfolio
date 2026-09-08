#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Cabin textures are displayed on very small planes, so 256px preserves more
// than enough detail while keeping the initial scene transfer inexpensive.
const THUMBNAIL_WIDTH = 256;
const THUMBNAIL_HEIGHT = 256;
const THUMBNAIL_QUALITY = 64;

const GALLERY_THUMBNAILS = [
  // Keep these entries in sync with GALLERY_PHOTOS in cabinAssets.ts.
  ['hacknc_jump.jpeg', 'hacknc_jump.webp'],
  ['beatduke.jpg', 'beatduke.webp'],
  ['pywteam.jpg', 'pywteam.webp'],
  ['poker.jpg', 'poker.webp'],
  ['hgod.jpg', 'hgod.webp'],
  ['crater lake.jpg', 'crater-lake.webp'],
  ['hellopio.jpg', 'hellopio.webp'],
  ['brevityaward.png', 'brevityaward.webp'],
  ['tarheel10.jpg', 'tarheel10.webp'],
  ['mayhem.jpg', 'mayhem.webp'],
  ['acting.jpg', 'acting.webp'],
  ['prs25.jpg', 'prs25.webp'],
  ['prf25.png', 'prf25.webp'],
  ['album9.png', 'album9.webp'],
  ['game9.png', 'game9.webp'],
];

const galleryDir = path.join(process.cwd(), 'public', 'gallery');
const thumbsDir = path.join(galleryDir, 'thumbs');
const cabinAssetsPath = path.join(
  process.cwd(),
  'components',
  'scene',
  'cabinAssets.ts'
);

function bytesToKiB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

async function generateThumbnail([sourceFile, outputFile]) {
  const sourcePath = path.join(galleryDir, sourceFile);
  const outputPath = path.join(thumbsDir, outputFile);

  await sharp(sourcePath)
    .rotate()
    .resize({
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      fit: 'inside',
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    })
    .webp({ quality: THUMBNAIL_QUALITY, effort: 6 })
    .toFile(outputPath);

  const [sourceStats, outputStats] = await Promise.all([
    fs.stat(sourcePath),
    fs.stat(outputPath),
  ]);

  return {
    sourceFile,
    outputFile,
    sourceBytes: sourceStats.size,
    outputBytes: outputStats.size,
  };
}

async function validateGalleryCoverage() {
  const cabinAssets = await fs.readFile(cabinAssetsPath, 'utf8');
  const galleryPhotos = cabinAssets.match(
    /export const GALLERY_PHOTOS:[\s\S]*?export const CABIN_INTERIOR_ARTWORKS/
  )?.[0];

  if (!galleryPhotos) {
    throw new Error('Could not find GALLERY_PHOTOS in cabinAssets.ts.');
  }

  const configuredTextures = [
    ...galleryPhotos.matchAll(/textureSrc: "\/gallery\/thumbs\/([^"]+\.webp)"/g),
  ].map((match) => match[1]);
  const generatedTextures = new Set(
    GALLERY_THUMBNAILS.map(([, outputFile]) => outputFile)
  );
  const missingTextures = configuredTextures.filter(
    (texture) => !generatedTextures.has(texture)
  );
  const photoCount = (galleryPhotos.match(/id: "photo-/g) ?? []).length;

  if (configuredTextures.length !== photoCount || missingTextures.length > 0) {
    throw new Error(
      `GALLERY_PHOTOS thumbnail coverage is incomplete. Missing: ${
        missingTextures.join(', ') || 'a textureSrc assignment'
      }`
    );
  }
}

async function main() {
  await validateGalleryCoverage();
  await fs.mkdir(thumbsDir, { recursive: true });

  let sourceBytes = 0;
  let outputBytes = 0;
  const results = [];

  for (const thumbnail of GALLERY_THUMBNAILS) {
    const result = await generateThumbnail(thumbnail);
    sourceBytes += result.sourceBytes;
    outputBytes += result.outputBytes;
    results.push(result);
  }

  console.log(`Generated ${results.length} gallery thumbnail texture(s).`);
  console.log(
    `Gallery texture source size: ${bytesToKiB(sourceBytes)} -> ${bytesToKiB(outputBytes)}`
  );
}

main();

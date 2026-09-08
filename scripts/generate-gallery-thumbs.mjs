#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Cabin textures are displayed on very small planes, so 256px preserves more
// than enough detail while keeping the initial scene transfer inexpensive.
const THUMBNAIL_WIDTH = 256;
const THUMBNAIL_HEIGHT = 256;
const THUMBNAIL_QUALITY = 64;
const SOURCE_EXTENSIONS = new Set([
  '.avif',
  '.jpeg',
  '.jpg',
  '.png',
  '.tif',
  '.tiff',
]);

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

async function getGalleryThumbnails() {
  const cabinAssets = await fs.readFile(cabinAssetsPath, 'utf8');
  const galleryAssets = cabinAssets.match(
    /export const GALLERY_PHOTOS:[\s\S]*?export const CABIN_INTERIOR_MODEL_ASSETS/
  )?.[0];

  if (!galleryAssets) {
    throw new Error('Could not find gallery assets in cabinAssets.ts.');
  }

  const thumbnails = [
    ...galleryAssets.matchAll(
      /imageSrc:\s*["']\/gallery\/([^"']+)["'][\s\S]*?textureSrc:\s*["']\/gallery\/thumbs\/([^"']+\.webp)["']/g
    ),
  ].map(([, sourceFile, outputFile]) => [sourceFile, outputFile]);
  const configuredTextureCount = (
    galleryAssets.match(/textureSrc:\s*["']\/gallery\/thumbs\//g) ?? []
  ).length;

  if (thumbnails.length !== configuredTextureCount) {
    throw new Error(
      'Every gallery asset must have an imageSrc and a .webp textureSrc.'
    );
  }

  const configuredThumbnails = [
    ...new Map(thumbnails.map((thumbnail) => [thumbnail[1], thumbnail])).values(),
  ];
  const configuredSources = new Set(
    configuredThumbnails.map(([sourceFile]) => sourceFile)
  );
  const galleryEntries = await fs.readdir(galleryDir, { withFileTypes: true });
  const discoveredThumbnails = galleryEntries
    .filter(
      (entry) =>
        entry.isFile() &&
        SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) &&
        !configuredSources.has(entry.name)
    )
    .map((entry) => [
      entry.name,
      `${path.basename(entry.name, path.extname(entry.name))}.webp`,
    ]);

  const allThumbnails = [...configuredThumbnails, ...discoveredThumbnails];
  const outputSources = new Map();

  for (const [sourceFile, outputFile] of allThumbnails) {
    const existingSource = outputSources.get(outputFile);
    if (existingSource && existingSource !== sourceFile) {
      throw new Error(
        `Gallery images ${existingSource} and ${sourceFile} both generate ${outputFile}. Configure a unique textureSrc for one of them.`
      );
    }
    outputSources.set(outputFile, sourceFile);
  }

  return allThumbnails.sort(([left], [right]) => left.localeCompare(right));
}

async function main() {
  const galleryThumbnails = await getGalleryThumbnails();
  await fs.mkdir(thumbsDir, { recursive: true });

  let sourceBytes = 0;
  let outputBytes = 0;
  const results = [];

  for (const thumbnail of galleryThumbnails) {
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

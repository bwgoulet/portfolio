#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DATA_MAP_HINTS = [
  'normal',
  'rough',
  'metal',
  'ao',
  'ambientocclusion',
  'height',
  'displace',
  'bump',
  'gloss',
  'specular',
  'orm',
  'occlusion',
  'alpha',
  'mask',
];

const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

function parseArgs(argv) {
  const defaults = {
    src: 'public/textures',
    out: 'public/textures-optimized',
    maxColor: 2048,
    maxData: 1024,
    quality: 82,
    dryRun: false,
    inPlace: false,
  };

  const args = { ...defaults };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--src') args.src = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
    else if (arg === '--max-color') args.maxColor = Number(argv[++i]);
    else if (arg === '--max-data') args.maxData = Number(argv[++i]);
    else if (arg === '--quality') args.quality = Number(argv[++i]);
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--in-place') args.inPlace = true;
    else if (arg === '--help') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isFinite(args.maxColor) || args.maxColor <= 0) {
    throw new Error('--max-color must be a positive number');
  }
  if (!Number.isFinite(args.maxData) || args.maxData <= 0) {
    throw new Error('--max-data must be a positive number');
  }
  if (!Number.isFinite(args.quality) || args.quality < 1 || args.quality > 100) {
    throw new Error('--quality must be between 1 and 100');
  }
  if (args.inPlace) {
    args.out = args.src;
  }

  return args;
}

function usage() {
  console.log(`Downscale textures for real-time rendering usage.\n\nUsage:\n  node scripts/downscale-textures.mjs [options]\n\nOptions:\n  --src <dir>         Source directory (default: public/textures)\n  --out <dir>         Output directory (default: public/textures-optimized)\n  --max-color <px>    Max dimension for color maps (default: 2048)\n  --max-data <px>     Max dimension for data maps (default: 1024)\n  --quality <1-100>   Compression quality (default: 82)\n  --in-place          Overwrite files in source directory\n  --dry-run           Print plan without writing files\n  --help              Show this help\n\nExamples:\n  node scripts/downscale-textures.mjs --dry-run\n  node scripts/downscale-textures.mjs --max-color 2048 --max-data 1024\n  node scripts/downscale-textures.mjs --in-place --quality 80`);
}

async function listFilesRecursively(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function isTexture(filePath) {
  return SUPPORTED_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function isDataMap(filePath) {
  const lower = path.basename(filePath).toLowerCase();
  return DATA_MAP_HINTS.some((hint) => lower.includes(hint));
}

function relativeFrom(base, target) {
  return path.relative(path.resolve(base), path.resolve(target));
}

function bytesToMB(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function processTexture(filePath, options) {
  const { src, out, maxColor, maxData, quality, dryRun } = options;
  const relative = relativeFrom(src, filePath);
  const outputPath = path.join(out, relative);

  const mapType = isDataMap(filePath) ? 'data' : 'color';
  const maxDimension = mapType === 'data' ? maxData : maxColor;

  const sourceStats = await fs.stat(filePath);
  const image = sharp(filePath);
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Cannot read dimensions for ${filePath}`);
  }

  const needsResize = metadata.width > maxDimension || metadata.height > maxDimension;

  if (!dryRun) {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    let pipeline = sharp(filePath).resize({
      width: maxDimension,
      height: maxDimension,
      fit: 'inside',
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    });

    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ compressionLevel: 9, palette: true, quality });
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality });
    } else if (ext === '.tif' || ext === '.tiff') {
      pipeline = pipeline.tiff({ quality });
    }

    await pipeline.toFile(outputPath);
  }

  const targetStats = dryRun ? null : await fs.stat(outputPath);

  return {
    filePath,
    outputPath,
    mapType,
    maxDimension,
    width: metadata.width,
    height: metadata.height,
    resized: needsResize,
    beforeBytes: sourceStats.size,
    afterBytes: targetStats?.size,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }

  const sourceDir = path.resolve(options.src);
  const outputDir = path.resolve(options.out);

  try {
    const sourceStat = await fs.stat(sourceDir);
    if (!sourceStat.isDirectory()) {
      throw new Error(`Source path is not a directory: ${sourceDir}`);
    }
  } catch (error) {
    throw new Error(`Source directory not found: ${sourceDir}`);
  }

  const allFiles = await listFilesRecursively(sourceDir);
  const textureFiles = allFiles.filter(isTexture);

  if (textureFiles.length === 0) {
    console.log(`No supported textures found in ${sourceDir}`);
    return;
  }

  console.log(`Found ${textureFiles.length} texture(s).`);
  console.log(`Mode: ${options.dryRun ? 'dry-run' : 'write'}`);
  console.log(`Color map max dimension: ${options.maxColor}`);
  console.log(`Data map max dimension: ${options.maxData}`);
  if (!options.dryRun) {
    console.log(`Output directory: ${outputDir}`);
  }

  let beforeBytes = 0;
  let afterBytes = 0;
  let resizedCount = 0;

  for (const texturePath of textureFiles) {
    const result = await processTexture(texturePath, options);
    beforeBytes += result.beforeBytes;
    afterBytes += result.afterBytes ?? result.beforeBytes;
    if (result.resized) resizedCount += 1;

    const fromName = relativeFrom(sourceDir, result.filePath);
    const toName = relativeFrom(options.out, result.outputPath);
    const sizeInfo = `${result.width}x${result.height} -> max ${result.maxDimension}`;
    const bytesInfo = options.dryRun
      ? `${bytesToMB(result.beforeBytes)} (estimated write skipped)`
      : `${bytesToMB(result.beforeBytes)} -> ${bytesToMB(result.afterBytes ?? 0)}`;

    console.log(`- [${result.mapType}] ${fromName} (${sizeInfo}) | ${bytesInfo} | out: ${toName}`);
  }

  console.log('\nSummary');
  console.log(`- Textures processed: ${textureFiles.length}`);
  console.log(`- Textures above max dimension: ${resizedCount}`);
  console.log(`- Total input size: ${bytesToMB(beforeBytes)}`);

  if (!options.dryRun) {
    const reduction = beforeBytes > 0 ? ((beforeBytes - afterBytes) / beforeBytes) * 100 : 0;
    console.log(`- Total output size: ${bytesToMB(afterBytes)}`);
    console.log(`- Size reduction: ${reduction.toFixed(1)}%`);
  }
}

main().catch((error) => {
  console.error(`\nError: ${error.message}`);
  process.exit(1);
});

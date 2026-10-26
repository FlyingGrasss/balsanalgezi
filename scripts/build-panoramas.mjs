#!/usr/bin/env node
/**
 * Regenerates the progressive panorama tiers under public/panoramas/v1 from
 * the original 6080x3040 JPEGs in git history.
 *
 * Usage:
 *   pnpm panoramas
 *   pnpm panoramas -- --commit=<sha>
 *   pnpm panoramas -- --source=<directory-containing-1.jpg..45.jpg>
 */
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const OUTPUT_VERSION = 'v2';
const SOURCE_COMMIT = 'fa1191e';
const SOURCE_DIR = 'public/locations/BALVR';
const EXPECTED_COUNT = 45;
const SOURCE_WIDTH = 6080;
const SOURCE_HEIGHT = 3040;

const TIERS = {
  preview: { width: 1024, height: 512, quality: 70 },
  mid: { width: 2560, height: 1280, quality: 80 },
  mobile: { width: 4096, height: 2048, quality: 90 },
  high: { width: 6080, height: 3040, quality: 85 },
};

const OUTPUT_ROOT = path.join(ROOT, 'public', 'panoramas', OUTPUT_VERSION);
const MANIFEST_PATH = path.join(OUTPUT_ROOT, 'manifest.json');
const EXPECTED_IDS = Array.from({ length: EXPECTED_COUNT }, (_, index) => index + 1);

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const options = { source: null, commit: SOURCE_COMMIT };

  for (const arg of argv) {
    if (arg.startsWith('--source=')) {
      const value = arg.slice('--source='.length);
      if (!value) fail('--source requires a directory path.');
      options.source = path.resolve(process.cwd(), value);
      continue;
    }

    if (arg.startsWith('--commit=')) {
      const value = arg.slice('--commit='.length);
      if (!value) fail('--commit requires a git revision.');
      options.commit = value;
      continue;
    }

    fail(`Unknown argument: ${arg}`);
  }

  return options;
}

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function idFromJpegName(name) {
  const match = /^(\d+)\.jpg$/i.exec(name);
  if (!match) return null;

  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function collectGitSources(commit) {
  const listing = execFileSync(
    'git',
    ['ls-tree', '-r', '--name-only', commit, '--', SOURCE_DIR],
    { cwd: ROOT, maxBuffer: 64 * 1024 * 1024, encoding: 'utf8' },
  );

  const files = new Map();
  const warnings = [];
  const unexpected = [];

  for (const line of listing.split(/\r?\n/)) {
    const file = line.trim();
    if (!file) continue;

    const name = path.posix.basename(file);
    if (!name.toLowerCase().endsWith('.jpg')) {
      warnings.push(`Ignoring non-JPEG source file: ${file}`);
      continue;
    }

    const id = idFromJpegName(name);
    if (id === null || id > EXPECTED_COUNT) {
      unexpected.push(file);
      continue;
    }
    if (files.has(id)) fail(`Duplicate source id ${id}: ${file}`);
    files.set(id, file);
  }

  const missing = EXPECTED_IDS.filter((id) => !files.has(id));
  if (missing.length > 0) {
    fail(
      `Missing ${missing.length} source image(s) in ${commit}:${SOURCE_DIR}: ` +
        missing.map((id) => `${id}.jpg`).join(', '),
    );
  }
  if (unexpected.length > 0) {
    warnings.push(
      `Ignoring ${unexpected.length} unexpected JPEG(s) outside ids 1..${EXPECTED_COUNT}: ` +
        unexpected.join(', '),
    );
  }

  return { files, warnings, pathLabel: `${commit}:${SOURCE_DIR}` };
}

function collectLocalSources(sourceDir) {
  if (!existsSync(sourceDir) || !statSync(sourceDir).isDirectory()) {
    fail(`Source directory does not exist: ${sourceDir}`);
  }

  const files = new Map();
  const warnings = [];
  const unexpected = [];

  for (const name of readdirSync(sourceDir)) {
    if (!name.toLowerCase().endsWith('.jpg')) continue;

    const id = idFromJpegName(name);
    if (id === null || id > EXPECTED_COUNT) {
      unexpected.push(name);
      continue;
    }
    if (files.has(id)) fail(`Duplicate source id ${id}: ${name}`);
    files.set(id, path.join(sourceDir, name));
  }

  const missing = EXPECTED_IDS.filter((id) => !files.has(id));
  if (missing.length > 0) {
    fail(
      `Missing ${missing.length} source image(s) in ${sourceDir}: ` +
        missing.map((id) => `${id}.jpg`).join(', '),
    );
  }
  if (unexpected.length > 0) {
    warnings.push(
      `Ignoring ${unexpected.length} unexpected JPEG(s) outside ids 1..${EXPECTED_COUNT}: ` +
        unexpected.join(', '),
    );
  }

  return { files, warnings, pathLabel: sourceDir };
}

function prepareOutputDirs() {
  const expectedNames = new Set(EXPECTED_IDS.map((id) => `${id}.webp`));

  for (const tier of Object.keys(TIERS)) {
    const tierDir = path.join(OUTPUT_ROOT, tier);
    mkdirSync(tierDir, { recursive: true });

    // Keep the generated directory limited to the ids this build owns so a
    // stale file from an older id set cannot silently survive a rebuild.
    for (const name of readdirSync(tierDir)) {
      if (/^\d+\.webp$/i.test(name) && !expectedNames.has(name)) {
        unlinkSync(path.join(tierDir, name));
      }
    }
  }
}

async function readSourceBuffer(mode, source, commit) {
  if (mode === 'local') {
    return { buffer: readFileSync(source), label: source };
  }

  const spec = `${commit}:${source}`;
  const buffer = execFileSync('git', ['show', spec], {
    cwd: ROOT,
    maxBuffer: 64 * 1024 * 1024,
  });
  return { buffer, label: spec };
}

async function verifySourceDimensions(buffer, label) {
  let metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch (error) {
    fail(`Unable to read image metadata for ${label}: ${error.message}`);
  }

  if (metadata.width !== SOURCE_WIDTH || metadata.height !== SOURCE_HEIGHT) {
    fail(
      `Unexpected dimensions for ${label}: expected ` +
        `${SOURCE_WIDTH}x${SOURCE_HEIGHT}, got ` +
        `${metadata.width ?? 'unknown'}x${metadata.height ?? 'unknown'}.`,
    );
  }

  return metadata;
}

async function generateTier(buffer, tier, config, outputPath) {
  const { width, height, quality } = config;

  await sharp(buffer)
    .rotate()
    .resize(width, height, { fit: 'fill' })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toFile(outputPath);

  if (!existsSync(outputPath)) {
    fail(`Generated file is missing: ${outputPath}`);
  }

  const stat = statSync(outputPath);
  if (stat.size === 0) {
    fail(`Generated file is empty: ${outputPath}`);
  }

  const metadata = await sharp(outputPath).metadata();
  if (metadata.width !== width || metadata.height !== height) {
    fail(
      `Generated ${tier} has wrong dimensions: expected ${width}x${height}, ` +
        `got ${metadata.width ?? 'unknown'}x${metadata.height ?? 'unknown'} (${outputPath}).`,
    );
  }

  return stat.size;
}

function writeManifest({ mode, commit, sourcePath, images, tierStats }) {
  const tiers = {};

  for (const [tier, config] of Object.entries(TIERS)) {
    const files = {};
    for (const image of images) {
      files[String(image.id)] = image.bytes[tier];
    }

    const totalBytes = tierStats[tier].totalBytes;
    tiers[tier] = {
      width: config.width,
      height: config.height,
      quality: config.quality,
      count: images.length,
      totalBytes,
      averageBytes: Math.round(totalBytes / images.length),
      files,
    };
  }

  const manifest = {
    version: OUTPUT_VERSION,
    source: {
      mode,
      commit: mode === 'git' ? commit : null,
      path: sourcePath,
    },
    count: images.length,
    images: images.map((image) => ({
      id: image.id,
      sourceBytes: image.sourceBytes,
      bytes: image.bytes,
    })),
    tiers,
  };

  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

function verifyGeneratedFiles() {
  let totalFiles = 0;

  for (const tier of Object.keys(TIERS)) {
    const tierDir = path.join(OUTPUT_ROOT, tier);
    const generated = readdirSync(tierDir).filter((name) => /^\d+\.webp$/i.test(name));

    if (generated.length !== EXPECTED_COUNT) {
      fail(
        `Expected ${EXPECTED_COUNT} ${tier} files in ${tierDir}, found ${generated.length}.`,
      );
    }

    for (const id of EXPECTED_IDS) {
      const outputPath = path.join(tierDir, `${id}.webp`);
      if (!existsSync(outputPath)) {
        fail(`Generated file is missing: ${outputPath}`);
      }
      if (statSync(outputPath).size === 0) {
        fail(`Generated file is empty: ${outputPath}`);
      }
    }

    totalFiles += generated.length;
  }

  return totalFiles;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const mode = options.source ? 'local' : 'git';

  console.log(`Panorama build (${OUTPUT_VERSION})`);
  console.log(`Source: ${options.source ?? `${options.commit}:${SOURCE_DIR}`}`);

  const sourceSet =
    mode === 'local' ? collectLocalSources(options.source) : collectGitSources(options.commit);

  const warnings = [...sourceSet.warnings];
  prepareOutputDirs();

  const images = [];
  const tierStats = Object.fromEntries(
    Object.keys(TIERS).map((tier) => [tier, { totalBytes: 0 }]),
  );
  let totalSourceBytes = 0;

  for (const [index, id] of EXPECTED_IDS.entries()) {
    const source = sourceSet.files.get(id);
    const read = await readSourceBuffer(mode, source, options.commit);
    const metadata = await verifySourceDimensions(read.buffer, read.label);

    if (metadata.format !== 'jpeg') {
      warnings.push(`Source ${source} is ${metadata.format ?? 'unknown'}, expected JPEG.`);
    }

    totalSourceBytes += read.buffer.length;

    const bytes = {};
    const partLabels = [];

    for (const [tier, config] of Object.entries(TIERS)) {
      const outputPath = path.join(OUTPUT_ROOT, tier, `${id}.webp`);
      const size = await generateTier(read.buffer, tier, config, outputPath);
      bytes[tier] = size;
      tierStats[tier].totalBytes += size;
      partLabels.push(`${tier} ${formatKb(size)}`);
    }

    images.push({ id, sourceBytes: read.buffer.length, bytes });

    console.log(
      `[${String(index + 1).padStart(2, ' ')}/${EXPECTED_COUNT}] ${id}.jpg ` +
        `(${formatMb(read.buffer.length)}) -> ${partLabels.join(' | ')}`,
    );
  }

  writeManifest({
    mode,
    commit: options.commit,
    sourcePath: options.source ?? SOURCE_DIR,
    images,
    tierStats,
  });

  const totalGenerated = verifyGeneratedFiles();
  const manifestStat = statSync(MANIFEST_PATH);

  console.log('');
  console.log('Summary');
  console.log(
    `  Source: ${images.length} images, ${formatMb(totalSourceBytes)} ` +
      `(${formatKb(totalSourceBytes / images.length)} average)`,
  );

  for (const [tier, config] of Object.entries(TIERS)) {
    const { totalBytes } = tierStats[tier];
    console.log(
      `  ${tier.padEnd(7)} ${config.width}x${config.height} q${config.quality}: ` +
        `${formatMb(totalBytes)} total, ${formatKb(totalBytes / images.length)} average`,
    );
  }

  if (warnings.length > 0) {
    console.log(`  Warnings (${warnings.length}):`);
    for (const warning of warnings) console.log(`    - ${warning}`);
  } else {
    console.log('  Warnings: none');
  }
  console.log(
    `  Dimension warnings: none (all sources verified at ${SOURCE_WIDTH}x${SOURCE_HEIGHT})`,
  );

  console.log(
    `  Verified ${totalGenerated} generated WebP files; manifest ` +
      `${formatKb(manifestStat.size)} at ${path.relative(ROOT, MANIFEST_PATH)}`,
  );
}

main().catch((error) => {
  console.error(`\nPanorama build failed: ${error.message}`);
  process.exitCode = 1;
});

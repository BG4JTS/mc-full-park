#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const ROOT = path.resolve(import.meta.dirname, '..');
const RESOURCES = path.join(ROOT, 'resources');
const ARTIFACTS = path.join(ROOT, 'artifacts');
const BUILD_DIR = path.join(ROOT, '.build');

async function main() {
  console.log('=== MC Full Park - Build Pack ===\n');

  const modsData = JSON.parse(fs.readFileSync(path.join(RESOURCES, 'mods.json'), 'utf-8'));
  const ropeConfig = parseRopeToml(fs.readFileSync(path.join(ROOT, 'rope.toml'), 'utf-8'));

  const mcVersion = ropeConfig['game-versions']?.[0] || ropeConfig['minecraft-version'] || '26.1.2';
  const packVersion = ropeConfig['package-version'] || '1.0.0';
  const loader = (ropeConfig['loaders']?.[0] || 'fabric').toLowerCase();

  console.log(`Minecraft: ${mcVersion}`);
  console.log(`Loader: ${loader}`);
  console.log(`Pack Version: ${packVersion}`);
  console.log(`Mods: ${modsData.mods.length}\n`);

  clean(BUILD_DIR);
  clean(ARTIFACTS);
  fs.mkdirSync(ARTIFACTS, { recursive: true });

  const manifest = buildManifest(modsData, mcVersion, loader, packVersion);

  const packDir = path.join(BUILD_DIR, 'mcpark-pack');
  fs.mkdirSync(path.join(packDir, 'overrides', 'config'), { recursive: true });
  fs.mkdirSync(path.join(packDir, 'overrides', 'mods'), { recursive: true });

  fs.writeFileSync(path.join(packDir, 'mcpark.manifest.json'), JSON.stringify(manifest, null, 2));

  const overridesReadme = `# MC Full Park - Overrides\nPlace config files and mods in this directory.\n`;
  fs.writeFileSync(path.join(packDir, 'overrides', 'README.md'), overridesReadme);

  const packName = `MC-Full-Pack-${mcVersion}-${loader}`;
  const outputPath = path.join(ARTIFACTS, `${packName}.mcpark`);

  await createZip(packDir, outputPath);

  const mrpackManifest = buildMrpackIndex(manifest, mcVersion, loader, packVersion);
  fs.writeFileSync(
    path.join(ARTIFACTS, `${packName}.mrpack`),
    JSON.stringify(mrpackManifest, null, 2)
  );

  console.log(`\nBuild complete!`);
  console.log(`  .mcpark: ${outputPath}`);
  console.log(`  .mrpack: ${path.join(ARTIFACTS, `${packName}.mrpack`)}`);

  clean(BUILD_DIR);
}

function buildManifest(modsData, mcVersion, loader, packVersion) {
  return {
    formatVersion: 1,
    game: 'minecraft',
    versionId: packVersion,
    name: 'MC Full Park',
    summary: '自动化生电建筑整合包',
    mcVersion,
    loader: { id: loader, version: 'latest' },
    files: modsData.mods.map(mod => ({
      id: mod.id,
      name: mod.name,
      version: mod.version,
      required: mod.required,
      category: mod.category,
      description: mod.description,
      source: mod.source,
      projectId: mod.projectId,
      dependencies: mod.dependencies || [],
      env: { client: 'required', server: mod.required ? 'required' : 'optional' }
    })),
    dependencies: {
      minecraft: mcVersion,
      [loader]: 'latest'
    }
  };
}

function buildMrpackIndex(manifest, mcVersion, loader, packVersion) {
  return {
    formatVersion: 1,
    game: 'minecraft',
    versionId: packVersion,
    name: manifest.name,
    summary: manifest.summary,
    files: manifest.files.map(f => ({
      path: `mods/${f.id}-${f.version}.jar`,
      hashes: { sha1: 'pending', sha512: 'pending' },
      env: f.env,
      downloads: [`https://cdn.modrinth.com/data/${f.projectId}/versions/${f.version}/${f.id}-${f.version}.jar`],
      fileSize: 0
    })),
    dependencies: {
      minecraft: mcVersion,
      [loader]: 'latest'
    }
  };
}

function parseRopeToml(content) {
  const result = {};
  const lines = content.split('\n');
  let section = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const sectionMatch = trimmed.match(/^\[(.+)]$/);
    if (sectionMatch) {
      section = sectionMatch[1];
      continue;
    }

    const kvMatch = trimmed.match(/^(\S+)\s*=\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      let value = kvMatch[2].trim();

      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith('[')) {
        value = JSON.parse(value.replace(/'/g, '"'));
      } else if (value === 'true' || value === 'false') {
        value = value === 'true';
      }

      result[key] = value;
    }
  }
  return result;
}

async function createZip(sourceDir, outputPath) {
  const { execSync } = await import('child_process');
  const isWindows = process.platform === 'win32';

  if (isWindows) {
    execSync(`powershell -Command "Compress-Archive -Path '${sourceDir.replace(/\//g, '\\\\')}\\\\*' -DestinationPath '${outputPath.replace(/\.mcpark$/, '.zip').replace(/\//g, '\\\\')}' -Force"`, { stdio: 'inherit' });
    fs.renameSync(outputPath.replace(/\.mcpark$/, '.zip'), outputPath);
  } else {
    execSync(`cd "${sourceDir}" && zip -r "${outputPath}" .`, { stdio: 'inherit' });
  }
}

function clean(dir) {
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    } catch {
      // Windows file lock race — best effort
    }
  }
}

main().catch(err => {
  console.error('Build failed:', err.message);
  process.exit(1);
});

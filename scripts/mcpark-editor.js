#!/usr/bin/env node

/**
 * .mcpark CLI Parser & Analyzer
 *
 * Usage:
 *   node scripts/mcpark-editor.js parse <file.mcpark>        Parse and display manifest
 *   node scripts/mcpark-editor.js deps <file.mcpark>         Show dependency tree
 *   node scripts/mcpark-editor.js validate <file.mcpark>     Validate manifest structure
 *   node scripts/mcpark-editor.js info <file.mcpark>         Show pack summary
 *   node scripts/mcpark-editor.js conflicts <file.mcpark>    Detect dependency conflicts
 *   node scripts/mcpark-editor.js export-json <file.mcpark>  Export manifest as JSON
 *   node scripts/mcpark-editor.js create <mods.json>         Create .mcpark from mods list
 */

import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const [,, command, ...args] = process.argv;

async function loadMcpark(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }

  const buffer = fs.readFileSync(resolved);
  const zip = await JSZip.loadAsync(buffer);
  const manifestFile = zip.file('mcpark.manifest.json');

  if (!manifestFile) {
    console.error('Invalid .mcpark: missing mcpark.manifest.json');
    process.exit(1);
  }

  const text = await manifestFile.async('text');
  return JSON.parse(text);
}

function printTree(modId, modMap, visited = new Set(), depth = 0) {
  const indent = '  '.repeat(depth);
  const mod = modMap.get(modId);

  if (visited.has(modId)) {
    console.log(`${indent}- ${modId} (circular ref)`);
    return;
  }
  visited.add(modId);

  if (mod) {
    const reqTag = mod.required ? ' [REQUIRED]' : '';
    console.log(`${indent}- ${mod.name} v${mod.version}${reqTag}`);
    for (const dep of mod.dependencies) {
      printTree(dep, modMap, new Set(visited), depth + 1);
    }
  } else {
    console.log(`${indent}- ${modId} [MISSING]`);
  }
}

function detectConflicts(manifest) {
  const conflicts = [];
  const modMap = new Map(manifest.files.map(m => [m.id, m]));

  for (const mod of manifest.files) {
    for (const depId of mod.dependencies) {
      const dep = modMap.get(depId);
      if (!dep) {
        conflicts.push({ type: 'missing', mod: mod.id, missing: depId });
      }
    }
  }

  const visited = new Set();
  const stack = new Set();

  function hasCycle(id) {
    if (stack.has(id)) return true;
    if (visited.has(id)) return false;
    visited.add(id);
    stack.add(id);
    const mod = modMap.get(id);
    if (mod) {
      for (const dep of mod.dependencies) {
        if (hasCycle(dep)) {
          conflicts.push({ type: 'circular', chain: id });
          return true;
        }
      }
    }
    stack.delete(id);
    return false;
  }

  for (const mod of manifest.files) {
    visited.clear();
    stack.clear();
    hasCycle(mod.id);
  }

  return conflicts;
}

async function cmdParse() {
  const manifest = await loadMcpark(args[0]);
  console.log(`\n=== ${manifest.name} v${manifest.versionId} ===`);
  console.log(`Game: ${manifest.game} ${manifest.mcVersion}`);
  console.log(`Loader: ${manifest.loader?.id || 'unknown'}\n`);

  const categories = {};
  for (const mod of manifest.files) {
    if (!categories[mod.category]) categories[mod.category] = [];
    categories[mod.category].push(mod);
  }

  for (const [cat, mods] of Object.entries(categories).sort()) {
    console.log(`[${cat}] (${mods.length})`);
    for (const mod of mods) {
      const req = mod.required ? '*' : ' ';
      const deps = mod.dependencies?.length ? ` -> ${mod.dependencies.join(', ')}` : '';
      console.log(`  ${req} ${mod.name} v${mod.version}${deps}`);
    }
    console.log();
  }
}

async function cmdDeps() {
  const manifest = await loadMcpark(args[0]);
  const modMap = new Map(manifest.files.map(m => [m.id, m]));
  const target = args[1];

  if (target) {
    const mod = modMap.get(target);
    if (!mod) {
      console.error(`Mod not found: ${target}`);
      process.exit(1);
    }
    console.log(`\nDependency tree for ${mod.name}:\n`);
    printTree(target, modMap);
  } else {
    console.log(`\nFull dependency graph for ${manifest.name}:\n`);
    const roots = manifest.files.filter(m =>
      !manifest.files.some(other => other.dependencies.includes(m.id))
    );
    for (const root of roots) {
      printTree(root.id, modMap);
      console.log();
    }
  }
}

async function cmdValidate() {
  try {
    const manifest = await loadMcpark(args[0]);
    const errors = [];

    if (!manifest.formatVersion) errors.push('Missing formatVersion');
    if (!manifest.game) errors.push('Missing game field');
    if (!manifest.mcVersion) errors.push('Missing mcVersion');
    if (!Array.isArray(manifest.files)) errors.push('files must be an array');

    if (manifest.files) {
      const ids = new Set();
      for (const [i, mod] of manifest.files.entries()) {
        if (!mod.id) errors.push(`files[${i}]: missing id`);
        if (!mod.name) errors.push(`files[${i}]: missing name`);
        if (!mod.version) errors.push(`files[${i}]: missing version`);
        if (ids.has(mod.id)) errors.push(`Duplicate mod id: ${mod.id}`);
        ids.add(mod.id);

        for (const dep of mod.dependencies || []) {
          if (!ids.has(dep) && !manifest.files.some(m => m.id === dep)) {
            errors.push(`${mod.id}: dependency "${dep}" not found in pack`);
          }
        }
      }
    }

    if (errors.length === 0) {
      console.log('Manifest is valid.');
    } else {
      console.log(`Found ${errors.length} issue(s):\n`);
      for (const err of errors) console.log(`  - ${err}`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`Validation failed: ${err.message}`);
    process.exit(1);
  }
}

async function cmdInfo() {
  const manifest = await loadMcpark(args[0]);
  const required = manifest.files.filter(m => m.required);
  const optional = manifest.files.filter(m => !m.required);
  const categories = [...new Set(manifest.files.map(m => m.category))];

  console.log(`\nPack: ${manifest.name} v${manifest.versionId}`);
  console.log(`Summary: ${manifest.summary || 'N/A'}`);
  console.log(`MC: ${manifest.mcVersion} | Loader: ${manifest.loader?.id}`);
  console.log(`Total mods: ${manifest.files.length} (${required.length} required, ${optional.length} optional)`);
  console.log(`Categories: ${categories.join(', ')}`);
}

async function cmdConflicts() {
  const manifest = await loadMcpark(args[0]);
  const conflicts = detectConflicts(manifest);

  if (conflicts.length === 0) {
    console.log('No conflicts detected.');
    return;
  }

  console.log(`Found ${conflicts.length} conflict(s):\n`);
  for (const c of conflicts) {
    if (c.type === 'missing') {
      console.log(`  MISSING: ${c.mod} requires "${c.missing}" which is not in the pack`);
    } else if (c.type === 'circular') {
      console.log(`  CIRCULAR: ${c.chain} has circular dependency`);
    }
  }
}

async function cmdExportJson() {
  const manifest = await loadMcpark(args[0]);
  console.log(JSON.stringify(manifest, null, 2));
}

async function cmdCreate() {
  const modsFile = path.resolve(args[0]);
  if (!fs.existsSync(modsFile)) {
    console.error(`File not found: ${modsFile}`);
    process.exit(1);
  }

  const modsData = JSON.parse(fs.readFileSync(modsFile, 'utf-8'));
  const manifest = {
    formatVersion: 1,
    game: 'minecraft',
    versionId: '1.0.0',
    name: 'MC Full Park',
    summary: 'Custom modpack',
    mcVersion: '26.1.2',
    loader: { id: 'fabric', version: 'latest' },
    files: modsData.mods || modsData,
    dependencies: { minecraft: '26.1.2', fabric: 'latest' },
  };

  const zip = new JSZip();
  zip.file('mcpark.manifest.json', JSON.stringify(manifest, null, 2));
  const overrides = zip.folder('overrides');
  overrides.file('README.md', '# Overrides\n');

  const blob = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const outFile = args[1] || 'output.mcpark';
  fs.writeFileSync(outFile, blob);
  console.log(`Created ${outFile} (${manifest.files.length} mods)`);
}

const commands = {
  parse: cmdParse,
  deps: cmdDeps,
  validate: cmdValidate,
  info: cmdInfo,
  conflicts: cmdConflicts,
  'export-json': cmdExportJson,
  create: cmdCreate,
};

if (!command || !commands[command]) {
  console.log(`
.mcpark Editor & Analyzer

Commands:
  parse <file.mcpark>              Parse and display manifest
  deps <file.mcpark> [mod_id]      Show dependency tree
  validate <file.mcpark>           Validate manifest structure
  info <file.mcpark>               Show pack summary
  conflicts <file.mcpark>          Detect dependency conflicts
  export-json <file.mcpark>        Export manifest as JSON
  create <mods.json> [output]      Create .mcpark from mods list
`);
  process.exit(command ? 1 : 0);
} else {
  commands[command]().catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}

export interface ModEntry {
  id: string;
  slug?: string;
  version?: string;
  cond?: string;
  only_version?: string[];
  only_loader?: string[];
  feature?: string;
}

export interface ExtraUrl {
  url: string;
  filename: string;
  type: 'mod' | 'resourcepack' | 'shaderpack' | 'file';
  sha1?: string;
}

export interface PackConfig {
  metadata: {
    name: string;
    version: string;
    description: string;
  };
  minecraft: {
    version: string[];
    mod_loader: string[];
  };
  mods: (string | ModEntry)[];
  resourcepacks: (string | ModEntry)[];
  shaderpacks: (string | ModEntry)[];
  extra_urls: ExtraUrl[];
  output: {
    format: ('mrpack' | 'zip' | 'mcpark')[];
    download_dir: string;
  };
  features: string[];
  max_concurrent: number;
  max_retries: number;
}

export const DEFAULT_CONFIG: PackConfig = {
  metadata: { name: 'MC Full Park', version: '1.0.0', description: '' },
  minecraft: { version: ['26.1.2'], mod_loader: ['fabric'] },
  mods: [],
  resourcepacks: [],
  shaderpacks: [],
  extra_urls: [],
  output: { format: ['mcpark'], download_dir: './downloads' },
  features: [],
  max_concurrent: 5,
  max_retries: 3,
};

export function configToToml(config: PackConfig): string {
  const lines: string[] = [];

  lines.push('[metadata]');
  lines.push(`name = "${config.metadata.name}"`);
  lines.push(`version = "${config.metadata.version}"`);
  if (config.metadata.description) lines.push(`description = "${config.metadata.description}"`);
  lines.push('');

  lines.push('[minecraft]');
  lines.push(`version = [${config.minecraft.version.map(v => `"${v}"`).join(', ')}]`);
  lines.push(`mod_loader = [${config.minecraft.mod_loader.map(l => `"${l}"`).join(', ')}]`);
  lines.push('');

  if (config.mods.length > 0) {
    lines.push('mods = [');
    for (const mod of config.mods) {
      if (typeof mod === 'string') {
        lines.push(`    "${mod}",`);
      } else {
        const parts = [`id = "${mod.id}"`];
        if (mod.version) parts.push(`version = "${mod.version}"`);
        if (mod.only_version) parts.push(`only_version = [${mod.only_version.map(v => `"${v}"`).join(', ')}]`);
        if (mod.only_loader) parts.push(`only_loader = [${mod.only_loader.map(l => `"${l}"`).join(', ')}]`);
        if (mod.feature) parts.push(`feature = "${mod.feature}"`);
        if (mod.cond) parts.push(`cond = "${mod.cond}"`);
        lines.push(`    { ${parts.join(', ')} },`);
      }
    }
    lines.push(']');
    lines.push('');
  }

  if (config.resourcepacks.length > 0) {
    lines.push(`resourcepacks = [${config.resourcepacks.map(m => typeof m === 'string' ? `"${m}"` : `"${m.id}"`).join(', ')}]`);
  }
  if (config.shaderpacks.length > 0) {
    lines.push(`shaderpacks = [${config.shaderpacks.map(m => typeof m === 'string' ? `"${m}"` : `"${m.id}"`).join(', ')}]`);
  }

  if (config.extra_urls.length > 0) {
    lines.push('');
    for (const eu of config.extra_urls) {
      lines.push('[[minecraft.extra_urls]]');
      lines.push(`url = "${eu.url}"`);
      lines.push(`filename = "${eu.filename}"`);
      lines.push(`type = "${eu.type}"`);
      if (eu.sha1) lines.push(`sha1 = "${eu.sha1}"`);
    }
  }

  lines.push('');
  lines.push('[output]');
  lines.push(`format = [${config.output.format.map(f => `"${f}"`).join(', ')}]`);
  lines.push(`download_dir = "${config.output.download_dir}"`);

  if (config.features.length > 0) {
    lines.push('');
    lines.push(`features = [${config.features.map(f => `"${f}"`).join(', ')}]`);
  }

  lines.push('');
  lines.push(`max_concurrent = ${config.max_concurrent}`);
  lines.push(`max_retries = ${config.max_retries}`);

  return lines.join('\n');
}

export function parseTomlConfig(toml: string): PackConfig {
  const config: PackConfig = { ...DEFAULT_CONFIG, mods: [], resourcepacks: [], shaderpacks: [], extra_urls: [], features: [] };
  let section = '';
  let inArray = false;
  let arrayKey = '';
  let arrayItems: string[] = [];

  for (const raw of toml.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    if (line === ']') {
      inArray = false;
      const key = arrayKey as keyof typeof config;
      if (key === 'mods' || key === 'resourcepacks' || key === 'shaderpacks') {
        (config[key] as unknown[]) = arrayItems.map(parseModEntry);
      }
      arrayItems = [];
      continue;
    }

    if (inArray) {
      const cleaned = line.replace(/,\s*$/, '').trim();
      if (cleaned) arrayItems.push(cleaned);
      continue;
    }

    const sectionMatch = line.match(/^\[(.+)]$/);
    if (sectionMatch) {
      section = sectionMatch[1];
      continue;
    }

    const kvMatch = line.match(/^(\S+)\s*=\s*(.+)$/);
    if (!kvMatch) continue;
    const [, key, rawVal] = kvMatch;
    const val = rawVal.trim();

    if (section === 'metadata') {
      (config.metadata as Record<string, string>)[key] = unquote(val);
    } else if (section === 'minecraft') {
      if (key === 'version' || key === 'mod_loader') {
        (config.minecraft as Record<string, string[]>)[key] = parseStringArray(val);
      }
    } else if (section === 'output') {
      if (key === 'format') {
        config.output.format = parseStringArray(val) as ('mrpack' | 'zip' | 'mcpark')[];
      } else if (key === 'download_dir') {
        config.output.download_dir = unquote(val);
      }
    } else if (!section) {
      if (key === 'mods' || key === 'resourcepacks' || key === 'shaderpacks') {
        if (val.startsWith('[') && !val.endsWith(']')) {
          inArray = true;
          arrayKey = key;
          arrayItems = parseStringArray(val);
        } else {
          const entries = parseStringArray(val).map(parseModEntry);
          if (key === 'mods') config.mods = entries as (string | ModEntry)[];
          else if (key === 'resourcepacks') config.resourcepacks = entries as (string | ModEntry)[];
          else config.shaderpacks = entries as (string | ModEntry)[];
        }
      } else if (key === 'features') {
        config.features = parseStringArray(val);
      } else if (key === 'max_concurrent') {
        config.max_concurrent = parseInt(val);
      } else if (key === 'max_retries') {
        config.max_retries = parseInt(val);
      }
    }
  }

  return config;
}

function parseModEntry(s: string): string | ModEntry {
  const trimmed = s.replace(/^["']|["']$/g, '').trim();
  if (trimmed.startsWith('{')) {
    const entry: ModEntry = { id: '' };
    const pairs = trimmed.replace(/[{}]/g, '').split(',');
    for (const pair of pairs) {
      const [k, v] = pair.split('=').map(x => x.trim());
      if (!k || !v) continue;
      const uv = unquote(v);
      if (k === 'id') entry.id = uv;
      else if (k === 'version') entry.version = uv;
      else if (k === 'feature') entry.feature = uv;
      else if (k === 'cond') entry.cond = uv;
      else if (k === 'only_version') entry.only_version = parseStringArray(v);
      else if (k === 'only_loader') entry.only_loader = parseStringArray(v);
    }
    return entry;
  }
  return trimmed;
}

function parseStringArray(val: string): string[] {
  return val
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map(s => unquote(s.trim()))
    .filter(Boolean);
}

function unquote(s: string): string {
  return s.replace(/^["']|["']$/g, '');
}

export function evaluateCond(entry: ModEntry, mcVersion: string, loader: string, features: string[]): boolean {
  if (entry.only_version && !entry.only_version.includes(mcVersion)) return false;
  if (entry.only_loader && !entry.only_loader.includes(loader)) return false;
  if (entry.feature && !features.includes(entry.feature)) return false;
  if (entry.cond) return evaluateCondExpr(entry.cond, mcVersion, loader, features);
  return true;
}

function evaluateCondExpr(expr: string, mcVersion: string, loader: string, features: string[]): boolean {
  const normalized = expr
    .replace(/\bv:([^\s&|!)]+)/g, (_, v) => mcVersion === v ? 'true' : 'false')
    .replace(/\bl:([^\s&|!)]+)/g, (_, l) => loader === l ? 'true' : 'false')
    .replace(/\bf:([^\s&|!)]+)/g, (_, f) => features.includes(f) ? 'true' : 'false')
    .replace(/&&/g, '&&')
    .replace(/\|\|/g, '||')
    .replace(/!/g, '!');

  try {
    return new Function(`return (${normalized})`)() as boolean;
  } catch {
    return true;
  }
}

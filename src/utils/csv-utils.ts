import type { McParkMod } from './mcpark-parser';

const CSV_HEADERS = ['id', 'name', 'version', 'required', 'category', 'description', 'source', 'projectId', 'dependencies'];

export function modsToCsv(mods: McParkMod[]): string {
  const lines = [CSV_HEADERS.join(',')];
  for (const mod of mods) {
    lines.push([
      mod.id,
      `"${mod.name}"`,
      mod.version,
      String(mod.required),
      mod.category,
      `"${mod.description}"`,
      mod.source,
      mod.projectId,
      `"${mod.dependencies.join(';')}"`,
    ].join(','));
  }
  return lines.join('\n');
}

export function csvToMods(csv: string): McParkMod[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const mods: McParkMod[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 7) continue;

    mods.push({
      id: cols[0],
      name: cols[1]?.replace(/^"|"$/g, '') || cols[0],
      version: cols[2] || '0.0.0',
      required: cols[3] === 'true',
      category: cols[4] || 'uncategorized',
      description: cols[5]?.replace(/^"|"$/g, '') || '',
      source: cols[6] || 'modrinth',
      projectId: cols[7] || '',
      dependencies: (cols[8]?.replace(/^"|"$/g, '') || '').split(';').filter(Boolean),
      env: { client: 'required', server: cols[3] === 'true' ? 'required' : 'optional' },
    });
  }
  return mods;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function downloadCsv(mods: McParkMod[], filename = 'mods.csv') {
  const csv = modsToCsv(mods);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

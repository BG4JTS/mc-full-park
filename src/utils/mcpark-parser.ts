export interface McParkMod {
  id: string;
  name: string;
  version: string;
  required: boolean;
  category: string;
  description: string;
  source: string;
  projectId: string;
  dependencies: string[];
  env: { client: string; server: string };
}

export interface McParkManifest {
  formatVersion: number;
  game: string;
  versionId: string;
  name: string;
  summary: string;
  mcVersion: string;
  loader: { id: string; version: string };
  files: McParkMod[];
  dependencies: Record<string, string>;
}

export async function parseMcpark(file: File | ArrayBuffer): Promise<McParkManifest> {
  const JSZip = (await import('jszip')).default;
  let buffer: ArrayBuffer;

  if (file instanceof File) {
    buffer = await file.arrayBuffer();
  } else {
    buffer = file;
  }

  const zip = await JSZip.loadAsync(buffer);
  const manifestFile = zip.file('mcpark.manifest.json');

  if (!manifestFile) {
    throw new Error('Invalid .mcpark: missing mcpark.manifest.json');
  }

  const text = await manifestFile.async('text');
  const manifest: McParkManifest = JSON.parse(text);

  if (!manifest.formatVersion || !manifest.files || !Array.isArray(manifest.files)) {
    throw new Error('Invalid .mcpark: malformed manifest structure');
  }

  return manifest;
}

export async function exportMcpark(manifest: McParkManifest): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  zip.file('mcpark.manifest.json', JSON.stringify(manifest, null, 2));

  const overrides = zip.folder('overrides');
  if (overrides) {
    overrides.file('README.md', '# MC Full Park - Overrides\n');
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

export function validateManifest(manifest: unknown): manifest is McParkManifest {
  if (!manifest || typeof manifest !== 'object') return false;
  const m = manifest as Record<string, unknown>;
  return (
    typeof m.formatVersion === 'number' &&
    typeof m.game === 'string' &&
    typeof m.mcVersion === 'string' &&
    Array.isArray(m.files)
  );
}

const MODRINTH_API = 'https://api.modrinth.com/v2';

export interface ModrinthProject {
  slug: string;
  title: string;
  description: string;
  categories: string[];
  downloads: number;
  icon_url: string;
  id: string;
}

export interface ModrinthVersion {
  id: string;
  name: string;
  version_number: string;
  game_versions: string[];
  loaders: string[];
  files: { url: string; filename: string; hashes: { sha1: string; sha512: string }; size: number }[];
  dependencies: { project_id: string; dependency_type: string }[];
}

export async function searchMods(query: string, mcVersion: string, loader: string): Promise<ModrinthProject[]> {
  const params = new URLSearchParams({
    query,
    limit: '20',
    game_versions: `["${mcVersion}"]`,
    loaders: `["${loader}"]`,
  });
  const res = await fetch(`${MODRINTH_API}/search?${params}`);
  if (!res.ok) throw new Error(`Modrinth search failed: ${res.status}`);
  const data = await res.json();
  return data.hits || [];
}

export async function getProject(projectId: string): Promise<ModrinthProject> {
  const res = await fetch(`${MODRINTH_API}/project/${projectId}`);
  if (!res.ok) throw new Error(`Project not found: ${projectId}`);
  return res.json();
}

export async function getVersions(
  projectId: string,
  mcVersion: string,
  loader: string,
): Promise<ModrinthVersion[]> {
  const params = new URLSearchParams({
    game_versions: `["${mcVersion}"]`,
    loaders: `["${loader}"]`,
  });
  const res = await fetch(`${MODRINTH_API}/project/${projectId}/version?${params}`);
  if (!res.ok) throw new Error(`Versions not found: ${projectId}`);
  return res.json();
}

export async function getDependencies(projectId: string): Promise<{ id: string; name: string }[]> {
  try {
    const deps: { id: string; name: string }[] = [];
    const versions = await getVersions(projectId, '26.1.2', 'fabric');
    if (versions.length > 0) {
      for (const dep of versions[0].dependencies) {
        if (dep.dependency_type === 'required' && dep.project_id) {
          try {
            const depProject = await getProject(dep.project_id);
            deps.push({ id: dep.project_id, name: depProject.title });
          } catch {
            deps.push({ id: dep.project_id, name: dep.project_id });
          }
        }
      }
    }
    return deps;
  } catch {
    return [];
  }
}

export function buildDownloadUrl(file: ModrinthVersion['files'][0]): string {
  return file.url;
}

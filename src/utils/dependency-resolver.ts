import type { McParkMod } from './mcpark-parser';

export interface DependencyResult {
  resolved: McParkMod[];
  missing: string[];
  circular: string[][];
}

export function resolveDependencies(
  selectedIds: Set<string>,
  allMods: McParkMod[],
): DependencyResult {
  const modMap = new Map(allMods.map(m => [m.id, m]));
  const resolved = new Map<string, McParkMod>();
  const missing = new Set<string>();
  const visited = new Set<string>();
  const stack = new Set<string>();
  const circular: string[][] = [];

  function resolve(id: string, chain: string[]) {
    if (stack.has(id)) {
      circular.push([...chain, id]);
      return;
    }
    if (visited.has(id)) return;

    visited.add(id);
    stack.add(id);

    const mod = modMap.get(id);
    if (!mod) {
      missing.add(id);
      stack.delete(id);
      return;
    }

    resolved.set(id, mod);

    for (const dep of mod.dependencies) {
      resolve(dep, [...chain, id]);
    }

    stack.delete(id);
  }

  for (const id of selectedIds) {
    resolve(id, []);
  }

  return {
    resolved: Array.from(resolved.values()),
    missing: Array.from(missing),
    circular,
  };
}

export function getDependencyTree(mod: McParkMod, allMods: McParkMod[]): Map<string, string[]> {
  const modMap = new Map(allMods.map(m => [m.id, m]));
  const tree = new Map<string, string[]>();

  function walk(id: string) {
    if (tree.has(id)) return;
    const m = modMap.get(id);
    if (!m) return;
    tree.set(id, [...m.dependencies]);
    for (const dep of m.dependencies) {
      walk(dep);
    }
  }

  walk(mod.id);
  return tree;
}

export function getCategories(mods: McParkMod[]): string[] {
  return [...new Set(mods.map(m => m.category))].sort();
}

export function filterMods(
  mods: McParkMod[],
  query: string,
  category: string | null,
): McParkMod[] {
  return mods.filter(m => {
    const matchesQuery =
      !query ||
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.id.toLowerCase().includes(query.toLowerCase()) ||
      m.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !category || m.category === category;
    return matchesQuery && matchesCategory;
  });
}

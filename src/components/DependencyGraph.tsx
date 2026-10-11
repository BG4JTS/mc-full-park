import type { McParkMod } from '../utils/mcpark-parser';
import { getDependencyTree } from '../utils/dependency-resolver';

interface DependencyGraphProps {
  mods: McParkMod[];
  selectedModId: string | null;
  onSelectMod: (id: string | null) => void;
  resolvedIds: Set<string>;
}

export default function DependencyGraph({ mods, selectedModId, onSelectMod, resolvedIds }: DependencyGraphProps) {
  const modMap = new Map(mods.map(m => [m.id, m]));
  const selectedMod = selectedModId ? modMap.get(selectedModId) : null;
  const tree = selectedMod ? getDependencyTree(selectedMod, mods) : null;

  const reverseDeps = new Map<string, string[]>();
  for (const mod of mods) {
    for (const dep of mod.dependencies) {
      if (!reverseDeps.has(dep)) reverseDeps.set(dep, []);
      reverseDeps.get(dep)!.push(mod.id);
    }
  }

  return (
    <div className="bg-mc-darker rounded-lg border border-white/10 p-6">
      <h2 className="text-lg font-semibold mb-4">Dependency Graph</h2>

      {!selectedMod ? (
        <div>
          <p className="text-gray-400 text-sm mb-4">Select a mod to view its dependency tree.</p>
          <div className="grid grid-cols-2 gap-2">
            {mods.map(mod => (
              <button
                key={mod.id}
                onClick={() => onSelectMod(mod.id)}
                className={`text-left px-3 py-2 rounded text-sm transition-colors ${
                  resolvedIds.has(mod.id)
                    ? 'bg-mc-accent/30 text-white hover:bg-mc-accent/50'
                    : 'bg-mc-accent/10 text-gray-400 hover:bg-mc-accent/20'
                }`}
              >
                {mod.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => onSelectMod(null)} className="text-sm text-gray-400 hover:text-white">&larr; Back</button>
            <h3 className="text-xl font-bold text-white">{selectedMod.name}</h3>
            <span className="text-sm text-gray-400">v{selectedMod.version}</span>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-mc-green mb-2">Dependencies ({selectedMod.dependencies.length})</h4>
              {selectedMod.dependencies.length === 0 ? (
                <p className="text-sm text-gray-500">No dependencies</p>
              ) : (
                <div className="ml-4 space-y-2">
                  {selectedMod.dependencies.map(depId => {
                    const dep = modMap.get(depId);
                    return (
                      <div key={depId} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-mc-green" />
                        <button
                          onClick={() => onSelectMod(depId)}
                          className="text-sm text-white hover:text-mc-green hover:underline"
                        >
                          {dep?.name || depId}
                        </button>
                        {dep && <span className="text-xs text-gray-500">v{dep.version}</span>}
                        {!dep && <span className="text-xs text-red-400">(missing)</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-blue-400 mb-2">Dependents ({(reverseDeps.get(selectedMod.id) || []).length})</h4>
              {(reverseDeps.get(selectedMod.id) || []).length === 0 ? (
                <p className="text-sm text-gray-500">No other mods depend on this</p>
              ) : (
                <div className="ml-4 space-y-2">
                  {(reverseDeps.get(selectedMod.id) || []).map(depId => {
                    const dep = modMap.get(depId);
                    return (
                      <div key={depId} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <button
                          onClick={() => onSelectMod(depId)}
                          className="text-sm text-white hover:text-blue-400 hover:underline"
                        >
                          {dep?.name || depId}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {tree && tree.size > 1 && (
              <div>
                <h4 className="text-sm font-medium text-yellow-400 mb-2">Full Dependency Tree</h4>
                <div className="bg-mc-dark rounded p-3 font-mono text-xs">
                  {renderTree(selectedMod.id, tree, modMap, new Set(), 0)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function renderTree(
  id: string,
  tree: Map<string, string[]>,
  modMap: Map<string, McParkMod>,
  visited: Set<string>,
  depth: number,
): JSX.Element {
  if (visited.has(id)) {
    return <div style={{ paddingLeft: depth * 16 }} className="text-gray-600">{'  '.repeat(depth)}{id} (circular)</div>;
  }
  visited.add(id);
  const mod = modMap.get(id);
  const deps = tree.get(id) || [];

  return (
    <div>
      <div style={{ paddingLeft: depth * 16 }} className="text-gray-300">
        {mod?.name || id} <span className="text-gray-600">v{mod?.version}</span>
      </div>
      {deps.map(dep => renderTree(dep, tree, modMap, new Set(visited), depth + 1))}
    </div>
  );
}

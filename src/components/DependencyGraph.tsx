import type { McParkMod } from '../utils/mcpark-parser';
import { getDependencyTree } from '../utils/dependency-resolver';
import { UI } from '../i18n';

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
    <div className="bg-mc-darker/60 rounded-xl border border-white/8 p-6">
      <h2 className="text-lg font-bold mb-4 text-white">{UI.dependencyGraph}</h2>

      {!selectedMod ? (
        <div>
          <p className="text-gray-400 text-sm mb-4">{UI.selectModHint}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {mods.map(mod => (
              <button
                key={mod.id}
                onClick={() => onSelectMod(mod.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-all truncate ${
                  resolvedIds.has(mod.id)
                    ? 'bg-mc-green/10 text-white hover:bg-mc-green/20 border border-mc-green/20'
                    : 'bg-white/5 text-gray-400 hover:bg-white/8 border border-white/5'
                }`}
              >
                {mod.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => onSelectMod(null)}
              className="text-sm text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5"
            >
              {UI.back}
            </button>
            <h3 className="text-xl font-bold text-white">{selectedMod.name}</h3>
            <span className="text-sm text-gray-500 font-mono">v{selectedMod.version}</span>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-mc-green mb-2.5">
                {UI.dependencies} ({selectedMod.dependencies.length})
              </h4>
              {selectedMod.dependencies.length === 0 ? (
                <p className="text-sm text-gray-500">{UI.noDependencies}</p>
              ) : (
                <div className="ml-4 space-y-2">
                  {selectedMod.dependencies.map(depId => {
                    const dep = modMap.get(depId);
                    return (
                      <div key={depId} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-mc-green shrink-0" />
                        <button
                          onClick={() => onSelectMod(depId)}
                          className="text-sm text-white hover:text-mc-green hover:underline transition-colors"
                        >
                          {dep?.name || depId}
                        </button>
                        {dep && <span className="text-xs text-gray-500 font-mono">v{dep.version}</span>}
                        {!dep && <span className="text-xs text-red-400">{UI.missingDep}</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-2.5">
                {UI.dependents} ({(reverseDeps.get(selectedMod.id) || []).length})
              </h4>
              {(reverseDeps.get(selectedMod.id) || []).length === 0 ? (
                <p className="text-sm text-gray-500">{UI.noDependents}</p>
              ) : (
                <div className="ml-4 space-y-2">
                  {(reverseDeps.get(selectedMod.id) || []).map(depId => {
                    const dep = modMap.get(depId);
                    return (
                      <div key={depId} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                        <button
                          onClick={() => onSelectMod(depId)}
                          className="text-sm text-white hover:text-blue-400 hover:underline transition-colors"
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
                <h4 className="text-sm font-semibold text-yellow-400 mb-2.5">{UI.fullTree}</h4>
                <div className="bg-mc-dark/80 rounded-lg p-4 font-mono text-xs border border-white/5">
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
    return <div style={{ paddingLeft: depth * 16 }} className="text-gray-600">{'  '.repeat(depth)}{id} ({UI.circularDep})</div>;
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

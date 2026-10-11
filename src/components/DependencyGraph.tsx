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
    <div className="bg-mc-card border border-mc-border rounded-xl p-6">
      <h2 className="text-base font-semibold mb-5 text-white">{UI.dependencyGraph}</h2>

      {!selectedMod ? (
        <div>
          <p className="text-zinc-500 text-sm mb-5">{UI.selectModHint}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {mods.map(mod => (
              <button
                key={mod.id}
                onClick={() => onSelectMod(mod.id)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm transition-all truncate ${
                  resolvedIds.has(mod.id)
                    ? 'bg-mc-green/8 text-white hover:bg-mc-green/12 border border-mc-green/15'
                    : 'bg-white/3 text-zinc-500 hover:bg-white/5 hover:text-zinc-300 border border-transparent'
                }`}
              >
                {mod.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => onSelectMod(null)}
              className="flex items-center gap-1 text-sm text-zinc-500 hover:text-white transition-colors px-2.5 py-1 rounded-lg hover:bg-white/5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {UI.back}
            </button>
            <h3 className="text-lg font-bold text-white">{selectedMod.name}</h3>
            <span className="text-xs text-zinc-600 font-mono">v{selectedMod.version}</span>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-mc-green uppercase tracking-wider mb-3">
                {UI.dependencies} ({selectedMod.dependencies.length})
              </h4>
              {selectedMod.dependencies.length === 0 ? (
                <p className="text-sm text-zinc-600">{UI.noDependencies}</p>
              ) : (
                <div className="ml-1 space-y-1.5">
                  {selectedMod.dependencies.map(depId => {
                    const dep = modMap.get(depId);
                    return (
                      <div key={depId} className="flex items-center gap-2.5 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-mc-green shrink-0" />
                        <button
                          onClick={() => onSelectMod(depId)}
                          className="text-sm text-white hover:text-mc-green transition-colors"
                        >
                          {dep?.name || depId}
                        </button>
                        {dep && <span className="text-[10px] text-zinc-600 font-mono">v{dep.version}</span>}
                        {!dep && <span className="text-[10px] text-red-400">{UI.missingDep}</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-mc-border pt-6">
              <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
                {UI.dependents} ({(reverseDeps.get(selectedMod.id) || []).length})
              </h4>
              {(reverseDeps.get(selectedMod.id) || []).length === 0 ? (
                <p className="text-sm text-zinc-600">{UI.noDependents}</p>
              ) : (
                <div className="ml-1 space-y-1.5">
                  {(reverseDeps.get(selectedMod.id) || []).map(depId => {
                    const dep = modMap.get(depId);
                    return (
                      <div key={depId} className="flex items-center gap-2.5 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                        <button
                          onClick={() => onSelectMod(depId)}
                          className="text-sm text-white hover:text-blue-400 transition-colors"
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
              <div className="border-t border-mc-border pt-6">
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">{UI.fullTree}</h4>
                <div className="bg-mc-dark/60 rounded-lg p-4 font-mono text-xs border border-mc-border">
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
    return <div style={{ paddingLeft: depth * 16 }} className="text-zinc-700">{'  '.repeat(depth)}{id} ({UI.circularDep})</div>;
  }
  visited.add(id);
  const mod = modMap.get(id);
  const deps = tree.get(id) || [];

  return (
    <div>
      <div style={{ paddingLeft: depth * 16 }} className="text-zinc-300">
        {mod?.name || id} <span className="text-zinc-600">v{mod?.version}</span>
      </div>
      {deps.map(dep => renderTree(dep, tree, modMap, new Set(visited), depth + 1))}
    </div>
  );
}

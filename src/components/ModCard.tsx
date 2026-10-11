import type { McParkMod } from '../utils/mcpark-parser';
import { CATEGORY_LABELS, UI } from '../i18n';

interface ModCardProps {
  mod: McParkMod;
  selected: boolean;
  autoResolved: boolean;
  onToggle: () => void;
  onShowGraph: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  library: 'bg-blue-500/10 text-blue-400 border-blue-500/15',
  redstone: 'bg-red-500/10 text-red-400 border-red-500/15',
  performance: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15',
  automation: 'bg-amber-500/10 text-amber-400 border-amber-500/15',
  storage: 'bg-violet-500/10 text-violet-400 border-violet-500/15',
  building: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/15',
  ui: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/15',
  visual: 'bg-pink-500/10 text-pink-400 border-pink-500/15',
  network: 'bg-teal-500/10 text-teal-400 border-teal-500/15',
  world: 'bg-green-500/10 text-green-400 border-green-500/15',
  resourcepack: 'bg-orange-500/10 text-orange-400 border-orange-500/15',
  shaderpack: 'bg-purple-500/10 text-purple-400 border-purple-500/15',
  other: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/15',
  uncategorized: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/15',
};

export default function ModCard({ mod, selected, autoResolved, onToggle, onShowGraph }: ModCardProps) {
  const colorClass = CATEGORY_COLORS[mod.category] || CATEGORY_COLORS.other;
  const categoryLabel = CATEGORY_LABELS[mod.category] || mod.category;

  return (
    <div
      className={`rounded-xl border p-4 transition-all cursor-pointer group ${
        selected
          ? 'bg-mc-green/5 border-mc-green/20'
          : 'bg-mc-card border-mc-border hover:border-mc-border-light'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3.5">
        <div className={`w-[18px] h-[18px] mt-0.5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${
          selected
            ? 'bg-mc-green border-mc-green'
            : 'border-zinc-700 group-hover:border-zinc-500'
        }`}>
          {selected && (
            <svg className="w-2.5 h-2.5 text-mc-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white text-sm truncate">{mod.name}</h3>
            {mod.required && (
              <span className="shrink-0 px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 font-medium">
                {UI.required}
              </span>
            )}
            {autoResolved && (
              <span className="shrink-0 px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-400 font-medium">
                {UI.auto}
              </span>
            )}
          </div>

          {mod.description && (
            <p className="text-xs text-zinc-500 mb-2.5 line-clamp-2 leading-relaxed">{mod.description}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 border rounded-md text-[10px] font-medium ${colorClass}`}>
              {categoryLabel}
            </span>
            <span className="text-[10px] text-zinc-600 font-mono">v{mod.version}</span>
            {mod.dependencies.length > 0 && (
              <button
                onClick={e => { e.stopPropagation(); onShowGraph(); }}
                className="text-[10px] text-mc-green/70 hover:text-mc-green transition-colors font-medium"
              >
                {mod.dependencies.length} {UI.deps}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

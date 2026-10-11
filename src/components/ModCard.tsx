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
  library: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  redstone: 'bg-red-500/20 text-red-300 border-red-500/30',
  performance: 'bg-green-500/20 text-green-300 border-green-500/30',
  automation: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  storage: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  building: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  ui: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  visual: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  network: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  world: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  resourcepack: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  shaderpack: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  other: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  uncategorized: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

export default function ModCard({ mod, selected, autoResolved, onToggle, onShowGraph }: ModCardProps) {
  const colorClass = CATEGORY_COLORS[mod.category] || CATEGORY_COLORS.other;
  const categoryLabel = CATEGORY_LABELS[mod.category] || mod.category;

  return (
    <div
      className={`rounded-lg border p-3.5 transition-all cursor-pointer group ${
        selected
          ? 'bg-mc-green/10 border-mc-green/40 shadow-sm shadow-mc-green/5'
          : 'bg-mc-darker/80 border-white/8 hover:border-white/15 hover:bg-mc-darker'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-semibold text-white text-sm truncate">{mod.name}</h3>
            {mod.required && (
              <span className="shrink-0 px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-[10px] text-red-300 font-medium">
                {UI.required}
              </span>
            )}
            {autoResolved && (
              <span className="shrink-0 px-1.5 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-[10px] text-blue-300 font-medium">
                {UI.auto}
              </span>
            )}
          </div>
          {mod.description && (
            <p className="text-xs text-gray-400 mb-2 line-clamp-2 leading-relaxed">{mod.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 border rounded text-[11px] font-medium ${colorClass}`}>
              {categoryLabel}
            </span>
            <span className="text-[11px] text-gray-500 font-mono">v{mod.version}</span>
            {mod.dependencies.length > 0 && (
              <button
                onClick={e => { e.stopPropagation(); onShowGraph(); }}
                className="text-[11px] text-mc-green hover:text-mc-green/80 transition-colors font-medium"
              >
                {mod.dependencies.length} {UI.deps}
              </button>
            )}
          </div>
        </div>
        <div className="shrink-0 mt-0.5">
          <div className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all ${
            selected
              ? 'bg-mc-green border-mc-green shadow-sm shadow-mc-green/30'
              : 'border-gray-600 group-hover:border-gray-400'
          }`}>
            {selected && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import type { McParkMod } from '../utils/mcpark-parser';

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
};

export default function ModCard({ mod, selected, autoResolved, onToggle, onShowGraph }: ModCardProps) {
  const colorClass = CATEGORY_COLORS[mod.category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';

  return (
    <div
      className={`rounded-lg border p-4 transition-all cursor-pointer ${
        selected
          ? 'bg-mc-accent/30 border-mc-green/50'
          : 'bg-mc-darker border-white/10 hover:border-white/20'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{mod.name}</h3>
            {mod.required && (
              <span className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-[10px] text-red-300 uppercase">required</span>
            )}
            {autoResolved && (
              <span className="px-1.5 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-[10px] text-blue-300">auto</span>
            )}
          </div>
          <p className="text-sm text-gray-400 mb-2">{mod.description}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 border rounded text-xs ${colorClass}`}>{mod.category}</span>
            <span className="text-xs text-gray-500">v{mod.version}</span>
            {mod.dependencies.length > 0 && (
              <button
                onClick={e => { e.stopPropagation(); onShowGraph(); }}
                className="text-xs text-mc-green hover:underline"
              >
                {mod.dependencies.length} deps
              </button>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            selected ? 'bg-mc-green border-mc-green' : 'border-gray-500'
          }`}>
            {selected && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

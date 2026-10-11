import { useState } from 'react';
import type { McParkMod } from '../utils/mcpark-parser';
import { CATEGORY_LABELS, UI } from '../i18n';

interface ModCardProps {
  mod: McParkMod;
  selected: boolean;
  autoResolved: boolean;
  onToggle: () => void;
  onShowGraph: () => void;
}

const CAT_DOT: Record<string, string> = {
  library: '#60a5fa', redstone: '#f87171', performance: '#34d399',
  automation: '#fbbf24', storage: '#a78bfa', building: '#22d3ee',
  ui: '#818cf8', visual: '#f472b6', network: '#2dd4bf', world: '#4ade80',
  resourcepack: '#fb923c', shaderpack: '#c084fc', other: '#71717a',
  uncategorized: '#71717a',
};

export default function ModCard({ mod, selected, autoResolved, onToggle, onShowGraph }: ModCardProps) {
  const [expanded, setExpanded] = useState(false);
  const dot = CAT_DOT[mod.category] || CAT_DOT.other;
  const catLabel = CATEGORY_LABELS[mod.category] || mod.category;
  const modrinthUrl = mod.projectId ? `https://modrinth.com/mod/${mod.projectId}` : null;

  return (
    <div
      className={`relative group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-default ${
        selected
          ? 'bg-mc-green/5 border-mc-green/20'
          : 'bg-transparent border-mc-border hover:border-mc-border-light hover:bg-white/[0.02]'
      }`}
    >
      <button
        onClick={onToggle}
        className={`shrink-0 w-3.5 h-3.5 rounded-sm border-[1.5px] flex items-center justify-center transition-all ${
          selected ? 'bg-mc-green border-mc-green' : 'border-zinc-700 hover:border-zinc-500'
        }`}
      >
        {selected && (
          <svg className="w-2 h-2 text-mc-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 min-w-0 flex-1 text-left"
      >
        <span className="font-medium text-zinc-200 truncate">{mod.name}</span>
        <span className="text-zinc-600 font-mono shrink-0">v{mod.version}</span>
        {mod.required && (
          <span className="px-1 py-px bg-red-500/10 text-red-400 rounded text-[9px] border border-red-500/15 shrink-0">{UI.required}</span>
        )}
        {autoResolved && (
          <span className="px-1 py-px bg-blue-500/10 text-blue-400 rounded text-[9px] border border-blue-500/15 shrink-0">{UI.auto}</span>
        )}
        <svg className="w-3 h-3 text-zinc-600 transition-transform shrink-0" style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="flex items-center gap-1 text-[10px] text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dot }} />
          {catLabel}
        </span>
        {modrinthUrl && (
          <a
            href={modrinthUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-zinc-600 hover:text-mc-green transition-colors p-0.5"
            title="在 Modrinth 查看"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {expanded && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 px-3 py-2.5 bg-mc-card border border-mc-border-light rounded-xl shadow-xl shadow-black/40 text-xs space-y-1.5">
          {mod.description && <p className="text-zinc-400 leading-relaxed">{mod.description}</p>}
          <div className="flex items-center gap-3 text-zinc-500">
            {mod.dependencies.length > 0 && (
              <button onClick={e => { e.stopPropagation(); onShowGraph(); }} className="text-mc-green hover:underline">
                {mod.dependencies.length} {UI.deps}
              </button>
            )}
            {modrinthUrl && (
              <a href={modrinthUrl} target="_blank" rel="noopener noreferrer" className="hover:text-mc-green transition-colors">
                Modrinth ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

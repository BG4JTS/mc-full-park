import type { McParkMod } from '../utils/mcpark-parser';
import { UI } from '../i18n';

interface HealthReportProps {
  mods: McParkMod[];
  selectedIds: Set<string>;
  resolvedIds: Set<string>;
  missing: string[];
  circular: string[][];
}

interface Issue {
  type: 'missing' | 'conflict' | 'orphan' | 'version';
  severity: 'error' | 'warn' | 'info';
  message: string;
  detail?: string;
}

function analyze(mods: McParkMod[], selectedIds: Set<string>, resolvedIds: Set<string>, missing: string[], circular: string[][]): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const modMap = new Map(mods.map(m => [m.id, m]));
  let score = 100;

  for (const id of missing) {
    issues.push({ type: 'missing', severity: 'error', message: id, detail: '被依赖但未在整合包中找到' });
    score -= 10;
  }

  for (const chain of circular) {
    issues.push({ type: 'conflict', severity: 'warn', message: chain.join(' → '), detail: '存在循环依赖链' });
    score -= 5;
  }

  const depCount = new Map<string, number>();
  for (const mod of mods) {
    if (!selectedIds.has(mod.id) && !resolvedIds.has(mod.id)) continue;
    for (const dep of mod.dependencies) {
      depCount.set(dep, (depCount.get(dep) || 0) + 1);
    }
  }

  for (const mod of mods) {
    if (!selectedIds.has(mod.id)) continue;
    if (mod.dependencies.length > 0) {
      const allMissing = mod.dependencies.every(d => !modMap.has(d));
      if (allMissing) {
        issues.push({ type: 'orphan', severity: 'warn', message: mod.name, detail: `所有依赖均缺失: ${mod.dependencies.join(', ')}` });
        score -= 3;
      }
    }
  }

  const selectedMods = mods.filter(m => selectedIds.has(m.id));
  for (let i = 0; i < selectedMods.length; i++) {
    for (let j = i + 1; j < selectedMods.length; j++) {
      const a = selectedMods[i], b = selectedMods[j];
      if (a.dependencies.includes(b.id) && b.dependencies.includes(a.id)) {
        issues.push({ type: 'conflict', severity: 'warn', message: `${a.name} ↔ ${b.name}`, detail: '双向依赖（可能是冲突）' });
        score -= 2;
      }
    }
  }

  return { score: Math.max(0, Math.min(100, score)), issues };
}

export default function HealthReport({ mods, selectedIds, resolvedIds, missing, circular }: HealthReportProps) {
  const { score, issues } = analyze(mods, selectedIds, resolvedIds, missing, circular);

  const level = score >= 90 ? 'ok' : score >= 60 ? 'warn' : 'bad';
  const levelConfig = {
    ok: { color: 'text-mc-green', bg: 'bg-mc-green/10 border-mc-green/20', label: UI.healthOk },
    warn: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: UI.healthWarn },
    bad: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: UI.healthBad },
  }[level];

  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            <circle
              cx="40" cy="40" r="36" fill="none"
              stroke={level === 'ok' ? '#10b981' : level === 'warn' ? '#facc15' : '#f87171'}
              strokeWidth="4" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold tabular-nums ${levelConfig.color}`}>{score}</span>
          </div>
        </div>
        <div>
          <h3 className={`text-sm font-semibold ${levelConfig.color}`}>{levelConfig.label}</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {issues.length === 0 ? UI.noIssues : `${issues.length} 个问题需要关注`}
          </p>
        </div>
      </div>

      {issues.length > 0 && (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {issues.map((issue, i) => (
            <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${
              issue.severity === 'error' ? 'bg-red-500/5 border-red-500/15' : 'bg-yellow-500/5 border-yellow-500/15'
            }`}>
              <span className={`shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full ${
                issue.severity === 'error' ? 'bg-red-400' : 'bg-yellow-400'
              }`} />
              <div className="min-w-0">
                <p className="text-[11px] text-zinc-300 font-medium truncate">{issue.message}</p>
                {issue.detail && <p className="text-[10px] text-zinc-600 mt-0.5">{issue.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

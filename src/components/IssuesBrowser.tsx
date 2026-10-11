import { useState, useEffect, useMemo } from 'react';
import type { McParkMod } from '../utils/mcpark-parser';
import { SITE_CONFIG } from '../site-config';

interface IssuesBrowserProps {
  mods: McParkMod[];
}

interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: { name: string; color: string }[];
  created_at: string;
  user: { login: string; avatar_url: string };
  comments: number;
  html_url: string;
  pull_request?: unknown;
}

function tokenize(s: string): Set<string> {
  return new Set(s.toLowerCase().replace(/[^\w\u4e00-\u9fff]/g, ' ').split(/\s+/).filter(w => w.length > 1));
}

function similarity(a: string, b: string): number {
  const ta = tokenize(a), tb = tokenize(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let overlap = 0;
  for (const w of ta) if (tb.has(w)) overlap++;
  return (2 * overlap) / (ta.size + tb.size);
}

export default function IssuesBrowser({ mods }: IssuesBrowserProps) {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const url = `https://api.github.com/repos/${SITE_CONFIG.repo}/issues?state=all&per_page=50&sort=created&direction=desc`;
    fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } })
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then((data: GitHubIssue[]) => setIssues(data.filter(i => !i.pull_request)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = issues;
    if (filter !== 'all') list = list.filter(i => i.state === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.body.toLowerCase().includes(q));
    }
    return list;
  }, [issues, filter, search]);

  const duplicateGroups = useMemo(() => {
    const groups: Map<number, number[]> = new Map();
    const visited = new Set<number>();
    for (let i = 0; i < filtered.length; i++) {
      if (visited.has(filtered[i].number)) continue;
      const group = [filtered[i].number];
      for (let j = i + 1; j < filtered.length; j++) {
        if (visited.has(filtered[j].number)) continue;
        if (similarity(filtered[i].title, filtered[j].title) > 0.5) {
          group.push(filtered[j].number);
          visited.add(filtered[j].number);
        }
      }
      if (group.length > 1) {
        for (const n of group) groups.set(n, group);
      }
    }
    return groups;
  }, [filtered]);

  const modIssueCount = useMemo(() => {
    const counts = new Map<string, number>();
    const modMap = new Map(mods.map(m => [m.name.toLowerCase(), m.id]));
    for (const issue of issues) {
      const text = (issue.title + ' ' + issue.body).toLowerCase();
      for (const [name, id] of modMap) {
        if (text.includes(name)) counts.set(id, (counts.get(id) || 0) + 1);
      }
    }
    return counts;
  }, [issues, mods]);

  const modMap = new Map(mods.map(m => [m.id, m]));
  const problemMods = useMemo(() =>
    [...modIssueCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id, count]) => ({ mod: modMap.get(id)!, count })),
    [modIssueCount, modMap]
  );

  if (loading) return (
    <div className="flex items-center gap-2 text-zinc-500 text-sm py-12 justify-center">
      <div className="w-4 h-4 border-2 border-zinc-600 border-t-mc-green rounded-full animate-spin" />
      加载 Issues...
    </div>
  );

  if (error) return (
    <div className="text-center py-12">
      <p className="text-zinc-500 text-sm mb-2">无法加载 Issues</p>
      <p className="text-zinc-600 text-xs">GitHub API 错误: {error}</p>
      <p className="text-zinc-700 text-xs mt-1">确认仓库 {SITE_CONFIG.repo} 存在且公开</p>
    </div>
  );

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索 Issues..."
              className="w-full bg-mc-card border border-mc-border rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-mc-green/40 transition-all"
            />
          </div>
          <div className="flex gap-0.5 bg-mc-card border border-mc-border rounded-lg p-0.5">
            {(['all', 'open', 'closed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                  filter === s ? 'bg-white/8 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {s === 'all' ? '全部' : s === 'open' ? '开放' : '已关闭'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          {filtered.map(issue => {
            const dupGroup = duplicateGroups.get(issue.number);
            return (
              <a
                key={issue.number}
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block px-4 py-3 rounded-xl border transition-all hover:border-mc-border-light ${
                  issue.state === 'open' ? 'bg-mc-card border-mc-border' : 'bg-mc-dark/40 border-mc-border/50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 ${issue.state === 'open' ? 'text-mc-green' : 'text-purple-400'}`}>
                    {issue.state === 'open' ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" opacity={0.2} /><circle cx="12" cy="12" r="5" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-medium text-white truncate">{issue.title}</h3>
                      {dupGroup && (
                        <span className="shrink-0 px-1.5 py-px bg-yellow-500/10 border border-yellow-500/20 rounded text-[9px] text-yellow-400">
                          重复 ×{dupGroup.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {issue.labels.map(l => (
                        <span key={l.name} className="px-1.5 py-px rounded text-[9px] border" style={{
                          backgroundColor: `#${l.color}15`,
                          borderColor: `#${l.color}30`,
                          color: `#${l.color}`,
                        }}>{l.name}</span>
                      ))}
                      <span className="text-[10px] text-zinc-600">#{issue.number}</span>
                      <span className="text-[10px] text-zinc-600">{new Date(issue.created_at).toLocaleDateString('zh-CN')}</span>
                      {issue.comments > 0 && (
                        <span className="text-[10px] text-zinc-600 flex items-center gap-0.5">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                          {issue.comments}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-zinc-600 text-sm text-center py-12">暂无匹配的 Issues</p>
          )}
        </div>
      </div>

      <aside className="w-52 shrink-0">
        <div className="sticky top-24 space-y-4">
          <div className="bg-mc-card border border-mc-border rounded-xl p-4">
            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">问题 Mod 排行</h3>
            {problemMods.length === 0 ? (
              <p className="text-[11px] text-zinc-600">暂无数据</p>
            ) : (
              <div className="space-y-2">
                {problemMods.map(({ mod, count }) => (
                  <div key={mod.id} className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-zinc-300 truncate">{mod.name}</span>
                    <span className="shrink-0 px-1.5 py-px bg-red-500/10 border border-red-500/15 rounded text-[9px] text-red-400 tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-mc-card border border-mc-border rounded-xl p-4">
            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">统计</h3>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between"><span className="text-zinc-600">总 Issues</span><span className="text-white tabular-nums">{issues.length}</span></div>
              <div className="flex justify-between"><span className="text-zinc-600">开放</span><span className="text-mc-green tabular-nums">{issues.filter(i => i.state === 'open').length}</span></div>
              <div className="flex justify-between"><span className="text-zinc-600">已关闭</span><span className="text-purple-400 tabular-nums">{issues.filter(i => i.state === 'closed').length}</span></div>
              <div className="flex justify-between"><span className="text-zinc-600">重复组</span><span className="text-yellow-400 tabular-nums">{duplicateGroups.size > 0 ? duplicateGroups.size / 2 : 0}</span></div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

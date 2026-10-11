import { useState, useMemo } from 'react';
import type { McParkMod } from '../utils/mcpark-parser';
import { SITE_CONFIG } from '../site-config';
import { UI } from '../i18n';

interface FeedbackModalProps {
  mods: McParkMod[];
  selectedIds: Set<string>;
  mcVersion: string;
  loader: string;
  onClose: () => void;
}

type IssueType = 'conflict' | 'bug' | 'suggestion' | 'other';

const ISSUE_TYPES: { key: IssueType; label: string; icon: string }[] = [
  { key: 'conflict', label: 'Mod 冲突', icon: '⚡' },
  { key: 'bug', label: 'Bug 报告', icon: '🐛' },
  { key: 'suggestion', label: '建议', icon: '💡' },
  { key: 'other', label: '其他', icon: '📝' },
];

export default function FeedbackModal({ mods, selectedIds, mcVersion, loader, onClose }: FeedbackModalProps) {
  const [issueType, setIssueType] = useState<IssueType>('conflict');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [logs, setLogs] = useState('');
  const [includeMods, setIncludeMods] = useState(true);
  const [modFilter, setModFilter] = useState('');
  const [selectedMods, setSelectedMods] = useState<Set<string>>(() => new Set(selectedIds));

  const filteredMods = useMemo(() =>
    mods.filter(m => m.category !== 'resourcepack' && m.category !== 'shaderpack')
      .filter(m => !modFilter || m.name.toLowerCase().includes(modFilter.toLowerCase())),
    [mods, modFilter]
  );

  const toggleModSelection = (id: string) => {
    setSelectedMods(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const buildIssueUrl = () => {
    const selectedModList = mods
      .filter(m => selectedMods.has(m.id))
      .map(m => `- ${m.name} (v${m.version})`)
      .join('\n');

    const body = [
      `## ${ISSUE_TYPES.find(t => t.key === issueType)?.label || issueType}`,
      '',
      `**MC 版本**: ${mcVersion}`,
      `**加载器**: ${loader}`,
      '',
      '## 描述',
      description || '(请填写问题描述)',
      '',
      ...(logs ? ['## 日志', '```', logs, '```', ''] : []),
      ...(includeMods && selectedModList ? ['## 已加载 Mod', selectedModList, ''] : []),
      '---',
      '_由 MC Full Park 构建工具自动生成_',
    ].join('\n');

    const params = new URLSearchParams({
      title: title || `[${issueType}] `,
      body,
      labels: issueType,
    });

    return `https://github.com/${SITE_CONFIG.repo}/issues/new?${params.toString()}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-mc-card border border-mc-border rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl shadow-black/50"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-mc-border shrink-0">
          <h2 className="text-sm font-semibold text-white">{UI.feedback}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1 rounded hover:bg-white/5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2 block">问题类型</label>
            <div className="grid grid-cols-4 gap-1.5">
              {ISSUE_TYPES.map(t => (
                <button
                  key={t.key}
                  onClick={() => setIssueType(t.key)}
                  className={`px-2 py-2 rounded-lg text-[11px] text-center transition-all border ${
                    issueType === t.key
                      ? 'bg-mc-green/10 border-mc-green/30 text-mc-green'
                      : 'bg-white/3 border-mc-border text-zinc-500 hover:bg-white/5'
                  }`}
                >
                  <span className="block text-base mb-0.5">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">标题</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="简要描述问题..."
              className="w-full bg-mc-dark border border-mc-border rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-mc-green/40 transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">详细描述</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="发生了什么？期望的行为是什么？如何复现？"
              rows={3}
              className="w-full bg-mc-dark border border-mc-border rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-mc-green/40 transition-all resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">日志 / 崩溃报告</label>
            <textarea
              value={logs}
              onChange={e => setLogs(e.target.value)}
              placeholder="粘贴相关日志片段或崩溃报告..."
              rows={4}
              className="w-full bg-mc-dark border border-mc-border rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-mc-green/40 transition-all resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMods}
                  onChange={e => setIncludeMods(e.target.checked)}
                  className="w-3 h-3 rounded border-zinc-600 bg-transparent accent-mc-green"
                />
                <span className="text-[11px] font-medium text-zinc-400">
                  包含 Mod 列表 ({selectedMods.size})
                </span>
              </label>
            </div>
            {includeMods && (
              <div className="bg-mc-dark/60 border border-mc-border rounded-lg overflow-hidden">
                <div className="px-2.5 py-1.5 border-b border-mc-border">
                  <input
                    type="text"
                    value={modFilter}
                    onChange={e => setModFilter(e.target.value)}
                    placeholder="筛选 mod..."
                    className="w-full bg-transparent text-[11px] text-white placeholder-zinc-600 focus:outline-none"
                  />
                </div>
                <div className="max-h-32 overflow-y-auto px-1.5 py-1 flex flex-col gap-px">
                  {filteredMods.map(mod => (
                    <label key={mod.id} className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-white/3 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={selectedMods.has(mod.id)}
                        onChange={() => toggleModSelection(mod.id)}
                        className="w-3 h-3 rounded border-zinc-600 bg-transparent accent-mc-green shrink-0"
                      />
                      <span className="text-zinc-400 truncate">{mod.name}</span>
                      <span className="text-zinc-700 font-mono text-[9px] shrink-0">v{mod.version}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-mc-border flex items-center justify-between shrink-0">
          <p className="text-[10px] text-zinc-600">将跳转至 GitHub 创建 Issue</p>
          <a
            href={buildIssueUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg text-xs font-medium text-mc-dark bg-mc-green hover:bg-mc-green/90 transition-all inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            提交 Issue
          </a>
        </div>
      </div>
    </div>
  );
}

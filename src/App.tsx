import { useState, useCallback, useRef, useEffect } from 'react';
import type { McParkManifest, McParkMod } from './utils/mcpark-parser';
import { parseMcpark, exportMcpark } from './utils/mcpark-parser';
import { resolveDependencies, getCategories, filterMods } from './utils/dependency-resolver';
import { searchMods, type ModrinthProject } from './utils/modrinth-api';
import { csvToMods, downloadCsv } from './utils/csv-utils';
import { DEFAULT_CONFIG, configToToml, parseTomlConfig, evaluateCond, type PackConfig, type ModEntry } from './utils/config-parser';
import { PACK_MODS } from './data/mods';
import { CATEGORY_LABELS, TAB_LABELS, UI } from './i18n';
import ModCard from './components/ModCard';
import DependencyGraph from './components/DependencyGraph';

type Tab = 'selector' | 'config' | 'search' | 'graph';

export default function App() {
  const [mods, setMods] = useState<McParkMod[]>(PACK_MODS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(PACK_MODS.filter(m => m.required).map(m => m.id)));
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('selector');
  const [selectedModForGraph, setSelectedModForGraph] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [config, setConfig] = useState<PackConfig>(DEFAULT_CONFIG);
  const [tomlText, setTomlText] = useState(configToToml(DEFAULT_CONFIG));
  const [modrinthResults, setModrinthResults] = useState<ModrinthProject[]>([]);
  const [modrinthQuery, setModrinthQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const mcVersion = config.minecraft.version[0] || '26.1.2';
  const loader = config.minecraft.mod_loader[0] || 'fabric';

  const categories = getCategories(mods);
  const filtered = filterMods(mods, search, category);
  const { resolved, missing, circular } = resolveDependencies(selectedIds, mods);
  const resolvedIds = new Set(resolved.map(m => m.id));

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!modrinthQuery.trim()) { setModrinthResults([]); return; }
      setSearching(true);
      try {
        const results = await searchMods(modrinthQuery, mcVersion, loader);
        setModrinthResults(results);
      } catch { /* ignore */ }
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [modrinthQuery, mcVersion, loader]);

  const toggleMod = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const mod = mods.find(m => m.id === id);
      if (mod?.required) return prev;
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, [mods]);

  const showStatus = useCallback((template: string, vars: Record<string, string | number>) => {
    let msg = template;
    for (const [k, v] of Object.entries(vars)) {
      msg = msg.replace(`{${k}}`, String(v));
    }
    setStatusMsg(msg);
  }, []);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const manifest = await parseMcpark(file);
      setMods(manifest.files);
      setSelectedIds(new Set(manifest.files.filter(m => m.required).map(m => m.id)));
      showStatus(UI.imported, { name: manifest.name, version: manifest.versionId, count: manifest.files.length });
    } catch (err) {
      showStatus(UI.importFailed, { error: (err as Error).message });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [showStatus]);

  const handleCsvImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imported = csvToMods(reader.result as string);
      setMods(prev => {
        const existing = new Map(prev.map(m => [m.id, m]));
        for (const m of imported) existing.set(m.id, m);
        return Array.from(existing.values());
      });
      showStatus(UI.importedCsv, { count: imported.length });
    };
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = '';
  }, [showStatus]);

  const addFromModrinth = useCallback(async (project: ModrinthProject) => {
    const newMod: McParkMod = {
      id: project.slug,
      name: project.title,
      version: 'latest',
      required: false,
      category: project.categories[0] || 'uncategorized',
      description: project.description,
      source: 'modrinth',
      projectId: project.id,
      dependencies: [],
      env: { client: 'required', server: 'optional' },
    };
    setMods(prev => {
      if (prev.some(m => m.id === newMod.id)) return prev;
      return [...prev, newMod];
    });
    setSelectedIds(prev => new Set([...prev, newMod.id]));
    showStatus(UI.addedFromModrinth, { name: project.title });
  }, [showStatus]);

  const syncConfigToMods = useCallback(() => {
    const parsed = parseTomlConfig(tomlText);
    setConfig(parsed);
    const modEntries = parsed.mods.map(m => typeof m === 'string' ? { id: m } : m);
    const newMods: McParkMod[] = modEntries
      .filter(entry => {
        if (typeof entry === 'string') return true;
        return evaluateCond(entry, mcVersion, loader, parsed.features);
      })
      .map(entry => {
        const id = typeof entry === 'string' ? entry : entry.id;
        const existing = mods.find(m => m.id === id);
        if (existing) return existing;
        return {
          id,
          name: id,
          version: (typeof entry !== 'string' ? entry.version : undefined) || 'latest',
          required: false,
          category: 'uncategorized',
          description: '',
          source: 'modrinth',
          projectId: '',
          dependencies: [],
          env: { client: 'required' as const, server: 'optional' as const },
        };
      });
    setMods(newMods);
    setSelectedIds(new Set(newMods.map(m => m.id)));
    showStatus(UI.syncedFromToml, { count: newMods.length });
  }, [tomlText, mods, mcVersion, loader, showStatus]);

  const syncModsToConfig = useCallback(() => {
    const entries: ModEntry[] = resolved.map(m => ({
      id: m.id,
      version: m.version !== 'latest' ? m.version : undefined,
    }));
    const newConfig = { ...config, mods: entries };
    setConfig(newConfig);
    setTomlText(configToToml(newConfig));
    setStatusMsg(UI.syncedToToml);
  }, [resolved, config]);

  const handleExport = useCallback(async () => {
    const manifest: McParkManifest = {
      formatVersion: 1,
      game: 'minecraft',
      versionId: config.metadata.version,
      name: config.metadata.name,
      summary: config.metadata.description,
      mcVersion,
      loader: { id: loader, version: 'latest' },
      files: resolved,
      dependencies: { minecraft: mcVersion, [loader]: 'latest' },
    };
    const blob = await exportMcpark(manifest);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.metadata.name}-${mcVersion}-${loader}.mcpark`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg(UI.exportedMcpark);
  }, [resolved, config, mcVersion, loader]);

  const exportMrpack = useCallback(() => {
    const index = {
      formatVersion: 1,
      game: 'minecraft',
      versionId: config.metadata.version,
      name: config.metadata.name,
      summary: config.metadata.description,
      files: resolved.map(m => ({
        path: `mods/${m.id}-${m.version}.jar`,
        hashes: { sha1: 'pending', sha512: 'pending' },
        env: m.env,
        downloads: [`https://cdn.modrinth.com/data/${m.projectId}/versions/${m.version}/${m.id}-${m.version}.jar`],
        fileSize: 0,
      })),
      dependencies: { minecraft: mcVersion, [loader]: 'latest' },
    };
    const blob = new Blob([JSON.stringify(index, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modrinth.index.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg(UI.exportedMrpack);
  }, [resolved, config, mcVersion, loader]);

  const exportCurseForge = useCallback(() => {
    const manifest = {
      minecraft: { version: mcVersion, modLoaders: [{ id: loader, primary: true }] },
      manifestType: 'minecraftModpack',
      manifestVersion: 1,
      name: config.metadata.name,
      version: config.metadata.version,
      author: 'MC Full Park',
      files: resolved.map(m => ({ projectID: parseInt(m.projectId) || 0, fileID: 0, required: !selectedIds.has(m.id) ? false : true })),
      overrides: 'overrides',
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg(UI.exportedCurseForge);
  }, [resolved, config, mcVersion, loader, selectedIds]);

  const exportToml = useCallback(() => {
    const blob = new Blob([tomlText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.toml';
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg(UI.exportedToml);
  }, [tomlText]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'selector', label: TAB_LABELS.selector },
    { key: 'config', label: TAB_LABELS.config },
    { key: 'search', label: TAB_LABELS.search },
    { key: 'graph', label: TAB_LABELS.graph },
  ];

  return (
    <div className="min-h-screen bg-mc-dark">
      <header className="bg-gradient-to-r from-mc-darker via-mc-darker to-mc-accent/30 border-b border-white/8 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{UI.appTitle}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Minecraft {mcVersion} · {loader} · {UI.appSubtitle}
            </p>
          </div>
          <div className="flex gap-1.5 flex-wrap items-center">
            <input ref={fileInputRef} type="file" accept=".mcpark,.mrpack,.zip" onChange={handleImport} className="hidden" />
            <input ref={csvInputRef} type="file" accept=".csv" onChange={handleCsvImport} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs text-gray-300 transition-all">{UI.importMcpark}</button>
            <button onClick={() => csvInputRef.current?.click()} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs text-gray-300 transition-all">{UI.importCsv}</button>
            <button onClick={() => downloadCsv(mods)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs text-gray-300 transition-all">{UI.exportCsv}</button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <button onClick={handleExport} className="px-3 py-1.5 bg-mc-green/90 hover:bg-mc-green rounded-md text-xs font-medium text-white transition-all">{'.mcpark'}</button>
            <button onClick={exportMrpack} className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 rounded-md text-xs text-white transition-all">{'.mrpack'}</button>
            <button onClick={exportCurseForge} className="px-3 py-1.5 bg-orange-600/90 hover:bg-orange-600 rounded-md text-xs text-white transition-all">CurseForge</button>
            <button onClick={exportToml} className="px-3 py-1.5 bg-indigo-600/90 hover:bg-indigo-600 rounded-md text-xs text-white transition-all">config.toml</button>
          </div>
        </div>
      </header>

      {statusMsg && (
        <div className="bg-mc-green/15 border-b border-mc-green/20 px-6 py-2 text-sm flex items-center justify-center gap-4">
          <span className="text-mc-green">{statusMsg}</span>
          <button onClick={() => setStatusMsg('')} className="text-gray-500 hover:text-white text-xs transition-colors">{UI.close}</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex gap-0.5 mb-5 border-b border-white/8">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 rounded-t-md ${
                tab === t.key
                  ? 'border-mc-green text-white bg-white/3'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/3'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'selector' && (
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={UI.searchPlaceholder}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-mc-darker/80 border border-white/8 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-mc-green/50 focus:ring-1 focus:ring-mc-green/20 transition-all"
                  />
                </div>
                <select
                  value={category || ''}
                  onChange={e => setCategory(e.target.value || null)}
                  className="bg-mc-darker/80 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-mc-green/50 transition-all min-w-[120px]"
                >
                  <option value="">{UI.allCategories}</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                {filtered.map(mod => (
                  <ModCard key={mod.id} mod={mod} selected={resolvedIds.has(mod.id)}
                    autoResolved={resolvedIds.has(mod.id) && !selectedIds.has(mod.id)}
                    onToggle={() => toggleMod(mod.id)}
                    onShowGraph={() => { setSelectedModForGraph(mod.id); setTab('graph'); }} />
                ))}
                {filtered.length === 0 && (
                  <p className="text-gray-500 text-center py-12 text-sm">{UI.noMods}</p>
                )}
              </div>
              {filtered.length > 0 && (
                <p className="text-xs text-gray-600 text-center mt-4">
                  {filtered.length} / {mods.length}
                </p>
              )}
            </div>
            <aside className="w-60 shrink-0">
              <div className="bg-mc-darker/60 rounded-xl border border-white/8 p-4 sticky top-6 space-y-4">
                <h2 className="text-sm font-bold text-white">{UI.summary}</h2>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-mc-green/10 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-mc-green">{selectedIds.size}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{UI.selected}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-white">{resolved.length}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{UI.withDeps}</p>
                  </div>
                  <div className={`rounded-lg p-2.5 text-center ${missing.length ? 'bg-red-500/10' : 'bg-white/5'}`}>
                    <p className={`text-lg font-bold ${missing.length ? 'text-red-400' : 'text-gray-500'}`}>{missing.length}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{UI.missing}</p>
                  </div>
                  {circular.length > 0 && (
                    <div className="bg-yellow-500/10 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-yellow-400">{circular.length}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{UI.circular}</p>
                    </div>
                  )}
                </div>
                {missing.length > 0 && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 font-medium text-xs mb-1.5">{UI.missingLabel}</p>
                    {missing.map(id => <p key={id} className="text-red-300/80 text-xs font-mono truncate">{id}</p>)}
                  </div>
                )}
                <div className="pt-3 border-t border-white/8">
                  <h3 className="text-xs font-semibold text-gray-400 mb-2">{UI.categories}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map(c => {
                      const count = resolved.filter(m => m.category === c).length;
                      return (
                        <button
                          key={c}
                          onClick={() => { setCategory(category === c ? null : c); }}
                          className={`px-2 py-0.5 rounded-md text-[11px] transition-all ${
                            category === c
                              ? 'bg-mc-green/20 text-mc-green border border-mc-green/30'
                              : 'bg-white/5 text-gray-400 hover:bg-white/8 border border-transparent'
                          }`}
                        >
                          {CATEGORY_LABELS[c] || c}
                          <span className="ml-1 opacity-60">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {tab === 'config' && (
          <div className="flex gap-4 h-[calc(100vh-220px)]">
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-white">{UI.tomlEditor}</h2>
                <div className="flex gap-2">
                  <button onClick={syncConfigToMods} className="px-3 py-1.5 bg-mc-green/80 hover:bg-mc-green rounded-md text-xs font-medium transition-all">{UI.applyToMods}</button>
                  <button onClick={syncModsToConfig} className="px-3 py-1.5 bg-white/8 hover:bg-white/12 border border-white/10 rounded-md text-xs text-gray-300 transition-all">{UI.syncFromSelection}</button>
                </div>
              </div>
              <textarea
                value={tomlText}
                onChange={e => setTomlText(e.target.value)}
                className="flex-1 bg-mc-darker/80 border border-white/8 rounded-lg p-4 font-mono text-xs text-gray-300 focus:outline-none focus:border-mc-green/50 focus:ring-1 focus:ring-mc-green/20 resize-none transition-all"
                spellCheck={false}
              />
            </div>
            <div className="w-80 flex flex-col">
              <h2 className="text-sm font-bold text-white mb-2">{UI.configPreview}</h2>
              <div className="flex-1 bg-mc-darker/60 border border-white/8 rounded-lg p-4 overflow-auto text-xs space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">{UI.nameLabel}</span>
                  <span className="text-white font-medium">{config.metadata.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{UI.mcLabel}</span>
                  <span className="text-white font-mono">{config.minecraft.version.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{UI.loaderLabel}</span>
                  <span className="text-white">{config.minecraft.mod_loader.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{UI.modsLabel}</span>
                  <span className="text-mc-green font-bold">{config.mods.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{UI.outputLabel}</span>
                  <span className="text-white">{config.output.format.join(', ')}</span>
                </div>
                {config.features.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{UI.featuresLabel}</span>
                    <span className="text-white">{config.features.join(', ')}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-white/8">
                  <p className="text-gray-500 mb-2 font-medium">{UI.modEntries}</p>
                  {config.mods.slice(0, 20).map((m, i) => {
                    const entry = typeof m === 'string' ? { id: m } : m;
                    return (
                      <div key={i} className="text-gray-400 pl-2 border-l-2 border-white/5 mb-1.5 hover:border-mc-green/30 transition-colors">
                        <span className="font-mono">{entry.id}</span>
                        {entry.only_version && <span className="text-yellow-400/80 ml-1 text-[10px]">[v:{entry.only_version.join(',')}]</span>}
                        {entry.only_loader && <span className="text-blue-400/80 ml-1 text-[10px]">[l:{entry.only_loader.join(',')}]</span>}
                        {entry.feature && <span className="text-green-400/80 ml-1 text-[10px]">[f:{entry.feature}]</span>}
                      </div>
                    );
                  })}
                  {config.mods.length > 20 && (
                    <p className="text-gray-600 pl-2 text-[10px]">{UI.andMore.replace('{count}', String(config.mods.length - 20))}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'search' && (
          <div>
            <div className="mb-4">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={UI.modrinthSearchPlaceholder}
                  value={modrinthQuery}
                  onChange={e => setModrinthQuery(e.target.value)}
                  className="w-full bg-mc-darker/80 border border-white/8 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-mc-green/50 focus:ring-1 focus:ring-mc-green/20 transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                {UI.searchingFor.replace('{version}', mcVersion).replace('{loader}', loader)}
              </p>
            </div>
            {searching && <p className="text-gray-400 text-sm">{UI.searching}</p>}
            <div className="grid gap-2">
              {modrinthResults.map(project => (
                <div key={project.id} className="bg-mc-darker/60 border border-white/8 rounded-lg p-4 flex items-start justify-between gap-3 hover:border-white/15 transition-all group">
                  <div className="flex items-start gap-3 min-w-0">
                    {project.icon_url && (
                      <img src={project.icon_url} alt="" className="w-10 h-10 rounded-md shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">{project.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{project.description}</p>
                      <div className="flex gap-2 mt-1.5 items-center flex-wrap">
                        {project.categories.slice(0, 4).map(c => (
                          <span key={c} className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-gray-400">{c}</span>
                        ))}
                        <span className="text-[10px] text-gray-500">{project.downloads.toLocaleString()} {UI.downloads}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => addFromModrinth(project)}
                    className="shrink-0 px-3 py-1.5 bg-mc-green/80 hover:bg-mc-green rounded-md text-xs font-medium transition-all opacity-80 group-hover:opacity-100"
                  >
                    {UI.add}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'graph' && (
          <DependencyGraph mods={mods} selectedModId={selectedModForGraph} onSelectMod={setSelectedModForGraph} resolvedIds={resolvedIds} />
        )}
      </div>
    </div>
  );
}

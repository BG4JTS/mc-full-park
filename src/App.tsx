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
import StarMap from './components/StarMap';

type Tab = 'selector' | 'config' | 'search' | 'graph';

const TAB_ICONS: Record<Tab, string> = {
  selector: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  config: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  graph: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
};

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
  const [mcVersion, setMcVersion] = useState('26.1.2');
  const [loader, setLoader] = useState('fabric');
  const [filterVersion, setFilterVersion] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const categories = getCategories(mods);
  const filtered = filterMods(mods, search, category);
  const { resolved, missing, circular } = resolveDependencies(selectedIds, mods);
  const resolvedIds = new Set(resolved.map(m => m.id));

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!modrinthQuery.trim()) { setModrinthResults([]); return; }
      setSearching(true);
      try {
        const results = await searchMods(modrinthQuery, filterVersion ? mcVersion : undefined, loader);
        setModrinthResults(results);
      } catch { /* ignore */ }
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [modrinthQuery, mcVersion, loader, filterVersion]);

  const toggleMod = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const mod = mods.find(m => m.id === id);
      if (mod?.required) return prev;
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, [mods]);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(mods.map(m => m.id)));
  }, [mods]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set(mods.filter(m => m.required).map(m => m.id)));
  }, [mods]);

  const invertSelection = useCallback(() => {
    setSelectedIds(prev => {
      const next = new Set<string>();
      for (const m of mods) {
        if (m.required || !prev.has(m.id)) next.add(m.id);
      }
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
      <header className="sticky top-0 z-50 border-b border-mc-border bg-mc-dark/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-mc-green/15 flex items-center justify-center">
              <svg className="w-4 h-4 text-mc-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <h1 className="text-sm font-semibold text-white tracking-tight">{UI.appTitle}</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="text"
                    value={mcVersion}
                    onChange={e => setMcVersion(e.target.value)}
                    className="w-16 bg-transparent border-b border-zinc-700 text-[11px] text-zinc-400 focus:outline-none focus:border-mc-green/50 transition-colors"
                  />
                  <span className="text-[11px] text-zinc-600">·</span>
                  <select
                    value={loader}
                    onChange={e => setLoader(e.target.value)}
                    className="bg-transparent text-[11px] text-zinc-400 focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="fabric">fabric</option>
                    <option value="quilt">quilt</option>
                    <option value="forge">forge</option>
                    <option value="neoforge">neoforge</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept=".mcpark,.mrpack,.zip" onChange={handleImport} className="hidden" />
            <input ref={csvInputRef} type="file" accept=".csv" onChange={handleCsvImport} className="hidden" />
            <div className="flex items-center gap-1 pr-3 mr-1 border-r border-mc-border">
              <button onClick={() => fileInputRef.current?.click()} className="px-2.5 py-1.5 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-all">{UI.importMcpark}</button>
              <button onClick={() => csvInputRef.current?.click()} className="px-2.5 py-1.5 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-all">{UI.importCsv}</button>
              <button onClick={() => downloadCsv(mods)} className="px-2.5 py-1.5 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-all">{UI.exportCsv}</button>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleExport} className="px-2.5 py-1.5 rounded-md text-xs font-medium text-mc-dark bg-mc-green hover:bg-mc-green/90 transition-all">.mcpark</button>
              <button onClick={exportMrpack} className="px-2.5 py-1.5 rounded-md text-xs font-medium text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 transition-all">.mrpack</button>
              <button onClick={exportCurseForge} className="px-2.5 py-1.5 rounded-md text-xs font-medium text-orange-300 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/20 transition-all">CF</button>
              <button onClick={exportToml} className="px-2.5 py-1.5 rounded-md text-xs font-medium text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/20 transition-all">TOML</button>
            </div>
          </div>
        </div>
      </header>

      {statusMsg && (
        <div className="bg-mc-green/8 border-b border-mc-green/15 px-8 py-2.5 flex items-center justify-center gap-3">
          <svg className="w-3.5 h-3.5 text-mc-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-mc-green/90">{statusMsg}</span>
          <button onClick={() => setStatusMsg('')} className="ml-2 text-zinc-600 hover:text-zinc-400 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <nav className="flex gap-1 mb-8">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-white/8 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/3'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={TAB_ICONS[t.key]} />
              </svg>
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'selector' && (
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex gap-3 mb-3">
                <div className="relative flex-1">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={UI.searchPlaceholder}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-mc-card border border-mc-border rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-mc-green/40 focus:ring-1 focus:ring-mc-green/10 transition-all"
                  />
                </div>
                <select
                  value={category || ''}
                  onChange={e => setCategory(e.target.value || null)}
                  className="bg-mc-card border border-mc-border rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-mc-green/40 transition-all min-w-[120px] appearance-none cursor-pointer"
                >
                  <option value="">{UI.allCategories}</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-1">
                  <button onClick={selectAll} className="px-2 py-1 rounded text-[11px] text-zinc-500 hover:text-white hover:bg-white/5 transition-all">{UI.selectAll}</button>
                  <button onClick={deselectAll} className="px-2 py-1 rounded text-[11px] text-zinc-500 hover:text-white hover:bg-white/5 transition-all">{UI.deselectAll}</button>
                  <button onClick={invertSelection} className="px-2 py-1 rounded text-[11px] text-zinc-500 hover:text-white hover:bg-white/5 transition-all">{UI.invertSelection}</button>
                </div>
                <span className="text-[11px] text-zinc-600 tabular-nums">
                  {selectedIds.size} / {mods.length}
                </span>
              </div>

              <div className="flex flex-col gap-px">
                {filtered.map(mod => (
                  <ModCard key={mod.id} mod={mod} selected={resolvedIds.has(mod.id)}
                    autoResolved={resolvedIds.has(mod.id) && !selectedIds.has(mod.id)}
                    onToggle={() => toggleMod(mod.id)}
                    onShowGraph={() => { setSelectedModForGraph(mod.id); setTab('graph'); }} />
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-16">
                    <svg className="w-10 h-10 mx-auto text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-zinc-600 text-sm">{UI.noMods}</p>
                  </div>
                )}
              </div>
              {filtered.length > 0 && (
                <p className="text-[11px] text-zinc-700 text-center mt-4 tabular-nums">
                  {filtered.length} / {mods.length}
                </p>
              )}
            </div>

            <aside className="w-52 shrink-0">
              <div className="sticky top-24 space-y-3">
                <div className="grid grid-cols-2 gap-1.5">
                  <StatCard value={selectedIds.size} label={UI.selected} accent />
                  <StatCard value={resolved.length} label={UI.withDeps} />
                  <StatCard value={missing.length} label={UI.missing} danger={missing.length > 0} />
                  {circular.length > 0 && (
                    <StatCard value={circular.length} label={UI.circular} warn />
                  )}
                </div>

                {missing.length > 0 && (
                  <div className="bg-red-500/8 border border-red-500/15 rounded-xl p-3">
                    <p className="text-red-400 font-medium text-[11px] mb-1.5">{UI.missingLabel}</p>
                    {missing.map(id => <p key={id} className="text-red-300/70 text-[10px] font-mono truncate">{id}</p>)}
                  </div>
                )}

                <div>
                  <h3 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">{UI.categories}</h3>
                  <div className="flex flex-wrap gap-1">
                    {categories.map(c => {
                      const count = resolved.filter(m => m.category === c).length;
                      return (
                        <button
                          key={c}
                          onClick={() => setCategory(category === c ? null : c)}
                          className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${
                            category === c
                              ? 'bg-mc-green/15 text-mc-green border border-mc-green/25'
                              : 'bg-white/3 text-zinc-500 hover:bg-white/6 border border-transparent'
                          }`}
                        >
                          {CATEGORY_LABELS[c] || c}
                          <span className="ml-0.5 text-zinc-600">{count}</span>
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
          <div className="flex gap-6 h-[calc(100vh-220px)]">
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">{UI.tomlEditor}</h2>
                <div className="flex gap-2">
                  <button onClick={syncConfigToMods} className="px-3 py-1.5 bg-mc-green hover:bg-mc-green/90 rounded-lg text-xs font-medium text-mc-dark transition-all">{UI.applyToMods}</button>
                  <button onClick={syncModsToConfig} className="px-3 py-1.5 bg-white/5 hover:bg-white/8 border border-mc-border rounded-lg text-xs text-zinc-400 hover:text-white transition-all">{UI.syncFromSelection}</button>
                </div>
              </div>
              <textarea
                value={tomlText}
                onChange={e => setTomlText(e.target.value)}
                className="flex-1 bg-mc-card border border-mc-border rounded-xl p-5 font-mono text-xs text-zinc-300 focus:outline-none focus:border-mc-green/40 focus:ring-1 focus:ring-mc-green/10 resize-none transition-all leading-relaxed"
                spellCheck={false}
              />
            </div>
            <div className="w-80 flex flex-col">
              <h2 className="text-sm font-semibold text-white mb-3">{UI.configPreview}</h2>
              <div className="flex-1 bg-mc-card border border-mc-border rounded-xl p-5 overflow-auto text-xs space-y-3.5">
                {[
                  [UI.nameLabel, config.metadata.name, 'text-white'],
                  [UI.mcLabel, config.minecraft.version.join(', '), 'text-white font-mono'],
                  [UI.loaderLabel, config.minecraft.mod_loader.join(', '), 'text-white'],
                  [UI.modsLabel, String(config.mods.length), 'text-mc-green font-bold'],
                  [UI.outputLabel, config.output.format.join(', '), 'text-white'],
                ].map(([label, value, cls]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-zinc-600">{label}</span>
                    <span className={cls}>{value}</span>
                  </div>
                ))}
                {config.features.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600">{UI.featuresLabel}</span>
                    <span className="text-white">{config.features.join(', ')}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-mc-border">
                  <p className="text-zinc-600 mb-3 font-medium">{UI.modEntries}</p>
                  {config.mods.slice(0, 20).map((m, i) => {
                    const entry = typeof m === 'string' ? { id: m } : m;
                    return (
                      <div key={i} className="text-zinc-500 pl-3 border-l border-mc-border-light mb-2 hover:border-mc-green/30 transition-colors">
                        <span className="font-mono">{entry.id}</span>
                        {entry.only_version && <span className="text-yellow-400/60 ml-1.5 text-[10px]">v:{entry.only_version.join(',')}</span>}
                        {entry.only_loader && <span className="text-blue-400/60 ml-1.5 text-[10px]">l:{entry.only_loader.join(',')}</span>}
                        {entry.feature && <span className="text-mc-green/60 ml-1.5 text-[10px]">f:{entry.feature}</span>}
                      </div>
                    );
                  })}
                  {config.mods.length > 20 && (
                    <p className="text-zinc-700 pl-3 text-[10px]">{UI.andMore.replace('{count}', String(config.mods.length - 20))}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'search' && (
          <div className="max-w-3xl">
            <div className="mb-6">
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={UI.modrinthSearchPlaceholder}
                  value={modrinthQuery}
                  onChange={e => setModrinthQuery(e.target.value)}
                  className="w-full bg-mc-card border border-mc-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-mc-green/40 focus:ring-1 focus:ring-mc-green/10 transition-all"
                />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-xs text-zinc-600">
                  {UI.searchingFor.replace('{version}', mcVersion).replace('{loader}', loader)}
                </p>
                <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filterVersion}
                    onChange={e => setFilterVersion(e.target.checked)}
                    className="w-3 h-3 rounded border-zinc-600 bg-transparent accent-mc-green"
                  />
                  限定版本
                </label>
              </div>
            </div>
            {searching && (
              <div className="flex items-center gap-2 text-zinc-500 text-sm py-4">
                <div className="w-4 h-4 border-2 border-zinc-600 border-t-mc-green rounded-full animate-spin" />
                {UI.searching}
              </div>
            )}
            <div className="grid gap-2">
              {modrinthResults.map(project => (
                <div key={project.id} className="bg-mc-card border border-mc-border rounded-xl p-4 flex items-start justify-between gap-4 hover:border-mc-border-light transition-all group">
                  <div className="flex items-start gap-3.5 min-w-0">
                    {project.icon_url && (
                      <img src={project.icon_url} alt="" className="w-10 h-10 rounded-lg shrink-0 bg-white/5" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">{project.title}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">{project.description}</p>
                      <div className="flex gap-2 mt-2 items-center flex-wrap">
                        {project.categories.slice(0, 4).map(c => (
                          <span key={c} className="px-1.5 py-0.5 bg-white/4 rounded text-[10px] text-zinc-500">{c}</span>
                        ))}
                        <span className="text-[10px] text-zinc-600 tabular-nums">{project.downloads.toLocaleString()} {UI.downloads}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => addFromModrinth(project)}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-mc-green/10 text-mc-green border border-mc-green/20 hover:bg-mc-green/20 transition-all opacity-0 group-hover:opacity-100"
                  >
                    {UI.add}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'graph' && (
          <div className="flex gap-4 h-[calc(100vh-220px)]">
            <div className="flex-1 min-w-0">
              <StarMap mods={mods} resolvedIds={resolvedIds} onSelectMod={setSelectedModForGraph} selectedModId={selectedModForGraph} />
            </div>
            <div className="w-72 shrink-0">
              <DependencyGraph mods={mods} selectedModId={selectedModForGraph} onSelectMod={setSelectedModForGraph} resolvedIds={resolvedIds} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ value, label, accent, danger, warn }: {
  value: number; label: string; accent?: boolean; danger?: boolean; warn?: boolean;
}) {
  const colorClass = danger ? 'text-red-400' : warn ? 'text-yellow-400' : accent ? 'text-mc-green' : 'text-white';
  const bgClass = danger ? 'bg-red-500/8 border-red-500/15' : warn ? 'bg-yellow-500/8 border-yellow-500/15' : accent ? 'bg-mc-green/8 border-mc-green/15' : 'bg-mc-card border-mc-border';
  return (
    <div className={`rounded-xl border p-3 text-center ${bgClass}`}>
      <p className={`text-xl font-bold tabular-nums ${colorClass}`}>{value}</p>
      <p className="text-[10px] text-zinc-600 mt-0.5">{label}</p>
    </div>
  );
}

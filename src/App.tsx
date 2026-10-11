import { useState, useCallback, useRef, useEffect } from 'react';
import type { McParkManifest, McParkMod } from './utils/mcpark-parser';
import { parseMcpark, exportMcpark } from './utils/mcpark-parser';
import { resolveDependencies, getCategories, filterMods } from './utils/dependency-resolver';
import { searchMods, type ModrinthProject } from './utils/modrinth-api';
import { csvToMods, downloadCsv } from './utils/csv-utils';
import { DEFAULT_CONFIG, configToToml, parseTomlConfig, evaluateCond, type PackConfig, type ModEntry } from './utils/config-parser';
import ModCard from './components/ModCard';
import DependencyGraph from './components/DependencyGraph';

type Tab = 'selector' | 'config' | 'search' | 'graph';

export default function App() {
  const [mods, setMods] = useState<McParkMod[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const manifest = await parseMcpark(file);
      setMods(manifest.files);
      setSelectedIds(new Set(manifest.files.filter(m => m.required).map(m => m.id)));
      setStatusMsg(`Imported "${manifest.name}" v${manifest.versionId} (${manifest.files.length} mods)`);
    } catch (err) {
      setStatusMsg(`Import failed: ${(err as Error).message}`);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

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
      setStatusMsg(`Imported ${imported.length} mods from CSV`);
    };
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = '';
  }, []);

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
    setStatusMsg(`Added ${project.title} from Modrinth`);
  }, []);

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
    setStatusMsg(`Synced ${newMods.length} mods from TOML config`);
  }, [tomlText, mods, mcVersion, loader]);

  const syncModsToConfig = useCallback(() => {
    const entries: ModEntry[] = resolved.map(m => ({
      id: m.id,
      version: m.version !== 'latest' ? m.version : undefined,
    }));
    const newConfig = { ...config, mods: entries };
    setConfig(newConfig);
    setTomlText(configToToml(newConfig));
    setStatusMsg('Synced selection to TOML config');
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
    setStatusMsg('Exported .mcpark');
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
    setStatusMsg('Exported modrinth.index.json');
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
    setStatusMsg('Exported CurseForge manifest.json');
  }, [resolved, config, mcVersion, loader, selectedIds]);

  const exportToml = useCallback(() => {
    const blob = new Blob([tomlText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.toml';
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg('Exported config.toml');
  }, [tomlText]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'selector', label: 'Mod Selector' },
    { key: 'config', label: 'TOML Config' },
    { key: 'search', label: 'Modrinth Search' },
    { key: 'graph', label: 'Dependency Graph' },
  ];

  return (
    <div className="min-h-screen bg-mc-dark">
      <header className="bg-mc-darker border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">MC Full Park</h1>
            <p className="text-sm text-gray-400">Minecraft {mcVersion} {loader} - Mod Pack Builder</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input ref={fileInputRef} type="file" accept=".mcpark,.mrpack,.zip" onChange={handleImport} className="hidden" />
            <input ref={csvInputRef} type="file" accept=".csv" onChange={handleCsvImport} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-mc-accent hover:bg-mc-accent/80 rounded text-xs transition-colors">Import .mcpark</button>
            <button onClick={() => csvInputRef.current?.click()} className="px-3 py-1.5 bg-mc-accent hover:bg-mc-accent/80 rounded text-xs transition-colors">Import CSV</button>
            <button onClick={() => downloadCsv(mods)} className="px-3 py-1.5 bg-mc-accent hover:bg-mc-accent/80 rounded text-xs transition-colors">Export CSV</button>
            <div className="w-px bg-white/10" />
            <button onClick={handleExport} className="px-3 py-1.5 bg-mc-green hover:bg-mc-green/80 rounded text-xs font-medium transition-colors">.mcpark</button>
            <button onClick={exportMrpack} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-xs transition-colors">.mrpack</button>
            <button onClick={exportCurseForge} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded text-xs transition-colors">CurseForge</button>
            <button onClick={exportToml} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-xs transition-colors">config.toml</button>
          </div>
        </div>
      </header>

      {statusMsg && (
        <div className="bg-mc-accent/50 border-b border-mc-accent px-6 py-2 text-sm text-center flex items-center justify-center gap-4">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg('')} className="text-gray-400 hover:text-white text-xs">close</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-1 mb-4 border-b border-white/10">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm transition-colors border-b-2 ${
                tab === t.key ? 'border-mc-green text-white' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'selector' && (
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="flex gap-3 mb-4">
                <input type="text" placeholder="Search mods..." value={search} onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-mc-darker border border-white/10 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-mc-green text-sm" />
                <select value={category || ''} onChange={e => setCategory(e.target.value || null)}
                  className="bg-mc-darker border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-mc-green">
                  <option value="">All</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                {filtered.map(mod => (
                  <ModCard key={mod.id} mod={mod} selected={resolvedIds.has(mod.id)}
                    autoResolved={resolvedIds.has(mod.id) && !selectedIds.has(mod.id)}
                    onToggle={() => toggleMod(mod.id)}
                    onShowGraph={() => { setSelectedModForGraph(mod.id); setTab('graph'); }} />
                ))}
                {filtered.length === 0 && <p className="text-gray-500 text-center py-8">No mods. Use "Modrinth Search" or "Import CSV" to add mods.</p>}
              </div>
            </div>
            <aside className="w-64 shrink-0">
              <div className="bg-mc-darker rounded-lg border border-white/10 p-4 sticky top-6">
                <h2 className="text-sm font-semibold mb-3">Summary</h2>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-gray-400">Selected</span><span className="text-mc-green">{selectedIds.size}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">With deps</span><span>{resolved.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Missing</span><span className={missing.length ? 'text-red-400' : 'text-gray-500'}>{missing.length}</span></div>
                  {circular.length > 0 && <div className="flex justify-between"><span className="text-gray-400">Circular</span><span className="text-yellow-400">{circular.length}</span></div>}
                </div>
                {missing.length > 0 && (
                  <div className="mt-3 p-2 bg-red-900/30 border border-red-500/30 rounded text-xs">
                    <p className="text-red-400 font-medium mb-1">Missing:</p>
                    {missing.map(id => <p key={id} className="text-red-300">{id}</p>)}
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <h3 className="text-xs font-medium text-gray-400 mb-1.5">Categories</h3>
                  <div className="flex flex-wrap gap-1">
                    {categories.map(c => (
                      <span key={c} className="px-1.5 py-0.5 bg-mc-accent/50 rounded text-[10px] text-gray-300">
                        {c} ({resolved.filter(m => m.category === c).length})
                      </span>
                    ))}
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
                <h2 className="text-sm font-semibold text-gray-300">TOML Editor</h2>
                <div className="flex gap-2">
                  <button onClick={syncConfigToMods} className="px-3 py-1 bg-mc-green/80 hover:bg-mc-green rounded text-xs">Apply to Mods</button>
                  <button onClick={syncModsToConfig} className="px-3 py-1 bg-mc-accent hover:bg-mc-accent/80 rounded text-xs">Sync from Selection</button>
                </div>
              </div>
              <textarea
                value={tomlText}
                onChange={e => setTomlText(e.target.value)}
                className="flex-1 bg-mc-darker border border-white/10 rounded p-4 font-mono text-xs text-gray-300 focus:outline-none focus:border-mc-green resize-none scrollbar-thin"
                spellCheck={false}
              />
            </div>
            <div className="w-80 flex flex-col">
              <h2 className="text-sm font-semibold text-gray-300 mb-2">Config Preview</h2>
              <div className="flex-1 bg-mc-darker border border-white/10 rounded p-4 overflow-auto scrollbar-thin text-xs space-y-3">
                <div>
                  <span className="text-gray-500">Name: </span><span className="text-white">{config.metadata.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">MC: </span><span className="text-white">{config.minecraft.version.join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Loader: </span><span className="text-white">{config.minecraft.mod_loader.join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Mods: </span><span className="text-white">{config.mods.length}</span>
                </div>
                <div>
                  <span className="text-gray-500">Output: </span><span className="text-white">{config.output.format.join(', ')}</span>
                </div>
                {config.features.length > 0 && (
                  <div>
                    <span className="text-gray-500">Features: </span><span className="text-white">{config.features.join(', ')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/10">
                  <p className="text-gray-500 mb-1">Mod entries:</p>
                  {config.mods.slice(0, 20).map((m, i) => {
                    const entry = typeof m === 'string' ? { id: m } : m;
                    return (
                      <div key={i} className="text-gray-400 pl-2 border-l border-white/5 mb-1">
                        {entry.id}
                        {entry.only_version && <span className="text-yellow-400 ml-1">[v:{entry.only_version.join(',')}]</span>}
                        {entry.only_loader && <span className="text-blue-400 ml-1">[l:{entry.only_loader.join(',')}]</span>}
                        {entry.feature && <span className="text-green-400 ml-1">[f:{entry.feature}]</span>}
                      </div>
                    );
                  })}
                  {config.mods.length > 20 && <p className="text-gray-600 pl-2">...and {config.mods.length - 20} more</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'search' && (
          <div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search Modrinth for mods..."
                value={modrinthQuery}
                onChange={e => setModrinthQuery(e.target.value)}
                className="w-full bg-mc-darker border border-white/10 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-mc-green text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Searching for MC {mcVersion} / {loader}</p>
            </div>
            {searching && <p className="text-gray-400 text-sm">Searching...</p>}
            <div className="grid gap-2">
              {modrinthResults.map(project => (
                <div key={project.id} className="bg-mc-darker border border-white/10 rounded-lg p-4 flex items-start justify-between gap-3 hover:border-white/20 transition-colors">
                  <div className="flex items-start gap-3">
                    {project.icon_url && (
                      <img src={project.icon_url} alt="" className="w-10 h-10 rounded" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                    <div>
                      <h3 className="font-semibold text-white text-sm">{project.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{project.description}</p>
                      <div className="flex gap-2 mt-1">
                        {project.categories.slice(0, 4).map(c => (
                          <span key={c} className="px-1.5 py-0.5 bg-mc-accent/30 rounded text-[10px] text-gray-400">{c}</span>
                        ))}
                        <span className="text-[10px] text-gray-500">{project.downloads.toLocaleString()} downloads</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => addFromModrinth(project)}
                    className="shrink-0 px-3 py-1.5 bg-mc-green hover:bg-mc-green/80 rounded text-xs transition-colors">
                    Add
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

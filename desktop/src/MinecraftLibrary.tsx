import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { RefreshCw, ShieldCheck, Snowflake } from "lucide-react";

type MinecraftVersion = { id: string; kind: string; release_time: string };
type FabricLoader = { version: string; stable: boolean };

export default function MinecraftLibrary() {
  const [versions, setVersions] = useState<MinecraftVersion[]>([]);
  const [selected, setSelected] = useState("");
  const [snapshots, setSnapshots] = useState(false);
  const [loaders, setLoaders] = useState<FabricLoader[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaderLoading, setLoaderLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaderError, setLoaderError] = useState("");

  const refresh = async (includeSnapshots: boolean) => {
    setLoading(true); setError("");
    try {
      const result = await invoke<MinecraftVersion[]>("minecraft_versions", { includeSnapshots });
      setVersions(result);
      setSelected((current) => result.some((v) => v.id === current) ? current : (result[0]?.id ?? ""));
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { void refresh(snapshots); }, [snapshots]);

  useEffect(() => {
    if (!selected) { setLoaders([]); return; }
    let active = true;
    setLoaderLoading(true); setLoaderError("");
    invoke<FabricLoader[]>("fabric_loader_versions", { gameVersion: selected })
      .then((result) => { if (active) setLoaders(result); })
      .catch((e) => { if (active) { setLoaders([]); setLoaderError(String(e)); } })
      .finally(() => { if (active) setLoaderLoading(false); });
    return () => { active = false; };
  }, [selected]);

  return <div className="version-library">
    <div className="library-heading">
      <div><div className="eyebrow"><span className="eyebrow-line" /> LIVE GAME METADATA</div><h1>Version Library</h1><p>Real Minecraft Java versions published by Mojang.</p></div>
      <button className="secondary-button library-refresh" onClick={() => void refresh(snapshots)} disabled={loading}><RefreshCw size={14} /> Refresh</button>
    </div>
    <section className="library-panel">
      <div className="library-panel-top"><div className="library-icon"><Snowflake size={20} /></div><div><b>Minecraft Java Edition</b><small>1.21 onward · live Mojang version manifest</small></div><span className="metadata-live">● LIVE</span></div>
      <label className="library-label" htmlFor="minecraft-version">Minecraft version</label>
      <select id="minecraft-version" className="library-select" value={selected} onChange={(e) => setSelected(e.target.value)} disabled={loading || !versions.length}>
        {versions.map((v) => <option key={v.id} value={v.id}>{v.id} · {v.kind}</option>)}
      </select>
      <label className="snapshot-toggle"><input type="checkbox" checked={snapshots} onChange={(e) => setSnapshots(e.target.checked)} /> Include snapshots / pre-releases</label>
      {loading && <p className="library-message">Loading Mojang's official version list…</p>}
      {error && <p className="library-error">{error}</p>}
      {!loading && !error && <p className="library-footnote">{versions.length} matching versions. New releases appear automatically when Mojang publishes them.</p>}
    </section>
    <div className="library-section-title"><div><span className="eyebrow">MOD LOADER METADATA</span><h2>Fabric Loader</h2></div></div>
    <section className="loader-card">
      <div className="loader-title-row"><div><b>Fabric for {selected || "selected version"}</b><small>Loader builds from Fabric's official metadata service</small></div><span className="loader-supported">CONNECTED</span></div>
      {loaderLoading && <p className="library-message">Checking compatible Fabric builds…</p>}
      {loaderError && <p className="library-error">{loaderError}</p>}
      {!loaderLoading && !loaderError && <div className="loader-results"><strong>{loaders.length ? loaders.length + " builds available" : "No loader builds returned for this version"}</strong>{loaders.slice(0, 6).map((l) => <span className="loader-chip" key={l.version}>{l.version}{l.stable ? " · stable" : " · preview"}</span>)}</div>}
    </section>
    <div className="loader-grid">
      {[["Vanilla","Official Mojang game files"],["Forge","Forge mod ecosystem"],["NeoForge","Modern Forge ecosystem"],["Quilt","Community mod loader"],["OptiFine","Official OptiFine builds"]].map(([name, desc]) => <article className="loader-upcoming" key={name}><div><b>{name}</b><small>{desc}</small></div><span>Installer integration pending</span></article>)}
    </div>
    <div className="install-engine-note"><ShieldCheck size={18} /><div><b>Installation engine is not enabled yet</b><p>This milestone connects the live version catalog and Fabric compatibility metadata. Downloading game libraries/assets, creating playable instances, Microsoft authentication and launching the game still need implementation and testing. No fake install button is shown.</p></div></div>
  </div>;
}

import { useEffect, useState } from "react";
import MinecraftLibrary from "./MinecraftLibrary";
import { invoke } from "@tauri-apps/api/core";
import {
  Activity, Boxes, ChevronDown, CircleHelp, Cpu, Download, Gauge,
  Gamepad2, HardDrive, Home, Layers3, MemoryStick, Monitor, Moon,
  Package, Play, Settings2, ShieldCheck, Snowflake, Sun, Zap,
} from "lucide-react";

type HostSnapshot = {
  os: string;
  architecture: string;
  cpu_name: string;
  logical_cores: number;
  total_memory_gib: number;
};

type Page = "Overview" | "My Minecraft" | "Version Library" | "Mod Marketplace" | "Performance Lab" | "Settings";

const navigation: { label: Page; icon: typeof Home }[] = [
  { label: "Overview", icon: Home },
  { label: "My Minecraft", icon: Gamepad2 },
  { label: "Version Library", icon: Layers3 },
  { label: "Mod Marketplace", icon: Package },
  { label: "Performance Lab", icon: Gauge },
  { label: "Settings", icon: Settings2 },
];

function App() {
  const [page, setPage] = useState<Page>(() => {
    const saved = localStorage.getItem("zeno:last-page") as Page | null;
    return navigation.some((item) => item.label === saved) ? saved! : "Overview";
  });
  const [theme, setTheme] = useState<"light" | "midnight">("light");
  const [host, setHost] = useState<HostSnapshot | null>(null);
  const [hostError, setHostError] = useState("");

  useEffect(() => {
    localStorage.setItem("zeno:last-page", page);
  }, [page]);

  useEffect(() => {
    invoke<HostSnapshot>("host_snapshot")
      .then(setHost)
      .catch(() => setHostError("System details are available when ZENO runs as a desktop app."));
  }, []);

  const changePage = (next: Page) => setPage(next);

  return (
    <main className={`app-shell theme-${theme}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Snowflake size={22} strokeWidth={2.2} /></div>
          <div><strong>ZENO</strong><span>CLIENT</span></div>
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="nav-list">
          {navigation.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${page === label ? "active" : ""}`} onClick={() => changePage(label)}>
              <Icon size={17} /><span>{label}</span>
              {label === "Performance Lab" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-status"><span className="status-pulse" /> Desktop foundation <b>v0.1</b></div>
          <button className="help-link" onClick={() => changePage("Settings")}><CircleHelp size={16} /> Help & settings</button>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{page}</strong></div>
          <div className="top-actions">
            <div className="instance-picker"><Gamepad2 size={16} /><span>No instance selected</span><ChevronDown size={14} /></div>
            <button className="icon-button" aria-label="Downloads" onClick={() => changePage("My Minecraft")}><Download size={17} /></button>
            <button className="theme-toggle" onClick={() => setTheme(theme === "light" ? "midnight" : "light")} aria-label="Toggle theme">
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <div className="avatar">Z</div>
          </div>
        </header>

        <div className="page-content">
          {page === "Overview" ? (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><span className="eyebrow-line" /> ARCTIC FUTURE / DESKTOP</div>
                  <h1>Your Minecraft,<br /><span>without the limits.</span></h1>
                  <p className="subtitle">A focused home for your Minecraft Java installations, performance and mods.</p>
                </div>
                <div className="hero-crystal" aria-hidden="true"><div className="crystal-core"><Snowflake size={58} /></div><i /><i /><i /></div>
              </div>

              <section className="launch-card">
                <div className="launch-art"><div className="mountain mountain-back" /><div className="mountain mountain-front" /><div className="pixel-sun" /></div>
                <div className="launch-copy">
                  <div className="card-kicker">READY WHEN YOU ARE</div>
                  <h2>Start your next<br />adventure.</h2>
                  <p>Create or import an isolated Minecraft installation to get started.</p>
                  <button className="primary-button" onClick={() => changePage("My Minecraft")}><Play size={16} fill="currentColor" /> Set up Minecraft</button>
                </div>
                <div className="launch-badge"><Snowflake size={14} /> ZENO LAUNCH</div>
              </section>

              <div className="section-heading"><div><span className="eyebrow">SYSTEM OVERVIEW</span><h3>Your environment</h3></div><span className="live-label"><span /> LIVE DEVICE DATA</span></div>
              <div className="stat-grid">
                <article className="stat-card"><div className="stat-icon"><Cpu size={18} /></div><span>Processor</span><strong>{host?.cpu_name || (hostError ? "Desktop only" : "Detecting…")}</strong><small>{host ? `${host.logical_cores} logical cores` : "Waiting for system bridge"}</small></article>
                <article className="stat-card"><div className="stat-icon"><MemoryStick size={18} /></div><span>Physical memory</span><strong>{host ? `${host.total_memory_gib.toFixed(1)} GB` : "—"}</strong><small>{host ? "Detected from your device" : "No fabricated measurements"}</small></article>
                <article className="stat-card"><div className="stat-icon"><Monitor size={18} /></div><span>Platform</span><strong>{host ? host.os : "—"}</strong><small>{host?.architecture || "Waiting for detection"}</small></article>
                <article className="stat-card"><div className="stat-icon"><HardDrive size={18} /></div><span>Installations</span><strong>0</strong><small>Create your first instance</small></article>
              </div>

              <div className="section-heading lower-heading"><div><span className="eyebrow">NEXT STEPS</span><h3>Build your setup</h3></div></div>
              <div className="action-grid">
                <button className="action-card" onClick={() => changePage("My Minecraft")}><div className="action-icon"><Boxes size={19} /></div><span><b>Manage instances</b><small>Keep every profile independent</small></span><span className="action-arrow">↗</span></button>
                <button className="action-card" onClick={() => changePage("Mod Marketplace")}><div className="action-icon"><Package size={19} /></div><span><b>Explore mods</b><small>Find compatible community projects</small></span><span className="action-arrow">↗</span></button>
                <button className="action-card" onClick={() => changePage("Performance Lab")}><div className="action-icon"><Zap size={19} /></div><span><b>Performance lab</b><small>Measure before optimizing</small></span><span className="action-arrow">↗</span></button>
              </div>
            </>
          ) : (
            <div className="placeholder-page">
              <div className="placeholder-icon">{page === "Performance Lab" ? <Activity size={26} /> : page === "Mod Marketplace" ? <Package size={26} /> : <Layers3 size={26} />}</div>
              <div className="eyebrow">ZENO CLIENT / DEVELOPMENT</div>
              <h1>{page}</h1>
              <p>This workspace is reserved for the next implementation milestone. We will connect it to real Minecraft data before enabling actions.</p>
              <div className="milestone-note"><ShieldCheck size={17} /> No simulated installs, compatibility results or performance measurements.</div>
              <button className="secondary-button" onClick={() => changePage("Overview")}>Back to overview</button>
            </div>
          )}
          <footer className="app-footer"><span>© 2026 ZENO CLIENT</span><span>Built for Minecraft Java Edition <i /> ARCTIC FUTURE</span></footer>
        </div>
      </section>
    </main>
  );
}

export default App;

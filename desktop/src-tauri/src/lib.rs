use serde::Serialize;
use serde_json::Value;
use sysinfo::System;

const MOJANG_MANIFEST: &str = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";
const FABRIC_META: &str = "https://meta.fabricmc.net/v2";

#[derive(Serialize)]
struct HostSnapshot {
    os: String,
    architecture: String,
    cpu_name: String,
    logical_cores: usize,
    total_memory_gib: f64,
}

#[derive(Serialize)]
struct MinecraftVersion {
    id: String,
    kind: String,
    release_time: String,
}

#[derive(Serialize)]
struct FabricLoaderVersion {
    version: String,
    stable: bool,
}

fn is_121_or_newer(version: &str) -> bool {
    let mut parts = version.split('.');
    let major = parts.next().and_then(|p| p.parse::<u32>().ok()).unwrap_or(0);
    let minor = parts.next().and_then(|p| p.split(|c: char| !c.is_ascii_digit()).next())
        .and_then(|p| p.parse::<u32>().ok()).unwrap_or(0);
    major > 1 || (major == 1 && minor >= 21)
}

#[tauri::command]
fn host_snapshot() -> HostSnapshot {
    let mut system = System::new_all();
    system.refresh_all();

    let cpu_name = system.cpus().first()
        .map(|cpu| cpu.brand().trim().to_string())
        .filter(|brand| !brand.is_empty())
        .unwrap_or_else(|| "Unknown processor".to_string());

    HostSnapshot {
        os: std::env::consts::OS.to_string(),
        architecture: std::env::consts::ARCH.to_string(),
        cpu_name,
        logical_cores: system.cpus().len(),
        total_memory_gib: system.total_memory() as f64 / 1_073_741_824.0,
    }
}

/// Reads Mojang's live manifest. No Minecraft versions are hardcoded in the UI.
#[tauri::command]
async fn minecraft_versions(include_snapshots: bool) -> Result<Vec<MinecraftVersion>, String> {
    let response = reqwest::get(MOJANG_MANIFEST).await
        .map_err(|e| format!("Could not reach Mojang's version service: {e}"))?;
    if !response.status().is_success() {
        return Err(format!("Mojang version service returned HTTP {}", response.status()));
    }
    let manifest: Value = response.json().await
        .map_err(|e| format!("Could not read Mojang version manifest: {e}"))?;
    let entries = manifest["versions"].as_array()
        .ok_or_else(|| "Mojang manifest did not contain a versions list".to_string())?;

    let versions = entries.iter().filter_map(|entry| {
        let id = entry["id"].as_str()?;
        let kind = entry["type"].as_str()?;
        if !is_121_or_newer(id) { return None; }
        if kind != "release" && !(include_snapshots && kind == "snapshot") { return None; }
        Some(MinecraftVersion {
            id: id.to_string(),
            kind: kind.to_string(),
            release_time: entry["releaseTime"].as_str().unwrap_or("").to_string(),
        })
    }).collect();

    Ok(versions)
}

/// Returns Fabric-supported game versions from Fabric's own metadata service.
#[tauri::command]
async fn fabric_game_versions() -> Result<Vec<String>, String> {
    let url = format!("{FABRIC_META}/versions/game");
    let response = reqwest::get(url).await
        .map_err(|e| format!("Could not reach Fabric metadata: {e}"))?;
    if !response.status().is_success() {
        return Err(format!("Fabric metadata returned HTTP {}", response.status()));
    }
    let entries: Vec<Value> = response.json().await
        .map_err(|e| format!("Could not read Fabric game versions: {e}"))?;
    Ok(entries.iter().filter_map(|entry| {
        let version = entry["version"].as_str()?;
        if is_121_or_newer(version) { Some(version.to_string()) } else { None }
    }).collect())
}

/// Returns real Fabric loader builds available for the selected Minecraft version.
#[tauri::command]
async fn fabric_loader_versions(game_version: String) -> Result<Vec<FabricLoaderVersion>, String> {
    if !is_121_or_newer(&game_version) || !game_version.chars().all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '-') {
        return Err("Invalid Minecraft version selected".to_string());
    }
    let url = format!("{FABRIC_META}/versions/loader/{game_version}");
    let response = reqwest::get(url).await
        .map_err(|e| format!("Could not reach Fabric metadata: {e}"))?;
    if !response.status().is_success() {
        return Err(format!("Fabric metadata returned HTTP {}", response.status()));
    }
    let entries: Vec<Value> = response.json().await
        .map_err(|e| format!("Could not read Fabric loader versions: {e}"))?;
    Ok(entries.iter().filter_map(|entry| {
        let loader = &entry["loader"];
        Some(FabricLoaderVersion {
            version: loader["version"].as_str()?.to_string(),
            stable: loader["stable"].as_bool().unwrap_or(false),
        })
    }).collect())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            host_snapshot,
            minecraft_versions,
            fabric_game_versions,
            fabric_loader_versions
        ])
        .run(tauri::generate_context!())
        .expect("error while running ZENO CLIENT");
}


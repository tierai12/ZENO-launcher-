use serde::Serialize;
use sysinfo::System;

#[derive(Serialize)]
struct HostSnapshot {
    os: String,
    architecture: String,
    cpu_name: String,
    logical_cores: usize,
    total_memory_gib: f64,
}

#[tauri::command]
fn host_snapshot() -> HostSnapshot {
    let mut system = System::new_all();
    system.refresh_all();

    let cpu_name = system
        .cpus()
        .first()
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![host_snapshot])
        .run(tauri::generate_context!())
        .expect("error while running ZENO CLIENT");
}

fn main() {
    run();
}

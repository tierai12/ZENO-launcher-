# ZENO CLIENT — Desktop

The desktop application is being developed alongside the existing Android launcher in this repository. The Android project is intentionally preserved.

## Stack

- Tauri 2 + Rust backend
- React + TypeScript + Vite frontend
- SQLite will be introduced with the instance-management milestone
- Arctic Light and Arctic Midnight visual themes

## Current milestone: Desktop foundation

Implemented in this milestone:
- Tauri desktop project structure
- Arctic-themed React shell and navigation
- Persistent last-opened page
- Light / Midnight theme toggle
- Rust system snapshot command for OS, architecture, CPU and physical memory
- Clear separation between the desktop app and the existing Android project

Not implemented yet:
- Minecraft version installation or launching
- Java runtime discovery
- Independent game instances
- Mod marketplace or downloads
- Performance graphs or in-game measurements

These features will only be marked complete after real integration and testing.

## Prerequisites

Install Node.js (LTS), Rust, and the platform prerequisites listed in the [Tauri v2 setup guide](https://v2.tauri.app/start/prerequisites/).

## Run in development

```bash
cd desktop
npm install
npm run tauri dev
```

## Build

```bash
cd desktop
npm install
npm run tauri build
```

The first Rust build may take several minutes while dependencies compile.

# Feature #14: Data & Recovery Architecture

## Overview
Say Cheese (Pocket Booth) is built around a **100% client-side, privacy-first, local-first resilience architecture**. Users are completely protected from losing their photobooth creations, captured shots, custom collage configurations, or stamps due to accidental tab closures, browser refreshes, hardware interruptions, or unexpected crashes.

---

## Key Capabilities

### 1. Debounced Autosave & Immediate Checkpoints
- **Debounced Autosave (600ms):** Used during continuous high-frequency user interactions (e.g. adjusting spacing/padding sliders, dragging or resizing stamps/stickers, picking palette swatches).
- **Immediate Checkpoints (Synchronous):** Fired instantly on discrete lifecycle events:
  - Shutter capture of an individual photo.
  - Retake or deletion of a photo.
  - Reordering photos on the Photo Review Desk.
  - Switching application views (Booth ↔ Review ↔ Collage Studio).
- **Visual Status Badge:** `#autosaveBadge` in the application header provides real-time feedback with animated state indicators:
  - `.autosave-dot.saving` + "Saving..."
  - `.autosave-dot` + "Saved"
  - `.autosave-dot.error` + "Autosave paused"

### 2. Interrupted Session Recovery & Modal
- On application launch, `recoveryManager.detectInterruptedSession()` inspects local storage for unfinalized sessions.
- **Expiration Policy:** Sessions older than 24 hours are automatically retired and purged to prevent stale clutter.
- **Interactive Recovery Prompt (`#recoveryModal`):**
  - Displays session metrics: number of captured photos, time elapsed since last save, active collage layout, and chosen filter.
  - **Resume Session:** Instantly restores all photos, styling parameters, custom stamps, and redirects the user directly to where they left off.
  - **Discard & Start Fresh:** Cleanly purges the interrupted snapshot and begins a new booth session.

### 3. Non-Destructive Partial Data Recovery
- In the event of a storage corruption or malformed snapshot entry (e.g., one photo payload corrupted during sudden power loss), the engine salvages all valid photos instead of discarding the entire session.
- Broken layout and filter identifiers automatically fallback to safe defaults (`'vertical-strip'` and `'warm-vintage'`) without crashing.

### 4. Saved Local Projects Studio
- Users can save an unlimited number of photobooth projects locally in browser storage (`#projectsModal`).
- **Thumbnail Optimization:** Projects store a lightweight downsampled JPEG thumbnail (`0.6` quality) to minimize IndexedDB storage consumption.
- **Project Card Actions:**
  - **Open:** Loads the project into Collage Studio with full editability.
  - **Duplicate (📋):** Creates an independent clone with a unique identifier and appended name.
  - **Export (💾):** Generates an offline `.json` backup file.
  - **Delete (🗑️):** Permanently removes the project from the browser.

### 5. Project Backup Export & Safe Import
- **Portable JSON Archive:** Users can export their collages and photos to `.json` or `.saycheese` backup files for cross-device migration or long-term archiving.
- **Security & Validation Guardrails:**
  - Strict maximum file size limit (25MB).
  - Schema verification (`app: 'SayCheese'`, `schema: 'say_cheese_project_backup'`).
  - Strict photo data validation verifying `data:image/` or valid media URI before importing.

### 6. Multi-Tab Synchronization & Storage Health Diagnostics
- Listens to `storage` events across browser tabs to synchronize autosave state.
- Monitors storage quota and usage through `navigator.storage.estimate()` to proactively detect storage pressure.

---

## Data Structures

### Recovery Snapshot Schema (`DB_VERSION = 3`)
```json
{
  "id": "active_recovery",
  "version": 3,
  "state": "collage",
  "activeView": "collage",
  "photos": [
    {
      "id": "photo_1790458780308_0",
      "imageData": "data:image/jpeg;base64,...",
      "timestamp": 1790458780307,
      "retakeCount": 0
    }
  ],
  "photoCount": 4,
  "targetCount": 4,
  "funMode": "classic",
  "countdown": 3,
  "settings": {
    "layoutId": "vertical-strip",
    "filter": "warm-vintage",
    "spacing": 16,
    "padding": 24,
    "borderRadius": 0,
    "stampText": "SAY CHEESE",
    "stickers": []
  },
  "updatedAt": 1790458780308,
  "timestamp": 1790458780308
}
```

### Saved Project Record Schema
```json
{
  "id": "project_1790458850251_k8f9a",
  "name": "Summer Festival 2026",
  "photos": [...],
  "settings": {...},
  "collageSettings": {...},
  "thumbnail": "data:image/jpeg;base64,...",
  "funMode": "duo",
  "createdAt": 1790458850251,
  "updatedAt": 1790458850251
}
```

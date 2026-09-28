# Feature #15: Advanced Export Studio Architecture

## Overview
The **Export Studio** provides a centralized, privacy-first export pipeline for **Say Cheese (Pocket Booth)**. It enables users to output their photobooth strips and collages across static formats (**PNG**, **JPEG**, **WebP**) and animated formats (**GIF**, **WebM**, **MP4**) with custom resolution scaling, quality compression, transparent frame backgrounds, native device sharing, clipboard integration, batch downloads, and memory safeguards.

---

## Architecture & Modules

```text
Current Photobooth State (Photos, Layout, Stickers, Filters, Frame)
                                ↓
                 ExportManager (js/export/exportManager.js)
                                ↓
                ExportRenderer (js/export/exportRenderer.js)
               (Scales canvas, renders slots, stickers, filters)
                                ↓
             Format Encoders (Static / GIF / VideoExporter)
                                ↓
                              Blob
                                ↓
        ┌───────────────────────┼───────────────────────┐
        ↓                       ↓                       ↓
 DownloadManager           ShareManager             Clipboard
(showSaveFilePicker     (Web Share API with    (navigator.clipboard
  or <a> download)        native file sheet)        ClipboardItem)
```

### Key Modules

1. **[`exportFormats.js`](file:///home/sonali-duvesh/Documents/Small%20Projects/Say%20Cheese/js/export/exportFormats.js)**:
   - Defines format capabilities: `PNG` (lossless, transparent), `JPEG` (compact, lossy), `WebP` (modern, transparent), `GIF` (animated loop), `WebM` & `MP4` (video streams).
   - Defines resolution scaling tiers: `Standard (0.75×)`, `Original (1.0×)`, `High (1.5×)`, `Ultra (2.0× / 300 DPI)`, and `Custom`.
   - Defines one-click presets: `⚡ Quick Share`, `✨ High Quality`, `🌐 Web / Social`, `🖨️ Print Ready`.
   - Feature detection: `ExportCapabilityDetector` checks for WebP, WebM, MP4, ClipboardItem, Web Share, and File System Access support.
   - Size estimation: Non-destructive algorithm calculating expected file size in megabytes before rendering.

2. **[`exportRenderer.js`](file:///home/sonali-duvesh/Documents/Small%20Projects/Say%20Cheese/js/export/exportRenderer.js)**:
   - High-fidelity canvas renderer rendering compositions at arbitrary dimensions without distortion or pixel stretching.
   - Respects slot cover-crop geometry, transforms (zoom, pan, rotation, flip, slot filters), global filters, frame styling (35mm film sprockets, vintage borders, rounded corners), typography, and sticker compositing with animation time offset `t`.
   - Supports transparent frame backgrounds for PNG and WebP.
   - Supports isolated single-photo rendering with active filter CSS for batch exports.

3. **[`downloadManager.js`](file:///home/sonali-duvesh/Documents/Small%20Projects/Say%20Cheese/js/export/downloadManager.js)**:
   - Filename sanitization removing illegal filesystem characters (`/\:*?"<>|`), truncating excessively long names, and preventing double-extension errors.
   - Modern File System Access API (`showSaveFilePicker`) support on desktop browsers with automatic fallback to standard managed object URL downloads.

4. **[`shareManager.js`](file:///home/sonali-duvesh/Documents/Small%20Projects/Say%20Cheese/js/export/shareManager.js)**:
   - Web Share API helper validating file sharing capabilities before opening the native mobile or desktop share sheet.

5. **[`exportManager.js`](file:///home/sonali-duvesh/Documents/Small%20Projects/Say%20Cheese/js/export/exportManager.js)**:
   - Master coordinator orchestrating progress reporting (`'preparing'`, `'rendering'`, `'applying_effects'`, `'encoding'`, `'finalizing'`, `'complete'`), cancellation tokens, memory safeguards (> 16 Megapixels), batch downloads, and localStorage preference persistence.

---

## User Features & Controls

- **One-Click Presets**:
  - `⚡ Quick Share`: Standard resolution (0.75×), 80% quality WebP/JPEG for instant messaging.
  - `✨ High Quality`: High resolution (1.5×), lossless PNG for retina screens.
  - `🌐 Web / Social`: High resolution, 88% JPEG for social feeds.
  - `🖨️ Print Ready`: Ultra resolution (2.0×), 300 DPI intent for sharp physical prints.
- **Custom Dimensions**:
  - Exact width & height pixel inputs with interactive aspect ratio lock (`🔒 Lock Ratio`).
- **Compression & Transparency**:
  - Quality slider (30% to 100%) for lossy formats with size estimation.
  - Checkbox for transparent frame backgrounds in PNG / WebP.
- **Animation Controls**:
  - FPS selection (6, 10, 15 FPS) and duration selection (1.5s, 2.5s, 4.0s) for animated GIF and video clips.
- **Batch Export**:
  - Content scope toggle: `Collage Print` vs `All Individual Photos`.
- **Keyboard Shortcut**:
  - Press `Ctrl+E` or `Cmd+E` anywhere in the Collage Studio to open Export Studio.

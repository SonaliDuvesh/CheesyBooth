# Say Cheese - Privacy Architecture & Security Guide (Feature #13)

## 1. Core Privacy Philosophy

**Say Cheese (Pocket Booth)** is built from the ground up on a **client-side, local-first, zero-telemetry architecture**:

```
Camera Hardware
      ↓ (Explicit User Consent)
Browser Memory (Canvas & WebGL Processing)
      ↓ (Local Image Encoding)
Local Device Storage (IndexedDB / LocalStorage)
      ↓ (Explicit User Action)
Local Export / Web Share
```

* **Zero Cloud Uploads:** Photos captured in the photobooth are never sent to external servers or cloud storage.
* **No User Accounts:** No sign-in, authentication, passwords, or personal data collection.
* **No Analytics or Trackers:** Zero tracking pixels, analytics scripts, or background beacons.
* **Camera Privacy:** Media stream tracks are acquired only after explicit user intent and are stopped when leaving the booth or backgrounding the tab.

---

## 2. Camera Stream Lifecycle & Consent Flow

### 2.1 Explicit Permission Request Flow
Camera access is **never** requested automatically upon page load.
1. When opening the app, the viewfinder displays the **Camera Consent & Privacy Card**:
   > *"Say Cheese uses your camera to take photos. All images and analog filters are processed entirely in your browser. Your photos are never uploaded to any server."*
2. The user can either click:
   * **✨ Allow Camera** - Calls `navigator.mediaDevices.getUserMedia({ video: ..., audio: false })`
   * **🎬 Try Demo Preview** - Activates a client-side simulated photobooth avatar loop with zero hardware requirements.

### 2.2 Strict Video-Only Constraints
Say Cheese requests video only:
```js
const constraints = {
  video: { facingMode: { ideal: 'user' }, width: { ideal: 1920, min: 640 }, height: { ideal: 1440, min: 480 } },
  audio: false // Never requests microphone access
};
```
Web Audio sounds are synthesized purely client-side via oscillator nodes and require no audio input.

### 2.3 Hardware Stream Teardown & View Protection
To ensure hardware camera activity indicators turn off when not in use:
* **View Switching:** Navigating to `Review Desk` or `Collage Studio` calls `cameraManager.pauseCamera()`, stopping all hardware tracks. Returning to `Booth` calls `cameraManager.resumeCamera()`.
* **Page Visibility Change (`visibilitychange`):** Switching tabs or minimizing the browser immediately halts active video streams.
* **Camera Switching:** Flips release existing hardware tracks before requesting a new stream.

---

## 3. Local Data Management & Granular Deletion

All persistent data is managed through [`js/storage/storageManager.js`](file:///home/sonali-duvesh/Documents/Small%20Projects/Say%20Cheese/js/storage/storageManager.js) and [`js/privacy/privacyManager.js`](file:///home/sonali-duvesh/Documents/Small%20Projects/Say%20Cheese/js/privacy/privacyManager.js).

### 3.1 Data Categories
| Category | Storage Target | Description |
| :--- | :--- | :--- |
| **Captured Photos** | Browser `IndexedDB` (`PocketBoothDB` / `saved_sessions`) | JPEG compressed frame data (`0.92` quality). |
| **Saved Collages** | Browser `IndexedDB` (`PocketBoothDB` / `saved_collages`) | Custom layout arrangements & memory print drafts. |
| **Preferences & Theme** | `localStorage` (`say_cheese_preferences_v1`) | Booth title, theme, sound settings, favorites. |
| **Memory Fallback** | `Map` In-Memory Store | Used seamlessly if IndexedDB is blocked in private browsing. |

### 3.2 Granular Deletion Controls
Available under **Customize Booth → 🔒 Privacy & Data**:
1. **🗑️ Delete Stored Photos:** Wipes captured photo sessions from IndexedDB while preserving collages and settings.
2. **🗑️ Delete Saved Collages:** Wipes saved collage prints while preserving photos and settings.
3. **↺ Reset Preferences:** Restores factory default settings without modifying photos or collages.
4. **⚠️ Clear All Say Cheese Data:** Executes a complete local wipe across IndexedDB, LocalStorage, and revokes all active object URLs.

### 3.3 Managed Object URL Lifecycle
All created object URLs (`URL.createObjectURL`) are registered in a managed tracking set and explicitly revoked (`URL.revokeObjectURL`) upon replacement, modal dismissal, or data clearing to avoid memory leaks.

---

## 4. Security Policies & File Validation

### 4.1 Content Security Policy (CSP) & Permissions Policy
Configured in [`index.html`](file:///home/sonali-duvesh/Documents/Small%20Projects/Say%20Cheese/index.html):
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' blob: data: https: http:; media-src 'self' blob: data:; connect-src 'self' blob: data:;" />
<meta name="referrer" content="no-referrer" />
<meta http-equiv="Permissions-Policy" content="camera=(self), microphone=(), geolocation=()" />
```

### 4.2 Local File Upload Validation
Custom sticker and image uploads undergo strict multi-stage verification:
* **MIME Types:** Restricted to `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
* **File Extensions:** Verified against `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`.
* **Size Bounds:** Max 10MB for static images, max 15MB for animated GIFs.
* **Bitmap Dimension Verification:** Decoded via temporary `Image` objects; images exceeding 4096px dimension or failing pixel decoding are safely rejected with friendly feedback.

### 4.3 EXIF Metadata Stripping
When photos are captured, filtered, and exported, HTML5 Canvas 2D re-encoding (`canvas.toDataURL` / `canvas.toBlob`) creates a new pixel stream, naturally stripping all device EXIF metadata (such as GPS coordinates and hardware serial numbers) prior to user download or sharing.

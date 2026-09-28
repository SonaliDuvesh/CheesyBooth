# Security & Privacy Architecture - Say Cheese

## 1. Security Overview
**Say Cheese** is a privacy-first, client-side photobooth and collage web application. All photo capture, analog filter processing, sticker composition, and collage assembly occur **entirely on the user's device** using HTML5 Canvas and IndexedDB.

---

## 2. Core Trust Boundaries

| Source | Trust Level | Validation & Protection Strategy |
| :--- | :--- | :--- |
| **Local Camera Stream** | Trusted | Explicit user permission required; stream stopped upon session end. |
| **User File Uploads** | Untrusted | Validated for size (max 15MB), MIME type, magic signatures, and decoded pixel bounds ($\le$ 36MP). |
| **Remote URLs (Stickers/GIFs)** | Untrusted | Protocol allowlist (`https:`, `blob:`, `data:image/*`), max length (2048 chars), timeout limits (15s), dimension validation. |
| **Imported JSON Backups** | Untrusted | Max size limit (10MB), schema validation, prototype pollution guards (`__proto__`, `constructor`, `prototype` filtered). |
| **AI Responses** | Untrusted | Sanitized plain text, allowlisted registry IDs (`themeId`, `filterId`, `layoutId`), character limits. |
| **Pasted Clipboard Text** | Untrusted | Stripped of HTML tags and control characters via `sanitizeText()`. |

---

## 3. Resource & Anti-Abuse Limits

Centralized in [`js/security/securityLimits.js`](file:///home/sonali-duvesh/Documents/Small%20Projects/Say%20Cheese/js/security/securityLimits.js):
- **Max Image Size:** 15 MB
- **Max GIF Size:** 25 MB
- **Max Import Size:** 10 MB
- **Max Decoded Dimension:** 8,192 px
- **Max Decoded Pixels:** 36 Megapixels *(Decompression/Image Bomb Protection)*
- **Max Canvas Allocation:** 25 Megapixels
- **Max GIF Frames:** 120 frames
- **Max Active Stickers:** 60 layers
- **Max Text Length:** 120 characters

---

## 4. Anti-XSS & Sanitization Architecture

1. **Text Content Enforcement:** Text rendering uses `textContent` or strict sanitization (`sanitizeText`) that strips HTML tags, control characters, and escapes entities.
2. **Prototype Pollution Protection:** Deep clones and merges use `safeDeepClone()` and `safeAssign()`, dropping `__proto__`, `constructor`, and `prototype`.
3. **CSS Color Safety:** Custom frame colors pass through `sanitizeColor()`, rejecting `url()`, `expression()`, or CSS script injection.
4. **Filename Sanitization:** Downloads use `sanitizeFilename()`, stripping directory traversal (`../`), control characters, and OS-reserved device names.

---

## 5. Storage & Privacy Model

- **Zero Secret Exposure:** No API keys, passwords, or tokens are committed or stored in client-side code, LocalStorage, or IndexedDB.
- **Photo Isolation:** Captured photos and exported collages are stored in IndexedDB and are never cached by the Service Worker or transmitted to remote servers.
- **Object URL Lifecycle:** All `URL.createObjectURL` instances are tracked by `securityManager` and revoked deterministically upon unmount or error.

---

## 6. Content Security Policy (CSP)

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' blob: data: https: http:; media-src 'self' blob: data:; connect-src 'self' blob: data:;
```

---

## 7. Reporting Vulnerabilities
If you identify a security vulnerability in Say Cheese, please report it privately via project maintainer communication channels rather than creating public issue trackers.

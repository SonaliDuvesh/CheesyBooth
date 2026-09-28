# Say Cheese - Accessibility (a11y) Guide

This document outlines the accessibility architecture, keyboard interaction model, screen reader integration, canvas alternatives, and reduced-motion strategies in Say Cheese.

---

## 1. Semantic Structure & Landmarks

The application follows an accessible document landmark outline:

- **Skip Navigation**: Accessible via keyboard `Tab` on initial entry (`.skip-link`) pointing to `#mainContent`.
- **Landmark Elements**:
  - `<header class="app-header">`: Main logo, status meter, keyboard shortcuts, preferences, camera switch.
  - `<main id="mainContent" class="app-wrapper">`: Primary application stage.
  - `<section id="boothSection">`: Live photobooth camera station.
  - `<section id="reviewSection">`: Photo review and reordering station.
  - `<section id="collageSection">`: Customization and print builder studio.
- **Heading Hierarchy**: Clean sequential heading tags (`<h1>` to `<h3>`) without skipped levels.

---

## 2. Keyboard Navigation & Shortcuts

Keyboard interaction is managed centrally via [`js/accessibility/keyboardManager.js`](file:///home/sonali-duvesh/Documents/Small%20Projects/Say%20Cheese/js/accessibility/keyboardManager.js) with strict input context detection (`isTyping()` shields inputs):

| Key / Shortcut | Context | Action |
| --- | --- | --- |
| `Space` | Idle booth / countdown | Start booth / Capture snapshot immediately |
| `Escape` | Modal open / Canvas selected | Close active dialog / Deselect stamp |
| `?` (`Shift + /`) | Anywhere (non-typing) | Toggle Keyboard Shortcuts cheat sheet dialog |
| `Ctrl/Cmd + Z` | Anywhere | Undo last edit or action |
| `Ctrl/Cmd + Shift + Z` / `Ctrl + Y` | Anywhere | Redo last undone action |
| `Arrow Keys` | Selected sticker on canvas | Nudge stamp position ($1\text{--}2\text{px}$) |
| `Shift + Arrow Keys` | Selected sticker on canvas | Fast nudge stamp position ($10\text{px}$) |
| `R` | Selected sticker on canvas | Rotate stamp $+45^\circ$ |
| `Ctrl/Cmd + D` | Selected sticker on canvas | Duplicate stamp |
| `Ctrl/Cmd + ]` / `[` | Selected sticker on canvas | Bring stamp forward / Send backward |
| `Delete` / `Backspace` | Selected sticker on canvas | Safely delete stamp |

---

## 3. Screen Reader Live Announcements

A dedicated ARIA live region (`#a11yAnnouncer` with `aria-live="polite"` and `aria-atomic="true"`) announces state updates without overwhelming assistive technology:

- **Countdown & Captures**: `"Photo X of Y captured"`, `"Photo session complete"`.
- **Filters**: `"Filter applied: Warm Vintage"`.
- **Layouts & Framing**: `"Layout changed to 2x2"`.
- **Stamps**: `"Stamp added: 💖"`, `"Stamp position moved to 50%, 60%"`.
- **Modals**: `"Keyboard shortcuts help dialog opened"`.

---

## 4. Canvas & Gesture Alternatives

To avoid relying exclusively on visual canvas dragging:
- **Position & Rotation Steppers**: `#btnNudgeLeft`, `#btnNudgeRight`, `#btnNudgeUp`, `#btnNudgeDown`, `#btnRotatePreset` in the stamp inspector.
- **Layer Controls**: Front, Up, Down, Back buttons.
- **Photo Reordering**: Keyboard buttons and arrow shortcuts for moving prints left/right on the review desk.

---

## 5. Visual Contrast & Non-Color-Only Indicators

- Active color swatches, filter chips, and layout cards display a clear checkmark badge (`✓`) in addition to color highlighting.
- High-contrast `:focus-visible` rings ensure active elements stand out against dark, light, and textured surfaces.
- Text contrast ratios meet or exceed WCAG AA guidelines.

---

## 6. Motion & Animation Preferences

- Supports `@media (prefers-reduced-motion: reduce)`.
- Respects user-configurable motion modes (`full`, `reduced`, `none`) stored in `preferenceManager`, dynamically disabling animations and ambient floating shapes via `[data-motion="reduced"]` and `[data-motion="none"]`.

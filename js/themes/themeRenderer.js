
import { soundManager } from '../audio/soundManager.js';

export class ThemeRenderer {
  static applyTheme(theme, { appearance = 'light' } = {}) {
    if (!theme || typeof document === 'undefined') return;

    const root = document.documentElement;
    const isDark = appearance === 'dark' || (appearance === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.setAttribute('data-booth-theme', theme.id);

    const c = theme.colors;
    if (c) {
      if (!isDark) {
        root.style.setProperty('--bg-canvas', c.bgCanvas);
        root.style.setProperty('--bg-canvas-alt', c.bgCanvasAlt);
        root.style.setProperty('--surface-panel', c.surfacePanel);
        root.style.setProperty('--surface-panel-border', c.surfacePanelBorder);
        root.style.setProperty('--surface-card', c.surfaceCard);
        root.style.setProperty('--surface-well', c.surfaceWell);
        root.style.setProperty('--color-primary', c.colorPrimary);
        root.style.setProperty('--color-primary-hover', c.colorPrimaryHover);
        root.style.setProperty('--color-primary-active', c.colorPrimaryActive);
        root.style.setProperty('--color-primary-light', c.colorPrimaryLight);
        root.style.setProperty('--color-primary-glow', c.colorPrimaryGlow);
        root.style.setProperty('--color-charcoal', c.colorCharcoal);
        root.style.setProperty('--color-charcoal-muted', c.colorCharcoalMuted);
      } else {

        root.style.setProperty('--color-primary', c.colorPrimary);
        root.style.setProperty('--color-primary-hover', c.colorPrimaryHover);
        root.style.setProperty('--color-primary-active', c.colorPrimaryActive);
        root.style.setProperty('--color-primary-light', 'rgba(255, 255, 255, 0.1)');
        root.style.setProperty('--color-primary-glow', c.colorPrimaryGlow);
      }
    }

    if (theme.audio && theme.audio.soundStyle) {
      soundManager.setSoundStyle(theme.audio.soundStyle);
    }
  }
}

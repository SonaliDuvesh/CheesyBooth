
export class PerformanceManager {
  constructor() {
    this.mode = 'balanced'; 
    this.metrics = {
      startTime: typeof performance !== 'undefined' ? performance.now() : Date.now(),
      marks: new Map(),
      measures: new Map(),
      lastCollageRenderMs: 0,
      renderCount: 0,
      imageCacheHits: 0,
      imageCacheMisses: 0,
      filterCacheHits: 0,
      filterCacheMisses: 0,
    };

    this.capabilities = this._detectCapabilities();
    this._initModeFromPreferences();
    this._setupVisibilityListener();
  }

  _detectCapabilities() {
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    const deviceMemory = typeof navigator !== 'undefined' && navigator.deviceMemory ? navigator.deviceMemory : 4;
    const hardwareConcurrency = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4;
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isConstrained = deviceMemory <= 2 || (isMobile && dpr > 2.5);

    return {
      isMobile,
      dpr,
      deviceMemory,
      hardwareConcurrency,
      prefersReducedMotion,
      isConstrained,
      supportsImageBitmap: typeof createImageBitmap === 'function',
      supportsOffscreenCanvas: typeof OffscreenCanvas === 'function',
    };
  }

  _initModeFromPreferences() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('say_cheese_perf_mode');
        if (saved && ['quality', 'balanced', 'battery-saver'].includes(saved)) {
          this.setMode(saved, false);
          return;
        }
      }
    } catch (e) {}

    if (this.capabilities.prefersReducedMotion || this.capabilities.deviceMemory <= 1) {
      this.setMode('battery-saver', false);
    } else {
      this.setMode('balanced', false);
    }
  }

  setMode(mode, persist = true) {
    if (!['quality', 'balanced', 'battery-saver'].includes(mode)) return;
    this.mode = mode;

    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.toggle('battery-saver', mode === 'battery-saver');
      document.body.classList.toggle('perf-quality', mode === 'quality');
      document.body.classList.toggle('perf-balanced', mode === 'balanced');
    }

    if (persist) {
      try {
        localStorage.setItem('say_cheese_perf_mode', mode);
      } catch (e) {}
    }
  }

  getMode() {
    return this.mode;
  }

  getSafePreviewDpr() {
    const dpr = this.capabilities.dpr;
    if (this.mode === 'quality') return Math.min(dpr, 2.5);
    if (this.mode === 'battery-saver') return 1.0;
    return Math.min(dpr, 1.75); 
  }

  getMaxPreviewDimension() {
    if (this.mode === 'battery-saver') return 900;
    if (this.mode === 'quality') return 1800;
    return 1400; 
  }

  mark(name) {
    if (typeof performance !== 'undefined' && performance.now) {
      this.metrics.marks.set(name, performance.now());
    }
  }

  measure(name, startMark) {
    if (typeof performance !== 'undefined' && performance.now) {
      const start = this.metrics.marks.get(startMark);
      if (start !== undefined) {
        const duration = performance.now() - start;
        this.metrics.measures.set(name, duration);
        return duration;
      }
    }
    return 0;
  }

  recordRenderTime(durationMs) {
    this.metrics.lastCollageRenderMs = durationMs;
    this.metrics.renderCount++;
  }

  recordImageHit() {
    this.metrics.imageCacheHits++;
  }

  recordImageMiss() {
    this.metrics.imageCacheMisses++;
  }

  recordFilterHit() {
    this.metrics.filterCacheHits++;
  }

  recordFilterMiss() {
    this.metrics.filterCacheMisses++;
  }

  _setupVisibilityListener() {
    if (typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
      const isHidden = document.hidden;
      document.body.classList.toggle('tab-hidden', isHidden);
    });
  }

  getDiagnostics() {
    return {
      mode: this.mode,
      capabilities: this.capabilities,
      metrics: {
        uptimeSec: Math.round((performance.now() - this.metrics.startTime) / 1000),
        lastCollageRenderMs: Math.round(this.metrics.lastCollageRenderMs * 10) / 10,
        renderCount: this.metrics.renderCount,
        imageCacheHits: this.metrics.imageCacheHits,
        imageCacheMisses: this.metrics.imageCacheMisses,
        filterCacheHits: this.metrics.filterCacheHits,
        filterCacheMisses: this.metrics.filterCacheMisses,
      },
      measures: Object.fromEntries(this.metrics.measures.entries()),
    };
  }
}

export const performanceManager = new PerformanceManager();

if (typeof window !== 'undefined') {
  window.__sayCheesePerf = performanceManager;
}

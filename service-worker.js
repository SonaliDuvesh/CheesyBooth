const CACHE_VERSION = 'say-cheese-shell-v13';
const PRECACHE_ASSETS = [
  './',
  'index.html',
  'offline.html',
  'manifest.webmanifest',
  'css/variables.css',
  'css/components.css',
  'css/booth.css',
  'css/review.css',
  'css/collage.css',
  'css/export.css',
  'css/print.css',
  'css/modes.css',
  'css/personalization.css',
  'css/randomizer.css',
  'css/mobile.css',
  'css/accessibility.css',
  'css/privacy.css',
  'css/recovery.css',
  'css/background.css',
  'js/app.js',
  'js/security/securityLimits.js',
  'js/security/sanitizer.js',
  'js/security/inputValidator.js',
  'js/security/securityManager.js',
  'js/ai/aiManager.js',
  'js/ai/aiProvider.js',
  'js/ai/aiPrompts.js',
  'js/ai/aiSettings.js',
  'js/ai/localAiFallback.js',
  'js/ai/aiUI.js',
  'js/compatibility/browserSupport.js',
  'js/ui/feedbackManager.js',
  'js/easterEggs/easterEggManager.js',
  'js/easterEggs/easterEggRegistry.js',
  'js/easterEggs/easterEggEffects.js',
  'js/statistics/statisticsManager.js',
  'js/statistics/statisticsModel.js',
  'js/statistics/statisticsRenderer.js',
  'js/themes/themeManager.js',
  'js/themes/themeRegistry.js',
  'js/themes/themeRenderer.js',
  'js/audio/soundManager.js',
  'js/camera/cameraManager.js',
  'js/photos/photoManager.js',
  'js/session/sessionManager.js',
  'js/collage/collageRenderer.js',
  'js/collage/layouts.js',
  'js/filters/filterPresets.js',
  'js/stickers/stickerLibrary.js',
  'js/storage/storageManager.js',
  'js/history/historyManager.js',
  'js/preferences/preferenceManager.js',
  'js/modes/funModes.js',
  'js/randomizer/randomizer.js',
  'js/mobile/mobileManager.js',
  'js/accessibility/keyboardManager.js',
  'js/privacy/privacyManager.js',
  'js/recovery/recoveryManager.js',
  'js/performance/performanceManager.js',
  'js/performance/imageCache.js',
  'js/performance/filterCache.js',
  'js/errors/errorManager.js',
  'js/errors/errorTypes.js',
  'js/errors/errorMessages.js',
  'js/export/exportManager.js',
  'js/export/exportRenderer.js',
  'js/export/exportFormats.js',
  'js/export/downloadManager.js',
  'js/export/shareManager.js',
  'js/export/gifDecoder.js',
  'js/export/gifEncoder.js',
  'js/export/videoExporter.js',
  'js/print/printManager.js',
  'js/print/printRenderer.js',
  'js/print/printPresets.js',
  'js/print/printSettings.js',
  'js/pwa/pwaManager.js',
  'js/pwa/installManager.js',
  'js/pwa/updateManager.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable.png',
  'icons/apple-touch-icon.png',
  'icons/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('PWA Precache partial item notice:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key.startsWith('say-cheese-') && key !== CACHE_VERSION) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (url.protocol.startsWith('chrome-extension') || url.protocol.startsWith('blob:') || url.protocol.startsWith('data:')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => {
        return caches.match(req).then((cachedResp) => {
          if (cachedResp) return cachedResp;
          return caches.match('./').then((rootResp) => {
            if (rootResp) return rootResp;
            return caches.match('offline.html');
          });
        });
      })
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        const fetchPromise = fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        if (resp && resp.status === 200) {
          const respClone = resp.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(req, respClone);
          });
        }
        return resp;
      }).catch(() => null);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

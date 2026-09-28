
class MobileManager {
  constructor() {
    this.isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0));
    this.supportsHaptics = typeof navigator !== 'undefined' && Boolean(navigator.vibrate);
    this.supportsWebShare = typeof navigator !== 'undefined' && Boolean(navigator.share);
    this.lastShutterTriggerTime = 0;
  }

  vibrate(pattern = 15) {
    if (!this.supportsHaptics) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {

    }
  }

  hapticTap() {
    this.vibrate(12);
  }

  hapticCountdownTick() {
    this.vibrate(20);
  }

  hapticShutterSnap() {
    this.vibrate([40, 30, 40]);
  }

  hapticSuccess() {
    this.vibrate([30, 50, 60]);
  }

  hapticError() {
    this.vibrate([50, 100, 50]);
  }

  async sharePhotoOrCollage(dataUrlOrBlob, title = 'Say Cheese Photo Strip', text = 'Snapped in Say Cheese Photobooth ✨') {
    if (!this.supportsWebShare) {
      return { success: false, reason: 'unsupported' };
    }

    try {
      let file;
      if (typeof dataUrlOrBlob === 'string' && dataUrlOrBlob.startsWith('data:')) {
        const res = await fetch(dataUrlOrBlob);
        const blob = await res.blob();
        file = new File([blob], 'say-cheese-print.png', { type: blob.type || 'image/png' });
      } else if (dataUrlOrBlob instanceof Blob) {
        file = new File([dataUrlOrBlob], 'say-cheese-print.png', { type: dataUrlOrBlob.type || 'image/png' });
      }

      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text,
        });
        return { success: true };
      } else {
        await navigator.share({
          title,
          text,
          url: window.location.href,
        });
        return { success: true };
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, reason: 'cancelled' };
      }
      console.warn('Native share failed:', err);
      return { success: false, error: err };
    }
  }

  canTriggerShutter(cooldownMs = 600) {
    const now = Date.now();
    if (now - this.lastShutterTriggerTime < cooldownMs) {
      return false;
    }
    this.lastShutterTriggerTime = now;
    return true;
  }

  attachSwipe(element, { onSwipeLeft, onSwipeRight, threshold = 40 }) {
    if (!element) return () => {};

    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const elapsed = Date.now() - startTime;

      if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && elapsed < 600) {
        if (deltaX < 0 && typeof onSwipeLeft === 'function') {
          this.hapticTap();
          onSwipeLeft();
        } else if (deltaX > 0 && typeof onSwipeRight === 'function') {
          this.hapticTap();
          onSwipeRight();
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }

  createPinchRotateTracker(element, onGestureChange) {
    if (!element || typeof onGestureChange !== 'function') return () => {};

    let initialDist = 0;
    let initialAngle = 0;
    let isGesturing = false;

    const getDistance = (t1, t2) => Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    const getAngle = (t1, t2) => Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        isGesturing = true;
        initialDist = getDistance(e.touches[0], e.touches[1]);
        initialAngle = getAngle(e.touches[0], e.touches[1]);
      }
    };

    const handleTouchMove = (e) => {
      if (!isGesturing || e.touches.length !== 2) return;
      const currentDist = getDistance(e.touches[0], e.touches[1]);
      const currentAngle = getAngle(e.touches[0], e.touches[1]);

      const scaleMultiplier = initialDist > 0 ? currentDist / initialDist : 1;
      const rotationDelta = currentAngle - initialAngle;

      onGestureChange({
        scaleMultiplier,
        rotationDelta,
        center: {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        },
      });

      initialDist = currentDist;
      initialAngle = currentAngle;
    };

    const handleTouchEnd = () => {
      isGesturing = false;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }
}

export const mobileManager = new MobileManager();

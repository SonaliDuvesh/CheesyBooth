import { errorManager } from '../errors/errorManager.js';
import { ErrorCategory } from '../errors/errorTypes.js';
import { browserSupport } from '../compatibility/browserSupport.js';

export class CameraManager {
  constructor(videoElement) {
    this.videoElement = videoElement;
    this.stream = null;
    this.facingMode = 'user'; 
    this.isCameraActive = false;
    this.hasPermission = false;
    this.isSimulated = false;
    this.isPaused = false;
    this.isCapturing = false;
    this.permissionState = 'prompt'; 
    this.zoomLevel = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.animationFrameId = null;
    this.onStatusChange = null;

    if (this.videoElement && typeof this.videoElement.setAttribute === 'function') {
      this.videoElement.setAttribute('playsinline', '');
      this.videoElement.setAttribute('autoplay', '');
      this.videoElement.muted = true;
    }
  }

  _applyLiveTransform() {
    if (!this.videoElement || !this.videoElement.style) return;
    const zoom = this.zoomLevel || 1.0;
    const flip = (this.facingMode === 'user' && !this.videoElement.classList?.contains('unmirrored')) ? -1 : 1;

    if (typeof this.videoElement.style.setProperty === 'function') {
      this.videoElement.style.setProperty('--camera-zoom', zoom);
      this.videoElement.style.setProperty('--camera-pan-x', `${((this.panX || 0) * 100).toFixed(1)}%`);
      this.videoElement.style.setProperty('--camera-pan-y', `${((this.panY || 0) * 100).toFixed(1)}%`);
    }

    if (zoom <= 1.0) {
      this.panX = 0;
      this.panY = 0;
      this.videoElement.style.transform = `scaleX(${flip}) scale(1)`;
    } else {
      const maxInnerPercent = (1 - 1 / zoom) * 50;
      const innerX = (flip * (this.panX || 0) * maxInnerPercent).toFixed(3);
      const innerY = ((this.panY || 0) * maxInnerPercent).toFixed(3);
      this.videoElement.style.transform = `scaleX(${flip}) scale(${zoom}) translate(${innerX}%, ${innerY}%)`;
    }

    const wrapper = (this.videoElement.closest && typeof this.videoElement.closest === 'function')
      ? this.videoElement.closest('.viewfinder-wrapper')
      : null;
    if (wrapper) {
      if (typeof wrapper.style?.setProperty === 'function') {
        wrapper.style.setProperty('--camera-zoom', zoom);
      }
      if (wrapper.classList) {
        wrapper.classList.toggle('is-zoomed', zoom > 1.0);
        wrapper.classList.toggle('is-panned', (this.panX !== 0 || this.panY !== 0));
      }
    }
  }

  setZoom(level) {
    const clamped = Math.min(Math.max(Math.round(level * 10) / 10, 1.0), 3.0);
    this.zoomLevel = clamped;
    if (clamped <= 1.0) {
      this.panX = 0;
      this.panY = 0;
    }
    this._applyLiveTransform();

    if (this.stream) {
      const tracks = this.stream.getVideoTracks ? this.stream.getVideoTracks() : null;
      if (tracks && tracks[0] && typeof tracks[0].getCapabilities === 'function') {
        const caps = tracks[0].getCapabilities();
        if (caps.zoom) {
          const hwZoom = Math.min(Math.max(clamped, caps.zoom.min || 1), caps.zoom.max || 3);
          tracks[0].applyConstraints({ advanced: [{ zoom: hwZoom }] }).catch(() => {});
        }
      }
    }
    return this.zoomLevel;
  }

  setPan(panX, panY) {
    if (this.zoomLevel <= 1.0) {
      this.panX = 0;
      this.panY = 0;
    } else {
      this.panX = Math.min(Math.max(Number(panX) || 0, -1.0), 1.0);
      this.panY = Math.min(Math.max(Number(panY) || 0, -1.0), 1.0);
    }
    this._applyLiveTransform();
    return { panX: this.panX, panY: this.panY };
  }

  panByPixels(dx, dy, containerWidth = 600, containerHeight = 400) {
    if (this.zoomLevel <= 1.0) return { panX: 0, panY: 0 };
    const maxPxX = (Math.max(containerWidth, 100) * (this.zoomLevel - 1)) / 2;
    const maxPxY = (Math.max(containerHeight, 100) * (this.zoomLevel - 1)) / 2;

    const curPanX = this.panX || 0;
    const curPanY = this.panY || 0;

    const nextPanX = maxPxX > 0 ? curPanX + (dx / maxPxX) : 0;
    const nextPanY = maxPxY > 0 ? curPanY + (dy / maxPxY) : 0;

    return this.setPan(nextPanX, nextPanY);
  }

  resetPan() {
    this.panX = 0;
    this.panY = 0;
    this._applyLiveTransform();
    return { panX: 0, panY: 0 };
  }

  getPan() {
    return { panX: this.panX || 0, panY: this.panY || 0 };
  }

  zoomIn(step = 0.2) {
    return this.setZoom((this.zoomLevel || 1.0) + step);
  }

  zoomOut(step = 0.2) {
    return this.setZoom((this.zoomLevel || 1.0) - step);
  }

  getZoom() {
    return this.zoomLevel || 1.0;
  }

  async startCamera(options = {}) {
    this.stopCamera();
    this.isPaused = false;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.permissionState = 'simulated';
      return this._startSimulatedCamera('Camera API is not supported in this browser environment');
    }

    try {

      const constraintLevels = [

        {
          video: {
            facingMode: { ideal: this.facingMode },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1440, min: 480 },
          },
          audio: false,
        },

        {
          video: {
            facingMode: { ideal: this.facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        },

        {
          video: { facingMode: this.facingMode },
          audio: false,
        },

        {
          video: true,
          audio: false,
        },
      ];

      const streamPromise = (async () => {
        let lastError = null;
        for (const constraints of constraintLevels) {
          try {
            return await navigator.mediaDevices.getUserMedia(constraints);
          } catch (err) {
            lastError = err;

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              throw err;
            }
          }
        }
        throw lastError || new Error('Unable to initialize camera with available constraints.');
      })();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Camera initialization timed out. Another app may be using the camera.')), 12000);
      });

      this.stream = await Promise.race([streamPromise, timeoutPromise]);

      const videoTracks = this.stream.getVideoTracks();
      if (videoTracks && videoTracks.length > 0) {
        videoTracks[0].onended = () => {
          this._handleStreamEnded();
        };
      }

      this.videoElement.srcObject = this.stream;
      try {
        await this.videoElement.play();
      } catch (playErr) {

        console.warn('Camera video autoplay notice:', playErr);
      }

      this.isCameraActive = true;
      this.hasPermission = true;
      this.isSimulated = false;
      this.permissionState = 'granted';

      browserSupport.requestWakeLock();

      if (this.facingMode === 'user') {
        this.videoElement.classList.remove('unmirrored');
      } else {
        this.videoElement.classList.add('unmirrored');
      }

      if (this.onStatusChange) {
        this.onStatusChange({ status: 'active', isSimulated: false, permissionState: 'granted' });
      }

      return true;
    } catch (err) {
      this.hasPermission = false;
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      this.permissionState = isDenied ? 'denied' : 'simulated';

      const appError = errorManager.handle(err, {
        operation: 'camera_start',
        category: isDenied ? ErrorCategory.PERMISSION : ErrorCategory.CAMERA,
        action: () => this.startCamera(),
      });

      if (this.onStatusChange) {
        this.onStatusChange({
          status: isDenied ? 'denied' : 'error',
          reason: appError.userMessage,
          isSimulated: !isDenied,
          permissionState: this.permissionState,
        });
      }

      if (!isDenied) {
        return this._startSimulatedCamera(appError.userMessage);
      }

      return false;
    }
  }

  _handleStreamEnded() {
    this.isCameraActive = false;
    this.stopCamera();
    errorManager.handle(new Error('Camera stream was closed by device or operating system.'), {
      operation: 'camera_disconnect',
      category: ErrorCategory.CAMERA,
      action: () => this.startCamera(),
    });
    if (this.onStatusChange) {
      this.onStatusChange({
        status: 'error',
        reason: 'Camera connection was closed. Tap to reconnect or use Demo Mode.',
        isSimulated: false,
        permissionState: this.permissionState,
      });
    }
  }

  async switchCamera() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    this.stopCamera();
    if (this.isSimulated) {
      return this._startSimulatedCamera('Switched to simulated mode');
    }
    return await this.startCamera();
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {

        }
      });
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    if (this.animationFrameId) {
      if (typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.animationFrameId = null;
    }
    this.isCameraActive = false;
    browserSupport.releaseWakeLock();
  }

  pauseCamera() {
    if (!this.isCameraActive && !this.isSimulated) return;
    this.isPaused = true;
    this.stopCamera();
    if (this.onStatusChange) {
      this.onStatusChange({ status: 'paused', isSimulated: this.isSimulated, permissionState: this.permissionState });
    }
  }

  async resumeCamera() {
    if (!this.isPaused) return;
    this.isPaused = false;
    if (this.isSimulated) {
      return this._startSimulatedCamera('Resumed preview');
    }
    if (this.hasPermission || this.permissionState === 'granted') {
      return await this.startCamera();
    }
  }

  startDemoMode() {
    this.stopCamera();
    this.permissionState = 'simulated';
    return this._startSimulatedCamera('Demo mode selected');
  }

  captureFrame() {
    try {
      const canvas = document.createElement('canvas');
      let width, height;

      if (this.isSimulated || !this.videoElement || !this.videoElement.videoWidth) {
        width = 1200;
        height = 960;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        this._drawSimulatedScene(ctx, width, height, performance.now() / 1000);
      } else {
        width = this.videoElement.videoWidth || 1200;
        height = this.videoElement.videoHeight || 960;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (this.facingMode === 'user') {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }

        const zoom = this.zoomLevel || 1.0;
        if (zoom > 1.0) {
          const cropW = width / zoom;
          const cropH = height / zoom;
          const maxOffsetX = (width - cropW) / 2;
          const maxOffsetY = (height - cropH) / 2;
          const panX = this.panX || 0;
          const panY = this.panY || 0;
          const cropX = Math.max(0, Math.min(width - cropW, maxOffsetX * (1 - panX)));
          const cropY = Math.max(0, Math.min(height - cropH, maxOffsetY * (1 - panY)));
          ctx.drawImage(this.videoElement, cropX, cropY, cropW, cropH, 0, 0, width, height);
        } else {
          ctx.drawImage(this.videoElement, 0, 0, width, height);
        }
      }

      const imageData = canvas.toDataURL('image/jpeg', 0.92);

      canvas.width = 1;
      canvas.height = 1;

      return {
        imageData,
        width,
        height,
        timestamp: Date.now(),
      };
    } catch (err) {
      errorManager.handle(err, {
        operation: 'camera_capture_frame',
        category: ErrorCategory.CAMERA,
      });

      const emergencyCanvas = document.createElement('canvas');
      emergencyCanvas.width = 800;
      emergencyCanvas.height = 600;
      const eCtx = emergencyCanvas.getContext('2d');
      this._drawSimulatedScene(eCtx, 800, 600, performance.now() / 1000);
      return {
        imageData: emergencyCanvas.toDataURL('image/jpeg', 0.85),
        width: 800,
        height: 600,
        timestamp: Date.now(),
      };
    }
  }

  _startSimulatedCamera(reason) {
    this.isSimulated = true;
    this.isCameraActive = true;
    this.permissionState = 'simulated';

    const simCanvas = document.createElement('canvas');
    simCanvas.width = 800;
    simCanvas.height = 600;
    const ctx = simCanvas.getContext('2d');

    const renderLoop = (time) => {
      this._drawSimulatedScene(ctx, simCanvas.width, simCanvas.height, time / 1000);
      if (typeof requestAnimationFrame !== 'undefined') {
        this.animationFrameId = requestAnimationFrame(renderLoop);
      }
    };
    if (typeof requestAnimationFrame !== 'undefined') {
      this.animationFrameId = requestAnimationFrame(renderLoop);
    }

    try {
      if (simCanvas.captureStream && this.videoElement) {
        this.stream = simCanvas.captureStream(30);
        this.videoElement.srcObject = this.stream;
        this.videoElement.play().catch(() => {});
      }
    } catch (e) {

    }

    if (this.onStatusChange) {
      this.onStatusChange({ status: 'simulated', reason, isSimulated: true, permissionState: 'simulated' });
    }
    return true;
  }

  _drawSimulatedScene(ctx, width, height, t) {
    ctx.save();
    if (this.zoomLevel && this.zoomLevel > 1.0) {
      const zoom = this.zoomLevel;
      const maxShiftX = (width * (zoom - 1)) / 2;
      const maxShiftY = (height * (zoom - 1)) / 2;
      const visualShiftX = (this.panX || 0) * maxShiftX;
      const visualShiftY = (this.panY || 0) * maxShiftY;

      ctx.translate(width / 2 + visualShiftX, height / 2 + visualShiftY);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2, -height / 2);
    }

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#F5DFD7');
    grad.addColorStop(0.5, '#EAD9C8');
    grad.addColorStop(1, '#D8C3AE');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(200, 109, 81, 0.15)';
    ctx.beginPath();
    ctx.arc(width * 0.3 + Math.sin(t) * 30, height * 0.4 + Math.cos(t) * 20, 140, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(122, 130, 104, 0.18)';
    ctx.beginPath();
    ctx.arc(width * 0.7 + Math.cos(t * 0.8) * 30, height * 0.6 + Math.sin(t * 0.8) * 20, 160, 0, Math.PI * 2);
    ctx.fill();

    const cx = width / 2;
    const cy = height / 2 + 20 + Math.sin(t * 2) * 8;

    ctx.fillStyle = '#C86D51';
    ctx.beginPath();
    if (typeof ctx.ellipse === 'function') {
      ctx.ellipse(cx, cy + 130, 90, 80, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(cx, cy + 130, 85, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.fillStyle = '#FAF0E6';
    ctx.beginPath();
    ctx.arc(cx, cy, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#292724';
    ctx.stroke();

    ctx.fillStyle = 'rgba(235, 120, 100, 0.4)';
    ctx.beginPath();
    ctx.arc(cx - 36, cy + 12, 14, 0, Math.PI * 2);
    ctx.arc(cx + 36, cy + 12, 14, 0, Math.PI * 2);
    ctx.fill();

    const isBlinking = Math.sin(t * 3) > 0.96;
    ctx.fillStyle = '#292724';
    if (isBlinking) {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx - 24, cy - 4, 10, Math.PI * 0.1, Math.PI * 0.9);
      ctx.arc(cx + 24, cy - 4, 10, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(cx - 24, cy - 4, 6, 0, Math.PI * 2);
      ctx.arc(cx + 24, cy - 4, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy + 14, 18, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = 'rgba(41, 39, 36, 0.75)';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(cx - 140, 40, 280, 36, 18);
    } else if (typeof ctx.rect === 'function') {
      ctx.rect(cx - 140, 40, 280, 36);
    }
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✨ DEMO PREVIEW (READY TO SNAP) ✨', cx, 63);

    ctx.restore();
  }
}

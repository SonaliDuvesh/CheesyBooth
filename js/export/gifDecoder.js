
export class GIFDecoder {
  static async decodeGIF(dataUrlOrBlob) {
    let bytes = null;
    try {
      if (typeof dataUrlOrBlob === 'string') {
        if (dataUrlOrBlob.startsWith('data:')) {
          const base64Idx = dataUrlOrBlob.indexOf(';base64,');
          if (base64Idx !== -1) {
            const base64Str = dataUrlOrBlob.substring(base64Idx + 8);
            const binaryStr = atob(base64Str);
            const len = binaryStr.length;
            bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
            }
          } else {
            const res = await fetch(dataUrlOrBlob);
            const arrayBuffer = await res.arrayBuffer();
            bytes = new Uint8Array(arrayBuffer);
          }
        } else {
          const res = await fetch(dataUrlOrBlob);
          const arrayBuffer = await res.arrayBuffer();
          bytes = new Uint8Array(arrayBuffer);
        }
      } else if (dataUrlOrBlob instanceof Uint8Array) {
        bytes = dataUrlOrBlob;
      } else if (dataUrlOrBlob instanceof ArrayBuffer) {
        bytes = new Uint8Array(dataUrlOrBlob);
      } else if (typeof Blob !== 'undefined' && (dataUrlOrBlob instanceof Blob || dataUrlOrBlob instanceof File)) {
        const arrayBuffer = await dataUrlOrBlob.arrayBuffer();
        bytes = new Uint8Array(arrayBuffer);
      }
    } catch (err) {
      console.warn('Failed to load GIF buffer, falling back to Image element:', err);
    }

    if (!bytes || bytes.length < 14) {
      return this._fallbackImageFrame(dataUrlOrBlob);
    }

    try {
      const frames = [];

      const header = String.fromCharCode(...bytes.subarray(0, 6));
      if (header !== 'GIF87a' && header !== 'GIF89a') {
        return await this._fallbackImageFrame(dataUrlOrBlob);
      }

      const width = bytes[6] | (bytes[7] << 8);
      const height = bytes[8] | (bytes[9] << 8);

      if (width <= 0 || height <= 0 || width > 4096 || height > 4096) {
        return await this._fallbackImageFrame(dataUrlOrBlob);
      }

      const hasGCT = (bytes[10] & 0x80) !== 0;
      const gctSize = 1 << ((bytes[10] & 0x07) + 1);
      let pos = 13;
      let gct = null;

      if (hasGCT) {
        gct = bytes.subarray(pos, pos + gctSize * 3);
        pos += gctSize * 3;
      }

      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = width;
      fullCanvas.height = height;
      const fullCtx = fullCanvas.getContext('2d', { willReadFrequently: true });

      let delay = 100; 
      let transparentIndex = -1;
      let disposalMethod = 0;

      while (pos < bytes.length) {
        const blockType = bytes[pos++];

        if (blockType === 0x3b) {

          break;
        }

        if (blockType === 0x21) {

          const extType = bytes[pos++];
          if (extType === 0xf9) {

            const blockSize = bytes[pos++];
            const packed = bytes[pos++];
            disposalMethod = (packed >> 2) & 0x07;
            const hasTransparency = (packed & 0x01) !== 0;
            delay = (bytes[pos] | (bytes[pos + 1] << 8)) * 10;
            if (delay <= 10) delay = 100;
            pos += 2;
            transparentIndex = hasTransparency ? bytes[pos++] : -1;
            if (blockSize > 4) pos += blockSize - 4;
            pos++; 
          } else {

            let len = bytes[pos++];
            while (len > 0 && pos < bytes.length) {
              pos += len;
              len = bytes[pos++];
            }
          }
        } else if (blockType === 0x2c) {

          const left = bytes[pos] | (bytes[pos + 1] << 8);
          const top = bytes[pos + 2] | (bytes[pos + 3] << 8);
          const frameW = bytes[pos + 4] | (bytes[pos + 5] << 8);
          const frameH = bytes[pos + 6] | (bytes[pos + 7] << 8);
          pos += 8;

          const packed = bytes[pos++];
          const hasLCT = (packed & 0x80) !== 0;
          let colorTable = gct;

          if (hasLCT) {
            const lctSize = 1 << ((packed & 0x07) + 1);
            colorTable = bytes.subarray(pos, pos + lctSize * 3);
            pos += lctSize * 3;
          }

          const minCodeSize = bytes[pos++];
          const clearCode = 1 << minCodeSize;
          const eoiCode = clearCode + 1;
          let codeSize = minCodeSize + 1;
          let codeMask = (1 << codeSize) - 1;

          const compressed = [];
          let subLen = bytes[pos++];
          while (subLen > 0 && pos < bytes.length) {
            for (let i = 0; i < subLen; i++) compressed.push(bytes[pos++]);
            subLen = bytes[pos++];
          }

          const prefix = new Int32Array(4096);
          const suffix = new Uint8Array(4096);
          const pixelStack = new Uint8Array(4096);
          let nextCode = eoiCode + 1;

          for (let i = 0; i < clearCode; i++) {
            prefix[i] = -1;
            suffix[i] = i;
          }

          const pixels = new Uint8Array(frameW * frameH);
          let pixelIndex = 0;
          let bitBuf = 0;
          let bitCount = 0;
          let compPos = 0;
          let oldCode = -1;
          let topStack = 0;

          while (pixelIndex < frameW * frameH && compPos < compressed.length) {
            while (bitCount < codeSize && compPos < compressed.length) {
              bitBuf |= compressed[compPos++] << bitCount;
              bitCount += 8;
            }

            let code = bitBuf & codeMask;
            bitBuf >>= codeSize;
            bitCount -= codeSize;

            if (code === clearCode) {
              codeSize = minCodeSize + 1;
              codeMask = (1 << codeSize) - 1;
              nextCode = eoiCode + 1;
              oldCode = -1;
              continue;
            }

            if (code === eoiCode) break;

            let incode = code;
            if (code >= nextCode) {
              pixelStack[topStack++] = oldCode === -1 ? 0 : suffix[oldCode];
              code = oldCode;
            }

            while (code >= clearCode) {
              pixelStack[topStack++] = suffix[code];
              code = prefix[code];
            }
            pixelStack[topStack++] = suffix[code];

            if (oldCode !== -1 && nextCode < 4096) {
              prefix[nextCode] = oldCode;
              suffix[nextCode] = suffix[code];
              nextCode++;
              if (nextCode > codeMask && codeSize < 12) {
                codeSize++;
                codeMask = (1 << codeSize) - 1;
              }
            }
            oldCode = incode;

            while (topStack > 0 && pixelIndex < frameW * frameH) {
              pixels[pixelIndex++] = pixelStack[--topStack];
            }
          }

          const frameImgData = fullCtx.createImageData(frameW, frameH);
          const data = frameImgData.data;

          for (let i = 0; i < pixels.length; i++) {
            const colorIdx = pixels[i];
            const outIdx = i * 4;
            if (colorIdx === transparentIndex) {
              data[outIdx + 3] = 0; 
            } else if (colorTable && colorIdx * 3 + 2 < colorTable.length) {
              data[outIdx] = colorTable[colorIdx * 3];
              data[outIdx + 1] = colorTable[colorIdx * 3 + 1];
              data[outIdx + 2] = colorTable[colorIdx * 3 + 2];
              data[outIdx + 3] = 255;
            }
          }

          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = frameW;
          tempCanvas.height = frameH;
          tempCanvas.getContext('2d').putImageData(frameImgData, 0, 0);

          fullCtx.drawImage(tempCanvas, left, top);

          const snapCanvas = document.createElement('canvas');
          snapCanvas.width = width;
          snapCanvas.height = height;
          const snapCtx = snapCanvas.getContext('2d');
          snapCtx.drawImage(fullCanvas, 0, 0);

          frames.push({
            canvas: snapCanvas,
            delay: Math.max(30, delay),
          });

          if (disposalMethod === 2) {
            fullCtx.clearRect(left, top, frameW, frameH);
          }
        }
      }

      if (frames.length === 0) {
        return await this._fallbackImageFrame(dataUrlOrBlob);
      }

      return frames;
    } catch (parseErr) {
      console.warn('GIF binary parse error, using image fallback:', parseErr);
      return await this._fallbackImageFrame(dataUrlOrBlob);
    }
  }

  static async _fallbackImageFrame(dataUrlOrBlob) {
    return new Promise((resolve) => {
      const img = new Image();
      let createdUrl = null;

      const cleanup = () => {
        if (createdUrl) {
          try {
            URL.revokeObjectURL(createdUrl);
          } catch (e) {}
          createdUrl = null;
        }
      };

      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth || img.width || 100;
        c.height = img.naturalHeight || img.height || 100;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, c.width, c.height);
        cleanup();
        resolve([{ canvas: c, delay: 100 }]);
      };

      img.onerror = () => {
        cleanup();
        resolve([]);
      };

      if (typeof dataUrlOrBlob === 'string') {
        img.src = dataUrlOrBlob;
      } else if (typeof Blob !== 'undefined' && (dataUrlOrBlob instanceof Blob || dataUrlOrBlob instanceof File)) {
        createdUrl = URL.createObjectURL(dataUrlOrBlob);
        img.src = createdUrl;
      } else if (dataUrlOrBlob instanceof Uint8Array || dataUrlOrBlob instanceof ArrayBuffer) {
        const blob = new Blob([dataUrlOrBlob], { type: 'image/gif' });
        createdUrl = URL.createObjectURL(blob);
        img.src = createdUrl;
      }
    });
  }
}

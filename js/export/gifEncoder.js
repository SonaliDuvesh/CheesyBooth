
function quantize(pixels, maxColors = 256) {
  const colorCounts = new Map();
  const numPixels = pixels.length / 3;

  for (let i = 0; i < pixels.length; i += 3) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const rgb5 = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const count = colorCounts.get(rgb5) || 0;
    colorCounts.set(rgb5, count + 1);
  }

  const distinctColors = Array.from(colorCounts.entries()).map(([key, count]) => {
    const r5 = (key >> 10) & 0x1f;
    const g5 = (key >> 5) & 0x1f;
    const b5 = key & 0x1f;
    return {
      r: (r5 << 3) | (r5 >> 2),
      g: (g5 << 3) | (g5 >> 2),
      b: (b5 << 3) | (b5 >> 2),
      count,
    };
  });

  if (distinctColors.length <= maxColors) {
    const colormap = new Uint8Array(maxColors * 3);
    for (let i = 0; i < distinctColors.length; i++) {
      colormap[i * 3 + 0] = distinctColors[i].r;
      colormap[i * 3 + 1] = distinctColors[i].g;
      colormap[i * 3 + 2] = distinctColors[i].b;
    }
    return buildQuantizerResult(colormap, distinctColors.length);
  }

  class VBox {
    constructor(colors) {
      this.colors = colors;
      this.calculateBounds();
    }
    calculateBounds() {
      let rmin = 255, rmax = 0, gmin = 255, gmax = 0, bmin = 255, bmax = 0;
      let total = 0;
      for (const c of this.colors) {
        if (c.r < rmin) rmin = c.r;
        if (c.r > rmax) rmax = c.r;
        if (c.g < gmin) gmin = c.g;
        if (c.g > gmax) gmax = c.g;
        if (c.b < bmin) bmin = c.b;
        if (c.b > bmax) bmax = c.b;
        total += c.count;
      }
      this.rmin = rmin; this.rmax = rmax;
      this.gmin = gmin; this.gmax = gmax;
      this.bmin = bmin; this.bmax = bmax;
      this.total = total;
      this.dr = rmax - rmin;
      this.dg = gmax - gmin;
      this.db = bmax - bmin;
      this.maxRange = Math.max(this.dr, this.dg, this.db);
    }
    split() {
      if (this.colors.length <= 1) return null;
      let axis = 'r';
      if (this.dg >= this.dr && this.dg >= this.db) axis = 'g';
      else if (this.db >= this.dr && this.db >= this.dg) axis = 'b';

      this.colors.sort((a, b) => a[axis] - b[axis]);

      const median = Math.floor(this.colors.length / 2);
      const left = this.colors.slice(0, median);
      const right = this.colors.slice(median);
      return [new VBox(left), new VBox(right)];
    }
    avg() {
      let rSum = 0, gSum = 0, bSum = 0, total = 0;
      for (const c of this.colors) {
        rSum += c.r * c.count;
        gSum += c.g * c.count;
        bSum += c.b * c.count;
        total += c.count;
      }
      return {
        r: Math.round(rSum / total),
        g: Math.round(gSum / total),
        b: Math.round(bSum / total),
      };
    }
  }

  const boxes = [new VBox(distinctColors)];
  while (boxes.length < maxColors) {
    let bestIdx = -1;
    let maxRange = -1;
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].colors.length > 1 && boxes[i].maxRange > maxRange) {
        maxRange = boxes[i].maxRange;
        bestIdx = i;
      }
    }
    if (bestIdx === -1) break;
    const boxToSplit = boxes.splice(bestIdx, 1)[0];
    const [b1, b2] = boxToSplit.split();
    boxes.push(b1, b2);
  }

  const colormap = new Uint8Array(maxColors * 3);
  for (let i = 0; i < boxes.length; i++) {
    const avg = boxes[i].avg();
    colormap[i * 3 + 0] = avg.r;
    colormap[i * 3 + 1] = avg.g;
    colormap[i * 3 + 2] = avg.b;
  }

  return buildQuantizerResult(colormap, boxes.length);
}

function buildQuantizerResult(colormap, numColors) {
  const lookupCache = new Int16Array(32768).fill(-1);
  return {
    colormap,
    lookup: (r, g, b) => {
      const rgb5 = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      if (lookupCache[rgb5] !== -1) {
        return lookupCache[rgb5];
      }
      let bestDist = 10000000;
      let bestIdx = 0;
      for (let i = 0; i < numColors; i++) {
        const cr = colormap[i * 3 + 0];
        const cg = colormap[i * 3 + 1];
        const cb = colormap[i * 3 + 2];
        const dr = r - cr;
        const dg = g - cg;
        const db = b - cb;

        const dist = dr * dr * 2 + dg * dg * 4 + db * db * 3;
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
          if (dist === 0) break;
        }
      }
      lookupCache[rgb5] = bestIdx;
      return bestIdx;
    },
  };
}

class LZWEncoder {
  constructor(width, height, pixels, colorDepth) {
    this.width = width;
    this.height = height;
    this.pixels = pixels;
    this.initCodeSize = Math.max(2, colorDepth);
    this.accum = new Uint8Array(256);
    this.htab = new Int32Array(5003);
    this.codetab = new Int32Array(5003);
  }

  char_out(c, outs) {
    this.accum[this.a_count++] = c;
    if (this.a_count >= 254) this.flush_char(outs);
  }

  flush_char(outs) {
    if (this.a_count > 0) {
      outs.writeByte(this.a_count);
      for (let i = 0; i < this.a_count; i++) outs.writeByte(this.accum[i]);
      this.a_count = 0;
    }
  }

  output(code, outs) {
    this.cur_accum &= ((1 << this.cur_bits) - 1);
    if (this.cur_bits > 0) this.cur_accum |= (code << this.cur_bits);
    else this.cur_accum = code;

    this.cur_bits += this.n_bits;

    while (this.cur_bits >= 8) {
      this.char_out(this.cur_accum & 0xff, outs);
      this.cur_accum >>= 8;
      this.cur_bits -= 8;
    }

    if (this.free_ent > this.maxcode || this.clear_flg) {
      if (this.clear_flg) {
        this.maxcode = (1 << (this.n_bits = this.g_init_bits)) - 1;
        this.clear_flg = false;
      } else {
        this.n_bits++;
        if (this.n_bits === 12) this.maxcode = 1 << 12;
        else this.maxcode = (1 << this.n_bits) - 1;
      }
    }

    if (code === this.EOFCode) {
      while (this.cur_bits > 0) {
        this.char_out(this.cur_accum & 0xff, outs);
        this.cur_accum >>= 8;
        this.cur_bits -= 8;
      }
      this.flush_char(outs);
    }
  }

  encode(outs) {
    outs.writeByte(this.initCodeSize);

    this.g_init_bits = this.initCodeSize + 1;
    this.n_bits = this.g_init_bits;
    this.clear_flg = false;
    this.maxcode = (1 << this.n_bits) - 1;

    this.ClearCode = 1 << (this.g_init_bits - 1);
    this.EOFCode = this.ClearCode + 1;
    this.free_ent = this.ClearCode + 2;

    this.a_count = 0;
    this.cur_accum = 0;
    this.cur_bits = 0;

    for (let i = 0; i < 5003; i++) this.htab[i] = -1;

    this.output(this.ClearCode, outs);

    let cur = 0;
    const len = this.pixels.length;
    let ent = this.pixels[cur++];

    while (cur < len) {
      const c = this.pixels[cur++];
      const fcode = (c << 12) + ent;
      let i = (c << 4) ^ ent;

      if (this.htab[i] === fcode) {
        ent = this.codetab[i];
        continue;
      } else if (this.htab[i] >= 0) {
        let disp = 5003 - i;
        if (i === 0) disp = 1;
        let matched = false;
        do {
          i -= disp;
          if (i < 0) i += 5003;
          if (this.htab[i] === fcode) {
            ent = this.codetab[i];
            matched = true;
            break;
          }
        } while (this.htab[i] >= 0);
        if (matched) continue;
      }

      this.output(ent, outs);
      ent = c;
      if (this.free_ent < (1 << 12)) {
        this.codetab[i] = this.free_ent++;
        this.htab[i] = fcode;
      } else {
        for (let j = 0; j < 5003; j++) this.htab[j] = -1;
        this.free_ent = this.ClearCode + 2;
        this.clear_flg = true;
        this.output(this.ClearCode, outs);
      }
    }

    this.output(ent, outs);
    this.output(this.EOFCode, outs);
    outs.writeByte(0); 
  }
}

class ByteArrayStream {
  constructor(initialCapacity = 262144) {
    this.buffer = new Uint8Array(initialCapacity);
    this.length = 0;
  }

  _ensureCapacity(needed) {
    if (this.length + needed > this.buffer.length) {
      const newCap = Math.max(this.buffer.length * 2, this.length + needed + 65536);
      const newBuf = new Uint8Array(newCap);
      newBuf.set(this.buffer.subarray(0, this.length));
      this.buffer = newBuf;
    }
  }

  writeByte(b) {
    this._ensureCapacity(1);
    this.buffer[this.length++] = b & 0xff;
  }

  writeBytes(bytes) {
    const len = bytes.length;
    this._ensureCapacity(len);
    this.buffer.set(bytes, this.length);
    this.length += len;
  }

  writeShort(s) {
    this._ensureCapacity(2);
    this.buffer[this.length++] = s & 0xff;
    this.buffer[this.length++] = (s >> 8) & 0xff;
  }

  writeString(str) {
    const len = str.length;
    this._ensureCapacity(len);
    for (let i = 0; i < len; i++) {
      this.buffer[this.length++] = str.charCodeAt(i);
    }
  }

  toBlob() {
    return new Blob([this.buffer.subarray(0, this.length)], { type: 'image/gif' });
  }
}

export class GIFEncoder {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.stream = new ByteArrayStream();
    this.started = false;
    this.delay = 10; 
  }

  setDelay(ms) {
    this.delay = Math.max(2, Math.round(ms / 10));
  }

  addFrame(ctx) {
    const imgData = ctx.getImageData(0, 0, this.width, this.height);
    const data = imgData.data;
    const numPixels = this.width * this.height;

    const rgb = new Uint8Array(numPixels * 3);
    let k = 0;
    for (let i = 0; i < data.length; i += 4) {
      rgb[k++] = data[i];     
      rgb[k++] = data[i + 1]; 
      rgb[k++] = data[i + 2]; 
    }

    const q = quantize(rgb, 256);
    const colormap = q.colormap;

    if (!this.started) {
      this.stream.writeString('GIF89a');
      this.stream.writeShort(this.width);
      this.stream.writeShort(this.height);
      this.stream.writeByte(0xf7); 
      this.stream.writeByte(0);    
      this.stream.writeByte(0);    

      this.stream.writeBytes(colormap);

      this.stream.writeByte(0x21); 
      this.stream.writeByte(0xff); 
      this.stream.writeByte(11);   
      this.stream.writeString('NETSCAPE2.0');
      this.stream.writeByte(3);    
      this.stream.writeByte(1);    
      this.stream.writeShort(0);   
      this.stream.writeByte(0);    
      this.started = true;
    }

    const indexedPixels = new Uint8Array(numPixels);
    for (let i = 0; i < numPixels; i++) {
      indexedPixels[i] = q.lookup(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]);
    }

    this.stream.writeByte(0x21);
    this.stream.writeByte(0xf9);
    this.stream.writeByte(4);           
    this.stream.writeByte(0);           
    this.stream.writeShort(this.delay); 
    this.stream.writeByte(0);           
    this.stream.writeByte(0);           

    this.stream.writeByte(0x2c);
    this.stream.writeShort(0);          
    this.stream.writeShort(0);          
    this.stream.writeShort(this.width);
    this.stream.writeShort(this.height);
    this.stream.writeByte(0x87);        

    this.stream.writeBytes(colormap);

    const lzw = new LZWEncoder(this.width, this.height, indexedPixels, 8);
    lzw.encode(this.stream);
  }

  finish() {
    this.stream.writeByte(0x3b); 
    return this.stream.toBlob();
  }
}

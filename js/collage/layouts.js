
export const LAYOUT_CATEGORIES = [
  { id: 'all', name: 'All Layouts', icon: '▦' },
  { id: 'classic', name: 'Classic Booth', icon: '🎞️' },
  { id: 'shapes', name: 'Shapes & Cutouts', icon: '💖' },
  { id: 'film', name: 'Film Strips', icon: '🎬' },
  { id: 'editorial', name: 'Editorial', icon: '📰' },
  { id: 'minimal', name: 'Minimal', icon: '◻️' },
  { id: 'fun', name: 'Fun & Playful', icon: '✨' },
];

export const COLLAGE_LAYOUTS = {

  'vertical-strip': {
    id: 'vertical-strip',
    name: 'Classic Strip',
    category: 'classic',
    aspectRatio: '1:3.2',
    defaultSlotsCount: 4,
    description: 'Traditional vertical photobooth strip with stacked frames',
    calculateSlots: (width, height, count, spacing, padding) => {
      const actualCount = Math.max(1, count !== undefined && count !== null ? count : 4);
      const availableHeight = height - padding * 2 - spacing * (actualCount - 1);
      const slotHeight = availableHeight / actualCount;
      const slotWidth = width - padding * 2;
      const slots = [];

      for (let i = 0; i < actualCount; i++) {
        slots.push({
          index: i,
          x: padding,
          y: padding + i * (slotHeight + spacing),
          width: slotWidth,
          height: slotHeight,
        });
      }
      return slots;
    },
  },

  'grid-2x2': {
    id: 'grid-2x2',
    name: 'Balanced Grid',
    category: 'classic',
    aspectRatio: '1:1',
    defaultSlotsCount: 4,
    description: 'Balanced multi-column grid adaptive to any number of photos',
    calculateSlots: (width, height, count, spacing, padding) => {
      const actualCount = Math.max(1, count !== undefined && count !== null ? count : 4);
      const contentW = width - padding * 2;
      const contentH = height - padding * 2;
      const slots = [];

      if (actualCount === 1) {
        slots.push({ index: 0, x: padding, y: padding, width: contentW, height: contentH });
      } else if (actualCount === 2) {
        const slotH = (contentH - spacing) / 2;
        slots.push({ index: 0, x: padding, y: padding, width: contentW, height: slotH });
        slots.push({ index: 1, x: padding, y: padding + slotH + spacing, width: contentW, height: slotH });
      } else if (actualCount === 3) {
        const topH = (contentH - spacing) * 0.52;
        const botH = contentH - spacing - topH;
        const botW = (contentW - spacing) / 2;
        slots.push({ index: 0, x: padding, y: padding, width: contentW, height: topH });
        slots.push({ index: 1, x: padding, y: padding + topH + spacing, width: botW, height: botH });
        slots.push({ index: 2, x: padding + botW + spacing, y: padding + topH + spacing, width: botW, height: botH });
      } else {
        let cols = 2;
        if (contentW > contentH * 1.15) {
          cols = actualCount >= 12 ? 4 : (actualCount >= 5 ? 3 : 2);
        } else {
          if (actualCount >= 25) cols = 5;
          else if (actualCount >= 16) cols = 4;
          else if (actualCount >= 9) cols = 3;
          else cols = 2;
        }

        const rows = Math.ceil(actualCount / cols);
        const slotHeight = (contentH - spacing * (rows - 1)) / rows;
        let slotIdx = 0;

        for (let r = 0; r < rows; r++) {
          const itemsInThisRow = Math.min(cols, actualCount - r * cols);
          const rowSlotWidth = (contentW - spacing * (itemsInThisRow - 1)) / itemsInThisRow;
          for (let c = 0; c < itemsInThisRow; c++) {
            slots.push({
              index: slotIdx++,
              x: padding + c * (rowSlotWidth + spacing),
              y: padding + r * (slotHeight + spacing),
              width: rowSlotWidth,
              height: slotHeight,
            });
          }
        }
      }
      return slots;
    },
  },

  'horizontal-strip': {
    id: 'horizontal-strip',
    name: 'Wide Strip',
    category: 'classic',
    aspectRatio: '3.2:1',
    defaultSlotsCount: 4,
    description: 'Panoramic horizontal photo strip across all frames',
    calculateSlots: (width, height, count, spacing, padding) => {
      const actualCount = Math.max(1, count !== undefined && count !== null ? count : 4);
      const availableWidth = width - padding * 2 - spacing * (actualCount - 1);
      const slotWidth = availableWidth / actualCount;
      const slotHeight = height - padding * 2;
      const slots = [];

      for (let i = 0; i < actualCount; i++) {
        slots.push({
          index: i,
          x: padding + i * (slotWidth + spacing),
          y: padding,
          width: slotWidth,
          height: slotHeight,
        });
      }
      return slots;
    },
  },

  'featured-3plus1': {
    id: 'featured-3plus1',
    name: 'Featured Hero',
    category: 'editorial',
    aspectRatio: '4:5',
    defaultSlotsCount: 4,
    description: 'One large hero portrait alongside neatly arranged companion snaps',
    calculateSlots: (width, height, count, spacing, padding) => {
      const actualCount = Math.max(1, count !== undefined && count !== null ? count : 4);
      const slots = [];
      const contentW = width - padding * 2;
      const contentH = height - padding * 2;

      if (actualCount === 1) {
        slots.push({ index: 0, x: padding, y: padding, width: contentW, height: contentH });
      } else if (actualCount === 2) {
        const mainW = (contentW - spacing) * 0.54;
        const sideW = contentW - spacing - mainW;
        slots.push({ index: 0, x: padding, y: padding, width: mainW, height: contentH });
        slots.push({ index: 1, x: padding + mainW + spacing, y: padding, width: sideW, height: contentH });
      } else if (actualCount <= 8) {

        const sideCount = actualCount - 1;
        const sideCols = sideCount <= 4 ? 1 : 2;
        const heroRatio = sideCols === 1 ? 0.58 : 0.48;
        const mainW = (contentW - spacing) * heroRatio;
        const sideAreaW = contentW - spacing - mainW;
        const sideRows = Math.ceil(sideCount / sideCols);
        const sideH = (contentH - spacing * (sideRows - 1)) / sideRows;
        const sideColW = (sideAreaW - spacing * (sideCols - 1)) / sideCols;

        slots.push({ index: 0, x: padding, y: padding, width: mainW, height: contentH });

        let sideIdx = 0;
        for (let r = 0; r < sideRows; r++) {
          const itemsInThisRow = Math.min(sideCols, sideCount - r * sideCols);
          const colW = (sideAreaW - spacing * (itemsInThisRow - 1)) / itemsInThisRow;
          for (let c = 0; c < itemsInThisRow; c++) {
            slots.push({
              index: 1 + sideIdx++,
              x: padding + mainW + spacing + c * (colW + spacing),
              y: padding + r * (sideH + spacing),
              width: colW,
              height: sideH,
            });
          }
        }
      } else {

        const topH = (contentH - spacing) * 0.38;
        const botH = contentH - spacing - topH;
        slots.push({ index: 0, x: padding, y: padding, width: contentW, height: topH });

        const subCount = actualCount - 1;
        const cols = subCount >= 18 ? 4 : (subCount >= 9 ? 3 : 2);
        const rows = Math.ceil(subCount / cols);
        const subSlotH = (botH - spacing * (rows - 1)) / rows;
        let subIdx = 0;

        for (let r = 0; r < rows; r++) {
          const itemsInRow = Math.min(cols, subCount - r * cols);
          const rowSlotW = (contentW - spacing * (itemsInRow - 1)) / itemsInRow;
          for (let c = 0; c < itemsInRow; c++) {
            slots.push({
              index: 1 + subIdx++,
              x: padding + c * (rowSlotW + spacing),
              y: padding + topH + spacing + r * (subSlotH + spacing),
              width: rowSlotW,
              height: subSlotH,
            });
          }
        }
      }
      return slots;
    },
  },

  'grid-2x3': {
    id: 'grid-2x3',
    name: 'Scrapbook Story Grid',
    category: 'classic',
    aspectRatio: '2:3',
    defaultSlotsCount: 6,
    description: 'Story scrapbook multi-grid that arranges any photo count seamlessly',
    calculateSlots: (width, height, count, spacing, padding) => {
      const actualCount = Math.max(1, count !== undefined && count !== null ? count : 6);
      const contentW = width - padding * 2;
      const contentH = height - padding * 2;
      const slots = [];

      if (actualCount === 1) {
        slots.push({ index: 0, x: padding, y: padding, width: contentW, height: contentH });
      } else if (actualCount === 2) {
        const slotH = (contentH - spacing) / 2;
        slots.push({ index: 0, x: padding, y: padding, width: contentW, height: slotH });
        slots.push({ index: 1, x: padding, y: padding + slotH + spacing, width: contentW, height: slotH });
      } else if (actualCount === 3) {
        const slotH = (contentH - spacing * 2) / 3;
        for (let i = 0; i < 3; i++) {
          slots.push({ index: i, x: padding, y: padding + i * (slotH + spacing), width: contentW, height: slotH });
        }
      } else if (actualCount === 4) {
        const cols = 2;
        const rows = 2;
        const slotW = (contentW - spacing) / cols;
        const slotH = (contentH - spacing) / rows;
        let idx = 0;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            slots.push({
              index: idx++,
              x: padding + c * (slotW + spacing),
              y: padding + r * (slotH + spacing),
              width: slotW,
              height: slotH,
            });
          }
        }
      } else if (actualCount === 5) {
        const isWide = contentW > contentH * 1.15;
        const cols = isWide ? 3 : 2;
        const rows = isWide ? 2 : 3;
        const slotW = (contentW - spacing * (cols - 1)) / cols;
        const slotH = (contentH - spacing * (rows - 1)) / rows;
        let idx = 0;
        for (let r = 0; r < rows - 1; r++) {
          for (let c = 0; c < cols; c++) {
            slots.push({
              index: idx++,
              x: padding + c * (slotW + spacing),
              y: padding + r * (slotH + spacing),
              width: slotW,
              height: slotH,
            });
          }
        }
        const rem = actualCount - (rows - 1) * cols;
        const remW = (contentW - spacing * (rem - 1)) / rem;
        for (let c = 0; c < rem; c++) {
          slots.push({
            index: idx++,
            x: padding + c * (remW + spacing),
            y: padding + (rows - 1) * (slotH + spacing),
            width: remW,
            height: slotH,
          });
        }
      } else {
        let cols = 2;
        if (contentW > contentH * 1.15) {
          cols = actualCount >= 12 ? 4 : (actualCount >= 5 ? 3 : 2);
        } else {
          if (actualCount >= 25) cols = 5;
          else if (actualCount >= 16) cols = 4;
          else if (actualCount >= 9) cols = 3;
          else cols = 2;
        }

        const rows = Math.ceil(actualCount / cols);
        const slotHeight = (contentH - spacing * (rows - 1)) / rows;
        let idx = 0;

        for (let r = 0; r < rows; r++) {
          const itemsInThisRow = Math.min(cols, actualCount - r * cols);
          const rowSlotW = (contentW - spacing * (itemsInThisRow - 1)) / itemsInThisRow;
          for (let c = 0; c < itemsInThisRow; c++) {
            slots.push({
              index: idx++,
              x: padding + c * (rowSlotW + spacing),
              y: padding + r * (slotHeight + spacing),
              width: rowSlotW,
              height: slotHeight,
            });
          }
        }
      }
      return slots;
    },
  },

  'film-vertical': {
    id: 'film-vertical',
    name: '35mm Film Strip',
    category: 'film',
    aspectRatio: '1:2.4',
    defaultSlotsCount: 3,
    description: 'Vintage cinema film strip format with authentic sprocket margins',
    calculateSlots: (width, height, count, spacing, padding) => {
      const actualCount = Math.max(1, count !== undefined && count !== null ? count : 3);
      const sideFilmBorder = padding + 24; 
      const availableHeight = height - padding * 2 - spacing * (actualCount - 1);
      const slotHeight = availableHeight / actualCount;
      const slotWidth = width - sideFilmBorder * 2;
      const slots = [];

      for (let i = 0; i < actualCount; i++) {
        slots.push({
          index: i,
          x: sideFilmBorder,
          y: padding + i * (slotHeight + spacing),
          width: slotWidth,
          height: slotHeight,
        });
      }
      return slots;
    },
  },

  'duo-editorial': {
    id: 'duo-editorial',
    name: 'Duo Editorial',
    category: 'editorial',
    aspectRatio: '4:5',
    defaultSlotsCount: 2,
    description: 'Elegant stacked portrait frames with magazine editorial margins',
    calculateSlots: (width, height, count, spacing, padding) => {
      const actualCount = Math.max(1, count !== undefined && count !== null ? count : 2);
      const contentW = width - padding * 2;
      const contentH = height - padding * 2;
      const slots = [];

      if (actualCount === 1) {
        slots.push({ index: 0, x: padding, y: padding, width: contentW, height: contentH });
      } else if (actualCount <= 3) {
        const slotHeight = (contentH - spacing * (actualCount - 1)) / actualCount;
        for (let i = 0; i < actualCount; i++) {
          slots.push({
            index: i,
            x: padding,
            y: padding + i * (slotHeight + spacing),
            width: contentW,
            height: slotHeight,
          });
        }
      } else {
        let cols = 2;
        if (contentW > contentH * 1.15) {
          cols = actualCount >= 12 ? 4 : (actualCount >= 5 ? 3 : 2);
        } else {
          cols = actualCount >= 10 ? 3 : 2;
        }
        const rows = Math.ceil(actualCount / cols);
        const slotHeight = (contentH - spacing * (rows - 1)) / rows;
        let idx = 0;
        for (let r = 0; r < rows; r++) {
          const itemsInThisRow = Math.min(cols, actualCount - r * cols);
          const rowSlotW = (contentW - spacing * (itemsInThisRow - 1)) / itemsInThisRow;
          for (let c = 0; c < itemsInThisRow; c++) {
            slots.push({
              index: idx++,
              x: padding + c * (rowSlotW + spacing),
              y: padding + r * (slotHeight + spacing),
              width: rowSlotW,
              height: slotHeight,
            });
          }
        }
      }
      return slots;
    },
  },

  'trio-minimal': {
    id: 'trio-minimal',
    name: 'Trio Balance',
    category: 'minimal',
    aspectRatio: '1:1',
    defaultSlotsCount: 3,
    description: 'Featured top header frame with balanced lower gallery grid',
    calculateSlots: (width, height, count, spacing, padding) => {
      const actualCount = Math.max(1, count !== undefined && count !== null ? count : 3);
      const contentW = width - padding * 2;
      const contentH = height - padding * 2;
      const slots = [];

      if (actualCount === 1) {
        slots.push({ index: 0, x: padding, y: padding, width: contentW, height: contentH });
      } else if (actualCount === 2) {
        const slotH = (contentH - spacing) / 2;
        slots.push({ index: 0, x: padding, y: padding, width: contentW, height: slotH });
        slots.push({ index: 1, x: padding, y: padding + slotH + spacing, width: contentW, height: slotH });
      } else if (actualCount === 3) {
        const topHeight = (contentH - spacing) * 0.54;
        const bottomHeight = contentH - spacing - topHeight;
        const bottomWidth = (contentW - spacing) / 2;
        slots.push({ index: 0, x: padding, y: padding, width: contentW, height: topHeight });
        slots.push({ index: 1, x: padding, y: padding + topHeight + spacing, width: bottomWidth, height: bottomHeight });
        slots.push({ index: 2, x: padding + bottomWidth + spacing, y: padding + topHeight + spacing, width: bottomWidth, height: bottomHeight });
      } else {
        const topHeight = Math.min((contentH - spacing) * 0.42, 380);
        const botHeight = contentH - spacing - topHeight;
        slots.push({ index: 0, x: padding, y: padding, width: contentW, height: topHeight });

        const subCount = actualCount - 1;
        const cols = subCount >= 12 ? 4 : (subCount >= 6 ? 3 : 2);
        const rows = Math.ceil(subCount / cols);
        const subSlotH = (botHeight - spacing * (rows - 1)) / rows;
        let subIdx = 0;

        for (let r = 0; r < rows; r++) {
          const itemsInThisRow = Math.min(cols, subCount - r * cols);
          const rowSlotW = (contentW - spacing * (itemsInThisRow - 1)) / itemsInThisRow;
          for (let c = 0; c < itemsInThisRow; c++) {
            slots.push({
              index: 1 + subIdx++,
              x: padding + c * (rowSlotW + spacing),
              y: padding + topHeight + spacing + r * (subSlotH + spacing),
              width: rowSlotW,
              height: subSlotH,
            });
          }
        }
      }
      return slots;
    },
  },

  'asymmetric-fun': {
    id: 'asymmetric-fun',
    name: 'Playful Collage',
    category: 'fun',
    aspectRatio: '4:5',
    defaultSlotsCount: 4,
    description: 'Dynamic asymmetric arrangement with creative photo hierarchy',
    calculateSlots: (width, height, count, spacing, padding) => {
      const actualCount = Math.max(1, count !== undefined && count !== null ? count : 4);
      const contentW = width - padding * 2;
      const contentH = height - padding * 2;
      const slots = [];

      if (actualCount === 1) {
        slots.push({ index: 0, x: padding, y: padding, width: contentW, height: contentH });
      } else if (actualCount === 2) {
        const col1W = (contentW - spacing) * 0.54;
        const col2W = contentW - spacing - col1W;
        slots.push({ index: 0, x: padding, y: padding, width: col1W, height: contentH });
        slots.push({ index: 1, x: padding + col1W + spacing, y: padding, width: col2W, height: contentH });
      } else if (actualCount === 3) {
        const col1W = (contentW - spacing) * 0.54;
        const col2W = contentW - spacing - col1W;
        const sideH = (contentH - spacing) / 2;
        slots.push({ index: 0, x: padding, y: padding, width: col1W, height: contentH });
        slots.push({ index: 1, x: padding + col1W + spacing, y: padding, width: col2W, height: sideH });
        slots.push({ index: 2, x: padding + col1W + spacing, y: padding + sideH + spacing, width: col2W, height: sideH });
      } else if (actualCount === 4) {
        const col1W = (contentW - spacing) * 0.54;
        const col2W = contentW - spacing - col1W;
        const leftTopH = (contentH - spacing) * 0.58;
        const leftBotH = contentH - spacing - leftTopH;
        const rightTopH = (contentH - spacing) * 0.42;
        const rightBotH = contentH - spacing - rightTopH;

        slots.push({ index: 0, x: padding, y: padding, width: col1W, height: leftTopH });
        slots.push({ index: 1, x: padding + col1W + spacing, y: padding, width: col2W, height: rightTopH });
        slots.push({ index: 2, x: padding, y: padding + leftTopH + spacing, width: col1W, height: leftBotH });
        slots.push({ index: 3, x: padding + col1W + spacing, y: padding + rightTopH + spacing, width: col2W, height: rightBotH });
      } else {
        const cols = actualCount >= 15 ? 4 : (actualCount >= 8 ? 3 : 2);
        const colWidth = (contentW - spacing * (cols - 1)) / cols;
        const itemsPerCol = Array.from({ length: cols }, () => []);

        for (let i = 0; i < actualCount; i++) {
          itemsPerCol[i % cols].push(i);
        }

        let slotIdx = 0;
        for (let c = 0; c < cols; c++) {
          const colItems = itemsPerCol[c];
          const colX = padding + c * (colWidth + spacing);
          const numInCol = colItems.length;
          const slotHeight = (contentH - spacing * (numInCol - 1)) / numInCol;

          for (let r = 0; r < numInCol; r++) {
            slots.push({
              index: colItems[r],
              x: colX,
              y: padding + r * (slotHeight + spacing),
              width: colWidth,
              height: slotHeight,
            });
          }
        }

        slots.sort((a, b) => a.index - b.index);
      }
      return slots;
    },
  },

  'circles-strip': {
    id: 'circles-strip',
    name: 'Circle Strip',
    category: 'shapes',
    aspectRatio: '1:3.2',
    defaultSlotsCount: 4,
    description: 'Vertical photobooth strip with elegant circular photo cutouts',
    calculateSlots: (width, height, count, spacing, padding) => {
      const actualCount = Math.max(1, count !== undefined && count !== null ? count : 4);
      const availableHeight = height - padding * 2 - spacing * (actualCount - 1);
      const slotHeight = availableHeight / actualCount;
      const slotWidth = width - padding * 2;
      const slots = [];

      for (let i = 0; i < actualCount; i++) {
        slots.push({
          index: i,
          x: padding,
          y: padding + i * (slotHeight + spacing),
          width: slotWidth,
          height: slotHeight,
          shape: 'circle',
        });
      }
      return slots;
    },
  },

  'heart-mosaic': {
    id: 'heart-mosaic',
    name: 'Heart Mosaic',
    category: 'shapes',
    aspectRatio: '1:1',
    defaultSlotsCount: 4,
    description: 'Romantic heart-shaped photo frames in a balanced grid',
    calculateSlots: (width, height, count, spacing, padding) => {
      const actualCount = Math.max(1, count !== undefined && count !== null ? count : 4);
      const contentW = width - padding * 2;
      const contentH = height - padding * 2;
      const slots = [];

      let cols = 2;
      if (contentW > contentH * 1.15) {
        cols = actualCount >= 12 ? 4 : (actualCount >= 5 ? 3 : 2);
      } else {
        cols = actualCount >= 9 ? 3 : 2;
      }
      if (actualCount === 1) cols = 1;
      const rows = Math.ceil(actualCount / cols);
      const slotH = (contentH - spacing * (rows - 1)) / rows;
      let idx = 0;

      for (let r = 0; r < rows; r++) {
        const inRow = Math.min(cols, actualCount - r * cols);
        const slotW = (contentW - spacing * (inRow - 1)) / inRow;
        for (let c = 0; c < inRow; c++) {
          slots.push({
            index: idx++,
            x: padding + c * (slotW + spacing),
            y: padding + r * (slotH + spacing),
            width: slotW,
            height: slotH,
            shape: 'heart',
          });
        }
      }
      return slots;
    },
  },

  'star-quad': {
    id: 'star-quad',
    name: 'Star Quad',
    category: 'shapes',
    aspectRatio: '1:1',
    defaultSlotsCount: 4,
    description: 'Playful celestial 5-point star cutouts for celebration photos',
    calculateSlots: (width, height, count, spacing, padding) => {
      const actualCount = Math.max(1, count !== undefined && count !== null ? count : 4);
      const contentW = width - padding * 2;
      const contentH = height - padding * 2;
      const slots = [];

      let cols = 2;
      if (contentW > contentH * 1.15) {
        cols = actualCount >= 12 ? 4 : (actualCount >= 5 ? 3 : 2);
      } else {
        cols = actualCount >= 9 ? 3 : 2;
      }
      if (actualCount === 1) cols = 1;
      const rows = Math.ceil(actualCount / cols);
      const slotH = (contentH - spacing * (rows - 1)) / rows;
      let idx = 0;

      for (let r = 0; r < rows; r++) {
        const inRow = Math.min(cols, actualCount - r * cols);
        const slotW = (contentW - spacing * (inRow - 1)) / inRow;
        for (let c = 0; c < inRow; c++) {
          slots.push({
            index: idx++,
            x: padding + c * (slotW + spacing),
            y: padding + r * (slotH + spacing),
            width: slotW,
            height: slotH,
            shape: 'star',
          });
        }
      }
      return slots;
    },
  },

  'oval-portrait': {
    id: 'oval-portrait',
    name: 'Oval Portrait',
    category: 'shapes',
    aspectRatio: '4:5',
    defaultSlotsCount: 2,
    description: 'Victorian antique oval cameo frames for timeless portraits',
    calculateSlots: (width, height, count, spacing, padding) => {
      const actualCount = Math.max(1, count !== undefined && count !== null ? count : 2);
      const contentW = width - padding * 2;
      const contentH = height - padding * 2;
      const slots = [];

      if (actualCount === 1) {
        slots.push({ index: 0, x: padding, y: padding, width: contentW, height: contentH, shape: 'ellipse' });
      } else if (actualCount <= 3) {
        const slotH = (contentH - spacing * (actualCount - 1)) / actualCount;
        for (let i = 0; i < actualCount; i++) {
          slots.push({
            index: i,
            x: padding,
            y: padding + i * (slotH + spacing),
            width: contentW,
            height: slotH,
            shape: 'ellipse',
          });
        }
      } else {
        let cols = 2;
        if (contentW > contentH * 1.15) {
          cols = actualCount >= 12 ? 4 : (actualCount >= 5 ? 3 : 2);
        } else {
          cols = actualCount >= 9 ? 3 : 2;
        }
        const rows = Math.ceil(actualCount / cols);
        const slotH = (contentH - spacing * (rows - 1)) / rows;
        let idx = 0;
        for (let r = 0; r < rows; r++) {
          const inRow = Math.min(cols, actualCount - r * cols);
          const slotW = (contentW - spacing * (inRow - 1)) / inRow;
          for (let c = 0; c < inRow; c++) {
            slots.push({
              index: idx++,
              x: padding + c * (slotW + spacing),
              y: padding + r * (slotH + spacing),
              width: slotW,
              height: slotH,
              shape: 'ellipse',
            });
          }
        }
      }
      return slots;
    },
  },

  'arch-gallery': {
    id: 'arch-gallery',
    name: 'Arch Gallery',
    category: 'shapes',
    aspectRatio: '4:5',
    defaultSlotsCount: 4,
    description: 'Modern editorial arched domes with cathedral curve tops',
    calculateSlots: (width, height, count, spacing, padding) => {
      const actualCount = Math.max(1, count !== undefined && count !== null ? count : 4);
      const contentW = width - padding * 2;
      const contentH = height - padding * 2;
      const slots = [];

      let cols = 2;
      if (contentW > contentH * 1.15) {
        cols = actualCount >= 12 ? 4 : (actualCount >= 5 ? 3 : 2);
      } else {
        cols = actualCount >= 9 ? 3 : 2;
      }
      if (actualCount === 1) cols = 1;
      const rows = Math.ceil(actualCount / cols);
      const slotH = (contentH - spacing * (rows - 1)) / rows;
      let idx = 0;

      for (let r = 0; r < rows; r++) {
        const inRow = Math.min(cols, actualCount - r * cols);
        const slotW = (contentW - spacing * (inRow - 1)) / inRow;
        for (let c = 0; c < inRow; c++) {
          slots.push({
            index: idx++,
            x: padding + c * (slotW + spacing),
            y: padding + r * (slotH + spacing),
            width: slotW,
            height: slotH,
            shape: 'arch',
          });
        }
      }
      return slots;
    },
  },
};

export function getLayoutsByCategory(categoryId = 'all') {
  if (categoryId === 'all') return Object.values(COLLAGE_LAYOUTS);
  return Object.values(COLLAGE_LAYOUTS).filter((l) => l.category === categoryId);
}

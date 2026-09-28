
export const INCH_TO_MM = 25.4;
export const MM_TO_INCH = 1 / 25.4;
export const CM_TO_INCH = 1 / 2.54;

export const DPI_OPTIONS = [
  {
    dpi: 150,
    name: '150 DPI (Draft / Fast)',
    tagline: 'Lightweight test prints & fast spooling',
    badge: 'Draft',
  },
  {
    dpi: 300,
    name: '300 DPI (Photo Lab · Standard)',
    tagline: 'Standard recommendation for crisp photographic prints',
    badge: 'Recommended',
  },
  {
    dpi: 600,
    name: '600 DPI (Ultra Fine Art)',
    tagline: 'Maximum fidelity for gallery-grade pigment printing',
    badge: 'Ultra',
  },
];

export const PAPER_SIZE_PRESETS = [
  {
    id: 'photo_2x3',
    name: '2 × 3 in (Mini Snap)',
    widthIn: 2.0,
    heightIn: 3.0,
    category: 'photo',
    description: 'Pocket & wallet size photo prints (51 × 76 mm)',
  },
  {
    id: 'photo_3x4',
    name: '3 × 4 in (Medium Photo)',
    widthIn: 3.0,
    heightIn: 4.0,
    category: 'photo',
    description: 'Compact keepsake portrait print (76 × 102 mm)',
  },
  {
    id: 'photo_4x6',
    name: '4 × 6 in (Standard Lab)',
    widthIn: 4.0,
    heightIn: 6.0,
    category: 'photo',
    description: 'Classic universal 10 × 15 cm photobooth lab print',
  },
  {
    id: 'photo_5x7',
    name: '5 × 7 in (Framed Portrait)',
    widthIn: 5.0,
    heightIn: 7.0,
    category: 'photo',
    description: 'High-impact framing portrait size (127 × 178 mm)',
  },
  {
    id: 'photo_8x10',
    name: '8 × 10 in (Large Gallery)',
    widthIn: 8.0,
    heightIn: 10.0,
    category: 'photo',
    description: 'Large showcase print & scrapbook hero (203 × 254 mm)',
  },
  {
    id: 'square_4x4',
    name: '4 × 4 in (Square Memory)',
    widthIn: 4.0,
    heightIn: 4.0,
    category: 'square',
    description: 'Balanced 1:1 square photo card (102 × 102 mm)',
  },
  {
    id: 'square_5x5',
    name: '5 × 5 in (Square Art)',
    widthIn: 5.0,
    heightIn: 5.0,
    category: 'square',
    description: 'Medium square table print (127 × 127 mm)',
  },
  {
    id: 'square_6x6',
    name: '6 × 6 in (Large Square)',
    widthIn: 6.0,
    heightIn: 6.0,
    category: 'square',
    description: 'Statement square wall tile print (152 × 152 mm)',
  },
  {
    id: 'strip_2x6',
    name: '2 × 6 in (Photobooth Strip)',
    widthIn: 2.0,
    heightIn: 6.0,
    category: 'strip',
    description: 'Authentic 1:3 vertical photobooth strip (51 × 152 mm)',
  },
  {
    id: 'custom',
    name: 'Custom Dimensions...',
    widthIn: 4.0,
    heightIn: 6.0,
    category: 'custom',
    description: 'Specify custom width, height, and measurement units',
  },
];

export const MARGIN_PRESETS = [
  { id: 'none', name: 'None (0 mm · Borderless)', mm: 0 },
  { id: 'small', name: 'Small (3 mm · Trim Safe)', mm: 3 },
  { id: 'standard', name: 'Standard (6 mm · Classic)', mm: 6 },
  { id: 'large', name: 'Large (12 mm · Wide Mat)', mm: 12 },
  { id: 'custom', name: 'Custom Margins...', mm: 6 },
];

export const BLEED_PRESETS = [
  { id: 'none', name: 'None (0 mm)', mm: 0 },
  { id: '2mm', name: '2 mm Bleed', mm: 2 },
  { id: '3mm', name: '3 mm Bleed (Standard)', mm: 3 },
  { id: '5mm', name: '5 mm Bleed (Commercial)', mm: 5 },
  { id: 'custom', name: 'Custom Bleed...', mm: 3 },
];

export const PAPER_COLORS = [
  { id: 'pure_white', name: 'Pure White', hex: '#FFFFFF', isDark: false },
  { id: 'warm_white', name: 'Warm White', hex: '#FAF6EE', isDark: false },
  { id: 'soft_cream', name: 'Soft Cream', hex: '#EFE5D5', isDark: false },
  { id: 'oatmeal', name: 'Oatmeal Paper', hex: '#F4EFE6', isDark: false },
];

export const BORDER_STYLES = [
  { id: 'none', name: 'None' },
  { id: 'thin', name: 'Thin Line' },
  { id: 'classic', name: 'Classic Mat' },
  { id: 'photobooth', name: 'Photobooth White' },
];

export class PrintUnitConverter {
  static toInches(val, unit = 'in') {
    const num = parseFloat(val) || 0;
    if (unit === 'mm') return num * MM_TO_INCH;
    if (unit === 'cm') return num * CM_TO_INCH;
    return num;
  }

  static toMm(val, unit = 'in') {
    const num = parseFloat(val) || 0;
    if (unit === 'in') return num * INCH_TO_MM;
    if (unit === 'cm') return num * 10;
    return num;
  }

  static toPixels(inches, dpi = 300) {
    return Math.round(inches * dpi);
  }

  static pixelsToInches(pixels, dpi = 300) {
    return pixels / dpi;
  }

  static mmToPixels(mm, dpi = 300) {
    return Math.round((mm * MM_TO_INCH) * dpi);
  }
}

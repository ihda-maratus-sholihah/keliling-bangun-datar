import {
  EdgeSegment,
  PerimeterCalculation,
  ShapeDimensions,
  ShapeType,
  TriangleKind,
} from '../types';

export const DEFAULT_DIMENSIONS: ShapeDimensions = {
  sisi: 6,
  panjang: 8,
  lebar: 5,
  triangleKind: 'sama-sisi',
  sisiA: 6,
  sisiB: 6,
  sisiC: 6,
};

export interface ShapeMetadata {
  id: ShapeType;
  name: string;
  shortDesc: string;
  accentHex: string;
  fillHex: string;
  borderClass: string;
  textClass: string;
  softBgClass: string;
  properties: string[];
  realWorldExamples: string[];
  formulaLabel: string;
  tipBuIhda: string;
}

export const SHAPE_CATALOG: Record<ShapeType, ShapeMetadata> = {
  persegi: {
    id: 'persegi',
    name: 'Persegi',
    shortDesc: 'Memiliki 4 sisi sama panjang dan 4 sudut siku-siku.',
    accentHex: '#2563EB',
    fillHex: 'rgba(37, 99, 235, 0.14)',
    borderClass: 'border-blue-200',
    textClass: 'text-blue-700',
    softBgClass: 'bg-blue-50',
    properties: [
      'Memiliki 4 sisi yang semua panjangnya sama (s).',
      'Memiliki 4 sudut siku-siku (90°).',
      'Memiliki 4 simetri lipat dan 4 simetri putar.',
    ],
    realWorldExamples: ['Ubin keramik lantai kelas', 'Papan catur', 'Saputangan'],
    formulaLabel: 'K = 4 × s',
    tipBuIhda:
      'Karena keempat sisi persegi selalu sama panjang, kamu cukup menjumlahkan sisi sebanyak 4 kali atau langsung mengalikan 4 × s!',
  },
  'persegi-panjang': {
    id: 'persegi-panjang',
    name: 'Persegi Panjang',
    shortDesc: 'Memiliki 2 pasang sisi berhadapan yang sejajar dan sama panjang.',
    accentHex: '#059669',
    fillHex: 'rgba(5, 150, 105, 0.14)',
    borderClass: 'border-emerald-200',
    textClass: 'text-emerald-700',
    softBgClass: 'bg-emerald-50',
    properties: [
      'Memiliki 2 sisi panjang (p) yang sama dan 2 sisi lebar (l) yang sama.',
      'Memiliki 4 sudut siku-siku (90°).',
      'Memiliki 2 simetri lipat dan 2 simetri putar.',
    ],
    realWorldExamples: ['Papan tulis kelas', 'Buku tulis', 'Pintu kelas & lapangan upacara'],
    formulaLabel: 'K = 2 × (p + l)',
    tipBuIhda:
      'Ingat ya nak, jumlahkan dulu panjang (p) + lebar (l) di dalam kurung, baru kalikan dengan 2 supaya cepat dan teliti!',
  },
  segitiga: {
    id: 'segitiga',
    name: 'Segitiga',
    shortDesc: 'Bangun datar dengan 3 sisi lurus dan 3 titik sudut.',
    accentHex: '#EA580C',
    fillHex: 'rgba(234, 88, 12, 0.14)',
    borderClass: 'border-orange-200',
    textClass: 'text-orange-700',
    softBgClass: 'bg-orange-50',
    properties: [
      'Memiliki 3 sisi (a, b, dan c) dan 3 titik sudut.',
      'Segitiga sama sisi: ketiga sisinya sama panjang.',
      'Segitiga sama kaki: dua sisi miringnya sama panjang.',
    ],
    realWorldExamples: ['Penggaris segitiga', 'Rambu lalu lintas', 'Bendera regu pramuka'],
    formulaLabel: 'K = a + b + c',
    tipBuIhda:
      'Apapun jenis segitiganya—sama sisi, sama kaki, atau siku-siku—kelilingnya selalu jumlah dari ketiga sisinya: a + b + c.',
  },
};

export const SHAPE_LIST: ShapeType[] = ['segitiga', 'persegi', 'persegi-panjang'];

export function getTriangleSides(
  kind: TriangleKind,
  sisiA: number,
  sisiB: number,
  sisiC: number
): [number, number, number] {
  if (kind === 'sama-sisi') {
    const s = Math.max(2, Math.round(sisiA));
    return [s, s, s];
  }
  if (kind === 'sama-kaki') {
    const alas = Math.max(2, Math.round(sisiA));
    // Ensure triangle inequality: 2 * kaki > alas
    const minKaki = Math.floor(alas / 2) + 1;
    const kaki = Math.max(minKaki, Math.round(sisiB));
    return [alas, kaki, kaki];
  }
  // Right triangle Pythagorean presets or valid right triangle sides
  const a = Math.max(3, Math.round(sisiA));
  const b = Math.max(3, Math.round(sisiB));
  const c = sisiC > 0 ? Math.round(sisiC) : Math.round(Math.hypot(a, b));
  // Ensure valid triangle inequality
  if (a + b <= c || a + c <= b || b + c <= a) {
    return [3, 4, 5];
  }
  return [a, b, c];
}

export const RIGHT_TRIANGLE_PRESETS: { label: string; a: number; b: number; c: number }[] = [
  { label: '3 cm, 4 cm, 5 cm', a: 4, b: 3, c: 5 },
  { label: '6 cm, 8 cm, 10 cm', a: 8, b: 6, c: 10 },
  { label: '5 cm, 12 cm, 13 cm', a: 12, b: 5, c: 13 },
];

export function calculatePerimeter(
  shape: ShapeType,
  dims: ShapeDimensions
): PerimeterCalculation {
  if (shape === 'persegi') {
    const s = Math.max(1, Math.round(dims.sisi));
    const perimeter = 4 * s;
    return {
      shape,
      perimeter,
      sides: [s, s, s, s],
      formulaSymbolic: 'K = 4 × s',
      formulaExpansion: `${s} + ${s} + ${s} + ${s}`,
      formulaSummary: `4 × ${s} = ${perimeter} cm`,
      stepByStep: [
        `Panjang setiap sisi persegi (s) = ${s} cm.`,
        `Jumlahkan keempat sisinya: ${s} + ${s} + ${s} + ${s}.`,
        `Atau gunakan rumus cepat: K = 4 × ${s} = ${perimeter} cm.`,
      ],
      unit: 'cm',
    };
  }

  if (shape === 'persegi-panjang') {
    const p = Math.max(1, Math.round(dims.panjang));
    const l = Math.max(1, Math.round(dims.lebar));
    const perimeter = 2 * (p + l);
    return {
      shape,
      perimeter,
      sides: [p, l, p, l],
      formulaSymbolic: 'K = 2 × (p + l)',
      formulaExpansion: `${p} + ${l} + ${p} + ${l}`,
      formulaSummary: `2 × (${p} + ${l}) = 2 × ${p + l} = ${perimeter} cm`,
      stepByStep: [
        `Diketahui panjang (p) = ${p} cm dan lebar (l) = ${l} cm.`,
        `Jumlahkan panjang dan lebar: ${p} + ${l} = ${p + l} cm.`,
        `Kalikan dengan 2: K = 2 × ${p + l} = ${perimeter} cm.`,
      ],
      unit: 'cm',
    };
  }

  // Segitiga
  const [a, b, c] = getTriangleSides(dims.triangleKind, dims.sisiA, dims.sisiB, dims.sisiC);
  const perimeter = a + b + c;
  const isEquilateral = a === b && b === c;
  return {
    shape: 'segitiga',
    perimeter,
    sides: [a, b, c],
    formulaSymbolic: isEquilateral ? 'K = 3 × s (atau a + b + c)' : 'K = a + b + c',
    formulaExpansion: `${a} + ${b} + ${c}`,
    formulaSummary: isEquilateral
      ? `${a} + ${b} + ${c} = 3 × ${a} = ${perimeter} cm`
      : `${a} + ${b} + ${c} = ${perimeter} cm`,
    stepByStep: [
      `Diketahui ketiga sisi segitiga: sisi a = ${a} cm, sisi b = ${b} cm, sisi c = ${c} cm.`,
      `Keliling segitiga adalah jumlah seluruh panjang sisinya.`,
      `Hitung jumlahnya: ${a} + ${b} + ${c} = ${perimeter} cm.`,
    ],
    unit: 'cm',
  };
}

export interface GeometryRenderModel {
  viewBoxWidth: number;
  viewBoxHeight: number;
  points: { x: number; y: number }[];
  edges: EdgeSegment[];
  rightAngleCorners: { x: number; y: number; dx: number; dy: number }[];
  symmetryLines: { x1: number; y1: number; x2: number; y2: number }[];
}

export function buildGeometryModel(
  shape: ShapeType,
  dims: ShapeDimensions,
  unknownLabel?: string
): GeometryRenderModel {
  const W = 440;
  const H = 260;
  const padX = 84;
  const padY = 48;
  const availW = W - padX * 2;
  const availH = H - padY * 2;

  if (shape === 'persegi') {
    const s = Math.max(1, Math.round(dims.sisi));
    // Scale proportionally between min 56% and max 100% of available height so shape is always prominent
    const clampedRatio = Math.min(1, Math.max(0.56, 0.44 + (s / 12) * 0.56));
    const sidePx = Math.min(availW, availH) * clampedRatio;
    const x0 = (W - sidePx) / 2;
    const y0 = (H - sidePx) / 2;
    const x1 = x0 + sidePx;
    const y1 = y0 + sidePx;

    const sLabel = unknownLabel ? `${unknownLabel}` : `${s} cm`;
    const points = [
      { x: x0, y: y0 },
      { x: x1, y: y0 },
      { x: x1, y: y1 },
      { x: x0, y: y1 },
    ];
    const edges: EdgeSegment[] = [
      { id: 'atas', label: sLabel, length: s, x1: x0, y1: y0, x2: x1, y2: y0, labelX: (x0 + x1) / 2, labelY: y0 - 16 },
      { id: 'kanan', label: sLabel, length: s, x1: x1, y1: y0, x2: x1, y2: y1, labelX: x1 + 34, labelY: (y0 + y1) / 2 },
      { id: 'bawah', label: sLabel, length: s, x1: x1, y1: y1, x2: x0, y2: y1, labelX: (x0 + x1) / 2, labelY: y1 + 24 },
      { id: 'kiri', label: sLabel, length: s, x1: x0, y1: y1, x2: x0, y2: y0, labelX: x0 - 34, labelY: (y0 + y1) / 2 },
    ];
    return {
      viewBoxWidth: W,
      viewBoxHeight: H,
      points,
      edges,
      rightAngleCorners: [
        { x: x0, y: y0, dx: 12, dy: 12 },
        { x: x1, y: y0, dx: -12, dy: 12 },
        { x: x1, y: y1, dx: -12, dy: -12 },
        { x: x0, y: y1, dx: 12, dy: -12 },
      ],
      symmetryLines: [
        { x1: (x0 + x1) / 2, y1: y0 - 12, x2: (x0 + x1) / 2, y2: y1 + 12 },
        { x1: x0 - 12, y1: (y0 + y1) / 2, x2: x1 + 12, y2: (y0 + y1) / 2 },
      ],
    };
  }

  if (shape === 'persegi-panjang') {
    const p = Math.max(1, Math.round(dims.panjang));
    const l = Math.max(1, Math.round(dims.lebar));
    const maxDim = Math.max(p, l, 10);
    const scale = Math.min(availW / Math.max(p, 4), availH / Math.max(l, 4), 24);
    const wPx = Math.max(84, Math.min(availW, p * scale * (Math.max(p, l) / maxDim > 0.6 ? 1 : 0.9)));
    const hPx = Math.max(60, Math.min(availH, l * scale * (Math.max(p, l) / maxDim > 0.6 ? 1 : 0.9)));
    const x0 = (W - wPx) / 2;
    const y0 = (H - hPx) / 2;
    const x1 = x0 + wPx;
    const y1 = y0 + hPx;

    const pLabel = unknownLabel === 'p = ?' ? 'p = ?' : `${p} cm`;
    const lLabel = unknownLabel === 'l = ?' ? 'l = ?' : `${l} cm`;

    const points = [
      { x: x0, y: y0 },
      { x: x1, y: y0 },
      { x: x1, y: y1 },
      { x: x0, y: y1 },
    ];
    const edges: EdgeSegment[] = [
      { id: 'panjang-atas', label: pLabel, length: p, x1: x0, y1: y0, x2: x1, y2: y0, labelX: (x0 + x1) / 2, labelY: y0 - 16 },
      { id: 'lebar-kanan', label: lLabel, length: l, x1: x1, y1: y0, x2: x1, y2: y1, labelX: x1 + 36, labelY: (y0 + y1) / 2 },
      { id: 'panjang-bawah', label: pLabel, length: p, x1: x1, y1: y1, x2: x0, y2: y1, labelX: (x0 + x1) / 2, labelY: y1 + 24 },
      { id: 'lebar-kiri', label: lLabel, length: l, x1: x0, y1: y1, x2: x0, y2: y0, labelX: x0 - 36, labelY: (y0 + y1) / 2 },
    ];
    return {
      viewBoxWidth: W,
      viewBoxHeight: H,
      points,
      edges,
      rightAngleCorners: [
        { x: x0, y: y0, dx: 12, dy: 12 },
        { x: x1, y: y0, dx: -12, dy: 12 },
        { x: x1, y: y1, dx: -12, dy: -12 },
        { x: x0, y: y1, dx: 12, dy: -12 },
      ],
      symmetryLines: [
        { x1: (x0 + x1) / 2, y1: y0 - 12, x2: (x0 + x1) / 2, y2: y1 + 12 },
        { x1: x0 - 12, y1: (y0 + y1) / 2, x2: x1 + 12, y2: (y0 + y1) / 2 },
      ],
    };
  }

  // Segitiga
  const [a, b, c] = getTriangleSides(dims.triangleKind, dims.sisiA, dims.sisiB, dims.sisiC);
  // Base is side a along the bottom; compute triangle apex using Law of Cosines
  // A = (0, 0), B = (a, 0), AC = b, BC = c
  const xApexMath = (a * a + b * b - c * c) / (2 * a);
  const yApexMath = Math.sqrt(Math.max(0.5, b * b - xApexMath * xApexMath));

  const minXMath = Math.min(0, xApexMath);
  const maxXMath = Math.max(a, xApexMath);
  const spanX = Math.max(1, maxXMath - minXMath);
  const spanY = Math.max(1, yApexMath);

  const maxDisplayScale = Math.min(availW / spanX, availH / spanY);
  // Scale modestly with actual size so sliders visibly grow/shrink the shape
  const sizeFactor = Math.min(1, Math.max(0.58, Math.max(a, b, c) / 11));
  const scale = maxDisplayScale * sizeFactor;

  const drawW = spanX * scale;
  const drawH = spanY * scale;
  const offsetX = (W - drawW) / 2 - minXMath * scale;
  const baseY = (H + drawH) / 2;

  const pLeft = { x: offsetX, y: baseY };
  const pRight = { x: offsetX + a * scale, y: baseY };
  const pTop = { x: offsetX + xApexMath * scale, y: baseY - yApexMath * scale };

  const aLabel = unknownLabel === 'a = ?' ? 'a = ?' : `${a} cm`;
  const bLabel = unknownLabel === 'b = ?' ? 'b = ?' : `${b} cm`;
  const cLabel = unknownLabel === 'c = ?' ? 'c = ?' : `${c} cm`;

  const edges: EdgeSegment[] = [
    {
      id: 'alas',
      label: aLabel,
      length: a,
      x1: pLeft.x,
      y1: pLeft.y,
      x2: pRight.x,
      y2: pRight.y,
      labelX: (pLeft.x + pRight.x) / 2,
      labelY: baseY + 24,
    },
    {
      id: 'sisi-kanan',
      label: cLabel,
      length: c,
      x1: pRight.x,
      y1: pRight.y,
      x2: pTop.x,
      y2: pTop.y,
      labelX: (pRight.x + pTop.x) / 2 + 28,
      labelY: (pRight.y + pTop.y) / 2 - 4,
    },
    {
      id: 'sisi-kiri',
      label: bLabel,
      length: b,
      x1: pTop.x,
      y1: pTop.y,
      x2: pLeft.x,
      y2: pLeft.y,
      labelX: (pLeft.x + pTop.x) / 2 - 28,
      labelY: (pLeft.y + pTop.y) / 2 - 4,
    },
  ];

  const isRightAngleAtLeft = Math.abs(xApexMath) < 0.01;
  const rightAngleCorners = isRightAngleAtLeft
    ? [{ x: pLeft.x, y: pLeft.y, dx: 12, dy: -12 }]
    : [];

  const symmetryLines =
    dims.triangleKind === 'sama-sisi' || dims.triangleKind === 'sama-kaki'
      ? [{ x1: pTop.x, y1: pTop.y - 12, x2: (pLeft.x + pRight.x) / 2, y2: baseY + 12 }]
      : [];

  return {
    viewBoxWidth: W,
    viewBoxHeight: H,
    points: [pLeft, pRight, pTop],
    edges,
    rightAngleCorners,
    symmetryLines,
  };
}

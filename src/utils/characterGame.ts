import { CharacterId, ShapeType } from '../types';

export interface CharacterProfile {
  id: CharacterId;
  name: string;
  species: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  cheekColor: string;
  pickupName: string;
}

export const CHARACTERS: CharacterProfile[] = [
  {
    id: 'kiko',
    name: 'Kiko',
    species: 'Kelinci Ceria',
    tagline: 'Lincah melompat mengelilingi sisi taman sambil membawa pita ukur!',
    primaryColor: '#FFFFFF',
    accentColor: '#EA580C',
    cheekColor: '#FDA4AF',
    pickupName: 'Wortel Bintang',
  },
  {
    id: 'milo',
    name: 'Milo',
    species: 'Kucing Pintar',
    tagline: 'Teliti menghitung setiap sudut bangun datar di halaman sekolah!',
    primaryColor: '#FDE68A',
    accentColor: '#2563EB',
    cheekColor: '#FCA5A5',
    pickupName: 'Ikan Bintang',
  },
  {
    id: 'bibi',
    name: 'Bibi',
    species: 'Bebek Petualang',
    tagline: 'Semangat menjelajah segitiga, persegi, dan persegi panjang!',
    primaryColor: '#FACC15',
    accentColor: '#059669',
    cheekColor: '#FB923C',
    pickupName: 'Bintang Emas',
  },
];

export interface Vec2 {
  x: number;
  y: number;
}

export interface AdventureEdgeCheckpoint {
  id: string;
  x: number; // world coordinates inside 640x380 arena
  y: number;
  sideLength: number;
  label: string;
}

export interface BeePatrolSpec {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  speed: number;
  phase: number;
}

export interface AdventureLevel {
  level: number;
  title: string;
  shape: ShapeType;
  shapeName: string;
  story: string;
  vertices: Vec2[];
  sides: number[];
  perimeter: number;
  checkpoints: AdventureEdgeCheckpoint[];
  spawn: Vec2;
  gatePos: Vec2;
  bees: BeePatrolSpec[];
  gateOptions: number[];
  hintFormula: string;
}

export const ARENA_WIDTH = 640;
export const ARENA_HEIGHT = 380;

function midpoint(a: Vec2, b: Vec2): Vec2 {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function makeEdgeCheckpoints(vertices: Vec2[], sides: number[]): AdventureEdgeCheckpoint[] {
  return vertices.map((v, idx) => {
    const next = vertices[(idx + 1) % vertices.length];
    const mid = midpoint(v, next);
    return {
      id: `cp-${idx}`,
      x: mid.x,
      y: mid.y,
      sideLength: sides[idx],
      label: `${sides[idx]} cm`,
    };
  });
}

const L1_VERTS: Vec2[] = [
  { x: 220, y: 90 },
  { x: 420, y: 90 },
  { x: 420, y: 290 },
  { x: 220, y: 290 },
];

const L2_VERTS: Vec2[] = [
  { x: 155, y: 105 },
  { x: 485, y: 105 },
  { x: 485, y: 275 },
  { x: 155, y: 275 },
];

const L3_VERTS: Vec2[] = [
  { x: 320, y: 74 },
  { x: 460, y: 295 },
  { x: 180, y: 295 },
];

const L4_VERTS: Vec2[] = [
  { x: 135, y: 95 },
  { x: 505, y: 95 },
  { x: 505, y: 285 },
  { x: 135, y: 285 },
];

const L5_VERTS: Vec2[] = [
  { x: 320, y: 68 },
  { x: 475, y: 298 },
  { x: 165, y: 298 },
];

export const ADVENTURE_LEVELS: AdventureLevel[] = [
  {
    level: 1,
    title: 'Taman Persegi Ceria',
    shape: 'persegi',
    shapeName: 'Persegi',
    story: 'Kumpulkan semua pos di keempat sisi persegi bersisi 5 cm, lalu buka Gerbang Harta!',
    vertices: L1_VERTS,
    sides: [5, 5, 5, 5],
    perimeter: 20,
    checkpoints: makeEdgeCheckpoints(L1_VERTS, [5, 5, 5, 5]),
    spawn: { x: 220, y: 90 },
    gatePos: { x: 320, y: 190 },
    bees: [{ cx: 320, cy: 190, rx: 48, ry: 44, speed: 1.5, phase: 0 }],
    gateOptions: [15, 20, 25],
    hintFormula: 'K = 5 + 5 + 5 + 5 = 4 × 5 = 20 cm',
  },
  {
    level: 2,
    title: 'Kebun Persegi Panjang',
    shape: 'persegi-panjang',
    shapeName: 'Persegi Panjang',
    story: 'Kelilingi kebun sekolah (panjang 8 cm, lebar 4 cm) sambil hindari lebah penjaga!',
    vertices: L2_VERTS,
    sides: [8, 4, 8, 4],
    perimeter: 24,
    checkpoints: makeEdgeCheckpoints(L2_VERTS, [8, 4, 8, 4]),
    spawn: { x: 155, y: 105 },
    gatePos: { x: 320, y: 190 },
    bees: [{ cx: 320, cy: 190, rx: 90, ry: 34, speed: 1.75, phase: 0.6 }],
    gateOptions: [12, 24, 32],
    hintFormula: 'K = 2 × (8 + 4) = 2 × 12 = 24 cm',
  },
  {
    level: 3,
    title: 'Bukit Segitiga Sama Sisi',
    shape: 'segitiga',
    shapeName: 'Segitiga Sama Sisi',
    story: 'Jelajahi 3 sisi bukit segitiga sama sisi masing-masing 7 cm untuk meraih peti harta!',
    vertices: L3_VERTS,
    sides: [7, 7, 7],
    perimeter: 21,
    checkpoints: makeEdgeCheckpoints(L3_VERTS, [7, 7, 7]),
    spawn: { x: 180, y: 295 },
    gatePos: { x: 320, y: 222 },
    bees: [{ cx: 320, cy: 215, rx: 52, ry: 36, speed: 1.9, phase: 1.2 }],
    gateOptions: [14, 21, 28],
    hintFormula: 'K = 7 + 7 + 7 = 21 cm',
  },
  {
    level: 4,
    title: 'Lapangan Upacara Sekolah',
    shape: 'persegi-panjang',
    shapeName: 'Persegi Panjang',
    story: 'Hati-hati, ada 2 lebah berpatroli! Kelilingi lapangan 9 cm × 6 cm hingga semua pos menyala.',
    vertices: L4_VERTS,
    sides: [9, 6, 9, 6],
    perimeter: 30,
    checkpoints: makeEdgeCheckpoints(L4_VERTS, [9, 6, 9, 6]),
    spawn: { x: 135, y: 95 },
    gatePos: { x: 320, y: 190 },
    bees: [
      { cx: 245, cy: 190, rx: 55, ry: 46, speed: 1.8, phase: 0 },
      { cx: 395, cy: 190, rx: 55, ry: 46, speed: 1.8, phase: Math.PI },
    ],
    gateOptions: [15, 30, 54],
    hintFormula: 'K = 2 × (9 + 6) = 2 × 15 = 30 cm',
  },
  {
    level: 5,
    title: 'Puncak Segitiga Sama Kaki',
    shape: 'segitiga',
    shapeName: 'Segitiga Sama Kaki',
    story: 'Level puncak! Kelilingi segitiga sama kaki bersisi 8 cm, 6 cm, dan 8 cm untuk menjadi Juara!',
    vertices: L5_VERTS,
    sides: [8, 6, 8],
    perimeter: 22,
    checkpoints: makeEdgeCheckpoints(L5_VERTS, [8, 6, 8]),
    spawn: { x: 165, y: 298 },
    gatePos: { x: 320, y: 225 },
    bees: [
      { cx: 320, cy: 195, rx: 64, ry: 30, speed: 2.0, phase: 0.4 },
      { cx: 320, cy: 255, rx: 85, ry: 18, speed: 1.65, phase: 2.5 },
    ],
    gateOptions: [14, 22, 24],
    hintFormula: 'K = 8 + 6 + 8 = 22 cm',
  },
];

export function clampPlayerPosition(pos: Vec2, margin = 26): Vec2 {
  return {
    x: Math.min(ARENA_WIDTH - margin, Math.max(margin, pos.x)),
    y: Math.min(ARENA_HEIGHT - margin, Math.max(margin, pos.y)),
  };
}

export function stepPlayerPosition(
  pos: Vec2,
  dirX: number,
  dirY: number,
  speedPxPerSec: number,
  dt: number
): Vec2 {
  const safeDt = Math.min(0.05, Math.max(0, dt));
  const len = Math.hypot(dirX, dirY);
  if (len === 0) return pos;
  const nx = dirX / len;
  const ny = dirY / len;
  return clampPlayerPosition({
    x: pos.x + nx * speedPxPerSec * safeDt,
    y: pos.y + ny * speedPxPerSec * safeDt,
  });
}

export function findHitCheckpoints(
  pos: Vec2,
  checkpoints: AdventureEdgeCheckpoint[],
  collectedIds: Set<string>,
  hitRadius = 30
): AdventureEdgeCheckpoint[] {
  const newlyHit: AdventureEdgeCheckpoint[] = [];
  for (const cp of checkpoints) {
    if (collectedIds.has(cp.id)) continue;
    if (Math.hypot(pos.x - cp.x, pos.y - cp.y) <= hitRadius) {
      newlyHit.push(cp);
    }
  }
  return newlyHit;
}

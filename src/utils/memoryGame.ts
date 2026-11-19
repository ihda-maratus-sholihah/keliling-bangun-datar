import { ShapeDimensions, ShapeType } from '../types';
import { calculatePerimeter, DEFAULT_DIMENSIONS } from './geometry';

export type MemoryDifficulty = 'super-mudah' | 'mudah' | 'seru';

export interface MemoryPairSpec {
  pairId: string;
  shape: ShapeType;
  shapeLabel: string;
  dimsText: string;
  dimensions: ShapeDimensions;
  perimeter: number;
}

export interface MemoryCard {
  uid: string;
  pairId: string;
  kind: 'shape' | 'perimeter';
  shape: ShapeType;
  shapeLabel: string;
  dimsText: string;
  dimensions: ShapeDimensions;
  perimeter: number;
}

const RAW_PAIR_SPECS: Array<{
  pairId: string;
  shape: ShapeType;
  shapeLabel: string;
  dimsText: string;
  dimensions: ShapeDimensions;
}> = [
  {
    pairId: 'pair-sq-5',
    shape: 'persegi',
    shapeLabel: 'Persegi',
    dimsText: 's = 5 cm',
    dimensions: { ...DEFAULT_DIMENSIONS, sisi: 5 },
  },
  {
    pairId: 'pair-rect-7-4',
    shape: 'persegi-panjang',
    shapeLabel: 'Persegi Panjang',
    dimsText: 'p = 7 cm, l = 4 cm',
    dimensions: { ...DEFAULT_DIMENSIONS, panjang: 7, lebar: 4 },
  },
  {
    pairId: 'pair-tri-eq-6',
    shape: 'segitiga',
    shapeLabel: 'Segitiga Sama Sisi',
    dimsText: '6 cm, 6 cm, 6 cm',
    dimensions: {
      ...DEFAULT_DIMENSIONS,
      triangleKind: 'sama-sisi',
      sisiA: 6,
      sisiB: 6,
      sisiC: 6,
    },
  },
  {
    pairId: 'pair-sq-8',
    shape: 'persegi',
    shapeLabel: 'Persegi',
    dimsText: 's = 8 cm',
    dimensions: { ...DEFAULT_DIMENSIONS, sisi: 8 },
  },
  {
    pairId: 'pair-rect-9-5',
    shape: 'persegi-panjang',
    shapeLabel: 'Persegi Panjang',
    dimsText: 'p = 9 cm, l = 5 cm',
    dimensions: { ...DEFAULT_DIMENSIONS, panjang: 9, lebar: 5 },
  },
  {
    pairId: 'pair-tri-iso-8-9',
    shape: 'segitiga',
    shapeLabel: 'Segitiga Sama Kaki',
    dimsText: '8 cm, 9 cm, 9 cm',
    dimensions: {
      ...DEFAULT_DIMENSIONS,
      triangleKind: 'sama-kaki',
      sisiA: 8,
      sisiB: 9,
      sisiC: 9,
    },
  },
];

export const MEMORY_PAIR_CATALOG: MemoryPairSpec[] = RAW_PAIR_SPECS.map((spec) => ({
  ...spec,
  perimeter: calculatePerimeter(spec.shape, spec.dimensions).perimeter,
}));

function seededRandom(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

export function buildMemoryDeck(difficulty: MemoryDifficulty, seed = 42): MemoryCard[] {
  const pairCount = difficulty === 'super-mudah' ? 2 : difficulty === 'mudah' ? 4 : 6;
  const chosenPairs = MEMORY_PAIR_CATALOG.slice(0, pairCount);

  const cards: MemoryCard[] = [];
  for (const p of chosenPairs) {
    cards.push({
      uid: `${p.pairId}-shape`,
      pairId: p.pairId,
      kind: 'shape',
      shape: p.shape,
      shapeLabel: p.shapeLabel,
      dimsText: p.dimsText,
      dimensions: p.dimensions,
      perimeter: p.perimeter,
    });
    cards.push({
      uid: `${p.pairId}-perimeter`,
      pairId: p.pairId,
      kind: 'perimeter',
      shape: p.shape,
      shapeLabel: p.shapeLabel,
      dimsText: p.dimsText,
      dimensions: p.dimensions,
      perimeter: p.perimeter,
    });
  }

  const rand = seededRandom(seed);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export function isMatchingPair(a: MemoryCard, b: MemoryCard): boolean {
  return a.uid !== b.uid && a.pairId === b.pairId && a.kind !== b.kind;
}

export function computeMemoryStars(moves: number, totalPairs: number): 1 | 2 | 3 {
  if (totalPairs <= 2) {
    if (moves <= 3) return 3;
    if (moves <= 5) return 2;
    return 1;
  }
  if (moves <= totalPairs + 2) return 3;
  if (moves <= totalPairs * 2) return 2;
  return 1;
}

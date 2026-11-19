import { SpeedRaceQuestion } from '../types';

export const SPEED_GAME_DURATION_SEC = 60;
export const SPEED_GAME_MAX_LIVES = 3;
export const SPEED_GAME_TOTAL_ROUNDS = 10;

interface SpeedTemplate {
  shape: SpeedRaceQuestion['shape'];
  kind: SpeedRaceQuestion['kind'];
  prompt: string;
  diagram: SpeedRaceQuestion['diagram'];
  correctValue: number;
  distractors: [number, number];
  formulaNote: string;
}

const SPEED_POOL: SpeedTemplate[] = [
  {
    shape: 'persegi',
    kind: 'keliling',
    prompt: 'Berapakah keliling persegi bersisi 5 cm?',
    diagram: { shape: 'persegi', sisi: 5 },
    correctValue: 20,
    distractors: [15, 25],
    formulaNote: 'K = 4 × 5 = 20 cm',
  },
  {
    shape: 'segitiga',
    kind: 'keliling',
    prompt: 'Keliling segitiga sama sisi bersisi 6 cm adalah ...',
    diagram: { shape: 'segitiga', triangleKind: 'sama-sisi', sisiA: 6, sisiB: 6, sisiC: 6 },
    correctValue: 18,
    distractors: [12, 24],
    formulaNote: 'K = 6 + 6 + 6 = 18 cm',
  },
  {
    shape: 'persegi-panjang',
    kind: 'keliling',
    prompt: 'Hitung keliling persegi panjang 7 cm × 4 cm!',
    diagram: { shape: 'persegi-panjang', panjang: 7, lebar: 4 },
    correctValue: 22,
    distractors: [11, 28],
    formulaNote: 'K = 2 × (7 + 4) = 22 cm',
  },
  {
    shape: 'persegi',
    kind: 'cari-sisi',
    prompt: 'Tantangan! Keliling persegi 32 cm. Berapa panjang 1 sisinya?',
    diagram: { shape: 'persegi', sisi: 8, unknownLabel: 's = ?' },
    correctValue: 8,
    distractors: [6, 16],
    formulaNote: 's = 32 ÷ 4 = 8 cm',
  },
  {
    shape: 'segitiga',
    kind: 'keliling',
    prompt: 'Keliling segitiga siku-siku bersisi 3 cm, 4 cm, dan 5 cm adalah ...',
    diagram: { shape: 'segitiga', triangleKind: 'siku-siku', sisiA: 4, sisiB: 3, sisiC: 5 },
    correctValue: 12,
    distractors: [10, 15],
    formulaNote: 'K = 3 + 4 + 5 = 12 cm',
  },
  {
    shape: 'persegi-panjang',
    kind: 'keliling',
    prompt: 'Hitung cepat! Keliling persegi panjang 9 cm × 3 cm adalah ...',
    diagram: { shape: 'persegi-panjang', panjang: 9, lebar: 3 },
    correctValue: 24,
    distractors: [12, 27],
    formulaNote: 'K = 2 × (9 + 3) = 24 cm',
  },
  {
    shape: 'segitiga',
    kind: 'keliling',
    prompt: 'Segitiga sama kaki alas 6 cm dan kaki 7 cm. Kelilingnya?',
    diagram: { shape: 'segitiga', triangleKind: 'sama-kaki', sisiA: 6, sisiB: 7, sisiC: 7 },
    correctValue: 20,
    distractors: [13, 19],
    formulaNote: 'K = 6 + 7 + 7 = 20 cm',
  },
  {
    shape: 'persegi',
    kind: 'keliling',
    prompt: 'Keliling persegi dengan panjang sisi 9 cm adalah ...',
    diagram: { shape: 'persegi', sisi: 9 },
    correctValue: 36,
    distractors: [18, 27],
    formulaNote: 'K = 4 × 9 = 36 cm',
  },
  {
    shape: 'segitiga',
    kind: 'cari-sisi',
    prompt: 'Tantangan! Keliling segitiga sama sisi 27 cm. Berapa panjang tiap sisinya?',
    diagram: { shape: 'segitiga', triangleKind: 'sama-sisi', sisiA: 9, sisiB: 9, sisiC: 9, unknownLabel: 'a = ?' },
    correctValue: 9,
    distractors: [7, 12],
    formulaNote: 's = 27 ÷ 3 = 9 cm',
  },
  {
    shape: 'persegi-panjang',
    kind: 'keliling',
    prompt: 'Keliling persegi panjang panjang 11 cm dan lebar 5 cm adalah ...',
    diagram: { shape: 'persegi-panjang', panjang: 11, lebar: 5 },
    correctValue: 32,
    distractors: [16, 55],
    formulaNote: 'K = 2 × (11 + 5) = 32 cm',
  },
  {
    shape: 'persegi',
    kind: 'keliling',
    prompt: 'Hitung cepat! Keliling persegi bersisi 10 cm adalah ...',
    diagram: { shape: 'persegi', sisi: 10 },
    correctValue: 40,
    distractors: [20, 30],
    formulaNote: 'K = 4 × 10 = 40 cm',
  },
  {
    shape: 'segitiga',
    kind: 'keliling',
    prompt: 'Keliling segitiga sama kaki alas 8 cm dan kaki 10 cm adalah ...',
    diagram: { shape: 'segitiga', triangleKind: 'sama-kaki', sisiA: 8, sisiB: 10, sisiC: 10 },
    correctValue: 28,
    distractors: [18, 26],
    formulaNote: 'K = 8 + 10 + 10 = 28 cm',
  },
];

export function generateSpeedDeck(seed = 0): SpeedRaceQuestion[] {
  // Deterministic rotation/permutation based on seed so replay feels fresh yet testable
  const offset = Math.abs(Math.floor(seed)) % SPEED_POOL.length;
  const deck: SpeedRaceQuestion[] = [];

  for (let i = 0; i < SPEED_GAME_TOTAL_ROUNDS; i++) {
    const tpl = SPEED_POOL[(offset + i) % SPEED_POOL.length];
    const rawOptions = [tpl.correctValue, tpl.distractors[0], tpl.distractors[1]];
    // Sort ascending so choices are always neat, predictable, and never leak position
    const options = [...rawOptions].sort((a, b) => a - b);

    deck.push({
      id: `speed-${seed}-${i}`,
      round: i + 1,
      shape: tpl.shape,
      kind: tpl.kind,
      prompt: tpl.prompt,
      diagram: tpl.diagram,
      options,
      correctValue: tpl.correctValue,
      formulaNote: tpl.formulaNote,
    });
  }

  return deck;
}

export function calculateSpeedPoints(nextCombo: number): number {
  const safeCombo = Math.max(1, Math.floor(nextCombo));
  return 10 + Math.min(4, safeCombo - 1) * 5;
}

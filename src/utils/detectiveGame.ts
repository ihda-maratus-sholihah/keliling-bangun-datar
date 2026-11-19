import { QuestionDiagramSpec, ShapeDimensions, ShapeType } from '../types';
import { calculatePerimeter, DEFAULT_DIMENSIONS } from './geometry';

export interface DetectiveCase {
  id: string;
  caseNumber: number;
  title: string;
  shape: ShapeType;
  shapeName: string;
  story: string;
  knownPerimeter: number;
  missingLabel: string;
  missingValue: number;
  diagram: QuestionDiagramSpec;
  options: number[];
  clues: [string, string];
  explanation: string;
}

export const DETECTIVE_CASES: DetectiveCase[] = [
  {
    id: 'det-1',
    caseNumber: 1,
    title: 'Misteri Papan Tulis Persegi',
    shape: 'persegi',
    shapeName: 'Persegi',
    story:
      'Papan mading kelas berbentuk persegi memiliki keliling tepat 24 cm, tetapi catatan panjang sisinya terhapus. Bantu detektif menemukan panjang setiap sisinya!',
    knownPerimeter: 24,
    missingLabel: 'Panjang sisi (s)',
    missingValue: 6,
    diagram: {
      shape: 'persegi',
      sisi: 6,
      unknownLabel: 's = ?',
    },
    options: [4, 6, 8, 12],
    clues: [
      'Ingat rumus keliling persegi: K = 4 × s. Jadi untuk mencari s, bagi keliling dengan 4.',
      'Hitung: s = 24 ÷ 4 = ... cm.',
    ],
    explanation: 'Karena keempat sisi persegi sama panjang, s = K ÷ 4 = 24 ÷ 4 = 6 cm.',
  },
  {
    id: 'det-2',
    caseNumber: 2,
    title: 'Misteri Meja Belajar Persegi Panjang',
    shape: 'persegi-panjang',
    shapeName: 'Persegi Panjang',
    story:
      'Taplak meja kelas berbentuk persegi panjang memiliki keliling 30 cm dan panjang 9 cm. Berapakah lebar (l) taplak meja yang hilang?',
    knownPerimeter: 30,
    missingLabel: 'Lebar (l)',
    missingValue: 6,
    diagram: {
      shape: 'persegi-panjang',
      panjang: 9,
      lebar: 6,
      unknownLabel: 'l = ?',
    },
    options: [5, 6, 7, 12],
    clues: [
      'Setengah keliling persegi panjang adalah p + l = K ÷ 2 = 30 ÷ 2 = 15 cm.',
      'Karena p = 9 cm, maka lebar l = 15 − 9 = ... cm.',
    ],
    explanation: 'Setengah keliling = 30 ÷ 2 = 15 cm. Maka lebar l = 15 − 9 = 6 cm.',
  },
  {
    id: 'det-3',
    caseNumber: 3,
    title: 'Misteri Rambu Segitiga Sama Sisi',
    shape: 'segitiga',
    shapeName: 'Segitiga Sama Sisi',
    story:
      'Papan rambu taman berbentuk segitiga sama sisi mempunyai keliling 27 cm. Ketiga sisinya sama panjang. Berapa panjang tiap sisinya?',
    knownPerimeter: 27,
    missingLabel: 'Panjang tiap sisi (s)',
    missingValue: 9,
    diagram: {
      shape: 'segitiga',
      triangleKind: 'sama-sisi',
      sisiA: 9,
      sisiB: 9,
      sisiC: 9,
      unknownLabel: 's = ?',
    },
    options: [6, 7, 9, 11],
    clues: [
      'Segitiga sama sisi memiliki 3 sisi yang sama panjang: K = 3 × s.',
      'Hitung: s = 27 ÷ 3 = ... cm.',
    ],
    explanation: 'Karena 3 sisi segitiga sama panjang, s = 27 ÷ 3 = 9 cm.',
  },
  {
    id: 'det-4',
    caseNumber: 4,
    title: 'Misteri Kebun Sayur Sekolah',
    shape: 'persegi-panjang',
    shapeName: 'Persegi Panjang',
    story:
      'Kebun sayur SD N 2 Selokaton berbentuk persegi panjang dengan keliling pagar 36 cm dan lebar 7 cm. Berapa cm panjang (p) kebun tersebut?',
    knownPerimeter: 36,
    missingLabel: 'Panjang (p)',
    missingValue: 11,
    diagram: {
      shape: 'persegi-panjang',
      panjang: 11,
      lebar: 7,
      unknownLabel: 'p = ?',
    },
    options: [9, 10, 11, 14],
    clues: [
      'Bagi keliling dengan 2 dulu: p + l = 36 ÷ 2 = 18 cm.',
      'Kurangi dengan lebar 7 cm: p = 18 − 7 = ... cm.',
    ],
    explanation: 'Setengah keliling = 36 ÷ 2 = 18 cm. Jadi panjang p = 18 − 7 = 11 cm.',
  },
  {
    id: 'det-5',
    caseNumber: 5,
    title: 'Misteri Atap Rumah Segitiga Sama Kaki',
    shape: 'segitiga',
    shapeName: 'Segitiga Sama Kaki',
    story:
      'Hiasan atap berbentuk segitiga sama kaki memiliki keliling 26 cm. Panjang sisi alasnya 8 cm, dan dua sisi kakinya sama panjang. Berapa panjang satu sisi kaki?',
    knownPerimeter: 26,
    missingLabel: 'Sisi kaki (b)',
    missingValue: 9,
    diagram: {
      shape: 'segitiga',
      triangleKind: 'sama-kaki',
      sisiA: 8,
      sisiB: 9,
      sisiC: 9,
      unknownLabel: 'kaki = ?',
    },
    options: [7, 8, 9, 10],
    clues: [
      'Kurangkan keliling dengan panjang alas terlebih dahulu: 26 − 8 = 18 cm (jumlah 2 kaki).',
      'Karena 2 sisi kaki sama panjang, bagi dua: 18 ÷ 2 = ... cm.',
    ],
    explanation: 'Sisa dua sisi kaki = 26 − 8 = 18 cm, maka panjang tiap kaki = 18 ÷ 2 = 9 cm.',
  },
  {
    id: 'det-6',
    caseNumber: 6,
    title: 'Misteri Bendera Segitiga Siku-Siku',
    shape: 'segitiga',
    shapeName: 'Segitiga Siku-Siku',
    story:
      'Bendera regu pramuka berbentuk segitiga siku-siku memiliki keliling 30 cm. Panjang alas 12 cm dan sisi tegaknya 5 cm. Berapakah panjang sisi miring (c)?',
    knownPerimeter: 30,
    missingLabel: 'Sisi miring (c)',
    missingValue: 13,
    diagram: {
      shape: 'segitiga',
      triangleKind: 'siku-siku',
      sisiA: 12,
      sisiB: 5,
      sisiC: 13,
      unknownLabel: 'c = ?',
    },
    options: [11, 12, 13, 15],
    clues: [
      'Jumlahkan dulu dua sisi yang sudah diketahui: 12 + 5 = 17 cm.',
      'Kurangkan keliling total dengan hasil penjumlahan itu: 30 − 17 = ... cm.',
    ],
    explanation: 'Sisi miring c = K − (a + b) = 30 − (12 + 5) = 30 − 17 = 13 cm.',
  },
];

export function caseToDimensions(c: DetectiveCase): ShapeDimensions {
  return {
    ...DEFAULT_DIMENSIONS,
    sisi: c.diagram.sisi ?? 6,
    panjang: c.diagram.panjang ?? 8,
    lebar: c.diagram.lebar ?? 5,
    triangleKind: c.diagram.triangleKind ?? 'sama-sisi',
    sisiA: c.diagram.sisiA ?? 6,
    sisiB: c.diagram.sisiB ?? 6,
    sisiC: c.diagram.sisiC ?? 6,
  };
}

export function verifyDetectiveCaseMath(c: DetectiveCase): boolean {
  const calc = calculatePerimeter(c.shape, caseToDimensions(c));
  return calc.perimeter === c.knownPerimeter;
}

export function evaluateDetectiveGuess(
  c: DetectiveCase,
  guess: number
): { correct: boolean; message: string } {
  if (guess === c.missingValue) {
    return {
      correct: true,
      message: `Kasus terpecahkan! ${c.missingLabel} adalah ${c.missingValue} cm. ${c.explanation}`,
    };
  }
  return {
    correct: false,
    message: `Belum tepat (${guess} cm). Coba buka Kaca Pembesar Petunjuk dan hitung kembali ya!`,
  };
}

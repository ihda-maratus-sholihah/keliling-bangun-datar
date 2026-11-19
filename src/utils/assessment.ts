import {
  AssessmentAttempt,
  AssessmentQuestion,
  GardenMission,
  PracticeQuestion,
  ShapeType,
  TopicBreakdown,
} from '../types';
import { SHAPE_CATALOG, SHAPE_LIST } from './geometry';

export const KKM_SCORE = 75;

export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'lat-1',
    shape: 'persegi',
    title: 'Ubin Kelas Persegi',
    prompt:
      'Sebuah ubin keramik berbentuk persegi memiliki panjang sisi 7 cm. Berapakah keliling ubin tersebut?',
    diagram: { shape: 'persegi', sisi: 7 },
    options: [
      { label: 'A', value: 14, text: '14 cm' },
      { label: 'B', value: 21, text: '21 cm' },
      { label: 'C', value: 28, text: '28 cm' },
      { label: 'D', value: 49, text: '49 cm' },
    ],
    correctValue: 28,
    hint: 'Persegi memiliki 4 sisi yang sama panjang. Gunakan rumus K = 4 × s.',
    explanation: [
      'Diketahui panjang sisi persegi (s) = 7 cm.',
      'Rumus keliling persegi: K = 4 × s.',
      'K = 4 × 7 cm = 28 cm.',
    ],
  },
  {
    id: 'lat-2',
    shape: 'persegi-panjang',
    title: 'Papan Mading Kelas',
    prompt:
      'Papan mading kelas SD N 2 Selokaton berbentuk persegi panjang dengan panjang 9 cm dan lebar 5 cm pada denah. Berapakah kelilingnya?',
    diagram: { shape: 'persegi-panjang', panjang: 9, lebar: 5 },
    options: [
      { label: 'A', value: 14, text: '14 cm' },
      { label: 'B', value: 24, text: '24 cm' },
      { label: 'C', value: 28, text: '28 cm' },
      { label: 'D', value: 45, text: '45 cm' },
    ],
    correctValue: 28,
    hint: 'Gunakan rumus keliling persegi panjang: K = 2 × (p + l). Jumlahkan 9 + 5 dulu, lalu kalikan 2.',
    explanation: [
      'Diketahui panjang (p) = 9 cm dan lebar (l) = 5 cm.',
      'Hitung di dalam kurung: p + l = 9 + 5 = 14 cm.',
      'Kalikan 2: K = 2 × 14 cm = 28 cm.',
    ],
  },
  {
    id: 'lat-3',
    shape: 'segitiga',
    title: 'Bendera Regu Pramuka',
    prompt:
      'Bendera regu berbentuk segitiga sama sisi dengan panjang setiap sisinya 8 cm. Berapakah keliling bendera itu?',
    diagram: { shape: 'segitiga', triangleKind: 'sama-sisi', sisiA: 8, sisiB: 8, sisiC: 8 },
    options: [
      { label: 'A', value: 16, text: '16 cm' },
      { label: 'B', value: 24, text: '24 cm' },
      { label: 'C', value: 32, text: '32 cm' },
      { label: 'D', value: 64, text: '64 cm' },
    ],
    correctValue: 24,
    hint: 'Segitiga sama sisi memiliki 3 sisi yang sama panjang: K = 8 + 8 + 8 atau 3 × 8.',
    explanation: [
      'Ketiga sisi segitiga sama panjang, yaitu 8 cm.',
      'K = a + b + c = 8 + 8 + 8.',
      'Jadi, keliling bendera = 24 cm.',
    ],
  },
  {
    id: 'lat-4',
    shape: 'segitiga',
    title: 'Penggaris Segitiga Siku-siku',
    prompt:
      'Sebuah penggaris segitiga siku-siku memiliki panjang sisi 6 cm, 8 cm, dan 10 cm. Berapakah keliling penggaris tersebut?',
    diagram: { shape: 'segitiga', triangleKind: 'siku-siku', sisiA: 8, sisiB: 6, sisiC: 10 },
    options: [
      { label: 'A', value: 18, text: '18 cm' },
      { label: 'B', value: 22, text: '22 cm' },
      { label: 'C', value: 24, text: '24 cm' },
      { label: 'D', value: 48, text: '48 cm' },
    ],
    correctValue: 24,
    hint: 'Jumlahkan ketiga sisi segitiga secara berurutan: 6 + 8 + 10.',
    explanation: [
      'Diketahui panjang sisi-sisinya adalah 6 cm, 8 cm, dan 10 cm.',
      'K = 6 + 8 + 10 = 24 cm.',
    ],
  },
  {
    id: 'lat-5',
    shape: 'persegi',
    title: 'Mencari Sisi Saputangan',
    prompt:
      'Keliling sebuah saputangan berbentuk persegi adalah 36 cm. Berapakah panjang setiap sisinya?',
    diagram: { shape: 'persegi', sisi: 9, unknownLabel: 's = ?' },
    options: [
      { label: 'A', value: 6, text: '6 cm' },
      { label: 'B', value: 8, text: '8 cm' },
      { label: 'C', value: 9, text: '9 cm' },
      { label: 'D', value: 12, text: '12 cm' },
    ],
    correctValue: 9,
    hint: 'Karena K = 4 × s, untuk mencari sisi (s) kita bagi keliling dengan 4: s = K ÷ 4.',
    explanation: [
      'Diketahui keliling persegi (K) = 36 cm.',
      'Panjang sisi (s) = K ÷ 4 = 36 ÷ 4 = 9 cm.',
    ],
  },
  {
    id: 'lat-6',
    shape: 'persegi-panjang',
    title: 'Menghias Bingkai Foto',
    prompt:
      'Dina ingin menghias tepi bingkai foto persegi panjang dengan pita. Panjang bingkai 12 cm dan lebarnya 8 cm. Berapa cm pita yang dibutuhkan?',
    diagram: { shape: 'persegi-panjang', panjang: 12, lebar: 8 },
    options: [
      { label: 'A', value: 20, text: '20 cm' },
      { label: 'B', value: 32, text: '32 cm' },
      { label: 'C', value: 40, text: '40 cm' },
      { label: 'D', value: 96, text: '96 cm' },
    ],
    correctValue: 40,
    hint: 'Panjang pita di tepi bingkai sama dengan keliling bingkai: K = 2 × (12 + 8).',
    explanation: [
      'Panjang pita yang dibutuhkan = Keliling persegi panjang.',
      'K = 2 × (12 + 8) = 2 × 20 = 40 cm.',
    ],
  },
];

export const GARDEN_MISSIONS: GardenMission[] = [
  {
    id: 'misi-1',
    title: 'Kebun Bunga Persegi',
    story:
      'Ibu Ihda mengajak kelas membuat pagar kebun bunga berbentuk Persegi dengan keliling tepat 24 cm pada maket kelas.',
    shape: 'persegi',
    targetPerimeter: 24,
    hint: 'Keliling persegi = 4 × sisi. Angka berapa jika dikali 4 hasilnya 24?',
    starsReward: 3,
  },
  {
    id: 'misi-2',
    title: 'Kolam Ikan Persegi Panjang',
    story:
      'Buatlah bingkai kolam ikan berbentuk Persegi Panjang yang memiliki keliling tepat 26 cm!',
    shape: 'persegi-panjang',
    targetPerimeter: 26,
    hint: 'Karena 2 × (p + l) = 26, berarti p + l harus sama dengan 13 cm (misalnya 8 dan 5, atau 9 dan 4).',
    starsReward: 3,
  },
  {
    id: 'misi-3',
    title: 'Tenda Pramuka Segitiga Sama Sisi',
    story:
      'Rancang hiasan tenda berbentuk Segitiga Sama Sisi dengan keliling tepat 21 cm.',
    shape: 'segitiga',
    triangleKind: 'sama-sisi',
    targetPerimeter: 21,
    hint: 'Ketiga sisi segitiga sama sisi selalu sama panjang: 21 ÷ 3 = 7 cm.',
    starsReward: 3,
  },
  {
    id: 'misi-4',
    title: 'Taman Baca Persegi Panjang',
    story:
      'Buat pagar area taman baca berbentuk Persegi Panjang dengan keliling tepat 32 cm!',
    shape: 'persegi-panjang',
    targetPerimeter: 32,
    hint: 'Cari pasangan panjang dan lebar yang jika dijumlahkan hasilnya 16 cm (karena 2 × 16 = 32).',
    starsReward: 3,
  },
  {
    id: 'misi-5',
    title: 'Atap Rumah Segitiga Sama Kaki',
    story:
      'Buat bentuk atap rumah Segitiga Sama Kaki yang kelilingnya tepat 22 cm!',
    shape: 'segitiga',
    triangleKind: 'sama-kaki',
    targetPerimeter: 22,
    hint: 'Keliling = alas + kaki + kaki = 22. Coba alas 6 cm dan kaki 8 cm (6 + 8 + 8 = 22)!',
    starsReward: 3,
  },
  {
    id: 'misi-6',
    title: 'Pot Tanaman Persegi Besar',
    story:
      'Selesaikan misi terakhir! Buat bingkai pot tanaman Persegi dengan keliling tepat 40 cm.',
    shape: 'persegi',
    targetPerimeter: 40,
    hint: 'Keliling 40 cm dibagi 4 sisi sama panjang menghasilkan sisi 10 cm.',
    starsReward: 3,
  },
];

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'as-1',
    number: 1,
    shape: 'persegi',
    category: 'Konsep',
    prompt: 'Rumus yang tepat untuk menghitung keliling bangun datar persegi dengan panjang sisi s adalah ...',
    diagram: { shape: 'persegi', sisi: 5 },
    options: [
      { key: 'A', text: 'K = s × s' },
      { key: 'B', text: 'K = 4 × s' },
      { key: 'C', text: 'K = 2 × s' },
      { key: 'D', text: 'K = 3 × s' },
    ],
    correctKey: 'B',
    explanation: 'Persegi memiliki 4 sisi yang sama panjang sehingga kelilingnya K = s + s + s + s = 4 × s.',
  },
  {
    id: 'as-2',
    number: 2,
    shape: 'persegi',
    category: 'Hitung Keliling',
    prompt: 'Perhatikan gambar persegi di samping. Jika panjang sisinya 11 cm, berapakah kelilingnya?',
    diagram: { shape: 'persegi', sisi: 11 },
    options: [
      { key: 'A', text: '22 cm' },
      { key: 'B', text: '33 cm' },
      { key: 'C', text: '44 cm' },
      { key: 'D', text: '121 cm' },
    ],
    correctKey: 'C',
    explanation: 'K = 4 × s = 4 × 11 cm = 44 cm.',
  },
  {
    id: 'as-3',
    number: 3,
    shape: 'persegi-panjang',
    category: 'Hitung Keliling',
    prompt: 'Sebuah persegi panjang memiliki panjang 10 cm dan lebar 6 cm. Keliling persegi panjang tersebut adalah ...',
    diagram: { shape: 'persegi-panjang', panjang: 10, lebar: 6 },
    options: [
      { key: 'A', text: '16 cm' },
      { key: 'B', text: '26 cm' },
      { key: 'C', text: '32 cm' },
      { key: 'D', text: '60 cm' },
    ],
    correctKey: 'C',
    explanation: 'K = 2 × (p + l) = 2 × (10 + 6) = 2 × 16 = 32 cm.',
  },
  {
    id: 'as-4',
    number: 4,
    shape: 'segitiga',
    category: 'Hitung Keliling',
    prompt: 'Segitiga sama sisi memiliki panjang sisi 9 cm. Berapakah keliling segitiga tersebut?',
    diagram: { shape: 'segitiga', triangleKind: 'sama-sisi', sisiA: 9, sisiB: 9, sisiC: 9 },
    options: [
      { key: 'A', text: '18 cm' },
      { key: 'B', text: '27 cm' },
      { key: 'C', text: '36 cm' },
      { key: 'D', text: '81 cm' },
    ],
    correctKey: 'B',
    explanation: 'Segitiga sama sisi memiliki 3 sisi sama panjang: K = 9 + 9 + 9 = 27 cm.',
  },
  {
    id: 'as-5',
    number: 5,
    shape: 'segitiga',
    category: 'Hitung Keliling',
    prompt: 'Perhatikan segitiga sama kaki dengan panjang alas 6 cm dan panjang kedua sisi miringnya masing-masing 9 cm. Kelilingnya adalah ...',
    diagram: { shape: 'segitiga', triangleKind: 'sama-kaki', sisiA: 6, sisiB: 9, sisiC: 9 },
    options: [
      { key: 'A', text: '15 cm' },
      { key: 'B', text: '21 cm' },
      { key: 'C', text: '24 cm' },
      { key: 'D', text: '27 cm' },
    ],
    correctKey: 'C',
    explanation: 'K = alas + sisi miring 1 + sisi miring 2 = 6 + 9 + 9 = 24 cm.',
  },
  {
    id: 'as-6',
    number: 6,
    shape: 'persegi',
    category: 'Cari Sisi',
    prompt: 'Keliling sebuah taman bermain berbentuk persegi adalah 48 m. Panjang setiap sisi taman tersebut adalah ...',
    diagram: { shape: 'persegi', sisi: 12, unknownLabel: 's = ?' },
    options: [
      { key: 'A', text: '8 m' },
      { key: 'B', text: '12 m' },
      { key: 'C', text: '16 m' },
      { key: 'D', text: '24 m' },
    ],
    correctKey: 'B',
    explanation: 'Karena K = 4 × s, maka s = K ÷ 4 = 48 ÷ 4 = 12 m.',
  },
  {
    id: 'as-7',
    number: 7,
    shape: 'persegi-panjang',
    category: 'Cari Sisi',
    prompt: 'Keliling sebuah buku gambar berbentuk persegi panjang adalah 34 cm. Jika panjangnya 10 cm, berapakah lebarnya?',
    diagram: { shape: 'persegi-panjang', panjang: 10, lebar: 7, unknownLabel: 'l = ?' },
    options: [
      { key: 'A', text: '5 cm' },
      { key: 'B', text: '7 cm' },
      { key: 'C', text: '14 cm' },
      { key: 'D', text: '24 cm' },
    ],
    correctKey: 'B',
    explanation: 'Setengah keliling = 34 ÷ 2 = 17 cm. Lebar = 17 − panjang = 17 − 10 = 7 cm.',
  },
  {
    id: 'as-8',
    number: 8,
    shape: 'segitiga',
    category: 'Hitung Keliling',
    prompt: 'Sebuah segitiga siku-siku memiliki sisi-sisi 5 cm, 12 cm, dan 13 cm. Berapakah kelilingnya?',
    diagram: { shape: 'segitiga', triangleKind: 'siku-siku', sisiA: 12, sisiB: 5, sisiC: 13 },
    options: [
      { key: 'A', text: '25 cm' },
      { key: 'B', text: '30 cm' },
      { key: 'C', text: '35 cm' },
      { key: 'D', text: '60 cm' },
    ],
    correctKey: 'B',
    explanation: 'K = a + b + c = 5 + 12 + 13 = 30 cm.',
  },
  {
    id: 'as-9',
    number: 9,
    shape: 'persegi-panjang',
    category: 'Soal Cerita',
    prompt:
      'Lapangan upacara SD N 2 Selokaton berbentuk persegi panjang dengan panjang 25 m dan lebar 15 m. Jika Riko berlari mengelilingi lapangan 1 kali putaran penuh, berapa meter jarak yang ditempuh Riko?',
    diagram: { shape: 'persegi-panjang', panjang: 12, lebar: 7 },
    options: [
      { key: 'A', text: '40 m' },
      { key: 'B', text: '65 m' },
      { key: 'C', text: '80 m' },
      { key: 'D', text: '100 m' },
    ],
    correctKey: 'C',
    explanation: '1 putaran penuh = Keliling lapangan = 2 × (25 + 15) = 2 × 40 = 80 m.',
  },
  {
    id: 'as-10',
    number: 10,
    shape: 'segitiga',
    category: 'Soal Cerita',
    prompt:
      'Siti membuat rambu lalu lintas mini berbentuk segitiga sama sisi untuk tugas kelas. Jika keliling rambu tersebut 36 cm, berapakah panjang masing-masing sisinya?',
    diagram: { shape: 'segitiga', triangleKind: 'sama-sisi', sisiA: 12, sisiB: 12, sisiC: 12, unknownLabel: 'a = ?' },
    options: [
      { key: 'A', text: '9 cm' },
      { key: 'B', text: '10 cm' },
      { key: 'C', text: '12 cm' },
      { key: 'D', text: '18 cm' },
    ],
    correctKey: 'C',
    explanation: 'Segitiga sama sisi memiliki 3 sisi sama panjang. Maka panjang tiap sisi = 36 ÷ 3 = 12 cm.',
  },
];

export function getPredicate(score: number): AssessmentAttempt['predicate'] {
  if (score >= 90) return 'Sangat Baik';
  if (score >= 75) return 'Baik';
  if (score >= 60) return 'Cukup';
  return 'Perlu Bimbingan';
}

export function computeStarsForScore(score: number): number {
  if (score >= 90) return 10;
  if (score >= 75) return 8;
  if (score >= 60) return 5;
  return 2;
}

export function gradeAssessment(params: {
  id: string;
  studentName: string;
  kelas: string;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  durationSeconds: number;
  completedAt?: string;
  questions?: AssessmentQuestion[];
  isSample?: boolean;
}): AssessmentAttempt {
  const questions = params.questions ?? ASSESSMENT_QUESTIONS;
  let correctCount = 0;

  const perShape: Record<ShapeType, { correct: number; total: number }> = {
    segitiga: { correct: 0, total: 0 },
    persegi: { correct: 0, total: 0 },
    'persegi-panjang': { correct: 0, total: 0 },
  };

  for (const q of questions) {
    perShape[q.shape].total += 1;
    if (params.answers[q.id] === q.correctKey) {
      correctCount += 1;
      perShape[q.shape].correct += 1;
    }
  }

  const totalQuestions = questions.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = score >= KKM_SCORE;

  const topicBreakdown: TopicBreakdown[] = SHAPE_LIST.map((shape) => {
    const stat = perShape[shape];
    const percent = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    const status: TopicBreakdown['status'] =
      percent >= 75 ? 'Sangat Kuat' : percent >= 50 ? 'Cukup' : 'Perlu Diulang';
    return {
      shape,
      label: SHAPE_CATALOG[shape].name,
      correct: stat.correct,
      total: stat.total,
      percent,
      status,
    };
  });

  return {
    id: params.id,
    studentName: params.studentName.trim(),
    kelas: params.kelas,
    completedAt: params.completedAt ?? new Date().toISOString(),
    durationSeconds: Math.max(1, Math.round(params.durationSeconds)),
    answers: { ...params.answers },
    correctCount,
    totalQuestions,
    score,
    passed,
    predicate: getPredicate(score),
    starsEarned: computeStarsForScore(score),
    topicBreakdown,
    isSample: params.isSample ?? false,
  };
}

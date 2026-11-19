import {
  AssessmentAttempt,
  RecapFilterStatus,
  RecapSortBy,
} from '../types';
import { gradeAssessment } from './assessment';

export function createSeedAttempts(): AssessmentAttempt[] {
  return [
    gradeAssessment({
      id: 'seed-1',
      studentName: 'Nadia Putri Lestari',
      kelas: 'Kelas 4A',
      completedAt: '2026-11-18T08:30:00.000Z',
      durationSeconds: 315,
      answers: {
        'as-1': 'B',
        'as-2': 'C',
        'as-3': 'C',
        'as-4': 'B',
        'as-5': 'C',
        'as-6': 'B',
        'as-7': 'B',
        'as-8': 'B',
        'as-9': 'C',
        'as-10': 'C',
      },
      isSample: true,
    }),
    gradeAssessment({
      id: 'seed-2',
      studentName: 'Raka Pratama',
      kelas: 'Kelas 4A',
      completedAt: '2026-11-18T09:10:00.000Z',
      durationSeconds: 382,
      answers: {
        'as-1': 'B',
        'as-2': 'C',
        'as-3': 'C',
        'as-4': 'B',
        'as-5': 'B',
        'as-6': 'B',
        'as-7': 'C',
        'as-8': 'B',
        'as-9': 'C',
        'as-10': 'C',
      },
      isSample: true,
    }),
    gradeAssessment({
      id: 'seed-3',
      studentName: 'Siti Aisyah',
      kelas: 'Kelas 4B',
      completedAt: '2026-11-18T09:45:00.000Z',
      durationSeconds: 410,
      answers: {
        'as-1': 'B',
        'as-2': 'C',
        'as-3': 'A',
        'as-4': 'B',
        'as-5': 'C',
        'as-6': 'A',
        'as-7': 'B',
        'as-8': 'A',
        'as-9': 'C',
        'as-10': 'A',
      },
      isSample: true,
    }),
  ];
}

export function filterAndSortRecaps(
  attempts: AssessmentAttempt[],
  query: string,
  statusFilter: RecapFilterStatus,
  sortBy: RecapSortBy
): AssessmentAttempt[] {
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = attempts.filter((item) => {
    if (statusFilter === 'tuntas' && !item.passed) return false;
    if (statusFilter === 'belum-tuntas' && item.passed) return false;
    if (normalizedQuery.length > 0) {
      const hay = `${item.studentName} ${item.kelas}`.toLowerCase();
      if (!hay.includes(normalizedQuery)) return false;
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sortBy === 'nilai-tertinggi') {
      if (b.score !== a.score) return b.score - a.score;
      return b.completedAt.localeCompare(a.completedAt);
    }
    if (sortBy === 'nama-az') {
      return a.studentName.localeCompare(b.studentName, 'id');
    }
    // terbaru
    return b.completedAt.localeCompare(a.completedAt);
  });
}

export function computeRecapSummary(attempts: AssessmentAttempt[]): {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  passRate: number;
} {
  if (attempts.length === 0) {
    return { totalAttempts: 0, averageScore: 0, highestScore: 0, passRate: 0 };
  }
  const sum = attempts.reduce((acc, a) => acc + a.score, 0);
  const highestScore = Math.max(...attempts.map((a) => a.score));
  const passedCount = attempts.filter((a) => a.passed).length;

  return {
    totalAttempts: attempts.length,
    averageScore: Math.round(sum / attempts.length),
    highestScore,
    passRate: Math.round((passedCount / attempts.length) * 100),
  };
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateRecapCsv(attempts: AssessmentAttempt[]): string {
  const header = [
    'Nama Siswa',
    'Kelas',
    'Sekolah',
    'Guru Pengampu',
    'Tanggal',
    'Durasi',
    'Benar',
    'Total Soal',
    'Nilai',
    'Predikat',
    'Status KKM (75)',
  ];

  const rows = attempts.map((a) => [
    a.studentName,
    a.kelas,
    'SD N 2 SELOKATON',
    "Ihda Mar'atus Sholihah",
    formatShortDate(a.completedAt),
    formatDuration(a.durationSeconds),
    a.correctCount,
    a.totalQuestions,
    a.score,
    a.predicate,
    a.passed ? 'Tuntas' : 'Belum Tuntas',
  ]);

  return [header, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}

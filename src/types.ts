export type ModuleId =
  | 'pembuka'
  | 'materi'
  | 'latihan'
  | 'asesmen'
  | 'hasil'
  | 'rekap';

export type ShapeType = 'persegi' | 'persegi-panjang' | 'segitiga';

export type TriangleKind = 'sama-sisi' | 'sama-kaki' | 'siku-siku';

export interface ShapeDimensions {
  // Persegi
  sisi: number;
  // Persegi Panjang
  panjang: number;
  lebar: number;
  // Segitiga
  triangleKind: TriangleKind;
  sisiA: number;
  sisiB: number;
  sisiC: number;
}

export interface EdgeSegment {
  id: string;
  label: string;
  length: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  labelX: number;
  labelY: number;
}

export interface PerimeterCalculation {
  shape: ShapeType;
  perimeter: number;
  sides: number[];
  formulaSymbolic: string;
  formulaExpansion: string;
  formulaSummary: string;
  stepByStep: string[];
  unit: 'cm';
}

export interface StudentProfile {
  name: string;
  kelas: string;
}

export type BadgeId =
  | 'langkah-pertama'
  | 'ahli-persegi'
  | 'jawara-persegi-panjang'
  | 'penjelajah-segitiga'
  | 'bintang-latihan'
  | 'arsitek-taman'
  | 'pembalap-keliling'
  | 'sahabat-petualang'
  | 'detektif-geometri'
  | 'master-memori'
  | 'juara-asesmen';

export type CharacterId = 'kiko' | 'milo' | 'bibi';

export interface BadgeDefinition {
  id: BadgeId;
  title: string;
  description: string;
  xpBonus: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  nextXp: number | null;
  progressPercent: number;
}

export interface QuestionDiagramSpec {
  shape: ShapeType;
  sisi?: number;
  panjang?: number;
  lebar?: number;
  triangleKind?: TriangleKind;
  sisiA?: number;
  sisiB?: number;
  sisiC?: number;
  unknownLabel?: string;
}

export interface PracticeQuestion {
  id: string;
  shape: ShapeType;
  title: string;
  prompt: string;
  diagram: QuestionDiagramSpec;
  options: { label: string; value: number; text: string }[];
  correctValue: number;
  hint: string;
  explanation: string[];
}

export interface GardenMission {
  id: string;
  title: string;
  story: string;
  shape: ShapeType;
  triangleKind?: TriangleKind;
  targetPerimeter: number;
  hint: string;
  starsReward: number;
}

export interface SpeedRaceQuestion {
  id: string;
  round: number;
  shape: ShapeType;
  kind: 'keliling' | 'cari-sisi';
  prompt: string;
  diagram: QuestionDiagramSpec;
  options: number[];
  correctValue: number;
  formulaNote: string;
}

export interface AssessmentQuestion {
  id: string;
  number: number;
  shape: ShapeType;
  category: 'Konsep' | 'Hitung Keliling' | 'Cari Sisi' | 'Soal Cerita';
  prompt: string;
  diagram?: QuestionDiagramSpec;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctKey: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface TopicBreakdown {
  shape: ShapeType;
  label: string;
  correct: number;
  total: number;
  percent: number;
  status: 'Sangat Kuat' | 'Cukup' | 'Perlu Diulang';
}

export interface AssessmentAttempt {
  id: string;
  studentName: string;
  kelas: string;
  completedAt: string; // ISO date string
  durationSeconds: number;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  correctCount: number;
  totalQuestions: number;
  score: number; // 0 - 100
  passed: boolean; // score >= 75
  predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Bimbingan';
  starsEarned: number;
  topicBreakdown: TopicBreakdown[];
  isSample?: boolean;
}

export interface PracticeProgress {
  answeredIds: Record<string, { selected: number; correct: boolean }>;
  completedMissionIds: string[];
  bestStreak: number;
  currentStreak: number;
  speedBestScore: number;
  speedGamesPlayed: number;
  adventureBestScore: number;
  adventureBestLevel: number;
  solvedDetectiveIds: string[];
  memoryGamesWon: number;
  memoryBestMoves: number | null;
}

export interface AppState {
  profile: StudentProfile;
  customClasses: string[];
  learnedShapes: ShapeType[];
  animatedShapes: ShapeType[];
  practice: PracticeProgress;
  attempts: AssessmentAttempt[];
  activeAttemptId: string | null;
  soundEnabled: boolean;
}

export type RecapFilterStatus = 'semua' | 'tuntas' | 'belum-tuntas';
export type RecapSortBy = 'terbaru' | 'nilai-tertinggi' | 'nama-az';

import { AppState, BadgeDefinition, BadgeId, LevelInfo } from '../types';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'langkah-pertama',
    title: 'Langkah Pertama',
    description: 'Mengisi nama siswa dan memulai petualangan keliling bangun datar.',
    xpBonus: 20,
  },
  {
    id: 'penjelajah-segitiga',
    title: 'Penjelajah Segitiga',
    description: 'Menyelesaikan eksplorasi materi keliling Segitiga.',
    xpBonus: 35,
  },
  {
    id: 'ahli-persegi',
    title: 'Ahli Persegi',
    description: 'Menyelesaikan eksplorasi materi keliling Persegi.',
    xpBonus: 35,
  },
  {
    id: 'jawara-persegi-panjang',
    title: 'Jawara Persegi Panjang',
    description: 'Menyelesaikan eksplorasi materi keliling Persegi Panjang.',
    xpBonus: 35,
  },
  {
    id: 'bintang-latihan',
    title: 'Bintang Latihan',
    description: 'Menjawab benar minimal 4 soal di Latihan Terbimbing.',
    xpBonus: 50,
  },
  {
    id: 'arsitek-taman',
    title: 'Arsitek Taman',
    description: 'Menyelesaikan minimal 3 misi di Mini-Game Bangun Pagar Taman.',
    xpBonus: 50,
  },
  {
    id: 'pembalap-keliling',
    title: 'Pembalap Keliling',
    description: 'Meraih skor minimal 50 poin di Mini-Game Balap Keliling.',
    xpBonus: 50,
  },
  {
    id: 'sahabat-petualang',
    title: 'Sahabat Petualang',
    description: 'Menyelesaikan minimal 2 level di Mini-Game Petualangan Karakter.',
    xpBonus: 60,
  },
  {
    id: 'detektif-geometri',
    title: 'Detektif Geometri',
    description: 'Memecahkan minimal 4 kasus sisi hilang di Mini-Game Detektif Sisi.',
    xpBonus: 60,
  },
  {
    id: 'master-memori',
    title: 'Master Memori',
    description: 'Menyelesaikan papan pasangan di Mini-Game Kartu Memori Keliling.',
    xpBonus: 50,
  },
  {
    id: 'juara-asesmen',
    title: 'Juara Asesmen',
    description: 'Lulus Asesmen Keliling Bangun Datar dengan nilai minimal 75.',
    xpBonus: 80,
  },
];

const LEVEL_TIERS = [
  { level: 1, title: 'Penjelajah Pemula', minXp: 0 },
  { level: 2, title: 'Pengukur Hebat', minXp: 100 },
  { level: 3, title: 'Detektif Keliling', minXp: 240 },
  { level: 4, title: 'Master Bangun Datar', minXp: 420 },
];

export function computeUnlockedBadges(state: AppState): BadgeId[] {
  const unlocked: BadgeId[] = [];

  if (state.profile.name.trim().length > 0) {
    unlocked.push('langkah-pertama');
  }
  if (state.learnedShapes.includes('segitiga')) {
    unlocked.push('penjelajah-segitiga');
  }
  if (state.learnedShapes.includes('persegi')) {
    unlocked.push('ahli-persegi');
  }
  if (state.learnedShapes.includes('persegi-panjang')) {
    unlocked.push('jawara-persegi-panjang');
  }

  const correctPracticeCount = Object.values(state.practice.answeredIds).filter(
    (entry) => entry.correct
  ).length;
  if (correctPracticeCount >= 4) {
    unlocked.push('bintang-latihan');
  }

  if (state.practice.completedMissionIds.length >= 3) {
    unlocked.push('arsitek-taman');
  }

  if (state.practice.speedBestScore >= 50) {
    unlocked.push('pembalap-keliling');
  }

  if (state.practice.adventureBestLevel >= 2) {
    unlocked.push('sahabat-petualang');
  }

  if (state.practice.solvedDetectiveIds.length >= 4) {
    unlocked.push('detektif-geometri');
  }

  if (state.practice.memoryGamesWon >= 1) {
    unlocked.push('master-memori');
  }

  const hasPassedUserAttempt = state.attempts.some(
    (attempt) => !attempt.isSample && attempt.passed
  );
  if (hasPassedUserAttempt) {
    unlocked.push('juara-asesmen');
  }

  return unlocked;
}

export function computeGamificationStats(state: AppState): {
  xp: number;
  stars: number;
  levelInfo: LevelInfo;
  unlockedBadges: BadgeId[];
} {
  const unlockedBadges = computeUnlockedBadges(state);

  // XP from learning shapes & perimeter walker animations
  const shapeLearnXp = state.learnedShapes.length * 30;
  const animationXp = state.animatedShapes.length * 15;

  // XP from guided practice, garden missions, speed race & character adventure
  const correctPracticeCount = Object.values(state.practice.answeredIds).filter(
    (entry) => entry.correct
  ).length;
  const practiceXp = correctPracticeCount * 20;
  const missionXp = state.practice.completedMissionIds.length * 25;
  const speedXp = Math.min(120, Math.round(state.practice.speedBestScore * 0.6));
  const adventureXp = state.practice.adventureBestLevel * 25;
  const detectiveXp = state.practice.solvedDetectiveIds.length * 20;
  const memoryXp = Math.min(80, state.practice.memoryGamesWon * 30);

  // XP from best user assessment
  const userAttempts = state.attempts.filter((a) => !a.isSample);
  const bestAssessmentScore =
    userAttempts.length > 0 ? Math.max(...userAttempts.map((a) => a.score)) : 0;
  const assessmentXp = Math.round(bestAssessmentScore * 1.2);

  // Badge bonus XP
  const badgeXp = unlockedBadges.reduce((sum, badgeId) => {
    const def = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
    return sum + (def ? def.xpBonus : 0);
  }, 0);

  const xp =
    shapeLearnXp +
    animationXp +
    practiceXp +
    missionXp +
    speedXp +
    adventureXp +
    detectiveXp +
    memoryXp +
    assessmentXp +
    badgeXp;

  // Stars earned across activities
  const speedStars = Math.min(8, Math.floor(state.practice.speedBestScore / 20));
  const adventureStars = state.practice.adventureBestLevel * 2;
  const detectiveStars = state.practice.solvedDetectiveIds.length * 2;
  const memoryStars = Math.min(6, state.practice.memoryGamesWon * 2);
  const stars =
    state.learnedShapes.length * 2 +
    correctPracticeCount * 2 +
    state.practice.completedMissionIds.length * 3 +
    speedStars +
    adventureStars +
    detectiveStars +
    memoryStars +
    userAttempts.reduce((max, a) => Math.max(max, a.starsEarned), 0);

  const levelInfo = computeLevelInfo(xp);

  return { xp, stars, levelInfo, unlockedBadges };
}

export function computeLevelInfo(xp: number): LevelInfo {
  let current = LEVEL_TIERS[0];
  let next: (typeof LEVEL_TIERS)[number] | null = LEVEL_TIERS[1];

  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    if (xp >= LEVEL_TIERS[i].minXp) {
      current = LEVEL_TIERS[i];
      next = LEVEL_TIERS[i + 1] ?? null;
    }
  }

  if (!next) {
    return {
      level: current.level,
      title: current.title,
      minXp: current.minXp,
      nextXp: null,
      progressPercent: 100,
    };
  }

  const span = next.minXp - current.minXp;
  const gained = xp - current.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((gained / span) * 100)));

  return {
    level: current.level,
    title: current.title,
    minXp: current.minXp,
    nextXp: next.minXp,
    progressPercent,
  };
}

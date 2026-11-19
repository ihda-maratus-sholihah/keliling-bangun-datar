import { AppState } from '../types';
import { createSeedAttempts } from './recap';

const STORAGE_KEY = 'keliling_ceria_sdn2_selokaton_v1';

export function createInitialAppState(): AppState {
  return {
    profile: {
      name: '',
      kelas: 'Kelas 4A',
    },
    customClasses: [],
    learnedShapes: [],
    animatedShapes: [],
    practice: {
      answeredIds: {},
      completedMissionIds: [],
      bestStreak: 0,
      currentStreak: 0,
      speedBestScore: 0,
      speedGamesPlayed: 0,
      adventureBestScore: 0,
      adventureBestLevel: 0,
      solvedDetectiveIds: [],
      memoryGamesWon: 0,
      memoryBestMoves: null,
    },
    attempts: createSeedAttempts(),
    activeAttemptId: null,
    soundEnabled: true,
  };
}

export function loadAppState(): AppState {
  const fallback = createInitialAppState();
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      profile: {
        name: typeof parsed.profile?.name === 'string' ? parsed.profile.name : '',
        kelas: typeof parsed.profile?.kelas === 'string' ? parsed.profile.kelas : 'Kelas 4A',
      },
      customClasses: Array.isArray(parsed.customClasses)
        ? parsed.customClasses.filter((c): c is string => typeof c === 'string')
        : [],
      learnedShapes: Array.isArray(parsed.learnedShapes) ? parsed.learnedShapes : [],
      animatedShapes: Array.isArray(parsed.animatedShapes) ? parsed.animatedShapes : [],
      practice: {
        answeredIds: parsed.practice?.answeredIds ?? {},
        completedMissionIds: Array.isArray(parsed.practice?.completedMissionIds)
          ? parsed.practice.completedMissionIds
          : [],
        bestStreak: typeof parsed.practice?.bestStreak === 'number' ? parsed.practice.bestStreak : 0,
        currentStreak:
          typeof parsed.practice?.currentStreak === 'number' ? parsed.practice.currentStreak : 0,
        speedBestScore:
          typeof parsed.practice?.speedBestScore === 'number'
            ? parsed.practice.speedBestScore
            : 0,
        speedGamesPlayed:
          typeof parsed.practice?.speedGamesPlayed === 'number'
            ? parsed.practice.speedGamesPlayed
            : 0,
        adventureBestScore:
          typeof parsed.practice?.adventureBestScore === 'number'
            ? parsed.practice.adventureBestScore
            : 0,
        adventureBestLevel:
          typeof parsed.practice?.adventureBestLevel === 'number'
            ? parsed.practice.adventureBestLevel
            : 0,
        solvedDetectiveIds: Array.isArray(parsed.practice?.solvedDetectiveIds)
          ? parsed.practice.solvedDetectiveIds.filter((id): id is string => typeof id === 'string')
          : [],
        memoryGamesWon:
          typeof parsed.practice?.memoryGamesWon === 'number'
            ? parsed.practice.memoryGamesWon
            : 0,
        memoryBestMoves:
          typeof parsed.practice?.memoryBestMoves === 'number'
            ? parsed.practice.memoryBestMoves
            : null,
      },
      attempts: Array.isArray(parsed.attempts) && parsed.attempts.length > 0
        ? parsed.attempts
        : fallback.attempts,
      activeAttemptId: typeof parsed.activeAttemptId === 'string' ? parsed.activeAttemptId : null,
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
    };
  } catch {
    return fallback;
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }
}

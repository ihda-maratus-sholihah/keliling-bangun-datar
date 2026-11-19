import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Award, X } from 'lucide-react';
import { AppState, AssessmentAttempt, ModuleId, ShapeType } from './types';
import { BADGE_DEFINITIONS, computeGamificationStats } from './utils/gamification';
import { AddClassResult, mergeClassOptions, validateAndAddClass } from './utils/classes';
import { playFanfare, playSuccessChime, playWrongChime } from './utils/sound';
import { createInitialAppState, loadAppState, saveAppState } from './utils/storage';
import { TopNav } from './components/TopNav';
import { GamificationBar } from './components/GamificationBar';
import { PembukaView } from './components/PembukaView';
import { MateriView } from './components/MateriView';
import { LatihanView } from './components/LatihanView';
import { AsesmenView } from './components/AsesmenView';
import { HasilView } from './components/HasilView';
import { RekapView } from './components/RekapView';

const MODULE_ORDER: ModuleId[] = [
  'pembuka',
  'materi',
  'latihan',
  'asesmen',
  'hasil',
  'rekap',
];

const NEXT_CTA_LABELS: Record<ModuleId, string> = {
  pembuka: 'Ke 02 Materi',
  materi: 'Ke 03 Latihan',
  latihan: 'Ke 04 Asesmen',
  asesmen: 'Lihat 05 Hasil',
  hasil: 'Ke 06 Rekap',
  rekap: 'Ke 01 Pembuka',
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const loaded = loadAppState();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1' && !loaded.profile.name.trim()) {
        return {
          ...loaded,
          profile: { name: 'Budi Santoso', kelas: 'Kelas 4A' },
        };
      }
    }
    return loaded;
  });

  const [activeModule, setActiveModule] = useState<ModuleId>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return 'materi';
      }
    }
    return 'pembuka';
  });

  const [selectedShape, setSelectedShape] = useState<ShapeType>('segitiga');
  const [badgeToast, setBadgeToast] = useState<string | null>(null);

  const gamification = useMemo(() => computeGamificationStats(state), [state]);
  const classOptions = useMemo(
    () => mergeClassOptions(state.customClasses),
    [state.customClasses]
  );
  const prevBadgesRef = useRef<string[]>(gamification.unlockedBadges);

  // Persist state to localStorage on every update
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Detect newly unlocked badges and announce gently
  useEffect(() => {
    const prev = prevBadgesRef.current;
    const newlyUnlocked = gamification.unlockedBadges.filter((id) => !prev.includes(id));
    if (newlyUnlocked.length > 0) {
      const def = BADGE_DEFINITIONS.find((b) => b.id === newlyUnlocked[0]);
      if (def) {
        setBadgeToast(`Lencana Baru Terbuka: ${def.title} (+${def.xpBonus} XP)!`);
        playFanfare(state.soundEnabled);
      }
    }
    prevBadgesRef.current = gamification.unlockedBadges;
  }, [gamification.unlockedBadges, state.soundEnabled]);

  useEffect(() => {
    if (!badgeToast) return;
    const t = window.setTimeout(() => setBadgeToast(null), 5000);
    return () => window.clearTimeout(t);
  }, [badgeToast]);

  const navigateModule = useCallback((mod: ModuleId) => {
    setActiveModule(mod);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handlePrimaryNavAction = () => {
    const currentIndex = MODULE_ORDER.indexOf(activeModule);
    const nextMod = MODULE_ORDER[(currentIndex + 1) % MODULE_ORDER.length];
    navigateModule(nextMod);
  };

  const handleSaveProfileAndStart = (name: string, kelas: string) => {
    setState((prev) => ({
      ...prev,
      profile: { name, kelas },
    }));
    playSuccessChime(state.soundEnabled);
    navigateModule('materi');
  };

  const handleUpdateProfile = (name: string, kelas: string) => {
    setState((prev) => ({
      ...prev,
      profile: { name, kelas },
    }));
  };

  const handleToggleLearnedShape = (shape: ShapeType) => {
    setState((prev) => {
      const exists = prev.learnedShapes.includes(shape);
      if (!exists) {
        playSuccessChime(prev.soundEnabled);
      }
      return {
        ...prev,
        learnedShapes: exists
          ? prev.learnedShapes.filter((s) => s !== shape)
          : [...prev.learnedShapes, shape],
      };
    });
  };

  const handleCompleteAnimation = useCallback((shape: ShapeType) => {
    setState((prev) => {
      if (prev.animatedShapes.includes(shape)) return prev;
      playSuccessChime(prev.soundEnabled);
      return {
        ...prev,
        animatedShapes: [...prev.animatedShapes, shape],
      };
    });
  }, []);

  const handleRecordPracticeAnswer = (
    questionId: string,
    selected: number,
    correct: boolean
  ) => {
    if (correct) {
      playSuccessChime(state.soundEnabled);
    } else {
      playWrongChime(state.soundEnabled);
    }

    setState((prev) => {
      const nextStreak = correct ? prev.practice.currentStreak + 1 : 0;
      const bestStreak = Math.max(prev.practice.bestStreak, nextStreak);
      return {
        ...prev,
        practice: {
          ...prev.practice,
          answeredIds: {
            ...prev.practice.answeredIds,
            [questionId]: { selected, correct },
          },
          currentStreak: nextStreak,
          bestStreak,
        },
      };
    });
  };

  const handleCompleteGardenMission = (missionId: string) => {
    playFanfare(state.soundEnabled);
    setState((prev) => {
      if (prev.practice.completedMissionIds.includes(missionId)) return prev;
      return {
        ...prev,
        practice: {
          ...prev.practice,
          completedMissionIds: [...prev.practice.completedMissionIds, missionId],
        },
      };
    });
  };

  const handleAddCustomClass = (rawClassName: string): AddClassResult => {
    const result = validateAndAddClass(state.customClasses, rawClassName);
    if (!result.ok) {
      return result;
    }
    setState((prev) => ({
      ...prev,
      customClasses: result.updatedCustom,
      profile: { ...prev.profile, kelas: result.value },
    }));
    playSuccessChime(state.soundEnabled);
    return result;
  };

  const handleFinishSpeedGame = (finalScore: number) => {
    setState((prev) => ({
      ...prev,
      practice: {
        ...prev.practice,
        speedBestScore: Math.max(prev.practice.speedBestScore, finalScore),
        speedGamesPlayed: prev.practice.speedGamesPlayed + 1,
      },
    }));
  };

  const handleUpdateAdventureProgress = (score: number, clearedLevel: number) => {
    setState((prev) => ({
      ...prev,
      practice: {
        ...prev.practice,
        adventureBestScore: Math.max(prev.practice.adventureBestScore, score),
        adventureBestLevel: Math.max(prev.practice.adventureBestLevel, clearedLevel),
      },
    }));
  };

  const handleSolveDetectiveCase = (caseId: string) => {
    setState((prev) => {
      if (prev.practice.solvedDetectiveIds.includes(caseId)) return prev;
      return {
        ...prev,
        practice: {
          ...prev.practice,
          solvedDetectiveIds: [...prev.practice.solvedDetectiveIds, caseId],
        },
      };
    });
  };

  const handleResetDetectiveCases = () => {
    setState((prev) => ({
      ...prev,
      practice: {
        ...prev.practice,
        solvedDetectiveIds: [],
      },
    }));
  };

  const handleWinMemoryGame = (moves: number) => {
    setState((prev) => ({
      ...prev,
      practice: {
        ...prev.practice,
        memoryGamesWon: prev.practice.memoryGamesWon + 1,
        memoryBestMoves:
          prev.practice.memoryBestMoves === null
            ? moves
            : Math.min(prev.practice.memoryBestMoves, moves),
      },
    }));
  };

  const handleResetPractice = () => {
    setState((prev) => ({
      ...prev,
      practice: {
        ...prev.practice,
        answeredIds: {},
        currentStreak: 0,
      },
    }));
  };

  const handleSubmitAttempt = (attempt: AssessmentAttempt) => {
    if (attempt.passed) {
      playFanfare(state.soundEnabled);
    } else {
      playSuccessChime(state.soundEnabled);
    }

    setState((prev) => ({
      ...prev,
      attempts: [attempt, ...prev.attempts],
      activeAttemptId: attempt.id,
    }));
    navigateModule('hasil');
  };

  const handleViewAttemptResult = (attemptId: string) => {
    setState((prev) => ({ ...prev, activeAttemptId: attemptId }));
    navigateModule('hasil');
  };

  const handleDeleteAttempt = (attemptId: string) => {
    setState((prev) => {
      const nextAttempts = prev.attempts.filter((a) => a.id !== attemptId);
      const nextActive =
        prev.activeAttemptId === attemptId ? null : prev.activeAttemptId;
      return {
        ...prev,
        attempts: nextAttempts,
        activeAttemptId: nextActive,
      };
    });
  };

  const handleResetAllProgress = () => {
    const fresh = createInitialAppState();
    setState(fresh);
    setBadgeToast(null);
    prevBadgesRef.current = [];
  };

  const activeAttempt =
    state.attempts.find((a) => a.id === state.activeAttemptId) ??
    state.attempts.find((a) => !a.isSample) ??
    null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopNav
        activeModule={activeModule}
        onSelectModule={navigateModule}
        onPrimaryAction={handlePrimaryNavAction}
        primaryActionLabel={NEXT_CTA_LABELS[activeModule]}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <GamificationBar
          profile={state.profile}
          xp={gamification.xp}
          stars={gamification.stars}
          levelInfo={gamification.levelInfo}
          unlockedBadges={gamification.unlockedBadges}
          soundEnabled={state.soundEnabled}
          onToggleSound={() =>
            setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
          }
        />

        {/* Newly Unlocked Badge Celebration Banner */}
        {badgeToast && (
          <div
            role="status"
            aria-live="polite"
            className="no-print mb-6 bg-amber-50 border border-amber-300 text-amber-950 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              <Award className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
              <span>{badgeToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setBadgeToast(null)}
              aria-label="Tutup pemberitahuan lencana"
              className="text-amber-700 hover:text-amber-900 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeModule === 'pembuka' && (
          <PembukaView
            state={state}
            classOptions={classOptions}
            onAddCustomClass={handleAddCustomClass}
            onSaveProfileAndStart={handleSaveProfileAndStart}
            onSelectModule={navigateModule}
          />
        )}

        {activeModule === 'materi' && (
          <MateriView
            selectedShape={selectedShape}
            onSelectShape={setSelectedShape}
            learnedShapes={state.learnedShapes}
            onToggleLearnedShape={handleToggleLearnedShape}
            onCompleteAnimation={handleCompleteAnimation}
            onNextToLatihan={() => navigateModule('latihan')}
            soundEnabled={state.soundEnabled}
          />
        )}

        {activeModule === 'latihan' && (
          <LatihanView
            practice={state.practice}
            soundEnabled={state.soundEnabled}
            onRecordPracticeAnswer={handleRecordPracticeAnswer}
            onCompleteGardenMission={handleCompleteGardenMission}
            onFinishSpeedGame={handleFinishSpeedGame}
            onUpdateAdventureProgress={handleUpdateAdventureProgress}
            onSolveDetectiveCase={handleSolveDetectiveCase}
            onResetDetectiveCases={handleResetDetectiveCases}
            onWinMemoryGame={handleWinMemoryGame}
            onResetPractice={handleResetPractice}
            onNextToAsesmen={() => navigateModule('asesmen')}
          />
        )}

        {activeModule === 'asesmen' && (
          <AsesmenView
            profile={state.profile}
            classOptions={classOptions}
            onAddCustomClass={handleAddCustomClass}
            onUpdateProfile={handleUpdateProfile}
            onSubmitAttempt={handleSubmitAttempt}
          />
        )}

        {activeModule === 'hasil' && (
          <HasilView
            attempt={activeAttempt}
            onRetakeAssessment={() => navigateModule('asesmen')}
            onGoToRekap={() => navigateModule('rekap')}
            onReviewShapeInMateri={(shape) => {
              setSelectedShape(shape);
              navigateModule('materi');
            }}
          />
        )}

        {activeModule === 'rekap' && (
          <RekapView
            state={state}
            unlockedBadges={gamification.unlockedBadges}
            xp={gamification.xp}
            stars={gamification.stars}
            onViewAttemptResult={handleViewAttemptResult}
            onDeleteAttempt={handleDeleteAttempt}
            onResetAllProgress={handleResetAllProgress}
          />
        )}
      </main>

      <footer className="no-print border-t border-slate-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p className="font-medium text-slate-700">
            SD N 2 SELOKATON · Guru Pengampu: Ihda Mar&apos;atus Sholihah
          </p>
          <p>
            Materi Interaktif Matematika SD — Keliling Segitiga, Persegi, dan Persegi Panjang
          </p>
        </div>
      </footer>
    </div>
  );
}

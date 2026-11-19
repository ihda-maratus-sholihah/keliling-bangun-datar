import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Hammer,
  HelpCircle,
  RotateCcw,
  Star,
  XCircle,
} from 'lucide-react';
import { PracticeProgress, ShapeDimensions } from '../types';
import { GARDEN_MISSIONS, PRACTICE_QUESTIONS } from '../utils/assessment';
import { calculatePerimeter, DEFAULT_DIMENSIONS, SHAPE_CATALOG } from '../utils/geometry';
import { ShapeDiagram } from './ShapeDiagram';
import { SpeedRaceGame } from './SpeedRaceGame';
import { CharacterAdventureGame } from './CharacterAdventureGame';
import { DetectiveMissingSideGame } from './DetectiveMissingSideGame';
import { MemoryMatchGame } from './MemoryMatchGame';

type LatihanTab = 'soal' | 'taman' | 'balap' | 'petualangan' | 'detektif' | 'memori';

interface LatihanViewProps {
  practice: PracticeProgress;
  soundEnabled: boolean;
  onRecordPracticeAnswer: (questionId: string, selectedValue: number, isCorrect: boolean) => void;
  onCompleteGardenMission: (missionId: string) => void;
  onFinishSpeedGame: (finalScore: number) => void;
  onUpdateAdventureProgress: (score: number, clearedLevel: number) => void;
  onSolveDetectiveCase: (caseId: string) => void;
  onResetDetectiveCases: () => void;
  onWinMemoryGame: (moves: number) => void;
  onResetPractice: () => void;
  onNextToAsesmen: () => void;
}

export const LatihanView: React.FC<LatihanViewProps> = ({
  practice,
  soundEnabled,
  onRecordPracticeAnswer,
  onCompleteGardenMission,
  onFinishSpeedGame,
  onUpdateAdventureProgress,
  onSolveDetectiveCase,
  onResetDetectiveCases,
  onWinMemoryGame,
  onResetPractice,
  onNextToAsesmen,
}) => {
  const [activeTab, setActiveTab] = useState<LatihanTab>('soal');

  // Mode 1: Guided Practice State
  const [qIndex, setQIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Mode 2: Garden Builder Mini-Game State
  const [missionIdx, setMissionIdx] = useState(0);
  const [gardenDims, setGardenDims] = useState<ShapeDimensions>({
    ...DEFAULT_DIMENSIONS,
    sisi: 4,
    panjang: 6,
    lebar: 4,
    triangleKind: 'sama-sisi',
    sisiA: 5,
    sisiB: 5,
    sisiC: 5,
  });
  const [gardenFeedback, setGardenFeedback] = useState<{
    type: 'success' | 'try-again';
    message: string;
  } | null>(null);
  const [showMissionHint, setShowMissionHint] = useState(false);

  const currentQuestion = PRACTICE_QUESTIONS[qIndex];
  const savedAnswer = practice.answeredIds[currentQuestion.id];
  const answeredCount = Object.keys(practice.answeredIds).length;
  const correctCount = Object.values(practice.answeredIds).filter((a) => a.correct).length;

  const currentMission = GARDEN_MISSIONS[missionIdx];
  const missionDimsForCalc: ShapeDimensions = {
    ...gardenDims,
    triangleKind: currentMission.triangleKind ?? gardenDims.triangleKind,
  };
  const gardenCalc = calculatePerimeter(currentMission.shape, missionDimsForCalc);
  const isMissionCompleted = practice.completedMissionIds.includes(currentMission.id);

  const handleSelectQuestionIndex = (idx: number) => {
    setQIndex(idx);
    setSelectedChoice(null);
    setShowHint(false);
  };

  const handleCheckPracticeAnswer = () => {
    if (selectedChoice === null) return;
    const isCorrect = selectedChoice === currentQuestion.correctValue;
    onRecordPracticeAnswer(currentQuestion.id, selectedChoice, isCorrect);
  };

  const handleSelectMission = (idx: number) => {
    const next = GARDEN_MISSIONS[idx];
    setMissionIdx(idx);
    setGardenFeedback(null);
    setShowMissionHint(false);
    setGardenDims({
      ...DEFAULT_DIMENSIONS,
      sisi: 4,
      panjang: 6,
      lebar: 3,
      triangleKind: next.triangleKind ?? 'sama-sisi',
      sisiA: 5,
      sisiB: 6,
      sisiC: 6,
    });
  };

  const handleCheckGardenMission = () => {
    const diff = gardenCalc.perimeter - currentMission.targetPerimeter;
    if (diff === 0) {
      onCompleteGardenMission(currentMission.id);
      setGardenFeedback({
        type: 'success',
        message: `Hebat! Pagar ${SHAPE_CATALOG[currentMission.shape].name} tepat ${currentMission.targetPerimeter} cm. Kamu meraih +3 Bintang & +25 XP!`,
      });
    } else if (diff < 0) {
      setGardenFeedback({
        type: 'try-again',
        message: `Keliling pagarmu baru ${gardenCalc.perimeter} cm. Masih kurang ${Math.abs(diff)} cm lagi untuk mencapai ${currentMission.targetPerimeter} cm!`,
      });
    } else {
      setGardenFeedback({
        type: 'try-again',
        message: `Keliling pagarmu ${gardenCalc.perimeter} cm. Kelebihan ${diff} cm dari target ${currentMission.targetPerimeter} cm. Coba perkecil sisinya!`,
      });
    }
  };

  const diagramDimensions: ShapeDimensions = {
    ...DEFAULT_DIMENSIONS,
    sisi: currentQuestion.diagram.sisi ?? 6,
    panjang: currentQuestion.diagram.panjang ?? 8,
    lebar: currentQuestion.diagram.lebar ?? 5,
    triangleKind: currentQuestion.diagram.triangleKind ?? 'sama-sisi',
    sisiA: currentQuestion.diagram.sisiA ?? 6,
    sisiB: currentQuestion.diagram.sisiB ?? 6,
    sisiC: currentQuestion.diagram.sisiC ?? 6,
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode Tabs */}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            03. Latihan Bergamifikasi · Kumpulkan Bintang &amp; Kombo
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Arena Latihan &amp; Mini-Game
          </h1>
        </div>

        <div
          role="tablist"
          aria-label="Pilih Mode Latihan"
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl max-w-full"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'soal'}
            onClick={() => setActiveTab('soal')}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'soal'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Soal ({correctCount}/6)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'taman'}
            onClick={() => setActiveTab('taman')}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'taman'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Pagar Taman ({practice.completedMissionIds.length}/6)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'balap'}
            onClick={() => setActiveTab('balap')}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'balap'
                ? 'bg-white text-orange-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Balap ({practice.speedBestScore} pt)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'petualangan'}
            onClick={() => setActiveTab('petualangan')}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'petualangan'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Karakter (Lv.{practice.adventureBestLevel})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'detektif'}
            onClick={() => setActiveTab('detektif')}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'detektif'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5. Detektif Sisi ({practice.solvedDetectiveIds.length}/6)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'memori'}
            onClick={() => setActiveTab('memori')}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'memori'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            6. Memori ({practice.memoryGamesWon}×)
          </button>
        </div>
      </div>

      {/* Mode 1: Guided Practice Questions */}
      {activeTab === 'soal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Question Card */}
          <section className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-medium text-slate-500">
                Soal {qIndex + 1} dari {PRACTICE_QUESTIONS.length} ·{' '}
                <span className="font-semibold text-slate-800">
                  {SHAPE_CATALOG[currentQuestion.shape].name}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="inline-flex items-center gap-1 text-orange-700 tabular-nums">
                  <Flame className="w-4 h-4" aria-hidden="true" />
                  Kombo: {practice.currentStreak}
                </span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-amber-700 tabular-nums">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" aria-hidden="true" />
                  Benar: {correctCount}/{PRACTICE_QUESTIONS.length}
                </span>
              </div>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                {currentQuestion.title}
              </h2>
              <p className="mt-2 text-base text-slate-700 leading-relaxed">
                {currentQuestion.prompt}
              </p>
            </div>

            {/* Live SVG Figure */}
            <ShapeDiagram
              shape={currentQuestion.diagram.shape}
              dimensions={diagramDimensions}
              unknownLabel={currentQuestion.diagram.unknownLabel}
              compact
              ariaLabel={`Ilustrasi soal ${currentQuestion.title}`}
            />

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = savedAnswer
                  ? savedAnswer.selected === opt.value
                  : selectedChoice === opt.value;
                const isRightOption = savedAnswer && opt.value === currentQuestion.correctValue;
                const isWrongSelected =
                  savedAnswer && savedAnswer.selected === opt.value && !savedAnswer.correct;

                let stateClasses =
                  'bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:bg-blue-50/30';
                if (isRightOption) {
                  stateClasses = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
                } else if (isWrongSelected) {
                  stateClasses = 'bg-rose-50 border-rose-400 text-rose-900 font-semibold';
                } else if (isSelected) {
                  stateClasses = 'bg-blue-50 border-blue-600 text-blue-900 font-semibold';
                }

                return (
                  <button
                    key={opt.label}
                    type="button"
                    disabled={Boolean(savedAnswer)}
                    onClick={() => setSelectedChoice(opt.value)}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-default ${stateClasses}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                        {opt.label}
                      </span>
                      <span className="font-mono text-sm sm:text-base tabular-nums">
                        {opt.text}
                      </span>
                    </div>
                    {isRightOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-label="Benar" />
                    )}
                    {isWrongSelected && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" aria-label="Salah" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hint & Check Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowHint((v) => !v)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-4"
              >
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
                <span>{showHint ? 'Sembunyikan Petunjuk' : 'Lihat Petunjuk Bu Ihda'}</span>
              </button>

              <div className="flex items-center gap-2">
                {!savedAnswer ? (
                  <button
                    type="button"
                    disabled={selectedChoice === null}
                    onClick={handleCheckPracticeAnswer}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>Periksa Jawaban</span>
                  </button>
                ) : qIndex < PRACTICE_QUESTIONS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => handleSelectQuestionIndex(qIndex + 1)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>Soal Berikutnya</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('taman')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>Lanjut ke Misi Bangun Taman</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {showHint && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
                <span className="font-semibold">Petunjuk Bu Ihda: </span>
                {currentQuestion.hint}
              </div>
            )}

            {/* Instant Feedback & Explanation */}
            {savedAnswer && (
              <div
                role="status"
                className={`rounded-xl border p-4 space-y-2 ${
                  savedAnswer.correct
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm">
                  {savedAnswer.correct ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                      <span>Tepat Sekali! Kamu meraih +20 XP &amp; +2 Bintang.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600" aria-hidden="true" />
                      <span>
                        Belum tepat, jawaban yang benar adalah{' '}
                        <span className="font-mono">{currentQuestion.correctValue} cm</span>. Yuk
                        simak caranya!
                      </span>
                    </>
                  )}
                </div>
                <ol className="text-sm space-y-1 list-decimal list-inside opacity-90">
                  {currentQuestion.explanation.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ol>
              </div>
            )}
          </section>

          {/* Right Sidebar: Question Map & Actions */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <h3 className="font-display text-base font-bold text-slate-900">
                Daftar Soal Latihan
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {PRACTICE_QUESTIONS.map((q, idx) => {
                  const ans = practice.answeredIds[q.id];
                  const active = idx === qIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleSelectQuestionIndex(idx)}
                      aria-label={`Soal latihan ${idx + 1}: ${q.title}`}
                      className={`px-3 py-2.5 rounded-lg border text-sm font-mono font-semibold flex items-center justify-center gap-1 transition-colors tabular-nums ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600'
                          : ans?.correct
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : ans && !ans.correct
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{idx + 1}</span>
                      {ans?.correct && <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />}
                      {ans && !ans.correct && <XCircle className="w-3.5 h-3.5" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1 tabular-nums">
                <p>Dijawab: {answeredCount} / {PRACTICE_QUESTIONS.length} soal</p>
                <p>Kombo terbaik: {practice.bestStreak} benar beruntun</p>
              </div>

              {answeredCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onResetPractice();
                    setSelectedChoice(null);
                    setQIndex(0);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Ulangi Soal Latihan</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onNextToAsesmen}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors"
            >
              <span>Siap Ujian? Lanjut ke 04 Asesmen</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </aside>
        </div>
      )}

      {/* Mode 2: Interactive Mini-Game — Bangun Pagar Taman */}
      {activeTab === 'taman' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-emerald-700">
                  Misi Taman {missionIdx + 1} dari {GARDEN_MISSIONS.length} ·{' '}
                  {SHAPE_CATALOG[currentMission.shape].name}
                </p>
                <h2 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                  {currentMission.title}
                </h2>
              </div>
              {isMissionCompleted && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  Misi Tuntas
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {currentMission.story}
            </p>

            {/* Target vs Current Perimeter Strip */}
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div>
                <span className="text-xs text-slate-500">Target Keliling Pagar</span>
                <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
                  {currentMission.targetPerimeter} cm
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Keliling Pagar Kamu</span>
                <p
                  data-testid="garden-current-perimeter"
                  className={`font-mono text-2xl font-bold tabular-nums mt-0.5 ${
                    gardenCalc.perimeter === currentMission.targetPerimeter
                      ? 'text-emerald-700'
                      : 'text-blue-700'
                  }`}
                >
                  {gardenCalc.perimeter} cm
                </p>
              </div>
            </div>

            <ShapeDiagram
              shape={currentMission.shape}
              dimensions={missionDimsForCalc}
              gardenMode
              showRightAngles={false}
              ariaLabel={`Denah taman ${currentMission.title} dengan keliling saat ini ${gardenCalc.perimeter} sentimeter`}
            />

            {gardenFeedback && (
              <div
                role="status"
                className={`rounded-xl border p-4 text-sm font-medium flex items-start gap-2.5 ${
                  gardenFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {gardenFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                )}
                <span>{gardenFeedback.message}</span>
              </div>
            )}
          </section>

          {/* Garden Mission Builder Controls */}
          <aside className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Hammer className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Atur Ukuran Pagar
                </h3>
              </div>

              {currentMission.shape === 'persegi' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <label htmlFor="garden-sisi" className="font-semibold text-slate-800">
                      Panjang Sisi Pagar (s)
                    </label>
                    <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                      {gardenDims.sisi} cm
                    </span>
                  </div>
                  <input
                    id="garden-sisi"
                    type="range"
                    min={2}
                    max={12}
                    step={1}
                    value={gardenDims.sisi}
                    onChange={(e) => {
                      setGardenDims((d) => ({ ...d, sisi: Number(e.target.value) }));
                      setGardenFeedback(null);
                    }}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              )}

              {currentMission.shape === 'persegi-panjang' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label htmlFor="garden-panjang" className="font-semibold text-slate-800">
                        Panjang Pagar (p)
                      </label>
                      <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                        {gardenDims.panjang} cm
                      </span>
                    </div>
                    <input
                      id="garden-panjang"
                      type="range"
                      min={3}
                      max={14}
                      step={1}
                      value={gardenDims.panjang}
                      onChange={(e) => {
                        setGardenDims((d) => ({ ...d, panjang: Number(e.target.value) }));
                        setGardenFeedback(null);
                      }}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label htmlFor="garden-lebar" className="font-semibold text-slate-800">
                        Lebar Pagar (l)
                      </label>
                      <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                        {gardenDims.lebar} cm
                      </span>
                    </div>
                    <input
                      id="garden-lebar"
                      type="range"
                      min={2}
                      max={10}
                      step={1}
                      value={gardenDims.lebar}
                      onChange={(e) => {
                        setGardenDims((d) => ({ ...d, lebar: Number(e.target.value) }));
                        setGardenFeedback(null);
                      }}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {currentMission.shape === 'segitiga' &&
                currentMission.triangleKind === 'sama-sisi' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label htmlFor="garden-tri-eq" className="font-semibold text-slate-800">
                        Panjang Tiap Sisi (s)
                      </label>
                      <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                        {gardenDims.sisiA} cm
                      </span>
                    </div>
                    <input
                      id="garden-tri-eq"
                      type="range"
                      min={3}
                      max={12}
                      step={1}
                      value={gardenDims.sisiA}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setGardenDims((d) => ({ ...d, sisiA: v, sisiB: v, sisiC: v }));
                        setGardenFeedback(null);
                      }}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                )}

              {currentMission.shape === 'segitiga' &&
                currentMission.triangleKind === 'sama-kaki' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <label htmlFor="garden-tri-alas" className="font-semibold text-slate-800">
                          Panjang Alas (a)
                        </label>
                        <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                          {gardenDims.sisiA} cm
                        </span>
                      </div>
                      <input
                        id="garden-tri-alas"
                        type="range"
                        min={4}
                        max={10}
                        step={1}
                        value={gardenDims.sisiA}
                        onChange={(e) => {
                          const alas = Number(e.target.value);
                          const minKaki = Math.floor(alas / 2) + 2;
                          setGardenDims((d) => ({
                            ...d,
                            sisiA: alas,
                            sisiB: Math.max(d.sisiB, minKaki),
                            sisiC: Math.max(d.sisiB, minKaki),
                          }));
                          setGardenFeedback(null);
                        }}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <label htmlFor="garden-tri-kaki" className="font-semibold text-slate-800">
                          Panjang Sisi Kaki (b &amp; c)
                        </label>
                        <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                          {gardenDims.sisiB} cm
                        </span>
                      </div>
                      <input
                        id="garden-tri-kaki"
                        type="range"
                        min={Math.floor(gardenDims.sisiA / 2) + 2}
                        max={12}
                        step={1}
                        value={gardenDims.sisiB}
                        onChange={(e) => {
                          const kaki = Number(e.target.value);
                          setGardenDims((d) => ({ ...d, sisiB: kaki, sisiC: kaki }));
                          setGardenFeedback(null);
                        }}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

              <div className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 tabular-nums">
                Rumus: K = {gardenCalc.formulaExpansion} = {gardenCalc.perimeter} cm
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleCheckGardenMission}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  <Hammer className="w-4 h-4" aria-hidden="true" />
                  <span>Pasang Pagar Taman!</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMissionHint((v) => !v)}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2 self-start"
                >
                  {showMissionHint ? 'Sembunyikan Petunjuk' : 'Butuh Petunjuk?'}
                </button>
                {showMissionHint && (
                  <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    {currentMission.hint}
                  </p>
                )}
              </div>
            </div>

            {/* Mission Selector List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h3 className="font-display text-sm font-bold text-slate-900">
                Pilih Misi Taman ({practice.completedMissionIds.length}/{GARDEN_MISSIONS.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {GARDEN_MISSIONS.map((m, idx) => {
                  const done = practice.completedMissionIds.includes(m.id);
                  const active = idx === missionIdx;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectMission(idx)}
                      className={`px-3 py-2 rounded-lg border text-left text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : done
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono tabular-nums">Misi {idx + 1}</span>
                        {done && <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />}
                      </div>
                      <span className="block truncate mt-0.5 font-normal opacity-90">
                        Target {m.targetPerimeter} cm
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Mode 3: Interactive Mini-Game — Balap Keliling Ceria */}
      {activeTab === 'balap' && (
        <SpeedRaceGame
          bestScore={practice.speedBestScore}
          gamesPlayed={practice.speedGamesPlayed}
          soundEnabled={soundEnabled}
          onFinishGame={onFinishSpeedGame}
        />
      )}

      {/* Mode 4: Interactive 2D Character Adventure Mini-Game */}
      {activeTab === 'petualangan' && (
        <CharacterAdventureGame
          bestScore={practice.adventureBestScore}
          bestLevel={practice.adventureBestLevel}
          soundEnabled={soundEnabled}
          onUpdateProgress={onUpdateAdventureProgress}
        />
      )}

      {/* Mode 5: Interactive Mini-Game — Detektif Sisi Hilang */}
      {activeTab === 'detektif' && (
        <DetectiveMissingSideGame
          solvedCaseIds={practice.solvedDetectiveIds}
          soundEnabled={soundEnabled}
          onSolveCase={onSolveDetectiveCase}
          onResetCases={onResetDetectiveCases}
        />
      )}

      {/* Mode 6: Interactive Mini-Game — Kartu Memori Keliling */}
      {activeTab === 'memori' && (
        <MemoryMatchGame
          gamesWon={practice.memoryGamesWon}
          bestMoves={practice.memoryBestMoves}
          soundEnabled={soundEnabled}
          onWinGame={onWinMemoryGame}
        />
      )}
    </div>
  );
};

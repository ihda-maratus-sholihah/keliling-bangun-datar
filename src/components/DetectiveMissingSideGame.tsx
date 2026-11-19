import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  Search,
  Trophy,
  XCircle,
} from 'lucide-react';
import {
  caseToDimensions,
  DETECTIVE_CASES,
  evaluateDetectiveGuess,
} from '../utils/detectiveGame';
import { playFanfare, playSuccessChime, playWrongChime } from '../utils/sound';
import { ShapeDiagram } from './ShapeDiagram';

interface DetectiveMissingSideGameProps {
  solvedCaseIds: string[];
  soundEnabled: boolean;
  onSolveCase: (caseId: string) => void;
  onResetCases: () => void;
}

export const DetectiveMissingSideGame: React.FC<DetectiveMissingSideGameProps> = ({
  solvedCaseIds,
  soundEnabled,
  onSolveCase,
  onResetCases,
}) => {
  const [caseIdx, setCaseIdx] = useState(0);
  const [cluesOpened, setCluesOpened] = useState(0);
  const [lastGuess, setLastGuess] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  const currentCase = DETECTIVE_CASES[caseIdx];
  const isSolved = solvedCaseIds.includes(currentCase.id);
  const allSolved = solvedCaseIds.length >= DETECTIVE_CASES.length;

  const handleSelectCase = (idx: number) => {
    setCaseIdx(idx);
    setCluesOpened(0);
    setLastGuess(null);
    setFeedback(null);
  };

  const handleGuess = (value: number) => {
    setLastGuess(value);
    const result = evaluateDetectiveGuess(currentCase, value);
    setFeedback(result);

    if (result.correct) {
      const willCompleteAll =
        !isSolved && solvedCaseIds.length + 1 >= DETECTIVE_CASES.length;
      if (willCompleteAll) {
        playFanfare(soundEnabled);
      } else {
        playSuccessChime(soundEnabled);
      }
      onSolveCase(currentCase.id);
    } else {
      playWrongChime(soundEnabled);
    }
  };

  const handleNextCase = () => {
    if (caseIdx < DETECTIVE_CASES.length - 1) {
      handleSelectCase(caseIdx + 1);
    } else {
      const nextUnsolved = DETECTIVE_CASES.findIndex((c) => !solvedCaseIds.includes(c.id));
      handleSelectCase(nextUnsolved >= 0 ? nextUnsolved : 0);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Mystery Case Investigation Stage */}
      <section className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-medium text-slate-500">
            Kasus {currentCase.caseNumber} dari {DETECTIVE_CASES.length} ·{' '}
            <span className="font-semibold text-indigo-700">{currentCase.shapeName}</span>
          </div>
          {isSolved && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              Kasus Terpecahkan
            </span>
          )}
        </div>

        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            {currentCase.title}
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-slate-700 leading-relaxed">
            {currentCase.story}
          </p>
        </div>

        {/* Known Perimeter vs Missing Side Strip */}
        <div className="grid grid-cols-2 gap-4 py-3.5 px-4 rounded-xl bg-indigo-50/60 border border-indigo-200">
          <div>
            <span className="block text-xs font-medium text-indigo-800">
              Keliling Diketahui (K)
            </span>
            <p className="font-mono text-2xl font-extrabold text-indigo-950 tabular-nums mt-0.5">
              {currentCase.knownPerimeter} cm
            </p>
          </div>
          <div>
            <span className="block text-xs font-medium text-indigo-800">
              {currentCase.missingLabel}
            </span>
            <p
              data-testid="detective-missing-readout"
              className={`font-mono text-2xl font-extrabold tabular-nums mt-0.5 ${
                isSolved ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {isSolved ? `${currentCase.missingValue} cm` : '? cm'}
            </p>
          </div>
        </div>

        {/* Live Geometric Diagram with Unknown Side */}
        <ShapeDiagram
          shape={currentCase.shape}
          dimensions={caseToDimensions(currentCase)}
          unknownLabel={isSolved ? undefined : currentCase.diagram.unknownLabel}
          compact
          ariaLabel={`Diagram kasus ${currentCase.title} dengan keliling ${currentCase.knownPerimeter} cm`}
        />

        {/* Answer Options */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-slate-700">
            Pilih angka sisi yang hilang:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currentCase.options.map((opt) => {
              const isCorrectOption = isSolved && opt === currentCase.missingValue;
              const isWrongLast =
                !isSolved && lastGuess === opt && feedback && !feedback.correct;

              let btnStyle =
                'bg-white border-slate-200 text-slate-900 hover:border-indigo-400 hover:bg-indigo-50/40';
              if (isCorrectOption) {
                btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900';
              } else if (isWrongLast) {
                btnStyle = 'bg-rose-50 border-rose-400 text-rose-900';
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={isSolved}
                  onClick={() => handleGuess(opt)}
                  className={`py-3 px-4 rounded-xl border-2 font-mono text-base font-bold tabular-nums flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:cursor-default ${btnStyle}`}
                >
                  <span>{opt} cm</span>
                  {isCorrectOption && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  )}
                  {isWrongLast && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progressive Magnifying Glass Clues & Next Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={cluesOpened >= currentCase.clues.length}
            onClick={() => setCluesOpened((c) => Math.min(currentCase.clues.length, c + 1))}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-800 disabled:text-slate-400 disabled:cursor-not-allowed underline underline-offset-4"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span>
              {cluesOpened === 0
                ? 'Buka Kaca Pembesar Petunjuk 1'
                : cluesOpened === 1
                ? 'Buka Petunjuk 2 (Langkah Hitung)'
                : 'Semua Petunjuk Terbuka'}
            </span>
          </button>

          {isSolved && (
            <button
              type="button"
              onClick={handleNextCase}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>
                {caseIdx < DETECTIVE_CASES.length - 1 ? 'Kasus Berikutnya' : 'Lihat Kasus Lain'}
              </span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {cluesOpened > 0 && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2 text-sm text-amber-950">
            <div className="flex items-center gap-1.5 font-semibold text-amber-800 text-xs">
              <Lightbulb className="w-4 h-4" aria-hidden="true" />
              <span>Catatan Kaca Pembesar Detektif</span>
            </div>
            <ol className="list-decimal list-inside space-y-1">
              {currentCase.clues.slice(0, cluesOpened).map((clue, i) => (
                <li key={i}>{clue}</li>
              ))}
            </ol>
          </div>
        )}

        {feedback && (
          <div
            role="status"
            className={`rounded-xl border p-4 text-sm flex items-start gap-2.5 ${
              feedback.correct
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
                : 'bg-rose-50 border-rose-200 text-rose-950 font-medium'
            }`}
          >
            {feedback.correct ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </section>

      {/* Right: Detective Caseboard */}
      <aside className="lg:col-span-4 space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-base font-bold text-slate-900">
              Papan Kasus Detektif
            </h3>
            <span
              data-testid="detective-solved-count"
              className="font-mono text-sm font-bold text-indigo-700 tabular-nums"
            >
              {solvedCaseIds.length}/{DETECTIVE_CASES.length}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Pecahkan minimal <strong>4 kasus</strong> mencari sisi hilang untuk meraih{' '}
            <strong>Lencana Detektif Geometri (+60 XP)</strong>. Setiap kasus memberi +20 XP &amp;
            +2 Bintang!
          </p>

          <div className="grid grid-cols-2 gap-2">
            {DETECTIVE_CASES.map((c, idx) => {
              const solved = solvedCaseIds.includes(c.id);
              const active = idx === caseIdx;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCase(idx)}
                  className={`px-3 py-2.5 rounded-lg border text-left text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : solved
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono tabular-nums">Kasus {c.caseNumber}</span>
                    {solved && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                  </div>
                  <span className="block truncate mt-0.5 font-normal opacity-90">
                    K = {c.knownPerimeter} cm
                  </span>
                </button>
              );
            })}
          </div>

          {allSolved && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 flex items-start gap-2.5 text-xs text-amber-950">
              <Trophy className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>Luar Biasa!</strong> Seluruh 6 kasus Detektif Sisi Hilang sudah tuntas
                dipecahkan!
              </span>
            </div>
          )}

          {solvedCaseIds.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onResetCases();
                handleSelectCase(0);
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ulangi Semua Kasus</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};

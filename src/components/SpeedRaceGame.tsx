import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Flame,
  Heart,
  Play,
  RotateCcw,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import { ShapeDimensions, SpeedRaceQuestion } from '../types';
import { DEFAULT_DIMENSIONS, SHAPE_CATALOG } from '../utils/geometry';
import {
  calculateSpeedPoints,
  generateSpeedDeck,
  SPEED_GAME_DURATION_SEC,
  SPEED_GAME_MAX_LIVES,
  SPEED_GAME_TOTAL_ROUNDS,
} from '../utils/speedGame';
import { playFanfare, playSuccessChime, playWrongChime } from '../utils/sound';
import { ShapeDiagram } from './ShapeDiagram';

interface SpeedRaceGameProps {
  bestScore: number;
  gamesPlayed: number;
  soundEnabled: boolean;
  onFinishGame: (finalScore: number) => void;
}

type RacePhase = 'ready' | 'playing' | 'finished';

export const SpeedRaceGame: React.FC<SpeedRaceGameProps> = ({
  bestScore,
  gamesPlayed,
  soundEnabled,
  onFinishGame,
}) => {
  const [phase, setPhase] = useState<RacePhase>('ready');
  const [seed, setSeed] = useState(gamesPlayed);
  const [deck, setDeck] = useState<SpeedRaceQuestion[]>(() => generateSpeedDeck(0));
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lives, setLives] = useState(SPEED_GAME_MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(SPEED_GAME_DURATION_SEC);
  const [lastFeedback, setLastFeedback] = useState<{
    correct: boolean;
    points: number;
    note: string;
  } | null>(null);
  const [locked, setLocked] = useState(false);

  const scoreRef = useRef(0);
  scoreRef.current = score;
  const finishedRef = useRef(false);
  const advanceTimerRef = useRef<number | null>(null);

  const concludeGame = (finalScore: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setPhase('finished');
    onFinishGame(finalScore);
    if (finalScore >= 50) {
      playFanfare(soundEnabled);
    }
  };

  // Countdown timer during active play
  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          concludeGame(scoreRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const handleStartGame = () => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    setDeck(generateSpeedDeck(nextSeed));
    setRoundIdx(0);
    setScore(0);
    scoreRef.current = 0;
    setCombo(0);
    setBestCombo(0);
    setCorrectCount(0);
    setLives(SPEED_GAME_MAX_LIVES);
    setTimeLeft(SPEED_GAME_DURATION_SEC);
    setLastFeedback(null);
    setLocked(false);
    finishedRef.current = false;
    setPhase('playing');
  };

  const handlePickAnswer = (value: number) => {
    if (locked || phase !== 'playing') return;
    const current = deck[roundIdx];
    const isCorrect = value === current.correctValue;
    setLocked(true);

    let nextScore = score;
    let nextLives = lives;

    if (isCorrect) {
      const nextCombo = combo + 1;
      const earned = calculateSpeedPoints(nextCombo);
      nextScore = score + earned;
      setScore(nextScore);
      scoreRef.current = nextScore;
      setCombo(nextCombo);
      setBestCombo((prev) => Math.max(prev, nextCombo));
      setCorrectCount((c) => c + 1);
      setLastFeedback({
        correct: true,
        points: earned,
        note: current.formulaNote,
      });
      playSuccessChime(soundEnabled);
    } else {
      nextLives = lives - 1;
      setLives(nextLives);
      setCombo(0);
      setLastFeedback({
        correct: false,
        points: 0,
        note: `Jawaban benar: ${current.correctValue} cm (${current.formulaNote})`,
      });
      playWrongChime(soundEnabled);
    }

    const isLastRound = roundIdx >= deck.length - 1;
    advanceTimerRef.current = window.setTimeout(() => {
      if (nextLives <= 0 || isLastRound) {
        concludeGame(nextScore);
      } else {
        setRoundIdx((idx) => idx + 1);
        setLastFeedback(null);
        setLocked(false);
      }
    }, 850);
  };

  if (phase === 'ready') {
    return (
      <section className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-orange-700">
              Mini-Game Baru · Tantangan Cepat Keliling
            </p>
            <h2 className="font-display text-2xl font-extrabold text-slate-900 mt-1">
              Balap Keliling Ceria
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-xl leading-relaxed">
              Uji kecepatanmu menghitung keliling <strong>Segitiga</strong>,{' '}
              <strong>Persegi</strong>, dan <strong>Persegi Panjang</strong> sebelum waktu habis!
              Jawab beruntun untuk mendapatkan bonus kombo poin.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-right shrink-0">
            <span className="block text-xs text-amber-800 font-medium">Rekor Terbaikmu</span>
            <span
              data-testid="speed-best-score"
              className="font-mono text-2xl font-extrabold text-amber-700 tabular-nums"
            >
              {bestScore}
            </span>
            <span className="text-xs text-amber-700 ml-1">poin</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-slate-200">
          <div className="flex items-start gap-2.5">
            <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {SPEED_GAME_DURATION_SEC} Detik · {SPEED_GAME_TOTAL_ROUNDS} Ronde
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Selesaikan 10 tantangan keliling dan cari sisi secepat mungkin.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Heart className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {SPEED_GAME_MAX_LIVES} Nyawa Hati
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Hati berkurang jika jawaban salah. Tetap teliti walau cepat!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Target Lencana 50 Poin</p>
              <p className="text-xs text-slate-600 mt-0.5">
                Raih minimal 50 poin untuk membuka Lencana Pembalap Keliling (+50 XP).
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartGame}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2"
        >
          <Play className="w-4 h-4 fill-current" aria-hidden="true" />
          <span>Mulai Balap Keliling!</span>
        </button>
      </section>
    );
  }

  if (phase === 'finished') {
    const isNewRecord = score > 0 && score >= bestScore;
    const isPerfect = correctCount === SPEED_GAME_TOTAL_ROUNDS;

    return (
      <section className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <Trophy className="w-7 h-7" aria-hidden="true" />
        </div>

        <div>
          <p className="text-xs font-semibold text-orange-700">
            {isPerfect
              ? 'Finish Sempurna 10/10!'
              : lives <= 0
              ? 'Nyawa Habis — Coba Lagi Yuk!'
              : 'Waktu Habis — Balap Selesai!'}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Skor Akhir: <span className="font-mono text-blue-700 tabular-nums">{score}</span> Poin
          </h2>
          {isNewRecord && (
            <p className="text-sm font-semibold text-emerald-700 mt-1">
              Rekor Baru Tercapai! Skor terbaikmu tersimpan otomatis.
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 py-4 border-y border-slate-200">
          <div>
            <span className="block text-xs text-slate-500">Jawaban Benar</span>
            <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
              {correctCount}/{SPEED_GAME_TOTAL_ROUNDS}
            </span>
          </div>
          <div>
            <span className="block text-xs text-slate-500">Kombo Terbaik</span>
            <span className="font-mono text-xl font-bold text-orange-700 tabular-nums">
              x{bestCombo}
            </span>
          </div>
          <div>
            <span className="block text-xs text-slate-500">Rekor Terbaik</span>
            <span className="font-mono text-xl font-bold text-amber-700 tabular-nums">
              {Math.max(bestScore, score)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleStartGame}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Main Balap Lagi</span>
          </button>
        </div>
      </section>
    );
  }

  const currentQ = deck[roundIdx];
  const diagDims: ShapeDimensions = {
    ...DEFAULT_DIMENSIONS,
    sisi: currentQ.diagram.sisi ?? 6,
    panjang: currentQ.diagram.panjang ?? 8,
    lebar: currentQ.diagram.lebar ?? 5,
    triangleKind: currentQ.diagram.triangleKind ?? 'sama-sisi',
    sisiA: currentQ.diagram.sisiA ?? 6,
    sisiB: currentQ.diagram.sisiB ?? 6,
    sisiC: currentQ.diagram.sisiC ?? 6,
  };
  const timePercent = Math.round((timeLeft / SPEED_GAME_DURATION_SEC) * 100);

  return (
    <section className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Live Arcade HUD */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums">
              Ronde {roundIdx + 1}/{SPEED_GAME_TOTAL_ROUNDS}
            </span>
            <div
              className="flex items-center gap-1"
              aria-label={`Sisa ${lives} dari ${SPEED_GAME_MAX_LIVES} nyawa`}
            >
              {Array.from({ length: SPEED_GAME_MAX_LIVES }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 ${
                    i < lives
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-slate-300'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm font-mono font-bold tabular-nums">
            <span className="inline-flex items-center gap-1 text-orange-700">
              <Flame className="w-4 h-4" aria-hidden="true" />
              x{combo}
            </span>
            <span
              data-testid="speed-live-score"
              className="text-blue-700"
            >
              Skor: {score}
            </span>
            <span
              className={`inline-flex items-center gap-1 ${
                timeLeft <= 10 ? 'text-rose-700' : 'text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" aria-hidden="true" />
              {timeLeft} dtk
            </span>
          </div>
        </div>

        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              timeLeft <= 10
                ? 'bg-rose-500'
                : timeLeft <= 20
                ? 'bg-amber-500'
                : 'bg-blue-600'
            }`}
            style={{ width: `${timePercent}%` }}
          />
        </div>
      </div>

      {/* Question & Live Diagram */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
          <span>
            Bangun: <strong className="text-slate-800">{SHAPE_CATALOG[currentQ.shape].name}</strong>
          </span>
          <span>
            {currentQ.kind === 'cari-sisi' ? 'Bonus Cari Sisi' : 'Hitung Keliling Cepat'}
          </span>
        </div>

        <h2 className="font-display text-xl font-bold text-slate-900">
          {currentQ.prompt}
        </h2>

        <ShapeDiagram
          shape={currentQ.diagram.shape}
          dimensions={diagDims}
          unknownLabel={currentQ.diagram.unknownLabel}
          compact
          ariaLabel={`Soal balap ronde ${roundIdx + 1}: ${currentQ.prompt}`}
        />

        {/* 3 Big Tactile Answer Buttons */}
        <div className="grid grid-cols-3 gap-3">
          {currentQ.options.map((optVal) => {
            const isCorrectChoice = optVal === currentQ.correctValue;
            let btnStyle =
              'bg-white border-slate-300 text-slate-900 hover:border-orange-500 hover:bg-orange-50/40';
            if (locked && isCorrectChoice) {
              btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900';
            }

            return (
              <button
                key={optVal}
                type="button"
                disabled={locked}
                onClick={() => handlePickAnswer(optVal)}
                className={`py-4 px-3 rounded-xl border-2 font-mono text-lg sm:text-xl font-bold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 disabled:cursor-default ${btnStyle}`}
              >
                {optVal} cm
              </button>
            );
          })}
        </div>

        {lastFeedback && (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm font-semibold flex items-center gap-2 ${
              lastFeedback.correct
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {lastFeedback.correct ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>
                  Benar! +{lastFeedback.points} poin · {lastFeedback.note}
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
                <span>Kurang tepat! {lastFeedback.note}</span>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

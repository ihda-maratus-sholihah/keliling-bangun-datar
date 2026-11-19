import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, RotateCcw, Sparkles, Star, Trophy } from 'lucide-react';
import { ShapeType } from '../types';
import {
  buildMemoryDeck,
  computeMemoryStars,
  isMatchingPair,
  MemoryCard,
  MemoryDifficulty,
} from '../utils/memoryGame';
import { playFanfare, playStepTick, playSuccessChime, playWrongChime } from '../utils/sound';

interface MemoryMatchGameProps {
  gamesWon: number;
  bestMoves: number | null;
  soundEnabled: boolean;
  onWinGame: (moves: number) => void;
}

function MiniShapeGlyph({ shape }: { shape: ShapeType }) {
  if (shape === 'persegi') {
    return (
      <svg width="46" height="46" viewBox="0 0 48 48" aria-hidden="true">
        <rect
          x="9"
          y="9"
          width="30"
          height="30"
          rx="3"
          fill="#DBEAFE"
          stroke="#2563EB"
          strokeWidth="2.5"
        />
      </svg>
    );
  }
  if (shape === 'persegi-panjang') {
    return (
      <svg width="56" height="42" viewBox="0 0 58 44" aria-hidden="true">
        <rect
          x="5"
          y="9"
          width="48"
          height="26"
          rx="3"
          fill="#DCFCE7"
          stroke="#059669"
          strokeWidth="2.5"
        />
      </svg>
    );
  }
  return (
    <svg width="50" height="46" viewBox="0 0 52 46" aria-hidden="true">
      <polygon
        points="26,6 46,40 6,40"
        fill="#FEF3C7"
        stroke="#D97706"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  gamesWon,
  bestMoves,
  soundEnabled,
  onWinGame,
}) => {
  const [difficulty, setDifficulty] = useState<MemoryDifficulty>('super-mudah');
  const [deck, setDeck] = useState<MemoryCard[]>(() => buildMemoryDeck('super-mudah', 101));
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);

  const timeoutRef = useRef<number | null>(null);
  const totalPairs = deck.length / 2;

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startNewBoard = (nextDiff: MemoryDifficulty) => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDifficulty(nextDiff);
    setDeck(buildMemoryDeck(nextDiff, Date.now()));
    setFlippedUids([]);
    setMatchedPairIds([]);
    setMoves(0);
    setLocked(false);
    setWon(false);
  };

  const handleCardClick = (card: MemoryCard) => {
    if (locked || won) return;
    if (matchedPairIds.includes(card.pairId)) return;
    if (flippedUids.includes(card.uid)) return;

    playStepTick(soundEnabled);

    if (flippedUids.length === 0) {
      setFlippedUids([card.uid]);
      return;
    }

    const firstCard = deck.find((c) => c.uid === flippedUids[0]);
    if (!firstCard) return;

    const nextFlipped = [firstCard.uid, card.uid];
    setFlippedUids(nextFlipped);
    const nextMoves = moves + 1;
    setMoves(nextMoves);

    if (isMatchingPair(firstCard, card)) {
      const nextMatched = [...matchedPairIds, card.pairId];
      setMatchedPairIds(nextMatched);
      setFlippedUids([]);

      if (nextMatched.length >= totalPairs) {
        setWon(true);
        playFanfare(soundEnabled);
        onWinGame(nextMoves);
      } else {
        playSuccessChime(soundEnabled);
      }
    } else {
      setLocked(true);
      playWrongChime(soundEnabled);
      timeoutRef.current = window.setTimeout(() => {
        setFlippedUids([]);
        setLocked(false);
        timeoutRef.current = null;
      }, 850);
    }
  };

  const earnedStars = computeMemoryStars(moves, totalPairs);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-teal-700">
            Mini-Game Kartu Pasangan · Tanpa Batas Waktu
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
            Kartu Memori Keliling
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Buka 2 kartu sekaligus dan pasangkan <strong>gambar bangun datar</strong> dengan{' '}
            <strong>nilai kelilingnya</strong> yang tepat!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div
            role="group"
            aria-label="Pilih Tingkat Kesulitan Memori"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg"
          >
            <button
              type="button"
              aria-pressed={difficulty === 'super-mudah'}
              onClick={() => startNewBoard('super-mudah')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                difficulty === 'super-mudah'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Super Mudah (4 Kartu)
            </button>
            <button
              type="button"
              aria-pressed={difficulty === 'mudah'}
              onClick={() => startNewBoard('mudah')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                difficulty === 'mudah'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mudah (8 Kartu)
            </button>
            <button
              type="button"
              aria-pressed={difficulty === 'seru'}
              onClick={() => startNewBoard('seru')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                difficulty === 'seru'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Seru (12 Kartu)
            </button>
          </div>

          <button
            type="button"
            onClick={() => startNewBoard(difficulty)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Acak Ulang</span>
          </button>
        </div>
      </div>

      {/* Live Metrics Strip */}
      <div className="grid grid-cols-3 gap-3 py-3 px-4 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <span className="block text-xs text-slate-500">Pasangan Cocok</span>
          <span
            data-testid="memory-matched-count"
            className="font-mono text-lg sm:text-xl font-bold text-teal-700 tabular-nums"
          >
            {matchedPairIds.length}/{totalPairs}
          </span>
        </div>
        <div>
          <span className="block text-xs text-slate-500">Jumlah Langkah</span>
          <span
            data-testid="memory-moves-count"
            className="font-mono text-lg sm:text-xl font-bold text-slate-900 tabular-nums"
          >
            {moves}
          </span>
        </div>
        <div>
          <span className="block text-xs text-slate-500">Rekor Terbaik</span>
          <span className="font-mono text-lg sm:text-xl font-bold text-blue-700 tabular-nums">
            {bestMoves !== null ? `${bestMoves} langkah` : `${gamesWon} menang`}
          </span>
        </div>
      </div>

      {/* Victory Banner */}
      {won && (
        <div
          role="status"
          className="rounded-xl bg-emerald-50 border border-emerald-300 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
              <Trophy className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
              <span>Hebat! Semua {totalPairs} Pasangan Keliling Berhasil Ditemukan!</span>
            </div>
            <p className="text-sm text-emerald-900">
              Selesai dalam <strong className="font-mono">{moves} langkah</strong> · Meraih{' '}
              <strong>{earnedStars} Bintang Papan</strong> &amp; Lencana Master Memori (+50 XP).
            </p>
            <div className="flex items-center gap-1 pt-0.5" aria-label={`Nilai ${earnedStars} dari 3 bintang`}>
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= earnedStars
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-300'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => startNewBoard(difficulty)}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Main Papan Baru</span>
          </button>
        </div>
      )}

      {/* Interactive Flip Card Grid */}
      <div
        data-testid="memory-card-grid"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3.5"
      >
        {deck.map((card, index) => {
          const isMatched = matchedPairIds.includes(card.pairId);
          const isFlipped = isMatched || flippedUids.includes(card.uid);

          return (
            <button
              key={card.uid}
              type="button"
              data-card-uid={card.uid}
              data-pair-id={card.pairId}
              data-flipped={isFlipped ? 'true' : 'false'}
              disabled={isMatched || locked}
              onClick={() => handleCardClick(card)}
              aria-label={
                isFlipped
                  ? card.kind === 'shape'
                    ? `Kartu ${index + 1}: ${card.shapeLabel} ${card.dimsText}`
                    : `Kartu ${index + 1}: Keliling ${card.perimeter} cm`
                  : `Buka Kartu Memori ${index + 1}`
              }
              className={`min-h-[132px] rounded-xl border-2 p-3.5 flex flex-col items-center justify-center text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                isMatched
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  : isFlipped
                  ? 'bg-white border-teal-500 text-slate-900 shadow-sm'
                  : 'bg-teal-50/70 border-teal-200 hover:border-teal-400 hover:bg-teal-50 text-teal-900'
              }`}
            >
              {!isFlipped ? (
                <div className="flex flex-col items-center gap-1.5">
                  <Sparkles className="w-6 h-6 text-teal-600" aria-hidden="true" />
                  <span className="font-display text-sm font-bold text-teal-900">
                    Kartu {index + 1}
                  </span>
                  <span className="text-[11px] font-medium text-teal-700">Ketuk untuk buka</span>
                </div>
              ) : card.kind === 'shape' ? (
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <div className="flex items-center justify-center gap-1">
                    <MiniShapeGlyph shape={card.shape} />
                    {isMatched && (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-600 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {card.shapeLabel}
                  </span>
                  <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums">
                    {card.dimsText}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-slate-500">Total Keliling</span>
                  <span className="font-mono text-2xl font-extrabold text-teal-800 tabular-nums">
                    {card.perimeter} cm
                  </span>
                  {isMatched && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Cocok!
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-500">
        Tips: Hitung keliling dari kartu bangun yang terbuka, lalu ingat letak kartu angka{' '}
        <span className="font-mono">cm</span> pasangannya. Selesaikan 1 papan untuk membuka Lencana{' '}
        <strong>Master Memori (+50 XP)</strong>!
      </p>
    </section>
  );
};

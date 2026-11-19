import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Star,
} from 'lucide-react';
import { ShapeDimensions, ShapeType, TriangleKind } from '../types';
import {
  calculatePerimeter,
  DEFAULT_DIMENSIONS,
  RIGHT_TRIANGLE_PRESETS,
  SHAPE_CATALOG,
  SHAPE_LIST,
} from '../utils/geometry';
import { playStepTick } from '../utils/sound';
import { ShapeDiagram } from './ShapeDiagram';

interface MateriViewProps {
  selectedShape: ShapeType;
  onSelectShape: (shape: ShapeType) => void;
  learnedShapes: ShapeType[];
  onToggleLearnedShape: (shape: ShapeType) => void;
  onCompleteAnimation: (shape: ShapeType) => void;
  onNextToLatihan: () => void;
  soundEnabled: boolean;
}

export const MateriView: React.FC<MateriViewProps> = ({
  selectedShape,
  onSelectShape,
  learnedShapes,
  onToggleLearnedShape,
  onCompleteAnimation,
  onNextToLatihan,
  soundEnabled,
}) => {
  const [dims, setDims] = useState<ShapeDimensions>(DEFAULT_DIMENSIONS);
  const [showGrid, setShowGrid] = useState(true);
  const [showRightAngles, setShowRightAngles] = useState(true);
  const [showSymmetry, setShowSymmetry] = useState(false);

  // Perimeter Walker Animation state
  const [isWalking, setIsWalking] = useState(false);
  const [walkProgress, setWalkProgress] = useState<number | null>(null);
  const lastCompletedEdgeRef = useRef(-1);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const calc = calculatePerimeter(selectedShape, dims);
  const meta = SHAPE_CATALOG[selectedShape];
  const isLearned = learnedShapes.includes(selectedShape);
  const totalEdges = calc.sides.length;

  // Reset animation when switching shape or changing dimensions
  useEffect(() => {
    setIsWalking(false);
    setWalkProgress(null);
    lastCompletedEdgeRef.current = -1;
  }, [selectedShape, dims.sisi, dims.panjang, dims.lebar, dims.triangleKind, dims.sisiA, dims.sisiB, dims.sisiC]);

  // Smooth RAF loop for Perimeter Walker
  useEffect(() => {
    if (!isWalking) return;

    let rafId = 0;
    let lastTime = performance.now();
    const edgesPerSecond = 0.78;

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      setWalkProgress((prev) => {
        const startVal = prev === null || prev >= totalEdges ? 0 : prev;
        const nextVal = Math.min(totalEdges, startVal + dt * edgesPerSecond);

        const completedEdgeIndex = Math.floor(nextVal) - 1;
        if (completedEdgeIndex > lastCompletedEdgeRef.current) {
          lastCompletedEdgeRef.current = completedEdgeIndex;
          playStepTick(soundEnabledRef.current);
        }

        if (nextVal >= totalEdges) {
          setIsWalking(false);
          onCompleteAnimation(selectedShape);
          return totalEdges;
        }
        return nextVal;
      });

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isWalking, totalEdges, selectedShape, onCompleteAnimation]);

  const handleStartOrPauseWalk = () => {
    if (isWalking) {
      setIsWalking(false);
    } else {
      if (walkProgress === null || walkProgress >= totalEdges) {
        setWalkProgress(0);
        lastCompletedEdgeRef.current = -1;
      }
      setIsWalking(true);
    }
  };

  const handleResetWalk = () => {
    setIsWalking(false);
    setWalkProgress(null);
    lastCompletedEdgeRef.current = -1;
  };

  const handleTriangleKindChange = (kind: TriangleKind) => {
    if (kind === 'sama-sisi') {
      setDims((d) => ({ ...d, triangleKind: kind, sisiA: 6, sisiB: 6, sisiC: 6 }));
    } else if (kind === 'sama-kaki') {
      setDims((d) => ({ ...d, triangleKind: kind, sisiA: 6, sisiB: 8, sisiC: 8 }));
    } else {
      setDims((d) => ({ ...d, triangleKind: kind, sisiA: 8, sisiB: 6, sisiC: 10 }));
    }
  };

  // Compute running sum during perimeter walk
  const completedEdgesCount =
    walkProgress === null ? 0 : Math.min(totalEdges, Math.floor(walkProgress + 0.001));
  const runningSum = calc.sides
    .slice(0, completedEdgesCount)
    .reduce((acc, val) => acc + val, 0);

  return (
    <div className="space-y-6">
      {/* Module Title & Shape Segmented Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            02. Materi Interaktif · Eksplorasi Keliling Bangun Datar
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Laboratorium Keliling {meta.name}
          </h1>
        </div>

        {/* Interactive Shape Selector Tabs */}
        <div
          role="tablist"
          aria-label="Pilih Bangun Datar"
          className="inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl self-start"
        >
          {SHAPE_LIST.map((shapeKey) => {
            const item = SHAPE_CATALOG[shapeKey];
            const active = selectedShape === shapeKey;
            const done = learnedShapes.includes(shapeKey);
            return (
              <button
                key={shapeKey}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectShape(shapeKey)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{item.name}</span>
                {done && (
                  <CheckCircle2
                    className="w-4 h-4 text-emerald-600"
                    aria-label="Sudah dipahami"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Zone Educational Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone (~62%): Interactive Geometry Stage */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Papan Petak Interaktif
              </h2>
              <p className="text-xs text-slate-500">
                Geser pengatur ukuran di kanan atau jalankan animasi pengukur keliling.
              </p>
            </div>

            {/* Stage Display Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGrid((v) => !v)}
                aria-pressed={showGrid}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                  showGrid
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Petak
              </button>
              <button
                type="button"
                onClick={() => setShowRightAngles((v) => !v)}
                aria-pressed={showRightAngles}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                  showRightAngles
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Sudut 90°
              </button>
              <button
                type="button"
                onClick={() => setShowSymmetry((v) => !v)}
                aria-pressed={showSymmetry}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                  showSymmetry
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Simetri
              </button>
            </div>
          </div>

          <ShapeDiagram
            shape={selectedShape}
            dimensions={dims}
            showGrid={showGrid}
            showRightAngles={showRightAngles}
            showSymmetry={showSymmetry}
            walkProgress={walkProgress}
            ariaLabel={`Diagram interaktif ${meta.name} dengan keliling ${calc.perimeter} sentimeter`}
          />

          {/* Perimeter Walker Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartOrPauseWalk}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
              >
                {isWalking ? (
                  <>
                    <Pause className="w-4 h-4" aria-hidden="true" />
                    <span>Jeda Pengukur</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {walkProgress !== null && walkProgress >= totalEdges
                        ? 'Putar Ulang Keliling'
                        : 'Jalankan Pengukur Keliling'}
                    </span>
                  </>
                )}
              </button>

              {walkProgress !== null && (
                <button
                  type="button"
                  onClick={handleResetWalk}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="text-xs font-mono text-slate-600 tabular-nums">
              {walkProgress === null ? (
                <span>Klik jalankan untuk melihat titik berjalan mengelilingi sisi</span>
              ) : completedEdgesCount >= totalEdges ? (
                <span className="font-semibold text-emerald-700">
                  Selesai 1 putaran penuh! Total = {calc.perimeter} cm (+15 XP)
                </span>
              ) : (
                <span className="font-semibold text-amber-800">
                  Sisi terukur: {completedEdgesCount}/{totalEdges} · Jumlah sementara: {runningSum} cm
                </span>
              )}
            </div>
          </div>

          {/* Live Perimeter Formula Readout */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Hasil Perhitungan Keliling {meta.name}
              </span>
              <span className="font-mono text-sm font-semibold text-blue-700">
                {calc.formulaSymbolic}
              </span>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div className="font-mono text-sm sm:text-base text-slate-800 tabular-nums">
                K = {calc.formulaExpansion} ={' '}
                <strong className="text-slate-950">{calc.formulaSummary}</strong>
              </div>
              <div
                data-testid="materi-perimeter-value"
                className="font-mono text-2xl sm:text-3xl font-bold text-blue-700 tabular-nums"
              >
                {calc.perimeter} cm
              </div>
            </div>

            <ol className="pt-2 border-t border-slate-200 space-y-1 text-xs sm:text-sm text-slate-600 list-decimal list-inside">
              {calc.stepByStep.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        </section>

        {/* Right Zone (~38%): Controls & Concept Deck */}
        <aside className="lg:col-span-5 space-y-5">
          {/* Interactive Sliders Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Atur Ukuran Sisi
              </h2>
              <button
                type="button"
                onClick={() => setDims(DEFAULT_DIMENSIONS)}
                className="text-xs font-semibold text-slate-600 hover:text-blue-700 underline underline-offset-2"
              >
                Reset Ukuran
              </button>
            </div>

            {selectedShape === 'persegi' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor="slider-persegi-sisi" className="font-semibold text-slate-800">
                    Panjang Sisi (s)
                  </label>
                  <span className="font-mono font-semibold text-blue-700 tabular-nums">
                    {dims.sisi} cm
                  </span>
                </div>
                <input
                  id="slider-persegi-sisi"
                  type="range"
                  min={2}
                  max={12}
                  step={1}
                  value={dims.sisi}
                  onChange={(e) => setDims((d) => ({ ...d, sisi: Number(e.target.value) }))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400 tabular-nums">
                  <span>2 cm</span>
                  <span>7 cm</span>
                  <span>12 cm</span>
                </div>
              </div>
            )}

            {selectedShape === 'persegi-panjang' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <label htmlFor="slider-pp-panjang" className="font-semibold text-slate-800">
                      Panjang (p)
                    </label>
                    <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                      {dims.panjang} cm
                    </span>
                  </div>
                  <input
                    id="slider-pp-panjang"
                    type="range"
                    min={4}
                    max={14}
                    step={1}
                    value={dims.panjang}
                    onChange={(e) =>
                      setDims((d) => ({ ...d, panjang: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <label htmlFor="slider-pp-lebar" className="font-semibold text-slate-800">
                      Lebar (l)
                    </label>
                    <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                      {dims.lebar} cm
                    </span>
                  </div>
                  <input
                    id="slider-pp-lebar"
                    type="range"
                    min={2}
                    max={10}
                    step={1}
                    value={dims.lebar}
                    onChange={(e) =>
                      setDims((d) => ({ ...d, lebar: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {selectedShape === 'segitiga' && (
              <div className="space-y-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-600 mb-2">
                    Jenis Segitiga
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
                    {(
                      [
                        { id: 'sama-sisi', label: 'Sama Sisi' },
                        { id: 'sama-kaki', label: 'Sama Kaki' },
                        { id: 'siku-siku', label: 'Siku-siku' },
                      ] as { id: TriangleKind; label: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleTriangleKindChange(opt.id)}
                        className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                          dims.triangleKind === opt.id
                            ? 'bg-white text-orange-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {dims.triangleKind === 'sama-sisi' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <label htmlFor="slider-tri-eq" className="font-semibold text-slate-800">
                        Panjang Tiap Sisi (s)
                      </label>
                      <span className="font-mono font-semibold text-orange-700 tabular-nums">
                        {dims.sisiA} cm
                      </span>
                    </div>
                    <input
                      id="slider-tri-eq"
                      type="range"
                      min={3}
                      max={12}
                      step={1}
                      value={dims.sisiA}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setDims((d) => ({ ...d, sisiA: v, sisiB: v, sisiC: v }));
                      }}
                      className="w-full accent-orange-600 cursor-pointer"
                    />
                  </div>
                )}

                {dims.triangleKind === 'sama-kaki' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <label htmlFor="slider-tri-alas" className="font-semibold text-slate-800">
                          Panjang Alas (a)
                        </label>
                        <span className="font-mono font-semibold text-orange-700 tabular-nums">
                          {dims.sisiA} cm
                        </span>
                      </div>
                      <input
                        id="slider-tri-alas"
                        type="range"
                        min={4}
                        max={12}
                        step={1}
                        value={dims.sisiA}
                        onChange={(e) => {
                          const alas = Number(e.target.value);
                          const minKaki = Math.floor(alas / 2) + 2;
                          setDims((d) => ({
                            ...d,
                            sisiA: alas,
                            sisiB: Math.max(d.sisiB, minKaki),
                            sisiC: Math.max(d.sisiB, minKaki),
                          }));
                        }}
                        className="w-full accent-orange-600 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <label htmlFor="slider-tri-kaki" className="font-semibold text-slate-800">
                          Panjang Sisi Kaki (b &amp; c)
                        </label>
                        <span className="font-mono font-semibold text-orange-700 tabular-nums">
                          {dims.sisiB} cm
                        </span>
                      </div>
                      <input
                        id="slider-tri-kaki"
                        type="range"
                        min={Math.floor(dims.sisiA / 2) + 2}
                        max={12}
                        step={1}
                        value={dims.sisiB}
                        onChange={(e) => {
                          const kaki = Number(e.target.value);
                          setDims((d) => ({ ...d, sisiB: kaki, sisiC: kaki }));
                        }}
                        className="w-full accent-orange-600 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {dims.triangleKind === 'siku-siku' && (
                  <div className="space-y-2">
                    <span className="block text-xs font-medium text-slate-600">
                      Pilih Paket Sisi Siku-siku (Tripel Pythagoras SD):
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {RIGHT_TRIANGLE_PRESETS.map((preset) => {
                        const isSelected =
                          dims.sisiA === preset.a &&
                          dims.sisiB === preset.b &&
                          dims.sisiC === preset.c;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() =>
                              setDims((d) => ({
                                ...d,
                                sisiA: preset.a,
                                sisiB: preset.b,
                                sisiC: preset.c,
                              }))
                            }
                            className={`px-3 py-2 text-left text-xs font-mono font-semibold rounded-lg border transition-colors ${
                              isSelected
                                ? 'bg-orange-50 border-orange-300 text-orange-800'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            Sisi: {preset.label} → K = {preset.a + preset.b + preset.c} cm
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mastery Action Button */}
            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => onToggleLearnedShape(selectedShape)}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isLearned
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLearned ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    <span>Materi {meta.name} Sudah Paham!</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4" aria-hidden="true" />
                    <span>Tandai Paham {meta.name} (+30 XP)</span>
                  </>
                )}
              </button>

              <p className="text-xs text-center text-slate-500 tabular-nums">
                Progres materi: {learnedShapes.length} dari 3 bangun datar dipahami
              </p>
            </div>
          </div>

          {/* Properties & Tip Bu Ihda */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Ciri-ciri {meta.name}
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-600 list-disc list-inside">
                {meta.properties.map((prop, i) => (
                  <li key={i}>{prop}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <h4 className="text-xs font-semibold text-slate-700">
                Contoh di Sekitar Kelas
              </h4>
              <p className="text-sm text-slate-600 mt-1">
                {meta.realWorldExamples.join(' · ')}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 bg-amber-50/70 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 px-5 sm:px-6 py-4 rounded-b-2xl">
              <div className="flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-amber-900">
                    Tips Ibu Ihda Mar&apos;atus Sholihah
                  </p>
                  <p className="text-xs sm:text-sm text-amber-900/90 mt-1 leading-relaxed">
                    {meta.tipBuIhda}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Module Shortcut */}
          <button
            type="button"
            onClick={onNextToLatihan}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors"
          >
            <span>Lanjut ke 03 Latihan &amp; Mini-Game</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </aside>
      </div>
    </div>
  );
};

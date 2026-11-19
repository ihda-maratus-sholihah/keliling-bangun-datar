import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  RotateCcw,
  Star,
  Trophy,
  XCircle,
} from 'lucide-react';
import { AssessmentAttempt, ShapeType } from '../types';
import { ASSESSMENT_QUESTIONS, KKM_SCORE } from '../utils/assessment';
import { SHAPE_CATALOG } from '../utils/geometry';
import { formatDuration, formatShortDate } from '../utils/recap';

type ReviewFilter = 'semua' | 'benar' | 'salah';

interface HasilViewProps {
  attempt: AssessmentAttempt | null;
  onRetakeAssessment: () => void;
  onGoToRekap: () => void;
  onReviewShapeInMateri: (shape: ShapeType) => void;
}

export const HasilView: React.FC<HasilViewProps> = ({
  attempt,
  onRetakeAssessment,
  onGoToRekap,
  onReviewShapeInMateri,
}) => {
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('semua');

  if (!attempt) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-700">
          <Trophy className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Belum Ada Hasil Asesmen
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Kerjakan 10 soal pada tahap <strong>04 Asesmen</strong> terlebih dahulu untuk melihat
          nilai, predikat, analisis per bangun datar, serta pembahasan lengkapnya di sini.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onRetakeAssessment}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <span>Mulai 04 Asesmen Sekarang</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onGoToRekap}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <span>Lihat 06 Rekap Kelas</span>
          </button>
        </div>
      </div>
    );
  }

  const filteredQuestions = ASSESSMENT_QUESTIONS.filter((q) => {
    const isCorrect = attempt.answers[q.id] === q.correctKey;
    if (reviewFilter === 'benar') return isCorrect;
    if (reviewFilter === 'salah') return !isCorrect;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            05. Hasil Asesmen · SD N 2 SELOKATON · Guru: Ihda Mar&apos;atus Sholihah
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Laporan Hasil Belajar — {attempt.studentName}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onRetakeAssessment}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Kerjakan Ulang</span>
          </button>
          <button
            type="button"
            onClick={onGoToRekap}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <ClipboardList className="w-4 h-4" aria-hidden="true" />
            <span>Lihat 06 Rekap Kelas</span>
          </button>
        </div>
      </div>

      {/* Main Score & Celebration Banner */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 flex items-center gap-5">
          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border flex flex-col items-center justify-center shrink-0 ${
              attempt.passed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <span className="text-xs font-semibold uppercase tracking-wide opacity-80">Nilai</span>
            <span
              data-testid="hasil-score-value"
              className="font-mono text-4xl font-extrabold tabular-nums leading-none mt-1"
            >
              {attempt.score}
            </span>
          </div>

          <div className="space-y-1.5 min-w-0">
            <div
              className={`inline-flex items-center gap-1.5 text-sm font-bold ${
                attempt.passed ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {attempt.passed ? (
                <>
                  <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>Tuntas · Melampaui KKM {KKM_SCORE}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>Belum Tuntas · KKM {KKM_SCORE}</span>
                </>
              )}
            </div>

            <h2 className="font-display text-xl font-bold text-slate-900">
              Predikat: {attempt.predicate}
            </h2>
            <p className="text-sm text-slate-600">
              {attempt.passed
                ? 'Luar biasa! Kamu sudah menguasai keliling segitiga, persegi, dan persegi panjang.'
                : 'Tetap semangat! Yuk pelajari kembali bangun datar yang masih kurang lalu coba lagi.'}
            </p>
          </div>
        </div>

        {/* Quantitative Metrics Strip */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6">
          <div>
            <span className="block text-xs text-slate-500">Jawaban Benar</span>
            <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-1">
              {attempt.correctCount} / {attempt.totalQuestions}
            </p>
          </div>
          <div>
            <span className="block text-xs text-slate-500">Bintang Diraih</span>
            <p className="font-mono text-lg font-bold text-amber-700 tabular-nums mt-1 flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" aria-hidden="true" />
              <span>+{attempt.starsEarned}</span>
            </p>
          </div>
          <div>
            <span className="block text-xs text-slate-500">Waktu Pengerjaan</span>
            <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-1">
              {formatDuration(attempt.durationSeconds)}
            </p>
          </div>
          <div>
            <span className="block text-xs text-slate-500">Kelas &amp; Tanggal</span>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {attempt.kelas}
            </p>
            <p className="text-xs text-slate-500">{formatShortDate(attempt.completedAt)}</p>
          </div>
        </div>
      </section>

      {/* Topic Breakdown per Shape */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            Analisis Penguasaan per Bangun Datar
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Lihat bangun datar mana yang sudah kuat dan mana yang perlu diulang di laboratorium
            materi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-t border-slate-200 pt-5">
          {attempt.topicBreakdown.map((topic, index) => (
            <div
              key={topic.shape}
              className={`flex flex-col justify-between gap-3 py-4 first:pt-0 last:pb-0 md:py-0 ${
                index === 0 ? 'md:pr-6' : index === 1 ? 'md:px-6' : 'md:pl-6'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {topic.label}
                  </h3>
                  <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                    {topic.correct}/{topic.total} ({topic.percent}%)
                  </span>
                </div>

                <div className="mt-2.5 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      topic.percent >= 75
                        ? 'bg-emerald-600'
                        : topic.percent >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${topic.percent}%` }}
                  />
                </div>

                <p className="mt-2 text-xs font-medium text-slate-600">
                  Status: <strong className="text-slate-900">{topic.status}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => onReviewShapeInMateri(topic.shape)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 underline underline-offset-4 self-start"
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pelajari Ulang {topic.label}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Filterable Answer Review & Pembahasan */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Rincian Jawaban &amp; Pembahasan
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Periksa setiap langkah penyelesaian agar semakin paham.
            </p>
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(
              [
                { id: 'semua', label: `Semua (${attempt.totalQuestions})` },
                { id: 'benar', label: `Benar (${attempt.correctCount})` },
                {
                  id: 'salah',
                  label: `Salah (${attempt.totalQuestions - attempt.correctCount})`,
                },
              ] as { id: ReviewFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReviewFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  reviewFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">
            Tidak ada soal pada kategori filter ini.
          </p>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredQuestions.map((q) => {
              const userKey = attempt.answers[q.id];
              const isCorrect = userKey === q.correctKey;
              const userOption = q.options.find((o) => o.key === userKey);
              const correctOption = q.options.find((o) => o.key === q.correctKey);

              return (
                <article key={q.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-semibold text-slate-500 tabular-nums">
                      Soal #{q.number} · {SHAPE_CATALOG[q.shape].name} · {q.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        isCorrect ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          Benar
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" aria-hidden="true" />
                          Belum Tepat
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-900">{q.prompt}</p>

                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
                    <span>
                      Jawaban Kamu:{' '}
                      <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                        {userOption ? `${userOption.key}. ${userOption.text}` : 'Tidak dijawab'}
                      </strong>
                    </span>
                    {!isCorrect && correctOption && (
                      <span>
                        Kunci Jawaban:{' '}
                        <strong className="text-emerald-700">
                          {correctOption.key}. {correctOption.text}
                        </strong>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5">
                    <strong className="text-slate-800">Pembahasan:</strong> {q.explanation}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

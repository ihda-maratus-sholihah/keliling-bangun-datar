import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Download,
  Eye,
  Printer,
  RotateCcw,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  AppState,
  AssessmentAttempt,
  BadgeId,
  RecapFilterStatus,
  RecapSortBy,
} from '../types';
import { BADGE_DEFINITIONS } from '../utils/gamification';
import {
  computeRecapSummary,
  filterAndSortRecaps,
  formatDuration,
  formatShortDate,
  generateRecapCsv,
} from '../utils/recap';

interface RekapViewProps {
  state: AppState;
  unlockedBadges: BadgeId[];
  xp: number;
  stars: number;
  onViewAttemptResult: (attemptId: string) => void;
  onDeleteAttempt: (attemptId: string) => void;
  onResetAllProgress: () => void;
}

export const RekapView: React.FC<RekapViewProps> = ({
  state,
  unlockedBadges,
  xp,
  stars,
  onViewAttemptResult,
  onDeleteAttempt,
  onResetAllProgress,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RecapFilterStatus>('semua');
  const [sortBy, setSortBy] = useState<RecapSortBy>('terbaru');
  const [confirmReset, setConfirmReset] = useState(false);

  const filteredAttempts: AssessmentAttempt[] = filterAndSortRecaps(
    state.attempts,
    searchQuery,
    statusFilter,
    sortBy
  );
  const summary = computeRecapSummary(state.attempts);

  const correctPracticeCount = Object.values(state.practice.answeredIds).filter(
    (entry) => entry.correct
  ).length;

  const handleExportCsv = () => {
    const csvContent = generateRecapCsv(filteredAttempts);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rekap-keliling-sdn2-selokaton.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            06. Rekap Pembelajaran · SD N 2 SELOKATON · Guru: Ihda Mar&apos;atus Sholihah
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Rekap Nilai &amp; Progres Kelas
          </h1>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredAttempts.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Unduh CSV Rekap</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* 4-Column KPI Summary Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-medium text-slate-500">Progres Materi Siswa</span>
          <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {state.learnedShapes.length} / 3
          </p>
          <p className="text-xs text-slate-500 mt-1">Bangun datar dipahami</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-medium text-slate-500">Latihan &amp; Misi Taman</span>
          <p className="font-mono text-2xl font-bold text-emerald-700 tabular-nums mt-1">
            {correctPracticeCount}/6 · {state.practice.completedMissionIds.length}/6
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {xp} XP · {stars} Bintang diraih
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-medium text-slate-500">Rata-rata Nilai Kelas</span>
          <p className="font-mono text-2xl font-bold text-blue-700 tabular-nums mt-1">
            {summary.averageScore}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            Tertinggi: {summary.highestScore} ({summary.totalAttempts} data)
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-medium text-slate-500">Ketuntasan KKM (≥ 75)</span>
          <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {summary.passRate}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Lencana dibuka: {unlockedBadges.length}/{BADGE_DEFINITIONS.length}
          </p>
        </div>
      </section>

      {/* Assessment Recap Data Table */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Tabel Rekap Asesmen Siswa
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Klik <strong>Lihat Hasil</strong> pada baris mana saja untuk membuka laporan
              diagnostik siswa tersebut.
            </p>
          </div>

          {/* Search, Status Filter, Sort Controls */}
          <div className="no-print flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <label htmlFor="rekap-search" className="sr-only">
                Cari nama siswa atau kelas
              </label>
              <input
                id="rekap-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama siswa..."
                className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 w-48 sm:w-56"
              />
            </div>

            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
              {(
                [
                  { id: 'semua', label: 'Semua' },
                  { id: 'tuntas', label: 'Tuntas' },
                  { id: 'belum-tuntas', label: 'Belum Tuntas' },
                ] as { id: RecapFilterStatus; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    statusFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <label htmlFor="rekap-sort" className="sr-only">
              Urutkan rekap
            </label>
            <select
              id="rekap-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as RecapSortBy)}
              className="px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="terbaru">Urutkan: Terbaru</option>
              <option value="nilai-tertinggi">Urutkan: Nilai Tertinggi</option>
              <option value="nama-az">Urutkan: Nama A–Z</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-3 pr-4">Nama Siswa</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Durasi</th>
                <th className="py-3 px-3">Benar</th>
                <th className="py-3 px-3">Nilai</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 pl-3 text-right no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tidak ada data rekap yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pr-4 font-semibold text-slate-900">
                      {row.studentName}
                      {row.isSample && (
                        <span className="ml-2 text-xs font-normal text-slate-400">
                          (Contoh)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      {row.kelas}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap tabular-nums">
                      {formatShortDate(row.completedAt)}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs text-slate-600 tabular-nums">
                      {formatDuration(row.durationSeconds)}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-700 tabular-nums">
                      {row.correctCount}/{row.totalQuestions}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900 tabular-nums">
                      {row.score}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          row.passed ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {row.passed ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                            Tuntas
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" aria-hidden="true" />
                            Belum Tuntas
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 pl-3 text-right whitespace-nowrap no-print">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onViewAttemptResult(row.id)}
                          aria-label={`Lihat hasil asesmen ${row.studentName}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Lihat Hasil</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteAttempt(row.id)}
                          aria-label={`Hapus data ${row.studentName}`}
                          className="inline-flex items-center justify-center w-8 h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Badges & Reset Controls */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              Ringkasan Pencapaian Lencana ({unlockedBadges.length}/{BADGE_DEFINITIONS.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BADGE_DEFINITIONS.map((b) => {
              const achieved = unlockedBadges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`rounded-xl border p-3.5 flex items-start justify-between gap-3 ${
                    achieved
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{b.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{b.description}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      achieved ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {achieved ? 'Diraih' : 'Belum'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Teacher Sign-off & Reset */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <p className="text-xs font-semibold text-slate-500">Pengesahan Pembelajaran</p>
            <h3 className="font-display text-lg font-bold text-slate-900">
              SD N 2 SELOKATON
            </h3>
            <p className="text-sm text-slate-700">
              Guru Pengampu: <strong>Ihda Mar&apos;atus Sholihah</strong>
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Materi: Keliling Bangun Datar (Segitiga, Persegi, dan Persegi Panjang) · KKM 75.
            </p>
          </div>

          <div className="no-print bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Kelola Data Lokal</h3>
            <p className="text-xs text-slate-600">
              Gunakan tombol di bawah jika ingin mengembalikan progres latihan dan data contoh ke
              kondisi awal.
            </p>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset Semua Progres</span>
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-rose-800">
                  Yakin ingin mereset seluruh progres dan nilai?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onResetAllProgress();
                      setConfirmReset(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                  >
                    Ya, Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
};

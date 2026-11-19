import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck2,
  Plus,
  Send,
} from 'lucide-react';
import { AssessmentAttempt, ShapeDimensions, StudentProfile } from '../types';
import { ASSESSMENT_QUESTIONS, gradeAssessment, KKM_SCORE } from '../utils/assessment';
import { AddClassResult } from '../utils/classes';
import { DEFAULT_DIMENSIONS, SHAPE_CATALOG } from '../utils/geometry';
import { formatDuration } from '../utils/recap';
import { ShapeDiagram } from './ShapeDiagram';

const ADD_NEW_CLASS_VALUE = '__add_new_class__';

interface AsesmenViewProps {
  profile: StudentProfile;
  classOptions: string[];
  onAddCustomClass: (rawClassName: string) => AddClassResult;
  onUpdateProfile: (name: string, kelas: string) => void;
  onSubmitAttempt: (attempt: AssessmentAttempt) => void;
}

export const AsesmenView: React.FC<AsesmenViewProps> = ({
  profile,
  classOptions,
  onAddCustomClass,
  onUpdateProfile,
  onSubmitAttempt,
}) => {
  const [phase, setPhase] = useState<'briefing' | 'active'>('briefing');
  const [nameInput, setNameInput] = useState(profile.name);
  const [kelasInput, setKelasInput] = useState(profile.kelas || classOptions[0] || 'Kelas 4A');
  const [nameError, setNameError] = useState<string | null>(null);

  // Add custom class inline state
  const [addingClass, setAddingClass] = useState(false);
  const [newClassInput, setNewClassInput] = useState('');
  const [addClassError, setAddClassError] = useState<string | null>(null);
  const [addClassSuccess, setAddClassSuccess] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Sync profile changes if user edited on Pembuka
  useEffect(() => {
    if (profile.name && !nameInput) {
      setNameInput(profile.name);
    }
    if (profile.kelas) {
      setKelasInput(profile.kelas);
    }
  }, [profile.name, profile.kelas, nameInput]);

  // Live timer during active exam
  useEffect(() => {
    if (phase !== 'active') return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const handleKelasSelectChange = (value: string) => {
    if (value === ADD_NEW_CLASS_VALUE) {
      setAddingClass(true);
      setAddClassError(null);
      setAddClassSuccess(null);
      return;
    }
    setKelasInput(value);
    setAddClassSuccess(null);
  };

  const handleSaveNewClass = () => {
    const result = onAddCustomClass(newClassInput);
    if (!result.ok) {
      setAddClassError(result.error);
      return;
    }
    setKelasInput(result.value);
    setNewClassInput('');
    setAddClassError(null);
    setAddingClass(false);
    setAddClassSuccess(`"${result.value}" ditambahkan dan dipilih di daftar kelas.`);
  };

  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed.length < 2) {
      setNameError('Masukkan nama lengkap siswa sebelum memulai asesmen (minimal 2 huruf).');
      return;
    }
    setNameError(null);
    onUpdateProfile(trimmed, kelasInput);
    setAnswers({});
    setCurrentIdx(0);
    setElapsedSeconds(0);
    setConfirmOpen(false);
    setPhase('active');
  };

  const handleSelectOption = (questionId: string, key: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({ ...prev, [questionId]: key }));
  };

  const handleConfirmSubmit = () => {
    const attempt = gradeAssessment({
      id: `attempt-${Date.now()}`,
      studentName: nameInput.trim() || profile.name.trim(),
      kelas: kelasInput || profile.kelas,
      answers,
      durationSeconds: Math.max(1, elapsedSeconds),
    });
    setConfirmOpen(false);
    setPhase('briefing');
    onSubmitAttempt(attempt);
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = ASSESSMENT_QUESTIONS.length;
  const unansweredCount = totalCount - answeredCount;

  if (phase === 'briefing') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <p className="text-xs font-medium text-slate-500">
            04. Asesmen Formatif · SD N 2 Selokaton · Guru: Ihda Mar&apos;atus Sholihah
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Asesmen Keliling Bangun Datar
          </h1>
        </div>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs text-slate-500">Jumlah Soal</span>
              <p className="font-mono text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                10 Soal PG
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Kriteria Ketuntasan (KKM)</span>
              <p className="font-mono text-xl font-bold text-blue-700 tabular-nums mt-0.5">
                Nilai ≥ {KKM_SCORE}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Hadiah Kelulusan</span>
              <p className="font-mono text-xl font-bold text-amber-700 tabular-nums mt-0.5">
                +80 XP &amp; Lencana
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <h2 className="text-sm font-semibold text-slate-900">Petunjuk Pengerjaan</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>
                Soal mencakup keliling <strong>Segitiga</strong>, <strong>Persegi</strong>, dan{' '}
                <strong>Persegi Panjang</strong> termasuk soal cerita.
              </li>
              <li>
                Bacalah soal dan perhatikan ukuran pada gambar bangun datar dengan teliti.
              </li>
              <li>
                Kamu dapat berpindah antar nomor soal sebelum menekan tombol{' '}
                <strong>Kumpulkan Jawaban</strong>.
              </li>
            </ul>
          </div>

          <form onSubmit={handleStartExam} className="pt-4 border-t border-slate-200 space-y-4" noValidate>
            <h2 className="text-sm font-semibold text-slate-900">Konfirmasi Identitas Peserta</h2>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label
                  htmlFor="asesmen-name-input"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Nama Lengkap Siswa
                </label>
                <input
                  id="asesmen-name-input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  placeholder="Tulis nama lengkapmu"
                  aria-invalid={nameError ? 'true' : 'false'}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    nameError ? 'border-rose-500' : 'border-slate-300'
                  }`}
                />
              </div>

              <div className="sm:col-span-6">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="asesmen-class-select"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Kelas
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingClass((prev) => !prev);
                      setAddClassError(null);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{addingClass ? 'Tutup Form Kelas' : 'Tambah Kelas'}</span>
                  </button>
                </div>

                <select
                  id="asesmen-class-select"
                  value={kelasInput}
                  onChange={(e) => handleKelasSelectChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {classOptions.map((kls) => (
                    <option key={kls} value={kls}>
                      {kls}
                    </option>
                  ))}
                  <option value={ADD_NEW_CLASS_VALUE}>+ Tambah Kelas Baru...</option>
                </select>
              </div>
            </div>

            {/* Inline Add New Class Panel */}
            {addingClass && (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2.5">
                <label
                  htmlFor="asesmen-new-class-input"
                  className="block text-xs font-semibold text-slate-800"
                >
                  Tambah Item Kelas Baru (jika belum ada di daftar)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    id="asesmen-new-class-input"
                    type="text"
                    value={newClassInput}
                    onChange={(e) => {
                      setNewClassInput(e.target.value);
                      if (addClassError) setAddClassError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveNewClass();
                      }
                    }}
                    placeholder="Contoh: Kelas 4C atau 6A"
                    className="flex-1 min-w-[200px] px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNewClass}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Simpan Kelas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingClass(false);
                      setNewClassInput('');
                      setAddClassError(null);
                    }}
                    className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Batal
                  </button>
                </div>
                {addClassError && (
                  <p role="alert" className="text-xs font-semibold text-rose-700">
                    {addClassError}
                  </p>
                )}
              </div>
            )}

            {addClassSuccess && (
              <p
                role="status"
                className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>{addClassSuccess}</span>
              </p>
            )}

            {nameError && (
              <p
                role="alert"
                className="text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"
              >
                {nameError}
              </p>
            )}

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <FileCheck2 className="w-4 h-4" aria-hidden="true" />
              <span>Mulai Asesmen Sekarang</span>
            </button>
          </form>
        </section>
      </div>
    );
  }

  const question = ASSESSMENT_QUESTIONS[currentIdx];
  const selectedKey = answers[question.id];

  const diagDims: ShapeDimensions = {
    ...DEFAULT_DIMENSIONS,
    sisi: question.diagram?.sisi ?? 6,
    panjang: question.diagram?.panjang ?? 10,
    lebar: question.diagram?.lebar ?? 6,
    triangleKind: question.diagram?.triangleKind ?? 'sama-sisi',
    sisiA: question.diagram?.sisiA ?? 6,
    sisiB: question.diagram?.sisiB ?? 6,
    sisiC: question.diagram?.sisiC ?? 6,
  };

  return (
    <div className="space-y-6">
      {/* Active Exam Top Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-5 py-3.5">
        <div>
          <p className="text-xs text-slate-500">
            Peserta: <strong className="text-slate-900">{nameInput}</strong> ({kelasInput})
          </p>
          <h1 className="font-display text-lg font-bold text-slate-900 tabular-nums">
            Soal {question.number} dari {totalCount} · {SHAPE_CATALOG[question.shape].name}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm font-mono font-semibold text-slate-700 tabular-nums">
            <Clock className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>{formatDuration(elapsedSeconds)}</span>
          </div>
          <span className="text-xs font-mono text-slate-600 tabular-nums">
            Terjawab {answeredCount}/{totalCount}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Question Area */}
        <section className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="text-xs font-medium text-slate-500">
            Kategori: <span className="font-semibold text-slate-800">{question.category}</span> ·{' '}
            Topik: <span className="font-semibold text-slate-800">{SHAPE_CATALOG[question.shape].name}</span>
          </div>

          <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
            {question.prompt}
          </p>

          {question.diagram && (
            <ShapeDiagram
              shape={question.diagram.shape}
              dimensions={diagDims}
              unknownLabel={question.diagram.unknownLabel}
              compact
              ariaLabel={`Diagram soal asesmen nomor ${question.number}`}
            />
          )}

          {/* Answer Options A - D */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label={`Pilihan jawaban soal ${question.number}`}>
            {question.options.map((opt) => {
              const active = selectedKey === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handleSelectOption(question.id, opt.key)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    active
                      ? 'bg-blue-50 border-blue-600 text-blue-950 font-semibold'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 border ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="text-sm sm:text-base">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Prev / Next Navigation */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Sebelumnya</span>
            </button>

            {currentIdx < totalCount - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIdx((i) => Math.min(totalCount - 1, i + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <span>Soal Berikutnya</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Selesai &amp; Kumpulkan</span>
              </button>
            )}
          </div>
        </section>

        {/* Navigator & Inline Submit Confirm */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="font-display text-base font-bold text-slate-900">
              Navigasi Nomor Soal
            </h2>
            <div className="grid grid-cols-5 gap-2">
              {ASSESSMENT_QUESTIONS.map((q, idx) => {
                const answered = Boolean(answers[q.id]);
                const isCurrent = idx === currentIdx;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    aria-label={`Soal nomor ${q.number}, ${answered ? 'sudah dijawab' : 'belum dijawab'}`}
                    aria-current={isCurrent ? 'step' : undefined}
                    className={`h-10 rounded-lg border font-mono text-sm font-semibold flex items-center justify-center gap-0.5 transition-colors tabular-nums ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-600'
                        : answered
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{q.number}</span>
                    {answered && !isCurrent && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>Terjawab: {answeredCount}</span>
              <span>Belum: {unansweredCount}</span>
            </div>

            {!confirmOpen ? (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Selesai &amp; Kumpulkan</span>
              </button>
            ) : (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
                <div className="flex items-start gap-2 text-amber-950">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-semibold">Konfirmasi Pengumpulan</p>
                    <p className="mt-1">
                      {unansweredCount === 0
                        ? 'Semua 10 soal sudah terjawab. Siap melihat nilaimu?'
                        : `Masih ada ${unansweredCount} soal yang belum dijawab. Yakin ingin mengumpulkan sekarang?`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmSubmit}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                  >
                    Ya, Kumpulkan
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(false)}
                    className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

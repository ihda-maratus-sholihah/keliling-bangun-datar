import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Compass,
  Flag,
  GraduationCap,
  Plus,
  School,
  Sparkles,
  Target,
} from 'lucide-react';
import { AppState, ModuleId } from '../types';
import { AddClassResult } from '../utils/classes';
import { NAV_MODULES } from './TopNav';
import heroBangunDatarImg from '../assets/images/hero_bangun_datar_1795126080579.jpg';
import bendaSekitarGeometriImg from '../assets/images/benda_sekitar_geometri_1795126081583.jpg';

const HERO_IMAGE_PATH = heroBangunDatarImg;
const OBJECTS_IMAGE_PATH = bendaSekitarGeometriImg;
const ADD_NEW_CLASS_VALUE = '__add_new_class__';

interface PembukaViewProps {
  state: AppState;
  classOptions: string[];
  onAddCustomClass: (rawClassName: string) => AddClassResult;
  onSaveProfileAndStart: (name: string, kelas: string) => void;
  onSelectModule: (module: ModuleId) => void;
}

export const PembukaView: React.FC<PembukaViewProps> = ({
  state,
  classOptions,
  onAddCustomClass,
  onSaveProfileAndStart,
  onSelectModule,
}) => {
  const [nameInput, setNameInput] = useState(state.profile.name);
  const [kelasInput, setKelasInput] = useState(state.profile.kelas || classOptions[0] || 'Kelas 4A');
  const [formError, setFormError] = useState<string | null>(null);
  const [addingClass, setAddingClass] = useState(false);
  const [newClassInput, setNewClassInput] = useState('');
  const [addClassError, setAddClassError] = useState<string | null>(null);
  const [addClassSuccess, setAddClassSuccess] = useState<string | null>(null);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [objectsImgFailed, setObjectsImgFailed] = useState(false);

  useEffect(() => {
    if (state.profile.kelas) {
      setKelasInput(state.profile.kelas);
    }
  }, [state.profile.kelas]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed.length < 2) {
      setFormError('Yuk isi nama lengkapmu terlebih dahulu (minimal 2 huruf).');
      return;
    }
    setFormError(null);
    onSaveProfileAndStart(trimmed, kelasInput);
  };

  const correctPracticeCount = Object.values(state.practice.answeredIds).filter(
    (entry) => entry.correct
  ).length;
  const hasUserAttempt = state.attempts.some((a) => !a.isSample);

  const moduleStatuses: Record<ModuleId, { done: boolean; summary: string }> = {
    pembuka: {
      done: state.profile.name.trim().length > 0,
      summary: state.profile.name.trim()
        ? `Halo, ${state.profile.name}`
        : 'Isi identitas & kenal tujuan belajar',
    },
    materi: {
      done: state.learnedShapes.length === 3,
      summary: `${state.learnedShapes.length} dari 3 bangun dipelajari`,
    },
    latihan: {
      done:
        correctPracticeCount >= 4 ||
        state.practice.completedMissionIds.length >= 3 ||
        state.practice.speedBestScore >= 50 ||
        state.practice.adventureBestLevel >= 2 ||
        state.practice.solvedDetectiveIds.length >= 4 ||
        state.practice.memoryGamesWon >= 1,
      summary: `${correctPracticeCount}/6 soal · 5 mini-game seru`,
    },
    asesmen: {
      done: hasUserAttempt,
      summary: hasUserAttempt ? 'Asesmen sudah dikerjakan' : '10 soal evaluasi · KKM 75',
    },
    hasil: {
      done: hasUserAttempt,
      summary: hasUserAttempt ? 'Lihat nilai & pembahasan' : 'Menunggu hasil asesmen',
    },
    rekap: {
      done: hasUserAttempt,
      summary: `${state.attempts.length} data rekap kelas`,
    },
  };

  return (
    <div className="space-y-10">
      {/* Hero Two-Column Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Clean unboxed metadata kicker (Zero-Pill Discipline) */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5 text-blue-700 font-semibold">
                <School className="w-4 h-4" aria-hidden="true" />
                SD N 2 SELOKATON
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <GraduationCap className="w-4 h-4 text-slate-500" aria-hidden="true" />
                Guru: Ihda Mar&apos;atus Sholihah
              </span>
              <span aria-hidden="true">·</span>
              <span>Matematika SD</span>
            </div>

            <h1 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.15] [text-wrap:balance]">
              Petualangan Keliling Bangun Datar
            </h1>

            <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-2xl">
              Belajar menghitung keliling <strong className="text-slate-900">Segitiga</strong>,{' '}
              <strong className="text-slate-900">Persegi</strong>, dan{' '}
              <strong className="text-slate-900">Persegi Panjang</strong> lewat papan petak
              interaktif, animasi pengukur keliling, 5 mini-game seru, dan koleksi bintang!
            </p>
          </div>

          {/* Student Identity Form */}
          <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t border-slate-200 space-y-4" noValidate>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                01. Daftar Identitas Petualang
              </h2>
              <span className="text-xs text-amber-700 font-medium">
                +20 XP &amp; Lencana Langkah Pertama
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7">
                <label
                  htmlFor="student-name-input"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Nama Lengkap Siswa
                </label>
                <input
                  id="student-name-input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="Contoh: Alya Rahma"
                  aria-invalid={formError ? 'true' : 'false'}
                  aria-describedby={formError ? 'name-error-msg' : undefined}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    formError ? 'border-rose-500' : 'border-slate-300'
                  }`}
                />
              </div>

              <div className="sm:col-span-5">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label
                    htmlFor="student-class-select"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Pilih Kelas
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
                    <span>{addingClass ? 'Tutup' : 'Tambah Kelas'}</span>
                  </button>
                </div>
                <select
                  id="student-class-select"
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
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2.5">
                <label
                  htmlFor="pembuka-new-class-input"
                  className="block text-xs font-semibold text-slate-800"
                >
                  Tambah Item Kelas Baru (jika belum ada di daftar)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    id="pembuka-new-class-input"
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
                    className="flex-1 min-w-[180px] px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNewClass}
                    className="px-3.5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
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
                    className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-colors whitespace-nowrap"
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

            {formError && (
              <p
                id="name-error-msg"
                role="alert"
                className="text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"
              >
                {formError}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <span>Mulai Petualangan ke Materi</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onSelectModule('latihan')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <span>Coba Misi Latihan</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Hero Visual Showcase */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
          <div className="relative flex-1 min-h-[260px] bg-slate-100">
            {!heroImgFailed ? (
              <img
                src={HERO_IMAGE_PATH}
                alt="Peraga kayu bangun datar segitiga, persegi, dan persegi panjang di atas kertas berpetak bersama penggaris kayu"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full lg:h-full object-cover block"
              />
            ) : (
              <div className="w-full h-full min-h-[260px] math-grid-bg flex flex-col items-center justify-center p-6 text-center">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 border-2 border-blue-600" />
                  <div className="w-16 h-11 rounded-lg bg-emerald-100 border-2 border-emerald-600" />
                  <div className="w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[42px] border-b-orange-500" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Peraga Keliling Bangun Datar
                </p>
              </div>
            )}
          </div>
          <div className="px-5 py-4 border-t border-slate-200 bg-white">
            <p className="text-xs font-semibold text-slate-900">
              Materi Fokus Hari Ini
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Segitiga (K = a + b + c) · Persegi (K = 4 × s) · Persegi Panjang (K = 2 × (p + l))
            </p>
          </div>
        </div>
      </section>

      {/* 6-Step Adventure Roadmap */}
      <section aria-labelledby="roadmap-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="roadmap-heading"
              className="font-display text-2xl font-bold text-slate-900"
            >
              Peta 6 Tahap Pembelajaran
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Ikuti urutan tahap dari 01 hingga 06 atau klik tahap mana saja untuk langsung belajar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_MODULES.map((mod) => {
            const st = moduleStatuses[mod.id];
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => onSelectModule(mod.id)}
                className="group text-left bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums">
                    Tahap {mod.code}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium ${
                      st.done ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {st.done ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Selesai
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5" aria-hidden="true" />
                        Siap Dijalankan
                      </>
                    )}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {mod.code} {mod.label}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{st.summary}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Learning Objectives & Real World Context */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7">
          <div className="flex items-center gap-2 text-blue-700">
            <Target className="w-5 h-5" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold text-slate-900">
              Tujuan Pembelajaran
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Disusun khusus untuk siswa SD N 2 Selokaton bersama Ibu Ihda Mar&apos;atus Sholihah.
          </p>

          <ol className="mt-5 space-y-4">
            <li className="flex items-start gap-3">
              <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-1 shrink-0 mt-0.5 tabular-nums">
                01
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Memahami Makna Keliling Bangun Datar
                </h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  Mengamati langsung bahwa keliling adalah jumlah panjang seluruh sisi terluar suatu
                  bangun datar.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1 shrink-0 mt-0.5 tabular-nums">
                02
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Menghitung Keliling Segitiga, Persegi, dan Persegi Panjang
                </h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  Menggunakan rumus dengan tepat serta menemukan panjang sisi jika keliling sudah
                  diketahui.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-md px-2 py-1 shrink-0 mt-0.5 tabular-nums">
                03
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Menyelesaikan Soal Cerita Sehari-hari
                </h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  Menghitung panjang pagar kebun, pita bingkai foto, hingga jarak lari mengelilingi
                  lapangan sekolah.
                </p>
              </div>
            </li>
          </ol>

          <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center gap-6 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" aria-hidden="true" />
              3 Bangun Interaktif
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              5 Mini-Game Seru
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Flag className="w-4 h-4 text-orange-600" aria-hidden="true" />
              10 Soal Asesmen KKM 75
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" aria-hidden="true" />
              11 Lencana Prestasi
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
          <div className="relative flex-1 min-h-[200px] bg-slate-100">
            {!objectsImgFailed ? (
              <img
                src={OBJECTS_IMAGE_PATH}
                alt="Contoh benda sehari-hari berbentuk bangun datar: ubin persegi, penggaris segitiga, dan buku tulis persegi panjang"
                referrerPolicy="no-referrer"
                onError={() => setObjectsImgFailed(true)}
                className="w-full h-full object-cover block"
              />
            ) : (
              <div className="w-full h-full min-h-[200px] math-grid-bg flex items-center justify-center p-6 text-sm font-medium text-slate-600">
                Benda Berbentuk Bangun Datar di Sekitar Kelas
              </div>
            )}
          </div>
          <div className="p-5 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">
              Bangun Datar Ada di Sekitar Kita
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Perhatikan ubin kelas (persegi), penggaris segitiga, dan buku tulismu (persegi
              panjang). Semuanya memiliki tepi luar yang bisa diukur kelilingnya!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

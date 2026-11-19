import React, { useState } from 'react';
import { Award, Star, Volume2, VolumeX, ChevronDown, ChevronUp, CheckCircle2, Lock } from 'lucide-react';
import { BadgeId, LevelInfo, StudentProfile } from '../types';
import { BADGE_DEFINITIONS } from '../utils/gamification';

interface GamificationBarProps {
  profile: StudentProfile;
  xp: number;
  stars: number;
  levelInfo: LevelInfo;
  unlockedBadges: BadgeId[];
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const GamificationBar: React.FC<GamificationBarProps> = ({
  profile,
  xp,
  stars,
  levelInfo,
  unlockedBadges,
  soundEnabled,
  onToggleSound,
}) => {
  const [badgesOpen, setBadgesOpen] = useState(false);

  return (
    <section
      aria-label="Papan Petualang Gamifikasi"
      className="no-print bg-white border border-slate-200 rounded-xl px-4 py-3 mb-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Student identity + Level & XP bar */}
        <div className="flex flex-wrap items-center gap-4 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                {profile.name.trim() ? profile.name : 'Siswa SD N 2 Selokaton'}
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="text-slate-600 whitespace-nowrap">{profile.kelas}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="font-semibold text-blue-700">
                Level {levelInfo.level}: {levelInfo.title}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {xp} XP {levelInfo.nextXp ? `/ ${levelInfo.nextXp} XP` : '(Maksimal)'}
              </span>
            </div>
          </div>

          <div
            className="w-36 sm:w-44 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200"
            role="progressbar"
            aria-label="Progres Level XP"
            aria-valuenow={levelInfo.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-blue-600 transition-transform duration-300 origin-left"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stars, Badges toggle, Sound toggle */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 tabular-nums">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" aria-hidden="true" />
            <span>{stars} Bintang</span>
          </div>

          <button
            type="button"
            onClick={() => setBadgesOpen((prev) => !prev)}
            aria-expanded={badgesOpen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Award className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span className="tabular-nums">
              Lencana {unlockedBadges.length}/{BADGE_DEFINITIONS.length}
            </span>
            {badgesOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Matikan efek suara' : 'Aktifkan efek suara'}
            title={soundEnabled ? 'Suara Aktif' : 'Suara Nonaktif'}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-blue-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Badges Showcase */}
      {badgesOpen && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Koleksi Lencana Petualang Keliling
            </h2>
            <span className="text-xs text-slate-500">
              Selesaikan materi, latihan, dan asesmen untuk membuka semua lencana.
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BADGE_DEFINITIONS.map((badge) => {
              const isUnlocked = unlockedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`rounded-lg border p-3 transition-colors ${
                    isUnlocked
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-slate-50/70 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {badge.title}
                    </span>
                    {isUnlocked ? (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                        aria-label="Terbuka"
                      />
                    ) : (
                      <Lock
                        className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"
                        aria-label="Terkunci"
                      />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                  <p className="text-xs font-mono font-medium text-amber-700 mt-2 tabular-nums">
                    +{badge.xpBonus} XP {isUnlocked ? '· Diraih' : '· Belum terbuka'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

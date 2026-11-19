import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { ModuleId } from '../types';

export interface NavModuleItem {
  id: ModuleId;
  code: string;
  label: string;
}

export const NAV_MODULES: NavModuleItem[] = [
  { id: 'pembuka', code: '01', label: 'Pembuka' },
  { id: 'materi', code: '02', label: 'Materi' },
  { id: 'latihan', code: '03', label: 'Latihan' },
  { id: 'asesmen', code: '04', label: 'Asesmen' },
  { id: 'hasil', code: '05', label: 'Hasil' },
  { id: 'rekap', code: '06', label: 'Rekap' },
];

interface TopNavProps {
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  onPrimaryAction: () => void;
  primaryActionLabel: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeModule,
  onSelectModule,
  onPrimaryAction,
  primaryActionLabel,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: ModuleId) => {
    onSelectModule(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element brand wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('pembuka')}
          className="font-display text-lg font-extrabold tracking-tight text-slate-900 hover:text-blue-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          Keliling Ceria
        </button>

        {/* Zone 2: Clean single-line text module links */}
        <nav
          aria-label="Navigasi Modul Pembelajaran"
          className="hidden lg:flex items-center gap-6"
        >
          {NAV_MODULES.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded ${
                  isActive
                    ? 'text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="font-mono text-xs text-slate-400 mr-1.5 tabular-nums">
                  {item.code}
                </span>{' '}
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-blue-600"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action button (+ mobile menu toggle on small screens) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <span>{primaryActionLabel}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Navigasi Modul Seluler"
          className="lg:hidden bg-white border-t border-slate-200 px-4 py-3"
        >
          <div className="grid grid-cols-2 gap-2">
            {NAV_MODULES.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span className="font-mono text-xs text-slate-400 tabular-nums">
                    {item.code}
                  </span>{' '}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onPrimaryAction();
            }}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            <span>{primaryActionLabel}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </nav>
      )}
    </header>
  );
};

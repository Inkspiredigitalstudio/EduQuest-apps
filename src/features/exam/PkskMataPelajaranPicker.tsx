import React from 'react';
import { Subject } from '../../types';
import { soundManager } from '../../lib/audio';
import { ArrowLeft, Lock, ArrowRight } from 'lucide-react';

interface PkskMataPelajaranPickerProps {
  kategoriPelajar: 'Tahun 6' | 'Tingkatan 3';
  subjects: Subject[];
  // Whether each subject actually has a paper for the chosen kategori
  // (App.tsx already filters pkskPapersForKategori before computing this).
  readySubjectIds: Set<string>;
  onPickSubject: (subject: Subject) => void;
  onBack: () => void;
}

// Mod Latihan step 2 (Bahagian B only) — subject selection skips straight to
// PkskPracticeSetup once picked (no intermediate paper/section drill-down;
// each Bahagian B subject has exactly one paper/section per kategori).
export const PkskMataPelajaranPicker: React.FC<PkskMataPelajaranPickerProps> = ({
  kategoriPelajar,
  subjects,
  readySubjectIds,
  onPickSubject,
  onBack,
}) => {
  return (
    <div className="max-w-xl mx-auto space-y-4 pb-12">
      <button
        onClick={() => {
          soundManager.playClick();
          onBack();
        }}
        className="flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-ink-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali</span>
      </button>
      <div className="text-center space-y-2">
        <h1 className="text-xl font-display font-bold text-ink-900">Bahagian B — {kategoriPelajar}</h1>
        <p className="text-sm text-ink-500">Pilih Mata Pelajaran</p>
      </div>
      <div className="flex flex-col gap-2.5 max-w-lg mx-auto">
        {subjects.map((sub) => {
          const isReady = readySubjectIds.has(sub.id);
          return (
            <button
              key={sub.id}
              disabled={!isReady}
              onClick={() => {
                if (!isReady) return;
                soundManager.playClick();
                onPickSubject(sub);
              }}
              className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border-2 font-bold transition-colors text-left ${
                isReady
                  ? 'bg-mist-100 hover:bg-mist-200/70 border-mist-200 hover:border-mist-300 cursor-pointer'
                  : 'bg-cream-100 border-sand-200 opacity-60 cursor-not-allowed'
              }`}
            >
              <span className="text-base text-ink-900">{sub.name}</span>
              {isReady ? (
                <ArrowRight className="w-4 h-4 text-mist-600 shrink-0" />
              ) : (
                <span className="text-[10px] font-bold uppercase bg-cream-200 text-ink-500 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                  <Lock className="w-3 h-3" />
                  Belum sedia
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

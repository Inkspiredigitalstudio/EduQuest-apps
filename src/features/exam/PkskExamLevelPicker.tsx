import React from 'react';
import { soundManager } from '../../lib/audio';
import { PkskExamTingkatan, PkskExamAras } from '../../lib/supabase';
import { ArrowLeft, GraduationCap, Lock } from 'lucide-react';

interface PkskExamLevelPickerProps {
  // Kategori Pelajar (Tahun 6 / Tingkatan 3) is now picked once, shared by
  // both Mod Latihan and Mod Peperiksaan — this screen no longer asks for
  // it again, just Tahap Kesukaran for that fixed tingkatan.
  fixedTingkatan: PkskExamTingkatan;
  readyByAras: Record<PkskExamAras, boolean>;
  onPick: (aras: PkskExamAras) => void;
  onBack: () => void;
}

const ARAS_LIST: PkskExamAras[] = ['Mudah', 'Sederhana', 'Tinggi'];

// Each tingkatan+aras combination is its own pksk_paper with entirely
// different questions — see getPkskExamSetQuestions() in src/lib/supabase.ts.
export const PkskExamLevelPicker: React.FC<PkskExamLevelPickerProps> = ({ fixedTingkatan, readyByAras, onPick, onBack }) => {
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
        <h1 className="text-xl font-display font-bold text-ink-900">Mod Peperiksaan — {fixedTingkatan}</h1>
        <p className="text-sm text-ink-500">Pilih Tahap Kesukaran</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ARAS_LIST.map((aras) => {
          const isReady = readyByAras[aras];
          return (
            <button
              key={aras}
              disabled={!isReady}
              onClick={() => {
                if (!isReady) return;
                soundManager.playClick();
                onPick(aras);
              }}
              className={`rounded-3xl p-6 text-center space-y-2 border transition-colors ${
                isReady
                  ? 'bg-cream-50 hover:bg-grape-100 border-sand-200 hover:border-grape-300'
                  : 'bg-cream-100 border-sand-200 opacity-60 cursor-not-allowed'
              }`}
            >
              {isReady ? (
                <GraduationCap className="w-8 h-8 text-grape-600 mx-auto" />
              ) : (
                <Lock className="w-8 h-8 text-ink-300 mx-auto" />
              )}
              <h3 className="text-lg font-display font-bold text-ink-900">{aras}</h3>
              <p className="text-xs text-ink-500">{isReady ? '100 soalan • 90 minit' : 'Set belum sedia'}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

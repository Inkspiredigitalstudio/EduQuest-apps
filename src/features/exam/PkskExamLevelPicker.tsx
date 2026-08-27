import React from 'react';
import { soundManager } from '../../lib/audio';
import { PkskExamTingkatan } from '../../lib/supabase';
import { ArrowLeft, GraduationCap, Lock } from 'lucide-react';

interface PkskExamLevelPickerProps {
  readyLevels: Record<PkskExamTingkatan, boolean>;
  onPickLevel: (level: PkskExamTingkatan) => void;
  onBack: () => void;
}

const LEVELS: PkskExamTingkatan[] = ['Tahun 6', 'Tingkatan 3'];

// Mirrors ArticulationScreen's pilih_level step (same card pattern/copy) so
// students see one consistent "pick your level" UX across PKSK Track A & B.
// Each tingkatan is its own pksk_paper with entirely different questions —
// see getPkskExamSetQuestions() in src/lib/supabase.ts.
export const PkskExamLevelPicker: React.FC<PkskExamLevelPickerProps> = ({ readyLevels, onPickLevel, onBack }) => {
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
        <h1 className="text-xl font-display font-bold text-ink-900">Exam PKSK — Bahagian A & B</h1>
        <p className="text-sm text-ink-500">Pilih tahap anda</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LEVELS.map((lvl) => {
          const isReady = readyLevels[lvl];
          return (
            <button
              key={lvl}
              disabled={!isReady}
              onClick={() => {
                if (!isReady) return;
                soundManager.playClick();
                onPickLevel(lvl);
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
              <h3 className="text-lg font-display font-bold text-ink-900">{lvl}</h3>
              <p className="text-xs text-ink-500">{isReady ? '100 soalan • 90 minit' : 'Set belum sedia'}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

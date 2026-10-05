import React from 'react';
import { soundManager } from '../../lib/audio';
import { ArrowLeft, Dumbbell, Target, Lock } from 'lucide-react';

interface PkskModPickerProps {
  kategoriPelajar: 'Tahun 6' | 'Tingkatan 3';
  examModeReady: boolean;
  onPickLatihan: () => void;
  onPickPeperiksaan: () => void;
  onBack: () => void;
}

// PKSK root flow (v3): Pilih Kategori Pelajar (already chosen, shown as
// context here) -> Pilih Mod -> [Mod Latihan | Mod Peperiksaan]. Each mode
// then drills into its own dedicated screens (PkskBahagianPicker /
// PkskExamLevelPicker).
export const PkskModPicker: React.FC<PkskModPickerProps> = ({ kategoriPelajar, examModeReady, onPickLatihan, onPickPeperiksaan, onBack }) => {
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
        <h1 className="text-xl font-display font-bold text-ink-900">PKSK — {kategoriPelajar}</h1>
        <p className="text-sm text-ink-500">Pilih Mod</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => {
            soundManager.playClick();
            onPickLatihan();
          }}
          className="rounded-3xl p-6 text-center space-y-2 border bg-cream-50 hover:bg-mist-100 border-sand-200 hover:border-mist-300 transition-colors"
        >
          <Dumbbell className="w-8 h-8 text-mist-600 mx-auto" />
          <h3 className="text-lg font-display font-bold text-ink-900">Mod Latihan</h3>
          <p className="text-xs text-ink-500">Pilih bahagian, mata pelajaran dan aras kesukaran anda sendiri.</p>
        </button>
        <button
          disabled={!examModeReady}
          onClick={() => {
            if (!examModeReady) return;
            soundManager.playClick();
            onPickPeperiksaan();
          }}
          className={`rounded-3xl p-6 text-center space-y-2 border transition-colors ${
            examModeReady
              ? 'bg-cream-50 hover:bg-grape-100 border-sand-200 hover:border-grape-300'
              : 'bg-cream-100 border-sand-200 opacity-60 cursor-not-allowed'
          }`}
        >
          {examModeReady ? <Target className="w-8 h-8 text-grape-600 mx-auto" /> : <Lock className="w-8 h-8 text-ink-300 mx-auto" />}
          <h3 className="text-lg font-display font-bold text-ink-900">Mod Peperiksaan</h3>
          <p className="text-xs text-ink-500">{examModeReady ? '100 soalan bercampur • 90 minit.' : 'Set belum sedia'}</p>
        </button>
      </div>
    </div>
  );
};

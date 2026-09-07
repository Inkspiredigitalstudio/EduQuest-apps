import React from 'react';
import { soundManager } from '../../lib/audio';
import { ArrowLeft, Brain, BookOpen, PenSquare } from 'lucide-react';

interface PkskBahagianPickerProps {
  kategoriPelajar: 'Tahun 6' | 'Tingkatan 3';
  onPickBahagian: (bahagian: 'A' | 'B' | 'C') => void;
  onBack: () => void;
}

// Mod Latihan step 1: Pilih Bahagian. Bahagian A skips straight to Soalan
// General (no Mata Pelajaran step — see PkskBahagianAGeneral handling in
// App.tsx), Bahagian B goes to PkskMataPelajaranPicker, Bahagian C routes to
// the existing Artikulasi Karangan screen.
export const PkskBahagianPicker: React.FC<PkskBahagianPickerProps> = ({ kategoriPelajar, onPickBahagian, onBack }) => {
  const cards: { key: 'A' | 'B' | 'C'; title: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'A', title: 'Bahagian A', desc: 'Keperibadian Insaniah & Psikometrik — soalan general.', icon: Brain },
    { key: 'B', title: 'Bahagian B', desc: 'Bahasa Melayu, Bahasa Inggeris, Matematik, Sains dan lain-lain.', icon: BookOpen },
    { key: 'C', title: 'Bahagian C', desc: 'Artikulasi Karangan — bertulis.', icon: PenSquare },
  ];

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
        <h1 className="text-xl font-display font-bold text-ink-900">Mod Latihan — {kategoriPelajar}</h1>
        <p className="text-sm text-ink-500">Pilih Bahagian</p>
      </div>
      <div className="flex flex-col gap-2.5 max-w-lg mx-auto">
        {cards.map(({ key, title, desc, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              soundManager.playClick();
              onPickBahagian(key);
            }}
            className="w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl border-2 bg-mist-100 hover:bg-mist-200/70 border-mist-200 hover:border-mist-300 transition-colors text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-cream-50 text-mist-600 shadow-sm flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-base text-ink-900">{title}</div>
              <div className="text-xs text-ink-500">{desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

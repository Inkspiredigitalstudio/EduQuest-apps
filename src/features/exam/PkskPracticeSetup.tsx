import React, { useState } from 'react';
import { Question } from '../../types';
import { soundManager } from '../../lib/audio';
import { ArrowLeft, Gauge, Lock, Timer, Play } from 'lucide-react';

interface PkskPracticeSetupProps {
  sectionName: string;
  questions: Question[];
  onStart: (aras: 1 | 2 | 3, panjang: 15 | 25 | 50, timerOn: boolean) => void;
  onBack: () => void;
}

const ARAS_LABELS: { value: 1 | 2 | 3; label: string }[] = [
  { value: 1, label: 'Mudah' },
  { value: 2, label: 'Sederhana' },
  { value: 3, label: 'Sukar' },
];

const PANJANG_OPTIONS: { value: 15 | 25 | 50; label: string }[] = [
  { value: 15, label: 'Warm Up' },
  { value: 25, label: 'Sprint' },
  { value: 50, label: 'Marathon' },
];

// Practice flow per PKSK v2 restructure doc #1/#4: Subjek (already picked,
// this screen starts right after) -> Aras Kesukaran (wajib) -> Panjang Sesi
// -> toggle Timer -> Mula. Session length is capped to however many
// questions actually exist at the chosen aras — a thin bank still starts a
// (shorter) session rather than blocking the student outright.
export const PkskPracticeSetup: React.FC<PkskPracticeSetupProps> = ({ sectionName, questions, onStart, onBack }) => {
  const [step, setStep] = useState<'aras' | 'panjang'>('aras');
  const [aras, setAras] = useState<1 | 2 | 3 | null>(null);
  const [panjang, setPanjang] = useState<15 | 25 | 50 | null>(null);
  const [timerOn, setTimerOn] = useState(true);

  const countForAras = (a: 1 | 2 | 3) => questions.filter((q) => q.aras_kesukaran === a).length;
  const availableAtChosenAras = aras !== null ? countForAras(aras) : 0;

  const handlePickAras = (a: 1 | 2 | 3) => {
    if (countForAras(a) === 0) return;
    soundManager.playClick();
    setAras(a);
    setPanjang(null);
    setStep('panjang');
  };

  const handleMula = () => {
    if (aras === null || panjang === null) return;
    soundManager.playClick();
    onStart(aras, panjang, timerOn);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-12">
      <button
        onClick={() => {
          soundManager.playClick();
          if (step === 'panjang') {
            setStep('aras');
            return;
          }
          onBack();
        }}
        className="flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-ink-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali</span>
      </button>

      <div className="text-center space-y-1">
        <h1 className="text-xl font-display font-bold text-ink-900">{sectionName}</h1>
        <p className="text-sm text-ink-500">{step === 'aras' ? 'Pilih aras kesukaran' : 'Pilih panjang sesi'}</p>
      </div>

      {step === 'aras' && (
        <div className="flex flex-col gap-2.5 max-w-lg mx-auto">
          {ARAS_LABELS.map(({ value, label }) => {
            const count = countForAras(value);
            const isReady = count > 0;
            return (
              <button
                key={value}
                disabled={!isReady}
                onClick={() => handlePickAras(value)}
                className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border-2 font-bold text-left transition-colors ${
                  isReady
                    ? 'bg-mist-100 hover:bg-mist-200/70 border-mist-200 hover:border-mist-300 cursor-pointer'
                    : 'bg-cream-100 border-sand-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {isReady ? <Gauge className="w-5 h-5 text-mist-600" /> : <Lock className="w-5 h-5 text-ink-300" />}
                  <span className="text-base text-ink-900">{label}</span>
                </span>
                <span className="text-[11px] text-ink-500 font-bold shrink-0">
                  {isReady ? `${count} soalan` : 'Belum ada soalan'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {step === 'panjang' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2.5 max-w-lg mx-auto">
            {PANJANG_OPTIONS.map(({ value, label }) => {
              const isSelected = panjang === value;
              const actualCount = Math.min(value, availableAtChosenAras);
              return (
                <button
                  key={value}
                  onClick={() => {
                    soundManager.playClick();
                    setPanjang(value);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border-2 font-bold text-left transition-colors ${
                    isSelected
                      ? 'bg-mist-500 border-mist-500 text-white'
                      : 'bg-cream-50 hover:bg-mist-100 border-sand-200 hover:border-mist-300 text-ink-900'
                  }`}
                >
                  <span className="text-base">{label}</span>
                  <span className={`text-[11px] font-bold shrink-0 ${isSelected ? 'text-white/90' : 'text-ink-500'}`}>
                    {actualCount} soalan
                  </span>
                </button>
              );
            })}
          </div>

          {panjang !== null && (
            <div className="bg-cream-50 border border-sand-200 rounded-2xl p-4 space-y-4">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setTimerOn((t) => !t);
                }}
                className="w-full flex items-center justify-between gap-3"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-ink-900">
                  <Timer className="w-4 h-4 text-mist-600" />
                  <span>Timer</span>
                </span>
                <span
                  className={`w-11 h-6 rounded-full relative transition-colors ${timerOn ? 'bg-mist-500' : 'bg-cream-200'}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${timerOn ? 'left-[22px]' : 'left-0.5'}`}
                  />
                </span>
              </button>

              <button
                onClick={handleMula}
                className="w-full py-4 px-6 bg-mist-500 hover:bg-mist-600 text-white font-bold text-base rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Mula</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

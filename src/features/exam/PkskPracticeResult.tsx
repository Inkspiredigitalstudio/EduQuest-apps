import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../lib/audio';
import { getPkskTier } from '../../lib/pkskTier';
import { Trophy, Home, ArrowRight, Medal } from 'lucide-react';

interface PkskPracticeResultProps {
  percent: number;
  sectionName: string;
  totalAnswered: number;
  totalQuestions: number;
  wasPartial: boolean;
  onContinue: () => void;
  onGoDashboard: () => void;
}

// Result screen for a single Practice Mode session (Warm Up/Sprint/Marathon)
// — deliberately separate from SPPIM's ResultScreen.tsx (MUMTAZ/JAYYID
// Arabic grading doesn't fit PKSK's Sporty Gold/Silver/Bronze framing) and
// from PkskExamResult.tsx (that one blends Bahagian A+B, this one is a
// single section). Per doc #4: don't return to the main menu after a
// block — offer to continue instead.
export const PkskPracticeResult: React.FC<PkskPracticeResultProps> = ({
  percent,
  sectionName,
  totalAnswered,
  totalQuestions,
  wasPartial,
  onContinue,
  onGoDashboard,
}) => {
  const tier = getPkskTier(percent);

  useEffect(() => {
    soundManager.playLevelUp();
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4A857', '#799C61', '#5D8CBB', '#AC6650', '#93B67C', '#E2C384'],
      });
    } catch {
      // confetti is a cosmetic best-effort — never block the result screen on it
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      <div className="bg-cream-50 border border-sand-200 rounded-3xl p-8 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-honey-100 flex items-center justify-center text-honey-500">
          <Trophy className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-ink-900">{sectionName} Selesai!</h1>
          <p className="text-xs sm:text-sm text-ink-500">
            {wasPartial
              ? `${totalAnswered} / ${totalQuestions} soalan dijawab sebelum keluar — progress tetap disimpan.`
              : `${totalQuestions} soalan telah dijawab.`}
          </p>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${tier.colorClass}`}>
          <span className="text-lg" aria-hidden="true">{tier.medal}</span>
          <span>{tier.label}</span>
          <Medal className="w-4 h-4" />
        </div>
        <div className="text-3xl font-display font-bold text-ink-900">{percent}%</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => {
            soundManager.playClick();
            onContinue();
          }}
          className="w-full py-4 px-6 bg-mist-500 hover:bg-mist-600 text-white font-bold text-base rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          <span>Sambung Sesi Lain</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            onGoDashboard();
          }}
          className="w-full py-4 px-6 bg-cream-100 hover:bg-cream-200 text-ink-700 border border-sand-200 font-bold text-base rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          <span>Kembali ke Dashboard</span>
        </button>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../lib/audio';
import { getPkskTier } from '../../lib/pkskTier';
import { Trophy, Home, Sparkles, Medal } from 'lucide-react';

interface PkskExamResultProps {
  markahA: number | null;
  markahB: number | null;
  totalQuestions: number;
  onGoDashboard: () => void;
}

// Result screen for PKSK's mixed 100-question Exam Mode (doc:
// PKSK_Structural_Revision.md #2/#5) — deliberately separate from the shared
// ResultScreen.tsx, which assumes one attempt = one section (next-section
// button, single paper/subject) and doesn't fit a Bahagian A+B mixed sitting.
export const PkskExamResult: React.FC<PkskExamResultProps> = ({ markahA, markahB, totalQuestions, onGoDashboard }) => {
  // Bahagian C (Artikulasi) isn't part of this 90-minute A+B sitting, so the
  // tier uses only A/B's relative weight (20/70 of the confirmed 20/70/10
  // split), normalized back to 100 — not the full jumlah_markah formula.
  const overall = markahA !== null && markahB !== null ? Math.round((markahA * 0.2 + markahB * 0.7) / 0.9) : null;
  const tier = overall !== null ? getPkskTier(overall) : null;

  useEffect(() => {
    soundManager.playLevelUp();
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4A857', '#799C61', '#5D8CBB', '#AC6650', '#93B67C', '#E2C384'],
      });
    } catch {
      // confetti is a cosmetic best-effort — never block the result screen on it
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="bg-cream-50 border border-sand-200 rounded-3xl p-8 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-honey-100 flex items-center justify-center text-honey-500">
          <Trophy className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-ink-900">Exam PKSK Selesai!</h1>
          <p className="text-xs sm:text-sm text-ink-500">{totalQuestions} soalan telah dijawab — Bahagian A & B.</p>
        </div>
        {tier && (
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${tier.colorClass}`}>
            <span className="text-lg" aria-hidden="true">{tier.medal}</span>
            <span>{tier.label}</span>
            <Medal className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-cream-50 border border-sand-200 rounded-3xl p-6 space-y-2 text-center">
          <div className="text-xs font-bold uppercase tracking-wide text-mist-600">Bahagian A</div>
          <div className="text-[11px] text-ink-500">Kecerdasan Insaniah + Psikometrik (20%)</div>
          <div className="text-3xl font-display font-bold text-ink-900">
            {markahA !== null ? `${markahA}%` : '—'}
          </div>
        </div>
        <div className="bg-cream-50 border border-sand-200 rounded-3xl p-6 space-y-2 text-center">
          <div className="text-xs font-bold uppercase tracking-wide text-mist-600">Bahagian B</div>
          <div className="text-[11px] text-ink-500">Kecerdasan Intelek & Pengetahuan Am (70%)</div>
          <div className="text-3xl font-display font-bold text-ink-900">
            {markahB !== null ? `${markahB}%` : '—'}
          </div>
        </div>
      </div>

      <div className="bg-mist-100 border border-mist-200 rounded-2xl p-4 text-xs text-ink-700 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-mist-600 shrink-0" />
        <span>Markah keseluruhan PKSK (Bahagian A+B+C) akan dikira sebaik Bahagian C — Artikulasi Karangan — turut disiapkan.</span>
      </div>

      <button
        onClick={() => {
          soundManager.playClick();
          onGoDashboard();
        }}
        className="w-full py-4 px-6 bg-mist-500 hover:bg-mist-600 text-white font-bold text-base rounded-2xl transition-colors flex items-center justify-center gap-2"
      >
        <Home className="w-5 h-5" />
        <span>Kembali ke Dashboard</span>
      </button>
    </div>
  );
};

import React from 'react';
import { ArticulationMode, EssayAiFeedback, EssayFeedbackRound } from '../../types';
import { soundManager } from '../../lib/audio';
import { Star, Wrench, Lightbulb, RotateCcw, CheckCircle2, Trophy, TrendingUp } from 'lucide-react';

interface FeedbackPanelProps {
  mode: ArticulationMode;
  latestFeedback: EssayAiFeedback;
  rounds: EssayFeedbackRound[];
  isLocked: boolean;
  onImprove: () => void;
  onFinalize: () => void;
  onGoDashboard: () => void;
}

function roundScores(rounds: EssayFeedbackRound[]): number[] {
  return rounds
    .map((r) => {
      try {
        return (JSON.parse(r.maklum_balas_ai) as EssayAiFeedback).score;
      } catch {
        return null;
      }
    })
    .filter((s): s is number => typeof s === 'number');
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  mode,
  latestFeedback,
  rounds,
  isLocked,
  onImprove,
  onFinalize,
  onGoDashboard,
}) => {
  const scores = roundScores(rounds);
  const improvement = scores.length >= 2 ? scores[scores.length - 1] - scores[0] : null;

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-12">
      <div className="bg-cream-50 border border-sand-200 rounded-3xl p-6 text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-sage-100 flex items-center justify-center text-sage-600">
          {isLocked ? <Trophy className="w-7 h-7" /> : <CheckCircle2 className="w-7 h-7" />}
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
            {mode === 'exam' ? 'AI Writing Score (Exam)' : 'AI Writing Score — Skor Latihan AI'}
          </p>
          <p className="text-4xl font-display font-bold text-ink-900">{latestFeedback.score}<span className="text-lg text-ink-500">/100</span></p>
          <p className="text-[11px] text-ink-500 mt-1">
            Ini skor anggaran AI Coach, <strong>bukan markah rasmi PKSK Bahagian C</strong>.
          </p>
        </div>
        {mode === 'exam' && (
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sage-600 bg-sage-100 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>EXAM SELESAI</span>
          </div>
        )}
      </div>

      {scores.length > 1 && (
        <div className="bg-honey-100 border border-honey-200 rounded-3xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-700">
            <TrendingUp className="w-4 h-4 text-honey-500" />
            <span>{scores.map((s, i) => `Percubaan ${i + 1}: ${s}`).join(' → ')}</span>
          </div>
          {improvement !== null && (
            <span className={`text-xs font-bold ${improvement >= 0 ? 'text-sage-600' : 'text-clay-500'}`}>
              {improvement >= 0 ? '+' : ''}{improvement}
            </span>
          )}
        </div>
      )}

      <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-4">
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-honey-500 fill-honey-500" />
            <span>Kekuatan</span>
          </h4>
          <ul className="list-disc list-inside text-xs text-ink-700 space-y-1">
            {latestFeedback.kekuatan.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-clay-500" />
            <span>Top Perkara Perlu Dibaiki</span>
          </h4>
          <ul className="list-disc list-inside text-xs text-ink-700 space-y-1">
            {latestFeedback.perkara_dibaiki.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-mist-600" />
            <span>Cadangan</span>
          </h4>
          <ul className="list-disc list-inside text-xs text-ink-700 space-y-1">
            {latestFeedback.cadangan.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>
      </div>

      {mode === 'practice' && !isLocked ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onImprove();
            }}
            className="py-3.5 px-4 bg-mist-500 hover:bg-mist-600 text-white font-bold rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Baiki &amp; Hantar Semula</span>
          </button>
          <button
            onClick={() => {
              soundManager.playLevelUp();
              onFinalize();
            }}
            className="py-3.5 px-4 bg-sage-500 hover:bg-sage-600 text-white font-bold rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            <span>Tandakan Versi Akhir</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            soundManager.playClick();
            onGoDashboard();
          }}
          className="w-full py-3.5 px-4 bg-mist-500 hover:bg-mist-600 text-white font-bold rounded-2xl text-sm transition-colors"
        >
          Kembali ke Dashboard
        </button>
      )}
    </div>
  );
};

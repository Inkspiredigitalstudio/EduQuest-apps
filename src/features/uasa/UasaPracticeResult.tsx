import React from 'react';
import { Star, Coins, Sparkles, Home, RotateCcw } from 'lucide-react';

interface UasaPracticeResultProps {
  score: number;
  total: number;
  percent: number;
  coinsEarned: number;
  xpEarned: number;
  chapterName: string;
  onRetry: () => void;
  onGoDashboard: () => void;
}

export const UasaPracticeResult: React.FC<UasaPracticeResultProps> = ({
  score,
  total,
  percent,
  coinsEarned,
  xpEarned,
  chapterName,
  onRetry,
  onGoDashboard,
}) => {
  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      <div className="bg-cream-50 border border-sand-200 rounded-3xl p-8 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-sage-100 flex items-center justify-center text-sage-600">
          <Star className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-display font-bold text-ink-900">Latihan Selesai!</h2>
        <p className="text-xs text-ink-500">{chapterName}</p>
        <div className="text-5xl font-display font-bold text-mist-600">{percent}%</div>
        <p className="text-sm text-ink-500">{score} / {total} betul</p>

        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-1.5 bg-honey-100 text-honey-500 px-4 py-2 rounded-2xl font-bold text-sm">
            <Coins className="w-4 h-4" />
            <span>+{coinsEarned}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-mist-100 text-mist-600 px-4 py-2 rounded-2xl font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>+{xpEarned} XP</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-3.5 px-5 bg-cream-100 hover:bg-cream-200 text-ink-700 font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 border border-sand-200"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Cuba Lagi</span>
        </button>
        <button
          onClick={onGoDashboard}
          className="flex-1 py-3.5 px-5 bg-mist-500 hover:bg-mist-600 text-white font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Menu Utama</span>
        </button>
      </div>
    </div>
  );
};

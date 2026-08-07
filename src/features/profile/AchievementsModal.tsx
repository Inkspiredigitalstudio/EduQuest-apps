import React, { useState, useEffect } from 'react';
import { UserProfile, UserAttempt, Achievement } from '../../types';
import { soundManager } from '../../lib/audio';
import { Award, Trophy, Sparkles, CheckCircle2, Lock, Flame, Coins, Target, X } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  user: UserProfile;
  userAttempts?: UserAttempt[];
  onClose: () => void;
  onClaimReward: (rewardXp: number, rewardCoins: number) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  user,
  userAttempts = [],
  onClose,
  onClaimReward,
}) => {
  const [claimedIds, setClaimedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('eduquest_claimed_achievements') || '[]');
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  // Calculate statistics for checkpoints safely
  const safeAttempts = userAttempts || [];
  const totalCorrectAnswers = safeAttempts.reduce((acc, curr) => acc + curr.score, 0);
  const hasPerfectScore = safeAttempts.some((a) => a.score === a.total_question && a.total_question > 0);
  const totalAttemptsCount = safeAttempts.length;

  const achievementsList: Achievement[] = [
    {
      id: 'ach-taharah',
      title: 'Quest Legend 🗺️',
      description: 'Selesaikan sekurang-kurangnya 1 bahagian Kuiz / Soalan Latihan.',
      icon: 'Award',
      target: 1,
      current: Math.min(1, totalAttemptsCount),
      reward_xp: 50,
      reward_coins: 30,
      is_unlocked: totalAttemptsCount >= 1,
      is_claimed: claimedIds.includes('ach-taharah'),
    },
    {
      id: 'ach-centurion',
      title: 'Sharpshooter 🎯',
      description: 'Kumpul 100 soalan betul secara keseluruhan.',
      icon: 'Target',
      target: 100,
      current: Math.min(100, totalCorrectAnswers),
      reward_xp: 150,
      reward_coins: 100,
      is_unlocked: totalCorrectAnswers >= 100,
      is_claimed: claimedIds.includes('ach-centurion'),
    },
    {
      id: 'ach-mumtaz',
      title: 'Grandmaster 👑',
      description: 'Capai markah 100% sempurna dalam mana-mana kuiz bahagian.',
      icon: 'Sparkles',
      target: 1,
      current: hasPerfectScore ? 1 : 0,
      reward_xp: 100,
      reward_coins: 50,
      is_unlocked: hasPerfectScore,
      is_claimed: claimedIds.includes('ach-mumtaz'),
    },
    {
      id: 'ach-streak',
      title: 'Streak Hero 🔥',
      description: 'Capai streak latihan 3 hari berturut-turut.',
      icon: 'Flame',
      target: 3,
      current: Math.min(3, user.streak_days || 1),
      reward_xp: 80,
      reward_coins: 40,
      is_unlocked: (user.streak_days || 1) >= 3,
      is_claimed: claimedIds.includes('ach-streak'),
    },
    {
      id: 'ach-collector',
      title: 'Treasure Hunter 🪙',
      description: 'Kumpul sekurang-kurangnya 100 koin terkumpul.',
      icon: 'Coins',
      target: 100,
      current: Math.min(100, user.coin),
      reward_xp: 60,
      reward_coins: 50,
      is_unlocked: user.coin >= 100,
      is_claimed: claimedIds.includes('ach-collector'),
    },
  ];

  const handleClaim = (ach: Achievement) => {
    soundManager.playLevelUp();
    const updated = [...claimedIds, ach.id];
    setClaimedIds(updated);
    localStorage.setItem('eduquest_claimed_achievements', JSON.stringify(updated));
    onClaimReward(ach.reward_xp, ach.reward_coins);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto p-6 space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Lencana Pencapaian & Anugerah</h2>
              <p className="text-xs text-slate-400">Selesaikan tugasan untuk tebus mata XP & Koin ganjaran</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {achievementsList.map((ach) => {
            const percent = Math.round((ach.current / ach.target) * 100);

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  ach.is_unlocked
                    ? 'bg-slate-800/80 border-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    ach.is_unlocked
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {ach.is_unlocked ? <Award className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{ach.title}</span>
                      {ach.is_unlocked && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          Terbuka
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{ach.description}</p>

                    {/* Progress Bar */}
                    <div className="w-full sm:w-60 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 mt-1">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Kemajuan: {ach.current} / {ach.target} ({percent}%)
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                  {ach.is_claimed ? (
                    <span className="text-xs font-bold text-slate-500 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Disahkan
                    </span>
                  ) : ach.is_unlocked ? (
                    <button
                      onClick={() => handleClaim(ach)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Tebus +{ach.reward_xp} XP</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-medium px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800">
                      Berkunci
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

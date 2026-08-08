import React, { useState } from 'react';
import { UserProfile, UserAttempt, Achievement } from '../../types';
import { soundManager } from '../../lib/audio';
import { Award, Trophy, Sparkles, CheckCircle2, Lock, X } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  user: UserProfile;
  userAttempts?: UserAttempt[];
  onClose: () => void;
  onClaimReward: (rewardXp: number, rewardCoins: number) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, user, userAttempts = [], onClose, onClaimReward }) => {
  const [claimedIds, setClaimedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('eduquest_claimed_achievements') || '[]');
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  const safeAttempts = userAttempts || [];
  const totalCorrectAnswers = safeAttempts.reduce((acc, curr) => acc + curr.score, 0);
  const hasPerfectScore = safeAttempts.some((a) => a.score === a.total_question && a.total_question > 0);
  const totalAttemptsCount = safeAttempts.length;

  const achievementsList: Achievement[] = [
    { id: 'ach-taharah', title: 'Quest Legend 🗺️', description: 'Selesaikan sekurang-kurangnya 1 bahagian Kuiz / Soalan Latihan.', icon: 'Award', target: 1, current: Math.min(1, totalAttemptsCount), reward_xp: 50, reward_coins: 30, is_unlocked: totalAttemptsCount >= 1, is_claimed: claimedIds.includes('ach-taharah') },
    { id: 'ach-centurion', title: 'Sharpshooter 🎯', description: 'Kumpul 100 soalan betul secara keseluruhan.', icon: 'Target', target: 100, current: Math.min(100, totalCorrectAnswers), reward_xp: 150, reward_coins: 100, is_unlocked: totalCorrectAnswers >= 100, is_claimed: claimedIds.includes('ach-centurion') },
    { id: 'ach-mumtaz', title: 'Grandmaster 👑', description: 'Capai markah 100% sempurna dalam mana-mana kuiz bahagian.', icon: 'Sparkles', target: 1, current: hasPerfectScore ? 1 : 0, reward_xp: 100, reward_coins: 50, is_unlocked: hasPerfectScore, is_claimed: claimedIds.includes('ach-mumtaz') },
    { id: 'ach-streak', title: 'Streak Hero 🔥', description: 'Capai streak latihan 3 hari berturut-turut.', icon: 'Flame', target: 3, current: Math.min(3, user.streak_days || 1), reward_xp: 80, reward_coins: 40, is_unlocked: (user.streak_days || 1) >= 3, is_claimed: claimedIds.includes('ach-streak') },
    { id: 'ach-collector', title: 'Treasure Hunter 🪙', description: 'Kumpul sekurang-kurangnya 100 koin terkumpul.', icon: 'Coins', target: 100, current: Math.min(100, user.coin), reward_xp: 60, reward_coins: 50, is_unlocked: user.coin >= 100, is_claimed: claimedIds.includes('ach-collector') },
  ];

  const handleClaim = (ach: Achievement) => {
    soundManager.playLevelUp();
    const updated = [...claimedIds, ach.id];
    setClaimedIds(updated);
    localStorage.setItem('eduquest_claimed_achievements', JSON.stringify(updated));
    onClaimReward(ach.reward_xp, ach.reward_coins);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-cream-50 border border-sand-200 rounded-3xl shadow-xl overflow-hidden my-auto p-6 space-y-6 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-sand-200 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-honey-400 flex items-center justify-center text-white">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-ink-900">Lencana Pencapaian &amp; Anugerah</h2>
              <p className="text-xs text-ink-500">Selesaikan tugasan untuk tebus mata XP &amp; Koin ganjaran</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2.5 rounded-xl text-ink-500 hover:text-ink-900 bg-cream-100 hover:bg-cream-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {achievementsList.map((ach) => {
            const percent = Math.round((ach.current / ach.target) * 100);

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  ach.is_unlocked ? 'bg-honey-100/60 border-honey-300' : 'bg-cream-100 border-sand-200 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    ach.is_unlocked ? 'bg-honey-200 text-honey-500' : 'bg-cream-200 text-ink-300'
                  }`}>
                    {ach.is_unlocked ? <Award className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                      <span>{ach.title}</span>
                      {ach.is_unlocked && (
                        <span className="text-[10px] bg-sage-100 text-sage-600 px-2 py-0.5 rounded-full font-bold">Terbuka</span>
                      )}
                    </h3>
                    <p className="text-xs text-ink-500 leading-relaxed">{ach.description}</p>

                    <div className="w-full sm:w-60 bg-cream-200 rounded-full h-2 overflow-hidden mt-1">
                      <div className="bg-honey-400 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-[10px] text-ink-500 font-mono">
                      Kemajuan: {ach.current} / {ach.target} ({percent}%)
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                  {ach.is_claimed ? (
                    <span className="text-xs font-bold text-ink-500 bg-cream-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" /> Disahkan
                    </span>
                  ) : ach.is_unlocked ? (
                    <button
                      onClick={() => handleClaim(ach)}
                      className="px-4 py-2 bg-honey-400 hover:bg-honey-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tebus +{ach.reward_xp} XP</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-ink-500 font-medium px-3 py-1.5 bg-cream-100 rounded-xl">Berkunci</span>
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

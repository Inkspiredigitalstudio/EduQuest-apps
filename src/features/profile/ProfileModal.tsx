import React, { useState } from 'react';
import { UserProfile, UserProgress } from '../../types';
import { soundManager } from '../../lib/audio';
import {
  User,
  Trophy,
  Coins,
  Flame,
  Copy,
  Check,
  HeartHandshake,
  LogOut,
  X,
  Sparkles,
  Award,
  CheckCircle2,
  Lock,
  GraduationCap,
  School,
  Star,
  Swords,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  user: UserProfile;
  progressList: UserProgress[];
  onClose: () => void;
  onLogout: () => void;
  onOpenAdmin?: () => void;
  onOpenParent?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  user,
  progressList = [],
  onClose,
  onLogout,
  onOpenAdmin,
  onOpenParent,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'student' | 'parent'>(() =>
    user.role === 'parent' ? 'parent' : 'student'
  );

  if (!isOpen) return null;

  const safeProgressList = progressList || [];

  // Stats calculations
  const totalQuizzesCompleted = safeProgressList.filter((p) => p.is_completed).length;
  const avgBestScore =
    safeProgressList.length > 0
      ? Math.round(safeProgressList.reduce((acc, curr) => acc + curr.best_score, 0) / safeProgressList.length)
      : 0;

  // Level Title Calculation
  const getLevelTitle = (lvl: number) => {
    if (lvl >= 10) return 'Cendekiawan Islam SPPIM';
    if (lvl >= 7) return 'Pakar Dini Bintang';
    if (lvl >= 5) return 'Penuntut Ilmu Utama';
    if (lvl >= 3) return 'Pejuang Ilmu Dini';
    return 'Penuntut Ilmu SPPIM';
  };

  const currentXpInLevel = user.xp % 100;
  const xpNeeded = 100 - currentXpInLevel;
  const levelTitle = getLevelTitle(user.level);

  // Formatted Invite Code
  const inviteCode = `SPQ-${(user.login_id || '1001').toUpperCase()}`;

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    soundManager.playCoin();
    setTimeout(() => setCopied(false), 2500);
  };

  // Badge list definitions
  const achievements = [
    {
      id: 'fiqh',
      title: 'Pencinta Fiqh',
      desc: 'Selesaikan soalan Subjek Fekah',
      icon: '📖',
      isUnlocked: progressList.some((p) => p.section_id.includes('fekah') || p.is_completed),
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'akidah',
      title: 'Bintang Akidah',
      desc: 'Selesaikan soalan Subjek Akidah',
      icon: '🌟',
      isUnlocked: progressList.some((p) => p.section_id.includes('akidah') || p.best_score > 0),
      color: 'from-sky-500 to-blue-600',
    },
    {
      id: 'akhlak',
      title: 'Wira Akhlak',
      desc: 'Tekun menjawa soalan Akhlak Islamiah',
      icon: '🛡️',
      isUnlocked: progressList.some((p) => p.section_id.includes('akhlak') || p.best_score > 0),
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'streak',
      title: 'Pejuang Streak',
      desc: 'Kekal streak 3 hari berturut-turut',
      icon: '🔥',
      isUnlocked: (user.streak_days || 1) >= 3,
      color: 'from-orange-500 to-red-600',
    },
    {
      id: 'coin',
      title: 'Pemburu Koin',
      desc: 'Kumpul sekurang-kurangnya 100 Koin',
      icon: '💰',
      isUnlocked: user.coin >= 100,
      color: 'from-yellow-400 to-amber-600',
    },
    {
      id: 'battle',
      title: 'Juara Battle 1v1',
      desc: 'Mencapai Level 2 ke atas',
      icon: '⚔️',
      isUnlocked: user.level >= 2,
      color: 'from-rose-500 to-pink-600',
    },
    {
      id: 'master',
      title: 'Master SPPIM',
      desc: 'Selesaikan sekurang-kurangnya 5 kuiz',
      icon: '🎓',
      isUnlocked: totalQuizzesCompleted >= 5,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      id: 'perfect',
      title: 'Pantas & Tepat',
      desc: 'Mencapai skor purata 80%+ dalam kuiz',
      icon: '⚡',
      isUnlocked: avgBestScore >= 80,
      color: 'from-yellow-300 to-amber-500',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar Header */}
        <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 p-5 text-white relative shrink-0">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 rounded-full transition-colors z-10"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Header Block */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-1">
            {/* Avatar Badge */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 border-4 border-white/30 flex items-center justify-center text-4xl shadow-xl text-slate-950 font-black">
                {user.avatar || '🎓'}
              </div>
              <div className="absolute -bottom-2 -right-1 bg-indigo-900 border-2 border-indigo-400 text-indigo-200 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                Lvl {user.level}
              </div>
            </div>

            {/* Name, Title & Level info */}
            <div className="text-center sm:text-left space-y-1 flex-1">
              <div className="inline-flex items-center gap-1.5 bg-black/25 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-300 border border-white/20">
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                <span>Level {user.level} • {levelTitle}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {user.name}
              </h2>

              <p className="text-xs text-sky-100 font-medium flex items-center justify-center sm:justify-start gap-1">
                <School className="w-3.5 h-3.5 text-sky-200" />
                <span>Pelajar SPPI & SMKA • Modul SPPIM-Quest</span>
              </p>
            </div>
          </div>

          {/* Clean XP Progress Bar */}
          <div className="mt-4 bg-slate-950/40 backdrop-blur-sm p-3 rounded-2xl border border-white/20 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black text-white">
              <span className="flex items-center gap-1 text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>Mata Pengalaman (XP)</span>
              </span>
              <span className="font-mono text-sky-200">{currentXpInLevel} / 100 XP</span>
            </div>

            <div className="w-full bg-slate-950/60 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-amber-400 via-orange-400 to-sky-400 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min(100, currentXpInLevel)}%` }}
              />
            </div>

            <p className="text-[10px] text-sky-100 font-semibold text-center sm:text-right">
              +{xpNeeded} XP lagi untuk naik ke Level {user.level + 1}!
            </p>
          </div>
        </div>

        {/* Tab Switcher (Pelajar vs Ibu Bapa) */}
        <div className="grid grid-cols-2 bg-slate-950 border-b border-slate-800 shrink-0">
          <button
            onClick={() => {
              setActiveTab('student');
              soundManager.playClick();
            }}
            className={`py-3 text-xs font-black flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'student'
                ? 'bg-slate-900 text-sky-400 border-b-2 border-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil & Lencana Pelajar</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('parent');
              soundManager.playClick();
            }}
            className={`py-3 text-xs font-black flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'parent'
                ? 'bg-slate-900 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Rekod Ibu Bapa & Guru</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {activeTab === 'student' ? (
            <div className="space-y-6">
              {/* 1. STATS & REWARDS (Grid Ringkas 3 Kolum) */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Statistik Ringkas</span>
                </h3>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
                  {/* Total Coins */}
                  <div className="bg-slate-800/80 p-3 sm:p-3.5 rounded-2xl border border-slate-700/80 shadow-md">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-1.5">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Koin Dikumpul</div>
                    <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">{user.coin}</div>
                  </div>

                  {/* Streak */}
                  <div className="bg-slate-800/80 p-3 sm:p-3.5 rounded-2xl border border-slate-700/80 shadow-md">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto mb-1.5">
                      <Flame className="w-4 h-4 fill-orange-400" />
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Rekod Streak</div>
                    <div className="text-xl sm:text-2xl font-black text-orange-400 mt-0.5">
                      {user.streak_days || 1} <span className="text-xs font-normal">Hari</span>
                    </div>
                  </div>

                  {/* Kuiz Selesai */}
                  <div className="bg-slate-800/80 p-3 sm:p-3.5 rounded-2xl border border-slate-700/80 shadow-md">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto mb-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Kuiz Selesai</div>
                    <div className="text-xl sm:text-2xl font-black text-sky-300 mt-0.5">{totalQuizzesCompleted}</div>
                  </div>
                </div>
              </div>

              {/* 2. PAUTAN AKAUN (Invite Code for Parent / Teacher) */}
              <div className="bg-gradient-to-r from-slate-800/90 via-slate-800/60 to-slate-800/90 p-4 sm:p-5 rounded-2xl border-2 border-sky-500/30 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">Kod Jemputan Ibu Bapa / Guru</h4>
                      <p className="text-[11px] text-slate-400">Pautkan akaun ini untuk pemantauan prestasi</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-400/30 hidden xs:inline">
                    Pautan
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-700">
                  <div className="flex-1 font-mono font-black text-lg text-amber-300 tracking-wider px-2">
                    {inviteCode}
                  </div>
                  <button
                    onClick={handleCopyInviteCode}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                      copied
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-sky-600 hover:bg-sky-500 text-white shadow-md'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Kod</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Sediakan kod ini kepada ibu bapa anda untuk dimasukkan dalam Portal Pemantauan Ibu Bapa.
                </p>
              </div>

              {/* 3. BADGES & ACHIEVEMENTS GRID */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Lencana & Pencapaian ({achievements.filter((a) => a.isUnlocked).length}/{achievements.length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
                  {achievements.map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                        badge.isUnlocked
                          ? 'bg-slate-800/90 border-slate-700/80 shadow-md'
                          : 'bg-slate-900/50 border-slate-800/80 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow ${
                          badge.isUnlocked
                            ? `bg-gradient-to-br ${badge.color} text-white border border-white/20`
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {badge.isUnlocked ? badge.icon : '🔒'}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs font-black truncate ${badge.isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                            {badge.title}
                          </h4>
                          {badge.isUnlocked ? (
                            <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                              Unlocked
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-500">
                              Kunci
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate leading-tight">
                          {badge.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. TETAPAN AKAUN (Account Settings Info) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  <span>Maklumat Akaun & Sekolah</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                    <span className="text-slate-400">ID Pengguna</span>
                    <span className="font-mono font-bold text-white">{user.login_id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                    <span className="text-slate-400">Peringkat Sekolah</span>
                    <span className="font-bold text-white">SPPI / SMKA (Tingkatan 4 & 5)</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-300">
                    <span className="text-slate-400">Status Peranan</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full ${
                      user.role === 'admin' || user.is_approved_admin
                        ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30'
                        : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    }`}>
                      {user.role === 'admin' || user.is_approved_admin ? 'Pentadbir (Admin)' : 'Pelajar Aktif'}
                    </span>
                  </div>
                </div>

                {onOpenAdmin && (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                      onOpenAdmin();
                    }}
                    className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Buka Panel Pentadbir (Admin CMS)</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Parent & Teacher Report Tab */
            <div className="space-y-4">
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-white">Laporan Pemantauan Pelajar</h3>
                    <p className="text-xs text-slate-400">Ringkasan prestasi & penglibatan</p>
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Sistem Aktif
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                    <div className="text-xs text-slate-400 font-medium">Bahagian Dibereskan</div>
                    <div className="text-2xl font-black text-sky-400 mt-1">{totalQuizzesCompleted}</div>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                    <div className="text-xs text-slate-400 font-medium">Skor Purata Terbaik</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">{avgBestScore}%</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p>
                    Pelajar ini mengekalkan streak latihan soalan selama <strong className="text-orange-400">{user.streak_days || 1} hari berturut-turut</strong>.
                  </p>
                  <p>
                    Gunakan <strong>Kod Jemputan: {inviteCode}</strong> di Portal Ibu Bapa untuk memantau analisis pencapaian secara terperinci mengikut subjek Fekah, Akidah & Akhlak.
                  </p>
                </div>

                {onOpenParent && (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                      onOpenParent();
                    }}
                    className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>Akses Terus ke Dashboard Ibu Bapa</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              soundManager.playClick();
              onLogout();
              onClose();
            }}
            className="text-xs font-black text-red-400 hover:text-red-300 flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Keluar Akaun</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="text-xs font-black text-white px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

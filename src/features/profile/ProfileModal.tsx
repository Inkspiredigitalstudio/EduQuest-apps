import React, { useState } from 'react';
import { UserProfile, UserProgress } from '../../types';
import { soundManager } from '../../lib/audio';
import { updateUserPhone } from '../../lib/supabase';
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
  GraduationCap,
  School,
  Star,
  Pencil,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  user: UserProfile;
  progressList: UserProgress[];
  onClose: () => void;
  onLogout: () => void;
  onUserUpdate?: (updated: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, user, progressList = [], onClose, onLogout, onUserUpdate }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'student' | 'parent'>('student');
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user.phone || '');
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  if (!isOpen) return null;

  const handleSavePhone = async () => {
    setSavingPhone(true);
    setPhoneError('');
    const result = await updateUserPhone(user.id, phoneInput);
    setSavingPhone(false);
    if (result.success) {
      soundManager.playClick();
      onUserUpdate?.({ ...user, phone: phoneInput.trim() || undefined });
      setEditingPhone(false);
    } else {
      setPhoneError(result.error || 'Gagal simpan. Sila cuba lagi.');
    }
  };

  const safeProgressList = progressList || [];

  const totalQuizzesCompleted = safeProgressList.filter((p) => p.is_completed).length;
  const avgBestScore =
    safeProgressList.length > 0
      ? Math.round(safeProgressList.reduce((acc, curr) => acc + curr.best_score, 0) / safeProgressList.length)
      : 0;

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
  const inviteCode = `SPQ-${(user.login_id || '1001').toUpperCase()}`;

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    soundManager.playCoin();
    setTimeout(() => setCopied(false), 2500);
  };

  const achievements = [
    { id: 'fiqh', title: 'Pencinta Fiqh', desc: 'Selesaikan soalan Subjek Fekah', icon: '📖', isUnlocked: progressList.some((p) => p.section_id.includes('fekah') || p.is_completed), color: 'from-honey-400 to-honey-500' },
    { id: 'akidah', title: 'Bintang Akidah', desc: 'Selesaikan soalan Subjek Akidah', icon: '🌟', isUnlocked: progressList.some((p) => p.section_id.includes('akidah') || p.best_score > 0), color: 'from-mist-400 to-mist-500' },
    { id: 'akhlak', title: 'Wira Akhlak', desc: 'Tekun menjawab soalan Akhlak Islamiah', icon: '🛡️', isUnlocked: progressList.some((p) => p.section_id.includes('akhlak') || p.best_score > 0), color: 'from-sage-400 to-sage-500' },
    { id: 'streak', title: 'Pejuang Streak', desc: 'Kekal streak 3 hari berturut-turut', icon: '🔥', isUnlocked: (user.streak_days || 1) >= 3, color: 'from-clay-400 to-clay-500' },
    { id: 'coin', title: 'Pemburu Koin', desc: 'Kumpul sekurang-kurangnya 100 Koin', icon: '💰', isUnlocked: user.coin >= 100, color: 'from-honey-300 to-honey-400' },
    { id: 'battle', title: 'Juara Battle 1v1', desc: 'Mencapai Level 2 ke atas', icon: '⚔️', isUnlocked: user.level >= 2, color: 'from-clay-300 to-clay-400' },
    { id: 'master', title: 'Master SPPIM', desc: 'Selesaikan sekurang-kurangnya 5 kuiz', icon: '🎓', isUnlocked: totalQuizzesCompleted >= 5, color: 'from-mist-500 to-mist-600' },
    { id: 'perfect', title: 'Pantas & Tepat', desc: 'Mencapai skor purata 80%+ dalam kuiz', icon: '⚡', isUnlocked: avgBestScore >= 80, color: 'from-sage-300 to-sage-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-cream-50 border border-sand-200 rounded-3xl shadow-xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-mist-100 p-5 relative shrink-0 border-b border-sand-200">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-ink-500 hover:text-ink-900 bg-cream-50/60 hover:bg-cream-50 rounded-full transition-colors z-10"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-1">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-honey-300 border-4 border-white flex items-center justify-center text-4xl shadow-sm">
                {user.avatar || '🎓'}
              </div>
              <div className="absolute -bottom-2 -right-1 bg-mist-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                Lvl {user.level}
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1 flex-1">
              <div className="inline-flex items-center gap-1.5 bg-cream-50/70 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-honey-500">
                <Sparkles className="w-3 h-3" />
                <span>Level {user.level} • {levelTitle}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-900">{user.name}</h2>

              <p className="text-xs text-ink-700 font-medium flex items-center justify-center sm:justify-start gap-1">
                <School className="w-3.5 h-3.5" />
                <span>Pelajar SPPI &amp; SMKA • EduQuest, Modul SPPIM</span>
              </p>
            </div>
          </div>

          <div className="mt-4 bg-cream-50/60 p-3 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-ink-900">
              <span className="flex items-center gap-1 text-honey-500">
                <Star className="w-3.5 h-3.5 fill-honey-500" />
                <span>Mata Pengalaman (XP)</span>
              </span>
              <span className="font-mono text-ink-700">{currentXpInLevel} / 100 XP</span>
            </div>
            <div className="w-full bg-cream-200 h-3 rounded-full overflow-hidden">
              <div
                className="bg-honey-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, currentXpInLevel)}%` }}
              />
            </div>
            <p className="text-[10px] text-ink-500 font-semibold text-center sm:text-right">
              +{xpNeeded} XP lagi untuk naik ke Level {user.level + 1}!
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 bg-cream-100 border-b border-sand-200 shrink-0">
          <button
            onClick={() => {
              setActiveTab('student');
              soundManager.playClick();
            }}
            className={`py-3 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'student' ? 'bg-cream-50 text-mist-600 border-b-2 border-mist-500' : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil &amp; Lencana</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('parent');
              soundManager.playClick();
            }}
            className={`py-3 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'parent' ? 'bg-cream-50 text-sage-600 border-b-2 border-sage-500' : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Rekod Ibu Bapa</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {activeTab === 'student' ? (
            <div className="space-y-6">
              {/* Stats */}
              <div>
                <h3 className="text-xs font-bold text-ink-500 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-honey-500" />
                  <span>Statistik Ringkas</span>
                </h3>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
                  <div className="bg-cream-100 p-3 sm:p-3.5 rounded-2xl border border-sand-200">
                    <div className="w-8 h-8 rounded-xl bg-honey-100 text-honey-500 flex items-center justify-center mx-auto mb-1.5">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div className="text-[10px] text-ink-500 font-bold uppercase">Koin</div>
                    <div className="text-xl sm:text-2xl font-display font-bold text-honey-500 mt-0.5">{user.coin}</div>
                  </div>

                  <div className="bg-cream-100 p-3 sm:p-3.5 rounded-2xl border border-sand-200">
                    <div className="w-8 h-8 rounded-xl bg-clay-100 text-clay-500 flex items-center justify-center mx-auto mb-1.5">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div className="text-[10px] text-ink-500 font-bold uppercase">Streak</div>
                    <div className="text-xl sm:text-2xl font-display font-bold text-clay-500 mt-0.5">
                      {user.streak_days || 1} <span className="text-xs font-normal">Hari</span>
                    </div>
                  </div>

                  <div className="bg-cream-100 p-3 sm:p-3.5 rounded-2xl border border-sand-200">
                    <div className="w-8 h-8 rounded-xl bg-mist-100 text-mist-600 flex items-center justify-center mx-auto mb-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="text-[10px] text-ink-500 font-bold uppercase">Kuiz Selesai</div>
                    <div className="text-xl sm:text-2xl font-display font-bold text-mist-600 mt-0.5">{totalQuizzesCompleted}</div>
                  </div>
                </div>
              </div>

              {/* Invite Code for Parent */}
              <div className="bg-cream-100 p-4 sm:p-5 rounded-2xl border-2 border-mist-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-mist-100 text-mist-600 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-display font-bold text-ink-900">Kod Jemputan Ibu Bapa</h4>
                      <p className="text-[11px] text-ink-500">Pautkan akaun ini untuk pemantauan prestasi</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-cream-50 p-2.5 rounded-xl border border-sand-200">
                  <div className="flex-1 font-mono font-bold text-lg text-honey-500 tracking-wider px-2">
                    {inviteCode}
                  </div>
                  <button
                    onClick={handleCopyInviteCode}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      copied ? 'bg-sage-500 text-white' : 'bg-mist-500 hover:bg-mist-600 text-white'
                    }`}
                  >
                    {copied ? (<><Check className="w-4 h-4" /><span>Tersalin!</span></>) : (<><Copy className="w-4 h-4" /><span>Salin Kod</span></>)}
                  </button>
                </div>
                <p className="text-[10px] text-ink-500">
                  Sediakan kod ini kepada ibu bapa anda untuk dimasukkan dalam Portal Ibu Bapa.
                </p>
              </div>

              {/* Badges */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-ink-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-honey-500" />
                  <span>Lencana &amp; Pencapaian ({achievements.filter((a) => a.isUnlocked).length}/{achievements.length})</span>
                </h3>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
                  {achievements.map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-2xl border transition-colors flex items-center gap-3 ${
                        badge.isUnlocked ? 'bg-cream-100 border-sand-200' : 'bg-cream-50 border-sand-200 opacity-50'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                          badge.isUnlocked ? `bg-gradient-to-br ${badge.color} text-white` : 'bg-cream-200 text-ink-300'
                        }`}
                      >
                        {badge.isUnlocked ? badge.icon : '🔒'}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs font-bold truncate ${badge.isUnlocked ? 'text-ink-900' : 'text-ink-500'}`}>
                            {badge.title}
                          </h4>
                          {badge.isUnlocked && (
                            <span className="text-[9px] font-bold text-sage-600 bg-sage-100 px-1.5 py-0.5 rounded">
                              Unlocked
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-ink-500 truncate leading-tight">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account info */}
              <div className="bg-cream-100 border border-sand-200 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-ink-500 uppercase tracking-wide flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-mist-500" />
                  <span>Maklumat Pelajar</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-sand-200 text-ink-700">
                    <span className="text-ink-500">ID Pengguna</span>
                    <span className="font-mono font-bold text-ink-900">{user.login_id}</span>
                  </div>
                  <div className="py-1.5 border-b border-sand-200 text-ink-700">
                    <div className="flex justify-between items-center">
                      <span className="text-ink-500">No. Telefon</span>
                      {!editingPhone && (
                        <button
                          onClick={() => {
                            setPhoneInput(user.phone || '');
                            setPhoneError('');
                            setEditingPhone(true);
                          }}
                          className="flex items-center gap-1 text-ink-900"
                        >
                          <span className="font-bold">{user.phone || 'Belum ditetapkan'}</span>
                          <Pencil className="w-3 h-3 text-ink-300" />
                        </button>
                      )}
                    </div>
                    {editingPhone && (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="tel"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="Contoh: 0123456789"
                            className="flex-1 bg-cream-100 border border-sand-300 focus:border-mist-400 text-ink-900 text-xs rounded-lg px-2.5 py-1.5 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={handleSavePhone}
                            disabled={savingPhone}
                            className="px-2.5 py-1.5 bg-mist-500 hover:bg-mist-600 text-white text-xs font-bold rounded-lg disabled:opacity-60"
                          >
                            {savingPhone ? '...' : 'Simpan'}
                          </button>
                          <button
                            onClick={() => { setEditingPhone(false); setPhoneError(''); }}
                            className="px-2.5 py-1.5 bg-cream-100 hover:bg-cream-200 text-ink-500 text-xs font-bold rounded-lg"
                          >
                            Batal
                          </button>
                        </div>
                        {phoneError && <p className="text-[10px] text-clay-500">{phoneError}</p>}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between py-1 border-b border-sand-200 text-ink-700">
                    <span className="text-ink-500">Emel</span>
                    <span className="font-bold text-ink-900 truncate max-w-[60%] text-right">{user.contact_email || 'Belum ditetapkan'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-sand-200 text-ink-700">
                    <span className="text-ink-500">Peringkat</span>
                    <span className="font-bold text-ink-900">
                      {user.school_level === 'rendah' && user.school_year
                        ? `Sekolah Rendah — Tahun ${user.school_year}`
                        : user.school_level === 'menengah' && user.school_form
                        ? `Sekolah Menengah — Tingkatan ${user.school_form}`
                        : 'Belum ditetapkan'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-ink-700">
                    <span className="text-ink-500">Status Peranan</span>
                    <span className="font-bold text-sage-600 bg-sage-100 px-2 py-0.5 rounded-full">
                      {user.role === 'parent' ? 'Ibu Bapa' : user.role === 'admin' ? 'Admin' : 'Pelajar Aktif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Parent Report Tab */
            <div className="space-y-4">
              <div className="bg-cream-100 p-5 rounded-2xl border border-sand-200 space-y-4">
                <div className="flex items-center justify-between border-b border-sand-200 pb-3">
                  <div>
                    <h3 className="text-sm font-display font-bold text-ink-900">Laporan Pemantauan Pelajar</h3>
                    <p className="text-xs text-ink-500">Ringkasan prestasi &amp; penglibatan</p>
                  </div>
                  <span className="text-[10px] font-bold text-sage-600 bg-sage-100 px-2.5 py-1 rounded-full">
                    Sistem Aktif
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-cream-50 p-3.5 rounded-2xl border border-sand-200">
                    <div className="text-xs text-ink-500 font-medium">Bahagian Diselesaikan</div>
                    <div className="text-2xl font-display font-bold text-mist-600 mt-1">{totalQuizzesCompleted}</div>
                  </div>
                  <div className="bg-cream-50 p-3.5 rounded-2xl border border-sand-200">
                    <div className="text-xs text-ink-500 font-medium">Skor Purata Terbaik</div>
                    <div className="text-2xl font-display font-bold text-sage-600 mt-1">{avgBestScore}%</div>
                  </div>
                </div>

                <div className="p-3.5 bg-cream-50 rounded-xl border border-sand-200 space-y-2 text-xs text-ink-700 leading-relaxed">
                  <p>
                    Pelajar ini mengekalkan streak latihan soalan selama <strong className="text-clay-500">{user.streak_days || 1} hari berturut-turut</strong>.
                  </p>
                  <p>
                    Gunakan <strong>Kod Jemputan: {inviteCode}</strong> di Portal Ibu Bapa untuk memantau analisis pencapaian secara terperinci mengikut subjek Fekah, Akidah &amp; Akhlak.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-cream-100 border-t border-sand-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              soundManager.playClick();
              onLogout();
              onClose();
            }}
            className="text-xs font-bold text-clay-500 hover:text-clay-500/80 flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-clay-100 hover:bg-clay-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Keluar Akaun</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="text-xs font-bold text-ink-700 px-5 py-2.5 bg-cream-50 hover:bg-cream-200 rounded-xl transition-colors border border-sand-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

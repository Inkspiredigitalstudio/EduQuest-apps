import React, { useState, useEffect } from 'react';
import { UserProfile, UserAttempt, UserProgress, Subject, Paper, Section } from '../../types';
import { fetchParentChildrenData } from '../../lib/supabase';
import { soundManager } from '../../lib/audio';
import { ObserverLinkPanel } from './ObserverLinkPanel';
import {
  Heart,
  Phone,
  Search,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Calendar,
  Send,
  RefreshCw,
  Sparkles,
  LogOut,
  Users,
  Settings2,
  Sun,
  Moon,
} from 'lucide-react';

interface ParentDashboardProps {
  user: UserProfile;
  subjects: Subject[];
  papers: Paper[];
  sections: Section[];
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ user, subjects, papers, sections, onLogout, isDarkMode, onToggleDarkMode }) => {
  const initialPhone = user.phone || localStorage.getItem('sppim_parent_phone') || '';

  const [phoneInput, setPhoneInput] = useState<string>(initialPhone);
  const [activePhone, setActivePhone] = useState<string>(initialPhone);

  const [loading, setLoading] = useState<boolean>(false);
  const [children, setChildren] = useState<UserProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [attemptsMap, setAttemptsMap] = useState<Record<string, UserAttempt[]>>({});
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress[]>>({});
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [showLinkManager, setShowLinkManager] = useState<boolean>(false);

  useEffect(() => {
    if (activePhone.trim()) {
      loadData(activePhone);
    }
  }, [activePhone]);

  const loadData = async (phone: string) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const result = await fetchParentChildrenData(phone);
      setChildren(result.children);
      setAttemptsMap(result.attemptsMap);
      setProgressMap(result.progressMap);

      if (result.children.length > 0) {
        if (!selectedChildId || !result.children.some((c) => c.id === selectedChildId)) {
          setSelectedChildId(result.children[0].id);
        }
      }
    } catch (e) {
      console.warn('Error fetching parent data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    if (!phoneInput.trim()) return;
    localStorage.setItem('sppim_parent_phone', phoneInput.trim());
    setActivePhone(phoneInput.trim());
  };

  const handleLoadDemoData = () => {
    soundManager.playClick();
    const demoPhone = '0123456789';
    setPhoneInput(demoPhone);
    localStorage.setItem('sppim_parent_phone', demoPhone);

    const demoChild: UserProfile = {
      id: 'demo-student-id',
      name: 'Ahmad Zaki (Anak Demo)',
      login_id: 'AHMAD123',
      phone: demoPhone,
      coin: 320,
      xp: 450,
      level: 4,
      created_at: new Date().toISOString(),
      streak_days: 5,
    };

    const demoAttempts: UserAttempt[] = [
      { id: 'att-1', user_id: demoChild.id, section_id: 'sec-fekah-2024-A', score: 9, total_question: 10, coins_earned: 50, xp_earned: 90, started_at: new Date(Date.now() - 86400000).toISOString(), completed_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 'att-2', user_id: demoChild.id, section_id: 'sec-fekah-2024-C1', score: 2, total_question: 5, coins_earned: 10, xp_earned: 20, started_at: new Date(Date.now() - 43200000).toISOString(), completed_at: new Date(Date.now() - 43200000).toISOString() },
      { id: 'att-3', user_id: demoChild.id, section_id: 'sec-akidah-2024-A', score: 8, total_question: 10, coins_earned: 40, xp_earned: 80, started_at: new Date().toISOString(), completed_at: new Date().toISOString() },
    ];

    const demoProgress: UserProgress[] = [
      { id: 'p-1', user_id: demoChild.id, section_id: 'sec-fekah-2024-A', best_score: 9, total_questions: 10, is_completed: true },
      { id: 'p-2', user_id: demoChild.id, section_id: 'sec-fekah-2024-C1', best_score: 2, total_questions: 5, is_completed: true },
      { id: 'p-3', user_id: demoChild.id, section_id: 'sec-akidah-2024-A', best_score: 8, total_questions: 10, is_completed: true },
    ];

    setChildren([demoChild]);
    setAttemptsMap({ [demoChild.id]: demoAttempts });
    setProgressMap({ [demoChild.id]: demoProgress });
    setSelectedChildId(demoChild.id);
    setActivePhone(demoPhone);
    setHasSearched(true);
  };

  const currentChild = children.find((c) => c.id === selectedChildId) || children[0];
  const currentAttempts = currentChild ? attemptsMap[currentChild.id] || [] : [];
  const currentProgress = currentChild ? progressMap[currentChild.id] || [] : [];

  const totalAnsweredSections = currentProgress.length;
  let totalScoreSum = 0;
  let totalQuestionSum = 0;
  currentProgress.forEach((p) => {
    totalScoreSum += p.best_score;
    totalQuestionSum += p.total_questions;
  });
  const overallAvgPercent = totalQuestionSum > 0 ? Math.round((totalScoreSum / totalQuestionSum) * 100) : 0;

  let gradeBadgeTitle = 'Belum Ada Rekod';
  let gradeBadgeColor = 'bg-cream-200 text-ink-500';
  if (totalAnsweredSections > 0) {
    if (overallAvgPercent >= 85) {
      gradeBadgeTitle = 'Mumtaz (Sangat Cemerlang)';
      gradeBadgeColor = 'bg-sage-100 text-sage-600';
    } else if (overallAvgPercent >= 70) {
      gradeBadgeTitle = 'Jayyid Jiddan (Cemerlang)';
      gradeBadgeColor = 'bg-mist-100 text-mist-600';
    } else if (overallAvgPercent >= 50) {
      gradeBadgeTitle = 'Jayyid (Memuaskan)';
      gradeBadgeColor = 'bg-honey-100 text-honey-500';
    } else {
      gradeBadgeTitle = 'Perlu Lebih Bimbingan';
      gradeBadgeColor = 'bg-clay-100 text-clay-500';
    }
  }

  const subjectAnalytics = subjects.map((sub) => {
    const subPapers = papers.filter((p) => p.subject_id === sub.id);
    const subPaperIds = subPapers.map((p) => p.id);
    const subSections = sections.filter((s) => subPaperIds.includes(s.paper_id));
    const subSectionIds = subSections.map((s) => s.id);
    const answeredSubProgress = currentProgress.filter((p) => subSectionIds.includes(p.section_id));

    let subScoreSum = 0;
    let subTotalSum = 0;
    answeredSubProgress.forEach((p) => {
      subScoreSum += p.best_score;
      subTotalSum += p.total_questions;
    });
    const subPercent = subTotalSum > 0 ? Math.round((subScoreSum / subTotalSum) * 100) : null;

    const weakSections = subSections.filter((sec) => {
      const p = currentProgress.find((prog) => prog.section_id === sec.id);
      if (!p || p.total_questions === 0) return false;
      return (p.best_score / p.total_questions) * 100 < 60;
    });

    return { subject: sub, totalSections: subSections.length, answeredCount: answeredSubProgress.length, avgPercent: subPercent, weakSections };
  });

  const allWeakSectionsInfo = subjectAnalytics.flatMap((sa) =>
    sa.weakSections.map((sec) => {
      const paper = papers.find((p) => p.id === sec.paper_id);
      const prog = currentProgress.find((p) => p.section_id === sec.id);
      const scoreP = prog ? Math.round((prog.best_score / prog.total_questions) * 100) : 0;
      return { sectionTitle: sec.title, paperTitle: paper?.title || '', subjectName: sa.subject.name, scorePercent: scoreP };
    })
  );

  const handleSendWhatsAppReport = () => {
    soundManager.playClick();
    if (!currentChild) return;

    let cleanPhone = activePhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '6' + cleanPhone;

    const dateStr = new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });

    let message = `Assalamu'alaikum & Salam Sejahtera Ibu/Bapa\n\n`;
    message += `*LAPORAN PRESTASI KESELURUHAN PELAJAR (EDUQUEST)*\n`;
    message += `───────────────────────────────\n`;
    message += `Nama Anak: ${currentChild.name}\n`;
    message += `ID Login: ${currentChild.login_id}\n`;
    message += `Tahap: Level ${currentChild.level} (${currentChild.xp} XP)\n`;
    message += `Purata Skor Keseluruhan: ${overallAvgPercent}%\n`;
    message += `Gred Pencapaian: ${gradeBadgeTitle}\n`;
    message += `Bahagian Dijawab: ${totalAnsweredSections} Bahagian\n`;
    message += `Tarikh Laporan: ${dateStr}\n\n`;

    if (allWeakSectionsInfo.length > 0) {
      message += `TAJUK MEMERLUKAN ULANG KAJI:\n`;
      allWeakSectionsInfo.forEach((w) => {
        message += `- ${w.subjectName} (${w.paperTitle}): ${w.sectionTitle} - ${w.scorePercent}%\n`;
      });
    } else {
      message += `Status: Prestasi cemerlang! Anak anda menguasai latihan yang telah dijawab sejauh ini.\n`;
    }

    message += `\nDihantar melalui Portal Ibu Bapa EduQuest.`;

    const url = cleanPhone.length >= 9
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Simple, calm top bar — no gamified nav for parents */}
      <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur border-b border-sand-200 px-4 sm:px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-sage-500 flex items-center justify-center shrink-0">
              <Heart className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="text-sm font-display font-bold text-ink-900 block leading-tight">EduQuest</span>
              <span className="text-[11px] text-ink-500 font-semibold">Portal Ibu Bapa</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-ink-500 border border-sand-200 transition-colors"
              title={isDarkMode ? 'Tukar ke Mod Cerah' : 'Tukar ke Mod Gelap'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-honey-400" /> : <Moon className="w-4 h-4 text-mist-500" />}
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onLogout();
              }}
              className="p-2.5 rounded-xl bg-cream-100 hover:bg-clay-100 hover:text-clay-500 text-ink-500 border border-sand-200 transition-colors"
              title="Log Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-14">
        {/* Greeting */}
        <div className="rounded-3xl bg-sage-100 border border-sage-200 p-6 sm:p-7 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cream-50 border border-sage-200 flex items-center justify-center text-sage-600 shrink-0">
            <Heart className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-display font-bold text-ink-900">
              Selamat Datang, {user.name.split(' ')[0]}.
            </h1>
            <p className="text-sm text-ink-700 mt-0.5">
              Pantau perkembangan prestasi {currentChild ? currentChild.name.split(' ')[0] : 'anak anda'} hari ini.
            </p>
          </div>
        </div>

        {/* Account linking — shown prominently when no child yet, else tucked behind a toggle */}
        {(!currentChild || showLinkManager) && (
          <div className="space-y-4">
            <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-3">
              <h3 className="text-sm font-display font-bold text-ink-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-mist-500" />
                <span>Semak Rekod Mengikut No. Telefon</span>
              </h3>
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-mist-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Contoh: 0123456789"
                    className="w-full pl-10 pr-4 py-2.5 bg-cream-100 border border-sand-300 focus:border-mist-400 text-ink-900 rounded-xl text-sm outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-mist-500 hover:bg-mist-600 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shrink-0"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Semak</span>
                </button>
              </form>
              <button
                onClick={handleLoadDemoData}
                className="text-xs text-mist-600 hover:text-mist-700 font-semibold underline decoration-mist-300"
              >
                Lihat Akaun Demo
              </button>
            </div>

            <ObserverLinkPanel user={user} onLinkSuccess={() => activePhone.trim() && loadData(activePhone)} />
          </div>
        )}

        {/* Empty state */}
        {hasSearched && children.length === 0 && !loading && (
          <div className="text-center py-12 bg-cream-50 border border-dashed border-sand-300 rounded-3xl p-6 space-y-4">
            <div className="w-16 h-16 bg-cream-200 text-ink-500 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-display font-bold text-ink-900">Tiada Rekod Anak Dijumpai</h3>
              <p className="text-xs text-ink-500 max-w-md mx-auto">
                Pastikan anak anda mendaftar dengan nombor telefon yang sama, atau gunakan Kod Jemputan pelajar di atas.
              </p>
            </div>
          </div>
        )}

        {/* Child switcher + link-manager toggle */}
        {currentChild && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {children.length > 1 ? (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sage-600" />
                <select
                  value={selectedChildId}
                  onChange={(e) => {
                    soundManager.playClick();
                    setSelectedChildId(e.target.value);
                  }}
                  className="bg-cream-50 border border-sand-300 text-ink-900 text-sm font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-sage-400"
                >
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name} — Level {child.level}
                    </option>
                  ))}
                </select>
              </div>
            ) : <div />}

            <button
              onClick={() => setShowLinkManager((v) => !v)}
              className="text-xs font-semibold text-ink-500 hover:text-ink-700 flex items-center gap-1.5"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Urus Pautan Akaun</span>
            </button>
          </div>
        )}

        {currentChild && (
          <div className="space-y-6">
            {/* SECTION 1 — Dashboard Keputusan Keseluruhan */}
            <section className="space-y-4">
              <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-mist-500 flex items-center justify-center text-white text-xl font-display font-bold shrink-0">
                    {currentChild.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-ink-900">{currentChild.name}</h2>
                    <div className="flex items-center gap-3 text-xs text-ink-500 mt-1 font-semibold">
                      <span>Level {currentChild.level} ({currentChild.xp} XP)</span>
                      <span>•</span>
                      <span>Streak {currentChild.streak_days || 1} Hari</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto border-t md:border-t-0 border-sand-200 pt-3 md:pt-0">
                  <div className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 ${gradeBadgeColor}`}>
                    <Trophy className="w-4 h-4 shrink-0" />
                    <span>{gradeBadgeTitle}</span>
                  </div>
                  <button
                    onClick={handleSendWhatsAppReport}
                    className="py-2 px-4 bg-sage-500 hover:bg-sage-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Hantar Laporan WhatsApp</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-cream-50 border border-sand-200 rounded-2xl p-4 text-center">
                  <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wide block">Purata Skor</span>
                  <span className="text-2xl font-display font-bold text-sage-600 mt-1 block">{overallAvgPercent}%</span>
                  <span className="text-[10px] text-ink-500 mt-0.5 block">{totalScoreSum}/{totalQuestionSum} Soalan Betul</span>
                </div>
                <div className="bg-cream-50 border border-sand-200 rounded-2xl p-4 text-center">
                  <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wide block">Bahagian Selesai</span>
                  <span className="text-2xl font-display font-bold text-mist-600 mt-1 block">{totalAnsweredSections}</span>
                  <span className="text-[10px] text-ink-500 mt-0.5 block">Kertas Latihan</span>
                </div>
                <div className="bg-cream-50 border border-sand-200 rounded-2xl p-4 text-center">
                  <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wide block">Jumlah Percubaan</span>
                  <span className="text-2xl font-display font-bold text-honey-500 mt-1 block">{currentAttempts.length}</span>
                  <span className="text-[10px] text-ink-500 mt-0.5 block">Sesi Ujian</span>
                </div>
              </div>
            </section>

            {/* SECTION 2 — Analisis Pencapaian & Graf Prestasi */}
            <section className="space-y-4">
              <div className="bg-honey-100/60 border border-honey-200 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-honey-500 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h3>Analisis &amp; Nasihat Bimbingan</h3>
                </div>

                {allWeakSectionsInfo.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-ink-700 leading-relaxed">
                      Anak anda memerlukan latihan tambahan bagi tajuk berikut (markah di bawah 60%):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {allWeakSectionsInfo.map((w, idx) => (
                        <div key={idx} className="bg-cream-50 border border-honey-200 rounded-xl p-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-ink-900 block">{w.subjectName}</span>
                            <span className="text-ink-500 text-[11px] block">{w.paperTitle} - {w.sectionTitle}</span>
                          </div>
                          <span className="px-2.5 py-1 bg-honey-100 text-honey-500 rounded-lg font-bold text-xs shrink-0">
                            {w.scorePercent}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : totalAnsweredSections > 0 ? (
                  <div className="flex items-start gap-3 bg-sage-100 rounded-2xl p-4 text-xs text-ink-700">
                    <CheckCircle2 className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sage-600 text-sm block mb-1">Syabas! Tiada Kelemahan Ketara</strong>
                      <span>Anak anda mencapai prestasi baik (&gt;60%) dalam semua tajuk yang dijawab setakat ini.</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-ink-500 italic">
                    Anak anda belum menjawab mana-mana latihan lagi.
                  </div>
                )}
              </div>

              <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-sand-200 pb-3">
                  <h3 className="text-sm font-display font-bold text-ink-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-mist-500" />
                    <span>Prestasi Mengikut Subjek</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subjectAnalytics.map((sa) => {
                    const isAnswered = sa.avgPercent !== null;
                    let barColor = 'bg-sand-300';
                    let textColor = 'text-ink-500';
                    if (isAnswered) {
                      if (sa.avgPercent! >= 80) { barColor = 'bg-sage-500'; textColor = 'text-sage-600'; }
                      else if (sa.avgPercent! >= 60) { barColor = 'bg-mist-500'; textColor = 'text-mist-600'; }
                      else { barColor = 'bg-honey-400'; textColor = 'text-honey-500'; }
                    }

                    return (
                      <div key={sa.subject.id} className="bg-cream-100 border border-sand-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-ink-900">{sa.subject.name}</span>
                          <span className={`font-bold text-sm ${textColor}`}>
                            {isAnswered ? `${sa.avgPercent}%` : 'Belum Dijawab'}
                          </span>
                        </div>
                        <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${isAnswered ? sa.avgPercent : 0}%` }} />
                        </div>
                        <div className="text-[11px] text-ink-500">
                          {sa.answeredCount} daripada {sa.totalSections} bahagian dijawab
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* SECTION 3 — Rekod Sejarah Aktiviti */}
            <section className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-sand-200 pb-3">
                <h3 className="text-sm font-display font-bold text-ink-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-mist-500" />
                  <span>Sejarah Latihan Terkini</span>
                </h3>
                <span className="text-xs text-ink-500 font-semibold">{currentAttempts.length} Percubaan</span>
              </div>

              {currentAttempts.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {currentAttempts.slice().reverse().map((att) => {
                    const sec = sections.find((s) => s.id === att.section_id);
                    const paper = sec ? papers.find((p) => p.id === sec.paper_id) : null;
                    const sub = paper ? subjects.find((s) => s.id === paper.subject_id) : null;
                    const percent = Math.round((att.score / att.total_question) * 100);
                    const resultBadge = percent < 60 ? 'bg-clay-100 text-clay-500' : 'bg-sage-100 text-sage-600';

                    return (
                      <div key={att.id} className="bg-cream-100 border border-sand-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ink-900">{sub?.name || 'Mata Pelajaran'}</span>
                            <span className="text-ink-300">•</span>
                            <span className="text-ink-700">{paper?.title} ({sec?.title})</span>
                          </div>
                          <span className="text-[10px] text-ink-500 block mt-0.5">
                            {new Date(att.completed_at || att.started_at).toLocaleString('ms-MY')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-ink-500 font-mono hidden xs:inline">{att.score}/{att.total_question}</span>
                          <span className={`px-2.5 py-1 rounded-lg font-bold ${resultBadge}`}>{percent}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-ink-500">Belum ada sesi latihan direkodkan.</div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

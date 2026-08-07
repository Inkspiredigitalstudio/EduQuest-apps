import React, { useState, useEffect } from 'react';
import { UserProfile, UserAttempt, UserProgress, Subject, Paper, Section } from '../../types';
import { fetchParentChildrenData } from '../../lib/supabase';
import { soundManager } from '../../lib/audio';
import {
  Users,
  Phone,
  Search,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Calendar,
  Send,
  X,
  RefreshCw,
  Sparkles,
  Heart,
} from 'lucide-react';

interface ParentDashboardProps {
  isOpen: boolean;
  subjects: Subject[];
  papers: Paper[];
  sections: Section[];
  onClose: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  isOpen,
  subjects,
  papers,
  sections,
  onClose,
}) => {
  const [phoneInput, setPhoneInput] = useState<string>(() => {
    return localStorage.getItem('sppim_parent_phone') || '';
  });
  const [activePhone, setActivePhone] = useState<string>(() => {
    return localStorage.getItem('sppim_parent_phone') || '';
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [children, setChildren] = useState<UserProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [attemptsMap, setAttemptsMap] = useState<Record<string, UserAttempt[]>>({});
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress[]>>({});
  const [hasSearched, setHasSearched] = useState<boolean>(false);

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
      {
        id: 'att-1',
        user_id: demoChild.id,
        section_id: 'sec-fekah-2024-A',
        score: 9,
        total_question: 10,
        coins_earned: 50,
        xp_earned: 90,
        started_at: new Date(Date.now() - 86400000).toISOString(),
        completed_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'att-2',
        user_id: demoChild.id,
        section_id: 'sec-fekah-2024-C1',
        score: 2,
        total_question: 5,
        coins_earned: 10,
        xp_earned: 20,
        started_at: new Date(Date.now() - 43200000).toISOString(),
        completed_at: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        id: 'att-3',
        user_id: demoChild.id,
        section_id: 'sec-akidah-2024-A',
        score: 8,
        total_question: 10,
        coins_earned: 40,
        xp_earned: 80,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      },
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

  if (!isOpen) return null;

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
  let gradeBadgeColor = 'bg-slate-700 text-slate-300';

  if (totalAnsweredSections > 0) {
    if (overallAvgPercent >= 85) {
      gradeBadgeTitle = 'MAMTAZ (Sangat Cemerlang) 🌟';
      gradeBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    } else if (overallAvgPercent >= 70) {
      gradeBadgeTitle = 'JAYYID JIDDAN (Cemerlang) ✨';
      gradeBadgeColor = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    } else if (overallAvgPercent >= 50) {
      gradeBadgeTitle = 'JAYYID (Memuaskan) 👍';
      gradeBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    } else {
      gradeBadgeTitle = 'PERLU LEBIH BIMBINGAN 💪';
      gradeBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
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
      const secPercent = (p.best_score / p.total_questions) * 100;
      return secPercent < 60;
    });

    const masteredSections = subSections.filter((sec) => {
      const p = currentProgress.find((prog) => prog.section_id === sec.id);
      if (!p || p.total_questions === 0) return false;
      const secPercent = (p.best_score / p.total_questions) * 100;
      return secPercent >= 80;
    });

    return {
      subject: sub,
      totalSections: subSections.length,
      answeredCount: answeredSubProgress.length,
      avgPercent: subPercent,
      weakSections,
      masteredSections,
    };
  });

  const allWeakSectionsInfo = subjectAnalytics.flatMap((sa) =>
    sa.weakSections.map((sec) => {
      const paper = papers.find((p) => p.id === sec.paper_id);
      const prog = currentProgress.find((p) => p.section_id === sec.id);
      const scoreP = prog ? Math.round((prog.best_score / prog.total_questions) * 100) : 0;
      return {
        sectionTitle: sec.title,
        paperTitle: paper?.title || '',
        subjectName: sa.subject.name,
        scorePercent: scoreP,
      };
    })
  );

  const handleSendWhatsAppReport = () => {
    soundManager.playClick();
    if (!currentChild) return;

    let cleanPhone = activePhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '6' + cleanPhone;
    }

    const dateStr = new Date().toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    let message = `Assalamu'alaikum & Salam Sejahtera Ibu/Bapa 🤲\n\n`;
    message += `*LAPORAN PRESTASI KESELURUHAN PELAJAR (EDUQUEST)*\n`;
    message += `───────────────────────────────\n`;
    message += `👤 *Nama Anak:* ${currentChild.name}\n`;
    message += `🆔 *ID Login:* ${currentChild.login_id}\n`;
    message += `⭐ *Tahap / Level:* Level ${currentChild.level} (${currentChild.xp} XP)\n`;
    message += `📊 *Purata Skor Keseluruhan:* ${overallAvgPercent}%\n`;
    message += `🏆 *Gred Pencapaian:* ${gradeBadgeTitle}\n`;
    message += `📝 *Bahagian Dijawab:* ${totalAnsweredSections} Bahagian\n`;
    message += `📅 *Tarikh Laporan:* ${dateStr}\n\n`;

    if (allWeakSectionsInfo.length > 0) {
      message += `⚠️ *TAJUK MEMERLUKAN ULANG KAJI & ATTENTION:*\n`;
      allWeakSectionsInfo.forEach((w) => {
        message += `• ${w.subjectName} (${w.paperTitle}): ${w.sectionTitle} - *${w.scorePercent}%*\n`;
      });
      message += `\n*Nasihat Ibu Bapa:* Mohon galakkan anak anda membuat latihan semula bagi tajuk-tajuk di atas.\n`;
    } else {
      message += `✅ *STATUS:* Prestasi cemerlang! Anak anda menguasai latihan yang telah dijawab sejauh ini.\n`;
    }

    message += `\n_Dihantar melalui Portal Ibu Bapa EduQuest._`;

    const url = cleanPhone.length >= 9
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-4 sm:p-6 border-b border-emerald-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
              <Heart className="w-6 h-6 fill-emerald-500/30" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">Dashboard Ibu Bapa</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  PEMANTAUAN PRESTASI
                </span>
              </div>
              <p className="text-xs text-emerald-300/80">Pantau markah, perkembangan dan tajuk yang perlu bantuan anak anda.</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Phone Login Bar */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearch} className="flex-1 w-full flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Masukkan No. Telefon Ibu Bapa (Contoh: 0123456789)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-emerald-400 text-white rounded-xl text-sm outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-emerald-500/20"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Semak Rekod Anak</span>
              </button>
            </form>

            <button
              onClick={handleLoadDemoData}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold underline decoration-sky-400/50 hover:decoration-sky-300 shrink-0"
            >
              Lihat Akaun Demo
            </button>
          </div>

          {/* Child Selection Dropdown */}
          {children.length > 1 && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-emerald-300 font-bold">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Dijumpai {children.length} Anak Berdaftar dengan Nombor Ini:</span>
              </div>

              <select
                value={selectedChildId}
                onChange={(e) => {
                  soundManager.playClick();
                  setSelectedChildId(e.target.value);
                }}
                className="bg-slate-900 border border-emerald-500/50 text-white text-sm font-semibold rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-400 w-full sm:w-auto"
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    👤 {child.name} (ID: {child.login_id}) — Level {child.level}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Empty State */}
          {hasSearched && children.length === 0 && !loading && (
            <div className="text-center py-12 bg-slate-950/60 border border-dashed border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="w-16 h-16 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Tiada Rekod Anak Dijumpai</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Sila pastikan anak anda telah memasukkan nombor telefon ibu bapa ({activePhone}) semasa mendaftar akaun pelajar.
                </p>
              </div>
              <button
                onClick={handleLoadDemoData}
                className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-4 py-2 rounded-xl hover:bg-emerald-500/30 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Cuba Akaun Demo (Ahmad Zaki)</span>
              </button>
            </div>
          )}

          {/* Child Active Dashboard Summary */}
          {currentChild && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white text-xl font-black shadow-md shrink-0">
                    {currentChild.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-white">{currentChild.name}</h2>
                      <span className="text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                        ID: {currentChild.login_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>Level {currentChild.level} ({currentChild.xp} XP)</span>
                      <span>•</span>
                      <span>{currentChild.coin} Koin</span>
                      <span>•</span>
                      <span>Streak {currentChild.streak_days || 1} Hari</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                  <div className={`px-4 py-2 rounded-2xl border ${gradeBadgeColor} font-bold text-xs flex items-center gap-2`}>
                    <Trophy className="w-4 h-4 shrink-0" />
                    <span>{gradeBadgeTitle}</span>
                  </div>

                  <button
                    onClick={handleSendWhatsAppReport}
                    className="py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Hantar Laporan WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* 4 Metric Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Purata Skor</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block">{overallAvgPercent}%</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{totalScoreSum}/{totalQuestionSum} Soalan Betul</span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Bahagian Selesai</span>
                  <span className="text-2xl font-black text-sky-400 mt-1 block">{totalAnsweredSections}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Kertas Latihan</span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Jumlah Percubaan</span>
                  <span className="text-2xl font-black text-indigo-400 mt-1 block">{currentAttempts.length}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Sesi Ujian Dijawab</span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Peringkat Pembelajaran</span>
                  <span className="text-2xl font-black text-amber-400 mt-1 block">Level {currentChild.level}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{currentChild.xp} Total XP</span>
                </div>
              </div>

              {/* Weakness & Recommendation Advice Box */}
              <div className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-5 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h3>Analisis & Nasihat Bimbingan Ibu Bapa</h3>
                </div>

                {allWeakSectionsInfo.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Berdasarkan rekod latihan terkini, anak anda memerlukan <strong className="text-amber-300">bimbingan dan latihan tambahan</strong> bagi tajuk-tajuk berikut (Markah di bawah 60%):
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {allWeakSectionsInfo.map((w, idx) => (
                        <div key={idx} className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-amber-300 block">{w.subjectName}</span>
                            <span className="text-slate-400 text-[11px] block">{w.paperTitle} - {w.sectionTitle}</span>
                          </div>
                          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg font-bold text-xs shrink-0">
                            {w.scorePercent}%
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-200/90 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Saranan untuk Ibu Bapa:</strong> Minta anak anda mengulang semula soalan latihan bagi tajuk terbabit melalui butang &quot;Cuba Lagi&quot; dalam aplikasi untuk mengukuhkan kefahaman.
                      </span>
                    </div>
                  </div>
                ) : totalAnsweredSections > 0 ? (
                  <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-xs text-emerald-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-300 text-sm block mb-1">Syabas! Tiada Kelemahan Ketara Dijumpai</strong>
                      <span>Anak anda berjaya mencapai prestasi yang baik (&gt;60%) dalam semua tajuk yang telah dijawab sejauh ini. Galakkan anak anda meneruskan latihan bagi kertas-kertas lain!</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">
                    Anak anda belum menjawab mana-mana latihan lagi. Keputusan latihan akan dipaparkan di sini secara automatik sebaik sahaja anak mula menjawab.
                  </div>
                )}
              </div>

              {/* Subject Breakdown Performance */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>Analisis Prestasi Mengikut Subjek</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">6 Subjek SPPIM</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subjectAnalytics.map((sa) => {
                    const isAnswered = sa.avgPercent !== null;
                    let progressColor = 'bg-slate-700';
                    let textColor = 'text-slate-400';

                    if (isAnswered) {
                      if (sa.avgPercent! >= 80) {
                        progressColor = 'bg-emerald-500';
                        textColor = 'text-emerald-400';
                      } else if (sa.avgPercent! >= 60) {
                        progressColor = 'bg-sky-500';
                        textColor = 'text-sky-400';
                      } else {
                        progressColor = 'bg-amber-500';
                        textColor = 'text-amber-400';
                      }
                    }

                    return (
                      <div key={sa.subject.id} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{sa.subject.icon}</span>
                            <span className="font-bold text-sm text-white">{sa.subject.name}</span>
                          </div>
                          <span className={`font-black text-sm ${textColor}`}>
                            {isAnswered ? `${sa.avgPercent}%` : 'Belum Dijawab'}
                          </span>
                        </div>

                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                            style={{ width: `${isAnswered ? sa.avgPercent : 0}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>{sa.answeredCount} daripada {sa.totalSections} Bahagian Dijawab</span>
                          {sa.weakSections.length > 0 && (
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              ⚠️ {sa.weakSections.length} Perlu Ulang Kaji
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* History of Attempts */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>Sejarah Latihan Terkini</span>
                  </h3>
                  <span className="text-xs text-slate-400">{currentAttempts.length} Percubaan Diterekodkan</span>
                </div>

                {currentAttempts.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {currentAttempts.slice().reverse().map((att) => {
                      const sec = sections.find((s) => s.id === att.section_id);
                      const paper = sec ? papers.find((p) => p.id === sec.paper_id) : null;
                      const sub = paper ? subjects.find((s) => s.id === paper.subject_id) : null;
                      const percent = Math.round((att.score / att.total_question) * 100);

                      let resultBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                      if (percent < 60) resultBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40';

                      return (
                        <div key={att.id} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{sub?.name || 'Mata Pelajaran'}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-300">{paper?.title} ({sec?.title})</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              {new Date(att.completed_at || att.started_at).toLocaleString('ms-MY')}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-slate-400 font-mono hidden xs:inline">{att.score}/{att.total_question} Betul</span>
                            <span className={`px-2.5 py-1 rounded-lg border font-bold ${resultBadge}`}>
                              {percent}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500">
                    Belum ada sesi latihan direkodkan.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

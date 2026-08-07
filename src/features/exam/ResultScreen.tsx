import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Section, Question, UserProfile, Subject, Paper, UserProgress } from '../../types';
import { soundManager } from '../../lib/audio';
import { Trophy, Coins, Award, CheckCircle2, XCircle, RotateCcw, Home, BookOpen, Send, Phone, MessageSquare, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface ResultScreenProps {
  section: Section;
  questions: Question[];
  score: number;
  total: number;
  coinsEarned: number;
  xpEarned: number;
  answersMap: Record<string, string>;
  user?: UserProfile | null;
  subject?: Subject | null;
  paper?: Paper | null;
  allSections?: Section[];
  userProgress?: UserProgress[];
  onRetry: () => void;
  onGoDashboard: () => void;
  onGoBackToSubject: () => void;
  onNextSection?: (nextSection: Section) => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  section,
  questions,
  score,
  total,
  coinsEarned,
  xpEarned,
  answersMap,
  user,
  subject,
  paper,
  allSections = [],
  userProgress = [],
  onRetry,
  onGoDashboard,
  onGoBackToSubject,
  onNextSection,
}) => {
  const percentage = Math.round((score / total) * 100);
  const [parentPhone, setParentPhone] = useState<string>(() => {
    return localStorage.getItem('sppim_parent_phone') || user?.phone || '';
  });
  const [showPreview, setShowPreview] = useState<boolean>(false);

  useEffect(() => {
    soundManager.playLevelUp();
    try {
      // Stage 1: Central Explosion
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#fbbf24'],
      });

      // Stage 2: Realistic Multi-Shot Bursts
      const count = 180;
      const defaults = {
        origin: { y: 0.7 },
        colors: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#f59e0b'],
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });

      // Stage 3: Side Cannon Shots after 400ms
      const timer1 = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.7 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#fbbf24'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.7 },
          colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#fbbf24'],
        });
      }, 400);

      // Stage 4: Finale Stars/Rain for perfect scores after 800ms
      const timer2 = setTimeout(() => {
        if (percentage >= 80) {
          confetti({
            particleCount: 40,
            spread: 100,
            origin: { y: 0.4 },
            ticks: 200,
            gravity: 0.8,
            colors: ['#ffd700', '#ffae00', '#ffffff'],
          });
        }
      }, 800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } catch {
      // Ignore confetti errors
    }
  }, [percentage]);

  const handlePhoneChange = (val: string) => {
    setParentPhone(val);
    localStorage.setItem('sppim_parent_phone', val);
  };

  const paperSections = paper
    ? allSections.filter((s) => s.paper_id === paper.id)
    : [];

  const currentIndex = paperSections.findIndex((s) => s.id === section.id);

  let nextSection: Section | null = null;

  if (currentIndex !== -1 && currentIndex < paperSections.length - 1) {
    nextSection = paperSections[currentIndex + 1];
  } else if (paperSections.length > 0) {
    const uncompleted = paperSections.find((s) => {
      if (s.id === section.id) return false;
      const prog = userProgress.find((p) => p.section_id === s.id);
      return !prog?.is_completed;
    });
    if (uncompleted) {
      nextSection = uncompleted;
    }
  }

  const isAllPaperSectionsCompleted =
    paperSections.length > 0 &&
    paperSections.every((s) => {
      if (s.id === section.id) return true;
      const prog = userProgress.find((p) => p.section_id === s.id);
      return prog?.is_completed;
    });

  let resultTitle = 'Syabas & Tahniah!';
  let resultSubtitle = 'Anda telah berjaya menyelesaikan Bahagian ini dengan cemerlang!';
  let badgeColor = 'from-emerald-500 to-teal-600';
  let gradeBadge = 'JAYYID (Lulus) 👍';

  if (percentage < 50) {
    resultTitle = 'Usaha Yang Bagus!';
    resultSubtitle = 'Teruskan latihan untuk mengukuhkan kefahaman Fekah & Akhlak anda.';
    badgeColor = 'from-amber-500 to-orange-600';
    gradeBadge = 'PERLU TINGKATKAN USAHA 💪';
  } else if (percentage >= 80 && percentage < 100) {
    gradeBadge = 'JAYYID JIDDAN (Cemerlang) ✨';
  } else if (percentage === 100) {
    resultTitle = 'MUMTAZ! (100% Cemerlang)';
    resultSubtitle = 'Pencapaian sempurna! Anda telah menguasai soalan tajuk ini sepenuhnya!';
    badgeColor = 'from-yellow-400 via-amber-500 to-orange-500';
    gradeBadge = 'MUMTAZ (Sempurna) 🌟';
  }

  const studentName = user?.name || 'Pelajar';
  const subjectTitle = subject?.title || 'Latihan EduQuest';
  const paperTitle = paper?.title || '';
  const dateFormatted = new Date().toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const waMessage = `Hi! Sikit update — ${studentName} baru habis latihan ${subjectTitle}, skor ${score}/${total}. Jangan lupa pujian & reward untuk usaha dia ya 😍

Untuk lihat progress ${studentName} , boleh ke EduQuest App.`;

  const handleSendWhatsApp = () => {
    soundManager.playClick();
    let cleanPhone = parentPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '6' + cleanPhone;
    }

    let url = '';
    if (cleanPhone.length >= 9) {
      url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
    } else {
      url = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;
    }

    window.open(url, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Banner Celebration */}
      <div className={`rounded-3xl bg-gradient-to-r ${badgeColor} p-6 sm:p-8 text-white text-center shadow-2xl relative overflow-hidden space-y-3`}>
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center mx-auto shadow-lg">
          <Trophy className="w-8 h-8 text-yellow-200 animate-bounce" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black">{resultTitle}</h1>
        <p className="text-xs sm:text-sm text-white/90 max-w-lg mx-auto">{resultSubtitle}</p>

        {/* Score Ring Display */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur border border-white/20 px-6 py-2.5 rounded-full font-black text-2xl text-yellow-300">
            <span>{score} / {total} Soalan Betul ({percentage}%)</span>
          </div>
        </div>
      </div>

      {/* Reward Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-bold">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Ganjaran Koin</span>
          </div>
          <div className="text-2xl font-black text-amber-400">+{coinsEarned} Koin</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-bold">
            <Award className="w-4 h-4 text-indigo-400" />
            <span>Mata Pengalaman</span>
          </div>
          <div className="text-2xl font-black text-indigo-400">+{xpEarned} XP</div>
        </div>
      </div>

      {/* WhatsApp Share Card for Parents */}
      <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/40 border border-emerald-500/40 rounded-3xl p-5 shadow-xl relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Hantar Laporan Keputusan Ke WhatsApp Ibu Bapa
              </h2>
              <p className="text-xs text-emerald-300/80">
                Kongsikan pencapaian Markah ({score}/{total} - {percentage}%) kepada ibu bapa secara terus.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 self-start sm:self-center bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors"
          >
            <span>{showPreview ? 'Sembunyi Mesej' : 'Lihat Draf Mesej'}</span>
            {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="sm:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4 text-emerald-400" />
            </div>
            <input
              type="tel"
              value={parentPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="Nombor WhatsApp Ibu Bapa (Contoh: 0123456789)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-emerald-500/30 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          <button
            onClick={handleSendWhatsApp}
            className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-sm flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 fill-slate-950" />
            <span>Hantar via WhatsApp</span>
          </button>
        </div>

        {showPreview && (
          <div className="bg-slate-950/90 border border-emerald-500/20 rounded-2xl p-4 text-xs font-mono text-emerald-300/90 leading-relaxed whitespace-pre-wrap select-all">
            <div className="text-slate-400 font-sans font-bold mb-1 uppercase tracking-wider text-[10px]">
              Draf Mesej WhatsApp:
            </div>
            {waMessage}
          </div>
        )}
      </div>

      {/* Question & Answer Review Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Semakan Jawapan & Penerangan Hukum</span>
          </h2>
          <span className="text-xs text-slate-400">{questions.length} Soalan</span>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const userChoiceId = answersMap[q.id];
            const correctChoice = q.choices.find((c) => c.is_correct);
            const userChoice = q.choices.find((c) => c.id === userChoiceId);
            const isUserCorrect = userChoice?.is_correct || false;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-2xl border ${
                  isUserCorrect
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-red-950/20 border-red-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-bold text-white">
                    {idx + 1}. {q.question_text}
                  </h3>
                  {isUserCorrect ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Betul
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 rounded-full shrink-0">
                      <XCircle className="w-3.5 h-3.5" /> Salah
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-1 my-2 font-medium">
                  {!isUserCorrect && userChoice && (
                    <div className="text-red-400">
                      <span>Jawapan Anda: </span>
                      <span className="font-bold">{userChoice.option_text}</span>
                    </div>
                  )}
                  <div className="text-emerald-400">
                    <span>Jawapan Betul: </span>
                    <span className="font-bold">{correctChoice?.option_text}</span>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl text-xs text-slate-300 mt-2 border border-slate-700/60 leading-relaxed">
                  <span className="font-bold text-sky-400">Nota Penerangan: </span>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Banner Alert */}
      {isAllPaperSectionsCompleted && (
        <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-3xl p-5 text-center space-y-1.5 shadow-xl">
          <div className="flex items-center justify-center gap-2 text-emerald-300 font-black text-base sm:text-lg">
            <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
            <span>Syabas! Semua Bahagian Kertas Ini Telah Selesai!</span>
          </div>
          <p className="text-xs text-slate-300 max-w-lg mx-auto">
            Anda telah berjaya menjawab kesemua Bahagian (A, B, C) untuk {paper?.title || 'kertas ini'}. Tekan butang &quot;Teruskan&quot; di bawah untuk kembali ke Menu Utama.
          </p>
        </div>
      )}

      {/* Primary Navigation Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Pilihan Navigasi Seterusnya</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Kertas: {paper?.title || 'Latihan'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            onClick={() => {
              soundManager.playClick();
              onGoBackToSubject();
            }}
            className="py-4 px-5 bg-slate-800 hover:bg-slate-700/90 border border-slate-700 hover:border-slate-500 text-white font-extrabold rounded-2xl transition-all text-sm flex items-center justify-between gap-3 group shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-700/80 group-hover:bg-slate-600 flex items-center justify-center text-slate-300 transition-colors shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-[11px] text-slate-400 font-medium uppercase tracking-wider">Ke Pilihan Tahun</span>
                <span className="block text-sm font-bold text-white">Kembali Ke Subjek</span>
              </div>
            </div>
            <span className="text-[10px] bg-slate-700/90 px-2 py-1 rounded-lg text-slate-300 font-mono hidden xs:inline shrink-0">
              {subject?.name || 'Subjek'}
            </span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              if (nextSection && onNextSection) {
                onNextSection(nextSection);
              } else {
                onGoDashboard();
              }
            }}
            className="py-4 px-5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black rounded-2xl transition-all text-sm flex items-center justify-between gap-3 shadow-lg shadow-emerald-500/25 group"
          >
            <div className="text-left">
              <span className="block text-[10px] text-slate-900/80 uppercase tracking-wider font-extrabold">
                {nextSection ? 'Ujian Seterusnya' : 'Semua Bahagian Selesai'}
              </span>
              <span className="block text-sm font-black text-slate-950">
                {nextSection
                  ? `Teruskan (${nextSection.title.includes('Bahagian') ? nextSection.title : `Bahagian ${nextSection.name}`})`
                  : 'Teruskan Ke Menu Utama 🚀'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-950/20 flex items-center justify-center text-slate-950 group-hover:translate-x-1 transition-transform shrink-0">
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => {
              soundManager.playClick();
              onRetry();
            }}
            className="text-slate-400 hover:text-white font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
            <span>Cuba Bahagian Ini Semula</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onGoDashboard();
            }}
            className="text-slate-400 hover:text-white font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-sky-400" />
            <span>Ke Menu Utama (Dashboard)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

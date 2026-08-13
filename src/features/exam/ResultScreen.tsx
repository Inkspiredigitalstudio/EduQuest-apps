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
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4A857', '#799C61', '#5D8CBB', '#AC6650', '#93B67C', '#E2C384'],
      });

      const count = 180;
      const defaults = {
        origin: { y: 0.7 },
        colors: ['#E2C384', '#93B67C', '#82AAD0', '#C6836C', '#5D8CBB', '#D4A857'],
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });

      const timer1 = setTimeout(() => {
        confetti({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: ['#D4A857', '#799C61', '#5D8CBB', '#E2C384'] });
        confetti({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: ['#D4A857', '#C6836C', '#93B67C', '#E2C384'] });
      }, 400);

      const timer2 = setTimeout(() => {
        if (percentage >= 80) {
          confetti({ particleCount: 40, spread: 100, origin: { y: 0.4 }, ticks: 200, gravity: 0.8, colors: ['#D4A857', '#E2C384', '#ffffff'] });
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

  const paperSections = paper ? allSections.filter((s) => s.paper_id === paper.id) : [];
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
    if (uncompleted) nextSection = uncompleted;
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
  let badgeColor = 'from-sage-400 to-sage-500';
  let gradeBadge = 'JAYYID (Lulus) 👍';

  if (percentage < 50) {
    resultTitle = 'Usaha Yang Bagus!';
    resultSubtitle = 'Teruskan latihan untuk mengukuhkan kefahaman Fekah & Akhlak anda.';
    badgeColor = 'from-honey-400 to-honey-500';
    gradeBadge = 'PERLU TINGKATKAN USAHA 💪';
  } else if (percentage >= 80 && percentage < 100) {
    gradeBadge = 'JAYYID JIDDAN (Cemerlang) ✨';
  } else if (percentage === 100) {
    resultTitle = 'MUMTAZ! (100% Cemerlang)';
    resultSubtitle = 'Pencapaian sempurna! Anda telah menguasai soalan tajuk ini sepenuhnya!';
    badgeColor = 'from-honey-300 via-honey-400 to-honey-500';
    gradeBadge = 'MUMTAZ (Sempurna) 🌟';
  }

  const studentName = user?.name || 'Pelajar';
  const subjectTitle = subject?.title || 'Latihan EduQuest';

  const waMessage = `Hi! Sikit update — ${studentName} baru habis latihan ${subjectTitle}, skor ${score}/${total}. Jangan lupa bagi pujian & reward untuk usaha dia ya 😍

Untuk tengok progress ${studentName} lagi lanjut, boleh ke EduQuest App.`;

  const handleSendWhatsApp = () => {
    soundManager.playClick();
    let cleanPhone = parentPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '6' + cleanPhone;

    const url = cleanPhone.length >= 9
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(waMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Banner Celebration */}
      <div className={`rounded-3xl bg-gradient-to-r ${badgeColor} p-6 sm:p-8 text-white text-center space-y-3`}>
        <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center mx-auto">
          <Trophy className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-display font-bold">{resultTitle}</h1>
        <p className="text-xs sm:text-sm text-white/90 max-w-lg mx-auto">{resultSubtitle}</p>

        <div className="pt-2">
          <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur px-6 py-2.5 rounded-full font-bold text-2xl">
            <span>{score} / {total} ({percentage}%)</span>
          </div>
        </div>
      </div>

      {/* Reward Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-cream-50 border border-sand-200 rounded-2xl p-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-ink-500 font-bold">
            <Coins className="w-4 h-4 text-honey-500" />
            <span>Ganjaran Koin</span>
          </div>
          <div className="text-2xl font-display font-bold text-honey-500">+{coinsEarned} Koin</div>
        </div>

        <div className="bg-cream-50 border border-sand-200 rounded-2xl p-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-ink-500 font-bold">
            <Award className="w-4 h-4 text-mist-600" />
            <span>Mata Pengalaman</span>
          </div>
          <div className="text-2xl font-display font-bold text-mist-600">+{xpEarned} XP</div>
        </div>
      </div>

      {/* WhatsApp Share Card for Parents */}
      <div className="bg-sage-100 border border-sage-200 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sage-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cream-50 flex items-center justify-center text-sage-600 shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-ink-900">Hantar Laporan Ke WhatsApp Ibu Bapa</h2>
              <p className="text-xs text-ink-700">
                Kongsikan pencapaian markah ({score}/{total} - {percentage}%) kepada ibu bapa secara terus.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-sage-600 hover:text-sage-700 font-semibold flex items-center gap-1 self-start sm:self-center bg-cream-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>{showPreview ? 'Sembunyi Mesej' : 'Lihat Draf Mesej'}</span>
            {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="sm:col-span-2 relative">
            <Phone className="w-4 h-4 text-sage-500 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="tel"
              value={parentPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="Nombor WhatsApp Ibu Bapa (Contoh: 0123456789)"
              className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-sage-300 rounded-xl text-sm text-ink-900 placeholder-ink-300 focus:outline-none focus:border-sage-500 transition-colors"
            />
          </div>

          <button
            onClick={handleSendWhatsApp}
            className="w-full py-2.5 px-4 bg-sage-500 hover:bg-sage-600 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Hantar via WhatsApp</span>
          </button>
        </div>

        {showPreview && (
          <div className="bg-cream-50 border border-sage-200 rounded-2xl p-4 text-xs font-mono text-ink-700 leading-relaxed whitespace-pre-wrap select-all">
            <div className="text-ink-500 font-sans font-bold mb-1 uppercase tracking-wide text-[10px]">Draf Mesej WhatsApp:</div>
            {waMessage}
          </div>
        )}
      </div>

      {/* Question & Answer Review Section */}
      <div className="bg-cream-50 border border-sand-200 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-sand-200 pb-3">
          <h2 className="text-base font-display font-bold text-ink-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-mist-500" />
            <span>Semakan Soalan Yang Tersilap</span>
          </h2>
          <span className="text-xs text-ink-500">{total - score} daripada {total} Soalan</span>
        </div>

        {(() => {
          const wrongQuestions = questions
            .map((q, idx) => ({ q, idx }))
            .filter(({ q }) => {
              const userChoice = q.choices.find((c) => c.id === answersMap[q.id]);
              return !userChoice?.is_correct;
            });

          if (wrongQuestions.length === 0) {
            return (
              <div className="flex items-center gap-3 bg-sage-100 border border-sage-200 rounded-2xl p-5 text-sm text-ink-700">
                <CheckCircle2 className="w-6 h-6 text-sage-600 shrink-0" />
                <span><strong className="text-sage-600">Sempurna!</strong> Semua soalan dijawab dengan betul — tiada yang perlu disemak semula.</span>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {wrongQuestions.map(({ q, idx }) => {
                const userChoiceId = answersMap[q.id];
                const correctChoice = q.choices.find((c) => c.is_correct);
                const userChoice = q.choices.find((c) => c.id === userChoiceId);

                return (
                  <div key={q.id} className="p-4 rounded-2xl border bg-clay-100 border-clay-200">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-sm font-bold text-ink-900 whitespace-pre-line">{idx + 1}. {q.question_text}</h3>
                      <span className="flex items-center gap-1 text-xs font-bold text-clay-500 bg-cream-50 px-2.5 py-0.5 rounded-full shrink-0">
                        <XCircle className="w-3.5 h-3.5" /> Salah
                      </span>
                    </div>

                    {q.image_url && (
                      <div className="rounded-xl overflow-hidden border border-sand-200 bg-cream-50 mb-2">
                        <img src={q.image_url} alt="Gambar soalan" className="w-full max-h-56 object-contain" />
                      </div>
                    )}

                    <div className="text-xs space-y-1 my-2 font-medium">
                      {userChoice && (
                        <div className="text-clay-500">
                          <span>Jawapan Anda: </span>
                          <span className="font-bold">{userChoice.option_text}</span>
                        </div>
                      )}
                      <div className="text-sage-600">
                        <span>Jawapan Betul: </span>
                        <span className="font-bold">{correctChoice?.option_text}</span>
                      </div>
                    </div>

                    <div className="bg-cream-50 p-3 rounded-xl text-xs text-ink-700 mt-2 border border-sand-200 leading-relaxed">
                      <span className="font-bold text-mist-600">Nota Penerangan: </span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Completion Banner Alert */}
      {isAllPaperSectionsCompleted && (
        <div className="bg-honey-100 border border-honey-200 rounded-3xl p-5 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-honey-500 font-bold text-base sm:text-lg">
            <Sparkles className="w-5 h-5" />
            <span>Syabas! Semua Bahagian Kertas Ini Telah Selesai!</span>
          </div>
          <p className="text-xs text-ink-700 max-w-lg mx-auto">
            Anda telah berjaya menjawab kesemua Bahagian untuk {paper?.title || 'kertas ini'}. Tekan butang &quot;Teruskan&quot; di bawah untuk kembali ke Menu Utama.
          </p>
        </div>
      )}

      {/* Primary Navigation Actions */}
      <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-sand-200 pb-3">
          <div className="text-xs font-bold text-ink-500 uppercase tracking-wide flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sage-500" />
            <span>Pilihan Navigasi Seterusnya</span>
          </div>
          <span className="text-[11px] text-ink-500 font-medium">Kertas: {paper?.title || 'Latihan'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            onClick={() => {
              soundManager.playClick();
              onGoBackToSubject();
            }}
            className="py-4 px-5 bg-cream-100 hover:bg-cream-200 border border-sand-200 text-ink-900 font-bold rounded-2xl transition-colors text-sm flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cream-200 flex items-center justify-center text-ink-700 shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-[11px] text-ink-500 font-medium uppercase tracking-wide">Ke Pilihan Tahun</span>
                <span className="block text-sm font-bold text-ink-900">Kembali Ke Subjek</span>
              </div>
            </div>
            <span className="text-[10px] bg-cream-200 px-2 py-1 rounded-lg text-ink-700 font-mono hidden xs:inline shrink-0">
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
            className="py-4 px-5 bg-sage-500 hover:bg-sage-600 text-white font-bold rounded-2xl transition-colors text-sm flex items-center justify-between gap-3 group"
          >
            <div className="text-left">
              <span className="block text-[10px] text-white/80 uppercase tracking-wide font-bold">
                {nextSection ? 'Ujian Seterusnya' : 'Semua Bahagian Selesai'}
              </span>
              <span className="block text-sm font-bold">
                {nextSection ? `Teruskan (${nextSection.title.includes('Bahagian') ? nextSection.title : `Bahagian ${nextSection.name}`})` : 'Teruskan Ke Menu Utama 🚀'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-sand-200 text-xs">
          <button
            onClick={() => {
              soundManager.playClick();
              onRetry();
            }}
            className="text-ink-500 hover:text-ink-900 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-cream-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-mist-500" />
            <span>Cuba Bahagian Ini Semula</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onGoDashboard();
            }}
            className="text-ink-500 hover:text-ink-900 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-cream-100 transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-mist-500" />
            <span>Ke Menu Utama (Dashboard)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

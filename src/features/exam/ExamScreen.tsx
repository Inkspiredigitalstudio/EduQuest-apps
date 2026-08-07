import React, { useState, useMemo } from 'react';
import { Section, Question, Choice, UserProfile } from '../../types';
import { soundManager } from '../../lib/audio';
import { ArrowLeft, CheckCircle2, XCircle, Flame, Coins, Sparkles, ArrowRight, BookOpen, Trophy } from 'lucide-react';

interface ExamScreenProps {
  section: Section;
  questions: Question[];
  user: UserProfile | null;
  onCompleteExam: (score: number, total: number, coinsEarned: number, xpEarned: number, answersMap: Record<string, string>) => void;
  onCancel: () => void;
}

function shuffleQuestionsChoices(questions: Question[]): Question[] {
  let consecutiveACount = 0;

  return questions.map((q) => {
    if (!q.choices || q.choices.length <= 1) return q;

    const correctChoice = q.choices.find((c) => c.is_correct);
    const incorrectChoices = q.choices.filter((c) => !c.is_correct);

    if (!correctChoice || incorrectChoices.length === 0) return q;

    const shuffleArray = <T,>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    let shuffledChoices: Choice[] = [];

    if (consecutiveACount >= 2) {
      const shuffledIncorrect = shuffleArray(incorrectChoices);
      const firstIncorrect = shuffledIncorrect[0];
      const remainingIncorrect = shuffledIncorrect.slice(1);

      const rest = shuffleArray([correctChoice, ...remainingIncorrect]);
      shuffledChoices = [firstIncorrect, ...rest];
    } else {
      shuffledChoices = shuffleArray(q.choices);
    }

    if (shuffledChoices[0]?.is_correct) {
      consecutiveACount += 1;
    } else {
      consecutiveACount = 0;
    }

    return {
      ...q,
      choices: shuffledChoices,
    };
  });
}

export const ExamScreen: React.FC<ExamScreenProps> = ({
  section,
  questions: rawQuestions,
  user,
  onCompleteExam,
  onCancel,
}) => {
  const questions = useMemo(() => {
    return shuffleQuestionsChoices(rawQuestions);
  }, [rawQuestions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState('Mengira markah & mengemaskini rekod...');
  const [loadingPercent, setLoadingPercent] = useState(25);

  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answersMap, setAnswersMap] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  if (isSubmitting) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-8 text-center text-white shadow-2xl space-y-6 animate-fadeIn">
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/30">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white">Selesai! Memproses Keputusan...</h2>
          <p className="text-xs sm:text-sm text-emerald-300 font-bold">{loadingText}</p>
        </div>

        <div className="space-y-1.5 max-w-sm mx-auto">
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700 p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${loadingPercent}%` }}
            />
          </div>
          <div className="text-[11px] font-mono text-slate-400 text-right">{loadingPercent}%</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 flex items-center justify-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Syabas! Jawapan anda sedang dipaparkan...</span>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-12 text-white">
        <p>Tiada soalan dijumpai untuk bahagian ini.</p>
        <button onClick={onCancel} className="mt-4 px-4 py-2 bg-blue-600 rounded-xl text-xs font-bold">
          Kembali
        </button>
      </div>
    );
  }

  const handleSelectChoice = (choice: Choice) => {
    if (isAnswered) return;

    setSelectedChoiceId(choice.id);
    setIsAnswered(true);

    const isCorrect = choice.is_correct;
    setAnswersMap((prev) => ({ ...prev, [currentQuestion.id]: choice.id }));

    if (isCorrect) {
      soundManager.playCorrect();
      setScore((s) => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);

      const coinReward = newStreak >= 3 ? 15 : 10;
      setCoinsEarned((c) => c + coinReward);
      soundManager.playCoin();
    } else {
      soundManager.playIncorrect();
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    soundManager.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedChoiceId(null);
      setIsAnswered(false);
    } else {
      setIsSubmitting(true);
      soundManager.playLevelUp();

      setTimeout(() => {
        setLoadingPercent(65);
        setLoadingText('Menjana ganjaran koin & mata XP...');
      }, 200);

      setTimeout(() => {
        setLoadingPercent(100);
        setLoadingText('Sedia! Memaparkan keputusan...');

        const isFullMarks = score === questions.length;
        const sectionBonusCoins = 150 + (isFullMarks ? 100 : 0);
        const totalCoinsGained = coinsEarned + sectionBonusCoins;
        const totalXpGained = score * 20 + 50;

        onCompleteExam(score, questions.length, totalCoinsGained, totalXpGained, answersMap);
      }, 450);
    }
  };

  const selectedChoice = currentQuestion.choices.find((c) => c.id === selectedChoiceId);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 text-white shadow-xl flex items-center justify-between gap-4">
        <button
          onClick={() => {
            soundManager.playClick();
            if (confirm('Adakah anda pasti mahu keluar? Kemajuan latihan ini akan dibatalkan.')) {
              onCancel();
            }
          }}
          className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>

        {/* Progress Tracker */}
        <div className="flex-1 max-w-xs text-center space-y-1">
          <div className="text-xs font-black text-sky-400">
            Soalan {currentIndex + 1} daripada {questions.length}
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Live Quiz Stats */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 rounded-2xl text-orange-400 font-extrabold text-xs">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span>{streak}</span>
          </div>

          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-2xl text-amber-400 font-extrabold text-xs">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>+{coinsEarned}</span>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">
              Bahagian {section.name} • Soalan {currentQuestion.order}
            </span>
            <span className="text-slate-400">Pilih SATU jawapan yang betul</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed tracking-wide pt-1">
            {currentQuestion.question_text}
          </h2>
        </div>

        <div className="space-y-3 pt-2">
          {currentQuestion.choices.map((choice, idx) => {
            const isSelected = choice.id === selectedChoiceId;
            const isCorrect = choice.is_correct;

            let buttonStyle = 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600';

            if (isAnswered) {
              if (isCorrect) {
                buttonStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-500/20';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-red-950/80 border-red-500 text-red-200 shadow-lg shadow-red-500/20';
              } else {
                buttonStyle = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60';
              }
            }

            const optionLabel = String.fromCharCode(65 + idx);

            return (
              <button
                key={choice.id}
                disabled={isAnswered}
                onClick={() => handleSelectChoice(choice)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 font-bold text-base sm:text-lg transition-all duration-200 flex items-center justify-between gap-4 ${buttonStyle}`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700/80 text-slate-300'
                  }`}>
                    {optionLabel}
                  </span>
                  <span className="leading-snug">{choice.option_text}</span>
                </div>

                {isAnswered && (
                  <div>
                    {isCorrect && (
                      <div className="flex items-center gap-1 text-xs font-black text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/40">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Betul!</span>
                      </div>
                    )}
                    {isSelected && !isCorrect && (
                      <div className="flex items-center gap-1 text-xs font-black text-red-400 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/40">
                        <XCircle className="w-4 h-4" />
                        <span>Salah</span>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {isAnswered && selectedChoice && (
          <div className={`p-5 rounded-2xl border-2 transition-all space-y-2 animate-fadeIn ${
            selectedChoice.is_correct
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
          }`}>
            <div className="flex items-center gap-2 font-black text-sm">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Penerangan Hukum & Dalil:</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {isAnswered && (
          <div className="pt-2">
            <button
              onClick={handleNextQuestion}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base rounded-2xl shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              <span>
                {currentIndex + 1 < questions.length ? 'Soalan Seterusnya' : 'Selesaikan & Lihat Keputusan'}
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

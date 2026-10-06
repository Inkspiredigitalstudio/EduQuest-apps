import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Section, Question, Choice, UserProfile } from '../../types';
import { soundManager } from '../../lib/audio';
import { ArrowLeft, CheckCircle2, XCircle, Flame, Coins, Sparkles, ArrowRight, BookOpen, Trophy, Lightbulb } from 'lucide-react';
import { ScratchPad } from '../uasa/ScratchPad';
import { InkyThinking } from '../uasa/InkyThinking';
import { InkyCheer } from '../inky/InkyCheer';
import { INKY_ANIMATIONS, INKY_FREE_CHEERS } from '../inky/inkyAnimations';

interface ExamScreenProps {
  // Optional because PKSK Exam Mode spans many sections at once — there is
  // no single "the" section to show, and the exam-mode label never reads it.
  section?: Section;
  questions: Question[];
  user: UserProfile | null;
  onCompleteExam: (score: number, total: number, coinsEarned: number, xpEarned: number, answersMap: Record<string, string>) => void;
  onCancel: () => void;
  explanationLabel?: string;
  // 'exam' = PKSK's mixed 100-question sitting (doc: PKSK_Structural_Revision
  // #5) — hides which section/category the current question belongs to, so
  // students can't infer Bahagian A vs B from the label. 'practice' (default)
  // keeps today's behaviour: student already picked this section themselves.
  mode?: 'practice' | 'exam';
  showScratchpad?: boolean;
  // When set, shows a "Minta Diajar" button that reveals one hint per press.
  onRequestHint?: (questionId: string, previousHints: string[]) => Promise<{ hint: string | null; done: boolean }>;
  // Student's equipped Inky Shop animation — played on a correct answer
  // instead of the free thumbs-up/happy cheer.
  inkyAnimation?: string | null;
}

const CHEER_TEXTS = ['Betul! 👍', 'Hebat!', 'Bagus!', 'Pandai!', 'Syabas!'];
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

function shuffleQuestionsChoices(questions: Question[]): Question[] {
  let consecutiveACount = 0;

  return questions.map((q) => {
    // Scale-style formats (Likert, frequency, etc.) must keep their original
    // order (e.g. Sangat Setuju -> Sangat Tidak Setuju) — only MCQ items get
    // shuffled.
    if (q.answer_format && q.answer_format !== 'mcq') return q;
    if (!q.choices || q.choices.length <= 1) return q;

    // A question may have more than one correct choice (e.g. paired accepted
    // answers like A/B in psychometric scales) — keep them ALL, not just the
    // first match, or the extra correct choice(s) silently disappear from
    // the shuffled list below.
    const correctChoices = q.choices.filter((c) => c.is_correct);
    const incorrectChoices = q.choices.filter((c) => !c.is_correct);

    if (correctChoices.length === 0 || incorrectChoices.length === 0) return q;

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
      const rest = shuffleArray([...correctChoices, ...remainingIncorrect]);
      shuffledChoices = [firstIncorrect, ...rest];
    } else {
      shuffledChoices = shuffleArray(q.choices);
    }

    if (shuffledChoices[0]?.is_correct) {
      consecutiveACount += 1;
    } else {
      consecutiveACount = 0;
    }

    return { ...q, choices: shuffledChoices };
  });
}

export const ExamScreen: React.FC<ExamScreenProps> = ({
  section,
  questions: rawQuestions,
  user,
  onCompleteExam,
  onCancel,
  explanationLabel = 'Penerangan Hukum & Dalil:',
  mode = 'practice',
  showScratchpad = false,
  onRequestHint,
  inkyAnimation,
}) => {
  const questions = useMemo(() => shuffleQuestionsChoices(rawQuestions), [rawQuestions]);

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

  const [hints, setHints] = useState<string[]>([]);
  const [hintsDone, setHintsDone] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);
  // A slow hint must not land on the next question if the student moved on.
  const hintQuestionRef = useRef<string | null>(null);

  const [cheer, setCheer] = useState<{ id: number; animation: string; text: string; durationMs: number } | null>(null);
  const cheerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (cheerTimerRef.current) clearTimeout(cheerTimerRef.current);
  }, []);

  const showCheer = (newStreak: number) => {
    const animation = inkyAnimation && INKY_ANIMATIONS[inkyAnimation] ? inkyAnimation : pick(INKY_FREE_CHEERS);
    const text = newStreak >= 3 ? `🔥 ${newStreak} berturut!` : pick(CHEER_TEXTS);
    const durationMs = Math.max(1900, INKY_ANIMATIONS[animation].durationMs + 500);
    if (cheerTimerRef.current) clearTimeout(cheerTimerRef.current);
    setCheer({ id: Date.now(), animation, text, durationMs });
    cheerTimerRef.current = setTimeout(() => setCheer(null), durationMs);
  };

  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  if (isSubmitting) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-cream-50 border border-sage-200 rounded-3xl p-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-sage-100 flex items-center justify-center text-sage-600">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-ink-900">Selesai! Memproses Keputusan...</h2>
          <p className="text-xs sm:text-sm text-sage-600 font-bold">{loadingText}</p>
        </div>

        <div className="space-y-1.5 max-w-sm mx-auto">
          <div className="w-full bg-cream-200 h-3 rounded-full overflow-hidden">
            <div className="bg-sage-500 h-full rounded-full transition-all duration-300" style={{ width: `${loadingPercent}%` }} />
          </div>
          <div className="text-[11px] font-mono text-ink-500 text-right">{loadingPercent}%</div>
        </div>

        <div className="bg-cream-100 border border-sand-200 rounded-2xl p-4 text-xs text-ink-700 flex items-center justify-center gap-2">
          <Trophy className="w-4 h-4 text-honey-500 shrink-0" />
          <span>Syabas! Jawapan anda sedang dipaparkan...</span>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-12 text-ink-900">
        <p>Tiada soalan dijumpai untuk bahagian ini.</p>
        <button onClick={onCancel} className="mt-4 px-4 py-2 bg-mist-500 text-white rounded-xl text-xs font-bold">
          Kembali
        </button>
      </div>
    );
  }

  // Weighted-scale questions (nilai_skala set on choices — PKSK Bahagian A:
  // Insaniah/Psikometrik) are opinion/situational, not right-or-wrong, so
  // there's no "betul/salah" to flash — see PKSK_Structural_Revision.md #2.
  const isWeightedQuestion = currentQuestion.choices.some((c) => c.nilai_skala != null);

  const handleSelectChoice = (choice: Choice) => {
    if (isAnswered) return;

    setSelectedChoiceId(choice.id);
    setIsAnswered(true);
    setAnswersMap((prev) => ({ ...prev, [currentQuestion.id]: choice.id }));

    if (isWeightedQuestion) {
      soundManager.playClick();
      return;
    }

    const isCorrect = choice.is_correct;
    if (isCorrect) {
      soundManager.playCorrect();
      setScore((s) => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      const coinReward = newStreak >= 3 ? 15 : 10;
      setCoinsEarned((c) => c + coinReward);
      soundManager.playCoin();
      if (mode !== 'exam') showCheer(newStreak);
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
      setHints([]);
      setHintsDone(false);
      setHintLoading(false);
      setHintError(null);
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

        // Completion bonus scales with the number of questions. It used to be a
        // flat 150 (+100 for full marks), so repeating a 4-question chapter
        // paid far more per minute than real practice — one student farmed
        // 50,000+ coins that way.
        const isFullMarks = score === questions.length;
        const sectionBonusCoins = questions.length * 5 + (isFullMarks ? questions.length * 5 : 0);
        const totalCoinsGained = coinsEarned + sectionBonusCoins;
        const totalXpGained = score * 20 + 50;

        onCompleteExam(score, questions.length, totalCoinsGained, totalXpGained, answersMap);
      }, 450);
    }
  };

  const selectedChoice = currentQuestion.choices.find((c) => c.id === selectedChoiceId);
  hintQuestionRef.current = currentQuestion.id;

  const handleRequestHint = async () => {
    if (!onRequestHint || hintLoading || hintsDone) return;
    soundManager.playClick();
    const qid = currentQuestion.id;
    setHintLoading(true);
    setHintError(null);
    try {
      const result = await onRequestHint(qid, hints);
      if (hintQuestionRef.current !== qid) return;
      if (result.hint) setHints((prev) => [...prev, result.hint as string]);
      if (result.done || !result.hint) setHintsDone(true);
    } catch (e) {
      if (hintQuestionRef.current === qid) setHintError(e instanceof Error ? e.message : 'Inky tak jumpa petunjuk kali ini. Cuba tekan sekali lagi.');
    } finally {
      if (hintQuestionRef.current === qid) setHintLoading(false);
    }
  };

  // With the scratchpad, the question and the answers become separate cards so
  // the pad sits between them on phones (read → work it out → answer) and in a
  // sticky right-hand column on landscape tablets.
  const cardClass = 'bg-cream-50 border border-sand-200 rounded-3xl p-6 sm:p-8';

  return (
    <div className={`${showScratchpad ? 'max-w-6xl' : 'max-w-3xl'} mx-auto space-y-6 pb-12`}>
      {cheer && <InkyCheer key={cheer.id} animation={cheer.animation} text={cheer.text} durationMs={cheer.durationMs} />}

      {/* Top Header Bar */}
      <div className="bg-cream-50 border border-sand-200 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4">
        <button
          onClick={() => {
            soundManager.playClick();
            if (confirm('Adakah anda pasti mahu keluar? Kemajuan latihan ini akan dibatalkan.')) {
              onCancel();
            }
          }}
          className="p-2.5 rounded-2xl bg-cream-100 hover:bg-cream-200 text-ink-700 border border-sand-200 transition-colors flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>

        <div className="flex-1 max-w-xs text-center space-y-1">
          <div className="text-xs font-bold text-mist-600">
            Soalan {currentIndex + 1} daripada {questions.length}
          </div>
          <div className="w-full bg-cream-200 h-2.5 rounded-full overflow-hidden">
            <div className="bg-mist-500 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-clay-100 px-3 py-1.5 rounded-2xl text-clay-500 font-bold text-xs">
            <Flame className="w-4 h-4" />
            <span>{streak}</span>
          </div>
          <div className="flex items-center gap-1 bg-honey-100 px-3 py-1.5 rounded-2xl text-honey-500 font-bold text-xs">
            <Coins className="w-4 h-4" />
            <span>+{coinsEarned}</span>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className={showScratchpad ? 'grid gap-4 lg:gap-6 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:items-start' : `${cardClass} space-y-6`}>
        <div className={showScratchpad ? `${cardClass} space-y-3 lg:col-start-1 lg:row-start-1` : 'space-y-3'}>
          <div className="flex items-center justify-between text-xs font-bold text-ink-500">
            <span className="uppercase tracking-wide text-mist-600 bg-mist-100 px-2.5 py-1 rounded-lg">
              {mode === 'exam' || !section
                ? `Soalan ${currentIndex + 1} / ${questions.length}`
                : `Bahagian ${section.name} • Soalan ${currentQuestion.order}`}
            </span>
            <span>{isWeightedQuestion ? 'Pilih jawapan yang PALING menggambarkan diri anda' : 'Pilih SATU jawapan yang betul'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-bold text-ink-900 leading-relaxed pt-1 whitespace-pre-line">
            {currentQuestion.question_text}
          </h2>

          {currentQuestion.image_url && (
            <div className="rounded-2xl overflow-hidden border border-sand-200 bg-cream-100">
              <img src={currentQuestion.image_url} alt="Gambar soalan" className="w-full max-h-72 object-contain" />
            </div>
          )}

          {onRequestHint && (hints.length > 0 || !isAnswered) && (
            <div className="space-y-2 pt-2">
              {hints.map((h, i) => (
                <div key={i} className="inky-pop flex items-start gap-2.5 p-3 rounded-2xl bg-honey-100 border border-honey-200 text-sm text-ink-900 leading-relaxed">
                  <Lightbulb className="w-4 h-4 text-honey-500 shrink-0 mt-0.5" />
                  <span>
                    <span className="font-bold">Langkah {i + 1}: </span>
                    {h}
                  </span>
                </div>
              ))}
              {hintError && <p className="text-xs font-bold text-clay-500">{hintError}</p>}
              {!isAnswered &&
                (hintLoading ? (
                  <InkyThinking />
                ) : hintsDone ? (
                  <p className="text-xs font-bold text-ink-500">Itu sahaja petunjuk. Cuba kira dan pilih jawapan anda!</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestHint}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border-2 border-honey-200 bg-honey-100 text-ink-900 hover:bg-honey-200/70 transition-colors"
                  >
                    <span aria-hidden="true">💡</span>
                    <span>{hints.length ? 'Petunjuk Seterusnya' : 'Petunjuk'}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {showScratchpad && (
          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-4">
            <ScratchPad questionId={currentQuestion.id} />
          </div>
        )}

        <div className={showScratchpad ? `${cardClass} space-y-6 lg:col-start-1 lg:row-start-2` : 'space-y-6'}>
        <div className="space-y-3 pt-2">
          {currentQuestion.choices.map((choice, idx) => {
            const isSelected = choice.id === selectedChoiceId;
            const isCorrect = choice.is_correct;

            let buttonStyle = 'bg-cream-100 border-sand-200 text-ink-900 hover:bg-cream-200 hover:border-sand-300';
            let badgeStyle = 'bg-cream-200 text-ink-700';

            if (isAnswered) {
              if (isWeightedQuestion) {
                buttonStyle = isSelected
                  ? 'bg-mist-100 border-mist-400 text-ink-900'
                  : 'bg-cream-100 border-sand-200 text-ink-300 opacity-60';
                badgeStyle = isSelected ? 'bg-mist-500 text-white' : 'bg-cream-200 text-ink-700';
              } else if (isCorrect) {
                buttonStyle = 'bg-sage-100 border-sage-400 text-ink-900';
                badgeStyle = 'bg-sage-500 text-white';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-clay-100 border-clay-400 text-ink-900';
                badgeStyle = 'bg-clay-500 text-white';
              } else {
                buttonStyle = 'bg-cream-100 border-sand-200 text-ink-300 opacity-60';
              }
            }

            const optionLabel = String.fromCharCode(65 + idx);

            return (
              <button
                key={choice.id}
                disabled={isAnswered}
                onClick={() => handleSelectChoice(choice)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 font-bold text-base sm:text-lg transition-colors flex items-center justify-between gap-4 ${buttonStyle}`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${badgeStyle}`}>
                    {optionLabel}
                  </span>
                  <span className="leading-snug">{choice.option_text}</span>
                </div>

                {isAnswered && !isWeightedQuestion && (
                  <div>
                    {isCorrect && (
                      <div className="flex items-center gap-1 text-xs font-bold text-sage-600 bg-sage-100 px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Betul!</span>
                      </div>
                    )}
                    {isSelected && !isCorrect && (
                      <div className="flex items-center gap-1 text-xs font-bold text-clay-500 bg-clay-100 px-3 py-1 rounded-full">
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
          <div className={`p-5 rounded-2xl border-2 space-y-2 ${
            isWeightedQuestion
              ? 'bg-mist-100 border-mist-200 text-ink-900'
              : selectedChoice.is_correct
              ? 'bg-sage-100 border-sage-200 text-ink-900'
              : 'bg-honey-100 border-honey-200 text-ink-900'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              <BookOpen className="w-4 h-4 text-mist-600" />
              <span>{explanationLabel}</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-ink-700">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {isAnswered && (
          <div className="pt-2">
            <button
              onClick={handleNextQuestion}
              className="w-full py-4 px-6 bg-mist-500 hover:bg-mist-600 text-white font-bold text-base rounded-2xl transition-colors flex items-center justify-center gap-2 group"
            >
              <span>{currentIndex + 1 < questions.length ? 'Soalan Seterusnya' : 'Selesaikan & Lihat Keputusan'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

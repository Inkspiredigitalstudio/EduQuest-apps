import React, { useEffect, useState } from 'react';
import { ArticulationLevel, ArticulationMode, ArticulationQuestion, EssayAiFeedback, EssayAnswer, EssayFeedbackRound, EssaySections, UserProfile } from '../../types';
import {
  fetchArticulationQuestions,
  startEssayAnswer,
  updateEssayDraft,
  submitFeedbackRound,
  lockFinalEssay,
  fetchFeedbackRounds,
  decodeSections,
} from '../../lib/articulation';
import { fetchFahamSoalan, evaluateEssay, coachFailureMessage, FahamSoalanResult } from '../../lib/aiCoach';
import { soundManager } from '../../lib/audio';
import { WritingEditor } from './WritingEditor';
import { AiCoachPanel } from './AiCoachPanel';
import { FeedbackPanel } from './FeedbackPanel';
import { ArrowLeft, Sparkles, Timer, BookOpenCheck, Loader2 } from 'lucide-react';

type Step = 'pilih_mod' | 'pilih_soalan' | 'faham_soalan' | 'menulis' | 'menilai' | 'maklum_balas' | 'tidak_dinilai';

interface ArticulationScreenProps {
  user: UserProfile;
  // Kategori Pelajar (Tahun 6 / Tingkatan 3) is already chosen once, upstream,
  // at the PKSK root gate — Bahagian C reuses it instead of asking again.
  kategoriPelajar: ArticulationLevel;
  onExit: () => void;
}

function isiCountFor(level: ArticulationLevel): number {
  return level === 'Tahun 6' ? 3 : 4;
}

// exam_attempts.tingkatan is an integer column (plain Tingkatan/Tahun
// number) — see the matching fix in App.tsx's pkskTingkatanInt.
function tingkatanFor(user: UserProfile): number {
  return user.school_form || user.school_year || 0;
}

export const ArticulationScreen: React.FC<ArticulationScreenProps> = ({ user, kategoriPelajar, onExit }) => {
  const [step, setStep] = useState<Step>('pilih_mod');
  const [level] = useState<ArticulationLevel>(kategoriPelajar);
  const [mode, setMode] = useState<ArticulationMode | null>(null);
  const [questions, setQuestions] = useState<ArticulationQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<ArticulationQuestion | null>(null);
  const [fahamSoalan, setFahamSoalan] = useState<FahamSoalanResult | null>(null);
  const [isLoadingFaham, setIsLoadingFaham] = useState(false);

  const [essayAnswer, setEssayAnswer] = useState<EssayAnswer | null>(null);
  const [sections, setSections] = useState<EssaySections>({ pengenalan: '', isi: [''], penutup: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState<EssayAiFeedback | null>(null);
  const [rounds, setRounds] = useState<EssayFeedbackRound[]>([]);
  // Shown above the editor / question list when something went wrong, so a
  // failed submit never looks like "nothing happened".
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  // True when the essay row couldn't be created on the server (e.g. the
  // student has no signed-in session). Practice still works — the AI feedback
  // doesn't need the database — but nothing is saved, and we say so.
  const [notSaved, setNotSaved] = useState(false);

  const handlePickMode = async (m: ArticulationMode) => {
    soundManager.playClick();
    setMode(m);
    setStep('pilih_soalan');
    setIsLoadingQuestions(true);
    const qs = await fetchArticulationQuestions(level);
    setQuestions(qs);
    setIsLoadingQuestions(false);
  };

  const beginWriting = async (question: ArticulationQuestion, m: ArticulationMode) => {
    setSections({ pengenalan: '', isi: Array(isiCountFor(level)).fill(''), penutup: '' });
    setRounds([]);
    setLatestFeedback(null);
    setSubmitNotice(null);
    setStartError(null);
    const answer = await startEssayAnswer({ userId: user.id, tingkatan: tingkatanFor(user), mode: m, question });
    if (!answer && m === 'exam') {
      // Exam Mode needs the server to stamp the deadline and keep the locked
      // essay, so it can't run without it.
      setStartError('Exam tidak dapat dimulakan kerana sambungan ke pelayan gagal. Sila log keluar, log masuk semula, dan cuba lagi.');
      setStep('pilih_soalan');
      return;
    }
    setNotSaved(!answer);
    setEssayAnswer(answer);
    setStep('menulis');
  };

  const handlePickQuestion = async (question: ArticulationQuestion) => {
    soundManager.playClick();
    setSelectedQuestion(question);

    if (mode === 'exam') {
      await beginWriting(question, 'exam');
      return;
    }

    // Practice Mode: show "Faham Soalan" AI breakdown first (plan #9.1
    // Bahagian 8) before the student starts planning/writing.
    setStep('faham_soalan');
    setIsLoadingFaham(true);
    const result = await fetchFahamSoalan(question.question, question.topic, level!);
    setFahamSoalan(result);
    setIsLoadingFaham(false);
  };

  const handleStartPracticeWriting = async () => {
    soundManager.playClick();
    if (selectedQuestion) await beginWriting(selectedQuestion, 'practice');
  };

  // Autosave draft periodically while writing so a refresh doesn't lose
  // progress mid-way (best-effort — non-blocking).
  useEffect(() => {
    if (step !== 'menulis' || !essayAnswer) return;
    const timeout = setTimeout(() => {
      updateEssayDraft(essayAnswer.id, sections);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [sections, step, essayAnswer]);

  const doSubmit = async () => {
    if (!selectedQuestion || !level || !mode || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitNotice(null);
    setStep('menilai');

    const { feedback, reason } = await evaluateEssay(selectedQuestion.question, level, selectedQuestion.recommended_word_count, sections);

    if (!feedback) {
      // Don't store a failed evaluation as a real round with a score of 0 —
      // that would overwrite the student's score and pollute their history.
      setIsSubmitting(false);
      if (mode === 'exam' && essayAnswer) {
        // The time is over (or they chose to submit): keep what they wrote.
        await updateEssayDraft(essayAnswer.id, sections);
        await lockFinalEssay(essayAnswer.id, essayAnswer.attempt_id);
        setEssayAnswer({ ...essayAnswer, status: 'dikunci' });
        setSubmitNotice(coachFailureMessage(reason));
        setStep('tidak_dinilai');
      } else {
        setSubmitNotice(`${coachFailureMessage(reason)} Karangan anda masih ada di sini — cuba hantar semula sebentar lagi.`);
        setStep('menulis');
      }
      return;
    }

    const saved = essayAnswer ? await submitFeedbackRound(essayAnswer.id, sections, feedback) : null;
    let freshRounds: EssayFeedbackRound[] = [];
    if (saved && essayAnswer) freshRounds = await fetchFeedbackRounds(essayAnswer.id);
    if (freshRounds.length === 0) {
      // Not stored on the server (no session or a failed write) — keep the
      // history on screen for this sitting so "Baiki & Hantar Semula" works.
      freshRounds = [
        ...rounds,
        {
          id: `local-${rounds.length + 1}`,
          essay_answer_id: essayAnswer?.id || '',
          pusingan: rounds.length + 1,
          draf_dihantar: JSON.stringify(sections),
          maklum_balas_ai: JSON.stringify(feedback),
          created_at: new Date().toISOString(),
        },
      ];
    }

    if (mode === 'exam' && essayAnswer) {
      await lockFinalEssay(essayAnswer.id, essayAnswer.attempt_id);
      setEssayAnswer({ ...essayAnswer, status: 'dikunci' });
    }

    setLatestFeedback(feedback);
    setRounds(freshRounds);
    setIsSubmitting(false);
    setStep('maklum_balas');
    soundManager.playLevelUp();
  };

  const handleTimeUp = () => {
    if (step === 'menulis' && !isSubmitting) doSubmit();
  };

  const handleImprove = () => setStep('menulis');

  const handleFinalize = async () => {
    if (essayAnswer) {
      await lockFinalEssay(essayAnswer.id, essayAnswer.attempt_id);
      setEssayAnswer({ ...essayAnswer, status: 'dikunci' });
    }
    onExit();
  };

  // ---------------------------------------------------------------- render

  if (step === 'pilih_mod') {
    return (
      <div className="max-w-xl mx-auto space-y-4 pb-12">
        <button onClick={onExit} className="flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-ink-700">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <div className="text-center space-y-2">
          <h1 className="text-xl font-display font-bold text-ink-900">Pilih Mod</h1>
          <p className="text-sm text-ink-500">{level}</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => handlePickMode('practice')}
            className="w-full bg-sage-100 hover:bg-sage-200/70 border border-sage-200 rounded-3xl p-5 text-left transition-colors flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-cream-50 flex items-center justify-center text-sage-600 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-ink-900">🟢 Practice Mode</h3>
              <p className="text-xs text-ink-700 mt-0.5">Berlatih dengan bantuan AI. Boleh cuba berkali-kali.</p>
            </div>
          </button>
          <button
            onClick={() => handlePickMode('exam')}
            className="w-full bg-clay-100 hover:bg-clay-200/70 border border-clay-200 rounded-3xl p-5 text-left transition-colors flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-cream-50 flex items-center justify-center text-clay-500 shrink-0">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-ink-900">🔴 Exam Mode</h3>
              <p className="text-xs text-ink-700 mt-0.5">Simulasi peperiksaan. 45 minit. Tiada bantuan AI semasa menulis.</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'pilih_soalan') {
    return (
      <div className="max-w-xl mx-auto space-y-4 pb-12">
        <button onClick={() => setStep('pilih_mod')} className="flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-ink-700">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <div className="text-center space-y-1">
          <h1 className="text-xl font-display font-bold text-ink-900">Pilih Soalan</h1>
          <p className="text-sm text-ink-500">{level} • {mode === 'exam' ? 'Exam Mode' : 'Practice Mode'}</p>
        </div>
        {startError && (
          <div className="bg-clay-100 border border-clay-200 rounded-2xl p-4 text-xs text-ink-700">{startError}</div>
        )}
        {isLoadingQuestions ? (
          <div className="text-center py-10 text-ink-500 text-sm">Memuatkan soalan...</div>
        ) : questions.length === 0 ? (
          <div className="bg-cream-50 border border-sand-200 rounded-3xl p-8 text-center text-sm text-ink-500">
            Tiada soalan tersedia untuk {level} buat masa ini.
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <button
                key={q.id}
                onClick={() => handlePickQuestion(q)}
                className="w-full bg-cream-50 hover:bg-mist-100 border border-sand-200 hover:border-mist-300 rounded-2xl p-4 text-left transition-colors"
              >
                <span className="text-[10px] font-bold uppercase text-mist-600 bg-mist-100 px-2 py-0.5 rounded-lg">{q.topic}</span>
                <p className="text-sm font-semibold text-ink-900 mt-1.5">{q.question}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (step === 'faham_soalan') {
    return (
      <div className="max-w-xl mx-auto space-y-4 pb-12">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-display font-bold text-ink-900 flex items-center justify-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-mist-600" />
            <span>Faham Soalan</span>
          </h1>
        </div>
        <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5">
          <p className="text-sm font-semibold text-ink-900">{selectedQuestion?.question}</p>
        </div>
        {isLoadingFaham ? (
          <div className="flex items-center justify-center gap-2 py-10 text-ink-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>AI sedang menganalisis soalan...</span>
          </div>
        ) : fahamSoalan ? (
          <div className="bg-sage-100 border border-sage-200 rounded-3xl p-5 space-y-2.5 text-xs text-ink-700">
            <p><strong className="text-ink-900">Topik:</strong> {fahamSoalan.topik}</p>
            <p><strong className="text-ink-900">Kehendak Soalan:</strong> {fahamSoalan.kehendak_soalan}</p>
            <p><strong className="text-ink-900">Sasaran:</strong> {fahamSoalan.sasaran}</p>
            <p><strong className="text-ink-900">Jenis Soalan:</strong> {fahamSoalan.jenis_soalan}</p>
            <p><strong className="text-ink-900">Cadangan Bilangan Isi:</strong> {fahamSoalan.cadangan_bilangan_isi}</p>
          </div>
        ) : (
          <div className="bg-honey-100 border border-honey-200 rounded-3xl p-5 text-xs text-ink-700">
            AI tidak dapat menganalisis soalan buat masa ini — anda tetap boleh terus menulis.
          </div>
        )}
        <button
          onClick={handleStartPracticeWriting}
          className="w-full py-3.5 px-4 bg-mist-500 hover:bg-mist-600 text-white font-bold rounded-2xl text-sm transition-colors"
        >
          Mula Menulis
        </button>
      </div>
    );
  }

  if (step === 'menulis' && selectedQuestion && level && mode) {
    return (
      <WritingEditor
        question={selectedQuestion}
        level={level}
        mode={mode}
        sections={sections}
        onSectionsChange={setSections}
        isiCount={isiCountFor(level)}
        examEndTime={essayAnswer?.exam_end_time}
        onTimeUp={handleTimeUp}
        onSubmit={doSubmit}
        isSubmitting={isSubmitting}
        notice={submitNotice || (notSaved ? 'Karangan ini tidak dapat disimpan ke pelayan (sila log keluar dan log masuk semula untuk menyimpan). Maklum balas AI tetap berfungsi.' : null)}
        onCancel={onExit}
        coachPanel={
          mode === 'practice' ? (
            <AiCoachPanel question={selectedQuestion} level={level} sections={sections} isiCount={isiCountFor(level)} />
          ) : undefined
        }
      />
    );
  }

  if (step === 'menilai') {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-mist-500 mx-auto animate-spin" />
        <p className="text-sm font-semibold text-ink-700">AI sedang menilai karangan anda...</p>
      </div>
    );
  }

  if (step === 'tidak_dinilai') {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-4 text-center">
        <div className="bg-cream-50 border border-sand-200 rounded-3xl p-6 space-y-2">
          <h1 className="text-lg font-display font-bold text-ink-900">Karangan Disimpan</h1>
          <p className="text-sm text-ink-700">Karangan anda telah disimpan dan dikunci.</p>
          <p className="text-xs text-ink-500">{submitNotice} Karangan ini belum dinilai oleh AI.</p>
        </div>
        <button
          onClick={onExit}
          className="w-full py-3.5 px-4 bg-mist-500 hover:bg-mist-600 text-white font-bold rounded-2xl text-sm transition-colors"
        >
          Kembali
        </button>
      </div>
    );
  }

  if (step === 'maklum_balas' && latestFeedback && mode) {
    return (
      <FeedbackPanel
        mode={mode}
        latestFeedback={latestFeedback}
        rounds={rounds}
        isLocked={essayAnswer?.status === 'dikunci'}
        onImprove={handleImprove}
        onFinalize={handleFinalize}
        onGoDashboard={onExit}
      />
    );
  }

  return null;
};

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
import { fetchFahamSoalan, evaluateEssay, FahamSoalanResult } from '../../lib/aiCoach';
import { soundManager } from '../../lib/audio';
import { WritingEditor } from './WritingEditor';
import { AiCoachPanel } from './AiCoachPanel';
import { FeedbackPanel } from './FeedbackPanel';
import { ArrowLeft, GraduationCap, Sparkles, Timer, BookOpenCheck, Loader2 } from 'lucide-react';

type Step = 'pilih_level' | 'pilih_mod' | 'pilih_soalan' | 'faham_soalan' | 'menulis' | 'menilai' | 'maklum_balas';

interface ArticulationScreenProps {
  user: UserProfile;
  onExit: () => void;
}

function isiCountFor(level: ArticulationLevel): number {
  return level === 'Tahun 6' ? 3 : 4;
}

function tingkatanFor(user: UserProfile): string {
  return user.school_form ? `Tingkatan ${user.school_form}` : user.school_year ? `Tahun ${user.school_year}` : 'Tidak dinyatakan';
}

export const ArticulationScreen: React.FC<ArticulationScreenProps> = ({ user, onExit }) => {
  const [step, setStep] = useState<Step>('pilih_level');
  const [level, setLevel] = useState<ArticulationLevel | null>(null);
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

  const handlePickLevel = (lvl: ArticulationLevel) => {
    soundManager.playClick();
    setLevel(lvl);
    setStep('pilih_mod');
  };

  const handlePickMode = async (m: ArticulationMode) => {
    soundManager.playClick();
    setMode(m);
    setStep('pilih_soalan');
    if (level) {
      setIsLoadingQuestions(true);
      const qs = await fetchArticulationQuestions(level);
      setQuestions(qs);
      setIsLoadingQuestions(false);
    }
  };

  const beginWriting = async (question: ArticulationQuestion, m: ArticulationMode) => {
    if (!level) return;
    setSections({ pengenalan: '', isi: Array(isiCountFor(level)).fill(''), penutup: '' });
    setRounds([]);
    setLatestFeedback(null);
    const answer = await startEssayAnswer({ userId: user.id, tingkatan: tingkatanFor(user), mode: m, question });
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
    if (!essayAnswer || !selectedQuestion || !level || !mode) return;
    setIsSubmitting(true);
    setStep('menilai');

    const feedback = await evaluateEssay(selectedQuestion.question, level, selectedQuestion.recommended_word_count, sections);
    const safeFeedback: EssayAiFeedback = feedback || {
      score: 0,
      kekuatan: [],
      perkara_dibaiki: ['AI tidak dapat menilai karangan buat masa ini — sila cuba hantar semula sebentar lagi.'],
      cadangan: [],
    };

    await submitFeedbackRound(essayAnswer.id, sections, safeFeedback);
    const freshRounds = await fetchFeedbackRounds(essayAnswer.id);

    if (mode === 'exam') {
      await lockFinalEssay(essayAnswer.id, essayAnswer.attempt_id);
      setEssayAnswer({ ...essayAnswer, status: 'dikunci' });
    }

    setLatestFeedback(safeFeedback);
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
    if (!essayAnswer) return;
    await lockFinalEssay(essayAnswer.id, essayAnswer.attempt_id);
    setEssayAnswer({ ...essayAnswer, status: 'dikunci' });
    onExit();
  };

  // ---------------------------------------------------------------- render

  if (step === 'pilih_level') {
    return (
      <div className="max-w-xl mx-auto space-y-4 pb-12">
        <button onClick={onExit} className="flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-ink-700">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <div className="text-center space-y-2">
          <h1 className="text-xl font-display font-bold text-ink-900">Artikulasi Karangan</h1>
          <p className="text-sm text-ink-500">Pilih tahap anda</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['Tahun 6', 'Tingkatan 3'] as ArticulationLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => handlePickLevel(lvl)}
              className="bg-cream-50 hover:bg-mist-100 border border-sand-200 hover:border-mist-300 rounded-3xl p-6 text-center space-y-2 transition-colors"
            >
              <GraduationCap className="w-8 h-8 text-mist-600 mx-auto" />
              <h3 className="text-lg font-display font-bold text-ink-900">{lvl}</h3>
              <p className="text-xs text-ink-500">{lvl === 'Tahun 6' ? 'Sasaran ~100 patah perkataan' : 'Sasaran ~250 patah perkataan'}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'pilih_mod') {
    return (
      <div className="max-w-xl mx-auto space-y-4 pb-12">
        <button onClick={() => setStep('pilih_level')} className="flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-ink-700">
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

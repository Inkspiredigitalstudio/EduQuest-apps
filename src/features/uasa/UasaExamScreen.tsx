import React, { useEffect, useMemo, useRef, useState } from 'react';
import { soundManager } from '../../lib/audio';
import { submitUasaExamAnswer, UasaStartExamResult, UasaFinishExamResult } from '../../lib/uasa';
import { ArrowLeft, ArrowRight, Clock, CheckCircle2, Send } from 'lucide-react';

interface UasaExamScreenProps {
  data: UasaStartExamResult;
  onFinish: (result: UasaFinishExamResult) => void;
  onExit: () => void;
  finishExam: (attemptId: string) => Promise<UasaFinishExamResult>;
}

// Real exam behaviour: no immediate right/wrong feedback (unlike Practice's
// shared ExamScreen) — correctness only revealed at the end via onFinish's
// wrongAnswers review. Resume-safe: every answer persists individually via
// submitUasaExamAnswer as it's picked, so closing the app mid-sitting loses
// nothing — App.tsx's startOrResumeUasaExam re-fetches this same state.
export const UasaExamScreen: React.FC<UasaExamScreenProps> = ({ data, onFinish, onExit, finishExam }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState<Record<string, string>>(data.answersMap || {});
  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.floor((new Date(data.deadline_at).getTime() - Date.now()) / 1000)));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const finishedRef = useRef(false);

  const questions = data.questions;
  const currentQuestion = questions[currentIndex];

  const doFinish = async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setIsSubmitting(true);
    const result = await finishExam(data.attempt_id);
    onFinish(result);
  };

  useEffect(() => {
    if (secondsLeft <= 0) {
      doFinish();
      return;
    }
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          doFinish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timeRunningLow = secondsLeft <= 5 * 60;
  const timeLabel = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [secondsLeft]);

  const answeredCount = Object.keys(answersMap).length;

  const handleSelectChoice = (choiceId: string) => {
    soundManager.playClick();
    setAnswersMap((prev) => ({ ...prev, [currentQuestion.id]: choiceId }));
    submitUasaExamAnswer({ attempt_id: data.attempt_id, question_id: currentQuestion.id, choice_id: choiceId }).catch((e) =>
      console.warn('submitUasaExamAnswer failed (will retry on next selection or finish):', e)
    );
  };

  const handleSubmitExam = () => {
    if (!confirm(`Hantar jawapan sekarang? (${answeredCount}/${questions.length} soalan dijawab)`)) return;
    soundManager.playLevelUp();
    doFinish();
  };

  if (isSubmitting) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-cream-50 border border-sand-200 rounded-3xl p-8 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-mist-100 flex items-center justify-center text-mist-600">
          <Send className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-display font-bold text-ink-900">Menghantar Jawapan...</h2>
        <p className="text-xs text-ink-500">Sila tunggu, sedang mengira markah.</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-12 text-ink-900">
        <p>Tiada soalan dalam set exam ini.</p>
        <button onClick={onExit} className="mt-4 px-4 py-2 bg-mist-500 text-white rounded-xl text-xs font-bold">Kembali</button>
      </div>
    );
  }

  const bahagianLabel: Record<string, string> = { A: 'Bahagian A', B: 'Bahagian B', C: 'Bahagian C (KBAT)' };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header: timer + exit */}
      <div className="bg-cream-50 border border-sand-200 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4">
        <button
          onClick={() => {
            if (confirm('Keluar sekarang? Jawapan anda sudah disimpan — anda boleh sambung semula sebelum masa tamat.')) {
              onExit();
            }
          }}
          className="p-2.5 rounded-2xl bg-cream-100 hover:bg-cream-200 text-ink-700 border border-sand-200 transition-colors flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>

        <div className="flex-1 max-w-xs text-center space-y-1">
          <div className="text-xs font-bold text-mist-600">
            {answeredCount}/{questions.length} dijawab
          </div>
          <div className="w-full bg-cream-200 h-2.5 rounded-full overflow-hidden">
            <div className="bg-mist-500 h-full rounded-full transition-all duration-300" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
          </div>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-bold text-xs ${timeRunningLow ? 'bg-clay-100 text-clay-500' : 'bg-mist-100 text-mist-600'}`}>
          <Clock className="w-4 h-4" />
          <span>{timeLabel}</span>
        </div>
      </div>

      {/* Question jump grid */}
      <div className="flex flex-wrap gap-1.5">
        {questions.map((q, idx) => {
          const isAnswered = Boolean(answersMap[q.id]);
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-lg text-[11px] font-bold border-2 transition-colors ${
                isCurrent
                  ? 'bg-mist-500 border-mist-500 text-white'
                  : isAnswered
                  ? 'bg-sage-100 border-sage-300 text-sage-700'
                  : 'bg-cream-100 border-sand-200 text-ink-500'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question card */}
      <div className="bg-cream-50 border border-sand-200 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-ink-500">
            <span className="uppercase tracking-wide text-mist-600 bg-mist-100 px-2.5 py-1 rounded-lg">
              {bahagianLabel[currentQuestion.bahagian] || currentQuestion.bahagian} • Soalan {currentIndex + 1}/{questions.length}
            </span>
            <span>{currentQuestion.marks} markah</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-bold text-ink-900 leading-relaxed pt-1 whitespace-pre-line">
            {currentQuestion.question_text}
          </h2>

          {currentQuestion.image_url && (
            <div className="rounded-2xl overflow-hidden border border-sand-200 bg-cream-100">
              <img src={currentQuestion.image_url} alt="Gambar soalan" className="w-full max-h-72 object-contain" />
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          {currentQuestion.choices.map((choice, idx) => {
            const isSelected = answersMap[currentQuestion.id] === choice.id;
            const optionLabel = String.fromCharCode(65 + idx);
            return (
              <button
                key={choice.id}
                onClick={() => handleSelectChoice(choice.id)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 font-bold text-base sm:text-lg transition-colors flex items-center gap-3.5 ${
                  isSelected
                    ? 'bg-mist-100 border-mist-400 text-ink-900'
                    : 'bg-cream-100 border-sand-200 text-ink-900 hover:bg-cream-200 hover:border-sand-300'
                }`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${isSelected ? 'bg-mist-500 text-white' : 'bg-cream-200 text-ink-700'}`}>
                  {optionLabel}
                </span>
                <span className="leading-snug">{choice.option_text}</span>
                {isSelected && <CheckCircle2 className="w-5 h-5 text-mist-600 ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            className="flex-1 py-3.5 px-5 bg-cream-100 hover:bg-cream-200 disabled:opacity-40 disabled:cursor-not-allowed text-ink-700 font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 border border-sand-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sebelum</span>
          </button>

          {currentIndex + 1 < questions.length ? (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="flex-1 py-3.5 px-5 bg-mist-500 hover:bg-mist-600 text-white font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <span>Seterusnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitExam}
              className="flex-1 py-3.5 px-5 bg-sage-500 hover:bg-sage-600 text-white font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Hantar Jawapan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

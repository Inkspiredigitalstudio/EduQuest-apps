import React from 'react';
import { UasaFinishExamResult } from '../../lib/uasa';
import { Trophy, XCircle, BookOpen, Home } from 'lucide-react';

interface UasaExamResultProps {
  result: UasaFinishExamResult;
  onGoDashboard: () => void;
}

const BAHAGIAN_LABEL: Record<string, string> = { A: 'Bahagian A', B: 'Bahagian B', C: 'Bahagian C (KBAT)' };

export const UasaExamResult: React.FC<UasaExamResultProps> = ({ result, onGoDashboard }) => {
  const { attempt, wrongAnswers } = result;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="bg-cream-50 border border-sand-200 rounded-3xl p-8 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-honey-100 flex items-center justify-center text-honey-500">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-display font-bold text-ink-900">Exam UASA Selesai!</h2>
        <div className="text-5xl font-display font-bold text-mist-600">{attempt.percent}%</div>
        <p className="text-sm text-ink-500">{attempt.total_marks} / 50 markah</p>

        <div className="grid grid-cols-3 gap-3 pt-4">
          {(['A', 'B', 'C'] as const).map((b) => {
            const marks = b === 'A' ? attempt.marks_bahagian_a : b === 'B' ? attempt.marks_bahagian_b : attempt.marks_bahagian_c;
            const percent = b === 'A' ? attempt.percent_bahagian_a : b === 'B' ? attempt.percent_bahagian_b : attempt.percent_bahagian_c;
            const max = b === 'C' ? 10 : 20;
            return (
              <div key={b} className="bg-cream-100 border border-sand-200 rounded-2xl p-3 space-y-1">
                <div className="text-[11px] font-bold text-ink-500 uppercase">{BAHAGIAN_LABEL[b]}</div>
                <div className="text-lg font-display font-bold text-ink-900">{marks}/{max}</div>
                <div className="text-xs font-bold text-mist-600">{percent}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {wrongAnswers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-display font-bold text-ink-900 flex items-center gap-2 px-1">
            <XCircle className="w-4 h-4 text-clay-500" />
            <span>Jawapan Salah ({wrongAnswers.length})</span>
          </h3>
          {wrongAnswers.map((w, idx) => (
            <div key={w.question_id} className="bg-cream-50 border border-clay-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-ink-500">
                <span className="uppercase tracking-wide text-clay-500 bg-clay-100 px-2 py-0.5 rounded-lg">
                  {BAHAGIAN_LABEL[w.bahagian] || w.bahagian}
                </span>
                <span>Soalan {idx + 1}</span>
              </div>
              <p className="text-sm font-bold text-ink-900 whitespace-pre-line">{w.question_text}</p>
              <div className="text-xs space-y-1">
                <p className="text-clay-500 font-semibold">
                  Jawapan anda: {w.selected_option_text || <em className="text-ink-400">Tidak dijawab</em>}
                </p>
                <p className="text-sage-600 font-semibold">Jawapan betul: {w.correct_option_text}</p>
              </div>
              {w.explanation && (
                <div className="bg-mist-100 border border-mist-200 rounded-xl p-3 flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-mist-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-ink-700 leading-relaxed">{w.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onGoDashboard}
        className="w-full py-4 px-6 bg-mist-500 hover:bg-mist-600 text-white font-bold text-base rounded-2xl transition-colors flex items-center justify-center gap-2"
      >
        <Home className="w-5 h-5" />
        <span>Kembali ke Menu Utama</span>
      </button>
    </div>
  );
};

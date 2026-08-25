import React, { useEffect, useState } from 'react';
import { ArticulationLevel, ArticulationMode, ArticulationQuestion, EssaySections } from '../../types';
import { wordCount } from '../../lib/articulation';
import { soundManager } from '../../lib/audio';
import { ArrowLeft, Clock, Send, AlertTriangle } from 'lucide-react';

interface WritingEditorProps {
  question: ArticulationQuestion;
  level: ArticulationLevel;
  mode: ArticulationMode;
  sections: EssaySections;
  onSectionsChange: (s: EssaySections) => void;
  isiCount: number;
  examEndTime?: string | null;
  onTimeUp?: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  onCancel: () => void;
  coachPanel?: React.ReactNode;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const ss = (totalSeconds % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export const WritingEditor: React.FC<WritingEditorProps> = ({
  question,
  level,
  mode,
  sections,
  onSectionsChange,
  isiCount,
  examEndTime,
  onTimeUp,
  onSubmit,
  isSubmitting,
  onCancel,
  coachPanel,
}) => {
  const target = question.recommended_word_count || (level === 'Tahun 6' ? 100 : 250);
  const total = wordCount(sections);

  // Exam timer is derived from a server-stored end time, not a local
  // countdown started fresh on mount — a refresh recomputes remaining time
  // from examEndTime instead of resetting the clock (plan #9.1 Bahagian 17).
  const [remainingMs, setRemainingMs] = useState<number>(() =>
    examEndTime ? new Date(examEndTime).getTime() - Date.now() : 0
  );
  const [hasFiredTimeUp, setHasFiredTimeUp] = useState(false);

  useEffect(() => {
    if (mode !== 'exam' || !examEndTime) return;
    const tick = () => {
      const ms = new Date(examEndTime).getTime() - Date.now();
      setRemainingMs(ms);
      if (ms <= 0 && !hasFiredTimeUp) {
        setHasFiredTimeUp(true);
        onTimeUp?.();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [mode, examEndTime, hasFiredTimeUp, onTimeUp]);

  const isUrgent = mode === 'exam' && remainingMs <= 10 * 60 * 1000;
  const isCritical = mode === 'exam' && remainingMs <= 5 * 60 * 1000;

  const updateField = (field: keyof EssaySections, value: string, isiIdx?: number) => {
    if (field === 'isi' && isiIdx !== undefined) {
      const nextIsi = [...sections.isi];
      nextIsi[isiIdx] = value;
      onSectionsChange({ ...sections, isi: nextIsi });
    } else {
      onSectionsChange({ ...sections, [field]: value } as EssaySections);
    }
  };

  const handleCancel = () => {
    soundManager.playClick();
    const warning =
      mode === 'exam'
        ? 'Adakah anda pasti mahu keluar? Exam akan dibatalkan dan karangan ini tidak akan dinilai.'
        : 'Adakah anda pasti mahu keluar? Draf karangan ini akan disimpan, tetapi anda akan kembali ke menu PKSK.';
    if (confirm(warning)) {
      onCancel();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      <button
        onClick={handleCancel}
        className="flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-ink-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke PKSK</span>
      </button>

      {mode === 'exam' && examEndTime && (
        <div
          className={`sticky top-0 z-10 rounded-3xl border p-4 flex items-center justify-between gap-3 ${
            isCritical
              ? 'bg-clay-100 border-clay-300 animate-pulse'
              : isUrgent
              ? 'bg-honey-100 border-honey-300'
              : 'bg-cream-50 border-sand-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {isCritical ? <AlertTriangle className="w-5 h-5 text-clay-500" /> : <Clock className="w-5 h-5 text-mist-600" />}
            <span className="text-xs font-bold text-ink-500">MASA</span>
          </div>
          <span className={`text-2xl font-display font-bold tabular-nums ${isCritical ? 'text-clay-500' : isUrgent ? 'text-honey-500' : 'text-ink-900'}`}>
            {formatTime(remainingMs)}
          </span>
        </div>
      )}

      <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wide text-mist-600 bg-mist-100 px-2 py-0.5 rounded-lg">
          {question.topic}
        </span>
        <p className="text-sm sm:text-base font-semibold text-ink-900 leading-relaxed whitespace-pre-line">
          {question.question}
        </p>
        <p className="text-[11px] text-ink-500 font-semibold pt-1">
          Jumlah perkataan: {total} / Sasaran: ±{target} patah perkataan
        </p>
      </div>

      {coachPanel}

      <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-bold text-ink-700 mb-1.5">Pengenalan</label>
          <textarea
            rows={3}
            value={sections.pengenalan}
            onChange={(e) => updateField('pengenalan', e.target.value)}
            placeholder="Mulakan karangan anda di sini..."
            className="w-full bg-cream-100 border border-sand-300 focus:border-mist-400 text-ink-900 text-sm rounded-2xl p-3.5 outline-none transition-colors resize-y leading-relaxed"
          />
        </div>

        {Array.from({ length: isiCount }).map((_, idx) => (
          <div key={idx}>
            <label className="block text-xs font-bold text-ink-700 mb-1.5">Isi {idx + 1}</label>
            <textarea
              rows={4}
              value={sections.isi[idx] || ''}
              onChange={(e) => updateField('isi', e.target.value, idx)}
              placeholder={`Tulis isi ${idx + 1} anda di sini...`}
              className="w-full bg-cream-100 border border-sand-300 focus:border-mist-400 text-ink-900 text-sm rounded-2xl p-3.5 outline-none transition-colors resize-y leading-relaxed"
            />
          </div>
        ))}

        <div>
          <label className="block text-xs font-bold text-ink-700 mb-1.5">Penutup</label>
          <textarea
            rows={3}
            value={sections.penutup}
            onChange={(e) => updateField('penutup', e.target.value)}
            placeholder="Tutup karangan anda di sini..."
            className="w-full bg-cream-100 border border-sand-300 focus:border-mist-400 text-ink-900 text-sm rounded-2xl p-3.5 outline-none transition-colors resize-y leading-relaxed"
          />
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting || total === 0}
        className="w-full py-4 px-6 bg-mist-500 hover:bg-mist-600 disabled:opacity-50 text-white font-bold text-base rounded-2xl transition-colors flex items-center justify-center gap-2"
      >
        <Send className="w-5 h-5" />
        <span>{isSubmitting ? 'Menghantar...' : mode === 'exam' ? 'Hantar Karangan' : 'Hantar untuk Maklum Balas AI'}</span>
      </button>
    </div>
  );
};

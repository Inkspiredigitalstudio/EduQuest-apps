import React, { useEffect, useState } from 'react';
import { soundManager } from '../../lib/audio';
import { fetchUasaChapters } from '../../lib/uasa';
import { UasaSubject, UasaChapter, UasaYear } from '../../types';
import { ArrowLeft, ArrowRight, BookOpen, Heart, ShieldCheck, Compass, Lock, Target, GraduationCap } from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = { BookOpen, Heart, ShieldCheck, Compass };

interface UasaEntryProps {
  subjects: UasaSubject[];
  onStartPractice: (year: UasaYear, subject: UasaSubject, chapter: UasaChapter) => void;
  onStartExam: (year: UasaYear, subject: UasaSubject) => Promise<void> | void;
  onBack: () => void;
}

type Step = 'year' | 'subject' | 'mode' | 'chapter';

export const UasaEntry: React.FC<UasaEntryProps> = ({ subjects, onStartPractice, onStartExam, onBack }) => {
  const [step, setStep] = useState<Step>('year');
  const [year, setYear] = useState<UasaYear | null>(null);
  const [subject, setSubject] = useState<UasaSubject | null>(null);
  const [chapters, setChapters] = useState<UasaChapter[]>([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [isStartingExam, setIsStartingExam] = useState(false);

  useEffect(() => {
    if (step !== 'chapter' || !subject || !year) return;
    setIsLoadingChapters(true);
    fetchUasaChapters(subject.id, year)
      .then(setChapters)
      .finally(() => setIsLoadingChapters(false));
  }, [step, subject, year]);

  const stepBack = () => {
    soundManager.playClick();
    if (step === 'subject') setStep('year');
    else if (step === 'mode') setStep('subject');
    else if (step === 'chapter') setStep('mode');
    else onBack();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <button
        onClick={stepBack}
        className="p-2.5 rounded-2xl bg-cream-100 hover:bg-cream-200 text-ink-700 border border-sand-200 transition-colors flex items-center gap-2 text-xs font-bold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali</span>
      </button>

      {step === 'year' && (
        <div className="bg-cream-50 border border-sand-200 rounded-3xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-mist-100 flex items-center justify-center text-mist-600 mx-auto">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-display font-bold text-ink-900">Pilih Tahun</h2>
          <div className="flex items-center justify-center gap-3">
            {([3, 5, 6] as const).map((y) => (
              <button
                key={y}
                onClick={() => {
                  soundManager.playClick();
                  setYear(y);
                  setStep('subject');
                }}
                className="px-8 py-5 rounded-2xl text-base font-bold border-2 bg-white hover:bg-mist-100 border-sand-200 hover:border-mist-300 text-ink-900 transition-colors"
              >
                Tahun {y}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'subject' && (
        <div className="space-y-3">
          <h2 className="text-base font-display font-bold text-ink-900 px-1">Tahun {year} — Pilih Subjek</h2>
          <div className="grid grid-cols-2 gap-3">
            {subjects.map((s) => {
              const Icon = ICON_MAP[s.icon] || BookOpen;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSubject(s);
                    setStep('mode');
                  }}
                  className={`rounded-3xl p-5 border-2 text-left transition-colors bg-gradient-to-br ${s.color} text-white`}
                >
                  <Icon className="w-7 h-7 mb-2" />
                  <div className="font-display font-bold">{s.name}</div>
                </button>
              );
            })}
          </div>
          {subjects.length === 0 && (
            <div className="bg-cream-50 border border-sand-200 rounded-3xl p-6 text-center text-sm text-ink-500">
              Tiada subjek UASA tersedia lagi.
            </div>
          )}
        </div>
      )}

      {step === 'mode' && subject && year && (
        <div className="space-y-3">
          <h2 className="text-base font-display font-bold text-ink-900 px-1">
            Tahun {year} • {subject.name}
          </h2>
          <button
            onClick={() => {
              soundManager.playClick();
              setStep('chapter');
            }}
            className="w-full text-left rounded-3xl bg-mist-100 hover:bg-mist-200/70 border border-mist-200 p-5 flex items-center justify-between gap-4 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cream-50 text-mist-600 shadow-sm flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-ink-900">Latihan (Practice)</h3>
                <p className="text-xs text-ink-500">Ikut bab, ada penerangan, tiada had masa</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-mist-600" />
          </button>

          <button
            disabled={isStartingExam}
            onClick={async () => {
              if (isStartingExam) return;
              soundManager.playClick();
              setIsStartingExam(true);
              try {
                await onStartExam(year, subject);
              } finally {
                setIsStartingExam(false);
              }
            }}
            className="w-full text-left rounded-3xl bg-clay-100 hover:bg-clay-200/70 border border-clay-200 p-5 flex items-center justify-between gap-4 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cream-50 text-clay-500 shadow-sm flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-ink-900">Exam UASA</h3>
                <p className="text-xs text-ink-500">
                  {isStartingExam ? 'Sedang mula exam...' : '75 minit • Bahagian A+B+C • 50 markah'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-clay-500" />
          </button>
        </div>
      )}

      {step === 'chapter' && subject && year && (
        <div className="space-y-3">
          <h2 className="text-base font-display font-bold text-ink-900 px-1">
            Tahun {year} • {subject.name} — Pilih Bab
          </h2>
          {isLoadingChapters ? (
            <div className="bg-cream-50 border border-sand-200 rounded-3xl p-10 text-center">
              <div className="w-10 h-10 border-4 border-mist-200 border-t-mist-500 rounded-full animate-spin mx-auto" />
            </div>
          ) : chapters.length > 0 ? (
            <div className="space-y-2.5">
              {chapters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    soundManager.playClick();
                    onStartPractice(year, subject, c);
                  }}
                  className="w-full text-left rounded-2xl bg-cream-50 hover:bg-mist-100 border border-sand-200 hover:border-mist-300 p-4 flex items-center justify-between gap-3 transition-colors"
                >
                  <span className="font-bold text-sm text-ink-900">{c.name}</span>
                  <ArrowRight className="w-4 h-4 text-mist-600 shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-cream-50 border border-sand-200 rounded-3xl p-6 text-center space-y-2">
              <Lock className="w-7 h-7 text-ink-500 mx-auto" />
              <p className="text-sm text-ink-700 font-semibold">Belum ada bab untuk subjek/tahun ini.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

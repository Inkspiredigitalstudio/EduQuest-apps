import React, { useState } from 'react';
import { Subject, Paper, Section, UserProgress } from '../../types';
import { soundManager } from '../../lib/audio';
import { PKSK_EXAM_SET_PAPER_PREFIX } from '../../lib/supabase';
import { ArrowLeft, Calendar, FileText, CheckCircle2, Play, Award, BookOpen } from 'lucide-react';

interface SubjectViewProps {
  subject: Subject;
  papers: Paper[];
  sections: Section[];
  userProgress: UserProgress[];
  onBack: () => void;
  onSelectSection: (paper: Paper, section: Section) => void;
  // 'pksk' switches to a list-button layout with the grape accent and drops
  // the "Bahagian {name}" badge (PKSK section names are subject categories
  // like "Matematik", not exam-paper letters, so that label doubled up with
  // the title below it — see PKSK v2 restructure doc #2). SPPIM is unaffected
  // by leaving this unset.
  module?: 'sppim' | 'pksk';
}

// Strips a leading "Bank " (any case) from section names/titles — PKSK
// practice sections were named things like "Bank Insaniah 2026" for internal
// clarity, but that word shouldn't leak into student-facing labels.
function cleanPkskLabel(text: string): string {
  return text.replace(/^bank\s+/i, '');
}

export const SubjectView: React.FC<SubjectViewProps> = ({ subject, papers, sections, userProgress, onBack, onSelectSection, module = 'sppim' }) => {
  const isPksk = module === 'pksk';
  // Pre-generated PKSK Exam Sets (see PKSK_Structural_Revision.md #6) are
  // whole papers reserved for the dedicated mixed-exam entry point, not
  // regular per-subject Practice Mode browsing — exclude them here so they
  // can't be reached (and don't leak Bahagian-A/B category identity) via the
  // normal subject → paper → section drill-down.
  const filteredPapers = papers.filter((p) => p.subject_id === subject.id && !p.title.startsWith(PKSK_EXAM_SET_PAPER_PREFIX));
  const [selectedPaperId, setSelectedPaperId] = useState<string>(filteredPapers[0]?.id || '');

  const currentPaper = filteredPapers.find((p) => p.id === selectedPaperId) || filteredPapers[0];
  const paperSections = sections.filter((s) => s.paper_id === currentPaper?.id);

  return (
    <div className="space-y-6 pb-12">
      <button
        onClick={() => {
          soundManager.playClick();
          onBack();
        }}
        className="p-2.5 rounded-2xl bg-cream-50 hover:bg-cream-100 text-ink-700 border border-sand-200 transition-colors flex items-center gap-2 text-xs font-bold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Papan Utama</span>
      </button>

      {/* Subject Header Banner */}
      <div className={`rounded-3xl bg-gradient-to-r ${subject.color} p-6 sm:p-8 text-white relative overflow-hidden`}>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Subjek Pengajian</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">{subject.name}</h1>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl">{subject.description}</p>
          </div>

          <div className="bg-white/20 backdrop-blur p-4 rounded-2xl text-center shrink-0">
            <span className="text-[11px] uppercase tracking-wide text-white/80 font-bold">Jumlah Kertas</span>
            <div className="text-2xl font-display font-bold mt-0.5">{filteredPapers.length} Kertas</div>
          </div>
        </div>
      </div>

      {/* Year / Paper Tabs */}
      <div>
        <h2 className="text-sm font-bold text-ink-500 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-mist-500" />
          <span>Pilih Tahun / Kertas Soalan</span>
        </h2>

        <div className="flex flex-wrap gap-2">
          {filteredPapers.map((paper) => {
            const isSelected = paper.id === currentPaper?.id;
            return (
              <button
                key={paper.id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedPaperId(paper.id);
                }}
                className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 ${
                  isSelected ? 'bg-mist-500 text-white' : 'bg-cream-50 text-ink-500 hover:bg-cream-100 border border-sand-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{paper.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sections List */}
      {currentPaper && (
        <div className="bg-cream-50 border border-sand-200 p-5 rounded-3xl">
          <h3 className="text-lg font-display font-bold text-ink-900">{currentPaper.title}</h3>
          <p className="text-xs text-ink-500 mt-1">Pilih bahagian untuk mula menjawab soalan latihan</p>

          <div className={isPksk ? 'flex flex-col gap-2.5 max-w-lg mx-auto mt-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'}>
            {paperSections.map((section) => {
              const prog = userProgress.find((p) => p.section_id === section.id);
              const isCompleted = prog?.is_completed || false;
              const bestScore = prog?.best_score ?? null;

              if (isPksk) {
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      soundManager.playClick();
                      onSelectSection(currentPaper, section);
                    }}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border-2 bg-grape-100 hover:bg-grape-200/70 border-grape-200 hover:border-grape-300 transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-base text-ink-900 truncate">{cleanPkskLabel(section.name)}</div>
                      {bestScore !== null ? (
                        <div className="flex items-center gap-1.5 text-xs text-honey-500 font-bold mt-0.5">
                          <Award className="w-3.5 h-3.5" />
                          <span>Skor Terbaik: {bestScore}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-500">Belum Dicuba</span>
                      )}
                    </div>
                    <span className="flex items-center gap-2 shrink-0">
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-sage-500" />}
                      <Play className="w-4 h-4 text-grape-500 fill-grape-500" />
                    </span>
                  </button>
                );
              }

              return (
                <div
                  key={section.id}
                  className="bg-cream-100 hover:bg-mist-100/50 border border-sand-200 hover:border-mist-300 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-mist-600 bg-mist-100 px-2.5 py-1 rounded-lg">
                        Bahagian {section.name}
                      </span>

                      {isCompleted && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-sage-600 bg-sage-100 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Selesai</span>
                        </div>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-ink-900">{section.title}</h4>
                  </div>

                  <div className="pt-3 border-t border-sand-200 flex items-center justify-between">
                    {bestScore !== null ? (
                      <div className="flex items-center gap-1.5 text-xs text-honey-500 font-bold bg-honey-100 px-2.5 py-1 rounded-lg">
                        <Award className="w-3.5 h-3.5" />
                        <span>Skor Terbaik: {bestScore}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-ink-500">Belum Dicuba</span>
                    )}

                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onSelectSection(currentPaper, section);
                      }}
                      className="bg-mist-500 hover:bg-mist-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{isCompleted ? 'Cuba Lagi' : 'Mula Jawab'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

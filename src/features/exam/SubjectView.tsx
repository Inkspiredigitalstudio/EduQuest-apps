import React, { useState } from 'react';
import { Subject, Paper, Section, UserProgress } from '../../types';
import { soundManager } from '../../lib/audio';
import { ArrowLeft, Calendar, FileText, CheckCircle2, Play, Award, BookOpen } from 'lucide-react';

interface SubjectViewProps {
  subject: Subject;
  papers: Paper[];
  sections: Section[];
  userProgress: UserProgress[];
  onBack: () => void;
  onSelectSection: (paper: Paper, section: Section) => void;
}

export const SubjectView: React.FC<SubjectViewProps> = ({
  subject,
  papers,
  sections,
  userProgress,
  onBack,
  onSelectSection,
}) => {
  const filteredPapers = papers.filter((p) => p.subject_id === subject.id);
  const [selectedPaperId, setSelectedPaperId] = useState<string>(
    filteredPapers[0]?.id || ''
  );

  const currentPaper = filteredPapers.find((p) => p.id === selectedPaperId) || filteredPapers[0];
  const paperSections = sections.filter((s) => s.paper_id === currentPaper?.id);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            soundManager.playClick();
            onBack();
          }}
          className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Papan Utama</span>
        </button>
      </div>

      {/* Subject Header Banner */}
      <div className={`rounded-3xl bg-gradient-to-r ${subject.color} p-6 sm:p-8 text-white shadow-xl relative overflow-hidden`}>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5 text-yellow-300" />
              <span>Subjek Pengajian</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{subject.name}</h1>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl">{subject.description}</p>
          </div>

          <div className="bg-black/30 backdrop-blur border border-white/20 p-4 rounded-2xl text-center shrink-0">
            <span className="text-[11px] uppercase tracking-wider text-white/80 font-bold">Jumlah Kertas Soalan</span>
            <div className="text-2xl font-black text-yellow-300 mt-0.5">{filteredPapers.length} Kertas</div>
          </div>
        </div>
      </div>

      {/* Year / Paper Tabs */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-400" />
          <span>Pilih Tahun / Kertas Soalan Peperiksaan</span>
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
                className={`px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border-2 border-blue-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Tahun {paper.year}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sections List for Selected Paper */}
      {currentPaper && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
            <h3 className="text-lg font-extrabold text-white">{currentPaper.title}</h3>
            <p className="text-xs text-slate-400 mt-1">Pilih bahagian untuk mula menjawab soalan latihan</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {paperSections.map((section) => {
                const prog = userProgress.find((p) => p.section_id === section.id);
                const isCompleted = prog?.is_completed || false;
                const bestScore = prog?.best_score ?? null;

                return (
                  <div
                    key={section.id}
                    className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:border-blue-500/50 shadow-md group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-lg">
                          Bahagian {section.name}
                        </span>

                        {isCompleted && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Selesai</span>
                          </div>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                        {section.title}
                      </h4>
                    </div>

                    <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                      {bestScore !== null ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          <Award className="w-3.5 h-3.5" />
                          <span>Skor Terbaik: {bestScore}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Belum Dicuba</span>
                      )}

                      <button
                        onClick={() => {
                          soundManager.playClick();
                          onSelectSection(currentPaper, section);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
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
        </div>
      )}
    </div>
  );
};

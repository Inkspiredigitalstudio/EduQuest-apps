import React from 'react';
import { Subject, UserProfile, DailyMission, Paper, Section, UserProgress } from '../../types';
import { soundManager } from '../../lib/audio';
import { PendingLinksWidget } from './PendingLinksWidget';
import { SubjectGrid } from './SubjectGrid';
import {
  BookOpen,
  Heart,
  ShieldCheck,
  Compass,
  Lock,
  CheckCircle,
  ArrowRight,
  Target,
  Coins,
  Swords,
  Play,
  PenSquare,
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile | null;
  subjects: Subject[];
  papers?: Paper[];
  sections?: Section[];
  pkskSubjects?: Subject[];
  pkskPapers?: Paper[];
  pkskSections?: Section[];
  pkskUserProgress?: UserProgress[];
  userProgress?: UserProgress[];
  dailyMissions: DailyMission[];
  isContentLoading?: boolean;
  contentLoadFailed?: boolean;
  onSelectSubject: (subject: Subject) => void;
  onSelectSection?: (paper: Paper, section: Section) => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenBattle?: () => void;
  onOpenAchievements?: () => void;
  onOpenSocial?: () => void;
  onOpenArticulation?: () => void;
  onOpenPkskExam?: () => void;
  pkskExamSetReady?: boolean;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  BookOpen,
  Heart,
  ShieldCheck,
  Compass,
};

// Computes the list of papers currently IN-PROGRESS for one module, sorted
// by most recent activity. Shared by SPPIM and PKSK so "Sambung Belajar" can
// merge both without duplicating this logic.
function computeInProgressPapers(
  papers: Paper[] | undefined,
  sections: Section[] | undefined,
  subjects: Subject[],
  userProgress: UserProgress[] | undefined,
  moduleLabel: 'SPPIM' | 'PKSK'
) {
  if (!papers || !sections) return [];

  const mapped = papers
    .map((paper) => {
      const subject = subjects.find((s) => s.id === paper.subject_id);
      const paperSections = sections
        .filter((sec) => sec.paper_id === paper.id)
        .sort((a, b) => a.order - b.order);

      if (!subject || paperSections.length === 0) return null;

      const totalSections = paperSections.length;
      let maxProgressIndex = -1;
      let startedCount = 0;
      let completedCount = 0;

      paperSections.forEach((sec) => {
        const idx = userProgress ? userProgress.findIndex((p) => p.section_id === sec.id) : -1;
        if (idx >= 0) {
          startedCount++;
          if (idx > maxProgressIndex) maxProgressIndex = idx;
          const prog = userProgress![idx];
          if (prog.is_completed || prog.best_score > 0) completedCount++;
        }
      });

      const count = Math.max(startedCount, completedCount);
      const nextSection =
        paperSections.find((sec) => {
          const prog = userProgress?.find((p) => p.section_id === sec.id);
          return !prog || (!prog.is_completed && prog.best_score === 0);
        }) || paperSections[0];

      const progressPercent = Math.round((count / totalSections) * 100);
      const isInProgress = count > 0 && completedCount < totalSections;

      return { moduleLabel, paper, subject, paperSections, totalSections, count, completedCount, nextSection, progressPercent, isInProgress, maxProgressIndex };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item && item.isInProgress));

  return mapped;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  subjects,
  papers,
  sections,
  pkskSubjects,
  pkskPapers,
  pkskSections,
  pkskUserProgress,
  userProgress,
  dailyMissions,
  isContentLoading,
  contentLoadFailed,
  onSelectSubject,
  onSelectSection,
  onOpenAuth,
  onOpenBattle,
  onOpenArticulation,
  onOpenPkskExam,
  pkskExamSetReady,
}) => {
  const [activeModuleTab, setActiveModuleTab] = React.useState<'sppim' | 'pksk' | 'uasa'>('sppim');

  const hubModules = [
    { id: 'sppim', name: 'SPPIM', active: true },
    { id: 'pksk', name: 'PKSK', active: true },
    { id: 'uasa', name: 'UASA', active: false },
  ];

  // Merge in-progress papers from both modules — sorted by most recent
  // activity, each item tagged with which module it belongs to.
  const inProgressPapers = React.useMemo(() => {
    const sppim = computeInProgressPapers(papers, sections, subjects, userProgress, 'SPPIM');
    const pksk = computeInProgressPapers(pkskPapers, pkskSections, pkskSubjects || [], pkskUserProgress, 'PKSK');
    return [...sppim, ...pksk].sort((a, b) => b.maxProgressIndex - a.maxProgressIndex);
  }, [papers, sections, subjects, userProgress, pkskPapers, pkskSections, pkskSubjects, pkskUserProgress]);

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {/* Pending Links Notification for Students */}
      {user && <PendingLinksWidget user={user} />}

      {/* Hero Greeting Card — calm, no glow/blur clutter */}
      <div className="rounded-3xl bg-mist-100 border border-mist-200 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center gap-3 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-cream-50 border border-mist-200 flex items-center justify-center text-mist-600 shadow-sm">
            <Compass className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-ink-900 leading-snug">
            {user ? (
              <>Assalamu'alaikum, {user.name.split(' ')[0]}!</>
            ) : (
              <>Assalamu'alaikum!</>
            )}
          </h1>
          <p className="text-sm text-ink-500">Sedia untuk cabar diri hari ini?</p>
        </div>
      </div>

      {/* Battle 1v1 Banner — calm card, no pulsing */}
      <button
        onClick={() => {
          soundManager.playClick();
          onOpenBattle?.();
        }}
        className="w-full text-left rounded-3xl bg-clay-100 border border-clay-200 p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-clay-200/60 transition-colors"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-cream-50 text-clay-500 shadow-sm flex items-center justify-center shrink-0">
            <Swords className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-display font-bold text-ink-900">Battle 1v1</h2>
            <p className="text-xs sm:text-sm text-ink-500">Jom cabar kawan!</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-clay-500 shrink-0" />
      </button>

      {/* Continue Learning Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-display font-bold text-ink-900 flex items-center gap-2">
            <span>Sambung Belajar</span>
          </h3>
          <span className="text-xs font-semibold text-ink-500">
            {inProgressPapers.length} belum selesai
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {inProgressPapers.length > 0 ? (
            inProgressPapers.map((item) => {
              const IconComp = ICON_MAP[item.subject.icon] || BookOpen;

              return (
                <div
                  key={item.paper.id}
                  onClick={() => {
                    soundManager.playClick();
                    if (onSelectSection && item.paper && item.nextSection) {
                      onSelectSection(item.paper, item.nextSection);
                    } else if (item.subject) {
                      onSelectSubject(item.subject);
                    }
                  }}
                  className="bg-cream-50 border border-sand-200 rounded-3xl p-4 flex flex-col items-center text-center justify-between space-y-2.5 hover:border-mist-300 transition-colors cursor-pointer"
                >
                  <div className="w-full flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-mist-100 flex items-center justify-center text-mist-600 shrink-0">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold bg-honey-100 text-honey-500 px-2.5 py-0.5 rounded-full">
                      {item.progressPercent}%
                    </span>
                  </div>

                  <div className="w-full text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wide text-mist-600 bg-mist-100 px-1.5 py-0.5 rounded-md">
                        {item.moduleLabel}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-ink-900 line-clamp-1 mt-1">
                      {item.subject.name} ({item.paper.year})
                    </h4>
                    <p className="text-[11px] text-ink-500 font-semibold mt-0.5">
                      {item.count}/{item.totalSections} bahagian
                    </p>
                  </div>

                  <div className="w-full bg-cream-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-honey-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(8, item.progressPercent)}%` }}
                    />
                  </div>

                  <div className="pt-1 w-full">
                    <button className="w-full py-1.5 px-3 bg-honey-400 hover:bg-honey-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5">
                      <span>Sambung</span>
                      <Play className="w-3 h-3 fill-white" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 p-6 bg-cream-50 border border-sand-200 rounded-3xl text-center space-y-2">
              <BookOpen className="w-8 h-8 text-honey-400 mx-auto" />
              <p className="text-sm font-semibold text-ink-700">Tiada latihan yang belum siap</p>
            </div>
          )}
        </div>
      </div>

      {/* Module Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-display font-bold text-ink-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-mist-500" />
            <span>Pilih Modul Peperiksaan</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {hubModules.map((mod) => {
            const isSelected = activeModuleTab === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveModuleTab(mod.id as any);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 border transition-colors flex items-center gap-2 ${
                  isSelected
                    ? 'bg-mist-500 text-white border-mist-500'
                    : 'bg-cream-50 hover:bg-cream-100 text-ink-500 border-sand-200'
                }`}
              >
                <span>{mod.name}</span>
                {!mod.active && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-white/20">
                    Segera
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Artikulasi Karangan (Bahagian C) has its own data fetching inside
            ArticulationScreen — it doesn't depend on subjects/papers/questions
            loading below, so it stays reachable even if that content fails. */}
        {activeModuleTab === 'pksk' && onOpenArticulation && (
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenArticulation();
            }}
            className="w-full text-left rounded-3xl bg-mist-100 hover:bg-mist-200/70 border border-mist-200 p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-cream-50 text-mist-600 shadow-sm flex items-center justify-center shrink-0">
                <PenSquare className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-display font-bold text-ink-900">Artikulasi Karangan</h2>
                <p className="text-xs sm:text-sm text-ink-500">Bahagian C — Bertulis. Berlatih atau uji diri dalam Exam Mode.</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-mist-600 shrink-0" />
          </button>
        )}

        {/* Exam PKSK — the real 100-question mixed A+B sitting (doc:
            PKSK_Structural_Revision.md). Only shown once an "PKSK Exam" set
            actually exists in the DB — Practice Mode below (per-subject
            cards) always works regardless. */}
        {activeModuleTab === 'pksk' && onOpenPkskExam && pkskExamSetReady && (
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenPkskExam();
            }}
            className="w-full text-left rounded-3xl bg-grape-100 hover:bg-grape-200/70 border border-grape-200 p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-cream-50 text-grape-500 shadow-sm flex items-center justify-center shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-display font-bold text-ink-900">Exam PKSK — Bahagian A & B</h2>
                <p className="text-xs sm:text-sm text-ink-500">100 soalan bercampur • 90 minit • satu sitting sebenar.</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-grape-500 shrink-0" />
          </button>
        )}

        {isContentLoading ? (
          <div className="bg-cream-50 border border-sand-200 rounded-3xl p-10 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-mist-200 border-t-mist-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-ink-500 font-semibold">Memuatkan soalan...</p>
          </div>
        ) : contentLoadFailed ? (
          <div className="bg-clay-100 border border-clay-200 rounded-3xl p-8 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-clay-500 mx-auto" />
            <h3 className="text-sm font-display font-bold text-ink-900">Tidak Dapat Muatkan Soalan</h3>
            <p className="text-xs text-ink-500 max-w-xs mx-auto">
              Sila semak sambungan internet dan cuba muat semula halaman ini.
            </p>
          </div>
        ) : activeModuleTab === 'sppim' ? (
          <SubjectGrid subjects={subjects} papers={papers} onSelect={onSelectSubject} />
        ) : activeModuleTab === 'pksk' ? (
          <div className="space-y-4">
            {pkskSubjects && pkskSubjects.length > 0 ? (
              <SubjectGrid subjects={pkskSubjects} papers={pkskPapers} onSelect={onSelectSubject} layout="list" />
            ) : (
              <div className="bg-cream-50 border border-sand-200 rounded-3xl p-6 text-center space-y-3 my-2">
                <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto text-ink-500">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-display font-bold text-ink-900">Bank Soalan Belum Sedia</h3>
                <p className="text-xs text-ink-500 max-w-xs mx-auto">
                  EduQuest sedang menyediakan bank soalan Bahagian A/B untuk modul PKSK. Artikulasi Karangan (Bahagian C) di atas sudah boleh diakses.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-cream-50 border border-sand-200 rounded-3xl p-6 text-center space-y-3 my-2">
            <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto text-ink-500">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-display font-bold text-ink-900">Modul Akan Datang</h3>
            <p className="text-xs text-ink-500 max-w-xs mx-auto">
              EduQuest sedang menyediakan bank soalan untuk modul ini. Buat masa ini, sila teruskan dengan <strong className="text-ink-700">Modul SPPIM</strong>.
            </p>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveModuleTab('sppim');
              }}
              className="px-4 py-2 bg-mist-500 hover:bg-mist-600 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Kembali ke Modul SPPIM
            </button>
          </div>
        )}
      </div>

      {/* Daily Missions Widget */}
      <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-honey-100 rounded-xl text-honey-500">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-display font-bold text-ink-900">Misi Harian</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dailyMissions.map((mission) => (
            <div
              key={mission.id}
              className={`p-4 rounded-2xl border transition-colors ${
                mission.is_completed ? 'bg-sage-100 border-sage-200' : 'bg-cream-100 border-sand-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-ink-700 truncate">{mission.title}</span>
                {mission.is_completed ? (
                  <CheckCircle className="w-4 h-4 text-sage-600 shrink-0" />
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-honey-500 bg-honey-100 px-2 py-0.5 rounded-lg shrink-0">
                    <Coins className="w-3 h-3" />
                    +{mission.reward_coins}
                  </span>
                )}
              </div>

              <div className="mt-2.5">
                <div className="w-full bg-cream-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      mission.is_completed ? 'bg-sage-500' : 'bg-honey-400'
                    }`}
                    style={{ width: `${Math.min(100, (mission.current / mission.target) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

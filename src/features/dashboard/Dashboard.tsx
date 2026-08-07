import React from 'react';
import { Subject, UserProfile, DailyMission, Paper, Section, UserProgress } from '../../types';
import { soundManager } from '../../lib/audio';
import { PendingLinksWidget } from './PendingLinksWidget';
import { ObserverLinkPanel } from './ObserverLinkPanel';
import {
  BookOpen,
  Heart,
  ShieldCheck,
  Compass,
  Lock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Coins,
  Star,
  Swords,
  Users,
  Award,
  Play,
  Flame,
  Zap,
  Clock,
  ListChecks,
  RotateCcw,
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile | null;
  subjects: Subject[];
  papers?: Paper[];
  sections?: Section[];
  userProgress?: UserProgress[];
  dailyMissions: DailyMission[];
  onSelectSubject: (subject: Subject) => void;
  onSelectSection?: (paper: Paper, section: Section) => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenParent: () => void;
  onOpenBattle?: () => void;
  onOpenAchievements?: () => void;
  onOpenSocial?: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  BookOpen,
  Heart,
  ShieldCheck,
  Compass,
};

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  subjects,
  papers,
  sections,
  userProgress,
  dailyMissions,
  onSelectSubject,
  onSelectSection,
  onOpenAuth,
  onOpenProfile,
  onOpenParent,
  onOpenBattle,
  onOpenAchievements,
  onOpenSocial,
}) => {
  const [activeModuleTab, setActiveModuleTab] = React.useState<
    'sppim' | 'pksk' | 'uasa'
  >('sppim');

  const hubModules = [
    { id: 'sppim', name: 'SPPIM-Quest', badge: 'Aktif', active: true },
    { id: 'pksk', name: 'PKSK Quest', badge: 'Locked 🔒', active: false },
    { id: 'uasa', name: 'UASA Quest', badge: 'Locked 🔒', active: false },
  ];

  // Pick first available active subject for fallback
  const primarySubject = subjects.find((s) => s.status === 'active') || subjects[0];

  // Compute overall list of exercise items across all subjects & sections
  const allExerciseList = React.useMemo(() => {
    if (!sections || !papers) return [];

    return sections
      .map((sec) => {
        const paper = papers.find((p) => p.id === sec.paper_id);
        const subject = subjects.find((s) => s.id === paper?.subject_id);
        const prog = userProgress?.find((p) => p.section_id === sec.id);

        const totalQuestions = prog?.total_questions || 5;
        const score = prog?.best_score || 0;
        const isCompleted = prog?.is_completed || false;
        const percent = isCompleted
          ? 100
          : Math.min(99, Math.round((score / totalQuestions) * 100));

        return {
          section: sec,
          paper,
          subject,
          prog,
          score,
          totalQuestions,
          isCompleted,
          percent,
        };
      })
      .filter(
        (item): item is {
          section: Section;
          paper: Paper;
          subject: Subject;
          prog?: UserProgress;
          score: number;
          totalQuestions: number;
          isCompleted: boolean;
          percent: number;
        } => Boolean(item.paper && item.subject)
      );
  }, [sections, papers, subjects, userProgress]);

  // Compute list of papers currently IN-PROGRESS (started but not all sections completed), sorted by most recent activity
  const inProgressPapers = React.useMemo(() => {
    if (!papers || !sections) return [];

    const mapped = papers
      .map((paper) => {
        const subject = subjects.find((s) => s.id === paper.subject_id);
        const paperSections = sections
          .filter((sec) => sec.paper_id === paper.id)
          .sort((a, b) => a.order - b.order);

        if (!subject || paperSections.length === 0) return null;

        const totalSections = paperSections.length;

        // Find max progress index in userProgress array (to sort by most recently attempted)
        let maxProgressIndex = -1;
        let startedCount = 0;
        let completedCount = 0;

        paperSections.forEach((sec) => {
          const idx = userProgress ? userProgress.findIndex((p) => p.section_id === sec.id) : -1;
          if (idx >= 0) {
            startedCount++;
            if (idx > maxProgressIndex) {
              maxProgressIndex = idx;
            }
            const prog = userProgress![idx];
            if (prog.is_completed || prog.best_score > 0) {
              completedCount++;
            }
          }
        });

        const count = Math.max(startedCount, completedCount);

        // Find the next uncompleted section to resume
        const nextSection =
          paperSections.find((sec) => {
            const prog = userProgress?.find((p) => p.section_id === sec.id);
            return !prog || (!prog.is_completed && prog.best_score === 0);
          }) || paperSections[0];

        const progressPercent = Math.round((count / totalSections) * 100);

        // A paper is in progress if at least 1 section was attempted/started AND not all sections are completed
        const isInProgress = count > 0 && completedCount < totalSections;

        return {
          paper,
          subject,
          paperSections,
          totalSections,
          count,
          completedCount,
          nextSection,
          progressPercent,
          isInProgress,
          maxProgressIndex,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item && item.isInProgress));

    // Sort by maxProgressIndex descending so the MOST RECENTLY active paper is first
    return mapped.sort((a, b) => b.maxProgressIndex - a.maxProgressIndex);
  }, [papers, sections, subjects, userProgress]);

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {/* Pending Links Notification for Students */}
      {user && <PendingLinksWidget user={user} />}

      {/* Hero Focal Section — Single Clean Gamified Featured Action Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 border-2 border-sky-500/30 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-xl mx-auto py-2">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Modul SPPIM-Quest • Peperiksaan Sebenar</span>
          </div>

          {/* Main Title */}
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white leading-tight space-y-1">
            {user ? (
              <>
                <div>
                  Assalamu'alaikum <span className="text-amber-300">{user.name.split(' ')[0]}</span>!
                </div>
                <div>Sedia Cabar Diri?</div>
              </>
            ) : (
              <>
                <div>Assalamu'alaikum!</div>
                <div>
                  Sedia Cabar Diri di <span className="text-amber-300">SPPIM-Quest</span>?
                </div>
              </>
            )}
          </h1>
        </div>
      </div>

      {/* Battle 1v1 Banner Button */}
      <button
        onClick={() => {
          soundManager.playClick();
          onOpenBattle?.();
        }}
        className="w-full text-left relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 p-3.5 sm:p-5 text-white shadow-xl flex items-center justify-between gap-2.5 sm:gap-4 border border-rose-400/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 relative z-10 flex-1">
          {/* White Squircle Icon Container */}
          <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-white text-rose-600 shadow-lg flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
            <Swords className="w-5 h-5 sm:w-7 sm:h-7 text-rose-600" />
          </div>

          {/* Title & Caption */}
          <div className="min-w-0 space-y-0.5 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
              <h2 className="text-sm sm:text-lg font-black text-white leading-tight">
                Battle 1v1 Interaktif
              </h2>
              <span className="bg-amber-300 text-slate-950 text-[9px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs shrink-0">
                HOT 🔥
              </span>
            </div>
            <p className="text-[11px] sm:text-sm font-bold text-rose-100/95 leading-tight">
              Jom Battle Dengan Kawan!
            </p>
          </div>
        </div>

        {/* Action Button Badge on Right */}
        <div className="shrink-0 relative z-10 bg-white/20 hover:bg-white/30 backdrop-blur-md px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl border border-white/30 shadow-sm flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-black text-white group-hover:bg-white group-hover:text-rose-600 transition-all">
          <span>Cabaran 1v1</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>

        {/* Subtle decorative background glow */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-amber-400/30 rounded-full blur-2xl pointer-events-none" />
      </button>

      {/* 2. Grid Kad Latihan (2 Kolum Layout - Reference UI Middle Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Progress Latihan Terkini</span>
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {inProgressPapers.length} Belum Selesai
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
                  className="bg-white text-slate-900 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center text-center justify-between space-y-2.5 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
                >
                  {/* Top Row: Icon on left, Percentage badge on right */}
                  <div className="w-full flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shadow-inner group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors shrink-0">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
                      {item.progressPercent}%
                    </span>
                  </div>

                  {/* Middle: Paper Title & Section Fraction */}
                  <div className="w-full text-left">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {item.subject.name} ({item.paper.year})
                    </h4>
                    <p className="text-[11px] text-slate-500 font-extrabold mt-0.5">
                      {item.count}/{item.totalSections} bahagian
                    </p>
                  </div>

                  {/* Thin Orange Progress Bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(8, item.progressPercent)}%` }}
                    />
                  </div>

                  {/* Sambung Action Button */}
                  <div className="pt-1 w-full">
                    <button className="w-full py-1.5 px-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 group-hover:scale-[1.03]">
                      <span>Sambung</span>
                      <Play className="w-3 h-3 fill-slate-950" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl text-center space-y-2">
              <BookOpen className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
              <p className="text-sm font-bold text-white">
                Tiada Latihan Yang Belum Siap
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Parent / Teacher Link Observer Panel */}
      {user && (user.role === 'parent' || user.role === 'teacher') && (
        <ObserverLinkPanel user={user} />
      )}

      {/* EduQuest Exam Hub Selector (Minimalist Horizontal Bar) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400" />
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
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-black shrink-0 border transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-300 shadow-md scale-105'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                }`}
              >
                <span>{mod.name}</span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    mod.active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {mod.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Module View: SPPIM Quest vs Locked */}
        {activeModuleTab === 'sppim' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {subjects.map((sub) => {
              const IconComponent = ICON_MAP[sub.icon] || BookOpen;
              const isLocked = sub.status === 'locked';

              return (
                <div
                  key={sub.id}
                  onClick={() => {
                    if (!isLocked) {
                      soundManager.playClick();
                      onSelectSubject(sub);
                    }
                  }}
                  className={`relative group rounded-3xl p-5 border-2 transition-all duration-200 overflow-hidden ${
                    isLocked
                      ? 'bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800/90 border-slate-800 hover:border-sky-500/60 cursor-pointer shadow-lg hover:shadow-sky-500/10 hover:scale-[1.02]'
                  }`}
                >
                  <div
                    className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${sub.color} opacity-15 blur-xl rounded-full group-hover:opacity-30 transition-opacity`}
                  />

                  <div className="relative z-10 space-y-4">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${sub.color} flex items-center justify-center text-white shadow-md`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>

                      {isLocked ? (
                        <span className="text-[10px] font-black uppercase bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Kunci
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
                          Sedia
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-medium">
                        {sub.description}
                      </p>
                    </div>

                    {/* Action Footer */}
                    {!isLocked && (
                      <div className="pt-2 flex items-center justify-between text-xs font-bold text-sky-400 border-t border-slate-800/80">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>4 Kertas Exam</span>
                        </span>
                        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Mula</span>
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Locked Module Indicator */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-3 my-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Modul Dalam Pembinaan</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Bank soalan untuk modul ini sedang disediakan. Sila pilih <strong className="text-amber-300">SPPIM-Quest</strong> untuk mula menjawab.
            </p>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveModuleTab('sppim');
              }}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Kembali ke SPPIM-Quest
            </button>
          </div>
        )}
      </div>

      {/* Daily Missions Widget — Compact Gamified Horizontal List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black text-white">Misi Harian (Ganjaran Koin)</h2>
          </div>
          <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            Bonus Hari Ini
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dailyMissions.map((mission) => (
            <div
              key={mission.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                mission.is_completed
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-800/50 border-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-200 truncate">{mission.title}</span>
                {mission.is_completed ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0">
                    <Coins className="w-3 h-3" />
                    +{mission.reward_coins}
                  </span>
                )}
              </div>

              <div className="mt-2.5">
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      mission.is_completed ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    style={{
                      width: `${Math.min(100, (mission.current / mission.target) * 100)}%`,
                    }}
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

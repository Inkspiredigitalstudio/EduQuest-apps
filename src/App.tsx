import React, { useState, useEffect } from 'react';
import { UserProfile, Subject, Paper, Section, Question, UserProgress, DailyMission } from './types';
import { DEFAULT_DAILY_MISSIONS } from './data/seedData';
import {
  getCurrentUser,
  checkAndRestoreSession,
  getUserProgressList,
  getUserAttemptsList,
  updateUserStats,
  saveAttempt,
  logoutStudent,
  fetchExamDataFromSupabase,
  addQuestionToSupabase,
  updateQuestionInSupabase,
  deleteQuestionFromSupabase,
  bulkAddQuestionsToSupabase,
  fetchPkskExamDataFromSupabase,
  addPkskQuestionToSupabase,
  updatePkskQuestionInSupabase,
  deletePkskQuestionFromSupabase,
  bulkAddPkskQuestionsToSupabase,
  savePkskAttempt,
  getPkskProgressList,
  getPkskExamSetQuestions,
  savePkskMixedExamAttempt,
  PkskExamTingkatan,
  shuffleArray,
  isSupabaseConfigured,
} from './lib/supabase';
import { soundManager } from './lib/audio';

// Components
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { SubjectView } from './components/SubjectView';
import { ExamScreen } from './components/ExamScreen';
import { ResultScreen } from './components/ResultScreen';
import { PkskExamResult } from './features/exam/PkskExamResult';
import { PkskExamLevelPicker } from './features/exam/PkskExamLevelPicker';
import { PkskPracticeSetup } from './features/exam/PkskPracticeSetup';
import { PkskPracticeResult } from './features/exam/PkskPracticeResult';
import { ProfileModal } from './components/ProfileModal';
import { ParentDashboard } from './components/ParentDashboard';
import { AdminDashboard } from './components/AdminDashboard';

// PKSK Artikulasi Karangan (Track B) — standalone screen, entered from the
// PKSK hub card in Dashboard once a subject/mode is picked internally.
import { ArticulationScreen } from './features/articulation/ArticulationScreen';

// New Milestone Modals
import { RoleSelectionModal } from './features/auth/RoleSelectionModal';
import { BattleLobbyModal } from './features/dashboard/BattleLobbyModal';
import { AchievementsModal } from './features/profile/AchievementsModal';
import { SocialAndLeaderboardModal } from './features/dashboard/SocialAndLeaderboardModal';

const THEME_STORAGE_KEY = 'eduquest_theme';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isMuted, setIsMuted] = useState(false);

  // Light / Dark theme — class-based (toggle-controlled), persisted, defaults to system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    window.localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    soundManager.playClick();
    setIsDarkMode((prev) => !prev);
  };

  // View state (Student flow only — Parent & Admin each have their own dedicated full-page view)
  const [view, setView] = useState<
    | 'dashboard'
    | 'subject'
    | 'exam'
    | 'result'
    | 'articulation'
    | 'pksk-exam-level'
    | 'pksk-exam'
    | 'pksk-exam-result'
    | 'pksk-practice-setup'
    | 'pksk-practice-result'
  >('dashboard');
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'battle' | 'achievements' | 'leaderboard' | 'profile'>('home');

  const handleBottomNavSelect = (tab: 'home' | 'battle' | 'achievements' | 'leaderboard' | 'profile') => {
    setActiveNavTab(tab);
    if (tab === 'home') {
      setView('dashboard');
    } else if (tab === 'battle') {
      user ? setIsBattleOpen(true) : setIsAuthOpen(true);
    } else if (tab === 'achievements') {
      user ? setIsAchievementsOpen(true) : setIsAuthOpen(true);
    } else if (tab === 'leaderboard') {
      user ? setIsSocialOpen(true) : setIsAuthOpen(true);
    } else if (tab === 'profile') {
      user ? setIsProfileOpen(true) : setIsAuthOpen(true);
    }
  };

  // Active exam / subject selection
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [activePaper, setActivePaper] = useState<Paper | null>(null);
  const [activeSection, setActiveSection] = useState<Section | null>(null);

  // Exam result state
  const [lastExamResult, setLastExamResult] = useState<{
    score: number;
    total: number;
    coinsEarned: number;
    xpEarned: number;
    answersMap: Record<string, string>;
  } | null>(null);

  // Data collections (SPPIM)
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(DEFAULT_DAILY_MISSIONS);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);

  // Data collections (PKSK) — kept fully separate from the SPPIM arrays above
  const [pkskSubjects, setPkskSubjects] = useState<Subject[]>([]);
  const [pkskPapers, setPkskPapers] = useState<Paper[]>([]);
  const [pkskSections, setPkskSections] = useState<Section[]>([]);
  const [pkskQuestions, setPkskQuestions] = useState<Question[]>([]);

  // PKSK Exam Mode (structural revision) — the mixed 100-question Bahagian
  // A+B sitting, separate from Practice Mode's per-section flow above.
  const [pkskExamQuestions, setPkskExamQuestions] = useState<Question[]>([]);
  const [pkskExamResult, setPkskExamResult] = useState<{ markahA: number | null; markahB: number | null } | null>(null);

  // PKSK Practice Mode session (v2 restructure doc #1/#4) — Aras Kesukaran +
  // Panjang Sesi (Warm Up/Sprint/Marathon) -limited question set, separate
  // from both the full-section browsing above and the mixed Exam Mode below.
  const [pkskPracticeQuestions, setPkskPracticeQuestions] = useState<Question[]>([]);
  const [pkskPracticeResult, setPkskPracticeResult] = useState<{
    percent: number;
    totalAnswered: number;
    totalQuestions: number;
    wasPartial: boolean;
  } | null>(null);

  // Which module the current subject/section/exam selection belongs to —
  // decided at selection time by checking which dataset the id came from,
  // so Dashboard/SubjectView/ExamScreen keep their existing prop shapes.
  const [activeModule, setActiveModule] = useState<'sppim' | 'pksk'>('sppim');

  // Which module the Admin question-bank editor currently has selected —
  // lifted here (rather than living only inside AdminDashboard) so
  // handleAddQuestion/etc. below know whether to write to the SPPIM or
  // PKSK tables.
  const [adminActiveModule, setAdminActiveModule] = useState<'sppim' | 'pksk'>('sppim');

  // Modals (Student flow)
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // New Milestone Feature Modals
  const [isRoleSelectionOpen, setIsRoleSelectionOpen] = useState(false);
  const [isBattleOpen, setIsBattleOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);

  // Check and restore active Supabase / local session on initial load
  useEffect(() => {
    async function initSession() {
      if (!user) {
        const restored = await checkAndRestoreSession();
        if (restored) setUser(restored);
      }
    }
    initSession();
  }, []);

  // First Login Flow: Trigger Role Selection Modal if user exists but has no role assigned
  useEffect(() => {
    if (user && !user.role) {
      setIsRoleSelectionOpen(true);
    } else {
      setIsRoleSelectionOpen(false);
    }
  }, [user]);

  // Fetch subjects, papers, sections & questions from Supabase — this is now
  // the source of truth for content (local seed data is just an empty-state
  // placeholder shown while this loads, or if Supabase is unreachable).
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [contentLoadFailed, setContentLoadFailed] = useState(false);

  useEffect(() => {
    async function loadRemoteContent() {
      setIsContentLoading(true);
      const remote = await fetchExamDataFromSupabase();

      if (remote && remote.subjects && remote.subjects.length > 0) {
        setSubjects(remote.subjects);
        setPapers(remote.papers || []);
        setSections(remote.sections || []);
        setQuestions(remote.questions || []);
        setContentLoadFailed(false);
      } else {
        // Supabase not configured, unreachable, or empty — nothing to show.
        setContentLoadFailed(true);
      }
      setIsContentLoading(false);
    }
    loadRemoteContent();
  }, []);

  // Fetch PKSK content once alongside SPPIM — separate state, never merged
  // with the subjects/papers/sections/questions arrays above.
  useEffect(() => {
    async function loadPkskContent() {
      const remote = await fetchPkskExamDataFromSupabase();
      if (remote) {
        setPkskSubjects(remote.subjects || []);
        setPkskPapers(remote.papers || []);
        setPkskSections(remote.sections || []);
        setPkskQuestions(remote.questions || []);
      }
    }
    loadPkskContent();
  }, []);

  // Load user progress (Student's own progress — not used by Parent/Admin views)
  useEffect(() => {
    if (user) {
      setUserProgress(getUserProgressList(user.id));
    } else {
      setUserProgress([]);
    }
  }, [user]);

  const [pkskUserProgress, setPkskUserProgress] = useState<UserProgress[]>([]);
  useEffect(() => {
    if (user) {
      setPkskUserProgress(getPkskProgressList(user.id));
    } else {
      setPkskUserProgress([]);
    }
  }, [user, view]);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
  };

  const handleSelectSubject = (subject: Subject) => {
    const isPksk = pkskSubjects.some((s) => s.id === subject.id);
    setActiveModule(isPksk ? 'pksk' : 'sppim');
    setActiveSubject(subject);
    setView('subject');
  };

  const handleSelectSection = (paper: Paper, section: Section) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const isPksk = pkskSections.some((s) => s.id === section.id);
    setActiveModule(isPksk ? 'pksk' : 'sppim');
    setActivePaper(paper);
    setActiveSection(section);
    // PKSK Practice Mode goes through the Aras Kesukaran + Panjang Sesi
    // picker first (doc #1/#4) — SPPIM keeps going straight into the exam.
    setView(isPksk ? 'pksk-practice-setup' : 'exam');
  };

  const handleCompleteExam = async (
    score: number,
    total: number,
    coinsEarned: number,
    xpEarned: number,
    answersMap: Record<string, string>
  ) => {
    if (!activeSection || !user) return;

    await saveAttempt({
      user_id: user.id,
      section_id: activeSection.id,
      score,
      total_question: total,
      coins_earned: coinsEarned,
      xp_earned: xpEarned,
      started_at: new Date(Date.now() - 300000).toISOString(),
      completed_at: new Date().toISOString(),
    });

    const updatedUser = await updateUserStats(user, coinsEarned, xpEarned);
    setUser(updatedUser);

    setUserProgress(getUserProgressList(user.id));

    setDailyMissions((prev) =>
      prev.map((m) => {
        if (m.id === 'm-1') return { ...m, current: Math.min(m.target, m.current + 1), is_completed: true };
        if (m.id === 'm-2' && activeSubject?.name?.toUpperCase().includes('FEKAH')) {
          const newCurr = m.current + score;
          return { ...m, current: newCurr, is_completed: newCurr >= m.target };
        }
        if (m.id === 'm-3' && score === total) return { ...m, current: 1, is_completed: true };
        return m;
      })
    );

    setLastExamResult({ score, total, coinsEarned, xpEarned, answersMap });
    setView('result');
  };

  const pkskTingkatanLabel = (u: UserProfile) =>
    u.school_form ? `Tingkatan ${u.school_form}` : u.school_year ? `Tahun ${u.school_year}` : 'Tidak dinyatakan';

  // PKSK Practice completion — writes to exam_attempts/exam_attempt_questions/
  // pksk_results (via savePkskAttempt), NOT saveAttempt/updateUserStats. PKSK
  // has no coin/XP reward system, so those two params are accepted
  // (ExamScreen's onCompleteExam signature is shared/generic) but ignored.
  // Scores against pkskPracticeQuestions (the Aras Kesukaran + Panjang Sesi
  // -limited set from handleStartPkskPractice), not every question in the
  // section — see PKSK v2 restructure doc #1/#4.
  const handleCompletePkskExam = async (
    _score: number,
    _total: number,
    _coinsEarned: number,
    _xpEarned: number,
    answersMap: Record<string, string>
  ) => {
    if (!activeSection || !activeSubject || !user) return;

    const result = await savePkskAttempt({
      user_id: user.id,
      tingkatan: pkskTingkatanLabel(user),
      subject: activeSubject,
      section: activeSection,
      questions: pkskPracticeQuestions,
      answersMap,
    });

    setPkskPracticeResult({
      percent: result?.percent ?? 0,
      totalAnswered: Object.keys(answersMap).length,
      totalQuestions: pkskPracticeQuestions.length,
      wasPartial: false,
    });
    setView('pksk-practice-result');
  };

  // Student exited a Practice session early ("Keluar") — save whatever was
  // answered as a valid attempt instead of discarding it (doc #4: progress
  // is always kept, even mid-block).
  const handleExitPkskPracticeEarly = async (answersMap: Record<string, string>) => {
    if (!activeSection || !activeSubject || !user) {
      setView('subject');
      return;
    }

    const result = await savePkskAttempt({
      user_id: user.id,
      tingkatan: pkskTingkatanLabel(user),
      subject: activeSubject,
      section: activeSection,
      questions: pkskPracticeQuestions,
      answersMap,
    });

    setPkskPracticeResult({
      percent: result?.percent ?? 0,
      totalAnswered: Object.keys(answersMap).length,
      totalQuestions: pkskPracticeQuestions.length,
      wasPartial: true,
    });
    setView('pksk-practice-result');
  };

  // Aras Kesukaran + Panjang Sesi picked (PkskPracticeSetup) — pull matching
  // questions from this section, shuffle, cap to the block size. A thin bank
  // just yields a shorter-than-nominal session rather than blocking outright.
  // _timerOn: accepted from the setup screen's toggle but not yet enforced —
  // ExamScreen has no countdown UI/auto-submit infra at all today (same gap
  // flagged for Exam Mode's 90-minute timer). Follow-up, not scope creep here.
  const handleStartPkskPractice = (aras: 1 | 2 | 3, panjang: 15 | 25 | 50, _timerOn: boolean) => {
    if (!activeSection) return;
    const atAras = pkskQuestions.filter((q) => q.section_id === activeSection.id && q.aras_kesukaran === aras);
    setPkskPracticeQuestions(shuffleArray(atAras).slice(0, panjang));
    setView('exam');
  };

  // PKSK Exam Mode entry point — shows the Tahun 6 / Tingkatan 3 picker
  // (Dashboard's pkskExamSetReady gate keeps the "Exam PKSK" button hidden
  // entirely if NEITHER level has a set yet; the picker itself locks out
  // whichever individual level isn't ready).
  const handleOpenPkskExamPicker = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setView('pksk-exam-level');
  };

  // Pulls the pre-generated "PKSK Exam" set for the chosen tingkatan (doc:
  // PKSK_Structural_Revision.md #6, no live question-selection algorithm).
  // The level picker only enables levels that are ready, so reaching here
  // with no questions shouldn't normally happen — bail safely anyway.
  const handleStartPkskExam = (level: PkskExamTingkatan) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const examSet = getPkskExamSetQuestions(pkskPapers, pkskSections, pkskQuestions, level);
    if (!examSet) return;
    setPkskExamQuestions(examSet.questions);
    setActiveModule('pksk');
    setView('pksk-exam');
  };

  const handleCompletePkskMixedExam = async (
    _score: number,
    _total: number,
    _coinsEarned: number,
    _xpEarned: number,
    answersMap: Record<string, string>
  ) => {
    if (!user) return;

    const tingkatan = user.school_form
      ? `Tingkatan ${user.school_form}`
      : user.school_year
      ? `Tahun ${user.school_year}`
      : 'Tidak dinyatakan';

    const result = await savePkskMixedExamAttempt({
      user_id: user.id,
      tingkatan,
      questions: pkskExamQuestions,
      answersMap,
    });

    setPkskExamResult({ markahA: result?.markahA ?? null, markahB: result?.markahB ?? null });
    setView('pksk-exam-result');
  };

  // ------------------------- Admin question-bank management -------------------------
  // Optimistic local update for instant UI feedback, then persisted for real to
  // Supabase — Admin edits now survive refresh/redeploy instead of living only
  // in browser memory for the current session.
  // Branches on adminActiveModule so PKSK edits land in the pksk_* tables
  // instead of the SPPIM questions/choices tables.
  const handleAddQuestion = async (newQ: Question) => {
    if (adminActiveModule === 'pksk') {
      setPkskQuestions((prev) => [newQ, ...prev]);
      const choicesPayload = newQ.choices.map((c) => ({ text: c.option_text, correct: c.is_correct, nilai_skala: c.nilai_skala }));
      const saved = await addPkskQuestionToSupabase(
        newQ.section_id,
        newQ.question_text,
        newQ.explanation,
        choicesPayload,
        newQ.order,
        newQ.answer_format,
        newQ.dimensi_personaliti,
        newQ.aras_kesukaran,
        newQ.image_url
      );
      if (saved) {
        setPkskQuestions((prev) => prev.map((q) => (q.id === newQ.id ? saved : q)));
      }
      return;
    }

    setQuestions((prev) => [newQ, ...prev]);

    const choicesPayload = newQ.choices.map((c) => ({ text: c.option_text, correct: c.is_correct }));
    const saved = await addQuestionToSupabase(newQ.section_id, newQ.question_text, newQ.explanation, choicesPayload, newQ.order, newQ.difficulty, newQ.image_url);
    if (saved) {
      setQuestions((prev) => prev.map((q) => (q.id === newQ.id ? saved : q)));
    }
  };

  const handleUpdateQuestion = async (updatedQ: Question) => {
    if (adminActiveModule === 'pksk') {
      setPkskQuestions((prev) => prev.map((q) => (q.id === updatedQ.id ? updatedQ : q)));
      await updatePkskQuestionInSupabase(updatedQ);
      return;
    }

    setQuestions((prev) => prev.map((q) => (q.id === updatedQ.id ? updatedQ : q)));
    await updateQuestionInSupabase(updatedQ);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (adminActiveModule === 'pksk') {
      setPkskQuestions((prev) => prev.filter((q) => q.id !== questionId));
      await deletePkskQuestionFromSupabase(questionId);
      return;
    }

    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    await deleteQuestionFromSupabase(questionId);
  };

  const handleBulkAddQuestions = async (newQuestions: Question[]): Promise<{ saved: number; total: number; error?: string }> => {
    if (adminActiveModule === 'pksk') {
      setPkskQuestions((prev) => [...newQuestions, ...prev]);

      const payload = newQuestions.map((q) => ({
        section_id: q.section_id,
        question_text: q.question_text,
        explanation: q.explanation,
        order: q.order,
        answer_format: q.answer_format,
        dimensi_personaliti: q.dimensi_personaliti,
        aras_kesukaran: q.aras_kesukaran,
        image_url: q.image_url,
        choices: q.choices.map((c) => ({ text: c.option_text, correct: c.is_correct, nilai_skala: c.nilai_skala })),
      }));
      if (!isSupabaseConfigured) return { saved: newQuestions.length, total: newQuestions.length };

      const { saved, error } = await bulkAddPkskQuestionsToSupabase(payload);
      if (saved.length > 0) {
        setPkskQuestions((prev) => {
          const tempIds = new Set(newQuestions.map((q) => q.id));
          const withoutTemps = prev.filter((q) => !tempIds.has(q.id));
          return [...saved, ...withoutTemps];
        });
      }
      return { saved: saved.length, total: newQuestions.length, error };
    }

    setQuestions((prev) => [...newQuestions, ...prev]);

    if (!isSupabaseConfigured) return { saved: newQuestions.length, total: newQuestions.length };

    const payload = newQuestions.map((q) => ({
      section_id: q.section_id,
      question_text: q.question_text,
      explanation: q.explanation,
      difficulty: q.difficulty,
      image_url: q.image_url,
      choices: q.choices.map((c) => ({ text: c.option_text, correct: c.is_correct })),
    }));
    const saved = await bulkAddQuestionsToSupabase(payload);
    if (saved.length > 0) {
      setQuestions((prev) => {
        const tempIds = new Set(newQuestions.map((q) => q.id));
        const withoutTemps = prev.filter((q) => !tempIds.has(q.id));
        return [...saved, ...withoutTemps];
      });
    }
    return { saved: saved.length, total: newQuestions.length };
    return { saved: saved.length, total: newQuestions.length };
  };

  const handleLogout = () => {
    logoutStudent();
    setUser(null);
    setView('dashboard');
  };

  // PKSK Practice always goes through pkskPracticeQuestions (the Aras
  // Kesukaran + Panjang Sesi -limited set) — SPPIM keeps browsing the whole
  // section's questions directly, unchanged.
  const activeQuestions = activeSection
    ? activeModule === 'pksk'
      ? pkskPracticeQuestions
      : questions.filter((q) => q.section_id === activeSection.id)
    : [];

  // ---------------------------------------------------------------------
  // ROLE-BASED TOP-LEVEL ROUTING
  // Parent and Admin accounts each get a completely separate, dedicated
  // full-page view — gated purely by user.role, so a student can never
  // reach either one. (Client-side gating only — see chat notes on the
  // limits of that for a locally-stored-auth app like this one.)
  // ---------------------------------------------------------------------
  if (user && user.role === 'parent') {
    return (
      <ParentDashboard
        user={user}
        subjects={subjects}
        papers={papers}
        sections={sections}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
    );
  }

  if (user && user.role === 'admin') {
    return (
      <AdminDashboard
        user={user}
        subjects={subjects}
        papers={papers}
        sections={sections}
        questions={questions}
        pkskSubjects={pkskSubjects}
        pkskPapers={pkskPapers}
        pkskSections={pkskSections}
        pkskQuestions={pkskQuestions}
        activeModuleTab={adminActiveModule}
        onModuleTabChange={setAdminActiveModule}
        onAddQuestion={handleAddQuestion}
        onUpdateQuestion={handleUpdateQuestion}
        onDeleteQuestion={handleDeleteQuestion}
        onBulkAddQuestions={handleBulkAddQuestions}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 text-ink-900 font-sans antialiased flex flex-col">
      {/* Top Navigation Bar */}
      <Header
        user={user}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        onGoHome={() => setView('dashboard')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main App Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'dashboard' && (
          <Dashboard
            user={user}
            subjects={subjects}
            papers={papers}
            sections={sections}
            pkskSubjects={pkskSubjects}
            pkskPapers={pkskPapers}
            pkskSections={pkskSections}
            pkskUserProgress={pkskUserProgress}
            userProgress={userProgress}
            dailyMissions={dailyMissions}
            isContentLoading={isContentLoading}
            contentLoadFailed={contentLoadFailed}
            onSelectSubject={handleSelectSubject}
            onSelectSection={handleSelectSection}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenBattle={() => setIsBattleOpen(true)}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
            onOpenSocial={() => setIsSocialOpen(true)}
            onOpenArticulation={() => {
              if (!user) {
                setIsAuthOpen(true);
                return;
              }
              setView('articulation');
            }}
            onOpenPkskExam={handleOpenPkskExamPicker}
            pkskExamSetReady={
              getPkskExamSetQuestions(pkskPapers, pkskSections, pkskQuestions, 'Tahun 6') !== null ||
              getPkskExamSetQuestions(pkskPapers, pkskSections, pkskQuestions, 'Tingkatan 3') !== null
            }
          />
        )}

        {view === 'articulation' && user && (
          <ArticulationScreen user={user} onExit={() => setView('dashboard')} />
        )}

        {view === 'pksk-exam-level' && (
          <PkskExamLevelPicker
            readyLevels={{
              'Tahun 6': getPkskExamSetQuestions(pkskPapers, pkskSections, pkskQuestions, 'Tahun 6') !== null,
              'Tingkatan 3': getPkskExamSetQuestions(pkskPapers, pkskSections, pkskQuestions, 'Tingkatan 3') !== null,
            }}
            onPickLevel={handleStartPkskExam}
            onBack={() => setView('dashboard')}
          />
        )}

        {view === 'pksk-exam' && user && pkskExamQuestions.length > 0 && (
          <ExamScreen
            questions={pkskExamQuestions}
            user={user}
            mode="exam"
            module="pksk"
            onCompleteExam={handleCompletePkskMixedExam}
            onCancel={() => setView('dashboard')}
            explanationLabel="Penerangan:"
          />
        )}

        {view === 'pksk-exam-result' && pkskExamResult && (
          <PkskExamResult
            markahA={pkskExamResult.markahA}
            markahB={pkskExamResult.markahB}
            totalQuestions={pkskExamQuestions.length}
            onGoDashboard={() => setView('dashboard')}
          />
        )}

        {view === 'subject' && activeSubject && (
          <SubjectView
            subject={activeSubject}
            papers={activeModule === 'pksk' ? pkskPapers : papers}
            sections={activeModule === 'pksk' ? pkskSections : sections}
            userProgress={userProgress}
            onBack={() => setView('dashboard')}
            onSelectSection={handleSelectSection}
            module={activeModule}
          />
        )}

        {view === 'exam' && activeSection && (
          <ExamScreen
            section={activeSection}
            questions={activeQuestions}
            user={user}
            onCompleteExam={activeModule === 'pksk' ? handleCompletePkskExam : handleCompleteExam}
            onCancel={() => setView('subject')}
            onExitEarly={activeModule === 'pksk' ? handleExitPkskPracticeEarly : undefined}
            explanationLabel={activeModule === 'pksk' ? 'Penerangan:' : undefined}
            module={activeModule}
          />
        )}

        {view === 'pksk-practice-setup' && activeSection && (
          <PkskPracticeSetup
            sectionName={activeSection.name.replace(/^bank\s+/i, '')}
            questions={pkskQuestions.filter((q) => q.section_id === activeSection.id)}
            onStart={handleStartPkskPractice}
            onBack={() => setView('subject')}
          />
        )}

        {view === 'pksk-practice-result' && pkskPracticeResult && activeSection && (
          <PkskPracticeResult
            percent={pkskPracticeResult.percent}
            sectionName={activeSection.name.replace(/^bank\s+/i, '')}
            totalAnswered={pkskPracticeResult.totalAnswered}
            totalQuestions={pkskPracticeResult.totalQuestions}
            wasPartial={pkskPracticeResult.wasPartial}
            onContinue={() => setView('pksk-practice-setup')}
            onGoDashboard={() => setView('dashboard')}
          />
        )}

        {view === 'result' && activeSection && lastExamResult && (
          <ResultScreen
            section={activeSection}
            questions={activeQuestions}
            score={lastExamResult.score}
            total={lastExamResult.total}
            coinsEarned={lastExamResult.coinsEarned}
            xpEarned={lastExamResult.xpEarned}
            answersMap={lastExamResult.answersMap}
            user={user}
            subject={activeSubject}
            paper={activePaper}
            allSections={activeModule === 'pksk' ? pkskSections : sections}
            userProgress={userProgress}
            onRetry={() => setView('exam')}
            onGoDashboard={() => setView('dashboard')}
            onGoBackToSubject={() => setView('subject')}
            onNextSection={(nextSec) => {
              setActiveSection(nextSec);
              setView('exam');
            }}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab={view === 'dashboard' ? activeNavTab : 'home'}
        user={user}
        onSelectTab={handleBottomNavSelect}
      />

      {/* Footer */}
      <footer className="border-t border-sand-200 bg-cream-50 text-center py-6 pb-20 px-4 text-xs text-ink-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EduQuest — Learn, Play, Achieve</span>
          <span>Belajar Macam Main Game!</span>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(profile) => {
          setUser(profile);
          setIsAuthOpen(false);
        }}
      />

      {/* Profile Modal */}
      {user && (
        <ProfileModal
          isOpen={isProfileOpen}
          user={user}
          progressList={userProgress}
          onClose={() => {
            setIsProfileOpen(false);
            setActiveNavTab('home');
            setView('dashboard');
          }}
          onLogout={handleLogout}
          onUserUpdate={(updated) => setUser(updated)}
        />
      )}

      {/* Role Selection Modal (First Login Flow) */}
      {user && (
        <RoleSelectionModal
          isOpen={isRoleSelectionOpen}
          user={user}
          onSuccess={(updatedUser) => {
            setUser(updatedUser);
            setIsRoleSelectionOpen(false);
          }}
        />
      )}

      {/* Battle Lobby 1v1 Modal */}
      {user && (
        <BattleLobbyModal
          isOpen={isBattleOpen}
          user={user}
          questions={questions}
          subjects={subjects}
          papers={papers}
          sections={sections}
          onClose={() => {
            setIsBattleOpen(false);
            setActiveNavTab('home');
            setView('dashboard');
          }}
          onFinishBattle={async (earnedXp, earnedCoins) => {
            const updated = await updateUserStats(user, earnedCoins, earnedXp);
            setUser(updated);
            setIsBattleOpen(false);
            setActiveNavTab('home');
            setView('dashboard');
          }}
        />
      )}

      {/* Achievements Modal */}
      {user && (
        <AchievementsModal
          isOpen={isAchievementsOpen}
          user={user}
          userAttempts={getUserAttemptsList(user.id)}
          onClose={() => {
            setIsAchievementsOpen(false);
            setActiveNavTab('home');
            setView('dashboard');
          }}
          onClaimReward={async (xp, coins) => {
            const updated = await updateUserStats(user, coins, xp);
            setUser(updated);
          }}
        />
      )}

      {/* Social & Leaderboard Modal */}
      {user && (
        <SocialAndLeaderboardModal
          isOpen={isSocialOpen}
          user={user}
          onClose={() => {
            setIsSocialOpen(false);
            setActiveNavTab('home');
            setView('dashboard');
          }}
        />
      )}
    </div>
  );
}

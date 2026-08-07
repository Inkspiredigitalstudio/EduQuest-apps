import React, { useState, useEffect } from 'react';
import { UserProfile, Subject, Paper, Section, Question, UserProgress, DailyMission } from './types';
import {
  INITIAL_SUBJECTS,
  INITIAL_PAPERS,
  INITIAL_SECTIONS,
  INITIAL_QUESTIONS,
  DEFAULT_DAILY_MISSIONS,
} from './data/seedData';
import {
  getCurrentUser,
  checkAndRestoreSession,
  getUserProgressList,
  getUserAttemptsList,
  updateUserStats,
  saveAttempt,
  logoutStudent,
  fetchExamDataFromSupabase,
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
import { ProfileModal } from './components/ProfileModal';
import { ParentDashboard } from './components/ParentDashboard';
import { AdminDashboard } from './components/AdminDashboard';

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
  const [view, setView] = useState<'dashboard' | 'subject' | 'exam' | 'result'>('dashboard');
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

  // Data collections
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [papers, setPapers] = useState<Paper[]>(INITIAL_PAPERS);
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(DEFAULT_DAILY_MISSIONS);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);

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

  // Fetch live subjects, papers, sections & questions from Supabase if configured
  useEffect(() => {
    async function loadRemoteContent() {
      const remote = await fetchExamDataFromSupabase();
      if (remote) {
        if (remote.subjects && remote.subjects.length > 0) {
          setSubjects((prev) => {
            const map = new Map(prev.map((s) => [s.id, s]));
            remote.subjects!.forEach((s) => map.set(s.id, s));
            return Array.from(map.values());
          });
        }
        if (remote.papers && remote.papers.length > 0) {
          setPapers((prev) => {
            const map = new Map(prev.map((p) => [p.id, p]));
            remote.papers!.forEach((p) => map.set(p.id, p));
            return Array.from(map.values());
          });
        }
        if (remote.sections && remote.sections.length > 0) {
          setSections((prev) => {
            const map = new Map(prev.map((sec) => [sec.id, sec]));
            remote.sections!.forEach((sec) => map.set(sec.id, sec));
            return Array.from(map.values());
          });
        }
        if (remote.questions && remote.questions.length > 0) {
          setQuestions((prev) => {
            const map = new Map(prev.map((q) => [q.id, q]));
            remote.questions!.forEach((q) => map.set(q.id, q));
            return Array.from(map.values());
          });
        }
      }
    }
    loadRemoteContent();
  }, []);

  // Load user progress (Student's own progress — not used by Parent/Admin views)
  useEffect(() => {
    if (user) {
      setUserProgress(getUserProgressList(user.id));
    } else {
      setUserProgress([]);
    }
  }, [user]);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
  };

  const handleSelectSubject = (subject: Subject) => {
    setActiveSubject(subject);
    setView('subject');
  };

  const handleSelectSection = (paper: Paper, section: Section) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setActivePaper(paper);
    setActiveSection(section);
    setView('exam');
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
        if (m.id === 'm-2' && activeSubject?.id === 'sub-fekah') {
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

  // ------------------------- Admin question-bank management -------------------------
  // Local-state only, matching how this app already handles the question bank
  // (subjects/papers/sections/questions are seeded + optionally pulled from
  // Supabase read-only; there is no write-sync path back to Supabase here).
  const handleAddQuestion = (newQ: Question) => {
    setQuestions((prev) => [newQ, ...prev]);
  };

  const handleUpdateQuestion = (updatedQ: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === updatedQ.id ? updatedQ : q)));
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const handleBulkAddQuestions = (newQuestions: Question[]) => {
    setQuestions((prev) => [...newQuestions, ...prev]);
  };

  const handleLogout = () => {
    logoutStudent();
    setUser(null);
    setView('dashboard');
  };

  const activeQuestions = activeSection ? questions.filter((q) => q.section_id === activeSection.id) : [];

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
            userProgress={userProgress}
            dailyMissions={dailyMissions}
            onSelectSubject={handleSelectSubject}
            onSelectSection={handleSelectSection}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenBattle={() => setIsBattleOpen(true)}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
            onOpenSocial={() => setIsSocialOpen(true)}
          />
        )}

        {view === 'subject' && activeSubject && (
          <SubjectView
            subject={activeSubject}
            papers={papers}
            sections={sections}
            userProgress={userProgress}
            onBack={() => setView('dashboard')}
            onSelectSection={handleSelectSection}
          />
        )}

        {view === 'exam' && activeSection && (
          <ExamScreen
            section={activeSection}
            questions={activeQuestions}
            user={user}
            onCompleteExam={handleCompleteExam}
            onCancel={() => setView('subject')}
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
            allSections={sections}
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

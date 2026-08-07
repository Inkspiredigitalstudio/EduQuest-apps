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
import { AdminCMS } from './components/AdminCMS';

// New Milestone Modals
import { RoleSelectionModal } from './features/auth/RoleSelectionModal';
import { BattleLobbyModal } from './features/dashboard/BattleLobbyModal';
import { AchievementsModal } from './features/profile/AchievementsModal';
import { SocialAndLeaderboardModal } from './features/dashboard/SocialAndLeaderboardModal';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isMuted, setIsMuted] = useState(false);

  // View state
  const [view, setView] = useState<'dashboard' | 'subject' | 'exam' | 'result'>('dashboard');
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'battle' | 'achievements' | 'leaderboard' | 'profile'>('home');

  const handleBottomNavSelect = (tab: 'home' | 'battle' | 'achievements' | 'leaderboard' | 'profile') => {
    setActiveNavTab(tab);
    if (tab === 'home') {
      setView('dashboard');
    } else if (tab === 'battle') {
      if (user) {
        setIsBattleOpen(true);
      } else {
        setIsAuthOpen(true);
      }
    } else if (tab === 'achievements') {
      if (user) {
        setIsAchievementsOpen(true);
      } else {
        setIsAuthOpen(true);
      }
    } else if (tab === 'leaderboard') {
      if (user) {
        setIsSocialOpen(true);
      } else {
        setIsAuthOpen(true);
      }
    } else if (tab === 'profile') {
      if (user) {
        if (user.role === 'parent') {
          setIsParentOpen(true);
        } else {
          setIsProfileOpen(true);
        }
      } else {
        setIsAuthOpen(true);
      }
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

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isParentOpen, setIsParentOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

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
        if (restored) {
          setUser(restored);
        }
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

  // Load user progress
  useEffect(() => {
    if (user) {
      const prog = getUserProgressList(user.id);
      setUserProgress(prog);
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

    // 1. Save attempt record
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

    // 2. Update user stats
    const updatedUser = await updateUserStats(user, coinsEarned, xpEarned);
    setUser(updatedUser);

    // 3. Refresh user progress
    const updatedProg = getUserProgressList(user.id);
    setUserProgress(updatedProg);

    // 4. Update daily mission progress
    setDailyMissions((prev) =>
      prev.map((m) => {
        if (m.id === 'm-1') {
          return { ...m, current: Math.min(m.target, m.current + 1), is_completed: true };
        }
        if (m.id === 'm-2' && activeSubject?.id === 'sub-fekah') {
          const newCurr = m.current + score;
          return { ...m, current: newCurr, is_completed: newCurr >= m.target };
        }
        if (m.id === 'm-3' && score === total) {
          return { ...m, current: 1, is_completed: true };
        }
        return m;
      })
    );

    // 5. Store result & change view
    setLastExamResult({ score, total, coinsEarned, xpEarned, answersMap });
    setView('result');
  };

  const handleAddQuestion = (newQ: Question) => {
    setQuestions((prev) => [newQ, ...prev]);
  };

  const handleLogout = () => {
    logoutStudent();
    setUser(null);
    setView('dashboard');
  };

  const activeQuestions = activeSection
    ? questions.filter((q) => q.section_id === activeSection.id)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col">
      {/* Top Navigation Bar */}
      <Header
        user={user}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => {
          if (user?.role === 'parent') {
            setIsParentOpen(true);
          } else {
            setIsProfileOpen(true);
          }
        }}
        onOpenParent={() => setIsParentOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onLogout={handleLogout}
        onGoHome={() => setView('dashboard')}
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
            onOpenParent={() => setIsParentOpen(true)}
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

      {/* Fixed Bottom Navigation Bar (Modern Mobile Gaming Style) */}
      <BottomNav
        activeTab={view === 'dashboard' ? activeNavTab : 'home'}
        user={user}
        onSelectTab={handleBottomNavSelect}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 text-center py-6 pb-20 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EduQuest - Learn, Play, Achieve</span>
          <span className="text-slate-600">Belajar Macam Main Game!</span>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(profile) => {
          setUser(profile);
          setIsAuthOpen(false);
          if (profile.role === 'parent') {
            setIsParentOpen(true);
          }
        }}
      />

      {/* Profile & Parent Modal */}
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
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenParent={() => {
            setIsProfileOpen(false);
            setIsParentOpen(true);
          }}
        />
      )}

      {/* Parent Dashboard Modal */}
      <ParentDashboard
        isOpen={isParentOpen}
        subjects={subjects}
        papers={papers}
        sections={sections}
        onClose={() => setIsParentOpen(false)}
      />

      {/* Admin CMS Modal */}
      <AdminCMS
        isOpen={isAdminOpen}
        subjects={subjects}
        papers={papers}
        sections={sections}
        questions={questions}
        onClose={() => setIsAdminOpen(false)}
        onAddQuestion={handleAddQuestion}
        onAddSubject={(newSub) => setSubjects((prev) => [...prev, newSub])}
      />

      {/* Role Selection Modal (First Login Flow) */}
      {user && (
        <RoleSelectionModal
          isOpen={isRoleSelectionOpen}
          user={user}
          onRoleSelected={(updatedUser) => {
            setUser(updatedUser);
            setIsRoleSelectionOpen(false);
            if (updatedUser.role === 'parent') {
              setIsParentOpen(true);
            }
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

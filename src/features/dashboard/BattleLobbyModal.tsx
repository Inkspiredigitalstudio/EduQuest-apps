import React, { useState, useEffect } from 'react';
import { UserProfile, Question, BattleRoom, Subject, Paper, Section } from '../../types';
import { createBattleRoom, joinBattleRoom } from '../../lib/supabase';
import { soundManager } from '../../lib/audio';
import { Swords, Users, Play, Trophy, CheckCircle2, XCircle, Sparkles, X, Copy, Clock, AlertCircle, BookOpen } from 'lucide-react';

interface BattleLobbyModalProps {
  isOpen: boolean;
  user: UserProfile;
  questions: Question[];
  subjects?: Subject[];
  papers?: Paper[];
  sections?: Section[];
  onClose: () => void;
  onFinishBattle: (earnedXp: number, earnedCoins: number) => void;
}

const TOPICS = [
  { id: 'all', name: 'Semua Tajuk', icon: '🌟', color: 'from-amber-500 to-rose-500' },
  { id: 'sub-akidah', name: 'Akidah', icon: '🛡️', color: 'from-emerald-500 to-teal-600' },
  { id: 'sub-fekah', name: 'Fekah', icon: '📖', color: 'from-blue-500 to-indigo-600' },
  { id: 'sub-akhlak', name: 'Akhlak', icon: '💖', color: 'from-purple-500 to-pink-600' },
  { id: 'sub-sirah', name: 'Sirah', icon: '🧭', color: 'from-amber-600 to-orange-600' },
];

const QUESTION_TIME_LIMIT = 15; // 15 seconds per question

export const BattleLobbyModal: React.FC<BattleLobbyModalProps> = ({
  isOpen,
  user,
  questions,
  subjects = [],
  papers = [],
  sections = [],
  onClose,
  onFinishBattle,
}) => {
  const [mode, setMode] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [activeRoom, setActiveRoom] = useState<BattleRoom | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Battle Config state
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  // Battle Quiz state
  const [battleQuestions, setBattleQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentName, setOpponentName] = useState('Lawan Maya (AI)');
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME_LIMIT);

  useEffect(() => {
    if (!isOpen) {
      setMode('lobby');
      setActiveRoom(null);
      setJoinCodeInput('');
      setCopiedCode(false);
      setErrorMsg('');
      setBattleQuestions([]);
      setCurrentQIndex(0);
      setMyScore(0);
      setOpponentScore(0);
      setSelectedChoiceId(null);
      setIsTimeout(false);
      setTimeLeft(QUESTION_TIME_LIMIT);
      setSelectedTopic('all');
    }
  }, [isOpen]);

  // Countdown timer effect
  useEffect(() => {
    if (mode !== 'playing' || selectedChoiceId !== null || isTimeout) return;

    if (timeLeft <= 0) {
      // Time's up for current question
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, timeLeft, selectedChoiceId, isTimeout]);

  if (!isOpen) return null;

  const handleTimeout = () => {
    soundManager.playClick();
    setIsTimeout(true);
    setSelectedChoiceId('TIMEOUT_CHOICE');

    // Simulated Opponent AI Response on timeout
    const oppCorrect = Math.random() > 0.4;
    if (oppCorrect) {
      setOpponentScore((prev) => prev + 1);
    }

    setTimeout(() => {
      moveToNextQuestion();
    }, 1500);
  };

  const handleCreateRoom = () => {
    soundManager.playClick();
    setErrorMsg('');
    const room = createBattleRoom(user);
    setActiveRoom(room);
  };

  const handleJoinRoom = () => {
    soundManager.playClick();
    setErrorMsg('');
    if (!joinCodeInput.trim()) {
      setErrorMsg('Sila masukkan Kod Bilik Battle.');
      return;
    }
    const room = joinBattleRoom(joinCodeInput.trim(), user);
    if (!room) {
      setErrorMsg('Bilik tidak dijumpai atau telah penuh.');
      return;
    }
    setActiveRoom(room);
  };

  // Helper to filter questions by topic
  const getFilteredQuestions = () => {
    if (selectedTopic === 'all') return questions;

    return questions.filter((q) => {
      const sec = sections.find((s) => s.id === q.section_id);
      if (sec) {
        const pap = papers.find((p) => p.id === sec.paper_id);
        if (pap) {
          return pap.subject_id === selectedTopic;
        }
      }
      // Fallback text check
      const topicObj = TOPICS.find((t) => t.id === selectedTopic);
      if (topicObj) {
        const keyword = topicObj.name.toLowerCase();
        return (
          q.question_text.toLowerCase().includes(keyword) ||
          (q.explanation && q.explanation.toLowerCase().includes(keyword))
        );
      }
      return true;
    });
  };

  const handleStartBattle = () => {
    soundManager.playLevelUp();

    const filtered = getFilteredQuestions();
    const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 10);

    if (shuffled.length === 0) {
      setErrorMsg('Tiada soalan ditemui untuk tajuk ini. Sila pilih tajuk lain.');
      return;
    }

    setBattleQuestions(shuffled);
    setCurrentQIndex(0);
    setMyScore(0);
    setOpponentScore(0);
    setOpponentName(activeRoom?.guest_name || 'Lawan Maya (AI)');
    setSelectedChoiceId(null);
    setIsTimeout(false);
    setTimeLeft(QUESTION_TIME_LIMIT);
    setMode('playing');
  };

  const moveToNextQuestion = () => {
    if (currentQIndex < battleQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedChoiceId(null);
      setIsTimeout(false);
      setTimeLeft(QUESTION_TIME_LIMIT);
    } else {
      // Finish battle
      soundManager.playLevelUp();
      setMode('result');
    }
  };

  const handleAnswerChoice = (choiceId: string, isCorrect: boolean) => {
    if (selectedChoiceId !== null || isTimeout) return;
    setSelectedChoiceId(choiceId);

    if (isCorrect) {
      soundManager.playCoin();
      setMyScore((prev) => prev + 1);
    } else {
      soundManager.playClick();
    }

    // Simulated Opponent AI Response
    const oppCorrect = Math.random() > 0.35;
    if (oppCorrect) {
      setOpponentScore((prev) => prev + 1);
    }

    setTimeout(() => {
      moveToNextQuestion();
    }, 1200);
  };

  const currentQ = battleQuestions[currentQIndex];
  const timerPercent = Math.max(0, Math.min(100, (timeLeft / QUESTION_TIME_LIMIT) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto p-6 space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 font-black">
              <Swords className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Battle 1v1 Interaktif</h2>
              <p className="text-xs text-slate-400">10 Soalan Pantas • Pilih Tajuk • Cabaran Masa Nya!</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOBBY MODE */}
        {mode === 'lobby' && (
          <div className="space-y-5 overflow-y-auto pr-1 flex-1">
            {/* Topic Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Pilih Tajuk Soalan Battle (10 Soalan)</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TOPICS.map((topic) => {
                  const isSelected = selectedTopic === topic.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedTopic(topic.id);
                        setErrorMsg('');
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-slate-800 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/50'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-base">{topic.icon}</span>
                      <span className="truncate">{topic.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!activeRoom ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Create Room */}
                <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl text-center space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Bina Bilik Battle Baru</h3>
                    <p className="text-xs text-slate-400 mt-1">Dapatkan Kod Bilik 6-Aksara & jemput rakan berlawan.</p>
                  </div>
                  <button
                    onClick={handleCreateRoom}
                    className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Swords className="w-4 h-4" />
                    <span>Cipta Bilik Battle</span>
                  </button>
                </div>

                {/* Join Room */}
                <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl text-center space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Sertai Bilik Rakan</h3>
                    <p className="text-xs text-slate-400 mt-1">Masukkan Kod Bilik yang diberikan oleh rakan.</p>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      placeholder="Kod Bilik (cth: BTL-1234)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 text-center uppercase outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={handleJoinRoom}
                      className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs transition-all"
                    >
                      Sertai Bilik
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Active Waiting Room */
              <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-5 text-center space-y-4">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Kod Bilik Battle Anda</span>
                <div className="text-3xl font-black font-mono text-amber-400 tracking-widest">{activeRoom.code}</div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeRoom.code);
                    setCopiedCode(true);
                    soundManager.playCoin();
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center justify-center gap-1 mx-auto bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedCode ? 'Kod Disalin!' : 'Salin Kod Bilik'}
                </button>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-around">
                  <span className="font-bold text-sky-400">Pemain 1: {user.name}</span>
                  <span className="text-slate-500">VS</span>
                  <span className="font-bold text-rose-400">Pemain 2: {activeRoom.guest_name || 'Menunggu / Lawan AI...'}</span>
                </div>

                <button
                  onClick={handleStartBattle}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>Mula Cabaran Battle 10 Soalan!</span>
                </button>
              </div>
            )}

            {errorMsg && <p className="text-xs text-rose-400 font-bold text-center">{errorMsg}</p>}
          </div>
        )}

        {/* PLAYING BATTLE MODE */}
        {mode === 'playing' && currentQ && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Live Match Meter & Timer */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{user.name}</span>
                  <span className="text-xl font-black text-sky-400">{myScore} Mata</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{opponentName}</span>
                  <span className="text-xl font-black text-rose-400">{opponentScore} Mata</span>
                </div>
              </div>

              {/* Urgency Countdown Timer Bar */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-black">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Clock className={`w-4 h-4 ${timeLeft <= 5 ? 'animate-bounce text-rose-500' : ''}`} />
                    <span>Masa Menjawab</span>
                  </div>
                  <span
                    className={`font-mono text-sm ${
                      timeLeft <= 4
                        ? 'text-rose-500 font-black animate-pulse'
                        : timeLeft <= 8
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {timeLeft}s
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      timeLeft <= 4 ? 'bg-rose-500' : timeLeft <= 8 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${timerPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-amber-400">
                  Soalan {currentQIndex + 1} / {battleQuestions.length}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {TOPICS.find((t) => t.id === selectedTopic)?.name || 'Pendidikan Islam'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{currentQ.question_text}</h3>

              {isTimeout && (
                <div className="bg-rose-500/20 border border-rose-500/50 p-2 rounded-xl text-xs text-rose-300 font-bold flex items-center justify-center gap-2 animate-pulse">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Masa Tamat! Jawapan tidak dihantar.</span>
                </div>
              )}
            </div>

            {/* Choices Grid */}
            <div className="grid grid-cols-1 gap-2.5">
              {currentQ.choices.map((choice) => {
                const isSelected = selectedChoiceId === choice.id;
                let btnStyle = 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700';

                if (isSelected) {
                  btnStyle = choice.is_correct
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-rose-600 text-white border-rose-400';
                }

                return (
                  <button
                    key={choice.id}
                    onClick={() => handleAnswerChoice(choice.id, choice.is_correct)}
                    disabled={selectedChoiceId !== null || isTimeout}
                    className={`p-3.5 rounded-2xl text-xs font-extrabold text-left border transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{choice.option_text}</span>
                    {isSelected && choice.id !== 'TIMEOUT_CHOICE' && (
                      choice.is_correct ? <CheckCircle2 className="w-4 h-4 text-emerald-200" /> : <XCircle className="w-4 h-4 text-rose-200" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* RESULT MODE */}
        {mode === 'result' && (
          <div className="text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center mx-auto text-slate-950 shadow-xl shadow-amber-500/20">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">
                {myScore > opponentScore ? 'Kemenangan Manis! 🏆' : myScore === opponentScore ? 'Keputusan Seri! 🤝' : 'Usaha Yang Bagus! 💪'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Markah Akhir: <span className="font-bold text-sky-400">{myScore}</span> / {battleQuestions.length} vs <span className="font-bold text-rose-400">{opponentScore}</span> ({opponentName})
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-amber-300 font-bold flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Ganjaran Battle: +75 XP & +50 Koin</span>
            </div>

            <button
              onClick={() => {
                soundManager.playCoin();
                onFinishBattle(75, 50);
                onClose();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black rounded-2xl text-sm shadow-lg shadow-blue-500/25 transition-all"
            >
              Tebus Ganjaran & Kembali
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


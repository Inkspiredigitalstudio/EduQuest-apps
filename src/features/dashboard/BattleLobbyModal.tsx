import React, { useState, useEffect } from 'react';
import { UserProfile, Question, BattleRoom, Subject, Paper, Section } from '../../types';
import { createBattleRoom, joinBattleRoom, getBattleRoomState, updateBattleScore, finishBattleRoom } from '../../lib/supabase';
import { soundManager } from '../../lib/audio';
import { Swords, Play, Trophy, CheckCircle2, XCircle, Sparkles, X, Copy, Clock, AlertCircle, BookOpen, Loader2, Users } from 'lucide-react';

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

const TOPIC_ICONS: Record<string, string> = {
  AKIDAH: '🛡️',
  FEKAH: '📖',
  AKHLAK: '💖',
  SIRAH: '🧭',
};

const QUESTION_TIME_LIMIT = 15;
const POLL_INTERVAL_MS = 2500;

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
  const [mode, setMode] = useState<'lobby' | 'playing' | 'waiting_opponent' | 'result'>('lobby');
  const [activeRoom, setActiveRoom] = useState<BattleRoom | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [creatingOrJoining, setCreatingOrJoining] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const topics = [
    { id: 'all', name: 'Semua Tajuk', icon: '🌟' },
    ...subjects.map((s) => ({ id: s.id, name: s.name, icon: TOPIC_ICONS[s.name.toUpperCase()] || '📚' })),
  ];

  const [battleQuestions, setBattleQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);

  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME_LIMIT);

  const isHost = activeRoom ? activeRoom.host_id === user.id : true;
  const opponentName = activeRoom
    ? (isHost ? activeRoom.guest_name : activeRoom.host_name) || 'Menunggu rakan...'
    : 'Rakan';

  useEffect(() => {
    if (!isOpen) {
      setMode('lobby');
      setActiveRoom(null);
      setJoinCodeInput('');
      setCopiedCode(false);
      setErrorMsg('');
      setCreatingOrJoining(false);
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

  // Countdown timer for the current question
  useEffect(() => {
    if (mode !== 'playing' || selectedChoiceId !== null || isTimeout) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, timeLeft, selectedChoiceId, isTimeout]);

  // Live poll for opponent — covers: waiting for guest to join the lobby,
  // opponent's live score while both are playing, and opponent finishing
  // while this player is waiting for them.
  useEffect(() => {
    if (!activeRoom) return;
    if (mode !== 'lobby' && mode !== 'playing' && mode !== 'waiting_opponent') return;

    const interval = setInterval(async () => {
      const fresh = await getBattleRoomState(activeRoom.id);
      if (!fresh) return;

      setActiveRoom(fresh);
      setOpponentScore(isHost ? fresh.guest_score : fresh.host_score);

      const opponentFinished = isHost ? fresh.guest_finished : fresh.host_finished;
      if (mode === 'waiting_opponent' && opponentFinished) {
        soundManager.playLevelUp();
        setMode('result');
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [activeRoom?.id, mode, isHost]);

  if (!isOpen) return null;

  const handleTimeout = () => {
    soundManager.playClick();
    setIsTimeout(true);
    setSelectedChoiceId('TIMEOUT_CHOICE');

    setTimeout(() => {
      moveToNextQuestion();
    }, 1500);
  };

  const handleCreateRoom = async () => {
    soundManager.playClick();
    setErrorMsg('');

    const filtered = getFilteredQuestions();
    if (filtered.length === 0) {
      setErrorMsg('Tiada soalan ditemui untuk tajuk ini. Sila pilih tajuk lain.');
      return;
    }

    setCreatingOrJoining(true);
    const room = await createBattleRoom(user, filtered);
    setCreatingOrJoining(false);
    setActiveRoom(room);
  };

  const handleJoinRoom = async () => {
    soundManager.playClick();
    setErrorMsg('');
    if (!joinCodeInput.trim()) {
      setErrorMsg('Sila masukkan Kod Bilik Battle.');
      return;
    }

    setCreatingOrJoining(true);
    const room = await joinBattleRoom(joinCodeInput.trim(), user);
    setCreatingOrJoining(false);

    if (!room) {
      setErrorMsg('Bilik tidak dijumpai atau telah penuh. Semak semula kod tersebut.');
      return;
    }
    setActiveRoom(room);
  };

  const getFilteredQuestions = () => {
    if (selectedTopic === 'all') return questions;

    return questions.filter((q) => {
      const sec = sections.find((s) => s.id === q.section_id);
      if (!sec) return false;
      const pap = papers.find((p) => p.id === sec.paper_id);
      return pap?.subject_id === selectedTopic;
    });
  };

  const handleStartBattle = () => {
    if (!activeRoom) return;
    soundManager.playLevelUp();

    // Both players must answer the exact same questions — pulled from the
    // shared room record (set once, by whoever created the room) rather than
    // re-randomized locally per player.
    const sharedIds = activeRoom.question_ids || [];
    const matched = sharedIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is Question => Boolean(q));

    if (matched.length === 0) {
      setErrorMsg('Soalan battle untuk bilik ini tidak dijumpai. Cuba cipta bilik baru.');
      return;
    }

    setBattleQuestions(matched);
    setCurrentQIndex(0);
    setMyScore(0);
    setOpponentScore(isHost ? activeRoom.guest_score || 0 : activeRoom.host_score || 0);
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
      return;
    }

    // Finished all questions
    if (activeRoom) {
      finishBattleRoom(activeRoom.id, isHost);
      const opponentAlreadyFinished = isHost ? activeRoom.guest_finished : activeRoom.host_finished;
      if (opponentAlreadyFinished) {
        soundManager.playLevelUp();
        setMode('result');
      } else {
        setMode('waiting_opponent');
      }
    } else {
      soundManager.playLevelUp();
      setMode('result');
    }
  };

  const handleAnswerChoice = (choiceId: string, isCorrect: boolean) => {
    if (selectedChoiceId !== null || isTimeout) return;
    setSelectedChoiceId(choiceId);

    let newScore = myScore;
    if (isCorrect) {
      soundManager.playCoin();
      newScore = myScore + 1;
      setMyScore(newScore);
    } else {
      soundManager.playClick();
    }

    if (activeRoom) {
      // Fire-and-forget — gameplay shouldn't wait on network round trips
      updateBattleScore(activeRoom.id, isHost, newScore);
    }

    setTimeout(() => {
      moveToNextQuestion();
    }, 1200);
  };

  const currentQ = battleQuestions[currentQIndex];
  const timerPercent = Math.max(0, Math.min(100, (timeLeft / QUESTION_TIME_LIMIT) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-cream-50 border border-sand-200 rounded-3xl shadow-xl overflow-hidden my-auto p-6 space-y-6 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-sand-200 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-clay-500 flex items-center justify-center text-white">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-ink-900">Battle 1v1 Sebenar</h2>
              <p className="text-xs text-ink-500">10 Soalan • Lawan Rakan Sebenar • Cabaran Masa!</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-ink-500 hover:text-ink-900 bg-cream-100 hover:bg-cream-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOBBY MODE */}
        {mode === 'lobby' && (
          <div className="space-y-5 overflow-y-auto pr-1 flex-1">
            {!activeRoom && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink-700 uppercase tracking-wide flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-honey-500" />
                  <span>Pilih Tajuk Soalan Battle (10 Soalan)</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {topics.map((topic) => {
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
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-2 ${
                          isSelected ? 'bg-honey-100 border-honey-400 text-honey-500' : 'bg-cream-100 border-sand-200 text-ink-500 hover:border-sand-300'
                        }`}
                      >
                        <span className="text-base">{topic.icon}</span>
                        <span className="truncate">{topic.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!activeRoom ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-cream-100 border border-sand-200 p-5 rounded-2xl text-center space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-ink-900">Bina Bilik Battle Baru</h3>
                    <p className="text-xs text-ink-500 mt-1">Dapatkan Kod Bilik &amp; jemput rakan berlawan.</p>
                  </div>
                  <button
                    onClick={handleCreateRoom}
                    disabled={creatingOrJoining}
                    className="w-full py-3 px-4 bg-clay-500 hover:bg-clay-500/90 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {creatingOrJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
                    <span>Cipta Bilik Battle</span>
                  </button>
                </div>

                <div className="bg-cream-100 border border-sand-200 p-5 rounded-2xl text-center space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-ink-900">Sertai Bilik Rakan</h3>
                    <p className="text-xs text-ink-500 mt-1">Masukkan Kod Bilik yang diberikan oleh rakan.</p>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      placeholder="Kod Bilik (cth: BTL-1234)"
                      className="w-full bg-cream-50 border border-sand-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-honey-500 text-center uppercase outline-none focus:border-honey-400"
                    />
                    <button
                      onClick={handleJoinRoom}
                      disabled={creatingOrJoining}
                      className="w-full py-2.5 px-4 bg-cream-200 hover:bg-sand-300 disabled:opacity-60 text-ink-900 font-bold rounded-xl text-xs transition-colors"
                    >
                      {creatingOrJoining ? 'Menyambung...' : 'Sertai Bilik'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-cream-100 border border-honey-300 rounded-2xl p-5 text-center space-y-4">
                <span className="text-xs uppercase font-bold text-ink-500 tracking-wide">Kod Bilik Battle Anda</span>
                <div className="text-3xl font-display font-bold font-mono text-honey-500 tracking-widest">{activeRoom.code}</div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeRoom.code);
                    setCopiedCode(true);
                    soundManager.playCoin();
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="text-xs font-semibold text-honey-500 hover:text-honey-500/80 flex items-center justify-center gap-1 mx-auto bg-honey-100 px-3 py-1.5 rounded-lg"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedCode ? 'Kod Disalin!' : 'Salin Kod Bilik'}
                </button>

                <div className="p-3 bg-cream-50 rounded-xl border border-sand-200 text-xs text-ink-700 flex items-center justify-around">
                  <span className="font-bold text-mist-600">Pemain 1: {activeRoom.host_name}</span>
                  <span className="text-ink-300">VS</span>
                  <span className="font-bold text-clay-500 flex items-center gap-1.5">
                    {!activeRoom.guest_name && <Loader2 className="w-3 h-3 animate-spin" />}
                    Pemain 2: {activeRoom.guest_name || 'Menunggu rakan sertai...'}
                  </span>
                </div>

                <button
                  onClick={handleStartBattle}
                  className="w-full py-3.5 bg-sage-500 hover:bg-sage-600 text-white font-bold rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>{activeRoom.guest_name ? 'Mula Cabaran Battle 10 Soalan!' : 'Mula Latihan Solo (Tanpa Tunggu)'}</span>
                </button>
              </div>
            )}

            {errorMsg && <p className="text-xs text-clay-500 font-bold text-center">{errorMsg}</p>}
          </div>
        )}

        {/* PLAYING BATTLE MODE */}
        {mode === 'playing' && currentQ && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3 bg-cream-100 p-3 rounded-2xl border border-sand-200 text-center">
                <div>
                  <span className="text-[10px] text-ink-500 font-bold uppercase block">{user.name}</span>
                  <span className="text-xl font-display font-bold text-mist-600">{myScore} Mata</span>
                </div>
                <div>
                  <span className="text-[10px] text-ink-500 font-bold uppercase block">{opponentName}</span>
                  <span className="text-xl font-display font-bold text-clay-500">{opponentScore} Mata</span>
                </div>
              </div>

              <div className="bg-cream-100 border border-sand-200 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-honey-500">
                    <Clock className="w-4 h-4" />
                    <span>Masa Menjawab</span>
                  </div>
                  <span className={`font-mono text-sm ${timeLeft <= 4 ? 'text-clay-500 font-bold' : timeLeft <= 8 ? 'text-honey-500' : 'text-sage-600'}`}>
                    {timeLeft}s
                  </span>
                </div>

                <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${timeLeft <= 4 ? 'bg-clay-400' : timeLeft <= 8 ? 'bg-honey-400' : 'bg-sage-400'}`}
                    style={{ width: `${timerPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-cream-100 border border-sand-200 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs text-ink-500">
                <span className="font-bold text-honey-500">Soalan {currentQIndex + 1} / {battleQuestions.length}</span>
                <span className="text-[11px] font-bold uppercase tracking-wide">
                  {topics.find((t) => t.id === selectedTopic)?.name || 'Pendidikan Islam'}
                </span>
              </div>
              <h3 className="text-base font-bold text-ink-900">{currentQ.question_text}</h3>

              {isTimeout && (
                <div className="bg-clay-100 p-2 rounded-xl text-xs text-clay-500 font-bold flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Masa Tamat! Jawapan tidak dihantar.</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {currentQ.choices.map((choice) => {
                const isSelected = selectedChoiceId === choice.id;
                let btnStyle = 'bg-cream-100 hover:bg-cream-200 text-ink-900 border-sand-200';

                if (isSelected) {
                  btnStyle = choice.is_correct ? 'bg-sage-500 text-white border-sage-500' : 'bg-clay-500 text-white border-clay-500';
                }

                return (
                  <button
                    key={choice.id}
                    onClick={() => handleAnswerChoice(choice.id, choice.is_correct)}
                    disabled={selectedChoiceId !== null || isTimeout}
                    className={`p-3.5 rounded-2xl text-xs font-bold text-left border transition-colors flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{choice.option_text}</span>
                    {isSelected && choice.id !== 'TIMEOUT_CHOICE' && (
                      choice.is_correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* WAITING FOR OPPONENT TO FINISH */}
        {mode === 'waiting_opponent' && (
          <div className="text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-mist-100 flex items-center justify-center mx-auto text-mist-600">
              <Users className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-ink-900">Menunggu {opponentName} Selesai...</h3>
              <p className="text-xs text-ink-500 mt-1">Markah anda: <span className="font-bold text-mist-600">{myScore}</span> / {battleQuestions.length}</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-ink-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Keputusan akan dipaparkan automatik sebaik sahaja rakan selesai</span>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                setMode('result');
              }}
              className="text-xs font-semibold text-ink-500 hover:text-ink-700 underline"
            >
              Lihat keputusan sekarang (tanpa tunggu)
            </button>
          </div>
        )}

        {/* RESULT MODE */}
        {mode === 'result' && (
          <div className="text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-honey-400 flex items-center justify-center mx-auto text-white">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-display font-bold text-ink-900">
                {myScore > opponentScore ? 'Kemenangan Manis! 🏆' : myScore === opponentScore ? 'Keputusan Seri! 🤝' : 'Usaha Yang Bagus! 💪'}
              </h3>
              <p className="text-xs text-ink-500 mt-1">
                Markah Akhir: <span className="font-bold text-mist-600">{myScore}</span> / {battleQuestions.length} vs <span className="font-bold text-clay-500">{opponentScore}</span> ({opponentName})
              </p>
            </div>

            <div className="p-4 bg-honey-100 rounded-2xl text-xs text-honey-500 font-bold flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Ganjaran Battle: +75 XP & +50 Koin</span>
            </div>

            <button
              onClick={() => {
                soundManager.playCoin();
                onFinishBattle(75, 50);
                onClose();
              }}
              className="w-full py-3.5 bg-mist-500 hover:bg-mist-600 text-white font-bold rounded-2xl text-sm transition-colors"
            >
              Tebus Ganjaran &amp; Kembali
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

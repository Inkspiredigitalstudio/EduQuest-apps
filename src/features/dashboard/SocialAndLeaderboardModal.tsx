import React, { useState, useEffect } from 'react';
import { UserProfile, FriendRequest } from '../../types';
import { getFriendRequests, sendFriendRequest, respondFriendRequest, getLevelTitle } from '../../lib/supabase';
import { soundManager } from '../../lib/audio';
import { Users, Trophy, UserPlus, Check, X, Search, Sparkles, School, Crown, Copy, CheckCircle2 } from 'lucide-react';

interface SocialAndLeaderboardModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
}

export const SocialAndLeaderboardModal: React.FC<SocialAndLeaderboardModalProps> = ({
  isOpen,
  user,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'friends'>('leaderboard');
  const [leaderboardFilter, setLeaderboardFilter] = useState<'global' | 'school' | 'friends'>('global');

  // Friends search & request state
  const [friendInput, setFriendInput] = useState('');
  const [requestMsg, setRequestMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [copiedId, setCopiedId] = useState(false);

  const loadRequests = () => {
    const all = getFriendRequests();
    setFriendRequests(all);
  };

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen, user.id]);

  if (!isOpen) return null;

  const handleCopyMyId = (idToCopy: string) => {
    navigator.clipboard.writeText(idToCopy);
    soundManager.playClick();
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const incomingReqs = friendRequests.filter((r) => r.receiver_id === user.id && r.status === 'pending');
  const acceptedFriends = friendRequests.filter(
    (r) => (r.sender_id === user.id || r.receiver_id === user.id) && r.status === 'accepted'
  );

  const handleSendFriendReq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendInput.trim()) return;

    soundManager.playClick();
    setRequestMsg(null);

    const res = await sendFriendRequest(user, friendInput.trim());
    if (res.success) {
      soundManager.playLevelUp();
      setRequestMsg({ type: 'success', text: res.message });
      setFriendInput('');
      loadRequests();
    } else {
      soundManager.playClick();
      setRequestMsg({ type: 'error', text: res.message });
    }
  };

  const handleRespondReq = (reqId: string, status: 'accepted' | 'rejected') => {
    if (status === 'accepted') {
      soundManager.playLevelUp();
    } else {
      soundManager.playClick();
    }
    respondFriendRequest(reqId, status);
    loadRequests();
  };

  // Mock sample leaderboard data
  const sampleLeaderboard = [
    { rank: 1, name: 'Ahmad Zaki', xp: 1850, level: 7, school: 'SMKA Kuala Lumpur' },
    { rank: 2, name: 'Nur Maryam', xp: 1620, level: 6, school: 'SMKA Maahad Hamidiah' },
    { rank: 3, name: user.name, xp: user.xp, level: user.level, school: user.school_name || 'SMKA Simpang Empat' },
    { rank: 4, name: 'Muhammad Ali', xp: 920, level: 4, school: 'SPPI Selangor' },
    { rank: 5, name: 'Siti Sarah', xp: 750, level: 4, school: 'SMKA Tok Jiring' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto p-6 space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-sky-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-sky-500/20">
              <Trophy className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Carta Kedudukan & Rakan</h2>
              <p className="text-xs text-slate-400">Papan Mata Global, Sekolah, dan Rangkaian Rakan EduQuest</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => {
              setActiveTab('leaderboard');
              soundManager.playClick();
            }}
            className={`py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'leaderboard'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Carta Kedudukan (Leaderboard)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('friends');
              soundManager.playClick();
            }}
            className={`py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 relative ${
              activeTab === 'friends'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Carian & Permintaan Rakan</span>
            {friendRequests.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-2 right-4" />
            )}
          </button>
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'leaderboard' ? (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            {/* Filter Pills */}
            <div className="flex gap-2">
              <button
                onClick={() => setLeaderboardFilter('global')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  leaderboardFilter === 'global'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Keseluruhan (Global)</span>
              </button>

              <button
                onClick={() => setLeaderboardFilter('school')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  leaderboardFilter === 'school'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>Mengikut Sekolah</span>
              </button>

              <button
                onClick={() => setLeaderboardFilter('friends')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  leaderboardFilter === 'friends'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Rakan-Rakan</span>
              </button>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-2">
              {sampleLeaderboard.map((item) => {
                const isMe = item.name === user.name;

                return (
                  <div
                    key={item.rank}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                      isMe
                        ? 'bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border-sky-400/50 shadow-md'
                        : 'bg-slate-800/80 border-slate-700/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl font-black flex items-center justify-center shrink-0 ${
                        item.rank === 1
                          ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30'
                          : item.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : item.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-950 text-slate-400'
                      }`}>
                        #{item.rank}
                      </div>

                      <div>
                        <span className="font-bold text-white block text-sm flex items-center gap-2">
                          <span>{item.name}</span>
                          {isMe && <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-extrabold">Akaun Anda</span>}
                        </span>
                        <span className="text-[11px] text-slate-400">{item.school} • {getLevelTitle(item.level)}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-amber-400 block">{item.xp} XP</span>
                      <span className="text-[10px] text-slate-400 font-mono">Tahap {item.level}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* FRIENDS TAB */
          <div className="space-y-5 overflow-y-auto flex-1 pr-1">
            {/* My User ID Banner */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  User ID Anda (Kongsi kepada Rakan)
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs sm:text-sm font-mono font-black text-amber-300">
                    {user.login_id || user.id}
                  </span>
                  {user.id !== user.login_id && (
                    <span className="text-[10px] text-slate-500 font-mono">({user.id})</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyMyId(user.login_id || user.id)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copiedId ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Salin ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Search & Add Friend Form */}
            <form onSubmit={handleSendFriendReq} className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                Tambah Rakan Baharu
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={friendInput}
                    onChange={(e) => setFriendInput(e.target.value)}
                    placeholder="Masukkan User ID kawan, ID Login atau Nama..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Tambah Rakan</span>
                </button>
              </div>

              {requestMsg && (
                <p
                  className={`text-xs font-bold ${
                    requestMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {requestMsg.text}
                </p>
              )}
            </form>

            {/* Incoming Requests */}
            {incomingReqs.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Permintaan Rakan Masuk ({incomingReqs.length})
                </h3>

                {incomingReqs.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-slate-950 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{req.sender_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">User ID / Login ID: {req.sender_login_id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespondReq(req.id, 'accepted')}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Terima
                      </button>

                      <button
                        onClick={() => handleRespondReq(req.id, 'rejected')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Accepted Friends List */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Senarai Rakan Disahkan ({acceptedFriends.length})
              </h3>

              {acceptedFriends.length === 0 ? (
                <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-center text-xs text-slate-500">
                  Belum ada rakan ditambah. Gunakan User ID kawan anda di atas untuk mula berhubung!
                </div>
              ) : (
                acceptedFriends.map((f) => {
                  const friendName = f.sender_id === user.id ? f.receiver_name : f.sender_name;
                  const friendLoginId = f.sender_id === user.id ? f.receiver_login_id : f.sender_login_id;

                  return (
                    <div
                      key={f.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">{friendName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {friendLoginId}</span>
                        </div>
                      </div>

                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                        Rakan
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

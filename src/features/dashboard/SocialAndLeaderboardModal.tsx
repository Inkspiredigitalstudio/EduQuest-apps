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

export const SocialAndLeaderboardModal: React.FC<SocialAndLeaderboardModalProps> = ({ isOpen, user, onClose }) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'friends'>('leaderboard');
  const [leaderboardFilter, setLeaderboardFilter] = useState<'global' | 'school' | 'friends'>('global');

  const [friendInput, setFriendInput] = useState('');
  const [requestMsg, setRequestMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [copiedId, setCopiedId] = useState(false);

  const loadRequests = () => {
    const all = getFriendRequests();
    setFriendRequests(all);
  };

  useEffect(() => {
    if (isOpen) loadRequests();
  }, [isOpen, user.id]);

  if (!isOpen) return null;

  const handleCopyMyId = (idToCopy: string) => {
    navigator.clipboard.writeText(idToCopy);
    soundManager.playClick();
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const incomingReqs = friendRequests.filter((r) => r.receiver_id === user.id && r.status === 'pending');
  const acceptedFriends = friendRequests.filter((r) => (r.sender_id === user.id || r.receiver_id === user.id) && r.status === 'accepted');

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

  const sampleLeaderboard = [
    { rank: 1, name: 'Ahmad Zaki', xp: 1850, level: 7, school: 'SMKA Kuala Lumpur' },
    { rank: 2, name: 'Nur Maryam', xp: 1620, level: 6, school: 'SMKA Maahad Hamidiah' },
    { rank: 3, name: user.name, xp: user.xp, level: user.level, school: user.school_name || 'SMKA Simpang Empat' },
    { rank: 4, name: 'Muhammad Ali', xp: 920, level: 4, school: 'SPPI Selangor' },
    { rank: 5, name: 'Siti Sarah', xp: 750, level: 4, school: 'SMKA Tok Jiring' },
  ];

  const filterBtnCls = (active: boolean) =>
    `px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
      active ? 'bg-honey-400 text-white' : 'bg-cream-100 text-ink-500 hover:text-ink-700'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-cream-50 border border-sand-200 rounded-3xl shadow-xl overflow-hidden my-auto p-6 space-y-6 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-sand-200 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-mist-500 flex items-center justify-center text-white">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-ink-900">Carta Kedudukan &amp; Rakan</h2>
              <p className="text-xs text-ink-500">Papan Mata Global, Sekolah, dan Rangkaian Rakan EduQuest</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2.5 rounded-xl text-ink-500 hover:text-ink-900 bg-cream-100 hover:bg-cream-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 bg-cream-100 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => {
              setActiveTab('leaderboard');
              soundManager.playClick();
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'leaderboard' ? 'bg-mist-500 text-white' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Carta Kedudukan</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('friends');
              soundManager.playClick();
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 relative ${
              activeTab === 'friends' ? 'bg-mist-500 text-white' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Carian &amp; Permintaan Rakan</span>
            {friendRequests.length > 0 && <span className="w-2 h-2 rounded-full bg-clay-500 absolute top-2 right-4" />}
          </button>
        </div>

        {activeTab === 'leaderboard' ? (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div className="flex gap-2">
              <button onClick={() => setLeaderboardFilter('global')} className={filterBtnCls(leaderboardFilter === 'global')}>
                <Crown className="w-3.5 h-3.5" />
                <span>Keseluruhan</span>
              </button>
              <button onClick={() => setLeaderboardFilter('school')} className={filterBtnCls(leaderboardFilter === 'school')}>
                <School className="w-3.5 h-3.5" />
                <span>Mengikut Sekolah</span>
              </button>
              <button onClick={() => setLeaderboardFilter('friends')} className={filterBtnCls(leaderboardFilter === 'friends')}>
                <Users className="w-3.5 h-3.5" />
                <span>Rakan-Rakan</span>
              </button>
            </div>

            <div className="space-y-2">
              {sampleLeaderboard.map((item) => {
                const isMe = item.name === user.name;
                const rankBadge =
                  item.rank === 1 ? 'bg-honey-400 text-white' :
                  item.rank === 2 ? 'bg-sand-300 text-ink-900' :
                  item.rank === 3 ? 'bg-clay-400 text-white' : 'bg-cream-200 text-ink-500';

                return (
                  <div
                    key={item.rank}
                    className={`p-3.5 rounded-2xl border transition-colors flex items-center justify-between gap-3 text-xs ${
                      isMe ? 'bg-mist-100 border-mist-300' : 'bg-cream-100 border-sand-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 ${rankBadge}`}>
                        #{item.rank}
                      </div>

                      <div>
                        <span className="font-bold text-ink-900 block text-sm flex items-center gap-2">
                          <span>{item.name}</span>
                          {isMe && <span className="text-[10px] bg-mist-200 text-mist-700 px-2 py-0.5 rounded-full font-bold">Akaun Anda</span>}
                        </span>
                        <span className="text-[11px] text-ink-500">{item.school} • {getLevelTitle(item.level)}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-honey-500 block">{item.xp} XP</span>
                      <span className="text-[10px] text-ink-500 font-mono">Tahap {item.level}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-5 overflow-y-auto flex-1 pr-1">
            <div className="bg-cream-100 border border-sand-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-ink-500 tracking-wide block">User ID Anda (Kongsi kepada Rakan)</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs sm:text-sm font-mono font-bold text-honey-500">{user.login_id || user.id}</span>
                  {user.id !== user.login_id && <span className="text-[10px] text-ink-300 font-mono">({user.id})</span>}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyMyId(user.login_id || user.id)}
                className="px-3 py-1.5 bg-cream-50 hover:bg-cream-200 border border-sand-200 text-ink-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copiedId ? (<><CheckCircle2 className="w-3.5 h-3.5 text-sage-600" /><span className="text-sage-600">Disalin!</span></>) : (<><Copy className="w-3.5 h-3.5 text-honey-500" /><span>Salin ID</span></>)}
              </button>
            </div>

            <form onSubmit={handleSendFriendReq} className="space-y-3">
              <label className="text-xs font-bold text-ink-700 block">Tambah Rakan Baharu</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-ink-300" />
                  <input
                    type="text"
                    value={friendInput}
                    onChange={(e) => setFriendInput(e.target.value)}
                    placeholder="Masukkan User ID kawan, ID Login atau Nama..."
                    className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-sand-300 rounded-xl text-xs text-ink-900 placeholder-ink-300 focus:outline-none focus:border-mist-400 font-mono"
                  />
                </div>

                <button type="submit" className="px-4 py-2.5 bg-mist-500 hover:bg-mist-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0">
                  <UserPlus className="w-4 h-4" />
                  <span>Tambah Rakan</span>
                </button>
              </div>

              {requestMsg && (
                <p className={`text-xs font-bold ${requestMsg.type === 'success' ? 'text-sage-600' : 'text-clay-500'}`}>
                  {requestMsg.text}
                </p>
              )}
            </form>

            {incomingReqs.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-sand-200">
                <h3 className="text-xs font-bold text-honey-500 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Permintaan Rakan Masuk ({incomingReqs.length})
                </h3>

                {incomingReqs.map((req) => (
                  <div key={req.id} className="p-3 bg-honey-100/60 border border-honey-200 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-ink-900 block">{req.sender_name}</span>
                      <span className="text-[10px] text-ink-500 font-mono">User ID / Login ID: {req.sender_login_id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => handleRespondReq(req.id, 'accepted')} className="px-3 py-1 bg-sage-500 hover:bg-sage-600 text-white font-bold rounded-lg text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Terima
                      </button>
                      <button onClick={() => handleRespondReq(req.id, 'rejected')} className="px-2 py-1 bg-cream-100 hover:bg-cream-200 text-ink-700 font-bold rounded-lg text-xs">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-sand-200">
              <h3 className="text-xs font-bold text-ink-500 uppercase tracking-wide flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Senarai Rakan Disahkan ({acceptedFriends.length})
              </h3>

              {acceptedFriends.length === 0 ? (
                <div className="p-4 bg-cream-100 border border-sand-200 rounded-2xl text-center text-xs text-ink-500">
                  Belum ada rakan ditambah. Gunakan User ID kawan anda di atas untuk mula berhubung!
                </div>
              ) : (
                acceptedFriends.map((f) => {
                  const friendName = f.sender_id === user.id ? f.receiver_name : f.sender_name;
                  const friendLoginId = f.sender_id === user.id ? f.receiver_login_id : f.sender_login_id;

                  return (
                    <div key={f.id} className="p-3 bg-cream-100 border border-sand-200 rounded-2xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-mist-100 text-mist-600 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-ink-900 block">{friendName}</span>
                          <span className="text-[10px] text-ink-500 font-mono">ID: {friendLoginId}</span>
                        </div>
                      </div>

                      <span className="text-[10px] bg-sage-100 text-sage-600 font-bold px-2 py-0.5 rounded-full">Rakan</span>
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

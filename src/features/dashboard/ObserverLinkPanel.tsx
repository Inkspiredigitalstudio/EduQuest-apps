import React, { useState, useEffect } from 'react';
import { UserProfile, StudentLink } from '../../types';
import { createLinkRequest, getStudentLinks } from '../../lib/supabase';
import { soundManager } from '../../lib/audio';
import { Link2, Send, CheckCircle2, Clock, XCircle, KeyRound, Sparkles } from 'lucide-react';

interface ObserverLinkPanelProps {
  user: UserProfile;
  onLinkSuccess?: () => void;
}

export const ObserverLinkPanel: React.FC<ObserverLinkPanelProps> = ({ user, onLinkSuccess }) => {
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<StudentLink[]>([]);

  const loadMyLinks = () => {
    const all = getStudentLinks();
    setLinks(all.filter((l) => l.observer_id === user.id));
  };

  useEffect(() => {
    loadMyLinks();
  }, [user.id]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    setStatusMsg(null);
    setLoading(true);
    soundManager.playClick();

    const res = await createLinkRequest(user, inviteCodeInput.trim());
    setLoading(false);

    if (res.success) {
      soundManager.playLevelUp();
      setStatusMsg({ type: 'success', text: res.message });
      setInviteCodeInput('');
      loadMyLinks();
      if (onLinkSuccess) onLinkSuccess();
    } else {
      soundManager.playClick();
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
          <Link2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Pautkan Akaun Pelajar Baru
          </h2>
          <p className="text-xs text-slate-400">
            Masukkan Kod Jemputan 8-Aksara pelajar (cth: <span className="font-mono text-sky-400 font-bold">EDU-892A</span> atau <span className="font-mono text-sky-400 font-bold">A8F92K1L</span>)
          </p>
        </div>
      </div>

      <form onSubmit={handleSendRequest} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4 text-blue-400" />
            </div>
            <input
              type="text"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
              placeholder="Masukkan Kod Jemputan Pelajar (8 Aksara)"
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-sm font-mono font-bold text-sky-300 tracking-wider placeholder-slate-500 focus:outline-none focus:border-blue-400 uppercase"
              maxLength={12}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Menghantar...' : 'Hantar Permintaan Pautan'}</span>
          </button>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/15 border border-red-500/30 text-red-400'
            }`}
          >
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </form>

      {/* Linked Students List */}
      <div className="pt-2 border-t border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Status Permintaan Pautan Akaun ({links.length})</span>
        </h3>

        {links.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Belum ada permintaan pautan pelajar.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {links.map((link) => (
              <div
                key={link.id}
                className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{link.student_name || 'Pelajar'}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Kod: {link.student_invite_code}</span>
                </div>

                {link.status === 'accepted' ? (
                  <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Diluluskan
                  </span>
                ) : link.status === 'rejected' ? (
                  <span className="px-2.5 py-1 bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-extrabold rounded-lg flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Ditolak
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold rounded-lg flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" /> Menunggu...
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

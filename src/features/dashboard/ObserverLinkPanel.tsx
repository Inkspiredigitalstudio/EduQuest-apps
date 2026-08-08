import React, { useState, useEffect } from 'react';
import { UserProfile, StudentLink } from '../../types';
import { createLinkRequest, getStudentLinks } from '../../lib/supabase';
import { soundManager } from '../../lib/audio';
import { Link2, Send, CheckCircle2, Clock, XCircle, KeyRound } from 'lucide-react';

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
    <div className="bg-cream-50 border border-sand-200 rounded-3xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600 shrink-0">
          <Link2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-display font-bold text-ink-900">Pautkan Akaun Anak</h2>
          <p className="text-xs text-ink-500">
            Masukkan Kod Jemputan pelajar (cth: <span className="font-mono font-bold text-sage-600">A8F92K1L</span>)
          </p>
        </div>
      </div>

      <form onSubmit={handleSendRequest} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <KeyRound className="w-4 h-4 text-sage-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
              placeholder="Kod Jemputan Pelajar (8 Aksara)"
              className="w-full pl-10 pr-4 py-3 bg-cream-100 border border-sand-300 rounded-2xl text-sm font-mono font-bold text-ink-900 tracking-wider placeholder-ink-300 focus:outline-none focus:border-sage-400 uppercase"
              maxLength={12}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 bg-sage-500 hover:bg-sage-600 text-white font-bold rounded-2xl transition-colors text-sm flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Menghantar...' : 'Hantar Pautan'}</span>
          </button>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              statusMsg.type === 'success' ? 'bg-sage-100 text-sage-600' : 'bg-clay-100 text-clay-500'
            }`}
          >
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </form>

      {links.length > 0 && (
        <div className="pt-2 border-t border-sand-200">
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-3">
            Status Pautan ({links.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {links.map((link) => (
              <div key={link.id} className="p-3 bg-cream-100 border border-sand-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-ink-900 block">{link.student_name || 'Pelajar'}</span>
                  <span className="text-[10px] text-ink-500 font-mono">Kod: {link.student_invite_code}</span>
                </div>

                {link.status === 'accepted' ? (
                  <span className="px-2.5 py-1 bg-sage-100 text-sage-600 text-[10px] font-bold rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Diluluskan
                  </span>
                ) : link.status === 'rejected' ? (
                  <span className="px-2.5 py-1 bg-clay-100 text-clay-500 text-[10px] font-bold rounded-lg flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Ditolak
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-honey-100 text-honey-500 text-[10px] font-bold rounded-lg flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Menunggu...
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

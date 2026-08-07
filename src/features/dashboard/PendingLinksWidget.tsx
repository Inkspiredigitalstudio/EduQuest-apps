import React, { useState, useEffect } from 'react';
import { StudentLink, UserProfile } from '../../types';
import { getStudentLinks, updateLinkStatus } from '../../lib/supabase';
import { soundManager } from '../../lib/audio';
import { ShieldAlert, Check, X, Users, CheckCircle2 } from 'lucide-react';

interface PendingLinksWidgetProps {
  user: UserProfile;
}

export const PendingLinksWidget: React.FC<PendingLinksWidgetProps> = ({ user }) => {
  const [links, setLinks] = useState<StudentLink[]>([]);

  const loadLinks = () => {
    const allLinks = getStudentLinks();
    const pendingForMe = allLinks.filter(
      (l) => l.student_id === user.id && l.status === 'pending'
    );
    setLinks(pendingForMe);
  };

  useEffect(() => {
    loadLinks();
  }, [user.id]);

  if (links.length === 0) return null;

  const handleAction = (linkId: string, status: 'accepted' | 'rejected') => {
    if (status === 'accepted') {
      soundManager.playLevelUp();
    } else {
      soundManager.playClick();
    }
    updateLinkStatus(linkId, status);
    loadLinks();
  };

  return (
    <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-blue-950/80 border-2 border-indigo-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <span>Permintaan Pautan Akaun ({links.length})</span>
          </h3>
          <p className="text-xs text-indigo-200/80">
            Ibu Bapa / Guru ingin memautkan akaun untuk memantau prestasi latihan anda.
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        {links.map((link) => (
          <div
            key={link.id}
            className="p-3.5 bg-slate-950/80 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">{link.observer_name}</span>
                <span className="text-[11px] text-indigo-300/80 capitalize">
                  Peranan: {link.observer_role === 'parent' ? 'Ibu Bapa' : 'Guru'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleAction(link.id, 'accepted')}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Luluskan</span>
              </button>

              <button
                onClick={() => handleAction(link.id, 'rejected')}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Tolak</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

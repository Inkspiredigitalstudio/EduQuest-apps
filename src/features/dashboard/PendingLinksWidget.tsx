import React, { useState, useEffect } from 'react';
import { StudentLink, UserProfile } from '../../types';
import { getStudentLinks, updateLinkStatus } from '../../lib/supabase';
import { soundManager } from '../../lib/audio';
import { ShieldAlert, Check, X, Users } from 'lucide-react';

interface PendingLinksWidgetProps {
  user: UserProfile;
}

export const PendingLinksWidget: React.FC<PendingLinksWidgetProps> = ({ user }) => {
  const [links, setLinks] = useState<StudentLink[]>([]);

  const loadLinks = () => {
    const allLinks = getStudentLinks();
    const pendingForMe = allLinks.filter((l) => l.student_id === user.id && l.status === 'pending');
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
    <div className="bg-mist-100 border border-mist-200 rounded-3xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cream-50 flex items-center justify-center text-mist-600 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-display font-bold text-ink-900">
            Permintaan Pautan Akaun ({links.length})
          </h3>
          <p className="text-xs text-ink-500">
            Ibu bapa ingin memautkan akaun untuk memantau prestasi latihan anda.
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        {links.map((link) => (
          <div key={link.id} className="p-3.5 bg-cream-50 border border-mist-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-mist-500 shrink-0" />
              <div>
                <span className="font-bold text-ink-900 block">{link.observer_name}</span>
                <span className="text-[11px] text-ink-500">Peranan: Ibu Bapa</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleAction(link.id, 'accepted')}
                className="px-3 py-1.5 bg-sage-500 hover:bg-sage-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Luluskan</span>
              </button>

              <button
                onClick={() => handleAction(link.id, 'rejected')}
                className="px-2.5 py-1.5 bg-cream-100 hover:bg-cream-200 text-ink-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
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

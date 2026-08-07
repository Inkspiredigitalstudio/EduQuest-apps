import React from 'react';
import { UserProfile } from '../../types';
import { updateUserRole } from '../../lib/supabase';
import { soundManager } from '../../lib/audio';
import { GraduationCap, Heart, Sparkles } from 'lucide-react';

interface RoleSelectionModalProps {
  isOpen: boolean;
  user: UserProfile;
  onSuccess: (updatedUser: UserProfile) => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  user,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const handleSelectRole = async (role: 'student' | 'parent') => {
    soundManager.playLevelUp();
    const updated = await updateUserRole(user, role);
    onSuccess(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-cream-50 border border-sand-200 rounded-3xl shadow-xl overflow-hidden my-auto p-7 sm:p-9 space-y-7">
        <div className="text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-mist-100 border border-mist-200 flex items-center justify-center mx-auto text-mist-600">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-display font-bold text-ink-900">
            Pilih Peranan Akaun
          </h2>
          <p className="text-sm text-ink-500 max-w-xs mx-auto leading-relaxed">
            Selamat datang, <span className="font-semibold text-ink-700">{user.name}</span>. Sila pilih satu peranan untuk teruskan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {/* Student Card */}
          <button
            onClick={() => handleSelectRole('student')}
            className="p-5 rounded-3xl bg-cream-50 hover:bg-mist-100/60 border-2 border-sand-200 hover:border-mist-300 text-left transition-colors group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-mist-100 flex items-center justify-center text-mist-600 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-display font-bold text-ink-900 block">
                Pelajar
              </span>
              <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">
                Jawab kuiz, kumpul XP &amp; koin, sertai Battle 1v1.
              </p>
            </div>
          </button>

          {/* Parent Card */}
          <button
            onClick={() => handleSelectRole('parent')}
            className="p-5 rounded-3xl bg-cream-50 hover:bg-sage-100/60 border-2 border-sand-200 hover:border-sage-300 text-left transition-colors group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-sage-100 flex items-center justify-center text-sage-600 shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-display font-bold text-ink-900 block">
                Ibu Bapa
              </span>
              <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">
                Pautkan akaun anak &amp; pantau keputusan, prestasi serta perkembangan.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

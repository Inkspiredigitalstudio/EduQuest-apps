import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { updateUserRole } from '../../lib/supabase';
import { soundManager } from '../../lib/audio';
import { GraduationCap, Users, ShieldCheck, Sparkles, Key, AlertCircle } from 'lucide-react';

interface RoleSelectionModalProps {
  isOpen: boolean;
  user: UserProfile;
  onSuccess?: (updatedUser: UserProfile) => void;
  onRoleSelected?: (updatedUser: UserProfile) => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  user,
  onSuccess,
  onRoleSelected,
}) => {
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  if (!isOpen) return null;

  const handleCallback = (updated: UserProfile) => {
    if (onSuccess) onSuccess(updated);
    if (onRoleSelected) onRoleSelected(updated);
  };

  const handleSelectRole = async (role: 'student' | 'parent') => {
    soundManager.playLevelUp();
    const updated = await updateUserRole(user, role);
    handleCallback(updated);
  };

  const handleVerifyAdminPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    soundManager.playClick();

    const clean = adminPasscode.trim().toUpperCase();
    if (clean === 'SPPIM-ADMIN-2026' || clean === 'ADMIN123' || clean === 'ADMIN') {
      soundManager.playLevelUp();
      const updated = await updateUserRole(user, 'admin');
      handleCallback(updated);
    } else {
      setPasscodeError('Kod Laluan Admin tidak sah. Sila dapatkan kelulusan daripada Pentadbir Utama.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 border border-blue-400/40 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 text-white">
            <Sparkles className="w-7 h-7 text-yellow-300 animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Pilih Peranan Akaun Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
            Selamat datang, <span className="font-bold text-sky-400">{user.name}</span>! Sila pilih peranan anda untuk menyesuaikan antara muka EduQuest.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Student Card */}
          <button
            onClick={() => handleSelectRole('student')}
            className="p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border-2 border-slate-700/80 hover:border-blue-500 text-left transition-all group flex items-center gap-4 shadow-md hover:scale-[1.01]"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 group-hover:bg-blue-500 group-hover:text-slate-950 transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-white group-hover:text-blue-300">
                  Pelajar (Student)
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                  Kuiz & Ganjaran
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Jawab kuiz interaktif, kumpul XP & Koin, sertai Battle 1v1, dan dapatkan Kod Pautan 8-Aksara.
              </p>
            </div>
          </button>

          {/* Parent Card */}
          <button
            onClick={() => handleSelectRole('parent')}
            className="p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border-2 border-slate-700/80 hover:border-emerald-500 text-left transition-all group flex items-center gap-4 shadow-md hover:scale-[1.01]"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-white group-hover:text-emerald-300">
                  Ibu Bapa (Parent)
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  Pemantauan Anak
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pautkan akaun anak menggunakan Kod Jemputan & pantau markah, perkembangan serta laporan WhatsApp.
              </p>
            </div>
          </button>

          {/* Admin Approval Card */}
          <div className="p-4 rounded-2xl bg-slate-800/90 border-2 border-slate-700/80 hover:border-amber-500 transition-all space-y-3">
            <button
              onClick={() => {
                setShowAdminPasscode(!showAdminPasscode);
                soundManager.playClick();
              }}
              className="w-full text-left flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white group-hover:text-amber-300">
                    Pentadbir / Admin (Diluluskan Sahaja)
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    Kelulusan Khas
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Akses CMS untuk tambah soalan, import SQL, tambah subjek & reset password pelajar/ibubapa.
                </p>
              </div>
            </button>

            {showAdminPasscode && (
              <form onSubmit={handleVerifyAdminPasscode} className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Masukkan Kod Laluan Kelulusan Admin:
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Key className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      placeholder="Contoh: SPPIM-ADMIN-2026"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none font-mono"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shrink-0 shadow"
                  >
                    Sahkan Admin
                  </button>
                </div>
                {passcodeError && (
                  <div className="p-2 bg-red-500/15 border border-red-500/30 rounded-lg text-red-400 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passcodeError}</span>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

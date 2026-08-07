import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { soundManager } from '../../lib/audio';
import { Coins, Flame, Award, Volume2, VolumeX, User, Shield, LogOut, Download, Smartphone, Heart, WifiOff } from 'lucide-react';

interface HeaderProps {
  user: UserProfile | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenParent: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isMuted,
  onToggleMute,
  onOpenAuth,
  onOpenProfile,
  onOpenParent,
  onOpenAdmin,
  onLogout,
  onGoHome,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    soundManager.playClick();
    if (!deferredPrompt) {
      alert('📌 Arahan PWA:\n\n' +
        '• Pada Android / Chrome: Tekan menu tiga titik (⋮) > Pilih "Add to Home Screen" atau "Install App".\n' +
        '• Pada iPhone / Safari: Tekan butang Kongsi (Share) > Pilih "Add to Home Screen" (Tambah ke Skrin Utama).');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const currentLevelXp = (user?.xp || 0) % 100;
  const xpPercent = Math.min(100, Math.round((currentLevelXp / 100) * 100));

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white px-3 sm:px-6 py-2.5 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo & User Info */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onGoHome}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-lg sm:text-xl font-black text-white">S</span>
            </div>
            <div className="text-left hidden xs:block">
              <span className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
                SPPIM-Quest
              </span>
              <div className="flex items-center gap-1">
                <p className="text-[10px] text-slate-400 font-bold -mt-0.5">EduQuest Hub</p>
                {isOffline && (
                  <span className="text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-md flex items-center gap-1 animate-pulse">
                    <WifiOff className="w-2.5 h-2.5" /> Luar Talian
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Horizontal Gamified Stats Bar (Big & Clear Numbers) */}
        {user ? (
          <div className="flex items-center gap-1.5 sm:gap-3 bg-slate-800/90 border border-slate-700/80 px-2.5 sm:px-4 py-1.5 rounded-2xl shadow-inner">
            {/* User Avatar & Name */}
            <button
              onClick={() => {
                soundManager.playClick();
                if (user.role === 'parent') {
                  onOpenParent();
                } else {
                  onOpenProfile();
                }
              }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity pr-1 sm:pr-2 border-r border-slate-700"
              title={user.role === 'parent' ? "Dashboard Ibu Bapa" : "Lihat Profil"}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow">
                {user.avatar || user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-200 hidden md:inline max-w-[90px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </button>

            {/* Level & XP */}
            <button
              onClick={() => {
                soundManager.playClick();
                if (user.role === 'parent') {
                  onOpenParent();
                } else {
                  onOpenProfile();
                }
              }}
              className="flex items-center gap-1.5 hover:bg-slate-700/50 px-1.5 py-0.5 rounded-xl transition-colors"
              title={user.role === 'parent' ? "Dashboard Ibu Bapa" : "Level & XP"}
            >
              <span className="bg-indigo-600 text-white font-black text-[11px] px-2 py-0.5 rounded-lg shadow-sm">
                Lvl {user.level}
              </span>
              <span className="text-xs font-black text-indigo-300 hidden sm:inline font-mono">
                {currentLevelXp} XP
              </span>
            </button>

            {/* Coins */}
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 sm:px-2.5 py-0.5 rounded-xl text-amber-400 font-black text-xs sm:text-sm">
              <Coins className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
              <span>{user.coin}</span>
            </div>

            {/* Streak Flame */}
            <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/30 px-2 sm:px-2.5 py-0.5 rounded-xl text-orange-400 font-black text-xs sm:text-sm">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 shrink-0" />
              <span>{user.streak_days || 1}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenAuth();
              }}
              className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              Log Masuk
            </button>
          </div>
        )}

        {/* Right Tools (Sound, Parent, Admin) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              onToggleMute();
              soundManager.playClick();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title={isMuted ? 'Buka Bunyi' : 'Tutup Bunyi'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenParent();
            }}
            className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 transition-colors"
            title="Portal Ibu Bapa"
          >
            <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400/30" />
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAdmin();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors text-xs font-bold shadow-sm"
            title="Panel Pentadbir (Admin CMS)"
          >
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden xs:inline text-[11px] font-black">Admin</span>
          </button>

          {user && (
            <button
              onClick={() => {
                soundManager.playClick();
                onLogout();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-slate-700 transition-colors"
              title="Log Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

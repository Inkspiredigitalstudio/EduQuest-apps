import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { soundManager } from '../../lib/audio';
import { Coins, Flame, Volume2, VolumeX, LogOut, WifiOff, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  user: UserProfile | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isMuted,
  onToggleMute,
  onOpenAuth,
  onOpenProfile,
  onLogout,
  onGoHome,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const currentLevelXp = (user?.xp || 0) % 100;

  return (
    <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur border-b border-sand-200 text-ink-900 px-3 sm:px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo — EduQuest is the platform, SPPIM is the active module */}
        <button onClick={onGoHome} className="flex items-center gap-2.5 group focus:outline-none shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-mist-500 flex items-center justify-center shrink-0">
            <span className="text-lg sm:text-xl font-display font-bold text-white">E</span>
          </div>
          <div className="text-left hidden xs:block">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-display font-bold text-ink-900">
                EduQuest
              </span>
              <span className="text-[9px] font-bold uppercase bg-mist-100 text-mist-600 px-1.5 py-0.5 rounded-md">
                Modul SPPIM
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] text-ink-500 font-semibold -mt-0.5">Belajar Macam Main Game!</p>
              {isOffline && (
                <span className="text-[9px] font-bold bg-honey-100 text-honey-500 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  <WifiOff className="w-2.5 h-2.5" /> Luar Talian
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Stats Bar */}
        {user ? (
          <div className="flex items-center gap-1.5 sm:gap-3 bg-cream-100 border border-sand-200 px-2.5 sm:px-4 py-1.5 rounded-2xl">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenProfile();
              }}
              className="flex items-center gap-2 hover:opacity-75 transition-opacity pr-1.5 sm:pr-2.5 border-r border-sand-300"
              title="Lihat Profil"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-mist-500 text-white font-bold text-xs flex items-center justify-center">
                {user.avatar || user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-ink-700 hidden md:inline max-w-[90px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenProfile();
              }}
              className="flex items-center gap-1.5 hover:bg-cream-200 px-1.5 py-0.5 rounded-xl transition-colors"
              title="Level & XP"
            >
              <span className="bg-mist-500 text-white font-bold text-[11px] px-2 py-0.5 rounded-lg">
                Lvl {user.level}
              </span>
              <span className="text-xs font-bold text-mist-600 hidden sm:inline">
                {currentLevelXp} XP
              </span>
            </button>

            <div className="flex items-center gap-1 bg-honey-100 px-2 sm:px-2.5 py-0.5 rounded-xl text-honey-500 font-bold text-xs sm:text-sm">
              <Coins className="w-4 h-4 shrink-0" />
              <span>{user.coin}</span>
            </div>

            <div className="flex items-center gap-1 bg-clay-100 px-2 sm:px-2.5 py-0.5 rounded-xl text-clay-500 font-bold text-xs sm:text-sm">
              <Flame className="w-4 h-4 shrink-0" />
              <span>{user.streak_days || 1}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAuth();
            }}
            className="bg-mist-500 hover:bg-mist-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
          >
            Log Masuk
          </button>
        )}

        {/* Right Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-ink-500 border border-sand-200 transition-colors"
            title={isDarkMode ? 'Tukar ke Mod Cerah' : 'Tukar ke Mod Gelap'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-honey-400" /> : <Moon className="w-4 h-4 text-mist-500" />}
          </button>

          <button
            onClick={() => {
              onToggleMute();
              soundManager.playClick();
            }}
            className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-ink-500 border border-sand-200 transition-colors"
            title={isMuted ? 'Buka Bunyi' : 'Tutup Bunyi'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-mist-500" />}
          </button>

          {user && (
            <button
              onClick={() => {
                soundManager.playClick();
                onLogout();
              }}
              className="p-2 rounded-xl bg-cream-100 hover:bg-clay-100 hover:text-clay-500 text-ink-500 border border-sand-200 transition-colors"
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

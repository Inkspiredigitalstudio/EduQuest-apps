import React from 'react';
import { UserProfile } from '../../types';
import { soundManager } from '../../lib/audio';
import { BookOpen, Swords, Award, Users, User, Sparkles } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'battle' | 'achievements' | 'leaderboard' | 'profile';
  user: UserProfile | null;
  onSelectTab: (tab: 'home' | 'battle' | 'achievements' | 'leaderboard' | 'profile') => void;
}

interface NavItem {
  id: 'home' | 'battle' | 'achievements' | 'leaderboard' | 'profile';
  label: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  badge?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  user,
  onSelectTab,
}) => {
  const navItems: NavItem[] = [
    { id: 'home', label: 'Utama', icon: BookOpen, color: 'text-sky-400' },
    { id: 'battle', label: 'Battle 1v1', icon: Swords, color: 'text-rose-400', badge: 'HOT' },
    { id: 'achievements', label: 'Lencana', icon: Award, color: 'text-amber-400' },
    { id: 'leaderboard', label: 'Ranking', icon: Users, color: 'text-emerald-400' },
    { id: 'profile', label: 'Profil', icon: User, color: 'text-indigo-400' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/90 shadow-2xl py-2 px-3 sm:px-6">
      <div className="max-w-md sm:max-w-xl mx-auto flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playClick();
                onSelectTab(item.id as any);
              }}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 sm:px-5 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? 'bg-slate-800 text-white scale-105 shadow-md border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {/* Highlight bar on top of active icon */}
              {isActive && (
                <div className="absolute -top-2 w-8 h-1 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full shadow-lg shadow-sky-500/50" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? item.color : ''}`} />
                {item.badge && (
                  <span className="absolute -top-2 -right-3 text-[9px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded-full uppercase tracking-tighter animate-pulse shadow">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] sm:text-[11px] font-extrabold mt-1 tracking-tight ${
                isActive ? 'text-white' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

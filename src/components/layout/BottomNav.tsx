import React from 'react';
import { UserProfile } from '../../types';
import { soundManager } from '../../lib/audio';
import { BookOpen, Swords, Award, Users, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'battle' | 'achievements' | 'leaderboard' | 'profile';
  user: UserProfile | null;
  onSelectTab: (tab: 'home' | 'battle' | 'achievements' | 'leaderboard' | 'profile') => void;
}

interface NavItem {
  id: 'home' | 'battle' | 'achievements' | 'leaderboard' | 'profile';
  label: string;
  icon: React.FC<{ className?: string }>;
  activeColor: string;
  activeBg: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, user, onSelectTab }) => {
  const navItems: NavItem[] = [
    { id: 'home', label: 'Utama', icon: BookOpen, activeColor: 'text-mist-600', activeBg: 'bg-mist-100' },
    { id: 'battle', label: 'Battle', icon: Swords, activeColor: 'text-clay-500', activeBg: 'bg-clay-100' },
    { id: 'achievements', label: 'Lencana', icon: Award, activeColor: 'text-honey-500', activeBg: 'bg-honey-100' },
    { id: 'leaderboard', label: 'Ranking', icon: Users, activeColor: 'text-sage-600', activeBg: 'bg-sage-100' },
    { id: 'profile', label: 'Profil', icon: User, activeColor: 'text-mist-600', activeBg: 'bg-mist-100' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-cream-50/95 backdrop-blur-lg border-t border-sand-200 py-2 px-3 sm:px-6">
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
              className={`flex flex-col items-center justify-center py-1.5 px-3 sm:px-5 rounded-2xl transition-colors ${
                isActive ? item.activeBg : 'text-ink-500 hover:bg-cream-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? item.activeColor : 'text-ink-500'}`} />
              <span className={`text-[10px] sm:text-[11px] font-bold mt-1 ${isActive ? item.activeColor : 'text-ink-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

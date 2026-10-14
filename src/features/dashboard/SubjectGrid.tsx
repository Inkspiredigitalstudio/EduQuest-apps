import React from 'react';
import { Subject, Paper } from '../../types';
import { soundManager } from '../../lib/audio';
import { BookOpen, Heart, ShieldCheck, Compass, Lock, Star, ArrowRight } from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  BookOpen,
  Heart,
  ShieldCheck,
  Compass,
};

const getColorFamily = (colorClass: string): 'mist' | 'sage' | 'honey' | 'clay' => {
  if (colorClass.includes('sage')) return 'sage';
  if (colorClass.includes('honey')) return 'honey';
  if (colorClass.includes('clay')) return 'clay';
  return 'mist';
};

const CARD_TINT: Record<string, string> = {
  mist: 'bg-mist-100 hover:bg-mist-200/70 border-mist-200 hover:border-mist-300',
  sage: 'bg-sage-100 hover:bg-sage-200/70 border-sage-200 hover:border-sage-300',
  honey: 'bg-honey-100 hover:bg-honey-200/70 border-honey-200 hover:border-honey-300',
  clay: 'bg-clay-100 hover:bg-clay-200/70 border-clay-200 hover:border-clay-300',
};

const CARD_FOOTER_TEXT: Record<string, string> = {
  mist: 'text-mist-700 border-mist-200',
  sage: 'text-sage-600 border-sage-200',
  honey: 'text-honey-500 border-honey-200',
  clay: 'text-clay-500 border-clay-200',
};

interface SubjectGridProps {
  subjects: Subject[];
  papers?: Paper[];
  onSelect: (subject: Subject) => void;
  // 'list' = PKSK's centered list-button picker (less visually crowded for
  // Bahagian B's 7 subjects than a card grid) — SPPIM keeps the card grid
  // it's always had by leaving this unset.
  layout?: 'grid' | 'list';
}

export const SubjectGrid: React.FC<SubjectGridProps> = ({ subjects, papers, onSelect, layout = 'grid' }) => {
  if (layout === 'list') {
    return (
      <div className="flex flex-col gap-2.5 max-w-lg mx-auto pt-1">
        {subjects.map((sub) => {
          const isLocked = sub.status === 'locked';
          const paperCount = papers?.filter((p) => p.subject_id === sub.id).length || 0;

          return (
            <button
              key={sub.id}
              disabled={isLocked}
              onClick={() => {
                if (!isLocked) {
                  soundManager.playClick();
                  onSelect(sub);
                }
              }}
              className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border-2 font-bold transition-colors text-left ${
                isLocked
                  ? 'bg-cream-100 border-sand-200 opacity-60 cursor-not-allowed'
                  : 'bg-grape-100 hover:bg-grape-200/70 border-grape-200 hover:border-grape-300 cursor-pointer'
              }`}
            >
              <span className="text-base text-ink-900">{sub.name}</span>
              <span className="flex items-center gap-2 shrink-0">
                {isLocked ? (
                  <span className="text-[10px] font-bold uppercase bg-cream-200 text-ink-500 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Kunci
                  </span>
                ) : (
                  <>
                    <span className="text-[11px] text-grape-600 dark:text-grape-500 font-bold">
                      {paperCount > 0 ? `${paperCount} Kertas` : 'Belum ada kertas'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-grape-500" />
                  </>
                )}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
      {subjects.map((sub) => {
        const IconComponent = ICON_MAP[sub.icon] || BookOpen;
        const isLocked = sub.status === 'locked';
        const family = getColorFamily(sub.color);
        const paperCount = papers?.filter((p) => p.subject_id === sub.id).length || 0;

        return (
          <div
            key={sub.id}
            onClick={() => {
              if (!isLocked) {
                soundManager.playClick();
                onSelect(sub);
              }
            }}
            className={`rounded-3xl p-4 border-2 transition-colors ${
              isLocked
                ? 'bg-cream-100 border-sand-200 opacity-60 cursor-not-allowed'
                : `${CARD_TINT[family]} cursor-pointer`
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${sub.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                {isLocked ? (
                  <span className="text-[10px] font-bold uppercase bg-cream-200 text-ink-500 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Kunci
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase bg-cream-50 text-sage-600 px-2.5 py-1 rounded-full">
                    Sedia
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-display font-bold text-ink-900">{sub.name}</h3>
                <p className="text-xs text-ink-700 mt-1 line-clamp-2">{sub.description}</p>
              </div>

              {!isLocked && (
                <div className={`pt-2 flex items-center justify-between text-xs font-bold border-t ${CARD_FOOTER_TEXT[family]}`}>
                  <span className="flex items-center gap-1 pt-2">
                    <Star className="w-3.5 h-3.5 text-honey-400 fill-honey-400" />
                    <span>{paperCount > 0 ? `${paperCount} Kertas` : 'Belum ada kertas'}</span>
                  </span>
                  <span className="flex items-center gap-1 pt-2">
                    <span>Mula</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

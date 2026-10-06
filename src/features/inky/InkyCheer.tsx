import React from 'react';
import { InkyAvatar } from './InkyAvatar';

interface InkyCheerProps {
  animation: string;
  text: string;
  durationMs: number;
}

// Quick "betul!" reward: Inky pops up in the corner for ~2s after a correct
// answer. Fixed + pointer-events-none so it never covers or blocks the
// choices / Next button. The parent remounts it (key) for each new answer
// and unmounts it when the timer ends.
export const InkyCheer: React.FC<InkyCheerProps> = ({ animation, text, durationMs }) => (
  <div
    role="status"
    aria-live="polite"
    style={{ animationDuration: `${durationMs}ms` }}
    className="inky-cheer fixed z-40 right-3 bottom-24 sm:right-6 sm:bottom-8 flex flex-col items-end gap-1 pointer-events-none"
  >
    <span className="mr-2 px-3 py-1.5 rounded-2xl rounded-br-sm bg-sage-500 text-white text-sm font-display font-bold shadow-lg whitespace-nowrap">
      {text}
    </span>
    <InkyAvatar animation={animation} className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg" />
  </div>
);

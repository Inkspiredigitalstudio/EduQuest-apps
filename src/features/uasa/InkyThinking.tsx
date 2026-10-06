import React, { useEffect, useState } from 'react';
import { InkyAvatar } from '../inky/InkyAvatar';

const MESSAGES = ['Inky sedang berfikir…', 'Inky cari petunjuk terbaik…', 'Sikit lagi…', 'Hampir siap!'];

// Gentle, slow motion on purpose: enough to hold attention while waiting,
// not so busy it distracts. Stops under prefers-reduced-motion (index.css).
export const InkyThinking: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setMsgIndex((i) => Math.min(i + 1, MESSAGES.length - 1)), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="inky-pop flex items-center gap-3 p-3 pr-4 rounded-2xl bg-mist-100 border-2 border-mist-200"
    >
      <div className="relative w-14 h-14 shrink-0">
        <InkyAvatar idle className="w-14 h-14" />
        <span className="inky-bulb absolute -top-1 -right-1 text-lg" aria-hidden="true">
          💡
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p key={msgIndex} className="inky-pop text-sm font-bold text-ink-900">
          {MESSAGES[msgIndex]}
        </p>
        <div className="flex gap-1.5 mt-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inky-dot w-2 h-2 rounded-full bg-mist-400"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

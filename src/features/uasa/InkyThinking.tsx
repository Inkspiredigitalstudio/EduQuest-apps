import React, { useEffect, useState } from 'react';

const MESSAGES = ['Inky sedang berfikir…', 'Inky cari petunjuk terbaik…', 'Sikit lagi…', 'Hampir siap!'];

// Inky the octopus, drawn inline so it follows the theme colours (and dark
// mode) and needs no image request. Motion is kept gentle and slow on purpose:
// enough to hold attention while waiting, not so busy it distracts. Everything
// stops under prefers-reduced-motion (see index.css).
export const InkyMascot: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <g className="inky-bob">
      {[14, 23, 32, 41, 50].map((x, i) => (
        <path
          key={x}
          className="inky-tentacle"
          style={{ animationDelay: `${i * 0.15}s` }}
          d={`M${x} 36 q-3 8 0 14 q2 4 -1 8`}
          fill="none"
          stroke="var(--color-mist-400)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      ))}
      <ellipse cx="32" cy="26" rx="19" ry="17" fill="var(--color-mist-400)" />
      <ellipse cx="25" cy="18" rx="5" ry="3" fill="#fff" opacity="0.35" />
      <g className="inky-blink">
        <ellipse cx="25" cy="27" rx="4.2" ry="5" fill="#fff" />
        <ellipse cx="39" cy="27" rx="4.2" ry="5" fill="#fff" />
        <circle cx="26" cy="28" r="2.2" fill="#22303d" />
        <circle cx="40" cy="28" r="2.2" fill="#22303d" />
      </g>
      <circle cx="19.5" cy="33" r="2.6" fill="#EBB89E" opacity="0.85" />
      <circle cx="44.5" cy="33" r="2.6" fill="#EBB89E" opacity="0.85" />
      <path d="M28 34 q4 3.5 8 0" fill="none" stroke="#22303d" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  </svg>
);

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
        <InkyMascot className="w-14 h-14" />
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

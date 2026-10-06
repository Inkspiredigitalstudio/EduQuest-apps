import React from 'react';
import { INKY_CHARACTER } from './inkyCharacter';
import { INKY_ANIMATIONS } from './inkyAnimations';

interface InkyAvatarProps {
  // Shop item id (e.g. 'wave'); null/unknown shows Inky standing still.
  animation?: string | null;
  // Change this number to replay the same animation (e.g. on tap).
  playToken?: number;
  // Gentle idle bob instead of / between animations.
  idle?: boolean;
  className?: string;
}

// Inky's artwork + the animation controller. Plays the animation once each
// time `animation` or `playToken` changes (the key remounts the element so the
// CSS animation restarts). Respects prefers-reduced-motion via index.css.
export const InkyAvatar: React.FC<InkyAvatarProps> = ({ animation, playToken = 0, idle = false, className = 'w-24 h-24' }) => {
  const anim = animation ? INKY_ANIMATIONS[animation] : undefined;

  return (
    <div className={`relative select-none ${className}`}>
      <div key={`${animation ?? 'none'}-${playToken}`} className="absolute inset-0">
        <img
          src={INKY_CHARACTER.image}
          alt={INKY_CHARACTER.name}
          draggable={false}
          className={`w-full h-full object-contain ${anim ? anim.bodyClass : idle ? 'inky-bob' : ''}`}
        />
        {anim?.effects.map((fx, i) => (
          <span key={i} aria-hidden="true" className={`inky-fx ${fx.className}`}>
            {fx.emoji}
          </span>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { INKY_CHARACTER } from './inkyCharacter';
import { INKY_ANIMATIONS } from './inkyAnimations';
import { INKY_ACCESSORIES, useInkyWorn } from './inkyAccessories';

interface InkyAvatarProps {
  // Shop item id (e.g. 'wave'); null/unknown shows Inky standing still.
  animation?: string | null;
  // Change this number to replay the same animation (e.g. on tap).
  playToken?: number;
  // Gentle idle bob instead of / between animations.
  idle?: boolean;
  // Accessories to show; defaults to what the student is wearing.
  accessories?: string[];
  className?: string;
}

// Inky's artwork + accessories + the animation controller. Plays the
// animation once each time `animation` or `playToken` changes (the key
// remounts the element so the CSS animation restarts). Accessories sit inside
// the animated body so they move with Inky. Respects prefers-reduced-motion
// via index.css.
export const InkyAvatar: React.FC<InkyAvatarProps> = ({
  animation,
  playToken = 0,
  idle = false,
  accessories,
  className = 'w-24 h-24',
}) => {
  const worn = useInkyWorn();
  const items = (accessories ?? worn).map((id) => INKY_ACCESSORIES[id]).filter(Boolean);
  const aura = items.find((a) => a.slot === 'aura');
  const anim = animation ? INKY_ANIMATIONS[animation] : undefined;

  return (
    <div className={`inky-avatar relative select-none ${className}`}>
      {aura?.auraClass && <div aria-hidden="true" className={`inky-aura ${aura.auraClass}`} />}
      <div key={`${animation ?? 'none'}-${playToken}`} className="absolute inset-0">
        <div className={`absolute inset-0 ${anim ? anim.bodyClass : idle ? 'inky-bob' : ''}`}>
          <img
            src={INKY_CHARACTER.image}
            alt={INKY_CHARACTER.name}
            draggable={false}
            className="w-full h-full object-contain"
          />
          {items.map((a) => {
            if (a.slot === 'aura' || !a.emoji) return null;
            const at = INKY_CHARACTER.anchors[a.slot];
            return (
              <span
                key={a.slot}
                aria-hidden="true"
                className="inky-accessory"
                style={{ left: `${at.x}%`, top: `${at.y}%`, fontSize: `${at.size}cqw` }}
              >
                {a.emoji}
              </span>
            );
          })}
        </div>
        {anim?.effects.map((fx, i) => (
          <span key={i} aria-hidden="true" className={`inky-fx ${fx.className}`}>
            {fx.emoji}
          </span>
        ))}
      </div>
    </div>
  );
};

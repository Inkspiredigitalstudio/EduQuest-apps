// The one place that knows what Inky looks like. Every screen that shows Inky
// (shop, My Inky, result screens, the Petunjuk loader, the correct-answer
// cheer) renders <InkyAvatar>, which reads from here — nothing else imports
// the image directly.
//
// To swap in the final artwork, replace src/assets/characters/inky/inky.png
// with the new file (same name). It is imported through Vite, so the new file
// gets a new hashed URL and the PWA service worker can't keep serving the old
// one. Keep the new art roughly square, centred, on a transparent background:
// the animations in inkyAnimations.ts move the whole image and place their
// effects (👋, confetti…) relative to the box, not to body parts.
//
// The only art-specific numbers are the accessory anchors below: where on the
// image the top of the head, the eyes and the chest are. After replacing the
// PNG, nudge these (percent of the image box) until hats/glasses/medals sit
// right — no other file needs to change.
import inkyImage from '../../assets/characters/inky/inky.png';

export interface InkyAnchor {
  x: number; // % from left (centre of the accessory)
  y: number; // % from top
  size: number; // accessory size, % of the box width
}

export const INKY_CHARACTER = {
  name: 'Inky',
  image: inkyImage,
  anchors: {
    head: { x: 49, y: 3, size: 34 },
    face: { x: 52, y: 44, size: 36 },
    chest: { x: 51, y: 75, size: 20 },
  } satisfies Record<'head' | 'face' | 'chest', InkyAnchor>,
} as const;

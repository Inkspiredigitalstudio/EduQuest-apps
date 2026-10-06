// The one place that knows what Inky looks like. Every screen that shows Inky
// (shop, My Inky, result screens, the Petunjuk loader) renders <InkyAvatar>,
// which reads from here — nothing else imports the image directly.
//
// To swap in the final artwork, replace src/assets/characters/inky/inky.png
// with the new file (same name). It is imported through Vite, so the new file
// gets a new hashed URL and the PWA service worker can't keep serving the old
// one. Keep the new art roughly square, centred, on a transparent background:
// the animations in inkyAnimations.ts move the whole image and place their
// effects (👋, confetti…) relative to the box, not to body parts.
import inkyImage from '../../assets/characters/inky/inky.png';

export const INKY_CHARACTER = {
  name: 'Inky',
  image: inkyImage,
} as const;

// Animation registry, kept separate from the artwork: each entry only names
// CSS classes (keyframes live in index.css) that move whatever image
// INKY_CHARACTER points at, plus optional emoji effects drawn around it.
// Ids match inky_shop_items.id in Supabase; names and prices come from there.

export interface InkyEffect {
  emoji: string;
  className: string;
}

export interface InkyAnimation {
  bodyClass: string;
  durationMs: number;
  effects: InkyEffect[];
}

export const INKY_ANIMATIONS: Record<string, InkyAnimation> = {
  wave: {
    bodyClass: 'inky-anim-wave',
    durationMs: 1800,
    effects: [{ emoji: '👋', className: 'inky-fx-wave' }],
  },
  wink: {
    bodyClass: 'inky-anim-wink',
    durationMs: 1400,
    effects: [
      { emoji: '✨', className: 'inky-fx-wink' },
      { emoji: '😉', className: 'inky-fx-wink-bubble' },
    ],
  },
  happy_dance: {
    bodyClass: 'inky-anim-dance',
    durationMs: 2000,
    effects: [
      { emoji: '🎵', className: 'inky-fx-note inky-fx-note-1' },
      { emoji: '🎶', className: 'inky-fx-note inky-fx-note-2' },
    ],
  },
  celebration: {
    bodyClass: 'inky-anim-celebrate',
    durationMs: 1800,
    effects: [
      { emoji: '🎉', className: 'inky-fx-confetti inky-fx-c1' },
      { emoji: '⭐', className: 'inky-fx-confetti inky-fx-c2' },
      { emoji: '🎊', className: 'inky-fx-confetti inky-fx-c3' },
      { emoji: '✨', className: 'inky-fx-confetti inky-fx-c4' },
    ],
  },
  super_jump: {
    bodyClass: 'inky-anim-jump',
    durationMs: 1600,
    effects: [{ emoji: '💨', className: 'inky-fx-dust' }],
  },
};

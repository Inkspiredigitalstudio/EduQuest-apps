import { createContext, useContext } from 'react';

// Accessory registry, like inkyAnimations.ts: ids match inky_shop_items.id
// (kind = 'accessory'); names, prices and slots come from Supabase. Head /
// face / chest items are emoji placed on the anchors in inkyCharacter.ts;
// aura items are CSS backdrops behind Inky, independent of the artwork.

export type InkySlot = 'head' | 'face' | 'chest' | 'aura';

export interface InkyAccessory {
  slot: InkySlot;
  emoji?: string; // head/face/chest
  auraClass?: string; // aura
}

export const INKY_ACCESSORIES: Record<string, InkyAccessory> = {
  glasses: { slot: 'face', emoji: '👓' },
  sunglasses: { slot: 'face', emoji: '🕶️' },
  bow: { slot: 'chest', emoji: '🎀' },
  medal: { slot: 'chest', emoji: '🏅' },
  grad_cap: { slot: 'head', emoji: '🎓' },
  crown: { slot: 'head', emoji: '👑' },
  rainbow: { slot: 'aura', auraClass: 'inky-aura-rainbow' },
  star_aura: { slot: 'aura', auraClass: 'inky-aura-stars' },
};

// What the signed-in student's Inky is wearing; provided once in App so every
// <InkyAvatar> shows it without threading props through each screen.
export const InkyWornContext = createContext<string[]>([]);
export const useInkyWorn = () => useContext(InkyWornContext);

// Wearing `itemId` replaces whatever is already in its slot.
export function wearInSlot(worn: string[], itemId: string): string[] {
  const slot = INKY_ACCESSORIES[itemId]?.slot;
  return [...worn.filter((id) => id !== itemId && INKY_ACCESSORIES[id]?.slot !== slot), itemId];
}

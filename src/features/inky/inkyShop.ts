import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// Prices and the coin deduction live in Postgres (inky_shop_items +
// inky_purchase/inky_equip, security definer, keyed on auth.uid()), so the
// browser can't pick its own price or unlock without paying.

export interface InkyShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  kind: 'animation' | 'accessory';
  slot: 'head' | 'face' | 'chest' | 'aura' | null;
}

export interface InkyState {
  coin: number;
  owned: string[];
  equipped: string | null;
  accessories: string[];
}

const ERROR_MESSAGES: Record<string, string> = {
  insufficient_coins: 'Coin tak cukup',
  already_owned: 'Item ini sudah dibeli',
  not_owned: 'Beli item ini dahulu',
  item_not_found: 'Item ini tiada lagi di kedai',
  not_authenticated: 'Sesi tamat. Sila log keluar dan log masuk semula.',
  user_not_found: 'Akaun tidak dijumpai. Sila log masuk semula.',
};

export class InkyShopError extends Error {
  code: string;
  coin?: number;
  constructor(code: string, coin?: number) {
    super(ERROR_MESSAGES[code] || 'Tak dapat sambung. Cuba lagi.');
    this.code = code;
    this.coin = coin;
  }
}

function client() {
  if (!isSupabaseConfigured || !supabase) throw new InkyShopError('offline');
  return supabase;
}

async function callRpc(fn: string, args?: Record<string, unknown>): Promise<any> {
  const { data, error } = await client().rpc(fn, args);
  if (error) throw new InkyShopError('network');
  if (!data?.ok) throw new InkyShopError(data?.code || 'network', data?.coin);
  return data;
}

export async function fetchInkyShopItems(): Promise<InkyShopItem[]> {
  const { data, error } = await client()
    .from('inky_shop_items')
    .select('id, name, emoji, price, kind, slot')
    .eq('active', true)
    .order('sort_order');
  if (error) throw new InkyShopError('network');
  return data || [];
}

export async function fetchInkyState(): Promise<InkyState> {
  const data = await callRpc('inky_state');
  return { coin: data.coin, owned: data.owned || [], equipped: data.equipped ?? null, accessories: data.accessories || [] };
}

export async function purchaseInkyItem(itemId: string): Promise<{ coin: number }> {
  const data = await callRpc('inky_purchase', { p_item: itemId });
  return { coin: data.coin };
}

export async function equipInkyItem(itemId: string | null): Promise<void> {
  await callRpc('inky_equip', { p_item: itemId });
}

// Put an accessory on (replacing whatever is in its slot) or take it off.
// Returns everything Inky is wearing afterwards.
export async function wearInkyAccessory(itemId: string, on: boolean): Promise<string[]> {
  const data = await callRpc('inky_wear', { p_item: itemId, p_on: on });
  return data.accessories || [];
}

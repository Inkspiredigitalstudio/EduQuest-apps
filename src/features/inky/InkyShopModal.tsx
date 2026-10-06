import React, { useEffect, useState } from 'react';
import { X, Coins, Check, ShoppingBag, Star } from 'lucide-react';
import { soundManager } from '../../lib/audio';
import { InkyAvatar } from './InkyAvatar';
import {
  InkyShopItem,
  InkyState,
  InkyShopError,
  fetchInkyShopItems,
  fetchInkyState,
  purchaseInkyItem,
  equipInkyItem,
} from './inkyShop';

type Tab = 'shop' | 'mine';

const fmt = (n: number) => n.toLocaleString('en-US');

interface InkyShopModalProps {
  isOpen: boolean;
  initialTab?: Tab;
  onClose: () => void;
  // Server is the source of truth for coins; keep the header/profile in step.
  onCoinChange: (coin: number) => void;
  onEquippedChange: (itemId: string | null) => void;
}

export const InkyShopModal: React.FC<InkyShopModalProps> = ({ isOpen, initialTab = 'shop', onClose, onCoinChange, onEquippedChange }) => {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [items, setItems] = useState<InkyShopItem[]>([]);
  const [state, setState] = useState<InkyState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; tone: 'good' | 'bad' } | null>(null);
  // Which animation the big Inky is showing, and a counter to replay it.
  const [preview, setPreview] = useState<string | null>(null);
  const [playToken, setPlayToken] = useState(0);

  const play = (id: string | null) => {
    setPreview(id);
    setPlayToken((t) => t + 1);
  };

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [shopItems, inkyState] = await Promise.all([fetchInkyShopItems(), fetchInkyState()]);
      setItems(shopItems);
      setState(inkyState);
      onCoinChange(inkyState.coin);
      onEquippedChange(inkyState.equipped);
      play(inkyState.equipped);
    } catch (e) {
      setLoadError(e instanceof InkyShopError ? e.message : 'Tak dapat sambung. Cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setTab(initialTab);
    setMessage(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const owned = new Set(state?.owned || []);
  const coin = state?.coin ?? 0;
  const itemById = (id: string | null) => items.find((i) => i.id === id);

  const handleBuy = async (item: InkyShopItem) => {
    if (!state || busyId) return;
    setBusyId(item.id);
    setMessage(null);
    try {
      const { coin: newCoin } = await purchaseInkyItem(item.id);
      setState({ ...state, coin: newCoin, owned: [...state.owned, item.id] });
      onCoinChange(newCoin);
      soundManager.playLevelUp();
      play(item.id);
      setMessage({ text: `${item.emoji} ${item.name} dibuka! Pergi ke My Inky untuk Equip.`, tone: 'good' });
    } catch (e) {
      const err = e instanceof InkyShopError ? e : new InkyShopError('network');
      if (err.code === 'already_owned') setState({ ...state, owned: [...new Set([...state.owned, item.id])] });
      if (typeof err.coin === 'number') {
        setState((s) => (s ? { ...s, coin: err.coin as number } : s));
        onCoinChange(err.coin);
      }
      soundManager.playIncorrect();
      setMessage({ text: err.message, tone: 'bad' });
    } finally {
      setBusyId(null);
    }
  };

  const handleEquip = async (itemId: string) => {
    if (!state || busyId) return;
    setBusyId(itemId);
    setMessage(null);
    try {
      await equipInkyItem(itemId);
      setState({ ...state, equipped: itemId });
      onEquippedChange(itemId);
      soundManager.playCoin();
      play(itemId);
    } catch (e) {
      soundManager.playIncorrect();
      setMessage({ text: e instanceof InkyShopError ? e.message : 'Tak dapat sambung. Cuba lagi.', tone: 'bad' });
    } finally {
      setBusyId(null);
    }
  };

  const equippedItem = itemById(state?.equipped ?? null);
  const previewItem = itemById(preview);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-cream-50 border border-sand-200 rounded-3xl shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-sand-200 shrink-0">
          <h2 className="text-lg font-display font-bold text-ink-900">{tab === 'shop' ? 'Inky Shop' : 'My Inky'}</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-honey-100 text-honey-500 px-3 py-1 rounded-xl font-bold text-sm">
              <Coins className="w-4 h-4" />
              <span>{state ? fmt(coin) : '…'}</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="p-2 rounded-xl text-ink-500 hover:text-ink-900 bg-cream-100 hover:bg-cream-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 bg-cream-100 border-b border-sand-200 shrink-0">
          {([
            { id: 'shop', label: 'Inky Shop', icon: ShoppingBag },
            { id: 'mine', label: 'My Inky', icon: Star },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                soundManager.playClick();
                setTab(id);
                setMessage(null);
                play(id === 'mine' ? state?.equipped ?? null : null);
              }}
              className={`py-3 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                tab === id ? 'bg-cream-50 text-mist-600 border-b-2 border-mist-500' : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Inky stage — tap to replay */}
          <button
            onClick={() => play(preview)}
            className="w-full flex flex-col items-center gap-1 pt-12"
            aria-label="Main semula animasi"
          >
            <InkyAvatar animation={preview} playToken={playToken} idle className="w-32 h-32 sm:w-36 sm:h-36" />
            {tab === 'mine' && (
              <span className="text-xs text-ink-500">
                Animasi semasa:{' '}
                <span className="font-bold text-ink-900">
                  {equippedItem ? `${equippedItem.emoji} ${equippedItem.name}` : 'Belum dipilih'}
                </span>
              </span>
            )}
            {tab === 'shop' && previewItem && (
              <span className="text-xs text-ink-500">
                Pratonton: <span className="font-bold text-ink-900">{previewItem.emoji} {previewItem.name}</span>
              </span>
            )}
          </button>

          {message && (
            <p
              role="status"
              className={`inky-pop text-sm font-bold text-center px-3 py-2 rounded-xl ${
                message.tone === 'good' ? 'bg-sage-100 text-sage-600' : 'bg-clay-100 text-clay-500'
              }`}
            >
              {message.text}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-ink-500 text-center py-6">Memuatkan…</p>
          ) : loadError ? (
            <div className="text-center space-y-3 py-4">
              <p className="text-sm font-bold text-clay-500">{loadError}</p>
              <button onClick={load} className="px-4 py-2 rounded-xl bg-mist-500 hover:bg-mist-600 text-white text-sm font-bold">
                Cuba Lagi
              </button>
            </div>
          ) : tab === 'shop' ? (
            <ul className="space-y-2.5">
              {items.map((item) => {
                const isOwned = owned.has(item.id);
                const canAfford = coin >= item.price;
                return (
                  <li
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border ${
                      isOwned ? 'bg-sage-100/60 border-sage-200' : 'bg-cream-100 border-sand-200'
                    }`}
                  >
                    <button
                      onClick={() => play(item.id)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      aria-label={`Pratonton ${item.name}`}
                    >
                      <span className="text-2xl w-10 h-10 shrink-0 rounded-xl bg-cream-50 flex items-center justify-center" aria-hidden="true">
                        {item.emoji}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-ink-900 truncate">{item.name}</span>
                        <span className="flex items-center gap-1 text-xs font-bold text-honey-500">
                          <Coins className="w-3.5 h-3.5" />
                          {fmt(item.price)} Coins
                        </span>
                      </span>
                    </button>
                    {isOwned ? (
                      <span className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl bg-sage-100 text-sage-600 text-xs font-bold">
                        <Check className="w-4 h-4" />
                        Unlocked
                      </span>
                    ) : (
                      <div className="shrink-0 flex flex-col items-end gap-0.5">
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={!canAfford || busyId !== null}
                          className="px-4 py-2 rounded-xl text-xs font-bold transition-colors bg-mist-500 hover:bg-mist-600 text-white disabled:bg-sand-200 disabled:text-ink-500 disabled:cursor-not-allowed"
                        >
                          {busyId === item.id ? '…' : 'Unlock'}
                        </button>
                        {!canAfford && (
                          <span className="text-[10px] font-bold text-clay-500 whitespace-nowrap">
                            Kurang {fmt(item.price - coin)} Coin
                          </span>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {items.map((item) => {
                  const isOwned = owned.has(item.id);
                  const isEquipped = state?.equipped === item.id;
                  const isSelected = preview === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => (isOwned ? play(item.id) : (setTab('shop'), play(item.id)))}
                      className={`relative flex flex-col items-center gap-1 p-2.5 rounded-2xl border-2 text-center transition-colors ${
                        isSelected ? 'border-mist-500 bg-mist-100' : 'border-sand-200 bg-cream-100'
                      } ${isOwned ? '' : 'opacity-60'}`}
                    >
                      <span className="text-2xl" aria-hidden="true">{isOwned ? item.emoji : '🔒'}</span>
                      <span className="text-[11px] font-bold text-ink-900 leading-tight">{item.name}</span>
                      {isEquipped && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-sage-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {previewItem && owned.has(previewItem.id) && (
                state?.equipped === previewItem.id ? (
                  <p className="w-full py-3 rounded-2xl bg-sage-100 text-sage-600 text-sm font-bold flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Equipped
                  </p>
                ) : (
                  <button
                    onClick={() => handleEquip(previewItem.id)}
                    disabled={busyId !== null}
                    className="w-full py-3 rounded-2xl bg-mist-500 hover:bg-mist-600 text-white text-sm font-bold disabled:opacity-60"
                  >
                    {busyId === previewItem.id ? '…' : `Equip ${previewItem.emoji} ${previewItem.name}`}
                  </button>
                )
              )}

              {owned.size === 0 && (
                <p className="text-sm text-ink-500 text-center">
                  Belum ada animasi. Kumpul Coin dan buka animasi di{' '}
                  <button onClick={() => setTab('shop')} className="font-bold text-mist-600 underline">
                    Inky Shop
                  </button>
                  .
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

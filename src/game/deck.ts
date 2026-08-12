import {
  Card,
  DECK_SIZE,
  RANK_LABELS,
  RANKS,
  Rank,
  SUIT_LABELS,
  SUITS,
  Suit,
} from './types';

export function createCard(suit: Suit, rank: Rank): Card {
  return {
    id: `${suit}-${rank}`,
    suit,
    rank,
  };
}

/** 20 lapos magyar pakli: nincs 7, 8, 9 — csak alsó, felső, király, tízes, ász. */
export function createHungarianDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(suit, rank));
    }
  }
  return deck;
}

export function cardLabel(card: Card): string {
  return `${SUIT_LABELS[card.suit]} ${RANK_LABELS[card.rank]}`;
}

export type Rng = () => number;

/** Determinisztikus keverés tesztekhez (Fisher–Yates). */
export function shuffle<T>(items: T[], rng: Rng = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Egyszerű seedelt RNG, hogy a tesztek ismételhetők legyenek. */
export function createSeededRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function assertDeckIsValid(deck: Card[]): void {
  if (deck.length !== DECK_SIZE) {
    throw new Error(`A paklinak ${DECK_SIZE} laposnak kell lennie, kapott: ${deck.length}`);
  }
  const ids = new Set(deck.map((c) => c.id));
  if (ids.size !== DECK_SIZE) {
    throw new Error('A pakliban ismétlődő lapok vannak');
  }
}

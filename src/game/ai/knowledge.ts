import { CARD_POINTS, Card, GameState, RANK_STRENGTH, Rank, SUITS, Suit } from '../types';
import { isClosedPhase } from '../engine';

export type CardKnowledge = {
  /** A pakliból már biztosan kiesett lapok (ütések után). */
  definitelyPlayed: Card[];
  /** A gép kezében kívül még nem kiesett lapok (ellenfél keze + kiesett). */
  opponentPool: Card[];
  /** Ha igaz, az ellenfél kezének pontos tartalma ismert (végjáték). */
  opponentHandKnown: boolean;
  /** Szín/rang szerint hány magas lap még lehet az ellenfélnél. */
  remainingHighBySuit: Record<Suit, number>;
};

function cardsInPlay(state: GameState): Set<string> {
  const ids = new Set<string>();
  for (const card of state.computerHand) ids.add(card.id);
  for (const card of state.stock) ids.add(card.id);
  if (state.trumpCard) ids.add(state.trumpCard.id);
  for (const play of state.currentTrick) ids.add(play.card.id);
  return ids;
}

/** Lapok, amelyek nincsenek a gép kezében és nem a talonban/asztalon. */
export function getOpponentPool(state: GameState): Card[] {
  const inPlay = cardsInPlay(state);
  return state.deck.filter((card) => !inPlay.has(card.id));
}

/**
 * A kiesett lapok száma = pool mérete − ellenfél ismert lapjainak száma.
 * A konkrét kiesett lapokat a végjátékban vagy memória-pontossággal becsüljük.
 */
export function buildCardKnowledge(
  state: GameState,
  memoryAccuracy: number,
): CardKnowledge {
  const opponentPool = getOpponentPool(state);
  const opponentHandKnown =
    isClosedPhase(state) && opponentPool.length === state.userHand.length;

  const definitelyPlayed = opponentHandKnown
    ? []
    : opponentPool.slice(0, Math.max(0, opponentPool.length - state.userHand.length));

  const effectivePlayedCount = Math.round(
    definitelyPlayed.length * memoryAccuracy +
      (opponentPool.length - state.userHand.length) * (1 - memoryAccuracy),
  );
  const playedEstimate = definitelyPlayed.slice(
    0,
    Math.min(definitelyPlayed.length, effectivePlayedCount),
  );

  const remainingHighBySuit = SUITS.reduce(
    (acc, suit) => {
      acc[suit] = countRemainingHighCards(state, suit, playedEstimate, memoryAccuracy);
      return acc;
    },
    {} as Record<Suit, number>,
  );

  return {
    definitelyPlayed: playedEstimate,
    opponentPool,
    opponentHandKnown,
    remainingHighBySuit,
  };
}

function countRemainingHighCards(
  state: GameState,
  suit: Suit,
  playedEstimate: Card[],
  memoryAccuracy: number,
): number {
  const highRanks: Rank[] = ['tizes', 'asz', 'kiraly'];
  const playedIds = new Set(playedEstimate.map((c) => c.id));
  const inComputer = new Set(
    state.computerHand.filter((c) => c.suit === suit).map((c) => c.id),
  );
  const inTalon = new Set(
    [...state.stock, ...(state.trumpCard ? [state.trumpCard] : [])]
      .filter((c) => c.suit === suit)
      .map((c) => c.id),
  );
  const inTrick = new Set(
    state.currentTrick.filter((p) => p.card.suit === suit).map((p) => p.card.id),
  );

  let count = 0;
  for (const rank of highRanks) {
    const id = `${suit}-${rank}`;
    if (
      !playedIds.has(id) &&
      !inComputer.has(id) &&
      !inTalon.has(id) &&
      !inTrick.has(id)
    ) {
      count += memoryAccuracy >= 0.5 ? 1 : 0.6;
    }
  }
  return count;
}

export function estimateOpponentHasHigher(
  state: GameState,
  card: Card,
  knowledge: CardKnowledge,
): number {
  if (state.currentTrick.length === 0) {
    return estimateBeatProbabilityWhenLeading(state, card, knowledge);
  }

  const lead = state.currentTrick[0].card;
  const trumpSuit = state.trumpSuit!;

  if (card.suit === trumpSuit && lead.suit !== trumpSuit) {
    return 0.05 * (1 - knowledge.opponentInference);
  }
  if (lead.suit === trumpSuit && card.suit !== trumpSuit) {
    return 0.95;
  }
  if (card.suit !== lead.suit && card.suit !== trumpSuit) {
    return 0.95;
  }

  const relevantSuit = card.suit === trumpSuit ? trumpSuit : lead.suit;
  const strongerRanks = Object.entries(RANK_STRENGTH).filter(
    ([, strength]) => strength > RANK_STRENGTH[card.rank],
  );

  let prob = 0;
  for (const [rank] of strongerRanks) {
    const id = `${relevantSuit}-${rank}`;
    if (knowledge.opponentHandKnown) {
      if (state.userHand.some((c) => c.id === id)) {
        return 1;
      }
      continue;
    }
    const inPool = knowledge.opponentPool.some((c) => c.id === id);
    if (inPool) {
      prob += 0.25 * knowledge.opponentInference;
    }
  }
  return Math.min(1, prob);
}

function estimateBeatProbabilityWhenLeading(
  state: GameState,
  card: Card,
  knowledge: CardKnowledge,
): number {
  const trumpSuit = state.trumpSuit!;
  const highInSuit = knowledge.remainingHighBySuit[card.suit] ?? 0;
  const trumpThreat =
    card.suit === trumpSuit ? 0.15 : knowledge.remainingHighBySuit[trumpSuit] ?? 0;

  const base =
    card.rank === 'asz' || card.rank === 'tizes'
      ? 0.15
      : card.rank === 'kiraly'
        ? 0.35
        : 0.55;

  const inferenceFactor = 1 - knowledge.opponentInference * 0.5;
  return Math.min(
    0.95,
    base + highInSuit * 0.12 * knowledge.opponentInference + trumpThreat * 0.08,
  ) * inferenceFactor + (1 - inferenceFactor) * 0.45;
}

export function trickPointValue(state: GameState, card: Card): number {
  const leadPoints =
    state.currentTrick.length > 0
      ? CARD_POINTS[state.currentTrick[0].card.rank]
      : 0;
  return leadPoints + CARD_POINTS[card.rank];
}

export function cardResourceValue(card: Card, trumpSuit: Suit | null): number {
  const points = CARD_POINTS[card.rank];
  const strength = RANK_STRENGTH[card.rank];
  const trumpBonus = card.suit === trumpSuit ? 4 : 0;
  return points + strength + trumpBonus;
}

import { Card, GameState } from './types';
import {
  canDeclareMarriageWithCard,
  canExchangeTrump,
  exchangeTrump,
  getLegalCards,
  getMarriageSuits,
  marriagePointsForSuit,
  playCard,
} from './engine';

/**
 * Egyszerű AI: aducsere → párbemondás → egyéb legális lap.
 */
export function chooseComputerCard(state: GameState): Card {
  const legal = getLegalCards(state, 'computer');
  if (legal.length === 0) {
    throw new Error('A gépnek nincs kijátszható lapja');
  }
  return legal[0];
}

function chooseMarriageLead(state: GameState): Card | null {
  if (state.currentTrick.length !== 0 || !state.trumpSuit) {
    return null;
  }

  const suits = getMarriageSuits(state.computerHand);
  if (suits.length === 0) {
    return null;
  }

  const preferred =
    suits.find((s) => s === state.trumpSuit) ??
    suits.sort(
      (a, b) =>
        marriagePointsForSuit(b, state.trumpSuit!) -
        marriagePointsForSuit(a, state.trumpSuit!),
    )[0];

  const lead =
    state.computerHand.find((c) => c.suit === preferred && c.rank === 'kiraly') ??
    state.computerHand.find((c) => c.suit === preferred && c.rank === 'felso');

  return lead ?? null;
}

export function playComputerTurn(state: GameState): GameState {
  // Először aducsere (külön lépés, üzenettel) — a UI újra meghívja a kört.
  if (canExchangeTrump(state, 'computer')) {
    return exchangeTrump(state, 'computer');
  }

  const marriageLead = chooseMarriageLead(state);
  if (marriageLead && canDeclareMarriageWithCard(state, 'computer', marriageLead.id)) {
    return playCard(state, 'computer', marriageLead.id, { declareMarriage: true });
  }

  const card = chooseComputerCard(state);
  return playCard(state, 'computer', card.id);
}

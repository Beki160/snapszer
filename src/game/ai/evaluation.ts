import { CARD_POINTS, Card, GameState, WIN_POINTS } from '../types';
import {
  canDeclareMarriageWithCard,
  decideTrickWinner,
  getLegalCards,
  getMarriageSuits,
  isClosedPhase,
  marriagePointsForSuit,
} from '../engine';
import { Rng } from '../deck';
import { DifficultyConfig } from './difficulty';
import {
  buildCardKnowledge,
  cardResourceValue,
  estimateOpponentHasHigher,
  trickPointValue,
} from './knowledge';

export type ScoredMove = {
  card: Card;
  score: number;
};

function marriageLeadValue(state: GameState, card: Card): number {
  if (!state.trumpSuit) return 0;
  if (card.rank !== 'felso' && card.rank !== 'kiraly') return 0;
  if (!getMarriageSuits(state.computerHand).includes(card.suit)) return 0;
  return marriagePointsForSuit(card.suit, state.trumpSuit);
}

function handQualityAfterPlay(state: GameState, card: Card): number {
  const remaining = state.computerHand.filter((c) => c.id !== card.id);
  let quality = 0;
  for (const c of remaining) {
    quality += cardResourceValue(c, state.trumpSuit) * 0.15;
  }
  for (const suit of getMarriageSuits(remaining)) {
    quality += marriagePointsForSuit(suit, state.trumpSuit!) * 0.08;
  }
  return quality;
}

function scoreContextModifier(state: GameState, config: DifficultyConfig): number {
  if (config.scoreContextWeight <= 0) return 0;

  const diff = state.computerPoints - state.userPoints;
  const nearWin = state.computerPoints >= WIN_POINTS - 15;
  const nearLoss = state.userPoints >= WIN_POINTS - 15;

  if (diff > 20) return -8 * config.scoreContextWeight;
  if (diff > 0) return -4 * config.scoreContextWeight;
  if (diff < -20) return 10 * config.scoreContextWeight;
  if (diff < 0) return 5 * config.scoreContextWeight;
  if (nearWin) return -6 * config.scoreContextWeight;
  if (nearLoss) return 8 * config.scoreContextWeight;
  return 0;
}

function trumpExchangeValue(state: GameState, config: DifficultyConfig): number {
  if (!state.trumpCard || !state.trumpSuit) return -100;
  const faceUpValue = cardResourceValue(state.trumpCard, state.trumpSuit);
  const alsoValue = cardResourceValue(
    { id: `${state.trumpSuit}-also`, suit: state.trumpSuit, rank: 'also' },
    state.trumpSuit,
  );
  return (faceUpValue - alsoValue) * 1.2 + 6 * config.scoreContextWeight;
}

export function shouldExchangeTrump(
  state: GameState,
  config: DifficultyConfig,
  rng: Rng = Math.random,
): boolean {
  if (config.alwaysExchangeTrump) return true;
  const value = trumpExchangeValue(state, config);
  if (value <= 0) return rng() > 0.88;
  if (value > 8) return rng() > 0.35;
  if (value > 2) return rng() > 0.55;
  return rng() > 0.92;
}

export function shouldDeclareMarriage(
  config: DifficultyConfig,
  rng: Rng = Math.random,
): boolean {
  return rng() < config.marriageDeclareRate;
}

export function chooseMarriageLead(state: GameState): Card | null {
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

export function evaluateCardPlay(
  state: GameState,
  card: Card,
  config: DifficultyConfig,
): number {
  const knowledge = buildCardKnowledge(state, config.memoryAccuracy);
  const trumpSuit = state.trumpSuit!;
  const trickPoints = trickPointValue(state, card);
  const resourceCost = cardResourceValue(card, trumpSuit);
  const loseProb = estimateOpponentHasHigher(state, card, knowledge);
  const winProb = 1 - loseProb;

  let score = 0;

  if (state.currentTrick.length === 0) {
    const marriageBonus = marriageLeadValue(state, card);
    if (
      marriageBonus > 0 &&
      canDeclareMarriageWithCard(state, 'computer', card.id)
    ) {
      return marriageBonus * 3 + handQualityAfterPlay(state, card);
    }

    score += trickPoints * winProb * 0.35;
    score -= resourceCost * loseProb * 0.25;
    score += (winProb > 0.65 ? 4 : 0) - (loseProb > 0.6 ? resourceCost * 0.15 : 0);
    if (config.easyWastefulness > 0) {
      score += resourceCost * config.easyWastefulness * 0.15 * loseProb;
    }
  } else {
    const lead = state.currentTrick[0];
    const wouldWin =
      decideTrickWinner(lead, { player: 'computer', card }, trumpSuit) === 'computer';

    if (wouldWin) {
      score += trickPoints * 1.4;
      score -= Math.max(0, resourceCost - trickPoints * 0.35) * 0.5;
      if (trickPoints <= 5 && resourceCost >= 12) {
        score -= 10 * config.memoryAccuracy;
      }
      if (config.easyWastefulness > 0 && trickPoints <= 8) {
        score += resourceCost * config.easyWastefulness * 0.45;
      }
    } else {
      score -= resourceCost * 0.08;
      score += (15 - resourceCost) * 0.35;
      if (card.suit !== lead.card.suit && card.suit !== trumpSuit) {
        score += 2;
      }
      if (config.easyWastefulness > 0) {
        score += resourceCost * config.easyWastefulness * 0.2;
      }
    }
  }

  score += handQualityAfterPlay(state, card);
  score += scoreContextModifier(state, config);

  if (isClosedPhase(state)) {
    const cardsLeft = state.computerHand.length + state.userHand.length;
    if (cardsLeft <= 4) {
      score *= 1 + config.memoryAccuracy * 0.25;
    }
  }

  if (card.suit === trumpSuit && trickPoints < 8 && state.currentTrick.length > 0) {
    score -= 6 * config.memoryAccuracy;
  }

  return score;
}

export function scoreLegalMoves(
  state: GameState,
  config: DifficultyConfig,
): ScoredMove[] {
  const legal = getLegalCards(state, 'computer');
  return legal.map((card) => ({
    card,
    score: evaluateCardPlay(state, card, config),
  }));
}

export { trumpExchangeValue };

import { Rng } from '../deck';
import { CARD_POINTS, Card, GameState, WIN_POINTS } from '../types';
import {
  beginNextRound,
  decideTrickWinner,
  getLegalCards,
  getMarriageSuits,
  isClosedPhase,
  marriagePointsForSuit,
  playCard,
} from '../engine';
import { DifficultyConfig } from './difficulty';
import { cardResourceValue } from './knowledge';
import { evaluateCardPlay, ScoredMove } from './evaluation';

function trickPointsFromPlays(plays: { card: Card }[]): number {
  return plays.reduce((sum, play) => sum + CARD_POINTS[play.card.rank], 0);
}

function wouldWinTrick(state: GameState, card: Card): boolean {
  if (state.currentTrick.length === 0 || !state.trumpSuit) return false;
  return (
    decideTrickWinner(
      state.currentTrick[0],
      { player: 'computer', card },
      state.trumpSuit,
    ) === 'computer'
  );
}

function evaluatePosition(state: GameState, config: DifficultyConfig): number {
  const pointDiff = state.computerPoints - state.userPoints;
  let handValue = 0;

  for (const card of state.computerHand) {
    handValue += cardResourceValue(card, state.trumpSuit);
  }
  if (state.trumpSuit) {
    for (const suit of getMarriageSuits(state.computerHand)) {
      handValue += marriagePointsForSuit(suit, state.trumpSuit) * 0.35;
    }
  }

  let score = pointDiff * 2.2 + handValue * 0.25;

  if (state.computerPoints >= WIN_POINTS - 5) score += 12 * config.scoreContextWeight;
  if (state.userPoints >= WIN_POINTS - 5) score -= 10 * config.scoreContextWeight;
  if (state.computerPoints - state.userPoints > 15) {
    score += 6 * config.scoreContextWeight;
  }
  if (state.userPoints - state.computerPoints > 15) {
    score -= 8 * config.scoreContextWeight;
  }

  return score;
}

function continueSearchState(state: GameState): GameState | null {
  if (state.phase === 'playing') return state;
  if (state.phase === 'awaitingContinue' && isClosedPhase(state)) {
    return beginNextRound(state);
  }
  return null;
}

function expectimaxAfterPlay(
  state: GameState,
  depth: number,
  config: DifficultyConfig,
): number {
  if (state.phase === 'awaitingContinue' && isClosedPhase(state)) {
    const next = beginNextRound(state);
    return searchPosition(next, depth, config);
  }

  if (state.phase !== 'playing') {
    return evaluatePosition(state, config);
  }

  return searchPosition(state, depth, config);
}

function searchPosition(
  state: GameState,
  depth: number,
  config: DifficultyConfig,
): number {
  const searchable = continueSearchState(state);
  if (!searchable || searchable.phase !== 'playing' || depth <= 0) {
    return evaluatePosition(state, config);
  }

  const player = searchable.currentPlayer;
  const legal = getLegalCards(searchable, player);
  if (legal.length === 0) {
    return evaluatePosition(searchable, config);
  }

  if (player === 'computer') {
    let best = -Infinity;
    for (const card of legal) {
      const next = playCard(searchable, 'computer', card.id);
      best = Math.max(best, expectimaxAfterPlay(next, depth - 1, config));
    }
    return best;
  }

  let sum = 0;
  for (const card of legal) {
    const next = playCard(searchable, 'user', card.id);
    sum += expectimaxAfterPlay(next, depth - 1, config);
  }
  return sum / legal.length;
}

function opponentResponseScore(
  state: GameState,
  computerCard: Card,
  config: DifficultyConfig,
): number {
  const afterLead = playCard(state, 'computer', computerCard.id);

  if (afterLead.phase !== 'playing' || afterLead.currentPlayer !== 'user') {
    if (afterLead.currentTrick.length === 2 && afterLead.trumpSuit) {
      const winner = decideTrickWinner(
        afterLead.currentTrick[0],
        afterLead.currentTrick[1],
        afterLead.trumpSuit,
      );
      const points = trickPointsFromPlays(afterLead.currentTrick);
      return winner === 'computer' ? points : -points * 0.35;
    }
    return 0;
  }

  const userLegal = getLegalCards(afterLead, 'user');
  if (userLegal.length === 0) return 0;

  let worstForComputer = Infinity;
  let expected = 0;

  for (const userCard of userLegal) {
    const afterBoth = playCard(afterLead, 'user', userCard.id);
    let trickOutcome = 0;

    if (afterBoth.currentTrick.length === 2 && afterBoth.trumpSuit) {
      const winner = decideTrickWinner(
        afterBoth.currentTrick[0],
        afterBoth.currentTrick[1],
        afterBoth.trumpSuit,
      );
      const points = trickPointsFromPlays(afterBoth.currentTrick);
      trickOutcome = winner === 'computer' ? points : -points * 0.35;
    }

    expected += trickOutcome;
    worstForComputer = Math.min(worstForComputer, trickOutcome);
  }

  expected /= userLegal.length;
  const pessimistic =
    config.scoreContextWeight * worstForComputer +
    (1 - config.scoreContextWeight) * expected;

  return pessimistic * 0.5;
}

export function getSearchDepth(state: GameState, config: DifficultyConfig): number {
  if (config.searchDepth <= 0 && !config.useRecursiveSearch) {
    return 0;
  }

  const trickPoints =
    state.currentTrick.length > 0 ? trickPointsFromPlays(state.currentTrick) : 0;
  const cardsLeft = state.computerHand.length + state.userHand.length;

  let depth = config.searchDepth;

  if (config.useRecursiveSearch) {
    if (isClosedPhase(state)) depth += 1;
    if (cardsLeft <= 6) depth += 2;
    if (cardsLeft <= 4) depth += 1;
    if (trickPoints >= 10) depth += 1;
    if (trickPoints >= 18) depth += 1;
  } else if (trickPoints >= 10) {
    depth += 1;
  }

  return Math.min(depth, config.maxSearchDepth);
}

function scoreWithRecursiveSearch(
  state: GameState,
  moves: ScoredMove[],
  config: DifficultyConfig,
): ScoredMove[] {
  const depth = getSearchDepth(state, config);
  if (depth <= 0) return moves;

  return moves.map((move) => {
    const after = playCard(state, 'computer', move.card.id);
    const recursiveScore = searchPosition(after, depth - 1, config);
    return {
      card: move.card,
      score: move.score * 0.35 + recursiveScore * 0.65,
    };
  });
}

function scoreWithShallowSearch(
  state: GameState,
  moves: ScoredMove[],
  config: DifficultyConfig,
): ScoredMove[] {
  const depth = getSearchDepth(state, config);
  if (depth <= 0) return moves;

  const weight = depth / Math.max(config.maxSearchDepth, 1);
  return moves.map((move) => ({
    card: move.card,
    score: move.score + opponentResponseScore(state, move.card, config) * weight,
  }));
}

export function scoreMovesWithSearch(
  state: GameState,
  moves: ScoredMove[],
  config: DifficultyConfig,
): ScoredMove[] {
  if (config.useRecursiveSearch) {
    return scoreWithRecursiveSearch(state, moves, config);
  }
  return scoreWithShallowSearch(state, moves, config);
}

function pickEasyMove(
  state: GameState,
  scored: ScoredMove[],
  config: DifficultyConfig,
  rng: Rng,
): Card {
  if (state.currentTrick.length > 0 && rng() < 0.38) {
    const winning = scored.filter((move) => wouldWinTrick(state, move.card));
    if (winning.length > 1) {
      winning.sort(
        (a, b) =>
          cardResourceValue(b.card, state.trumpSuit) -
          cardResourceValue(a.card, state.trumpSuit),
      );
      return winning[0].card;
    }
  }

  return pickMove(scored, config, rng);
}

export function pickMove(
  scored: ScoredMove[],
  config: DifficultyConfig,
  rng: Rng = Math.random,
): Card {
  if (scored.length === 0) {
    throw new Error('Nincs értékelhető lépés');
  }

  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const best = sorted[0];

  if (sorted.length === 1 || rng() >= config.mistakeRate) {
    return best.card;
  }

  const worst = sorted[sorted.length - 1].score;
  const spread = best.score - worst || 1;
  const threshold = best.score - spread * config.suboptimalPickBias;
  const suboptimal = sorted.filter((m) => m.score < best.score && m.score >= threshold);

  if (suboptimal.length > 0) {
    return suboptimal[Math.floor(rng() * suboptimal.length)].card;
  }

  const fallbackIndex = Math.min(1 + Math.floor(rng() * 2), sorted.length - 1);
  return sorted[fallbackIndex].card;
}

export function chooseComputerCard(
  state: GameState,
  config: DifficultyConfig,
  rng: Rng = Math.random,
): Card {
  const legal = getLegalCards(state, 'computer');
  if (legal.length === 0) {
    throw new Error('A gépnek nincs kijátszható lapja');
  }

  const immediate = legal.map((card) => ({
    card,
    score: evaluateCardPlay(state, card, config),
  }));
  const scored = scoreMovesWithSearch(state, immediate, config);

  if (config.easyWastefulness > 0) {
    return pickEasyMove(state, scored, config, rng);
  }

  return pickMove(scored, config, rng);
}

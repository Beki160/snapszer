import { DifficultyLevel } from '../../settings/types';
import { Rng } from '../deck';
import { Card, GameState } from '../types';
import {
  canDeclareMarriageWithCard,
  canExchangeTrump,
  exchangeTrump,
  playCard,
} from '../engine';
import { getDifficultyConfig } from './difficulty';
import { chooseMarriageLead, shouldDeclareMarriage, shouldExchangeTrump } from './evaluation';
import { chooseComputerCard } from './search';

export function chooseComputerCardForDifficulty(
  state: GameState,
  difficulty: DifficultyLevel = 'medium',
  rng: Rng = Math.random,
): Card {
  const config = getDifficultyConfig(difficulty);
  return chooseComputerCard(state, config, rng);
}

export function playComputerTurn(
  state: GameState,
  difficulty: DifficultyLevel = 'medium',
  rng: Rng = Math.random,
): GameState {
  const config = getDifficultyConfig(difficulty);

  if (canExchangeTrump(state, 'computer') && shouldExchangeTrump(state, config, rng)) {
    return exchangeTrump(state, 'computer');
  }

  const marriageLead = chooseMarriageLead(state);
  if (
    marriageLead &&
    canDeclareMarriageWithCard(state, 'computer', marriageLead.id) &&
    shouldDeclareMarriage(config, rng)
  ) {
    return playCard(state, 'computer', marriageLead.id, { declareMarriage: true });
  }

  const card = chooseComputerCard(state, config, rng);
  return playCard(state, 'computer', card.id);
}

export { getDifficultyConfig, DIFFICULTY_CONFIGS } from './difficulty';

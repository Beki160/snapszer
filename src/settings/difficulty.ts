import { DifficultyLevel, DifficultyOption } from './types';

export const DEFAULT_DIFFICULTY: DifficultyLevel = 'medium';

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    id: 'easy',
    label: 'Könnyű',
    description: 'Kezdő szintű ellenfél',
  },
  {
    id: 'medium',
    label: 'Közepes',
    description: 'Ügyes játékos',
  },
  {
    id: 'hard',
    label: 'Nehéz',
    description: 'Nagyon erős ellenfél',
  },
];

export function getDifficultyLabel(level: DifficultyLevel): string {
  return DIFFICULTY_OPTIONS.find((o) => o.id === level)?.label ?? level;
}

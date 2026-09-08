import { DifficultyLevel } from '../../settings/types';

export type DifficultyConfig = {
  searchDepth: number;
  maxSearchDepth: number;
  memoryAccuracy: number;
  opponentInference: number;
  mistakeRate: number;
  suboptimalPickBias: number;
  alwaysExchangeTrump: boolean;
  scoreContextWeight: number;
  /** 0–1: esély a párbemondásra (könnyű: gyakran kihagyja). */
  marriageDeclareRate: number;
  /** 0–1: erős lap felesleges felhasználásának vonzereje (könnyű). */
  easyWastefulness: number;
  /** Nehéz: rekurzív keresés zárt fázisban / fontos ütéseknél. */
  useRecursiveSearch: boolean;
};

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    searchDepth: 0,
    maxSearchDepth: 0,
    memoryAccuracy: 0.25,
    opponentInference: 0.15,
    mistakeRate: 0.45,
    suboptimalPickBias: 0.7,
    alwaysExchangeTrump: false,
    scoreContextWeight: 0.1,
    marriageDeclareRate: 0.3,
    easyWastefulness: 0.85,
    useRecursiveSearch: false,
  },
  medium: {
    searchDepth: 1,
    maxSearchDepth: 2,
    memoryAccuracy: 0.8,
    opponentInference: 0.55,
    mistakeRate: 0.1,
    suboptimalPickBias: 0.3,
    alwaysExchangeTrump: true,
    scoreContextWeight: 0.45,
    marriageDeclareRate: 1,
    easyWastefulness: 0,
    useRecursiveSearch: false,
  },
  hard: {
    searchDepth: 2,
    maxSearchDepth: 5,
    memoryAccuracy: 0.98,
    opponentInference: 0.95,
    mistakeRate: 0.015,
    suboptimalPickBias: 0.08,
    alwaysExchangeTrump: true,
    scoreContextWeight: 0.9,
    marriageDeclareRate: 1,
    easyWastefulness: 0,
    useRecursiveSearch: true,
  },
};

export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_CONFIGS[level];
}

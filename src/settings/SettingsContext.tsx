import React, { createContext, useContext, useMemo, useState } from 'react';
import { DEFAULT_BACKGROUND_COLOR, getBackgroundPalette } from './backgroundColors';
import { DEFAULT_CARD_BACK } from './cardBacks';
import { DEFAULT_DIFFICULTY } from './difficulty';
import {
  BackgroundColorId,
  BackgroundPalette,
  CardBackId,
  DifficultyLevel,
} from './types';

type SettingsContextValue = {
  cardBackId: CardBackId;
  setCardBackId: (id: CardBackId) => void;
  backgroundColorId: BackgroundColorId;
  setBackgroundColorId: (id: BackgroundColorId) => void;
  difficulty: DifficultyLevel;
  setDifficulty: (level: DifficultyLevel) => void;
  background: BackgroundPalette;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

export function SettingsProvider({ children }: Props) {
  const [cardBackId, setCardBackId] = useState<CardBackId>(DEFAULT_CARD_BACK);
  const [backgroundColorId, setBackgroundColorId] = useState<BackgroundColorId>(
    DEFAULT_BACKGROUND_COLOR,
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DEFAULT_DIFFICULTY);

  const value = useMemo(
    () => ({
      cardBackId,
      setCardBackId,
      backgroundColorId,
      setBackgroundColorId,
      difficulty,
      setDifficulty,
      background: getBackgroundPalette(backgroundColorId),
    }),
    [cardBackId, backgroundColorId, difficulty],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings csak SettingsProvider-en belül használható');
  }
  return context;
}

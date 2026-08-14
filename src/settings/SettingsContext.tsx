import React, { createContext, useContext, useMemo, useState } from 'react';
import { DEFAULT_BACKGROUND_COLOR, getBackgroundPalette } from './backgroundColors';
import { DEFAULT_CARD_BACK } from './cardBacks';
import { BackgroundColorId, BackgroundPalette, CardBackId } from './types';

type SettingsContextValue = {
  cardBackId: CardBackId;
  setCardBackId: (id: CardBackId) => void;
  backgroundColorId: BackgroundColorId;
  setBackgroundColorId: (id: BackgroundColorId) => void;
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

  const value = useMemo(
    () => ({
      cardBackId,
      setCardBackId,
      backgroundColorId,
      setBackgroundColorId,
      background: getBackgroundPalette(backgroundColorId),
    }),
    [cardBackId, backgroundColorId],
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

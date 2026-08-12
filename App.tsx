import React, { useCallback, useState } from 'react';
import {
  continueMatch,
  createInitialMenuState,
  startMatch,
  startSingleGame,
} from './src/game/engine';
import { GameState } from './src/game/types';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  const [state, setState] = useState<GameState>(createInitialMenuState);

  const handleNewGame = useCallback(() => {
    setState((prev) => startSingleGame(prev));
  }, []);

  const handleNewMatch = useCallback(() => {
    setState((prev) => startMatch(prev));
  }, []);

  const handleContinueMatch = useCallback(() => {
    setState((prev) => continueMatch(prev));
  }, []);

  const handleExitToMenu = useCallback(() => {
    setState((prev) => ({
      ...createInitialMenuState(),
      gamesStarted: prev.gamesStarted,
    }));
  }, []);

  if (state.phase === 'menu') {
    return (
      <HomeScreen onNewGame={handleNewGame} onNewMatch={handleNewMatch} />
    );
  }

  return (
    <GameScreen
      state={state}
      onChange={setState}
      onExitToMenu={handleExitToMenu}
      onNewGame={handleNewGame}
      onContinueMatch={handleContinueMatch}
      onNewMatch={handleNewMatch}
    />
  );
}

import React, { useCallback, useState } from 'react';
import {
  continueMatch,
  createInitialMenuState,
  startMatch,
  startSingleGame,
} from './src/game/engine';
import { GameState } from './src/game/types';
import { SettingsProvider } from './src/settings/SettingsContext';
import { BackgroundColorSettingsScreen } from './src/screens/BackgroundColorSettingsScreen';
import { CardBackSettingsScreen } from './src/screens/CardBackSettingsScreen';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type MenuScreen = 'home' | 'settings' | 'cardBack' | 'backgroundColor';

export default function App() {
  const [state, setState] = useState<GameState>(createInitialMenuState);
  const [menuScreen, setMenuScreen] = useState<MenuScreen>('home');

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
    setMenuScreen('home');
    setState((prev) => ({
      ...createInitialMenuState(),
      gamesStarted: prev.gamesStarted,
    }));
  }, []);

  const renderMenu = () => {
    switch (menuScreen) {
      case 'settings':
        return (
          <SettingsScreen
            onBack={() => setMenuScreen('home')}
            onCardBackPress={() => setMenuScreen('cardBack')}
            onBackgroundColorPress={() => setMenuScreen('backgroundColor')}
          />
        );
      case 'cardBack':
        return (
          <CardBackSettingsScreen
            onBack={() => setMenuScreen('settings')}
          />
        );
      case 'backgroundColor':
        return (
          <BackgroundColorSettingsScreen
            onBack={() => setMenuScreen('settings')}
          />
        );
      default:
        return (
          <HomeScreen
            onNewGame={handleNewGame}
            onNewMatch={handleNewMatch}
            onSettings={() => setMenuScreen('settings')}
          />
        );
    }
  };

  return (
    <SettingsProvider>
      {state.phase === 'menu' ? renderMenu() : (
        <GameScreen
          state={state}
          onChange={setState}
          onExitToMenu={handleExitToMenu}
          onNewGame={handleNewGame}
          onContinueMatch={handleContinueMatch}
          onNewMatch={handleNewMatch}
        />
      )}
    </SettingsProvider>
  );
}

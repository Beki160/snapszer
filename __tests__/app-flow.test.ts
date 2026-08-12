import { playComputerTurn } from '../src/game/ai';
import {
  createInitialMenuState,
  drawCard,
  playCard,
  startNewGameWithSeed,
} from '../src/game/engine';
import { COMPUTER_MOVE_DELAY_MS } from '../src/game/types';

describe('Alkalmazás folyamat', () => {
  test('menüből indul a játék', () => {
    const menu = createInitialMenuState();
    expect(menu.phase).toBe('menu');
    const playing = startNewGameWithSeed(menu, 5);
    expect(playing.phase).toBe('playing');
  });

  test('ütés után a lapok kint maradnak húzásig', () => {
    let game = startNewGameWithSeed(createInitialMenuState(), 8);
    game = playCard(game, 'user', game.userHand[0].id);
    if (game.phase === 'playing') {
      game = playComputerTurn(game);
    }
    expect(game.currentTrick).toHaveLength(2);
    expect(game.phase).toBe('awaitingDraw');
  });

  test('user húzás után új kör', () => {
    let game = startNewGameWithSeed(createInitialMenuState(), 8);
    game = playCard(game, 'user', game.userHand[0].id);
    if (game.phase === 'playing') {
      game = playComputerTurn(game);
    }
    if (game.drawPlayer === 'computer') {
      game = drawCard(game, 'computer');
    }
    game = drawCard(game, 'user');
    expect(game.currentTrick).toHaveLength(0);
  });

  test('számítógép késleltetés konfigurált', () => {
    expect(COMPUTER_MOVE_DELAY_MS).toBeGreaterThan(0);
  });
});

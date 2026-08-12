import {
  beginNextRound,
  claimSixtySix,
  continueAfterTrick,
  createInitialMenuState,
  decideTrickWinner,
  drawCard,
  resolveTrick,
  startNewGameWithSeed,
} from '../src/game/engine';
import { WIN_POINTS } from '../src/game/types';

describe('Játszma vége magyarázatokkal', () => {
  test('66 user', () => {
    let state = startNewGameWithSeed(createInitialMenuState(), 4);
    state = {
      ...state,
      phase: 'playing',
      currentPlayer: 'user',
      currentTrick: [],
      userPoints: WIN_POINTS,
    };
    state = claimSixtySix(state);
    expect(state.endDetail).toContain('66');
  });

  test('66 gép', () => {
    let state = startNewGameWithSeed(createInitialMenuState(), 4);
    state = beginNextRound({
      ...state,
      lastTrickWinner: 'computer',
      computerPoints: 70,
      userPoints: 20,
      userHand: [{ id: 'a', suit: 'piros', rank: 'also' }],
      computerHand: [{ id: 'b', suit: 'makk', rank: 'also' }],
      currentTrick: [],
    });
    expect(state.message).toBe('Vesztettél');
    expect(state.endDetail).toBe('A gép elérte a 66 pontot.');
  });

  test('utolsó ütés user — pontoktól függetlenül', () => {
    const state = beginNextRound({
      ...startNewGameWithSeed(createInitialMenuState(), 4),
      lastTrickWinner: 'user',
      userPoints: 5,
      computerPoints: 80,
      userHand: [],
      computerHand: [],
      currentTrick: [],
    });
    expect(state.winner).toBe('user');
    expect(state.winReason).toBe('lastTrick');
  });
});

describe('Húzás sorrend', () => {
  test('gép győztes ütésnél a gép húz először, lapok kint maradnak', () => {
    let state = startNewGameWithSeed(createInitialMenuState(), 6);
    state = resolveTrick({
      ...state,
      phase: 'playing',
      trumpSuit: 'makk',
      currentTrick: [
        { player: 'user', card: { id: 'piros-asz', suit: 'piros', rank: 'asz' } },
        { player: 'computer', card: { id: 'makk-also', suit: 'makk', rank: 'also' } },
      ],
      userHand: state.userHand.slice(0, 4),
      computerHand: state.computerHand.slice(0, 4),
    });

    expect(state.phase).toBe('awaitingDraw');
    expect(state.drawPlayer).toBe('computer');
    expect(state.currentTrick).toHaveLength(2);

    state = drawCard(state, 'computer');
    expect(state.drawPlayer).toBe('user');
    expect(state.currentTrick).toHaveLength(2);
  });

  test('üres talonnál continueAfterTrick', () => {
    let state = resolveTrick({
      ...startNewGameWithSeed(createInitialMenuState(), 2),
      stock: [],
      trumpCard: null,
      trumpSuit: 'makk',
      currentTrick: [
        { player: 'user', card: { id: 'piros-asz', suit: 'piros', rank: 'asz' } },
        { player: 'computer', card: { id: 'zold-also', suit: 'zold', rank: 'also' } },
      ],
      userHand: [{ id: 'makk-tizes', suit: 'makk', rank: 'tizes' }],
      computerHand: [{ id: 'tok-tizes', suit: 'tok', rank: 'tizes' }],
    });
    expect(state.phase).toBe('awaitingContinue');
    expect(state.currentTrick).toHaveLength(2);
    state = continueAfterTrick(state);
    expect(state.currentTrick).toHaveLength(0);
  });
});

describe('decideTrickWinner', () => {
  test('hívó aduja visz', () => {
    expect(
      decideTrickWinner(
        { player: 'user', card: { id: 'makk-also', suit: 'makk', rank: 'also' } },
        { player: 'computer', card: { id: 'piros-asz', suit: 'piros', rank: 'asz' } },
        'makk',
      ),
    ).toBe('user');
  });
});

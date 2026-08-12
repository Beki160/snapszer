import {
  calculateMatchAward,
  createInitialMenuState,
  startMatch,
  startNewGameWithSeed,
  startSingleGame,
} from '../src/game/engine';
import { MATCH_WIN_POINTS } from '../src/game/types';

// finishMatchDeal is internal — test via endGame path using claimSixtySix / beginNextRound
import { beginNextRound, claimSixtySix } from '../src/game/engine';

describe('Parti pontozás', () => {
  test('1/2/3 pont a vesztes állása szerint', () => {
    expect(calculateMatchAward(40, 2)).toBe(1);
    expect(calculateMatchAward(33, 1)).toBe(1);
    expect(calculateMatchAward(32, 1)).toBe(2);
    expect(calculateMatchAward(0, 0)).toBe(3);
    expect(calculateMatchAward(20, 0)).toBe(3);
  });

  test('új játék single módban indul', () => {
    const state = startSingleGame(createInitialMenuState());
    expect(state.mode).toBe('single');
    expect(state.phase).toBe('playing');
    expect(state.userMatchPoints).toBe(0);
  });

  test('új parti nullázza a parti pontokat', () => {
    const mid = {
      ...startMatch(createInitialMenuState()),
      userMatchPoints: 4,
      computerMatchPoints: 2,
    };
    const fresh = startMatch(mid);
    expect(fresh.mode).toBe('match');
    expect(fresh.userMatchPoints).toBe(0);
    expect(fresh.computerMatchPoints).toBe(0);
  });

  test('játszma után parti pont jár, majd folytatható', () => {
    let state = startNewGameWithSeed(createInitialMenuState(), 40, {
      mode: 'match',
    });
    state = {
      ...state,
      phase: 'playing',
      currentPlayer: 'user',
      currentTrick: [],
      userPoints: 66,
      computerPoints: 20,
      computerTricksWon: 1,
      userTricksWon: 2,
    };
    state = claimSixtySix(state);
    expect(state.phase).toBe('matchRoundOver');
    expect(state.userMatchPoints).toBe(2); // ellenfél < 33, volt ütése
    expect(state.userDealsWon).toBe(1);
    expect(state.endDetail).toMatch(/parti-pont/i);
  });

  test('7 parti-pontnál matchOver', () => {
    let state = startNewGameWithSeed(createInitialMenuState(), 41, {
      mode: 'match',
    });
    state = {
      ...state,
      phase: 'playing',
      currentPlayer: 'user',
      currentTrick: [],
      userPoints: 70,
      computerPoints: 0,
      computerTricksWon: 0,
      userTricksWon: 3,
      userMatchPoints: 5,
      computerMatchPoints: 2,
      userDealsWon: 2,
      computerDealsWon: 1,
    };
    state = claimSixtySix(state);
    expect(state.phase).toBe('matchOver');
    expect(state.message).toBe('Nyertél!');
    expect(state.userMatchPoints).toBeGreaterThanOrEqual(MATCH_WIN_POINTS);
  });

  test('gép nyeri a partit', () => {
    let state = startNewGameWithSeed(createInitialMenuState(), 42, {
      mode: 'match',
    });
    state = beginNextRound({
      ...state,
      lastTrickWinner: 'computer',
      computerPoints: 50,
      userPoints: 10,
      userTricksWon: 1,
      computerTricksWon: 2,
      userHand: [],
      computerHand: [],
      currentTrick: [],
      userMatchPoints: 3,
      computerMatchPoints: 6,
    });
    expect(state.phase).toBe('matchOver');
    expect(state.message).toBe('Vesztettél!');
  });
});

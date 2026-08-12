import {
  canDeclareMarriageWithCard,
  createInitialMenuState,
  getMarriageSuits,
  marriagePointsForSuit,
  playCard,
  resolveTrick,
  startNewGameWithSeed,
} from '../src/game/engine';
import { playComputerTurn } from '../src/game/ai';

describe('Párbemondás (20 / 40)', () => {
  test('20 nem adu, 40 adu', () => {
    expect(marriagePointsForSuit('piros', 'makk')).toBe(20);
    expect(marriagePointsForSuit('makk', 'makk')).toBe(40);
  });

  test('pár felismerése a kézben', () => {
    const suits = getMarriageSuits([
      { id: 'piros-felso', suit: 'piros', rank: 'felso' },
      { id: 'piros-kiraly', suit: 'piros', rank: 'kiraly' },
      { id: 'zold-asz', suit: 'zold', rank: 'asz' },
    ]);
    expect(suits).toEqual(['piros']);
  });

  test('híváskor bemondható a pár, pont függőben marad ütés nélkül', () => {
    const base = startNewGameWithSeed(createInitialMenuState(), 30);
    const state = {
      ...base,
      phase: 'playing' as const,
      currentPlayer: 'user' as const,
      currentTrick: [],
      trumpSuit: 'makk' as const,
      userTricksWon: 0,
      userPendingMarriage: 0,
      userHand: [
        { id: 'piros-felso', suit: 'piros' as const, rank: 'felso' as const },
        { id: 'piros-kiraly', suit: 'piros' as const, rank: 'kiraly' as const },
        { id: 'zold-asz', suit: 'zold' as const, rank: 'asz' as const },
      ],
    };

    expect(canDeclareMarriageWithCard(state, 'user', 'piros-kiraly')).toBe(true);
    const next = playCard(state, 'user', 'piros-kiraly', { declareMarriage: true });
    expect(next.userPendingMarriage).toBe(20);
    expect(next.userPoints).toBe(0);
    expect(next.currentTrick[0].card.id).toBe('piros-kiraly');
  });

  test('ha van már ütés, a pár azonnal pontot ad', () => {
    const base = startNewGameWithSeed(createInitialMenuState(), 31);
    const state = {
      ...base,
      phase: 'playing' as const,
      currentPlayer: 'user' as const,
      currentTrick: [],
      trumpSuit: 'makk' as const,
      userTricksWon: 1,
      userPoints: 10,
      userHand: [
        { id: 'makk-felso', suit: 'makk' as const, rank: 'felso' as const },
        { id: 'makk-kiraly', suit: 'makk' as const, rank: 'kiraly' as const },
      ],
    };

    const next = playCard(state, 'user', 'makk-felso', { declareMarriage: true });
    expect(next.userPoints).toBe(50);
    expect(next.userPendingMarriage).toBe(0);
  });

  test('első ütés után a függő pár pont bekerül', () => {
    const base = startNewGameWithSeed(createInitialMenuState(), 32);
    const before = {
      ...base,
      phase: 'playing' as const,
      trumpSuit: 'makk' as const,
      userTricksWon: 0,
      userPendingMarriage: 20,
      userPoints: 0,
      computerPoints: 0,
      currentTrick: [
        {
          player: 'user' as const,
          card: { id: 'piros-kiraly', suit: 'piros' as const, rank: 'kiraly' as const },
        },
        {
          player: 'computer' as const,
          card: { id: 'piros-also', suit: 'piros' as const, rank: 'also' as const },
        },
      ],
    };

    const state = resolveTrick(before);
    expect(state.lastTrickWinner).toBe('user');
    expect(state.userPendingMarriage).toBe(0);
    expect(state.userTricksWon).toBe(1);
    expect(state.userPoints).toBeGreaterThanOrEqual(20);
  });

  test('a gép bemondja a párt üzenettel', () => {
    const base = startNewGameWithSeed(createInitialMenuState(), 33);
    const state = {
      ...base,
      phase: 'playing' as const,
      currentPlayer: 'computer' as const,
      currentTrick: [],
      trumpSuit: 'makk' as const,
      stock: [],
      trumpCard: null,
      computerHand: [
        { id: 'zold-felso', suit: 'zold' as const, rank: 'felso' as const },
        { id: 'zold-kiraly', suit: 'zold' as const, rank: 'kiraly' as const },
        { id: 'piros-asz', suit: 'piros' as const, rank: 'asz' as const },
      ],
      userHand: [{ id: 'tok-asz', suit: 'tok' as const, rank: 'asz' as const }],
    };

    const next = playComputerTurn(state);
    expect(next.message).toMatch(/bejelentette a 20/i);
    expect(next.currentTrick[0].card.suit).toBe('zold');
    expect(['felso', 'kiraly']).toContain(next.currentTrick[0].card.rank);
  });
});

import {
  acknowledgeComputerSixtySixViaMarriage,
  canDeclareMarriageWithCard,
  claimSixtySixFromMarriage,
  createInitialMenuState,
  getMarriageSuits,
  marriageDeclarationValue,
  marriagePointsForSuit,
  playCard,
  reachedSixtySixViaMarriage,
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
    expect(marriageDeclarationValue(state, next, 'computer')).toBe(20);
    expect(next.message).toMatch(/bejelentette a 20/i);
    expect(next.currentTrick[0].card.suit).toBe('zold');
    expect(['felso', 'kiraly']).toContain(next.currentTrick[0].card.rank);
  });
});

describe('66 pont párbemondással', () => {
  test('reachedSixtySixViaMarriage felismeri a 20-as bemondást', () => {
    const base = startNewGameWithSeed(createInitialMenuState(), 40);
    const before = {
      ...base,
      phase: 'playing' as const,
      currentPlayer: 'user' as const,
      currentTrick: [],
      trumpSuit: 'makk' as const,
      userTricksWon: 1,
      userPoints: 46,
      userHand: [
        { id: 'piros-felso', suit: 'piros' as const, rank: 'felso' as const },
        { id: 'piros-kiraly', suit: 'piros' as const, rank: 'kiraly' as const },
      ],
    };

    const after = playCard(before, 'user', 'piros-kiraly', { declareMarriage: true });
    expect(reachedSixtySixViaMarriage(before, after, 'user')).toBe(true);
    expect(after.userPoints).toBe(66);
  });

  test('claimSixtySixFromMarriage ütés közben is nyer', () => {
    const base = startNewGameWithSeed(createInitialMenuState(), 41);
    const before = {
      ...base,
      phase: 'playing' as const,
      currentPlayer: 'computer' as const,
      currentTrick: [
        {
          player: 'user' as const,
          card: { id: 'piros-kiraly', suit: 'piros' as const, rank: 'kiraly' as const },
        },
      ],
      trumpSuit: 'makk' as const,
      userTricksWon: 1,
      userPoints: 66,
    };

    const ended = claimSixtySixFromMarriage(before);
    expect(ended.phase).toBe('gameOver');
    expect(ended.winner).toBe('user');
    expect(ended.winReason).toBe('reached66');
  });

  test('gép párbemondással eléri a 66-ot', () => {
    const base = startNewGameWithSeed(createInitialMenuState(), 42);
    const before = {
      ...base,
      phase: 'playing' as const,
      currentPlayer: 'computer' as const,
      currentTrick: [],
      trumpSuit: 'makk' as const,
      stock: [],
      trumpCard: null,
      computerTricksWon: 1,
      computerPoints: 26,
      computerHand: [
        { id: 'makk-felso', suit: 'makk' as const, rank: 'felso' as const },
        { id: 'makk-kiraly', suit: 'makk' as const, rank: 'kiraly' as const },
        { id: 'piros-asz', suit: 'piros' as const, rank: 'asz' as const },
      ],
      userHand: [{ id: 'tok-asz', suit: 'tok' as const, rank: 'asz' as const }],
    };

    const after = playComputerTurn(before);
    expect(reachedSixtySixViaMarriage(before, after, 'computer')).toBe(true);
    expect(after.computerPoints).toBe(66);

    const ended = acknowledgeComputerSixtySixViaMarriage(after);
    expect(ended.phase).toBe('gameOver');
    expect(ended.winner).toBe('computer');
    expect(ended.endDetail).toContain('66');
  });

  test('függő pár nem számít elért 66-nak', () => {
    const base = startNewGameWithSeed(createInitialMenuState(), 43);
    const before = {
      ...base,
      phase: 'playing' as const,
      currentPlayer: 'user' as const,
      currentTrick: [],
      trumpSuit: 'makk' as const,
      userTricksWon: 0,
      userPoints: 50,
      userHand: [
        { id: 'piros-felso', suit: 'piros' as const, rank: 'felso' as const },
        { id: 'piros-kiraly', suit: 'piros' as const, rank: 'kiraly' as const },
      ],
    };

    const after = playCard(before, 'user', 'piros-kiraly', { declareMarriage: true });
    expect(reachedSixtySixViaMarriage(before, after, 'user')).toBe(false);
    expect(after.userPendingMarriage).toBe(20);
    expect(after.userPoints).toBe(50);
  });
});

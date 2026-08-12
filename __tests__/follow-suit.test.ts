import {
  getLegalCards,
  isCardPlayable,
  isClosedPhase,
  playCard,
  createInitialMenuState,
  startNewGameWithSeed,
} from '../src/game/engine';
import { playComputerTurn } from '../src/game/ai';

describe('Színkényszer (zárt fázis)', () => {
  test('nyílt fázisban minden lap legális', () => {
    const state = startNewGameWithSeed(createInitialMenuState(), 10);
    expect(isClosedPhase(state)).toBe(false);
    expect(getLegalCards(state, 'user')).toHaveLength(state.userHand.length);
  });

  test('zárt fázisban színre színt kell tenni, ha van', () => {
    let state = startNewGameWithSeed(createInitialMenuState(), 12);
    state = {
      ...state,
      stock: [],
      trumpCard: null,
      trumpSuit: 'makk',
      phase: 'playing',
      currentPlayer: 'user',
      currentTrick: [
        { player: 'computer', card: { id: 'piros-asz', suit: 'piros', rank: 'asz' } },
      ],
      userHand: [
        { id: 'piros-also', suit: 'piros', rank: 'also' },
        { id: 'zold-tizes', suit: 'zold', rank: 'tizes' },
        { id: 'makk-kiraly', suit: 'makk', rank: 'kiraly' },
      ],
      computerHand: [{ id: 'tok-also', suit: 'tok', rank: 'also' }],
    };

    expect(isClosedPhase(state)).toBe(true);
    const legal = getLegalCards(state, 'user');
    expect(legal).toHaveLength(1);
    expect(legal[0].id).toBe('piros-also');
    expect(isCardPlayable(state, 'user', 'zold-tizes')).toBe(false);
    expect(isCardPlayable(state, 'user', 'piros-also')).toBe(true);
  });

  test('ha nincs a kihívott szín, bármi mehet', () => {
    const state = {
      ...startNewGameWithSeed(createInitialMenuState(), 12),
      stock: [],
      trumpCard: null,
      phase: 'playing' as const,
      currentPlayer: 'user' as const,
      currentTrick: [
        { player: 'computer' as const, card: { id: 'piros-asz', suit: 'piros' as const, rank: 'asz' as const } },
      ],
      userHand: [
        { id: 'zold-tizes', suit: 'zold' as const, rank: 'tizes' as const },
        { id: 'makk-kiraly', suit: 'makk' as const, rank: 'kiraly' as const },
      ],
    };

    expect(getLegalCards(state, 'user')).toHaveLength(2);
  });

  test('illegális lap kijátszása hibát dob', () => {
    const state = {
      ...startNewGameWithSeed(createInitialMenuState(), 12),
      stock: [],
      trumpCard: null,
      phase: 'playing' as const,
      currentPlayer: 'user' as const,
      currentTrick: [
        { player: 'computer' as const, card: { id: 'piros-asz', suit: 'piros' as const, rank: 'asz' as const } },
      ],
      userHand: [
        { id: 'piros-also', suit: 'piros' as const, rank: 'also' as const },
        { id: 'zold-tizes', suit: 'zold' as const, rank: 'tizes' as const },
      ],
    };

    expect(() => playCard(state, 'user', 'zold-tizes')).toThrow(/színkényszer/);
  });

  test('a gép is csak legális lapot játszik', () => {
    const base = startNewGameWithSeed(createInitialMenuState(), 12);
    let state = {
      ...base,
      stock: [] as typeof base.stock,
      trumpCard: null,
      phase: 'playing' as const,
      currentPlayer: 'computer' as const,
      currentTrick: [
        { player: 'user' as const, card: { id: 'zold-asz', suit: 'zold' as const, rank: 'asz' as const } },
      ],
      userHand: [{ id: 'piros-also', suit: 'piros' as const, rank: 'also' as const }],
      computerHand: [
        { id: 'makk-also', suit: 'makk' as const, rank: 'also' as const },
        { id: 'zold-felso', suit: 'zold' as const, rank: 'felso' as const },
      ],
      trumpSuit: 'makk' as const,
    };

    const next = playComputerTurn(state);
    expect(next.currentTrick[1].card.id).toBe('zold-felso');
  });
});

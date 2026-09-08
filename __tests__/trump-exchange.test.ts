import {
  canExchangeTrump,
  createInitialMenuState,
  exchangeTrump,
  startNewGameWithSeed,
  trumpExchangeReplacedCard,
} from '../src/game/engine';
import { playComputerTurn } from '../src/game/ai';

describe('Adu csere (alsó)', () => {
  function openStateWithUserAlso() {
    const base = startNewGameWithSeed(createInitialMenuState(), 20);
    const trumpSuit = base.trumpSuit!;
    return {
      ...base,
      phase: 'playing' as const,
      currentPlayer: 'user' as const,
      currentTrick: [],
      stock: base.stock.length ? base.stock : base.userHand.slice(0, 1),
      trumpCard: {
        id: `${trumpSuit}-asz`,
        suit: trumpSuit,
        rank: 'asz' as const,
      },
      userHand: [
        { id: `${trumpSuit}-also`, suit: trumpSuit, rank: 'also' as const },
        { id: 'piros-tizes', suit: 'piros' as const, rank: 'tizes' as const },
      ],
    };
  }

  test('cserélhető, ha a user hív és nála van az adu alsó', () => {
    const state = openStateWithUserAlso();
    expect(canExchangeTrump(state, 'user')).toBe(true);
  });

  test('nem cserélhető, ha az adu már alsó', () => {
    const state = openStateWithUserAlso();
    const withAlsoTrump = {
      ...state,
      trumpCard: {
        id: `${state.trumpSuit}-also-face`,
        suit: state.trumpSuit!,
        rank: 'also' as const,
      },
      userHand: [
        { id: `${state.trumpSuit}-asz`, suit: state.trumpSuit!, rank: 'asz' as const },
      ],
    };
    expect(canExchangeTrump(withAlsoTrump, 'user')).toBe(false);
  });

  test('csere felcseréli a kézben lévő alsót és a felfordított adut', () => {
    const state = openStateWithUserAlso();
    const faceUpId = state.trumpCard!.id;
    const next = exchangeTrump(state, 'user');
    expect(next.trumpCard!.rank).toBe('also');
    expect(next.userHand.some((c) => c.id === faceUpId)).toBe(true);
    expect(next.userHand.some((c) => c.rank === 'also' && c.suit === state.trumpSuit)).toBe(
      false,
    );
  });

  test('a gép cserél, majd üzenetet ad', () => {
    const base = startNewGameWithSeed(createInitialMenuState(), 21);
    const trumpSuit = base.trumpSuit!;
    const state = {
      ...base,
      phase: 'playing' as const,
      currentPlayer: 'computer' as const,
      currentTrick: [],
      stock: [
        { id: 'piros-kiraly', suit: 'piros' as const, rank: 'kiraly' as const },
        { id: 'zold-also', suit: 'zold' as const, rank: 'also' as const },
      ],
      trumpCard: {
        id: `${trumpSuit}-tizes`,
        suit: trumpSuit,
        rank: 'tizes' as const,
      },
      computerHand: [
        { id: `${trumpSuit}-also`, suit: trumpSuit, rank: 'also' as const },
        { id: 'zold-asz', suit: 'zold' as const, rank: 'asz' as const },
      ],
    };

    const afterExchange = playComputerTurn(state);
    expect(afterExchange.trumpCard!.rank).toBe('also');
    expect(trumpExchangeReplacedCard(state, afterExchange, 'computer')).toEqual(
      state.trumpCard,
    );
    expect(afterExchange.message).toMatch(/gép kicserélte/i);
    expect(afterExchange.currentTrick).toHaveLength(0);
    expect(afterExchange.currentPlayer).toBe('computer');

    // Második hívás: már lapot is kijátszik
    const afterLead = playComputerTurn(afterExchange);
    expect(afterLead.currentTrick.length).toBeGreaterThan(0);
    expect(afterLead.currentTrick[0].player).toBe('computer');
  });
});

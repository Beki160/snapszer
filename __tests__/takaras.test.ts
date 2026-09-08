import {
  canClaimSixtySix,
  canCloseTalon,
  canExchangeTrump,
  canInteractWithTrump,
  canUserDraw,
  closeTalon,
  createInitialMenuState,
  getLegalCards,
  isClosedPhase,
  playCard,
  resolveTrick,
  startNewGameWithSeed,
} from '../src/game/engine';

describe('Takarás', () => {
  function openLeadState(seed: number) {
    const base = startNewGameWithSeed(createInitialMenuState(), seed);
    return {
      ...base,
      phase: 'playing' as const,
      currentPlayer: 'user' as const,
      currentTrick: [],
      stock: base.stock.slice(0, 3),
      takarasActive: false,
    };
  }

  test('takarás csak híváskor, saját körben lehetséges', () => {
    const state = openLeadState(50);
    expect(canCloseTalon(state, 'user')).toBe(true);

    const following = {
      ...state,
      currentPlayer: 'computer' as const,
      currentTrick: [
        {
          player: 'user' as const,
          card: state.userHand[0],
        },
      ],
    };
    expect(canCloseTalon(following, 'user')).toBe(false);
  });

  test('2 talonlapnál nem lehet takarni és adut cserélni', () => {
    const state = {
      ...openLeadState(51),
      stock: [{ id: 'piros-kiraly', suit: 'piros' as const, rank: 'kiraly' as const }],
      trumpCard: { id: 'makk-asz', suit: 'makk' as const, rank: 'asz' as const },
    };

    expect(canInteractWithTrump(state)).toBe(false);
    expect(canCloseTalon(state, 'user')).toBe(false);
    expect(canExchangeTrump(state, 'user')).toBe(false);
  });

  test('takarás után nincs húzás és színkényszer van', () => {
    const before = openLeadState(52);
    const closed = closeTalon(before, 'user');
    expect(closed.takarasActive).toBe(true);
    expect(canUserDraw(closed)).toBe(false);
    expect(canExchangeTrump(closed, 'user')).toBe(false);
    expect(isClosedPhase(closed)).toBe(true);
  });

  test('takarás alatt a gép ütése vesztés', () => {
    const base = openLeadState(53);
    const closed = closeTalon(base, 'user');
    const state = {
      ...closed,
      stock: [{ id: 'tok-also', suit: 'tok' as const, rank: 'also' as const }],
      trumpCard: { id: 'makk-tizes', suit: 'makk' as const, rank: 'tizes' as const },
      trumpSuit: 'makk' as const,
      currentPlayer: 'user' as const,
      currentTrick: [],
      userHand: [
        { id: 'piros-also', suit: 'piros' as const, rank: 'also' as const },
        { id: 'zold-felso', suit: 'zold' as const, rank: 'felso' as const },
      ],
      computerHand: [
        { id: 'piros-kiraly', suit: 'piros' as const, rank: 'kiraly' as const },
        { id: 'zold-asz', suit: 'zold' as const, rank: 'asz' as const },
      ],
    };

    let game = playCard(state, 'user', 'piros-also');
    game = playCard(game, 'computer', 'piros-kiraly');

    expect(game.phase).toBe('gameOver');
    expect(game.winner).toBe('computer');
    expect(game.winReason).toBe('takarasFailed');
  });

  test('takarás alatt nyert ütés után nincs húzási fázis', () => {
    const base = openLeadState(54);
    const closed = closeTalon(base, 'user');
    const state = {
      ...closed,
      trumpSuit: 'makk' as const,
      currentPlayer: 'user' as const,
      userHand: [
        { id: 'piros-asz', suit: 'piros' as const, rank: 'asz' as const },
        { id: 'zold-also', suit: 'zold' as const, rank: 'also' as const },
      ],
      computerHand: [
        { id: 'piros-also', suit: 'piros' as const, rank: 'also' as const },
        { id: 'tok-tizes', suit: 'tok' as const, rank: 'tizes' as const },
      ],
    };

    let game = playCard(state, 'user', 'piros-asz');
    game = playCard(game, 'computer', 'piros-also');

    expect(game.phase).toBe('awaitingContinue');
    expect(game.drawPlayer).toBe(null);
  });

  test('takarás alatt színkényszer érvényes', () => {
    const state = {
      ...openLeadState(55),
      takarasActive: true,
      stock: [{ id: 'tok-also', suit: 'tok' as const, rank: 'also' as const }],
      trumpCard: { id: 'makk-asz', suit: 'makk' as const, rank: 'asz' as const },
      trumpSuit: 'makk' as const,
      currentPlayer: 'user' as const,
      currentTrick: [
        {
          player: 'computer' as const,
          card: { id: 'piros-asz', suit: 'piros' as const, rank: 'asz' as const },
        },
      ],
      userHand: [
        { id: 'piros-also', suit: 'piros' as const, rank: 'also' as const },
        { id: 'zold-tizes', suit: 'zold' as const, rank: 'tizes' as const },
      ],
    };

    const legal = getLegalCards(state, 'user');
    expect(legal).toHaveLength(1);
    expect(legal[0].id).toBe('piros-also');
  });

  test('takarás alatt elért 66 pontnál megállhat', () => {
    const state = {
      ...openLeadState(56),
      takarasActive: true,
      currentPlayer: 'user' as const,
      currentTrick: [],
      userPoints: 66,
    };

    expect(canClaimSixtySix(state)).toBe(true);
  });
});

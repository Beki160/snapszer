import {
  createInitialMenuState,
  decideTrickWinner,
  drawCard,
  playCard,
  resolveTrick,
  startNewGame,
  startNewGameWithSeed,
  continueAfterTrick,
  claimSixtySix,
  beginNextRound,
  canClaimSixtySix,
} from '../src/game/engine';
import { playComputerTurn } from '../src/game/ai';
import {
  assertDeckIsValid,
  cardLabel,
  createHungarianDeck,
  createSeededRng,
  shuffle,
} from '../src/game/deck';
import { CARD_POINTS, DECK_SIZE, HAND_SIZE, RANKS, SUITS, WIN_POINTS } from '../src/game/types';

describe('Pakli és osztás', () => {
  test('20 lapos magyar pakli', () => {
    const deck = createHungarianDeck();
    expect(deck).toHaveLength(DECK_SIZE);
    assertDeckIsValid(deck);
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        expect(deck.some((c) => c.suit === suit && c.rank === rank)).toBe(true);
      }
    }
  });

  test('5–5 lap + adu + talon', () => {
    const started = startNewGameWithSeed(createInitialMenuState(), 42);
    expect(started.userHand).toHaveLength(HAND_SIZE);
    expect(started.computerHand).toHaveLength(HAND_SIZE);
    expect(started.trumpCard).not.toBeNull();
    expect(started.stock).toHaveLength(DECK_SIZE - HAND_SIZE * 2 - 1);
  });
});

describe('Kezdés', () => {
  test('első játszmában a user kezd', () => {
    const first = startNewGame(createInitialMenuState(), createSeededRng(1));
    expect(first.leadPlayer).toBe('user');
  });

  test('második játszmában a gép kezd', () => {
    const first = startNewGame(createInitialMenuState(), createSeededRng(2));
    const second = startNewGame(first, createSeededRng(3));
    expect(second.leadPlayer).toBe('computer');
  });
});

describe('Ütéslogika', () => {
  test('nagyobb rang visz azonos színben', () => {
    expect(
      decideTrickWinner(
        { player: 'user', card: { id: 'piros-also', suit: 'piros', rank: 'also' } },
        { player: 'computer', card: { id: 'piros-asz', suit: 'piros', rank: 'asz' } },
        'makk',
      ),
    ).toBe('computer');
  });

  test('adu üti a nem-adut', () => {
    expect(
      decideTrickWinner(
        { player: 'user', card: { id: 'zold-asz', suit: 'zold', rank: 'asz' } },
        { player: 'computer', card: { id: 'makk-also', suit: 'makk', rank: 'also' } },
        'makk',
      ),
    ).toBe('computer');
  });
});

describe('Lapok az asztalon maradnak', () => {
  test('resolveTrick után a currentTrick megmarad', () => {
    let state = startNewGameWithSeed(createInitialMenuState(), 11);
    state = playCard(state, 'user', state.userHand[0].id);
    state = playComputerTurn(state);
    // playCard a második lappal már resolveTrick-et hív
    expect(state.currentTrick).toHaveLength(2);
    expect(['awaitingDraw', 'awaitingContinue']).toContain(state.phase);
  });

  test('húzás után (user) törlődnek a lapok', () => {
    let state = startNewGameWithSeed(createInitialMenuState(), 11);
    state = playCard(state, 'user', state.userHand[0].id);
    state = playComputerTurn(state);
    expect(state.phase).toBe('awaitingDraw');

    const winner = state.lastTrickWinner!;
    if (state.drawPlayer === 'computer') {
      state = drawCard(state, 'computer');
    }
    expect(state.drawPlayer).toBe('user');
    state = drawCard(state, 'user');
    expect(state.currentTrick).toHaveLength(0);
    expect(state.phase === 'playing' || state.phase === 'gameOver').toBe(true);
    expect(winner).toBeTruthy();
  });
});

describe('Pakli nélkül folytatás', () => {
  test('awaitingContinue után asztal-koppintás folytat', () => {
    let state = startNewGameWithSeed(createInitialMenuState(), 9);
    state = playCard(state, 'user', state.userHand[0].id);
    state = playComputerTurn(state);
    state = {
      ...state,
      stock: [],
      trumpCard: null,
      phase: 'awaitingContinue',
      message: 'Koppints az asztalra a folytatáshoz',
    };
    // Újra resolve helyett közvetlen continue szimuláció:
    // állítsuk vissza a scored állapotot
    state = {
      ...state,
      currentTrick: [
        { player: 'user', card: { id: 'piros-also', suit: 'piros', rank: 'also' } },
        { player: 'computer', card: { id: 'zold-felso', suit: 'zold', rank: 'felso' } },
      ],
      lastTrickWinner: 'user',
      userHand: state.userHand.length ? state.userHand : [
        { id: 'makk-asz', suit: 'makk', rank: 'asz' },
      ],
      computerHand: state.computerHand.length ? state.computerHand : [
        { id: 'tok-asz', suit: 'tok', rank: 'asz' },
      ],
    };

    state = continueAfterTrick(state);
    expect(state.currentTrick).toHaveLength(0);
    expect(state.phase).toBe('playing');
  });
});

describe('66 pont és utolsó ütés', () => {
  test('user megállhat 66-nál', () => {
    let state = startNewGameWithSeed(createInitialMenuState(), 3);
    state = {
      ...state,
      phase: 'playing',
      currentPlayer: 'user',
      currentTrick: [],
      userPoints: WIN_POINTS,
      computerPoints: 20,
    };
    expect(canClaimSixtySix(state)).toBe(true);
    state = claimSixtySix(state);
    expect(state.phase).toBe('gameOver');
    expect(state.message).toBe('Nyertél');
    expect(state.endDetail).toBe('Elérted a 66 pontot.');
    expect(state.winReason).toBe('reached66');
  });

  test('gép 66-nál automatikusan nyer, ha ő hívna', () => {
    let state = startNewGameWithSeed(createInitialMenuState(), 3);
    state = {
      ...state,
      lastTrickWinner: 'computer',
      computerPoints: WIN_POINTS,
      userPoints: 30,
      userHand: [{ id: 'piros-also', suit: 'piros', rank: 'also' }],
      computerHand: [{ id: 'makk-also', suit: 'makk', rank: 'also' }],
      currentTrick: [
        { player: 'user', card: { id: 'zold-also', suit: 'zold', rank: 'also' } },
        { player: 'computer', card: { id: 'tok-also', suit: 'tok', rank: 'also' } },
      ],
    };
    state = beginNextRound(state);
    expect(state.phase).toBe('gameOver');
    expect(state.message).toBe('Vesztettél');
    expect(state.endDetail).toBe('A gép elérte a 66 pontot.');
  });

  test('utolsó ütés dönt, nem a pontok', () => {
    let state = startNewGameWithSeed(createInitialMenuState(), 3);
    state = {
      ...state,
      lastTrickWinner: 'user',
      userPoints: 10,
      computerPoints: 50,
      userHand: [],
      computerHand: [],
      currentTrick: [
        { player: 'user', card: { id: 'piros-also', suit: 'piros', rank: 'also' } },
        { player: 'computer', card: { id: 'zold-also', suit: 'zold', rank: 'also' } },
      ],
    };
    state = beginNextRound(state);
    expect(state.phase).toBe('gameOver');
    expect(state.winner).toBe('user');
    expect(state.winReason).toBe('lastTrick');
    expect(state.endDetail).toBe('Az utolsó ütést te vitted.');
  });

  test('gép utolsó ütése', () => {
    let state = startNewGameWithSeed(createInitialMenuState(), 3);
    state = {
      ...state,
      lastTrickWinner: 'computer',
      userPoints: 50,
      computerPoints: 10,
      userHand: [],
      computerHand: [],
      currentTrick: [],
    };
    state = beginNextRound(state);
    expect(state.message).toBe('Vesztettél');
    expect(state.endDetail).toBe('A gép vitte az utolsó ütést.');
  });
});

describe('Pontszám ütésből', () => {
  test('az ütés pontjai a győzteshez kerülnek', () => {
    let state = startNewGameWithSeed(createInitialMenuState(), 15);
    const firstCard = state.userHand[0];
    state = playCard(state, 'user', firstCard.id);
    // még egy lap kell a géptől
    if (state.phase === 'playing') {
      state = playComputerTurn(state);
    }
    const expected =
      CARD_POINTS[state.currentTrick[0].card.rank] +
      CARD_POINTS[state.currentTrick[1].card.rank];
    expect(state.userPoints + state.computerPoints).toBe(expected);
  });
});

describe('Segédek', () => {
  test('seedelt keverés determinisztikus', () => {
    const a = shuffle(createHungarianDeck(), createSeededRng(99)).map((c) => c.id);
    const b = shuffle(createHungarianDeck(), createSeededRng(99)).map((c) => c.id);
    expect(a).toEqual(b);
  });

  test('lapfelirat', () => {
    expect(cardLabel({ id: 'tok-kiraly', suit: 'tok', rank: 'kiraly' })).toBe('Tök Király');
  });
});

import { createSeededRng } from '../src/game/deck';
import { chooseComputerCardForDifficulty, playComputerTurn } from '../src/game/ai';
import {
  createInitialMenuState,
  getLegalCards,
  marriageDeclarationValue,
} from '../src/game/engine';
import { GameState } from '../src/game/types';

describe('Gépi ellenfél nehézségi szintek', () => {
  function closedFollowState(): GameState {
    const base = createInitialMenuState();
    return {
      ...base,
      phase: 'playing',
      currentPlayer: 'computer',
      stock: [],
      trumpCard: null,
      trumpSuit: 'makk',
      currentTrick: [
        {
          player: 'user',
          card: { id: 'zold-asz', suit: 'zold', rank: 'asz' },
        },
      ],
      userHand: [{ id: 'piros-also', suit: 'piros', rank: 'also' }],
      computerHand: [
        { id: 'makk-also', suit: 'makk', rank: 'also' },
        { id: 'zold-felso', suit: 'zold', rank: 'felso' },
      ],
      deck: base.deck.length ? base.deck : [],
    };
  }

  function marriageLeadState(): GameState {
    const base = createInitialMenuState();
    return {
      ...base,
      phase: 'playing',
      currentPlayer: 'computer',
      currentTrick: [],
      trumpSuit: 'makk',
      stock: [],
      trumpCard: null,
      computerHand: [
        { id: 'zold-felso', suit: 'zold', rank: 'felso' },
        { id: 'zold-kiraly', suit: 'zold', rank: 'kiraly' },
        { id: 'piros-asz', suit: 'piros', rank: 'asz' },
      ],
      userHand: [{ id: 'tok-asz', suit: 'tok', rank: 'asz' }],
    };
  }

  test('minden szint csak legális lapot választ', () => {
    const state = closedFollowState();
    const rng = createSeededRng(42);

    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      const card = chooseComputerCardForDifficulty(state, difficulty, rng);
      expect(getLegalCards(state, 'computer').some((c) => c.id === card.id)).toBe(true);
    }
  });

  test('színkényszer esetén a megfelelő lap megy ki', () => {
    const state = closedFollowState();
    const next = playComputerTurn(state, 'hard', createSeededRng(7));
    expect(next.currentTrick[1].card.id).toBe('zold-felso');
  });

  test('könnyű szinten gyakran kihagyja a párbemondást', () => {
    const state = marriageLeadState();
    const rng = createSeededRng(999);
    let declared = 0;

    for (let i = 0; i < 50; i += 1) {
      const next = playComputerTurn(state, 'easy', rng);
      if (marriageDeclarationValue(state, next, 'computer') !== null) {
        declared += 1;
      }
    }

    expect(declared).toBeGreaterThan(3);
    expect(declared).toBeLessThan(30);
  });

  test('közepes szinten mindig bemondja a párt', () => {
    const state = marriageLeadState();
    const next = playComputerTurn(state, 'medium', createSeededRng(1));
    expect(marriageDeclarationValue(state, next, 'computer')).toBe(20);
  });

  test('nehéz szint végjátékban az ütő lapot választja', () => {
    const base = createInitialMenuState();
    const state: GameState = {
      ...base,
      phase: 'playing',
      currentPlayer: 'computer',
      stock: [],
      trumpCard: null,
      trumpSuit: 'makk',
      computerPoints: 40,
      userPoints: 35,
      currentTrick: [
        {
          player: 'user',
          card: { id: 'piros-also', suit: 'piros', rank: 'also' },
        },
      ],
      userHand: [{ id: 'tok-tizes', suit: 'tok', rank: 'tizes' }],
      computerHand: [
        { id: 'piros-felso', suit: 'piros', rank: 'felso' },
        { id: 'piros-kiraly', suit: 'piros', rank: 'kiraly' },
      ],
    };

    const card = chooseComputerCardForDifficulty(state, 'hard', createSeededRng(3));
    expect(card.id).toBe('piros-kiraly');
  });
});

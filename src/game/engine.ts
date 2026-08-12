import { createHungarianDeck, createSeededRng, Rng, shuffle } from './deck';
import {
  CARD_POINTS,
  Card,
  DECK_SIZE,
  GameState,
  HAND_SIZE,
  MATCH_WIN_POINTS,
  PlayMode,
  PlayerId,
  RANK_STRENGTH,
  SCHNEIDER_THRESHOLD,
  SUITS,
  Suit,
  WIN_POINTS,
  WinReason,
} from './types';

export type PlayCardOptions = {
  declareMarriage?: boolean;
};

export type StartGameOptions = {
  mode: PlayMode;
  /** Ha true, a parti pontok megmaradnak (következő játszma). */
  continueMatch?: boolean;
};

export function createInitialMenuState(): GameState {
  return {
    phase: 'menu',
    mode: null,
    deck: [],
    stock: [],
    trumpCard: null,
    trumpSuit: null,
    userHand: [],
    computerHand: [],
    currentTrick: [],
    leadPlayer: 'user',
    currentPlayer: 'user',
    drawPlayer: null,
    gamesStarted: 0,
    lastTrickWinner: null,
    userPoints: 0,
    computerPoints: 0,
    userTricksWon: 0,
    computerTricksWon: 0,
    userPendingMarriage: 0,
    computerPendingMarriage: 0,
    userMatchPoints: 0,
    computerMatchPoints: 0,
    userDealsWon: 0,
    computerDealsWon: 0,
    lastMatchAward: 0,
    winner: null,
    winReason: null,
    endDetail: '',
    message: 'Válaszd a játékmódot',
  };
}

function otherPlayer(player: PlayerId): PlayerId {
  return player === 'user' ? 'computer' : 'user';
}

function trickPoints(trick: { card: Card }[]): number {
  return trick.reduce((sum, play) => sum + CARD_POINTS[play.card.rank], 0);
}

function remainingDrawCount(state: Pick<GameState, 'stock' | 'trumpCard'>): number {
  return state.stock.length + (state.trumpCard ? 1 : 0);
}

/** Talon elfogyott: színkényszeres fázis. */
export function isClosedPhase(state: Pick<GameState, 'stock' | 'trumpCard'>): boolean {
  return remainingDrawCount(state) === 0;
}

/**
 * Zárt fázisban: ha van a kihívott színből, csak azt szabad.
 * Nyílt fázisban / híváskor: minden lap legális.
 */
export function getLegalCards(state: GameState, player: PlayerId): Card[] {
  const hand = player === 'user' ? state.userHand : state.computerHand;
  if (hand.length === 0) {
    return [];
  }

  if (!isClosedPhase(state) || state.currentTrick.length === 0) {
    return [...hand];
  }

  const ledSuit = state.currentTrick[0].card.suit;
  const matching = hand.filter((c) => c.suit === ledSuit);
  return matching.length > 0 ? matching : [...hand];
}

export function isCardPlayable(state: GameState, player: PlayerId, cardId: string): boolean {
  return getLegalCards(state, player).some((c) => c.id === cardId);
}

function findTrumpAlso(hand: Card[], trumpSuit: Suit): Card | undefined {
  return hand.find((c) => c.suit === trumpSuit && c.rank === 'also');
}

/**
 * Adu csere: a felfordított adu nem alsó, a hívó játékosnál van az adu alsója,
 * és még van talon (nyílt fázis).
 */
export function canExchangeTrump(state: GameState, player: PlayerId): boolean {
  if (state.phase !== 'playing') return false;
  if (state.currentPlayer !== player) return false;
  if (state.currentTrick.length !== 0) return false;
  if (!state.trumpCard || !state.trumpSuit) return false;
  if (state.trumpCard.rank === 'also') return false;
  if (state.stock.length === 0) return false;

  const hand = player === 'user' ? state.userHand : state.computerHand;
  return Boolean(findTrumpAlso(hand, state.trumpSuit));
}

/** Alsó ↔ felfordított adu csere. */
export function exchangeTrump(state: GameState, player: PlayerId): GameState {
  if (!canExchangeTrump(state, player)) {
    throw new Error('Most nem lehet adut cserélni');
  }

  const trumpSuit = state.trumpSuit!;
  const faceUp = state.trumpCard!;
  const hand = player === 'user' ? state.userHand : state.computerHand;
  const also = findTrumpAlso(hand, trumpSuit)!;
  const nextHand = [...hand.filter((c) => c.id !== also.id), faceUp];

  return {
    ...state,
    trumpCard: also,
    userHand: player === 'user' ? nextHand : state.userHand,
    computerHand: player === 'computer' ? nextHand : state.computerHand,
    message:
      player === 'user'
        ? 'Kicserélted az adut az alsóddal.\nTe jössz — válassz egy lapot'
        : 'A gép kicserélte az adut az alsójára.\nA gép következik…',
  };
}

export function marriagePointsForSuit(suit: Suit, trumpSuit: Suit): number {
  return suit === trumpSuit ? 40 : 20;
}

/** Színek, amelyekben megvan a felső+király pár. */
export function getMarriageSuits(hand: Card[]): Suit[] {
  return SUITS.filter(
    (suit) =>
      hand.some((c) => c.suit === suit && c.rank === 'felso') &&
      hand.some((c) => c.suit === suit && c.rank === 'kiraly'),
  );
}

/**
 * Híváskor a felső/király pár kijátszható bemondással.
 */
export function canDeclareMarriageWithCard(
  state: GameState,
  player: PlayerId,
  cardId: string,
): boolean {
  if (state.phase !== 'playing') return false;
  if (state.currentPlayer !== player) return false;
  if (state.currentTrick.length !== 0) return false;
  if (!state.trumpSuit) return false;

  const hand = player === 'user' ? state.userHand : state.computerHand;
  const card = hand.find((c) => c.id === cardId);
  if (!card) return false;
  if (card.rank !== 'felso' && card.rank !== 'kiraly') return false;
  return getMarriageSuits(hand).includes(card.suit);
}

export function isMarriageHighlightCard(
  state: GameState,
  player: PlayerId,
  cardId: string,
): boolean {
  if (state.phase !== 'playing') return false;
  if (state.currentPlayer !== player) return false;
  if (state.currentTrick.length !== 0) return false;

  const hand = player === 'user' ? state.userHand : state.computerHand;
  const card = hand.find((c) => c.id === cardId);
  if (!card) return false;
  if (card.rank !== 'felso' && card.rank !== 'kiraly') return false;
  return getMarriageSuits(hand).includes(card.suit);
}

function applyMarriageDeclaration(
  state: GameState,
  player: PlayerId,
  suit: Suit,
): GameState {
  const value = marriagePointsForSuit(suit, state.trumpSuit!);
  const tricksWon = player === 'user' ? state.userTricksWon : state.computerTricksWon;

  if (tricksWon > 0) {
    return {
      ...state,
      userPoints: state.userPoints + (player === 'user' ? value : 0),
      computerPoints: state.computerPoints + (player === 'computer' ? value : 0),
    };
  }

  return {
    ...state,
    userPendingMarriage:
      state.userPendingMarriage + (player === 'user' ? value : 0),
    computerPendingMarriage:
      state.computerPendingMarriage + (player === 'computer' ? value : 0),
  };
}

function creditPendingMarriage(state: GameState, winner: PlayerId): GameState {
  if (winner === 'user' && state.userTricksWon === 0 && state.userPendingMarriage > 0) {
    return {
      ...state,
      userPoints: state.userPoints + state.userPendingMarriage,
      userPendingMarriage: 0,
      userTricksWon: 1,
    };
  }
  if (
    winner === 'computer' &&
    state.computerTricksWon === 0 &&
    state.computerPendingMarriage > 0
  ) {
    return {
      ...state,
      computerPoints: state.computerPoints + state.computerPendingMarriage,
      computerPendingMarriage: 0,
      computerTricksWon: 1,
    };
  }

  return {
    ...state,
    userTricksWon:
      winner === 'user' ? state.userTricksWon + 1 : state.userTricksWon,
    computerTricksWon:
      winner === 'computer' ? state.computerTricksWon + 1 : state.computerTricksWon,
  };
}

/**
 * Parti-pont a vesztes állása alapján:
 * - 3: nem volt ütése
 * - 2: volt ütése, de < 33 pont
 * - 1: legalább 33 pontja volt
 */
export function calculateMatchAward(
  loserPoints: number,
  loserTricksWon: number,
): number {
  if (loserTricksWon <= 0) return 3;
  if (loserPoints < SCHNEIDER_THRESHOLD) return 2;
  return 1;
}

function buildMatchStandingText(state: {
  userDealsWon: number;
  computerDealsWon: number;
  userMatchPoints: number;
  computerMatchPoints: number;
}): string {
  return (
    `Te: ${state.userDealsWon} nyert játék, ${state.userMatchPoints} parti-pont\n` +
    `Gép: ${state.computerDealsWon} nyert játék, ${state.computerMatchPoints} parti-pont`
  );
}

function finishMatchDeal(
  state: GameState,
  winner: PlayerId,
  winReason: WinReason,
  endDetail: string,
): GameState {
  const loser: PlayerId = winner === 'user' ? 'computer' : 'user';
  const loserPoints = loser === 'user' ? state.userPoints : state.computerPoints;
  const loserTricks =
    loser === 'user' ? state.userTricksWon : state.computerTricksWon;
  const award = calculateMatchAward(loserPoints, loserTricks);

  const userMatchPoints =
    state.userMatchPoints + (winner === 'user' ? award : 0);
  const computerMatchPoints =
    state.computerMatchPoints + (winner === 'computer' ? award : 0);
  const userDealsWon = state.userDealsWon + (winner === 'user' ? 1 : 0);
  const computerDealsWon =
    state.computerDealsWon + (winner === 'computer' ? 1 : 0);

  const standing = buildMatchStandingText({
    userDealsWon,
    computerDealsWon,
    userMatchPoints,
    computerMatchPoints,
  });

  const matchOver =
    userMatchPoints >= MATCH_WIN_POINTS ||
    computerMatchPoints >= MATCH_WIN_POINTS;

  if (matchOver) {
    const userWonMatch = userMatchPoints >= MATCH_WIN_POINTS;
    return {
      ...state,
      phase: 'matchOver',
      currentTrick: [],
      drawPlayer: null,
      winner: userWonMatch ? 'user' : 'computer',
      winReason,
      lastMatchAward: award,
      userMatchPoints,
      computerMatchPoints,
      userDealsWon,
      computerDealsWon,
      message: userWonMatch ? 'Nyertél!' : 'Vesztettél!',
      endDetail:
        `${endDetail}\n` +
        `Ebben a játszmában +${award} parti-pont.\n` +
        standing,
    };
  }

  return {
    ...state,
    phase: 'matchRoundOver',
    currentTrick: [],
    drawPlayer: null,
    winner,
    winReason,
    lastMatchAward: award,
    userMatchPoints,
    computerMatchPoints,
    userDealsWon,
    computerDealsWon,
    message: winner === 'user' ? 'Megnyerted a játszmát!' : 'A gép nyerte a játszmát!',
    endDetail:
      `${endDetail}\n` +
      `+${award} parti-pont ezért a játszmáról.\n` +
      standing,
  };
}

function endGame(
  state: GameState,
  winner: PlayerId,
  winReason: WinReason,
  endDetail: string,
): GameState {
  if (state.mode === 'match') {
    return finishMatchDeal(state, winner, winReason, endDetail);
  }

  return {
    ...state,
    phase: 'gameOver',
    currentTrick: [],
    drawPlayer: null,
    winner,
    winReason,
    endDetail,
    message: winner === 'user' ? 'Nyertél' : 'Vesztettél',
  };
}

export function startNewGame(
  previous: GameState,
  rng: Rng = Math.random,
  options: StartGameOptions = { mode: previous.mode ?? 'single' },
): GameState {
  const mode = options.mode;
  const continueMatch = Boolean(options.continueMatch && mode === 'match');
  const gamesStarted = previous.gamesStarted + 1;
  const leadPlayer: PlayerId = gamesStarted % 2 === 1 ? 'user' : 'computer';

  const shuffled = shuffle(createHungarianDeck(), rng);
  if (shuffled.length !== DECK_SIZE) {
    throw new Error('Érvénytelen pakli méret osztáskor');
  }

  const userHand = shuffled.slice(0, HAND_SIZE);
  const computerHand = shuffled.slice(HAND_SIZE, HAND_SIZE * 2);
  const trumpCard = shuffled[HAND_SIZE * 2];
  const stock = shuffled.slice(HAND_SIZE * 2 + 1);
  const trumpSuit: Suit = trumpCard.suit;

  return {
    phase: 'playing',
    mode,
    deck: shuffled,
    stock,
    trumpCard,
    trumpSuit,
    userHand,
    computerHand,
    currentTrick: [],
    leadPlayer,
    currentPlayer: leadPlayer,
    drawPlayer: null,
    gamesStarted,
    lastTrickWinner: null,
    userPoints: 0,
    computerPoints: 0,
    userTricksWon: 0,
    computerTricksWon: 0,
    userPendingMarriage: 0,
    computerPendingMarriage: 0,
    userMatchPoints: continueMatch ? previous.userMatchPoints : 0,
    computerMatchPoints: continueMatch ? previous.computerMatchPoints : 0,
    userDealsWon: continueMatch ? previous.userDealsWon : 0,
    computerDealsWon: continueMatch ? previous.computerDealsWon : 0,
    lastMatchAward: 0,
    winner: null,
    winReason: null,
    endDetail: '',
    message:
      leadPlayer === 'user'
        ? 'Te kezdesz — válassz egy lapot'
        : 'A gép kezd',
  };
}

export function startSingleGame(
  previous: GameState,
  rng: Rng = Math.random,
): GameState {
  return startNewGame(previous, rng, { mode: 'single' });
}

export function startMatch(
  previous: GameState,
  rng: Rng = Math.random,
): GameState {
  return startNewGame(previous, rng, { mode: 'match', continueMatch: false });
}

export function continueMatch(
  previous: GameState,
  rng: Rng = Math.random,
): GameState {
  return startNewGame(previous, rng, { mode: 'match', continueMatch: true });
}

export function startNewGameWithSeed(
  previous: GameState,
  seed: number,
  options?: StartGameOptions,
): GameState {
  return startNewGame(previous, createSeededRng(seed), options);
}

function removeCardFromHand(hand: Card[], cardId: string): Card[] {
  const index = hand.findIndex((c) => c.id === cardId);
  if (index === -1) {
    throw new Error(`A lap nincs a kézben: ${cardId}`);
  }
  return [...hand.slice(0, index), ...hand.slice(index + 1)];
}

export function decideTrickWinner(
  lead: { player: PlayerId; card: Card },
  follow: { player: PlayerId; card: Card },
  trumpSuit: Suit,
): PlayerId {
  const leadCard = lead.card;
  const followCard = follow.card;

  const leadIsTrump = leadCard.suit === trumpSuit;
  const followIsTrump = followCard.suit === trumpSuit;

  if (leadIsTrump && followIsTrump) {
    return RANK_STRENGTH[followCard.rank] > RANK_STRENGTH[leadCard.rank]
      ? follow.player
      : lead.player;
  }

  if (!leadIsTrump && followIsTrump) {
    return follow.player;
  }

  if (leadIsTrump && !followIsTrump) {
    return lead.player;
  }

  if (followCard.suit === leadCard.suit) {
    return RANK_STRENGTH[followCard.rank] > RANK_STRENGTH[leadCard.rank]
      ? follow.player
      : lead.player;
  }

  return lead.player;
}

/** Pontok kiosztása; a lapok az asztalon maradnak. */
export function resolveTrick(state: GameState): GameState {
  if (state.currentTrick.length !== 2 || !state.trumpSuit) {
    throw new Error('Nem lehet ütést értékelni');
  }

  const [first, second] = state.currentTrick;
  const winner = decideTrickWinner(first, second, state.trumpSuit);
  const points = trickPoints(state.currentTrick);

  let scored: GameState = {
    ...state,
    lastTrickWinner: winner,
    leadPlayer: winner,
    currentPlayer: winner,
    drawPlayer: null,
    userPoints: state.userPoints + (winner === 'user' ? points : 0),
    computerPoints: state.computerPoints + (winner === 'computer' ? points : 0),
  };
  scored = creditPendingMarriage(scored, winner);

  if (remainingDrawCount(scored) > 0) {
    return {
      ...scored,
      phase: 'awaitingDraw',
      drawPlayer: winner,
      message:
        winner === 'user'
          ? 'Nyerted az ütést.\nNyomd meg a paklit a húzáshoz'
          : 'A gép vitte az ütést.\nHúz a pakliból…',
    };
  }

  return {
    ...scored,
    phase: 'awaitingContinue',
    drawPlayer: null,
    message:
      winner === 'user'
        ? 'Te vitted az ütést.\nKoppints az asztalra a folytatáshoz'
        : 'A gép vitte az ütést.\nKoppints az asztalra a folytatáshoz',
  };
}

export function playCard(
  state: GameState,
  player: PlayerId,
  cardId: string,
  options: PlayCardOptions = {},
): GameState {
  if (state.phase !== 'playing') {
    throw new Error('Most nem lehet lapot kijátszani');
  }
  if (state.currentPlayer !== player) {
    throw new Error('Nem a te köröd van');
  }
  if (state.currentTrick.length >= 2) {
    throw new Error('Az ütés már tele van');
  }

  const hand = player === 'user' ? state.userHand : state.computerHand;
  const card = hand.find((c) => c.id === cardId);
  if (!card) {
    throw new Error('Érvénytelen lap a kijátszáshoz');
  }
  if (!isCardPlayable(state, player, cardId)) {
    throw new Error('Ezt a lapot most nem szabad kijátszani (színkényszer)');
  }

  const declareMarriage = Boolean(options.declareMarriage);
  if (declareMarriage && !canDeclareMarriageWithCard(state, player, cardId)) {
    throw new Error('Ezzel a lappal most nem lehet párt bemondani');
  }

  let working = state;
  let marriageValue = 0;
  if (declareMarriage) {
    marriageValue = marriagePointsForSuit(card.suit, state.trumpSuit!);
    working = applyMarriageDeclaration(state, player, card.suit);
  }

  const nextHand = removeCardFromHand(
    player === 'user' ? working.userHand : working.computerHand,
    cardId,
  );
  const currentTrick = [...working.currentTrick, { player, card }];
  const trickComplete = currentTrick.length === 2;

  const marriageNote =
    declareMarriage && player === 'computer'
      ? `A gép bejelentette a ${marriageValue}-et!\n`
      : declareMarriage && player === 'user'
        ? `Bemondtad a ${marriageValue}-et.\n`
        : '';

  const afterPlay: GameState = {
    ...working,
    userHand: player === 'user' ? nextHand : working.userHand,
    computerHand: player === 'computer' ? nextHand : working.computerHand,
    currentTrick,
    currentPlayer: trickComplete ? working.currentPlayer : otherPlayer(player),
    message: trickComplete
      ? `${marriageNote}Ütés vége`.trim()
      : player === 'user'
        ? `${marriageNote}A gép következik…`.trim()
        : `${marriageNote}Te jössz — válassz egy lapot`.trim(),
  };

  if (trickComplete) {
    return resolveTrick(afterPlay);
  }

  return afterPlay;
}

function takeNextDrawCard(state: GameState): { card: Card; stock: Card[]; trumpCard: Card | null } {
  if (state.stock.length > 0) {
    const [card, ...rest] = state.stock;
    return { card, stock: rest, trumpCard: state.trumpCard };
  }

  if (state.trumpCard) {
    return { card: state.trumpCard, stock: [], trumpCard: null };
  }

  throw new Error('Nincs több húzható lap');
}

function applyDraw(state: GameState, player: PlayerId): GameState {
  const { card, stock, trumpCard } = takeNextDrawCard(state);
  return {
    ...state,
    stock,
    trumpCard,
    userHand: player === 'user' ? [...state.userHand, card] : state.userHand,
    computerHand:
      player === 'computer' ? [...state.computerHand, card] : state.computerHand,
  };
}

export function canDraw(state: GameState): boolean {
  return (
    state.phase === 'awaitingDraw' &&
    state.drawPlayer !== null &&
    remainingDrawCount(state) > 0
  );
}

export function canUserDraw(state: GameState): boolean {
  return canDraw(state) && state.drawPlayer === 'user';
}

export function canContinueAfterTrick(state: GameState): boolean {
  return state.phase === 'awaitingContinue';
}

export function canClaimSixtySix(state: GameState): boolean {
  return (
    state.phase === 'playing' &&
    state.currentPlayer === 'user' &&
    state.currentTrick.length === 0 &&
    state.userPoints >= WIN_POINTS
  );
}

export function claimSixtySix(state: GameState): GameState {
  if (!canClaimSixtySix(state)) {
    throw new Error('Most nem lehet 66-tal megállni');
  }
  return endGame(state, 'user', 'reached66', 'Elérted a 66 pontot.');
}

export function beginNextRound(state: GameState): GameState {
  const winner = state.lastTrickWinner;
  if (!winner) {
    throw new Error('Nincs ütésgyőztes');
  }

  const cleared: GameState = {
    ...state,
    currentTrick: [],
    drawPlayer: null,
  };

  if (cleared.userHand.length === 0 && cleared.computerHand.length === 0) {
    return endGame(
      cleared,
      winner,
      'lastTrick',
      winner === 'user'
        ? 'Az utolsó ütést te vitted.'
        : 'A gép vitte az utolsó ütést.',
    );
  }

  if (winner === 'computer' && cleared.computerPoints >= WIN_POINTS) {
    return endGame(
      cleared,
      'computer',
      'reached66',
      'A gép elérte a 66 pontot.',
    );
  }

  if (winner === 'user' && cleared.userPoints >= WIN_POINTS) {
    return {
      ...cleared,
      phase: 'playing',
      currentPlayer: 'user',
      leadPlayer: 'user',
      message: 'Elérted a 66-ot — megállhatsz, vagy folytathatod',
    };
  }

  return {
    ...cleared,
    phase: 'playing',
    currentPlayer: winner,
    leadPlayer: winner,
    message: isClosedPhase(cleared)
      ? winner === 'user'
        ? 'Talon elfogyott — színre színt kell tenni.\nTe jössz'
        : 'Talon elfogyott — színre színt kell tenni.\nA gép következik…'
      : winner === 'user'
        ? 'Te jössz — válassz egy lapot'
        : 'A gép következik…',
  };
}

export function continueAfterTrick(state: GameState): GameState {
  if (!canContinueAfterTrick(state)) {
    throw new Error('Most nem lehet folytatni');
  }
  return beginNextRound(state);
}

/**
 * Húzás. A lapok az asztalon maradnak, amíg a user nem húz
 * (vagy amíg a user húzása után le nem zárul a kör).
 */
export function drawCard(state: GameState, player: PlayerId): GameState {
  if (!canDraw(state)) {
    throw new Error('Most nem lehet húzni');
  }
  if (state.drawPlayer !== player) {
    throw new Error('Nem te húzol most');
  }

  const winner = state.lastTrickWinner!;
  const loser = otherPlayer(winner);
  let next = applyDraw(state, player);

  if (player === winner) {
    if (remainingDrawCount(next) > 0) {
      // User győzött és húzott: a gép azonnal húz, majd új kör (asztal törlése).
      if (loser === 'computer') {
        next = applyDraw({ ...next, drawPlayer: 'computer' }, 'computer');
        return beginNextRound(next);
      }

      // Gép győzött és húzott: várjuk a user húzását, lapok kint maradnak.
      return {
        ...next,
        drawPlayer: 'user',
        message: 'A gép vitte az ütést.\nNyomd meg a paklit a húzáshoz',
      };
    }

    if (player === 'user') {
      return beginNextRound(next);
    }

    return {
      ...next,
      phase: 'awaitingContinue',
      drawPlayer: null,
      message: 'A gép vitte az ütést.\nKoppints az asztalra a folytatáshoz',
    };
  }

  // Vesztes (user) húzott a gép után → új kör
  return beginNextRound(next);
}

export function canUserPlay(state: GameState): boolean {
  return (
    state.phase === 'playing' &&
    state.currentPlayer === 'user' &&
    state.currentTrick.length < 2
  );
}

export function hasDrawableCards(state: GameState): boolean {
  return remainingDrawCount(state) > 0;
}

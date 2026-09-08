export type Suit = 'piros' | 'tok' | 'zold' | 'makk';
export type Rank = 'also' | 'felso' | 'kiraly' | 'tizes' | 'asz';
export type PlayerId = 'user' | 'computer';
export type WinReason = 'reached66' | 'lastTrick' | 'takarasFailed';
export type PlayMode = 'single' | 'match';

export type Card = {
  id: string;
  suit: Suit;
  rank: Rank;
};

export type TrickPlay = {
  player: PlayerId;
  card: Card;
};

export type GamePhase =
  | 'menu'
  | 'playing'
  | 'awaitingDraw'
  | 'awaitingContinue'
  | 'gameOver'
  | 'matchRoundOver'
  | 'matchOver';

export type GameState = {
  phase: GamePhase;
  mode: PlayMode | null;
  deck: Card[];
  stock: Card[];
  trumpCard: Card | null;
  trumpSuit: Suit | null;
  userHand: Card[];
  computerHand: Card[];
  currentTrick: TrickPlay[];
  leadPlayer: PlayerId;
  currentPlayer: PlayerId;
  drawPlayer: PlayerId | null;
  gamesStarted: number;
  lastTrickWinner: PlayerId | null;
  userPoints: number;
  computerPoints: number;
  userTricksWon: number;
  computerTricksWon: number;
  userPendingMarriage: number;
  computerPendingMarriage: number;
  userMatchPoints: number;
  computerMatchPoints: number;
  userDealsWon: number;
  computerDealsWon: number;
  lastMatchAward: number;
  winner: PlayerId | null;
  winReason: WinReason | null;
  endDetail: string;
  message: string;
  /** A játékos takarást hirdetett — nincs húzás, minden ütésnek az övének kell lennie. */
  takarasActive: boolean;
};

export const SUITS: Suit[] = ['piros', 'tok', 'zold', 'makk'];
export const RANKS: Rank[] = ['also', 'felso', 'kiraly', 'tizes', 'asz'];

export const SUIT_LABELS: Record<Suit, string> = {
  piros: 'Piros',
  tok: 'Tök',
  zold: 'Zöld',
  makk: 'Makk',
};

export const RANK_LABELS: Record<Rank, string> = {
  also: 'Alsó',
  felso: 'Felső',
  kiraly: 'Király',
  tizes: 'Tízes',
  asz: 'Ász',
};

export const RANK_STRENGTH: Record<Rank, number> = {
  also: 1,
  felso: 2,
  kiraly: 3,
  tizes: 4,
  asz: 5,
};

export const CARD_POINTS: Record<Rank, number> = {
  also: 2,
  felso: 3,
  kiraly: 4,
  tizes: 10,
  asz: 11,
};

export const HAND_SIZE = 5;
export const DECK_SIZE = 20;
export const WIN_POINTS = 66;
export const MATCH_WIN_POINTS = 7;
export const SCHNEIDER_THRESHOLD = 33;
export const COMPUTER_MOVE_DELAY_MS = 900;
export const COMPUTER_DRAW_DELAY_MS = 650;

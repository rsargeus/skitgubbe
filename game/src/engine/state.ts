import { Card, createDeck, value } from './cards';
import { Rng, seededRng, shuffle } from './random';

export type PlayerId = number;

export type Player = {
  id: PlayerId;
  name: string;
  isBot: boolean;
  hand: Card[];
  öppnaBordskort: Card[];
  doldaBordskort: Card[];
  /** Set when the player has played every card in all three zones. */
  finishedAt: number | null;
};

export type GameState = {
  players: Player[];
  högen: Card[];
  dragstapeln: Card[];
  /** Cards removed from play for good: burned by a 10 or by fyra lika. */
  removed: Card[];
  /** Every card that has been face up in front of everyone. */
  seddaKort: Card[];
  turn: PlayerId;
  /** Whether the current player has already chansat this turn. */
  hasChansatThisTurn: boolean;
  /** Finishing order, filled as players run out. The last one left is the skitgubbe. */
  finishOrder: PlayerId[];
  seed: number;
};

export const HAND_SIZE = 3;
export const TABLE_SIZE = 3;

export type DealOptions = {
  playerNames: string[];
  /** Index into playerNames of the one human. Everyone else is a bot. */
  humanIndex?: number;
  seed?: number;
};

export function createGame({ playerNames, humanIndex = 0, seed = Date.now() }: DealOptions): GameState {
  if (playerNames.length < 2 || playerNames.length > 6) {
    throw new Error(`Skitgubbe is for 2 to 6 players, got ${playerNames.length}`);
  }

  const rng: Rng = seededRng(seed);
  const deck = shuffle(createDeck(), rng);

  const players: Player[] = playerNames.map((name, id) => ({
    id,
    name,
    isBot: id !== humanIndex,
    hand: [],
    öppnaBordskort: [],
    doldaBordskort: [],
    finishedAt: null,
  }));

  // Deal the way it is dealt at a table: hidden first, then face up, then hands.
  for (let i = 0; i < TABLE_SIZE; i++) {
    for (const player of players) player.doldaBordskort.push(deck.pop()!);
  }
  for (let i = 0; i < TABLE_SIZE; i++) {
    for (const player of players) player.öppnaBordskort.push(deck.pop()!);
  }
  for (let i = 0; i < HAND_SIZE; i++) {
    for (const player of players) player.hand.push(deck.pop()!);
  }

  return {
    players,
    högen: [],
    dragstapeln: deck,
    removed: [],
    seddaKort: [],
    turn: startingPlayer(players),
    hasChansatThisTurn: false,
    finishOrder: [],
    seed,
  };
}

/**
 * The player holding the lowest hand card starts. Ties are broken on the next
 * lowest card, and so on; a dead tie falls back to the lowest seat number.
 */
export function startingPlayer(players: Player[]): PlayerId {
  const ranked = players.map((player) => ({
    id: player.id,
    sorted: player.hand.map((c) => value(c.rank)).sort((a, b) => a - b),
  }));

  ranked.sort((a, b) => {
    for (let i = 0; i < Math.max(a.sorted.length, b.sorted.length); i++) {
      const av = a.sorted[i] ?? Infinity;
      const bv = b.sorted[i] ?? Infinity;
      if (av !== bv) return av - bv;
    }
    return a.id - b.id;
  });

  return ranked[0].id;
}

export function playerById(state: GameState, id: PlayerId): Player {
  const player = state.players.find((p) => p.id === id);
  if (!player) throw new Error(`No player ${id}`);
  return player;
}

export function isFinished(player: Player): boolean {
  return player.hand.length === 0 && player.öppnaBordskort.length === 0 && player.doldaBordskort.length === 0;
}

/** The zone the player must play from right now. */
export function activeZone(player: Player): 'hand' | 'öppna' | 'dolda' | 'done' {
  if (player.hand.length > 0) return 'hand';
  if (player.öppnaBordskort.length > 0) return 'öppna';
  if (player.doldaBordskort.length > 0) return 'dolda';
  return 'done';
}

/** Seat order, skipping players who are already out. */
export function nextPlayer(state: GameState, from: PlayerId): PlayerId {
  const count = state.players.length;
  for (let step = 1; step <= count; step++) {
    const candidate = (from + step) % count;
    if (state.players[candidate].finishedAt === null) return candidate;
  }
  return from;
}

export function activePlayers(state: GameState): Player[] {
  return state.players.filter((p) => p.finishedAt === null);
}

export function gameIsOver(state: GameState): boolean {
  return activePlayers(state).length <= 1;
}

/** The loser: the one player still holding cards when everyone else is out. */
export function skitgubbe(state: GameState): PlayerId | null {
  if (!gameIsOver(state)) return null;
  const remaining = activePlayers(state);
  return remaining.length === 1 ? remaining[0].id : null;
}

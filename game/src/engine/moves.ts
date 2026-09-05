import { Card, Rank, cardId } from './cards';
import {
  canPlayOn,
  groupByRank,
  isForbiddenFinisher,
  makesFyraLika,
} from './rules';
import {
  GameState,
  Player,
  PlayerId,
  activeZone,
  gameIsOver,
  isFinished,
  nextPlayer,
  playerById,
} from './state';

export type Move =
  | { type: 'play'; rank: Rank; count: number }
  | { type: 'vänd'; index: number }
  | { type: 'ta-högen' }
  | { type: 'chansa' }
  | { type: 'stå-över' };

/** What happened, for the status line and for pacing. */
export type GameEvent =
  | { type: 'played'; player: PlayerId; cards: Card[] }
  | { type: 'vände'; player: PlayerId; card: Card; success: boolean }
  | { type: 'chansade'; player: PlayerId; card: Card; success: boolean }
  | { type: 'tog-högen'; player: PlayerId; count: number }
  | { type: 'stod-över'; player: PlayerId }
  | { type: 'brände-högen'; player: PlayerId; reason: 'tia' | 'fyra-lika'; count: number }
  | { type: 'klar'; player: PlayerId; place: number }
  | { type: 'slut'; skitgubbe: PlayerId };

export type MoveResult = {
  state: GameState;
  events: GameEvent[];
};

function clone(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map((p) => ({
      ...p,
      hand: [...p.hand],
      öppnaBordskort: [...p.öppnaBordskort],
      doldaBordskort: [...p.doldaBordskort],
    })),
    högen: [...state.högen],
    dragstapeln: [...state.dragstapeln],
    removed: [...state.removed],
    seddaKort: [...state.seddaKort],
    finishOrder: [...state.finishOrder],
  };
}

/** Cards a player could lay from the zone they are currently forced to use. */
export function legalPlays(state: GameState, id: PlayerId): { rank: Rank; maxCount: number }[] {
  const player = playerById(state, id);
  const zone = activeZone(player);
  if (zone === 'dolda' || zone === 'done') return [];

  const cards = zone === 'hand' ? player.hand : player.öppnaBordskort;
  const plays: { rank: Rank; maxCount: number }[] = [];

  for (const [rank, group] of groupByRank(cards)) {
    if (!canPlayOn(state.högen, rank)) continue;
    // A play that would empty the player's last zone must not be a forbidden
    // finisher: no ending on an A, a 2, a 10, or on fyra lika.
    const wouldFinish = wouldEmptyEverything(player, zone, group.length);
    if (wouldFinish && isForbiddenFinisher(rank)) continue;
    if (wouldFinish && makesFyraLika([...state.högen, ...group])) continue;
    plays.push({ rank, maxCount: group.length });
  }

  return plays;
}

function wouldEmptyEverything(player: Player, zone: 'hand' | 'öppna', count: number): boolean {
  if (zone === 'hand') {
    // Playing from the hand only finishes the player if nothing is left behind.
    return (
      player.hand.length === count &&
      player.öppnaBordskort.length === 0 &&
      player.doldaBordskort.length === 0
    );
  }
  return player.öppnaBordskort.length === count && player.doldaBordskort.length === 0;
}

export function canChansa(state: GameState, id: PlayerId): boolean {
  const player = playerById(state, id);
  if (state.hasChansatThisTurn) return false;
  if (state.dragstapeln.length === 0) return false;
  // Chansa is a hand-phase move: once you are down to table cards there is
  // nothing left to draw into.
  return activeZone(player) === 'hand';
}

export function legalMoves(state: GameState, id: PlayerId): Move[] {
  const player = playerById(state, id);
  const zone = activeZone(player);
  const moves: Move[] = [];

  if (zone === 'dolda') {
    for (let i = 0; i < player.doldaBordskort.length; i++) moves.push({ type: 'vänd', index: i });
    return moves;
  }

  for (const play of legalPlays(state, id)) {
    for (let count = 1; count <= play.maxCount; count++) {
      moves.push({ type: 'play', rank: play.rank, count });
    }
  }

  if (canChansa(state, id)) moves.push({ type: 'chansa' });

  if (state.högen.length > 0) moves.push({ type: 'ta-högen' });
  else if (moves.length === 0) moves.push({ type: 'stå-över' });

  return moves;
}

export function applyMove(state: GameState, move: Move): MoveResult {
  const next = clone(state);
  const events: GameEvent[] = [];
  const player = playerById(next, next.turn);

  switch (move.type) {
    case 'play':
      playCards(next, player, move, events);
      break;
    case 'vänd':
      vändDoltBordskort(next, player, move.index, events);
      break;
    case 'ta-högen':
      taHögen(next, player, events);
      break;
    case 'chansa':
      chansa(next, player, events);
      break;
    case 'stå-över':
      events.push({ type: 'stod-över', player: player.id });
      endTurn(next, player, events);
      break;
  }

  return { state: next, events };
}

function playCards(state: GameState, player: Player, move: { rank: Rank; count: number }, events: GameEvent[]): void {
  const zone = activeZone(player);
  const source = zone === 'hand' ? player.hand : player.öppnaBordskort;
  const picked = source.filter((c) => c.rank === move.rank).slice(0, move.count);

  if (picked.length !== move.count) throw new Error(`Cannot play ${move.count}×${move.rank} from ${zone}`);
  if (!canPlayOn(state.högen, move.rank)) throw new Error(`${move.rank} cannot be played on this högen`);

  const pickedIds = new Set(picked.map(cardId));
  const remaining = source.filter((c) => !pickedIds.has(cardId(c)));
  if (zone === 'hand') player.hand = remaining;
  else player.öppnaBordskort = remaining;

  state.högen.push(...picked);
  state.seddaKort.push(...picked);
  events.push({ type: 'played', player: player.id, cards: picked });

  if (zone === 'hand') refillHand(state, player);

  const playAgain = resolveBurn(state, player, move.rank, events);
  finishTurn(state, player, playAgain, events);
}

function vändDoltBordskort(state: GameState, player: Player, index: number, events: GameEvent[]): void {
  const card = player.doldaBordskort[index];
  if (!card) throw new Error(`No dolt bordskort at ${index}`);
  player.doldaBordskort = player.doldaBordskort.filter((_, i) => i !== index);
  state.seddaKort.push(card);

  const lastCard = player.hand.length === 0 && player.öppnaBordskort.length === 0 && player.doldaBordskort.length === 0;
  const forbidden = lastCard && isForbiddenFinisher(card.rank);
  const playable = canPlayOn(state.högen, card.rank) && !forbidden;

  events.push({ type: 'vände', player: player.id, card, success: playable });

  if (!playable) {
    // Too low, or a card you are not allowed to finish on: it comes back with
    // the whole pile.
    player.hand.push(card, ...state.högen);
    const taken = state.högen.length;
    state.högen = [];
    if (taken > 0) events.push({ type: 'tog-högen', player: player.id, count: taken });
    endTurn(state, player, events);
    return;
  }

  state.högen.push(card);
  const playAgain = resolveBurn(state, player, card.rank, events);
  finishTurn(state, player, playAgain, events);
}

function taHögen(state: GameState, player: Player, events: GameEvent[]): void {
  const count = state.högen.length;
  player.hand.push(...state.högen);
  state.högen = [];
  events.push({ type: 'tog-högen', player: player.id, count });
  endTurn(state, player, events);
}

function chansa(state: GameState, player: Player, events: GameEvent[]): void {
  const card = state.dragstapeln.pop();
  if (!card) throw new Error('Cannot chansa with an empty dragstapel');

  state.hasChansatThisTurn = true;
  state.seddaKort.push(card);

  const success = canPlayOn(state.högen, card.rank);
  events.push({ type: 'chansade', player: player.id, card, success });

  if (!success) {
    // A failed chansa costs you the pile, even if your hand was full of cards
    // you could have played instead.
    player.hand.push(card, ...state.högen);
    state.högen = [];
    endTurn(state, player, events);
    return;
  }

  state.högen.push(card);
  const playAgain = resolveBurn(state, player, card.rank, events);
  finishTurn(state, player, playAgain, events);
}

/**
 * A 10 or fyra lika removes högen from play and hands the same player another
 * turn. Returns whether the player plays again.
 */
function resolveBurn(state: GameState, player: Player, rank: Rank, events: GameEvent[]): boolean {
  if (rank === '10') {
    const count = state.högen.length;
    state.removed.push(...state.högen);
    state.högen = [];
    events.push({ type: 'brände-högen', player: player.id, reason: 'tia', count });
    return true;
  }

  if (makesFyraLika(state.högen)) {
    const count = state.högen.length;
    state.removed.push(...state.högen);
    state.högen = [];
    events.push({ type: 'brände-högen', player: player.id, reason: 'fyra-lika', count });
    return true;
  }

  return false;
}

function refillHand(state: GameState, player: Player): void {
  while (player.hand.length < 3 && state.dragstapeln.length > 0) {
    player.hand.push(state.dragstapeln.pop()!);
  }
}

function finishTurn(state: GameState, player: Player, playAgain: boolean, events: GameEvent[]): void {
  if (markFinished(state, player, events)) {
    endTurn(state, player, events);
    return;
  }
  if (playAgain) {
    state.hasChansatThisTurn = false;
    return;
  }
  endTurn(state, player, events);
}

function markFinished(state: GameState, player: Player, events: GameEvent[]): boolean {
  if (player.finishedAt !== null || !isFinished(player)) return false;
  player.finishedAt = state.finishOrder.length;
  state.finishOrder.push(player.id);
  events.push({ type: 'klar', player: player.id, place: state.finishOrder.length });
  return true;
}

function endTurn(state: GameState, player: Player, events: GameEvent[]): void {
  markFinished(state, player, events);
  state.hasChansatThisTurn = false;

  if (gameIsOver(state)) {
    const remaining = state.players.filter((p) => p.finishedAt === null);
    if (remaining.length === 1) events.push({ type: 'slut', skitgubbe: remaining[0].id });
    return;
  }

  state.turn = nextPlayer(state, player.id);
}

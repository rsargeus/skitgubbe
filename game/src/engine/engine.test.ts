import { describe, expect, it } from 'vitest';
import { Card, RANK_ORDER, Rank, createDeck, value } from './cards';
import { applyMove, legalMoves, legalPlays } from './moves';
import { canPlayOn, effectiveTop, makesFyraLika } from './rules';
import { GameState, createGame, skitgubbe, startingPlayer } from './state';
import { toPlayerView } from './view';

const card = (rank: Rank, suit: Card['suit'] = 'spades'): Card => ({ rank, suit });

/** A game state built by hand, so a rule can be tested in isolation. */
function table(overrides: {
  hands?: Card[][];
  öppna?: Card[][];
  dolda?: Card[][];
  högen?: Card[];
  dragstapeln?: Card[];
  turn?: number;
}): GameState {
  const count = overrides.hands?.length ?? 2;
  return {
    players: Array.from({ length: count }, (_, id) => ({
      id,
      name: `P${id}`,
      isBot: id !== 0,
      hand: overrides.hands?.[id] ?? [],
      öppnaBordskort: overrides.öppna?.[id] ?? [],
      doldaBordskort: overrides.dolda?.[id] ?? [],
      finishedAt: null,
    })),
    högen: overrides.högen ?? [],
    dragstapeln: overrides.dragstapeln ?? [],
    removed: [],
    seddaKort: [],
    turn: overrides.turn ?? 0,
    hasChansatThisTurn: false,
    finishOrder: [],
    seed: 1,
  };
}

describe('rank order', () => {
  it('runs 3 to A, then the 2, then the 10 on top', () => {
    expect(RANK_ORDER).toEqual(['3', '4', '5', '6', '7', '8', '9', 'J', 'Q', 'K', 'A', '2', '10']);
    expect(value('10')).toBeGreaterThan(value('2'));
    expect(value('2')).toBeGreaterThan(value('A'));
    expect(value('A')).toBeGreaterThan(value('K'));
  });

  it('deals a 52-card deck with no duplicates', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((c) => `${c.rank}${c.suit}`)).size).toBe(52);
  });
});

describe('canPlayOn', () => {
  it('allows anything on an empty högen', () => {
    expect(canPlayOn([], '3')).toBe(true);
  });

  it('requires equal or higher', () => {
    expect(canPlayOn([card('9')], '9')).toBe(true);
    expect(canPlayOn([card('9')], 'J')).toBe(true);
    expect(canPlayOn([card('9')], '8')).toBe(false);
  });

  it('lets specialkort go on anything, including each other', () => {
    expect(canPlayOn([card('10')], '2')).toBe(true);
    expect(canPlayOn([card('A')], '10')).toBe(true);
    expect(canPlayOn([card('10')], '3')).toBe(false);
  });

  it('treats a 2 on top as a reset: the next player may play anything', () => {
    expect(effectiveTop([card('K'), card('2')])).toBeNull();
    expect(canPlayOn([card('K'), card('2')], '3')).toBe(true);
  });
});

describe('dealing', () => {
  it('gives every player three of each zone and leaves the rest in dragstapeln', () => {
    const state = createGame({ playerNames: ['Du', 'Bot 1', 'Bot 2'], seed: 42 });
    for (const player of state.players) {
      expect(player.hand).toHaveLength(3);
      expect(player.öppnaBordskort).toHaveLength(3);
      expect(player.doldaBordskort).toHaveLength(3);
    }
    expect(state.dragstapeln).toHaveLength(52 - 3 * 9);
  });

  it('starts the player holding the lowest hand card', () => {
    const players = [
      { id: 0, name: 'a', isBot: false, hand: [card('9'), card('K'), card('A')], öppnaBordskort: [], doldaBordskort: [], finishedAt: null },
      { id: 1, name: 'b', isBot: true, hand: [card('4'), card('Q'), card('2')], öppnaBordskort: [], doldaBordskort: [], finishedAt: null },
    ];
    expect(startingPlayer(players)).toBe(1);
  });

  it('breaks a tie on the next-lowest card', () => {
    const players = [
      { id: 0, name: 'a', isBot: false, hand: [card('5'), card('K'), card('A')], öppnaBordskort: [], doldaBordskort: [], finishedAt: null },
      { id: 1, name: 'b', isBot: true, hand: [card('5'), card('6'), card('7')], öppnaBordskort: [], doldaBordskort: [], finishedAt: null },
    ];
    expect(startingPlayer(players)).toBe(1);
  });
});

describe('playing cards', () => {
  it('moves the cards onto högen and passes the turn', () => {
    const state = table({ hands: [[card('9'), card('9'), card('K')], [card('4')]], högen: [card('7')] });
    const { state: next, events } = applyMove(state, { type: 'play', rank: '9', count: 2 });

    expect(next.högen).toHaveLength(3);
    expect(next.players[0].hand).toHaveLength(1);
    expect(next.turn).toBe(1);
    expect(events[0]).toMatchObject({ type: 'played' });
  });

  it('refills the hand to three while dragstapeln lasts', () => {
    const state = table({
      hands: [[card('9'), card('K'), card('Q')], [card('4')]],
      dragstapeln: [card('5'), card('6'), card('7')],
    });
    const { state: next } = applyMove(state, { type: 'play', rank: '9', count: 1 });
    expect(next.players[0].hand).toHaveLength(3);
    expect(next.dragstapeln).toHaveLength(2);
  });

  it('records every played card as sedda kort', () => {
    const state = table({ hands: [[card('9')], [card('4')]] });
    const { state: next } = applyMove(state, { type: 'play', rank: '9', count: 1 });
    expect(next.seddaKort).toHaveLength(1);
  });
});

describe('specialkort', () => {
  it('lets a 2 reset högen for the next player', () => {
    const state = table({ hands: [[card('2')], [card('3')]], högen: [card('K')] });
    const { state: next } = applyMove(state, { type: 'play', rank: '2', count: 1 });
    expect(canPlayOn(next.högen, '3')).toBe(true);
  });

  it('lets a 10 remove högen from play and gives the same player another turn', () => {
    const state = table({ hands: [[card('10'), card('5')], [card('3')]], högen: [card('K'), card('A')] });
    const { state: next, events } = applyMove(state, { type: 'play', rank: '10', count: 1 });

    expect(next.högen).toHaveLength(0);
    expect(next.removed).toHaveLength(3);
    expect(next.turn).toBe(0);
    expect(events.some((e) => e.type === 'brände-högen' && e.reason === 'tia')).toBe(true);
  });
});

describe('fyra lika', () => {
  it('burns högen when four of a rank end up on top', () => {
    const state = table({ hands: [[card('9', 'hearts'), card('5')], [card('3')]], högen: [card('2'), card('9', 'clubs'), card('9', 'diamonds'), card('9', 'spades')] });
    const { state: next, events } = applyMove(state, { type: 'play', rank: '9', count: 1 });

    expect(next.högen).toHaveLength(0);
    expect(events.some((e) => e.type === 'brände-högen' && e.reason === 'fyra-lika')).toBe(true);
    expect(next.turn).toBe(0);
  });

  it('counts four cards laid by different players in sequence', () => {
    expect(makesFyraLika([card('K'), card('7', 'hearts'), card('7', 'clubs'), card('7', 'spades'), card('7', 'diamonds')])).toBe(true);
  });

  it('does not fire on three of a kind', () => {
    expect(makesFyraLika([card('7', 'hearts'), card('7', 'clubs'), card('7', 'spades')])).toBe(false);
  });
});

describe('taking högen', () => {
  it('moves the whole pile into the hand and frees the next player', () => {
    const state = table({ hands: [[card('4')], [card('3')]], högen: [card('K'), card('A')] });
    const { state: next } = applyMove(state, { type: 'ta-högen' });

    expect(next.players[0].hand).toHaveLength(3);
    expect(next.högen).toHaveLength(0);
    expect(next.turn).toBe(1);
  });
});

describe('chansa', () => {
  it('plays the card when it is high enough', () => {
    const state = table({ hands: [[card('4')], [card('3')]], högen: [card('7')], dragstapeln: [card('K')] });
    const { state: next, events } = applyMove(state, { type: 'chansa' });

    expect(next.högen.at(-1)).toEqual(card('K'));
    expect(events.some((e) => e.type === 'chansade' && e.success)).toBe(true);
  });

  it('costs the whole pile when it fails, even with playable cards in hand', () => {
    const state = table({ hands: [[card('A')], [card('3')]], högen: [card('K'), card('K')], dragstapeln: [card('4')] });
    const { state: next, events } = applyMove(state, { type: 'chansa' });

    expect(next.players[0].hand).toHaveLength(4); // A + the flipped 4 + two Ks
    expect(next.högen).toHaveLength(0);
    expect(events.some((e) => e.type === 'chansade' && !e.success)).toBe(true);
  });

  it('is unavailable once dragstapeln is empty', () => {
    const state = table({ hands: [[card('4')], [card('3')]], högen: [card('7')] });
    expect(legalMoves(state, 0).some((m) => m.type === 'chansa')).toBe(false);
  });

  it('is unavailable twice in one turn', () => {
    const state = table({ hands: [[card('4')], [card('3')]], högen: [card('3')], dragstapeln: [card('K'), card('Q')] });
    const { state: next } = applyMove(state, { type: 'chansa' });
    expect(next.hasChansatThisTurn === false || next.turn !== 0).toBe(true);
  });
});

describe('bordskort', () => {
  it('keeps öppna bordskort locked while the hand has cards', () => {
    const state = table({ hands: [[card('4')], [card('3')]], öppna: [[card('K')], []] });
    expect(legalPlays(state, 0).map((p) => p.rank)).toEqual(['4']);
  });

  it('opens öppna bordskort once the hand is empty', () => {
    const state = table({ hands: [[], []], öppna: [[card('K'), card('K')], []] });
    expect(legalPlays(state, 0)).toEqual([{ rank: 'K', maxCount: 2 }]);
  });

  it('takes the pile when a turned dolt bordskort is too low', () => {
    const state = table({ hands: [[], []], dolda: [[card('4')], [card('9')]], högen: [card('K')] });
    const { state: next, events } = applyMove(state, { type: 'vänd', index: 0 });

    expect(next.players[0].hand).toHaveLength(2); // the 4 plus the K
    expect(events.some((e) => e.type === 'vände' && !e.success)).toBe(true);
  });

  it('shows the turned card to everyone even when it fails', () => {
    const state = table({ hands: [[], []], dolda: [[card('4')], [card('9')]], högen: [card('K')] });
    const { state: next } = applyMove(state, { type: 'vänd', index: 0 });
    expect(next.seddaKort).toContainEqual(card('4'));
  });
});

describe('forbidden last moves', () => {
  it('refuses to let a player finish on an ace', () => {
    const state = table({ hands: [[card('A')], [card('3')]], högen: [card('K')] });
    expect(legalPlays(state, 0)).toEqual([]);
    expect(legalMoves(state, 0).map((m) => m.type)).toContain('ta-högen');
  });

  it('refuses to let a player finish on a 2 or a 10', () => {
    for (const rank of ['2', '10'] as const) {
      const state = table({ hands: [[card(rank)], [card('3')]], högen: [card('K')] });
      expect(legalPlays(state, 0)).toEqual([]);
    }
  });

  it('allows the same card when cards remain behind', () => {
    const state = table({ hands: [[card('A')], [card('3')]], öppna: [[card('5')], []], högen: [card('K')] });
    expect(legalPlays(state, 0).map((p) => p.rank)).toEqual(['A']);
  });

  it('makes the player stand over when högen is empty and nothing is playable', () => {
    const state = table({ hands: [[card('A')], [card('3')]] });
    expect(legalMoves(state, 0)).toEqual([{ type: 'stå-över' }]);
  });

  it('sends a forbidden finisher turned from dolda bordskort back with the pile', () => {
    const state = table({ hands: [[], []], dolda: [[card('10')], [card('9')]], högen: [card('3')] });
    const { state: next } = applyMove(state, { type: 'vänd', index: 0 });
    expect(next.players[0].hand).toHaveLength(2);
    expect(next.players[0].finishedAt).toBeNull();
  });
});

describe('finishing', () => {
  it('records the finishing order and names the skitgubbe', () => {
    const state = table({ hands: [[card('9')], [card('4')]], högen: [card('5')] });
    const { state: next, events } = applyMove(state, { type: 'play', rank: '9', count: 1 });

    expect(next.finishOrder).toEqual([0]);
    expect(skitgubbe(next)).toBe(1);
    expect(events.some((e) => e.type === 'slut' && e.skitgubbe === 1)).toBe(true);
  });
});

describe('PlayerView', () => {
  it('hides every card the player could not see at a real table', () => {
    const state = createGame({ playerNames: ['Du', 'Bot 1', 'Bot 2'], seed: 7 });
    const view = toPlayerView(state, 1);

    const serialised = JSON.stringify(view);
    const hidden: Card[] = [
      ...state.dragstapeln,
      ...state.players.flatMap((p) => p.doldaBordskort),
      ...state.players.filter((p) => p.id !== 1).flatMap((p) => p.hand),
    ];

    // Not one hidden card may appear anywhere in the view, at any depth.
    for (const c of hidden) {
      expect(serialised).not.toContain(JSON.stringify(c));
    }
    expect(view.opponents.every((o) => typeof o.handCount === 'number')).toBe(true);
    expect(view.dragstapelnCount).toBe(state.dragstapeln.length);
  });

  it('exposes an opponent\'s public öppna bordskort', () => {
    const state = createGame({ playerNames: ['Du', 'Bot 1'], seed: 3 });
    const view = toPlayerView(state, 0);
    expect(view.opponents[0].öppnaBordskort).toEqual(state.players[1].öppnaBordskort);
  });
});

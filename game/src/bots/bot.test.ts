import { describe, expect, it } from 'vitest';
import { Card, Rank } from '../engine/cards';
import { seededRng } from '../engine/random';
import { PlayerView } from '../engine/view';
import { BotLevel, chansaOdds, decideMove, unseenCards } from './bot';

const card = (rank: Rank, suit: Card['suit'] = 'spades'): Card => ({ rank, suit });

/** A PlayerView written by hand: exactly what the bot is allowed to know. */
function view(overrides: Partial<PlayerView> = {}): PlayerView {
  return {
    me: 1,
    hand: [],
    öppnaBordskort: [],
    doldaBordskortCount: 3,
    activeZone: 'hand',
    opponents: [{ id: 0, name: 'Du', handCount: 3, öppnaBordskort: [], doldaBordskortCount: 3, finished: false }],
    högen: [],
    dragstapelnCount: 10,
    seddaKort: [],
    hasChansatThisTurn: false,
    isMyTurn: true,
    ...overrides,
  };
}

describe('every level', () => {
  const levels: BotLevel[] = [1, 2, 3, 4, 5];

  it('only ever returns a legal move', () => {
    for (const level of levels) {
      const rng = seededRng(level);
      for (let i = 0; i < 50; i++) {
        const move = decideMove(
          view({ hand: [card('4'), card('9'), card('K')], högen: [card('7')] }),
          level,
          rng,
        );
        expect(['play', 'chansa', 'ta-högen', 'stå-över']).toContain(move.type);
        if (move.type === 'play') expect(['9', 'K']).toContain(move.rank);
      }
    }
  });

  it('takes högen when nothing can be played and no chansa is available', () => {
    for (const level of levels) {
      const move = decideMove(
        view({ hand: [card('3')], högen: [card('K')], dragstapelnCount: 0 }),
        level,
        seededRng(1),
      );
      expect(move.type).toBe('ta-högen');
    }
  });
});

describe('level 1, Nybörjare', () => {
  it('makes visible mistakes', () => {
    const rng = seededRng(99);
    const choices = new Set<string>();
    for (let i = 0; i < 60; i++) {
      const move = decideMove(view({ hand: [card('4'), card('K'), card('10')], högen: [card('3')] }), 1, rng);
      choices.add(JSON.stringify(move));
    }
    // A sloppy bot does not always pick the same card from the same position.
    expect(choices.size).toBeGreaterThan(1);
  });
});

describe('level 2, Van', () => {
  it('plays the lowest legal card', () => {
    const move = decideMove(view({ hand: [card('4'), card('9'), card('K')], högen: [card('3')] }), 2, seededRng(1));
    expect(move).toEqual({ type: 'play', rank: '4', count: 1 });
  });

  it('holds on to specialkort while ordinary cards will do', () => {
    const move = decideMove(view({ hand: [card('10'), card('9')], högen: [card('8')] }), 2, seededRng(1));
    expect(move).toEqual({ type: 'play', rank: '9', count: 1 });
  });

  it('spends a specialkort when the hand is drowning', () => {
    const move = decideMove(
      view({ hand: [card('10'), card('3'), card('4'), card('5'), card('6'), card('7')], högen: [card('K')] }),
      2,
      seededRng(1),
    );
    expect(move).toEqual({ type: 'play', rank: '10', count: 1 });
  });

  it('chansar only when the hand is dead', () => {
    const playable = decideMove(view({ hand: [card('K')], högen: [card('9')] }), 2, seededRng(1));
    expect(playable.type).toBe('play');

    const dead = decideMove(view({ hand: [card('3')], högen: [card('K')] }), 2, seededRng(1));
    expect(dead.type).toBe('chansa');
  });
});

describe('level 3, Räknare', () => {
  it('works out the odds from sedda kort alone', () => {
    const empty = view({ högen: [card('K')] });
    expect(chansaOdds(empty)).toBeGreaterThan(0);
    expect(chansaOdds(empty)).toBeLessThan(1);

    // With every low card already seen, what is left mostly beats a king.
    const seen = view({
      högen: [card('K')],
      seddaKort: (['3', '4', '5', '6', '7', '8', '9'] as Rank[]).flatMap((rank) =>
        (['hearts', 'diamonds', 'clubs', 'spades'] as const).map((suit) => card(rank, suit)),
      ),
    });
    expect(chansaOdds(seen)).toBeGreaterThan(chansaOdds(empty));
  });

  it('counts a card it has seen turned and taken back as gone from dragstapeln', () => {
    const before = unseenCards(view({}));
    const after = unseenCards(view({ seddaKort: [card('4', 'hearts')] }));
    expect(after.length).toBe(before.length - 1);
  });

  it('chansar on good odds even with a playable card in hand', () => {
    const seen = (['3', '4', '5', '6', '7', '8', '9'] as Rank[]).flatMap((rank) =>
      (['hearts', 'diamonds', 'clubs', 'spades'] as const).map((suit) => card(rank, suit)),
    );
    const move = decideMove(view({ hand: [card('A')], högen: [card('J')], seddaKort: seen }), 3, seededRng(1));
    expect(move.type).toBe('chansa');
  });
});

describe('level 4, Taktiker', () => {
  it('completes fyra lika to burn högen and take another turn', () => {
    const move = decideMove(
      view({
        hand: [card('7', 'hearts'), card('3', 'clubs')],
        högen: [card('K'), card('7', 'clubs'), card('7', 'diamonds'), card('7', 'spades')],
      }),
      4,
      seededRng(1),
    );
    expect(move).toEqual({ type: 'play', rank: '7', count: 1 });
  });

  it('refuses a chansa when the pile at stake is large and the odds are poor', () => {
    const bigPile = Array.from({ length: 12 }, () => card('K', 'hearts'));
    const move = decideMove(view({ hand: [card('A')], högen: bigPile }), 4, seededRng(1));
    expect(move.type).toBe('play');
  });
});

describe('level 5, Hajen', () => {
  it('avoids being left holding a card it may not finish on', () => {
    const move = decideMove(
      view({ hand: [card('A'), card('9')], högen: [card('8')], doldaBordskortCount: 0, öppnaBordskort: [] }),
      5,
      seededRng(1),
    );
    // Playing the ace now leaves a playable 9 for the last move; playing the 9
    // would strand the bot on an ace it cannot legally finish on.
    expect(move).toEqual({ type: 'play', rank: 'A', count: 1 });
  });
});

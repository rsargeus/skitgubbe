import { Card, RANK_ORDER, Rank, SUITS, isSpecialkort, value } from '../engine/cards';
import { Move } from '../engine/moves';
import { Rng } from '../engine/random';
import { canPlayOn, isForbiddenFinisher, makesFyraLika } from '../engine/rules';
import { PlayerView } from '../engine/view';
import { canChansaFromView, legalMovesForView } from '../engine/viewMoves';

/**
 * One bot, five levels.
 *
 * Levels are capabilities switched on in layers, not five separate bots. Every
 * level reads a PlayerView and nothing else: a higher level is stronger because
 * it reasons better, never because it sees more. See docs/adr/0002.
 */
export type BotLevel = 1 | 2 | 3 | 4 | 5;

export type BotCapabilities = {
  /** How often the bot deliberately picks a worse legal move. */
  mistakeRate: number;
  /** Hold the 2 and the 10 back for when they are needed. */
  savesSpecialkort: boolean;
  /** Count sedda kort to judge what is left in dragstapeln. */
  countsCards: boolean;
  /** Weigh the pile at stake against the odds instead of using a rule of thumb. */
  usesExpectedValue: boolean;
  /** Play towards fyra lika, and avoid handing opponents easy cards. */
  playsForFyraLika: boolean;
  /** Avoid being left holding a card that cannot legally end the game. */
  plansEndgame: boolean;
};

export const CAPABILITIES: Record<BotLevel, BotCapabilities> = {
  1: { mistakeRate: 0.25, savesSpecialkort: false, countsCards: false, usesExpectedValue: false, playsForFyraLika: false, plansEndgame: false },
  2: { mistakeRate: 0, savesSpecialkort: true, countsCards: false, usesExpectedValue: false, playsForFyraLika: false, plansEndgame: false },
  3: { mistakeRate: 0, savesSpecialkort: true, countsCards: true, usesExpectedValue: false, playsForFyraLika: false, plansEndgame: false },
  4: { mistakeRate: 0, savesSpecialkort: true, countsCards: true, usesExpectedValue: true, playsForFyraLika: true, plansEndgame: false },
  5: { mistakeRate: 0, savesSpecialkort: true, countsCards: true, usesExpectedValue: true, playsForFyraLika: true, plansEndgame: true },
};

export const LEVEL_NAMES: Record<BotLevel, string> = {
  1: 'Nybörjare',
  2: 'Van',
  3: 'Räknare',
  4: 'Taktiker',
  5: 'Hajen',
};

export function decideMove(view: PlayerView, level: BotLevel, rng: Rng = Math.random): Move {
  const caps = CAPABILITIES[level];
  const moves = legalMovesForView(view);
  if (moves.length === 0) throw new Error('A bot was asked to move with no legal moves');
  if (moves.length === 1) return moves[0];

  if (view.activeZone === 'dolda') {
    // Nothing to reason about: the cards are face down. Any of them is as good
    // a guess as any other.
    return moves[Math.floor(rng() * moves.length)];
  }

  if (caps.mistakeRate > 0 && rng() < caps.mistakeRate) {
    return moves[Math.floor(rng() * moves.length)];
  }

  const plays = moves.filter((m): m is Extract<Move, { type: 'play' }> => m.type === 'play');

  if (shouldChansa(view, caps, plays.length > 0)) {
    const chansa = moves.find((m) => m.type === 'chansa');
    if (chansa) return chansa;
  }

  if (plays.length === 0) {
    return moves.find((m) => m.type === 'ta-högen') ?? moves.find((m) => m.type === 'stå-över') ?? moves[0];
  }

  return bestPlay(view, caps, plays);
}

/** Rank the available plays and take the best. Lower score is better. */
function bestPlay(
  view: PlayerView,
  caps: BotCapabilities,
  plays: Extract<Move, { type: 'play' }>[],
): Move {
  const scored = plays.map((play) => ({ play, score: scorePlay(view, caps, play) }));
  scored.sort((a, b) => a.score - b.score);
  return scored[0].play;
}

function scorePlay(view: PlayerView, caps: BotCapabilities, play: Extract<Move, { type: 'play' }>): number {
  // Base: get rid of the lowest card you can. Cheap cards are the ones that
  // trap you later.
  let score = value(play.rank);

  if (caps.savesSpecialkort && isSpecialkort(play.rank)) {
    const desperate = view.hand.length >= 6 || view.högen.length >= 8;
    score += desperate ? 4 : 40;
  }

  if (caps.playsForFyraLika) {
    // Completing fyra lika burns högen and buys another turn: take it.
    const cards: Card[] = Array.from({ length: play.count }, () => ({ rank: play.rank, suit: 'spades' }));
    if (makesFyraLika([...view.högen, ...cards])) score -= 50;

    // Dumping several of a rank at once thins the hand, which is usually good,
    // but never at the cost of breaking up a near-complete four.
    if (play.count > 1) score -= play.count;
  }

  // Never play yourself into a corner. A hand of nothing but aces, twos and
  // tens cannot legally end the game: the player has to keep taking högen and
  // playing back down to the same dead hand, forever. Getting rid of a
  // forbidden finisher while ordinary cards are still there to follow it is
  // worth more than saving it, so this outweighs holding specialkort back.
  if (view.activeZone === 'hand' && wouldStrandThePlayer(view, play)) {
    score += 60;
  }

  return score;
}

function shouldChansa(view: PlayerView, caps: BotCapabilities, hasPlayableCards: boolean): boolean {
  if (!canChansaFromView(view)) return false;

  // Levels 1 and 2 only chansa when the hand is dead.
  if (!caps.countsCards) return !hasPlayableCards;

  const odds = chansaOdds(view);

  if (!caps.usesExpectedValue) {
    // Level 3: a rule of thumb over the odds it can actually work out.
    if (!hasPlayableCards) return true;
    return odds >= 0.75 && view.högen.length <= 4;
  }

  // Level 4 and up: weigh the pile at stake against the odds. Losing costs the
  // whole pile; winning saves a card from the hand and keeps the turn moving.
  const cost = view.högen.length + 1;
  const gain = hasPlayableCards ? 1 : 3;
  const expected = odds * gain - (1 - odds) * cost;
  return hasPlayableCards ? expected > 0.5 : expected > -cost;
}

/**
 * The chance that the next card off dragstapeln can be played, worked out from
 * what this player has seen. Cards in other players' hands are unseen, so this
 * is an honest estimate rather than a certainty.
 */
export function chansaOdds(view: PlayerView): number {
  const unseen = unseenCards(view);
  if (unseen.length === 0) return 0;
  const playable = unseen.filter((c) => canPlayOn(view.högen, c.rank)).length;
  return playable / unseen.length;
}

/** Every card this player has not seen: the deck minus sedda kort minus its own. */
export function unseenCards(view: PlayerView): Card[] {
  const accounted = new Set<string>();
  for (const c of [...view.seddaKort, ...view.hand, ...view.öppnaBordskort]) {
    accounted.add(`${c.rank}-${c.suit}`);
  }
  for (const opponent of view.opponents) {
    for (const c of opponent.öppnaBordskort) accounted.add(`${c.rank}-${c.suit}`);
  }

  const unseen: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANK_ORDER) {
      if (!accounted.has(`${rank}-${suit}`)) unseen.push({ rank, suit });
    }
  }
  return unseen;
}

/**
 * Would this play leave the player holding nothing but cards they are not
 * allowed to finish on, with no bordskort left to fall back on?
 */
function wouldStrandThePlayer(view: PlayerView, play: Extract<Move, { type: 'play' }>): boolean {
  if (view.öppnaBordskort.length > 0 || view.doldaBordskortCount > 0) return false;
  const left = removeCards(view.hand, play.rank, play.count);
  return left.length > 0 && left.every((c) => isForbiddenFinisher(c.rank));
}

/** The hand that would be left after laying `count` cards of `rank`. */
function removeCards(hand: Card[], rank: Rank, count: number): Card[] {
  let left = count;
  return hand.filter((c) => {
    if (c.rank === rank && left > 0) {
      left--;
      return false;
    }
    return true;
  });
}

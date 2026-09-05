import { Card, Rank, isSpecialkort, value } from './cards';

/**
 * The card that has to be beaten, or null when anything goes.
 *
 * A 2 resets högen, so a 2 on top leaves the next player free to play whatever
 * they like — the same situation as an empty pile.
 */
export function effectiveTop(högen: Card[]): Card | null {
  const top = högen[högen.length - 1];
  if (!top) return null;
  if (top.rank === '2') return null;
  return top;
}

/** Can this rank be laid on top of högen as it currently stands? */
export function canPlayOn(högen: Card[], rank: Rank): boolean {
  if (isSpecialkort(rank)) return true;
  const top = effectiveTop(högen);
  if (!top) return true;
  return value(rank) >= value(top.rank);
}

/** The ranks that must never be a player's very last move. */
export function isForbiddenFinisher(rank: Rank): boolean {
  return rank === 'A' || rank === '2' || rank === '10';
}

/**
 * Fyra lika: four cards of the same rank on top of högen, however they got
 * there. Counts even when four different players laid them in sequence.
 */
export function makesFyraLika(högen: Card[]): boolean {
  if (högen.length < 4) return false;
  const top4 = högen.slice(-4);
  return top4.every((c) => c.rank === top4[0].rank);
}

/** Distinct ranks in a zone, each with all the cards of that rank. */
export function groupByRank(cards: Card[]): Map<Rank, Card[]> {
  const groups = new Map<Rank, Card[]>();
  for (const card of cards) {
    const existing = groups.get(card.rank);
    if (existing) existing.push(card);
    else groups.set(card.rank, [card]);
  }
  return groups;
}

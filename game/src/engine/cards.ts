/**
 * Cards, and the rank order that makes Skitgubbe Skitgubbe.
 *
 * The 10 is the highest card and the 2 the second highest, so the order runs
 * 3 4 5 6 7 8 9 J Q K A 2 10 — thirteen ranks, with no low 2 and no low 10.
 */

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export type Suit = (typeof SUITS)[number];

/** Ranks in ascending order of power. Index into this array is the rank's value. */
export const RANK_ORDER = ['3', '4', '5', '6', '7', '8', '9', 'J', 'Q', 'K', 'A', '2', '10'] as const;
export type Rank = (typeof RANK_ORDER)[number];

export type Card = {
  rank: Rank;
  suit: Suit;
};

/** A card's power. Higher beats lower. */
export function value(rank: Rank): number {
  return RANK_ORDER.indexOf(rank);
}

/** The 2 and the 10: playable on anything, whatever is on top of högen. */
export function isSpecialkort(rank: Rank): boolean {
  return rank === '2' || rank === '10';
}

export function cardId(card: Card): string {
  return `${card.rank}-${card.suit}`;
}

export function sameRank(cards: Card[]): boolean {
  return cards.every((c) => c.rank === cards[0].rank);
}

/** A fresh 52-card deck in a fixed order. Shuffling is the caller's job. */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANK_ORDER) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

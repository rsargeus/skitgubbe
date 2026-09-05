import { Rank } from './cards';
import { Move } from './moves';
import { canPlayOn, groupByRank, isForbiddenFinisher, makesFyraLika } from './rules';
import { PlayerView } from './view';

/**
 * The legal moves as seen from a PlayerView.
 *
 * Bots plan with this. It works purely from public information plus the
 * player's own cards, so a bot never needs the game state to know what it may
 * do. See docs/adr/0002.
 */
export function legalMovesForView(view: PlayerView): Move[] {
  const moves: Move[] = [];

  if (view.activeZone === 'dolda') {
    for (let i = 0; i < view.doldaBordskortCount; i++) moves.push({ type: 'vänd', index: i });
    return moves;
  }

  if (view.activeZone !== 'done') {
    const cards = view.activeZone === 'hand' ? view.hand : view.öppnaBordskort;

    for (const [rank, group] of groupByRank(cards)) {
      if (!canPlayOn(view.högen, rank)) continue;
      const wouldFinish = wouldEmptyEverything(view, group.length);
      if (wouldFinish && isForbiddenFinisher(rank)) continue;
      if (wouldFinish && makesFyraLika([...view.högen, ...group])) continue;
      for (let count = 1; count <= group.length; count++) moves.push({ type: 'play', rank, count });
    }

    if (canChansaFromView(view)) moves.push({ type: 'chansa' });
  }

  if (view.högen.length > 0) moves.push({ type: 'ta-högen' });
  else if (moves.length === 0) moves.push({ type: 'stå-över' });

  return moves;
}

export function canChansaFromView(view: PlayerView): boolean {
  return view.activeZone === 'hand' && !view.hasChansatThisTurn && view.dragstapelnCount > 0;
}

function wouldEmptyEverything(view: PlayerView, count: number): boolean {
  if (view.activeZone === 'hand') {
    return view.hand.length === count && view.öppnaBordskort.length === 0 && view.doldaBordskortCount === 0;
  }
  return view.öppnaBordskort.length === count && view.doldaBordskortCount === 0;
}

/** The ranks the player can actually lay right now, lowest first. */
export function playableRanks(view: PlayerView): Rank[] {
  const ranks = new Set<Rank>();
  for (const move of legalMovesForView(view)) {
    if (move.type === 'play') ranks.add(move.rank);
  }
  return [...ranks];
}

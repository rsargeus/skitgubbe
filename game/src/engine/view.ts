import { Card } from './cards';
import { GameState, PlayerId, activeZone, playerById } from './state';

/**
 * What one player is allowed to know.
 *
 * Bots take a PlayerView and nothing else. Hidden cards are not in this object
 * at all — not the opponents' hands, not anyone's dolda bordskort, not the
 * order of dragstapeln — so a bot cannot cheat even by accident. See
 * docs/adr/0002-bots-see-a-playerview-never-the-game-state.md.
 */
export type OpponentView = {
  id: PlayerId;
  name: string;
  handCount: number;
  öppnaBordskort: Card[];
  doldaBordskortCount: number;
  finished: boolean;
};

export type PlayerView = {
  me: PlayerId;
  hand: Card[];
  öppnaBordskort: Card[];
  doldaBordskortCount: number;
  activeZone: 'hand' | 'öppna' | 'dolda' | 'done';
  opponents: OpponentView[];
  högen: Card[];
  dragstapelnCount: number;
  /** Every card that has been face up in front of everyone, in the order seen. */
  seddaKort: Card[];
  hasChansatThisTurn: boolean;
  isMyTurn: boolean;
};

export function toPlayerView(state: GameState, id: PlayerId): PlayerView {
  const me = playerById(state, id);

  return {
    me: id,
    hand: [...me.hand],
    öppnaBordskort: [...me.öppnaBordskort],
    doldaBordskortCount: me.doldaBordskort.length,
    activeZone: activeZone(me),
    opponents: state.players
      .filter((p) => p.id !== id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        handCount: p.hand.length,
        öppnaBordskort: [...p.öppnaBordskort],
        doldaBordskortCount: p.doldaBordskort.length,
        finished: p.finishedAt !== null,
      })),
    högen: [...state.högen],
    dragstapelnCount: state.dragstapeln.length,
    seddaKort: [...state.seddaKort],
    hasChansatThisTurn: state.hasChansatThisTurn,
    isMyTurn: state.turn === id,
  };
}

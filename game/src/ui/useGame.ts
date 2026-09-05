import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BotLevel, decideMove } from '../bots/bot';
import { Card, cardId } from '../engine/cards';
import { GameEvent, Move, applyMove, legalMoves } from '../engine/moves';
import { GameState, createGame, gameIsOver, playerById } from '../engine/state';
import { toPlayerView } from '../engine/view';
import { clearGame, saveGame } from '../storage';

export const HUMAN: number = 0;

/** Ordinary moves go by quickly; the ones with something at stake linger. */
export const NORMAL_DELAY = 600;
export const DRAMATIC_DELAY = 1400;

export type Reveal = {
  card: Card;
  success: boolean;
  kind: 'chansa' | 'vänd';
  player: number;
};

export type Selection = {
  zone: 'hand' | 'öppna';
  ids: string[];
};

function delayFor(events: GameEvent[], skip: boolean): number {
  if (skip) return 0;
  const dramatic = events.some(
    (e) =>
      e.type === 'chansade' ||
      e.type === 'vände' ||
      e.type === 'tog-högen' ||
      e.type === 'brände-högen',
  );
  return dramatic ? DRAMATIC_DELAY : NORMAL_DELAY;
}

function revealFrom(events: GameEvent[]): Reveal | null {
  for (const event of events) {
    if (event.type === 'chansade') {
      return { card: event.card, success: event.success, kind: 'chansa', player: event.player };
    }
    if (event.type === 'vände') {
      return { card: event.card, success: event.success, kind: 'vänd', player: event.player };
    }
  }
  return null;
}

export type GameController = ReturnType<typeof useGame>;

export function useGame(level: BotLevel, skipAnimations: boolean, initial?: GameState) {
  const [state, setState] = useState<GameState>(() => initial ?? createGame({ playerNames: ['Du', 'Bot 1'] }));
  const [lastEvents, setLastEvents] = useState<GameEvent[]>([]);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [selectedDoltIndex, setSelectedDoltIndex] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  const humanIsOut = playerById(state, HUMAN).finishedAt !== null;
  // Once the player is out there is nothing left to watch for: the rest of the
  // game plays itself out at speed so the skitgubbe is still crowned.
  const skip = skipAnimations || humanIsOut;

  const commit = useCallback(
    (move: Move) => {
      setState((current) => {
        const { state: next, events } = applyMove(current, move);
        setLastEvents(events);
        setReveal(revealFrom(events));
        setSelection(null);
        setSelectedDoltIndex(null);
        if (gameIsOver(next)) clearGame();
        else saveGame(next, level);
        return next;
      });
    },
    [level],
  );

  // Bots take their turns on a timer, so the player can follow what happened.
  useEffect(() => {
    if (gameIsOver(state)) return;
    const current = playerById(state, state.turn);
    if (!current.isBot) return;

    const wait = Math.max(delayFor(lastEvents, skip), skip ? 0 : 250);
    timer.current = window.setTimeout(() => {
      const move = decideMove(toPlayerView(state, state.turn), level);
      commit(move);
    }, wait);

    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [state, lastEvents, level, skip, commit]);

  // Clear a reveal once it has been on screen long enough to read.
  useEffect(() => {
    if (!reveal) return;
    const wait = skip ? 0 : DRAMATIC_DELAY;
    const id = window.setTimeout(() => setReveal(null), wait);
    return () => window.clearTimeout(id);
  }, [reveal, skip]);

  const myMoves = useMemo(
    () => (state.turn === HUMAN && !gameIsOver(state) ? legalMoves(state, HUMAN) : []),
    [state],
  );

  const toggleCard = useCallback(
    (zone: 'hand' | 'öppna', card: Card) => {
      const id = cardId(card);
      setSelection((current) => {
        if (!current || current.zone !== zone) return { zone, ids: [id] };
        if (current.ids.includes(id)) {
          const ids = current.ids.filter((existing) => existing !== id);
          return ids.length ? { zone, ids } : null;
        }
        // Selecting a different rank starts a new selection: only cards of the
        // same rank can be played together.
        const player = playerById(state, HUMAN);
        const cards = zone === 'hand' ? player.hand : player.öppnaBordskort;
        const first = cards.find((c) => cardId(c) === current.ids[0]);
        if (!first || first.rank !== card.rank) return { zone, ids: [id] };
        return { zone, ids: [...current.ids, id] };
      });
    },
    [state],
  );

  const selectedCards = useMemo(() => {
    if (!selection) return [];
    const player = playerById(state, HUMAN);
    const cards = selection.zone === 'hand' ? player.hand : player.öppnaBordskort;
    return cards.filter((c) => selection.ids.includes(cardId(c)));
  }, [selection, state]);

  const canPlaySelection = useMemo(() => {
    if (selectedCards.length === 0) return false;
    const rank = selectedCards[0].rank;
    return myMoves.some((m) => m.type === 'play' && m.rank === rank && m.count === selectedCards.length);
  }, [selectedCards, myMoves]);

  const playSelection = useCallback(() => {
    if (!canPlaySelection || selectedCards.length === 0) return;
    commit({ type: 'play', rank: selectedCards[0].rank, count: selectedCards.length });
  }, [canPlaySelection, selectedCards, commit]);

  // Turning a dolt bordskort is binding, so it follows the same
  // select-then-confirm pattern as the hand rather than firing on one tap.
  const selectDolt = useCallback((index: number) => {
    setSelectedDoltIndex((current) => (current === index ? null : index));
  }, []);

  const turnSelectedDolt = useCallback(() => {
    if (selectedDoltIndex === null) return;
    commit({ type: 'vänd', index: selectedDoltIndex });
  }, [selectedDoltIndex, commit]);

  const reset = useCallback(
    (next: GameState) => {
      setState(next);
      setLastEvents([]);
      setReveal(null);
      setSelection(null);
      setSelectedDoltIndex(null);
      saveGame(next, level);
    },
    [level],
  );

  return {
    state,
    lastEvents,
    reveal,
    selection,
    selectedCards,
    canPlaySelection,
    myMoves,
    isMyTurn: state.turn === HUMAN && !gameIsOver(state),
    humanIsOut,
    toggleCard,
    playSelection,
    selectedDoltIndex,
    selectDolt,
    turnSelectedDolt,
    commit,
    reset,
  };
}

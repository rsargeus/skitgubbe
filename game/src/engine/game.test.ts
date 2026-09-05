import { describe, expect, it } from 'vitest';
import { BotLevel, decideMove } from '../bots/bot';
import { seededRng } from './random';
import { applyMove, legalMoves } from './moves';
import { createGame, gameIsOver, skitgubbe } from './state';
import { toPlayerView } from './view';

/** Play a whole game with every seat driven by a bot. */
function playOut(seed: number, players: number, level: BotLevel) {
  const rng = seededRng(seed);
  let state = createGame({
    playerNames: Array.from({ length: players }, (_, i) => `P${i}`),
    seed,
  });

  for (let turn = 0; turn < 5000; turn++) {
    if (gameIsOver(state)) return { state, stalled: false };
    const move = decideMove(toPlayerView(state, state.turn), level, rng);
    state = applyMove(state, move).state;
  }

  return { state, stalled: true };
}

describe('a full game', () => {
  it('always reaches an end and names exactly one skitgubbe', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const players = 2 + (seed % 3);
      const level = ((seed % 5) + 1) as BotLevel;
      const { state, stalled } = playOut(seed, players, level);

      expect(stalled, `seed ${seed} never finished`).toBe(false);
      expect(gameIsOver(state)).toBe(true);
      expect(skitgubbe(state)).not.toBeNull();
      expect(state.finishOrder).toHaveLength(players - 1);
    }
  });

  it('never loses or invents a card', () => {
    for (let seed = 40; seed <= 50; seed++) {
      const { state } = playOut(seed, 3, 4);
      const total =
        state.högen.length +
        state.dragstapeln.length +
        state.removed.length +
        state.players.reduce(
          (sum, p) => sum + p.hand.length + p.öppnaBordskort.length + p.doldaBordskort.length,
          0,
        );
      expect(total, `seed ${seed} lost cards`).toBe(52);
    }
  });

  it('leaves a legal move available on every turn', () => {
    const rng = seededRng(123);
    let state = createGame({ playerNames: ['A', 'B', 'C'], seed: 123 });

    for (let turn = 0; turn < 2000 && !gameIsOver(state); turn++) {
      expect(legalMoves(state, state.turn).length, `no legal move on turn ${turn}`).toBeGreaterThan(0);
      state = applyMove(state, decideMove(toPlayerView(state, state.turn), 3, rng)).state;
    }
  });
});

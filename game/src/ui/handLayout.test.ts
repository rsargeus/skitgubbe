import { describe, expect, it } from 'vitest';
import { CARD_WIDTH, MAX_STEP, MIN_STEP, handLayout, handWidth } from './handLayout';

/** A phone in portrait, minus the screen padding. */
const PHONE = 360 - 24;

describe('handLayout', () => {
  it('fans a small hand out comfortably', () => {
    const { step, overflows } = handLayout(3, PHONE);
    expect(step).toBe(MAX_STEP);
    expect(overflows).toBe(false);
  });

  it('keeps a full hand inside the screen', () => {
    // Nine cards is an ordinary hand after taking högen once.
    for (const count of [4, 6, 9, 12, 18]) {
      const { step, overflows } = handLayout(count, PHONE);
      expect(overflows, `${count} cards should still fit`).toBe(false);
      expect(handWidth(count, step), `${count} cards overflowed`).toBeLessThanOrEqual(PHONE);
    }
  });

  it('tightens the fan as the hand grows, never the other way', () => {
    let previous = Infinity;
    for (let count = 2; count <= 30; count++) {
      const { step } = handLayout(count, PHONE);
      expect(step).toBeLessThanOrEqual(previous);
      previous = step;
    }
  });

  it('never squeezes past the point where a card is readable', () => {
    for (const count of [30, 45, 52]) {
      expect(handLayout(count, PHONE).step).toBeGreaterThanOrEqual(MIN_STEP);
    }
  });

  it('reports an overflow instead of hiding cards off screen', () => {
    // At the minimum step, a 52-card hand cannot fit on a phone. The row has to
    // scroll rather than silently clip the ends.
    const { step, overflows } = handLayout(52, PHONE);
    expect(overflows).toBe(true);
    expect(handWidth(52, step)).toBeGreaterThan(PHONE);
  });

  it('handles the degenerate hands without dividing by zero', () => {
    expect(handLayout(0, PHONE)).toEqual({ step: MAX_STEP, overflows: false });
    expect(handLayout(1, PHONE)).toEqual({ step: MAX_STEP, overflows: false });
    expect(handWidth(0, MAX_STEP)).toBe(0);
    expect(handWidth(1, MAX_STEP)).toBe(CARD_WIDTH);
  });

  it('adapts to a wider screen', () => {
    const phone = handLayout(12, PHONE);
    const desktop = handLayout(12, 560);
    expect(desktop.step).toBeGreaterThan(phone.step);
  });

  it('copes with a container narrower than a single card', () => {
    const { step, overflows } = handLayout(5, 40);
    expect(step).toBe(MIN_STEP);
    expect(overflows).toBe(true);
  });
});

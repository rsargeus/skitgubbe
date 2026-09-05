/**
 * How far each card in the hand advances along the row.
 *
 * A hand grows without limit — taking högen can leave a player holding twenty
 * cards — so the fan has to tighten as it fills up instead of running off the
 * sides of the screen. This works out the step from the space actually
 * available, and says when even the tightest fan will not fit.
 */

/** Width of a hand card, matching .card-medium in styles.css. */
export const CARD_WIDTH = 62;

/** The fan at its most relaxed: a comfortable amount of each card on show. */
export const MAX_STEP = 48;

/** Any tighter and the rank in the corner starts to disappear. */
export const MIN_STEP = 14;

export type HandLayout = {
  /** Pixels from one card's left edge to the next one's. */
  step: number;
  /** True when the row is wider than the space, so it has to scroll. */
  overflows: boolean;
};

export function handLayout(count: number, containerWidth: number): HandLayout {
  if (count <= 1) return { step: MAX_STEP, overflows: false };

  // The first card takes its full width; every card after it adds one step.
  const room = containerWidth - CARD_WIDTH;
  const ideal = room / (count - 1);

  if (ideal >= MAX_STEP) return { step: MAX_STEP, overflows: false };
  if (ideal >= MIN_STEP) return { step: Math.floor(ideal), overflows: false };

  return { step: MIN_STEP, overflows: true };
}

/** Total width the fan occupies at a given step. */
export function handWidth(count: number, step: number): number {
  if (count <= 0) return 0;
  return CARD_WIDTH + (count - 1) * step;
}

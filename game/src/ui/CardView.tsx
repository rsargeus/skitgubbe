import { Card } from '../engine/cards';

const SUIT_SYMBOL = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
} as const;

export type CardSize = 'tiny' | 'small' | 'medium' | 'large';

type Props = {
  card?: Card;
  faceDown?: boolean;
  size?: CardSize;
  selected?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
};

/**
 * A playing card, drawn for the game rather than for the rules page: it has to
 * work at 40px in an opponent's row and at 180px when it is lifted up for a
 * reveal. See docs/adr/0003.
 */
export function CardView({ card, faceDown, size = 'medium', selected, dimmed, onClick, style }: Props) {
  const classes = ['card', `card-${size}`];
  if (faceDown || !card) classes.push('card-back');
  if (selected) classes.push('card-selected');
  if (dimmed) classes.push('card-dimmed');
  if (onClick) classes.push('card-clickable');

  if (faceDown || !card) {
    return <div className={classes.join(' ')} style={style} onClick={onClick} aria-hidden />;
  }

  const red = card.suit === 'hearts' || card.suit === 'diamonds';
  if (red) classes.push('card-red');

  return (
    <div
      className={classes.join(' ')}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={`${card.rank} ${SUIT_SYMBOL[card.suit]}`}
    >
      <span className="card-corner">
        {card.rank}
        <span className="card-suit">{SUIT_SYMBOL[card.suit]}</span>
      </span>
      <span className="card-centre">{SUIT_SYMBOL[card.suit]}</span>
    </div>
  );
}

export function cardLabel(card: Card): string {
  return `${card.rank}${SUIT_SYMBOL[card.suit]}`;
}

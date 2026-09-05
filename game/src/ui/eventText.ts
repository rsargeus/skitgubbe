import { GameEvent } from '../engine/moves';
import { GameState, playerById } from '../engine/state';
import { Translate } from '../i18n/strings';
import { cardLabel } from './CardView';
import { HUMAN } from './useGame';

/** One line describing the most recent move, replaced each turn. */
export function describeEvents(events: GameEvent[], state: GameState, t: Translate): string | null {
  // The burn is the more interesting half of a turn, so it wins the line.
  const ordered = [...events].sort((a, b) => rank(b) - rank(a));
  const event = ordered[0];
  if (!event) return null;

  const nameOf = (id: number) => (id === HUMAN ? t('player.you') : playerById(state, id).name);

  switch (event.type) {
    case 'played':
      return t('event.played', { name: nameOf(event.player), cards: event.cards.map(cardLabel).join(' ') });
    case 'tog-högen':
      return t('event.tookHögen', { name: nameOf(event.player), n: event.count });
    case 'chansade':
      return t(event.success ? 'event.chansaWin' : 'event.chansaFail', {
        name: nameOf(event.player),
        card: cardLabel(event.card),
      });
    case 'vände':
      return t(event.success ? 'event.turnWin' : 'event.turnFail', {
        name: nameOf(event.player),
        card: cardLabel(event.card),
      });
    case 'brände-högen':
      return t(event.reason === 'tia' ? 'event.burnTia' : 'event.burnFyraLika', { name: nameOf(event.player) });
    case 'stod-över':
      return t('event.stoodOver', { name: nameOf(event.player) });
    case 'klar':
      return t('event.finished', { name: nameOf(event.player) });
    case 'slut':
      return null;
  }
}

function rank(event: GameEvent): number {
  switch (event.type) {
    case 'brände-högen':
      return 4;
    case 'chansade':
    case 'vände':
      return 3;
    case 'tog-högen':
      return 2;
    default:
      return 1;
  }
}

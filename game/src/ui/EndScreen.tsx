import { GameState, playerById, skitgubbe } from '../engine/state';
import { Translate } from '../i18n/strings';
import { HUMAN } from './useGame';

type Props = {
  state: GameState;
  t: Translate;
  onAgain: () => void;
  onSettings: () => void;
};

export function EndScreen({ state, t, onAgain, onSettings }: Props) {
  const loser = skitgubbe(state);
  const nameOf = (id: number) => (id === HUMAN ? t('player.you') : playerById(state, id).name);

  return (
    <div className="screen end-screen">
      <h2>{t('end.heading')}</h2>

      <p className="verdict">
        {loser === HUMAN ? t('end.youAreSkitgubbe') : t('end.skitgubbe', { name: loser === null ? '' : nameOf(loser) })}
      </p>

      {state.finishOrder[0] === HUMAN && <p className="cheer">{t('end.youWon')}</p>}

      <ol className="placings">
        {state.finishOrder.map((id, index) => (
          <li key={id}>{t('end.place', { place: index + 1, name: nameOf(id) })}</li>
        ))}
        {loser !== null && (
          <li className="loser">{t('end.place', { place: state.finishOrder.length + 1, name: nameOf(loser) })} 💩</li>
        )}
      </ol>

      <button type="button" className="primary" onClick={onAgain}>
        {t('end.again')}
      </button>
      <button type="button" className="secondary" onClick={onSettings}>
        {t('end.newSettings')}
      </button>
    </div>
  );
}

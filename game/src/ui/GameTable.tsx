import { cardId } from '../engine/cards';
import { gameIsOver, playerById } from '../engine/state';
import { Translate } from '../i18n/strings';
import { CardView } from './CardView';
import { CARD_WIDTH, handLayout } from './handLayout';
import { useElementWidth } from './useElementWidth';
import { describeEvents } from './eventText';
import { GameController, HUMAN } from './useGame';

type Props = {
  game: GameController;
  t: Translate;
  skipAnimations: boolean;
  onToggleSkip: () => void;
};

export function GameTable({ game, t, skipAnimations, onToggleSkip }: Props) {
  const [handRef, handWidth] = useElementWidth();
  const { state, selection, selectedCards, canPlaySelection, myMoves, isMyTurn, reveal } = game;
  const me = playerById(state, HUMAN);
  const opponents = state.players.filter((p) => p.id !== HUMAN);
  const status = describeEvents(game.lastEvents, state, t);

  const canTake = myMoves.some((m) => m.type === 'ta-högen');
  const canChansa = myMoves.some((m) => m.type === 'chansa');
  const canStåÖver = myMoves.some((m) => m.type === 'stå-över');
  const inDolda = me.hand.length === 0 && me.öppnaBordskort.length === 0 && me.doldaBordskort.length > 0;

  // The fan tightens as the hand grows, so a big hand still fits on a phone.
  const hand = handLayout(me.hand.length, handWidth || 336);

  const chansaHint = () => {
    if (state.dragstapeln.length === 0) return t('hint.noDragstapel');
    if (state.hasChansatThisTurn) return t('hint.alreadyChansat');
    return t('hint.chansaHandOnly');
  };

  return (
    <div className="screen table-screen">
      <div className="opponents">
        {opponents.map((opponent) => (
          <div key={opponent.id} className={`opponent ${state.turn === opponent.id ? 'opponent-active' : ''}`}>
            <div className="opponent-name">
              {opponent.name}
              {opponent.finishedAt !== null && <span className="badge">✓</span>}
            </div>
            <div className="opponent-cards">
              <div className="opponent-hand" aria-label={`${opponent.hand.length}`}>
                <CardView faceDown size="tiny" />
                <span className="count">{opponent.hand.length}</span>
              </div>
              <div className="opponent-table">
                {opponent.öppnaBordskort.map((card) => (
                  <CardView key={cardId(card)} card={card} size="tiny" />
                ))}
                {Array.from({ length: opponent.doldaBordskort.length }, (_, i) => (
                  <CardView key={`dolt-${i}`} faceDown size="tiny" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="middle">
        <div className="pile-slot">
          <span className="slot-label">{t('zone.dragstapeln')}</span>
          {state.dragstapeln.length > 0 ? (
            <button
              type="button"
              className="pile-button"
              disabled={!canChansa}
              onClick={() => canChansa && game.commit({ type: 'chansa' })}
            >
              <CardView faceDown size="medium" />
              <span className="count">{state.dragstapeln.length}</span>
            </button>
          ) : (
            <div className="empty-slot">{t('zone.empty')}</div>
          )}
        </div>

        <div className="pile-slot">
          <span className="slot-label">{t('zone.högen')}</span>
          <button
            type="button"
            className={`pile-button ${canPlaySelection ? 'pile-target' : ''}`}
            disabled={!canPlaySelection}
            onClick={game.playSelection}
          >
            {state.högen.length > 0 ? (
              <CardView card={state.högen[state.högen.length - 1]} size="medium" />
            ) : (
              <div className="empty-slot">{t('zone.empty')}</div>
            )}
            {state.högen.length > 0 && <span className="count">{state.högen.length}</span>}
          </button>
        </div>
      </div>

      <div className="status">
        {status ?? (isMyTurn ? t('hint.yourTurn') : t('hint.waiting', { name: playerById(state, state.turn).name }))}
      </div>

      <div className="me">
        <div className="my-table">
          {me.öppnaBordskort.map((card) => (
            <div key={cardId(card)} className="table-stack">
              <CardView faceDown size="small" style={{ position: 'absolute', top: 12, left: 0 }} />
              <CardView
                card={card}
                size="small"
                selected={selection?.zone === 'öppna' && selection.ids.includes(cardId(card))}
                dimmed={me.hand.length > 0}
                onClick={me.hand.length === 0 && isMyTurn ? () => game.toggleCard('öppna', card) : undefined}
              />
            </div>
          ))}
          {Array.from({ length: me.doldaBordskort.length }, (_, index) => {
            const uncovered = index >= me.öppnaBordskort.length;
            if (!uncovered) return null;
            return (
              <div key={`my-dolt-${index}`} className="table-stack">
                <CardView
                  faceDown
                  size="small"
                  selected={game.selectedDoltIndex === index}
                  onClick={inDolda && isMyTurn ? () => game.selectDolt(index) : undefined}
                />
              </div>
            );
          })}
        </div>

        <div className={`my-hand ${hand.overflows ? 'my-hand-scroll' : ''}`} ref={handRef}>
          {me.hand.map((card, index) => (
            <CardView
              key={cardId(card)}
              card={card}
              size="medium"
              style={{ marginLeft: index === 0 ? 0 : hand.step - CARD_WIDTH }}
              selected={selection?.zone === 'hand' && selection.ids.includes(cardId(card))}
              onClick={isMyTurn ? () => game.toggleCard('hand', card) : undefined}
            />
          ))}
        </div>

        <div className="actions">
          {inDolda ? (
            <button
              type="button"
              className="primary"
              disabled={game.selectedDoltIndex === null || !isMyTurn}
              onClick={game.turnSelectedDolt}
            >
              {t('action.turn')}
            </button>
          ) : (
            <button type="button" className="primary" disabled={!canPlaySelection} onClick={game.playSelection}>
              {selectedCards.length > 1 ? t('action.play', { n: selectedCards.length }) : t('action.playOne')}
            </button>
          )}

          <button
            type="button"
            className="secondary"
            disabled={!canTake || !isMyTurn}
            onClick={() => game.commit({ type: 'ta-högen' })}
          >
            {t('action.takeHögen')}
          </button>

          <button
            type="button"
            className="secondary"
            disabled={!canChansa || !isMyTurn}
            title={canChansa ? undefined : chansaHint()}
            onClick={() => game.commit({ type: 'chansa' })}
          >
            {t('action.chansa')}
          </button>

          {canStåÖver && (
            <button type="button" className="secondary" onClick={() => game.commit({ type: 'stå-över' })}>
              {t('action.ståÖver')}
            </button>
          )}
        </div>

        <div className="hints">
          {inDolda && <span>{t('hint.dolda')}</span>}
          {!inDolda && isMyTurn && selectedCards.length > 0 && !canPlaySelection && <span>{t('hint.mustTake')}</span>}
          {!inDolda && isMyTurn && selectedCards.length > 0 && canPlaySelection && <span>{t('hint.tapHögen')}</span>}
        </div>

        <button type="button" className="skip" onClick={onToggleSkip}>
          {skipAnimations ? t('action.unskip') : t('action.skip')}
        </button>
      </div>

      {reveal && !gameIsOver(state) && (
        <div className="reveal-overlay">
          <div className={`reveal ${reveal.success ? 'reveal-ok' : 'reveal-fail'}`}>
            <CardView card={reveal.card} size="large" />
          </div>
        </div>
      )}
    </div>
  );
}

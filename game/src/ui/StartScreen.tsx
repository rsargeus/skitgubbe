import { BotLevel } from '../bots/bot';
import { Language, Translate } from '../i18n/strings';

type Props = {
  t: Translate;
  language: Language;
  onLanguage: (language: Language) => void;
  botCount: number;
  onBotCount: (count: number) => void;
  level: BotLevel;
  onLevel: (level: BotLevel) => void;
  onPlay: () => void;
  onResume?: () => void;
};

const LEVELS: BotLevel[] = [1, 2, 3, 4, 5];

export function StartScreen({ t, language, onLanguage, botCount, onBotCount, level, onLevel, onPlay, onResume }: Props) {
  return (
    <div className="screen start-screen">
      <header className="start-header">
        <h1>{t('app.title')}</h1>
        <p className="tagline">{t('app.tagline')}</p>
      </header>

      <section className="panel">
        <h2>{t('start.heading')}</h2>

        <div className="field">
          <span className="field-label">{t('start.opponents')}</span>
          <div className="choices">
            {[1, 2, 3].map((count) => (
              <button
                key={count}
                type="button"
                className={`choice ${botCount === count ? 'choice-on' : ''}`}
                onClick={() => onBotCount(count)}
              >
                {count === 1 ? t('start.bots.one') : t('start.bots.many', { n: count })}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label">{t('start.difficulty')}</span>
          <div className="choices choices-column">
            {LEVELS.map((option) => (
              <button
                key={option}
                type="button"
                className={`choice choice-wide ${level === option ? 'choice-on' : ''}`}
                onClick={() => onLevel(option)}
              >
                <span className="choice-title">
                  {option}. {t(`level.${option}` as `level.${BotLevel}`)}
                </span>
                <span className="choice-desc">{t(`level.${option}.desc` as `level.${BotLevel}.desc`)}</span>
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="primary" onClick={onPlay}>
          {t('start.play')}
        </button>

        {onResume && (
          <button type="button" className="secondary" onClick={onResume}>
            {t('start.resume')}
          </button>
        )}
      </section>

      <footer className="start-footer">
        <a href="https://skitgubbe.nu">{t('start.rules')}</a>
        <div className="lang">
          {(['sv', 'en'] as Language[]).map((option) => (
            <button
              key={option}
              type="button"
              className={`lang-btn ${language === option ? 'lang-on' : ''}`}
              onClick={() => onLanguage(option)}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}

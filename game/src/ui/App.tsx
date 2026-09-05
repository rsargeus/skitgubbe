import { useCallback, useEffect, useMemo, useState } from 'react';
import { BotLevel } from '../bots/bot';
import { createGame, gameIsOver } from '../engine/state';
import { Language, translator } from '../i18n/strings';
import { DEFAULT_SETTINGS, clearGame, loadGame, loadSettings, saveSettings } from '../storage';
import { EndScreen } from './EndScreen';
import { GameTable } from './GameTable';
import { StartScreen } from './StartScreen';
import { useGame } from './useGame';

type Screen = 'start' | 'playing';

export function App() {
  const [settings, setSettings] = useState(() => (typeof window === 'undefined' ? DEFAULT_SETTINGS : loadSettings()));
  const [saved] = useState(() => (typeof window === 'undefined' ? null : loadGame()));
  const [screen, setScreen] = useState<Screen>('start');
  const [seed, setSeed] = useState(() => Date.now());

  const t = useMemo(() => translator(settings.language), [settings.language]);

  useEffect(() => {
    saveSettings(settings);
    document.documentElement.lang = settings.language;
  }, [settings]);

  const names = useMemo(
    () => [t('player.you'), ...Array.from({ length: settings.botCount }, (_, i) => t('player.bot', { n: i + 1 }))],
    [settings.botCount, t],
  );

  const game = useGame(
    settings.level,
    settings.skipAnimations,
    saved?.state ?? createGame({ playerNames: names, seed }),
  );

  const startNew = useCallback(() => {
    const nextSeed = Date.now();
    setSeed(nextSeed);
    clearGame();
    game.reset(createGame({ playerNames: names, seed: nextSeed }));
    setScreen('playing');
  }, [game, names]);

  const resume = useCallback(() => {
    if (!saved) return;
    setSettings((current) => ({ ...current, level: saved.level }));
    game.reset(saved.state);
    setScreen('playing');
  }, [game, saved]);

  if (screen === 'start') {
    return (
      <StartScreen
        t={t}
        language={settings.language}
        onLanguage={(language: Language) => setSettings((s) => ({ ...s, language }))}
        botCount={settings.botCount}
        onBotCount={(botCount) => setSettings((s) => ({ ...s, botCount }))}
        level={settings.level}
        onLevel={(level: BotLevel) => setSettings((s) => ({ ...s, level }))}
        onPlay={startNew}
        onResume={saved ? resume : undefined}
      />
    );
  }

  if (gameIsOver(game.state)) {
    return <EndScreen state={game.state} t={t} onAgain={startNew} onSettings={() => setScreen('start')} />;
  }

  return (
    <GameTable
      game={game}
      t={t}
      skipAnimations={settings.skipAnimations}
      onToggleSkip={() => setSettings((s) => ({ ...s, skipAnimations: !s.skipAnimations }))}
    />
  );
}

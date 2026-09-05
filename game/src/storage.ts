import { GameState } from './engine/state';
import { BotLevel } from './bots/bot';
import { Language } from './i18n/strings';

/**
 * A game survives a reload. State is written after every move, so a stray swipe
 * or an app switch on a phone does not throw the game away.
 */

const GAME_KEY = 'skitgubbe:game:v1';
const SETTINGS_KEY = 'skitgubbe:settings:v1';

export type Settings = {
  language: Language;
  botCount: number;
  level: BotLevel;
  skipAnimations: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  language: 'sv',
  botCount: 2,
  level: 2,
  skipAnimations: false,
};

export type SavedGame = {
  state: GameState;
  level: BotLevel;
};

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    // Private windows, cleared site data, storage disabled: carry on without it.
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Saving is a convenience, never a requirement.
  }
}

export function loadGame(): SavedGame | null {
  const saved = read<SavedGame>(GAME_KEY);
  if (!saved?.state?.players?.length) return null;
  return saved;
}

export function saveGame(state: GameState, level: BotLevel): void {
  write(GAME_KEY, { state, level } satisfies SavedGame);
}

export function clearGame(): void {
  try {
    localStorage.removeItem(GAME_KEY);
  } catch {
    // Nothing to do.
  }
}

export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...(read<Partial<Settings>>(SETTINGS_KEY) ?? {}) };
}

export function saveSettings(settings: Settings): void {
  write(SETTINGS_KEY, settings);
}

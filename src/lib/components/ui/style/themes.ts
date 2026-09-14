import { mode, setMode, setTheme } from 'mode-watcher';

import { FavoriteThemes } from './favorite-themes.ts';
import themesData from './themes.json';

export type ThemeOption = { id: string; label: string; mode: 'light' | 'dark' };

// ---------------------------------------------------------------------------
// PROJECT CUSTOMISATION (see AGENTS.md): this site is light-only.
// The registry ships all 586 themes; we expose only the 127 light ones so the
// ThemePicker can never put the site into a dark palette the design isn't
// tuned for. Everything below this block is upstream neo-retro.
// ---------------------------------------------------------------------------
const AllThemes: ThemeOption[] = themesData as ThemeOption[];

export const Themes: ThemeOption[] = AllThemes.filter((t) => t.mode === 'light');

export const themeMap = new Map(Themes.map((t) => [t.id, t]));

export const defaultLightTheme =
  FavoriteThemes.map((id) => themeMap.get(id)).find((t) => t?.mode === 'light')?.id ??
  Themes.find((t) => t.mode === 'light')!.id;

// No dark theme is offered; ThemeInit still reads this, so point it at the light default.
export const defaultDarkTheme = defaultLightTheme;

export function getDefaultThemeForMode(_currentMode?: string | null): string {
  return defaultLightTheme;
}

export const defaultMode = 'light';

export function applyTheme(id: string) {
  const t = themeMap.get(id);
  if (!t) return;
  setTheme(id);
  setMode(t.mode);
}

export function resetToDefaultTheme() {
  const currentMode = mode.current;
  const targetId = getDefaultThemeForMode(currentMode);
  applyTheme(targetId);
}

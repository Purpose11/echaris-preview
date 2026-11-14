import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "echaris-theme";
const DEFAULT_THEME = "light";

export type ThemeMode = "light" | "dark";

function getStoredTheme(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
    return null;
  } catch {
    return null;
  }
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute("data-theme", theme);
}

/** Explicit light/dark switch. Light is the app default until the user toggles. */
export function useTheme(): [ThemeMode, () => void] {
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme() || DEFAULT_THEME);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: ThemeMode = current === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore quota / private mode failures
      }
      return next;
    });
  }, []);

  return [theme, toggle];
}

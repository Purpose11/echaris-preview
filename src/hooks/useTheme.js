import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'echaris-theme';

function getSystemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

/** Explicit light/dark switch, defaulting to system preference until the user picks one. */
export function useTheme() {
  const [theme, setTheme] = useState(() => getStoredTheme() || getSystemTheme());

  useEffect(() => { applyTheme(theme); }, [theme]);

  useEffect(() => {
    if (getStoredTheme()) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setTheme(getSystemTheme());
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  }, []);

  return [theme, toggle];
}

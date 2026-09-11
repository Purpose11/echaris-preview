import { useEffect, useState } from 'react';

let reduceMotion = false;
try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch {}

/** Cycles through `words` every `intervalMs`. Returns [word, index] — key the
 * animated element on `index` so a fresh entrance animation plays per word. */
export function useRotatingWord(words, intervalMs = 2600) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || words.length < 2) return;
    const id = setInterval(() => setIndex(i => (i + 1) % words.length), intervalMs);
    return () => clearInterval(id);
  }, [words, intervalMs]);

  return [words[index], index];
}

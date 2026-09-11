import { useEffect, useState } from 'react';

let reduceMotion = false;
try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch {}

const easeOutExpo = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Counts up from 0 to `target` once, starting after `delayMs`. */
export function useCountUp(target, { durationMs = 1400, delayMs = 0 } = {}) {
  const [value, setValue] = useState(reduceMotion ? target : 0);

  useEffect(() => {
    if (reduceMotion) { setValue(target); return; }
    let raf; let start;
    const tick = now => {
      if (start === undefined) start = now;
      const t = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * easeOutExpo(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => { raf = requestAnimationFrame(tick); }, delayMs);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [target, durationMs, delayMs]);

  return value;
}

import { useEffect, useRef, useState } from 'react';

let reduceMotion = false;
try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch {}

/** Ref + visible flag: true once the element has scrolled into view. Fires once. */
export function useReveal(options) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px', ...options }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, visible];
}

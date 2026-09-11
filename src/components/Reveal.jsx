import React from 'react';
import { useReveal } from '../hooks/useReveal.js';

/**
 * Fades/rises an element in once it scrolls into view. Safe to use for
 * standalone blocks; for items that must stay a direct grid/flex child of a
 * parent (cards in a row, etc.), use the `useReveal` hook directly on that
 * element instead so no extra wrapper node is introduced into the layout.
 */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
  const [ref, visible] = useReveal();
  return (
    <Tag
      ref={ref}
      className={'reveal' + (visible ? ' is-visible' : '') + (className ? ' ' + className : '')}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms', ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

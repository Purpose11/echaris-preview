import React from 'react';

/* The ECharis lockup. Two supplied artworks only: orange (light surfaces) and
   white (dark or brand surfaces). Never recoloured, never redrawn. */
export function Logo({ variant = 'orange', height = 28, src, style, ...rest }) {
  const base = src || (variant === 'white' ? 'assets/echaris-logo-white.png' : 'assets/echaris-logo-orange.png');
  return <img src={base} alt="ECharis" style={{ height, width: 'auto', display: 'block', ...style }} {...rest} />;
}

import React from 'react';

const CDN = 'https://unpkg.com/lucide-static@0.460.0/icons/';
const cache = {};

/* Lucide outline icon. The SVG source is fetched once per name, cached, and
   inlined so it inherits currentColor and survives DOM-based screenshotting. */
export function Icon({ name, size = 20, style, className, title, ...rest }) {
  const [markup, setMarkup] = React.useState(cache[name] || null);

  React.useEffect(() => {
    let live = true;
    if (cache[name]) { setMarkup(cache[name]); return; }
    fetch(CDN + name + '.svg')
      .then(r => (r.ok ? r.text() : ''))
      .then(t => {
        const cleaned = t
          .replace(/<\?xml[^>]*\?>/g, '')
          .replace(/width="24"/, 'width="100%"')
          .replace(/height="24"/, 'height="100%"');
        cache[name] = cleaned;
        if (live) setMarkup(cleaned);
      })
      .catch(() => {});
    return () => { live = false; };
  }, [name]);

  return (
    <span
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
        width: size,
        height: size,
        color: 'inherit',
        ...style,
      }}
      {...rest}
    />
  );
}

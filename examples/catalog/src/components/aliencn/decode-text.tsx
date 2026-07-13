'use client';

import * as React from 'react';

import { cn } from '@/lib/aliencn/cn';

export interface DecodeTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  /** Milliseconds from first glyph to fully resolved text. */
  duration?: number;
  /** Scramble character set used for unresolved glyphs. */
  glyphs?: string;
}

/**
 * Text that scrambles into place the first time it enters the viewport.
 * Server markup and screen readers always get the real text; the scramble is
 * a purely visual layer that never runs under reduced motion.
 */
export function DecodeText({
  text,
  duration = 700,
  glyphs = '#[]<>/\\=+*x10',
  className,
  ...props
}: DecodeTextProps): React.JSX.Element {
  const [display, setDisplay] = React.useState(text);
  const hostRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(text);
      return;
    }

    let frame = 0;
    let started = 0;

    const step = (now: number): void => {
      if (!started) started = now;
      const progress = Math.min(1, (now - started) / duration);
      const resolved = Math.floor(progress * text.length);
      let output = text.slice(0, resolved);
      for (let index = resolved; index < text.length; index += 1) {
        const character = text[index] ?? '';
        output +=
          character === ' ' ? ' ' : glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      setDisplay(output);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        frame = requestAnimationFrame(step);
      }
    });
    observer.observe(host);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [duration, glyphs, text]);

  return (
    <span {...props} ref={hostRef} className={cn('aliencn-decode', className)}>
      <span aria-hidden="true">{display}</span>
      <span className="aliencn-sr-only">{text}</span>
    </span>
  );
}

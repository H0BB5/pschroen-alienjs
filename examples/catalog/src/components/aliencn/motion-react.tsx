'use client';

import * as React from 'react';

import { FadeTransition, PageTransition } from './motion/PageTransition.js';
import { Title } from './motion/Title.js';
import type { TitleOptions } from './motion/Title.js';

/**
 * Thin React bindings for the vendored KYA-OS motion modules in `./motion/`.
 * All animation logic lives in those framework-agnostic vanilla ES modules;
 * this file only manages their lifecycle from React so that Next.js apps and
 * static sites run the same underlying bytes.
 */

export interface TitleRevealProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The text to reveal; it stays the accessible name while letters animate. */
  text: string;
  /** Options for the vendored Title module, captured once on mount. */
  options?: TitleOptions;
}

/**
 * Letter-by-letter decrypt reveal over the vendored `Title` module.
 * Server markup and screen readers always get the real text; the scramble is
 * a purely visual layer that never runs under reduced motion.
 */
export function TitleReveal({ text, options, ...props }: TitleRevealProps): React.JSX.Element {
  const hostRef = React.useRef<HTMLSpanElement>(null);
  const optionsRef = React.useRef(options);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    host.textContent = text;
    const title = new Title(host, optionsRef.current);
    void title.animateIn();

    return () => {
      // Never strand hidden or scrambled letters on unmount or replay.
      host.textContent = text;
      host.style.visibility = '';
    };
  }, [text]);

  return (
    <span ref={hostRef} aria-label={text} {...props}>
      {text}
    </span>
  );
}

export type PageTransitionVariant = 'fade' | 'wipe';

export interface PageTransitionHandle {
  /** Plays the exit transition, then navigates to the URL. */
  navigateTo: (url: string) => Promise<void>;
}

// The vendored transitions intercept link clicks with document-level
// listeners for the lifetime of the page, so each variant is constructed at
// most once per page load no matter how often consumers mount the hook.
let fadeSingleton: FadeTransition | null = null;
let wipeSingleton: PageTransition | null = null;

/**
 * Mounts the vendored page transition (overlay creation, link interception,
 * entrance animation) and returns a handle for programmatic navigation.
 * Overlay styling stays owned by the consuming site, exactly as it is for
 * static KYA-OS pages.
 */
export function usePageTransition(variant: PageTransitionVariant = 'fade'): PageTransitionHandle {
  React.useEffect(() => {
    if (variant === 'wipe') {
      if (!wipeSingleton) {
        wipeSingleton = new PageTransition();
        void wipeSingleton.enter();
      }
      return;
    }
    if (!fadeSingleton) {
      fadeSingleton = new FadeTransition();
      void fadeSingleton.enter();
    }
  }, [variant]);

  return React.useMemo(
    () => ({
      navigateTo: (url: string): Promise<void> => {
        const transition = variant === 'wipe' ? wipeSingleton : fadeSingleton;
        return transition ? transition.navigateTo(url) : Promise.resolve();
      }
    }),
    [variant]
  );
}

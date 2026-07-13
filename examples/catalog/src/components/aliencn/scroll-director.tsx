'use client';

import * as React from 'react';

export interface ScrollDirectorProps {
  /** Velocity-to-skew factor from Space.js SmoothSkew; 0 disables the lean. */
  skew?: number;
  /** Velocity-to-translate factor for the vertical trail; 0 disables it. */
  shift?: number;
  /** Lerp speed of the scroll shadow that produces the smoothed velocity. */
  lerpSpeed?: number;
}

const MAX_SHIFT = 22;
/** A single scroll event moving further than this is a teleport (router
 * navigation, hash jump, Home/End), not momentum; it produces no velocity. */
const TELEPORT_THRESHOLD = 400;

/**
 * Kinetic scroll response adapted from Space.js SmoothSkew (pschroen),
 * based on https://codepen.io/ReGGae/pen/pxMJLW.
 *
 * Scrolling stays fully native, so input never lags. A lerped shadow of the
 * scroll position produces a smoothed per-frame velocity that drives the
 * `--kinetic-skew` and `--kinetic-shift` custom properties; the foundation
 * stylesheet applies them to any element carrying `data-kinetic`. The loop
 * runs only while scrolling and eases itself back to rest.
 *
 * Also owns the modal scroll lock for native <dialog> surfaces and gives
 * same-page anchors a smooth glide (native scroll-behavior can stay `auto`
 * so route changes land instantly). Mount it once, typically in the root
 * layout. Touch devices and reduced-motion preferences keep native scrolling
 * with no transforms.
 */
export function ScrollDirector({
  skew = 3,
  shift = -0.45,
  lerpSpeed = 0.1
}: ScrollDirectorProps): null {
  React.useEffect(() => {
    const html = document.documentElement;

    const syncModalLock = (): void => {
      html.classList.toggle('aliencn-modal-lock', document.querySelector('dialog[open]') !== null);
    };
    const modalObserver = new MutationObserver(syncModalLock);
    modalObserver.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['open']
    });
    syncModalLock();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // In-page anchors glide via scrollIntoView, which stays smooth even when
    // the document-level scroll-behavior is `auto` for route jumps.
    const onClick = (event: MouseEvent): void => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const anchor = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (!anchor) return;
      const id = anchor.getAttribute('href')?.slice(1);
      const section = id ? document.getElementById(id) : null;
      if (!section) return;
      event.preventDefault();
      history.pushState(null, '', `#${id}`);
      section.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    };
    document.addEventListener('click', onClick);

    if (reduced || navigator.maxTouchPoints > 0) {
      return () => {
        modalObserver.disconnect();
        html.classList.remove('aliencn-modal-lock');
        document.removeEventListener('click', onClick);
      };
    }

    let smoothed = window.scrollY;
    let last = window.scrollY;
    let lastEventY = window.scrollY;
    let frame = 0;
    let idleFrames = 0;

    const setKinetic = (skewValue: number, shiftValue: number): void => {
      html.style.setProperty('--kinetic-skew', `${skewValue.toFixed(4)}deg`);
      html.style.setProperty('--kinetic-shift', `${shiftValue.toFixed(2)}px`);
    };

    const step = (): void => {
      smoothed += (window.scrollY - smoothed) * lerpSpeed;
      const delta = smoothed - last;
      last = smoothed;

      const lean = (delta / html.clientWidth) * 10 * skew;
      setKinetic(
        Math.max(-skew, Math.min(skew, lean)),
        Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, delta * shift))
      );

      const settled = Math.abs(delta) < 0.05 && Math.abs(window.scrollY - smoothed) < 0.5;
      idleFrames = settled ? idleFrames + 1 : 0;
      if (idleFrames > 6) {
        smoothed = window.scrollY;
        last = smoothed;
        setKinetic(0, 0);
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(step);
    };

    const onScroll = (): void => {
      const jump = Math.abs(window.scrollY - lastEventY);
      lastEventY = window.scrollY;
      if (jump > TELEPORT_THRESHOLD) {
        smoothed = window.scrollY;
        last = smoothed;
        setKinetic(0, 0);
        return;
      }
      if (!frame) {
        idleFrames = 0;
        frame = requestAnimationFrame(step);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      modalObserver.disconnect();
      html.classList.remove('aliencn-modal-lock');
      cancelAnimationFrame(frame);
      html.style.removeProperty('--kinetic-skew');
      html.style.removeProperty('--kinetic-shift');
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
    };
  }, [lerpSpeed, shift, skew]);

  return null;
}

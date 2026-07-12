'use client';

import * as React from 'react';

const LERP_SPEED = 0.1;
const SKEW = 3;
const MAX_SKEW = 2;
const SHIFT_FACTOR = -0.45;
const MAX_SHIFT = 22;
/** A single scroll event moving further than this is a teleport (router
 * navigation, hash jump, Home/End), not momentum; it produces no velocity. */
const TELEPORT_THRESHOLD = 400;

/**
 * Kinetic scroll response adapted from Space.js SmoothSkew (pschroen),
 * based on https://codepen.io/ReGGae/pen/pxMJLW.
 *
 * Scrolling stays fully native, so input never lags. A lerped shadow of the
 * scroll position produces a smoothed per-frame velocity, and that velocity
 * drives `--kinetic-skew` and `--kinetic-shift` custom properties which the
 * stylesheet applies as subtle skew/translate on content blocks. The loop
 * runs only while scrolling and eases itself back to rest.
 *
 * Also owns the modal scroll lock for native <dialog> surfaces.
 */
export function ScrollDirector(): null {
  React.useEffect(() => {
    const html = document.documentElement;

    const syncModalLock = (): void => {
      html.classList.toggle('catalog-modal-lock', document.querySelector('dialog[open]') !== null);
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

    // In-page anchors glide via scrollIntoView, which stays smooth even
    // though the document-level scroll-behavior is `auto` for route jumps.
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
        html.classList.remove('catalog-modal-lock');
        document.removeEventListener('click', onClick);
      };
    }

    let smoothed = window.scrollY;
    let last = window.scrollY;
    let frame = 0;
    let idleFrames = 0;

    const setKinetic = (skew: number, shift: number): void => {
      html.style.setProperty('--kinetic-skew', `${skew.toFixed(4)}deg`);
      html.style.setProperty('--kinetic-shift', `${shift.toFixed(2)}px`);
    };

    const step = (): void => {
      smoothed += (window.scrollY - smoothed) * LERP_SPEED;
      const delta = smoothed - last;
      last = smoothed;

      const skew = (delta / html.clientWidth) * 10 * SKEW;
      setKinetic(
        Math.max(-MAX_SKEW, Math.min(MAX_SKEW, skew)),
        Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, delta * SHIFT_FACTOR))
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

    let lastEventY = window.scrollY;

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
      html.classList.remove('catalog-modal-lock');
      cancelAnimationFrame(frame);
      html.style.removeProperty('--kinetic-skew');
      html.style.removeProperty('--kinetic-shift');
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return null;
}

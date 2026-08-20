/**
 * Interim ambient declarations for the vendored KYA-OS motion module
 * `PageTransition.js`. The JavaScript file is the byte-faithful source of
 * truth; this shim only describes its public surface for TypeScript
 * consumers.
 */

export interface PageTransitionOptions {
  /** Transition duration in milliseconds; defaults to 600. */
  duration?: number;
  /** Easing name from UIUtils; defaults to `easeInOutQuart`. */
  easing?: string;
  /** Overlay color; defaults to `#0a0a0a`. */
  overlayColor?: string;
}

/**
 * Full-screen wipe transition. Both classes intercept same-origin link
 * clicks for the lifetime of the page; construct one instance per page load.
 * Overlay styling (`.page-transition-overlay`, `.fade-transition-overlay`)
 * is owned by the consuming site.
 */
export declare class PageTransition {
  constructor(options?: PageTransitionOptions);
  isTransitioning: boolean;
  navigateTo(url: string): Promise<void>;
  transitionOut(): Promise<void>;
  transitionIn(): Promise<void>;
  /** Entrance animation for the current page load. */
  enter(): Promise<void>;
}

/** Simpler overlay fade transition with bfcache-safe state resets. */
export declare class FadeTransition {
  constructor();
  isTransitioning: boolean;
  reset(): void;
  navigateTo(url: string): Promise<void>;
  /** Entrance hook for the current page load. */
  enter(): Promise<void>;
}

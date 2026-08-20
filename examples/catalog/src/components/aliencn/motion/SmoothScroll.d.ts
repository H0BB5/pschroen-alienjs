/**
 * Interim ambient declarations for the vendored KYA-OS motion module
 * `SmoothScroll.js`. The JavaScript file is the byte-faithful source of
 * truth; this shim only describes its public surface for TypeScript
 * consumers.
 */

export interface SmoothScrollOptions {
  /** Interpolation factor per frame; defaults to 0.1. */
  lerpSpeed?: number;
  /** Velocity-to-skew multiplier; defaults to 7.5. */
  skewAmount?: number;
  /** Scroll container; defaults to `.scroll-container`. */
  container?: HTMLElement | null;
}

export declare class SmoothScroll {
  constructor(options?: SmoothScrollOptions);
  isEnabled: boolean;
  enable(): void;
  disable(): void;
  /** Normalized scroll progress between 0 and 1. */
  get progress(): number;
  scrollTo(target: number | Element, instant?: boolean): void;
}

export interface ScrollSkewOptions {
  /** Elements to skew; defaults to `[data-scroll-skew]`. */
  elements?: ArrayLike<HTMLElement>;
  /** Maximum skew in degrees; defaults to 3. */
  skewAmount?: number;
  /** Interpolation factor per frame; defaults to 0.15. */
  lerpSpeed?: number;
}

export declare class ScrollSkew {
  constructor(options?: ScrollSkewOptions);
  destroy(): void;
}

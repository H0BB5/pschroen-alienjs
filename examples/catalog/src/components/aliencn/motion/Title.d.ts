/**
 * Interim ambient declarations for the vendored KYA-OS motion module
 * `Title.js`. The JavaScript file is the byte-faithful source of truth;
 * this shim only describes its public surface for TypeScript consumers.
 */

export interface TitleOptions {
  /** Delay in milliseconds before the reveal starts. */
  revealDelay?: number;
  /** Delay in milliseconds between letter reveals. */
  letterDelay?: number;
  /** Character set used for the glitch frames. */
  glitchChars?: string;
  /** Glitch frames shown per letter before it settles. */
  glitchIterations?: number;
}

export declare class Title {
  constructor(element: HTMLElement, options?: TitleOptions);
  element: HTMLElement;
  originalText: string;
  letters: HTMLSpanElement[];
  animateIn(): Promise<void>;
  animateOut(): Promise<void>;
  setTitle(newText: string): Promise<void>;
}

/** Instantiates and auto-animates every `[data-title-reveal]` element. */
export declare function initTitles(): Title[];

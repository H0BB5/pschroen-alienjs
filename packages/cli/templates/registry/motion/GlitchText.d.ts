/**
 * Interim ambient declarations for the vendored KYA-OS motion module
 * `GlitchText.js`. The JavaScript file is the byte-faithful source of truth;
 * this shim only describes its public surface for TypeScript consumers.
 */

export interface GlitchTextOptions {
  /** Character set used for scrambled glyphs. */
  glitchChars?: string;
  /** Scramble frames per glitch. */
  iterations?: number;
  /** Milliseconds per scramble frame. */
  speed?: number;
  /** Attach the hover trigger automatically; defaults to true. */
  triggerOnHover?: boolean;
}

export declare class GlitchText {
  constructor(element: HTMLElement, options?: GlitchTextOptions);
  element: HTMLElement;
  originalText: string;
  isGlitching: boolean;
  glitch(): Promise<void>;
  startAmbientGlitch(interval?: number): void;
  stopAmbientGlitch(): void;
  microGlitch(): Promise<void>;
}

/** Instantiates a GlitchText for every `[data-glitch]` element. */
export declare function initGlitchText(): void;

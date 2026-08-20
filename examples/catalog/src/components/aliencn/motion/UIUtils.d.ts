/**
 * Interim ambient declarations for the vendored KYA-OS motion module
 * `UIUtils.js`. The JavaScript file is the byte-faithful source of truth;
 * this shim only describes its public surface for TypeScript consumers.
 */

export type EasingFunction = (t: number) => number;

export type EasingName =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInQuint'
  | 'easeOutQuint'
  | 'easeInOutQuint'
  | 'easeInSine'
  | 'easeOutSine'
  | 'easeInOutSine'
  | 'easeInExpo'
  | 'easeOutExpo'
  | 'easeInOutExpo'
  | 'easeOutElastic'
  | 'easeOutBack';

export declare const Easing: Readonly<Record<EasingName, EasingFunction>>;

/** Animatable properties: `opacity` plus transform channels. */
export interface TweenProps {
  opacity?: number;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  skewX?: number;
  skewY?: number;
}

export declare function tween(
  element: HTMLElement,
  props: TweenProps,
  duration?: number,
  easing?: EasingName | EasingFunction,
  delay?: number
): Promise<void>;

export declare function shuffle<T>(array: readonly T[]): T[];

export declare function lerp(a: number, b: number, t: number): number;

export declare function clamp(value: number, min: number, max: number): number;

export declare function wait(ms: number): Promise<void>;

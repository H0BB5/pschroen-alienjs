export interface CSSProps {
    // Transforms
    x?: number;
    y?: number;
    z?: number;
    skewX?: number;
    skewY?: number;
    rotation?: number;
    rotationX?: number;
    rotationY?: number;
    rotationZ?: number;
    scale?: number;
    scaleX?: number;
    scaleY?: number;
    scaleZ?: number;
    // Filters
    blur?: number;
    brightness?: number;
    contrast?: number;
    grayscale?: number;
    hue?: number;
    invert?: number;
    saturate?: number;
    sepia?: number;
    // Numeric (string allowed for CSS custom properties)
    opacity?: number | string;
    zIndex?: number;
    fontWeight?: number;
    strokeWidth?: number | string;
    strokeDashoffset?: number;
    stopOpacity?: number;
    flexGrow?: number;
    // Any other CSS property
    [key: string]: string | number | undefined;
}

export interface TweenProps {
    spring?: number;
    damping?: number;
    [key: string]: number | undefined;
}

export type EasingName =
    | 'linear'
    | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
    | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic'
    | 'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart'
    | 'easeInQuint' | 'easeOutQuint' | 'easeInOutQuint'
    | 'easeInSine' | 'easeOutSine' | 'easeInOutSine'
    | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo'
    | 'easeInCirc' | 'easeOutCirc' | 'easeInOutCirc'
    | 'easeInBack' | 'easeOutBack' | 'easeInOutBack'
    | 'easeInElastic' | 'easeOutElastic' | 'easeInOutElastic'
    | 'easeInBounce' | 'easeOutBounce' | 'easeInOutBounce';

export type EasingFunction = (t: number, spring?: number, damping?: number) => number;

export interface TickerCallback {
    (time: number, delta: number, frame: number): void;
    fps?: number;
    last?: number;
    frame?: number;
}

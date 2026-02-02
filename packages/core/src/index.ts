// Types
export type {
    CSSProps,
    TweenProps,
    EasingName,
    EasingFunction,
    TickerCallback
} from './types.js';

// Utils
export { EventEmitter } from './utils/EventEmitter.js';
export { Interface } from './utils/Interface.js';
export { Stage } from './utils/Stage.js';
export {
    PI, TwoPI, PI90, PI60, Third,
    degToRad, radToDeg,
    isPowerOfTwo, ceilPowerOfTwo, floorPowerOfTwo,
    clamp, euclideanModulo,
    mapLinear, inverseLerp, lerp, step, smoothstep, smootherstep,
    parabola, pcurve, fract,
    average, rms, median, peaks, consecutive,
    shuffle, randInt, randFloat, randFloatSpread, headsTails,
    brightness, basename, extension, absolute,
    getKeyByValue, getConstructor
} from './utils/Utils.js';

// Tween
export { default as BezierEasing } from './tween/BezierEasing.js';
export { Easing } from './tween/Easing.js';
export { Ticker, ticker } from './tween/Ticker.js';
export { Tween, tween, clearTween, delayedCall, wait, defer } from './tween/Tween.js';

// Math
export { Vector2 } from './math/Vector2.js';
export { Color } from './math/Color.js';

import type { EasingFunction, EasingName } from '../types.js';

import BezierEasing from './BezierEasing.js';

const bezierMap = new Map<string, EasingFunction>();

export class Easing {
    static linear(t: number): number {
        return t;
    }

    static easeInQuad(t: number): number {
        return t * t;
    }

    static easeOutQuad(t: number): number {
        return t * (2 - t);
    }

    static easeInOutQuad(t: number): number {
        if ((t *= 2) < 1) {
            return 0.5 * t * t;
        }

        return -0.5 * (--t * (t - 2) - 1);
    }

    static easeInCubic(t: number): number {
        return t * t * t;
    }

    static easeOutCubic(t: number): number {
        return --t * t * t + 1;
    }

    static easeInOutCubic(t: number): number {
        if ((t *= 2) < 1) {
            return 0.5 * t * t * t;
        }

        return 0.5 * ((t -= 2) * t * t + 2);
    }

    static easeInQuart(t: number): number {
        return t * t * t * t;
    }

    static easeOutQuart(t: number): number {
        return 1 - --t * t * t * t;
    }

    static easeInOutQuart(t: number): number {
        if ((t *= 2) < 1) {
            return 0.5 * t * t * t * t;
        }

        return -0.5 * ((t -= 2) * t * t * t - 2);
    }

    static easeInQuint(t: number): number {
        return t * t * t * t * t;
    }

    static easeOutQuint(t: number): number {
        return --t * t * t * t * t + 1;
    }

    static easeInOutQuint(t: number): number {
        if ((t *= 2) < 1) {
            return 0.5 * t * t * t * t * t;
        }

        return 0.5 * ((t -= 2) * t * t * t * t + 2);
    }

    static easeInSine(t: number): number {
        return 1 - Math.sin(((1 - t) * Math.PI) / 2);
    }

    static easeOutSine(t: number): number {
        return Math.sin((t * Math.PI) / 2);
    }

    static easeInOutSine(t: number): number {
        return 0.5 * (1 - Math.sin(Math.PI * (0.5 - t)));
    }

    static easeInExpo(t: number): number {
        return t === 0 ? 0 : Math.pow(1024, t - 1);
    }

    static easeOutExpo(t: number): number {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    static easeInOutExpo(t: number): number {
        if (t === 0 || t === 1) {
            return t;
        }

        if ((t *= 2) < 1) {
            return 0.5 * Math.pow(1024, t - 1);
        }

        return 0.5 * (-Math.pow(2, -10 * (t - 1)) + 2);
    }

    static easeInCirc(t: number): number {
        return 1 - Math.sqrt(1 - t * t);
    }

    static easeOutCirc(t: number): number {
        return Math.sqrt(1 - --t * t);
    }

    static easeInOutCirc(t: number): number {
        if ((t *= 2) < 1) {
            return -0.5 * (Math.sqrt(1 - t * t) - 1);
        }

        return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
    }

    static easeInBack(t: number): number {
        const s = 1.70158;

        return t === 1 ? 1 : t * t * ((s + 1) * t - s);
    }

    static easeOutBack(t: number): number {
        const s = 1.70158;

        return t === 0 ? 0 : --t * t * ((s + 1) * t + s) + 1;
    }

    static easeInOutBack(t: number): number {
        const s = 1.70158 * 1.525;

        if ((t *= 2) < 1) {
            return 0.5 * (t * t * ((s + 1) * t - s));
        }

        return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
    }

    static easeInElastic(t: number, amplitude: number = 1, period: number = 0.3): number {
        if (t === 0 || t === 1) {
            return t;
        }

        const pi2 = Math.PI * 2;
        const s = period / pi2 * Math.asin(1 / amplitude);

        return -(amplitude * Math.pow(2, 10 * --t) * Math.sin((t - s) * pi2 / period));
    }

    static easeOutElastic(t: number, amplitude: number = 1, period: number = 0.3): number {
        if (t === 0 || t === 1) {
            return t;
        }

        const pi2 = Math.PI * 2;
        const s = period / pi2 * Math.asin(1 / amplitude);

        return amplitude * Math.pow(2, -10 * t) * Math.sin((t - s) * pi2 / period) + 1;
    }

    static easeInOutElastic(t: number, amplitude: number = 1, period: number = 0.3 * 1.5): number {
        if (t === 0 || t === 1) {
            return t;
        }

        const pi2 = Math.PI * 2;
        const s = period / pi2 * Math.asin(1 / amplitude);

        if ((t *= 2) < 1) {
            return -0.5 * (amplitude * Math.pow(2, 10 * --t) * Math.sin((t - s) * pi2 / period));
        }

        return amplitude * Math.pow(2, -10 * --t) * Math.sin((t - s) * pi2 / period) * 0.5 + 1;
    }

    static easeInBounce(t: number): number {
        return 1 - Easing.easeOutBounce(1 - t);
    }

    static easeOutBounce(t: number): number {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }

    static easeInOutBounce(t: number): number {
        if (t < 0.5) {
            return Easing.easeInBounce(t * 2) * 0.5;
        }

        return Easing.easeOutBounce(t * 2 - 1) * 0.5 + 0.5;
    }

    static addBezier(name: string, mX1: number, mY1: number, mX2: number, mY2: number): void {
        bezierMap.set(name, BezierEasing(mX1, mY1, mX2, mY2));
    }

    static get(name: string): EasingFunction {
        return bezierMap.get(name) ?? (Easing as any)[name] ?? Easing.easeOutCubic;
    }
}

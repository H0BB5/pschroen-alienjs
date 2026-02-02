import type { EasingFunction, EasingName, TickerCallback } from '../types.js';

import { Easing } from './Easing.js';
import { ticker } from './Ticker.js';

const Tweens: Tween[] = [];

export class Tween {
    object: any;
    duration: number;
    elapsed: number;
    ease: EasingFunction;
    delay: number;
    complete: (() => void) | null;
    update: (() => void) | null;
    isAnimating: boolean;
    from: Record<string, number>;
    to: Record<string, number>;
    spring: number | undefined;
    damping: number | undefined;

    constructor(
        object: any,
        props: Record<string, any> | null,
        duration: number,
        ease: EasingName | EasingFunction | string,
        delay?: number | (() => void) | null,
        complete?: (() => void) | null,
        update?: (() => void) | null
    ) {
        if (typeof delay !== 'number') {
            update = complete as (() => void) | null;
            complete = delay as (() => void) | null;
            delay = 0;
        }

        this.object = object;
        this.duration = duration;
        this.elapsed = 0;
        this.ease = typeof ease === 'function' ? ease : Easing.get(ease);
        this.delay = delay;
        this.complete = complete ?? null;
        this.update = update ?? null;
        this.isAnimating = false;

        this.from = {};
        this.to = Object.assign({}, props);

        this.spring = this.to.spring;
        this.damping = this.to.damping;

        delete this.to.spring;
        delete this.to.damping;

        for (const prop in this.to) {
            if (typeof this.to[prop] === 'number' && typeof object[prop] === 'number') {
                this.from[prop] = object[prop];
            }
        }

        this.start();
    }

    // Event handlers

    onUpdate: TickerCallback = (_time: number, delta: number) => {
        this.elapsed += delta;

        const progress = Math.max(0, Math.min(1, (this.elapsed - this.delay) / this.duration));
        const alpha = this.ease(progress, this.spring, this.damping);

        for (const prop in this.from) {
            this.object[prop] = this.from[prop] + (this.to[prop] - this.from[prop]) * alpha;
        }

        if (this.update) {
            this.update();
        }

        if (progress === 1) {
            clearTween(this);

            if (this.complete) {
                this.complete();
            }
        }
    };

    // Public methods

    start(): void {
        if (this.isAnimating) {
            return;
        }

        this.isAnimating = true;

        ticker.add(this.onUpdate);
    }

    stop(): void {
        if (!this.isAnimating) {
            return;
        }

        this.isAnimating = false;

        ticker.remove(this.onUpdate);
    }
}

export function delayedCall(duration: number, complete: () => void): Tween {
    const tween = new Tween(complete, null, duration, 'linear', 0, complete);

    Tweens.push(tween);

    return tween;
}

export function wait(duration: number = 0): Promise<void> {
    return new Promise(resolve => delayedCall(duration, resolve));
}

export function defer(complete?: () => void): Promise<void> {
    const promise = new Promise<void>(resolve => delayedCall(0, resolve));

    if (complete) {
        promise.then(complete);
    }

    return promise;
}

export function tween(
    object: any,
    props: Record<string, any>,
    duration: number,
    ease: EasingName | EasingFunction | string,
    delay?: number | (() => void) | null,
    complete?: (() => void) | null,
    update?: (() => void) | null
): Promise<void> {
    if (typeof delay !== 'number') {
        update = complete as (() => void) | null;
        complete = delay as (() => void) | null;
        delay = 0;
    }

    const promise = new Promise<void>(resolve => {
        const t = new Tween(object, props, duration, ease, delay as number, resolve, update);

        Tweens.push(t);
    });

    if (complete) {
        promise.then(complete);
    }

    return promise;
}

export function clearTween(object: any): void {
    if (object instanceof Tween) {
        object.stop();

        const index = Tweens.indexOf(object);

        if (~index) {
            Tweens.splice(index, 1);
        }
    } else {
        for (let i = Tweens.length - 1; i >= 0; i--) {
            if (Tweens[i].object === object) {
                clearTween(Tweens[i]);
            }
        }
    }
}

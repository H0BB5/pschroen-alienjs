import type { TickerCallback } from '../types.js';

let RequestFrame: (callback: (time: number) => void) => any;
let CancelFrame: (id: any) => void;

if (typeof window !== 'undefined') {
    RequestFrame = window.requestAnimationFrame;
    CancelFrame = window.cancelAnimationFrame;
} else {
    const startTime = performance.now();
    const timestep = 1000 / 60;

    RequestFrame = (callback: (time: number) => void) => {
        return setTimeout(() => {
            callback(performance.now() - startTime);
        }, timestep);
    };

    CancelFrame = clearTimeout;
}

/**
 * A minimal requestAnimationFrame render loop with worker support.
 */
export class Ticker {
    callbacks: TickerCallback[];
    last: number;
    time: number;
    delta: number;
    frame: number;
    isAnimating: boolean;
    private requestId: any;

    constructor() {
        this.callbacks = [];
        this.last = performance.now();
        this.time = 0;
        this.delta = 0;
        this.frame = 0;
        this.isAnimating = false;
    }

    // Event handlers

    onTick = (time: number): void => {
        if (this.isAnimating) {
            this.requestId = RequestFrame(this.onTick);
        }

        this.delta = time - this.last;
        this.last = time;
        this.time = time * 0.001; // seconds
        this.frame++;

        for (let i = this.callbacks.length - 1; i >= 0; i--) {
            const callback = this.callbacks[i];

            if (!callback) {
                continue;
            }

            if (callback.fps) {
                const delta = time - (callback.last ?? 0);

                if (delta < 1000 / callback.fps) {
                    continue;
                }

                callback.last = time;
                callback.frame = (callback.frame ?? 0) + 1;

                callback(this.time, delta, callback.frame);
                continue;
            }

            callback(this.time, this.delta, this.frame);
        }
    };

    // Public methods

    add(callback: TickerCallback, fps?: number): void {
        if (fps) {
            callback.fps = fps;
            callback.last = performance.now();
            callback.frame = 0;
        }

        this.callbacks.unshift(callback);
    }

    remove(callback: TickerCallback): void {
        const index = this.callbacks.indexOf(callback);

        if (~index) {
            this.callbacks.splice(index, 1);
        }
    }

    start(): void {
        if (this.isAnimating) {
            return;
        }

        this.isAnimating = true;

        this.requestId = RequestFrame(this.onTick);
    }

    stop(): void {
        if (!this.isAnimating) {
            return;
        }

        this.isAnimating = false;

        CancelFrame(this.requestId);
    }

    setRequestFrame(request: (callback: (time: number) => void) => any): void {
        RequestFrame = request;
    }

    setCancelFrame(cancel: (id: any) => void): void {
        CancelFrame = cancel;
    }
}

export const ticker = new Ticker();

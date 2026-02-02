/**
 * A simple implementation of EventTarget with Map() based types,
 * and event parameter spread.
 */
export class EventEmitter {
    map: Map<string, ((...args: any[]) => void)[]>;

    constructor() {
        this.map = new Map();
    }

    on(type: string, callback: (...args: any[]) => void): void {
        if (!this.map.has(type)) {
            this.map.set(type, new Array());
        }

        this.map.get(type)!.push(callback);
    }

    off(type: string, callback?: (...args: any[]) => void): void {
        if (!this.map.has(type)) {
            return;
        }

        if (callback) {
            const array = this.map.get(type)!;
            const index = array.indexOf(callback);

            if (~index) {
                array.splice(index, 1);
            }
        } else {
            this.map.delete(type);
        }
    }

    emit(type: string, ...event: any[]): void {
        if (!this.map.has(type)) {
            return;
        }

        // Make a copy, in case callbacks are removed while iterating
        const array = Array.from(this.map.get(type)!);

        for (let i = 0, l = array.length; i < l; i++) {
            array[i].call(this, ...event);
        }
    }

    destroy(): null {
        this.map.clear();

        for (const prop in this) {
            (this as any)[prop] = null;
        }

        return null;
    }
}

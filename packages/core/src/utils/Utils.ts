export const PI: number = Math.PI;
export const TwoPI: number = Math.PI * 2;
export const PI90: number = Math.PI / 2;
export const PI60: number = Math.PI / 3;
export const Third: number = Math.PI * 2 / 3;

export function degToRad(degrees: number): number {
    return degrees * Math.PI / 180;
}

export function radToDeg(radians: number): number {
    return radians * 180 / Math.PI;
}

export function isPowerOfTwo(value: number): boolean {
    return (value & (value - 1)) === 0 && value !== 0;
}

export function ceilPowerOfTwo(value: number): number {
    return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
}

export function floorPowerOfTwo(value: number): number {
    return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function euclideanModulo(n: number, m: number): number {
    return ((n % m) + m) % m;
}

export function mapLinear(x: number, a1: number, a2: number, b1: number, b2: number): number {
    return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
}

export function inverseLerp(x: number, y: number, value: number): number {
    if (x !== y) {
        return (value - x) / (y - x);
    } else {
        return 0;
    }
}

export function lerp(x: number, y: number, t: number): number {
    return (1 - t) * x + t * y;
}

export function step(edge: number, value: number): number {
    return value < edge ? 0 : 1;
}

export function smoothstep(x: number, min: number, max: number): number {
    if (x <= min) return 0;
    if (x >= max) return 1;

    x = (x - min) / (max - min);

    return x * x * (3 - 2 * x);
}

export function smootherstep(x: number, min: number, max: number): number {
    if (x <= min) return 0;
    if (x >= max) return 1;

    x = (x - min) / (max - min);

    return x * x * x * (x * (x * 6 - 15) + 10);
}

export function parabola(x: number, k: number): number {
    return Math.pow(4 * x * (1 - x), k);
}

export function pcurve(x: number, a: number, b: number): number {
    const k = Math.pow(a + b, a + b) / (Math.pow(a, a) * Math.pow(b, b));

    return k * Math.pow(x, a) * Math.pow(1 - x, b);
}

export function fract(value: number): number {
    return value - Math.floor(value);
}

export function average(numbers: number[]): number {
    const sum = numbers.reduce((a, b) => a + b, 0);

    return sum / numbers.length;
}

export function rms(numbers: number[]): number {
    const sum = numbers.map(v => v * v).reduce((a, b) => a + b, 0);

    return Math.sqrt(sum / numbers.length);
}

export function median(numbers: number[]): number {
    const sorted = numbers.toSorted();
    const length = sorted.length;
    const middle = Math.floor(length / 2);

    if (length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}

export function peaks(numbers: number[], windowSize: number, threshold: number): number[] {
    const length = numbers.length;
    const result: number[] = [];

    for (let i = 0; i < length; i++) {
        const start = Math.max(1, i - windowSize);
        const end = Math.min(length, i + windowSize);
        let sum = 0;

        for (let j = start; j < end; j++) {
            sum += Math.abs(numbers[j] - numbers[j - 1]);
        }

        if (sum > threshold) {
            result.push(i);
        }
    }

    return result;
}

export function consecutive(numbers: number[]): number[][] {
    return numbers.reduce<number[][]>((array, value) => {
        let group = array[array.length - 1];

        if (!group || group[group.length - 1] !== value - 1) {
            group = array[array.push([]) - 1];
        }

        group.push(value);

        return array;
    }, []);
}

export function shuffle<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
}

export function randInt(low: number, high: number): number {
    return low + Math.floor(Math.random() * (high - low + 1));
}

export function randFloat(low: number, high: number): number {
    return low + Math.random() * (high - low);
}

export function randFloatSpread(range: number): number {
    return range * (0.5 - Math.random());
}

export function headsTails(heads?: undefined): number;
export function headsTails<T>(heads: T, tails: T): T;
export function headsTails<T>(heads?: T, tails?: T): T | number {
    if (heads === undefined) {
        return randInt(0, 1);
    }

    return randInt(0, 1) ? tails! : heads;
}

export function brightness(color: { r: number; g: number; b: number }): number {
    return color.r * 0.3 + color.g * 0.59 + color.b * 0.11;
}

export function basename(path: string, ext?: boolean): string {
    const name = path.split('/').pop()!.split('?')[0];

    return !ext ? name.split('.')[0] : name;
}

export function extension(path: string): string {
    return path.split('.').pop()!.split('?')[0].toLowerCase();
}

export function absolute(path: string): string {
    if (path.includes('//')) {
        return path;
    }

    const port = Number(location.port) > 1000 ? `:${location.port}` : '';
    const pathname = path.startsWith('/') ? path : `${location.pathname.replace(/\/[^/]*$/, '/')}${path}`;

    return `${location.protocol}//${location.hostname}${port}${pathname}`;
}

export function getKeyByValue<K, V>(map: Map<K, V>, searchValue: V): K | undefined {
    for (const [key, value] of map.entries()) {
        if (value === searchValue) {
            return key;
        }
    }
}

export function getConstructor(object: any): { name: string; code: string; isInstance: boolean } {
    const isInstance = typeof object !== 'function';
    const code = isInstance ? object.constructor.toString() : object.toString();
    const name = code.match(/(?:class|function)\s([^\s{(]+)/).pop();

    return { name, code, isInstance };
}

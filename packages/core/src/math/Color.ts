import { clamp, euclideanModulo, lerp } from '../utils/Utils.js';

interface HSL {
    h: number;
    s: number;
    l: number;
}

export class Color {
    isColor: boolean;
    r: number;
    g: number;
    b: number;
    private hslA: HSL;
    private hslB: HSL;

    constructor(r?: number | string | Color, g?: number, b?: number) {
        this.isColor = true;

        this.r = 1;
        this.g = 1;
        this.b = 1;

        this.hslA = { h: 0, s: 0, l: 0 };
        this.hslB = { h: 0, s: 0, l: 0 };

        this.set(r, g, b);
    }

    hue2rgb(p: number, q: number, t: number): number {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
        return p;
    }

    set(r?: number | string | Color, g?: number, b?: number): this {
        if (g === undefined && b === undefined) {
            const value = r;

            if (value && (value as Color).isColor) {
                this.copy(value as Color);
            } else if (typeof value === 'number') {
                this.setHex(value);
            } else if (typeof value === 'string') {
                this.setStyle(value);
            }
        } else {
            this.setRGB(r as number, g!, b!);
        }

        return this;
    }

    setScalar(scalar: number): this {
        this.r = scalar;
        this.g = scalar;
        this.b = scalar;

        return this;
    }

    setHex(hex: number): this {
        hex = Math.floor(hex);

        this.r = (hex >> 16 & 255) / 255;
        this.g = (hex >> 8 & 255) / 255;
        this.b = (hex & 255) / 255;

        return this;
    }

    setRGB(r: number, g: number, b: number): this {
        this.r = r;
        this.g = g;
        this.b = b;

        return this;
    }

    setHSL(h: number, s: number, l: number): this {
        h = euclideanModulo(h, 1);
        s = clamp(s, 0, 1);
        l = clamp(l, 0, 1);

        if (s === 0) {
            this.r = this.g = this.b = l;
        } else {
            const p = l <= 0.5 ? l * (1 + s) : l + s - l * s;
            const q = 2 * l - p;

            this.r = this.hue2rgb(q, p, h + 1 / 3);
            this.g = this.hue2rgb(q, p, h);
            this.b = this.hue2rgb(q, p, h - 1 / 3);
        }

        return this;
    }

    setStyle(style: string): this {
        const match = /^#([A-Fa-f\d]+)$/.exec(style);

        if (match) {
            const string = match[1];
            const size = string.length;

            if (size === 3) {
                return this.setRGB(
                    parseInt(string.charAt(0), 16) / 15,
                    parseInt(string.charAt(1), 16) / 15,
                    parseInt(string.charAt(2), 16) / 15
                );
            } else if (size === 6) {
                return this.setHex(parseInt(string, 16));
            }
        }

        return this;
    }

    clone(): Color {
        return new Color(this.r, this.g, this.b);
    }

    copy(color: Color): this {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;

        return this;
    }

    getHex(): number {
        return Math.round(clamp(this.r * 255, 0, 255)) * 65536 + Math.round(clamp(this.g * 255, 0, 255)) * 256 + Math.round(clamp(this.b * 255, 0, 255));
    }

    getHexString(): string {
        return ('000000' + this.getHex().toString(16)).slice(-6);
    }

    getHSL(target: { h: number; s: number; l: number }): { h: number; s: number; l: number } {
        const r = this.r;
        const g = this.g;
        const b = this.b;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);

        let hue: number | undefined;
        let saturation: number;
        const lightness = (min + max) / 2;

        if (min === max) {
            hue = 0;
            saturation = 0;
        } else {
            const delta = max - min;

            saturation = lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min);

            switch (max) {
                case r: hue = (g - b) / delta + (g < b ? 6 : 0); break;
                case g: hue = (b - r) / delta + 2; break;
                case b: hue = (r - g) / delta + 4; break;
            }

            hue! /= 6;
        }

        target.h = hue!;
        target.s = saturation;
        target.l = lightness;

        return target;
    }

    getRGB(target: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
        target.r = this.r;
        target.g = this.g;
        target.b = this.b;

        return target;
    }

    offsetHSL(h: number, s: number, l: number): this {
        this.getHSL(this.hslA);

        return this.setHSL(this.hslA.h + h, this.hslA.s + s, this.hslA.l + l);
    }

    add(color: Color): this {
        this.r += color.r;
        this.g += color.g;
        this.b += color.b;

        return this;
    }

    addColors(color1: Color, color2: Color): this {
        this.r = color1.r + color2.r;
        this.g = color1.g + color2.g;
        this.b = color1.b + color2.b;

        return this;
    }

    addScalar(scalar: number): this {
        this.r += scalar;
        this.g += scalar;
        this.b += scalar;

        return this;
    }

    sub(color: Color): this {
        this.r = Math.max(0, this.r - color.r);
        this.g = Math.max(0, this.g - color.g);
        this.b = Math.max(0, this.b - color.b);

        return this;
    }

    multiply(color: Color): this {
        this.r *= color.r;
        this.g *= color.g;
        this.b *= color.b;

        return this;
    }

    multiplyScalar(scalar: number): this {
        this.r *= scalar;
        this.g *= scalar;
        this.b *= scalar;

        return this;
    }

    lerp(color: Color, alpha: number): this {
        this.r += (color.r - this.r) * alpha;
        this.g += (color.g - this.g) * alpha;
        this.b += (color.b - this.b) * alpha;

        return this;
    }

    lerpColors(color1: Color, color2: Color, alpha: number): this {
        this.r = color1.r + (color2.r - color1.r) * alpha;
        this.g = color1.g + (color2.g - color1.g) * alpha;
        this.b = color1.b + (color2.b - color1.b) * alpha;

        return this;
    }

    lerpHSL(color: Color, alpha: number): this {
        this.getHSL(this.hslA);
        color.getHSL(this.hslB);

        const h = lerp(this.hslA.h, this.hslB.h, alpha);
        const s = lerp(this.hslA.s, this.hslB.s, alpha);
        const l = lerp(this.hslA.l, this.hslB.l, alpha);

        this.setHSL(h, s, l);

        return this;
    }

    equals(color: Color): boolean {
        return color.r === this.r && color.g === this.g && color.b === this.b;
    }

    fromArray(array: number[], offset: number = 0): this {
        this.r = array[offset];
        this.g = array[offset + 1];
        this.b = array[offset + 2];

        return this;
    }

    toArray(array: number[] = [], offset: number = 0): number[] {
        array[offset] = this.r;
        array[offset + 1] = this.g;
        array[offset + 2] = this.b;

        return array;
    }

    random(): this {
        return this.setHex(Math.random() * 0xffffff);
    }
}

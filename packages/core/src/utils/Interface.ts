import type { CSSProps, EasingFunction, EasingName } from '../types.js';

import { EventEmitter } from './EventEmitter.js';
import { ticker } from '../tween/Ticker.js';
import { clearTween, tween } from '../tween/Tween.js';

// https://developer.mozilla.org/en-US/docs/Web/CSS/transform
// https://developer.mozilla.org/en-US/docs/Web/CSS/filter
const Transforms = ['x', 'y', 'z', 'skewX', 'skewY', 'rotation', 'rotationX', 'rotationY', 'rotationZ', 'scale', 'scaleX', 'scaleY', 'scaleZ'];
const Filters = ['blur', 'brightness', 'contrast', 'grayscale', 'hue', 'invert', 'saturate', 'sepia'];
const Numeric = ['opacity', 'zIndex', 'fontWeight', 'strokeWidth', 'strokeDashoffset', 'stopOpacity', 'flexGrow'];
const Lacuna1 = ['opacity', 'scale', 'brightness', 'contrast', 'saturate', 'stopOpacity'];

export class Interface {
    events: EventEmitter;
    children: (Interface | any)[] | null;
    style: Record<string, number>;
    isTransform: boolean;
    isFilter: boolean;
    element: HTMLElement | SVGElement | null;
    parent: Interface | null;
    [key: string]: any;

    constructor(name?: string | HTMLElement | SVGElement | null, type: string | null = 'div', qualifiedName?: string) {
        this.events = new EventEmitter();
        this.children = [];
        this.style = {};
        this.isTransform = false;
        this.isFilter = false;
        this.element = null;
        this.parent = null;

        if (typeof name === 'object' && name !== null) {
            this.element = name;
        } else if (type !== null) {
            if (type === 'svg') {
                this.element = document.createElementNS('http://www.w3.org/2000/svg', qualifiedName || type) as SVGElement;
            } else {
                this.element = document.createElement(type) as HTMLElement;
            }

            if (typeof name === 'string') {
                if (name.startsWith('.')) {
                    (this.element as HTMLElement).className = name.slice(1);
                } else if (name.startsWith('#')) {
                    this.element.id = name.slice(1);
                }
            }
        }
    }

    add(child: Interface | any): Interface | any {
        if (!this.children) {
            return;
        }

        this.children.push(child);

        child.parent = this;

        if (child.element) {
            this.element!.appendChild(child.element);
        } else if (child.nodeName) {
            this.element!.appendChild(child);
        }

        return child;
    }

    addBefore(child: Interface | any, object: Interface | any): Interface | any {
        if (!this.children) {
            return;
        }

        this.children.push(child);

        child.parent = this;

        if (child.element) {
            if (object.element) {
                this.element!.insertBefore(child.element, object.element);
            } else if (object.nodeName) {
                this.element!.insertBefore(child.element, object);
            }
        } else if (child.nodeName) {
            if (object.element) {
                this.element!.insertBefore(child, object.element);
            } else if (object.nodeName) {
                this.element!.insertBefore(child, object);
            }
        }

        return child;
    }

    remove(child: Interface | any): void {
        if (!this.children) {
            return;
        }

        if (child.element && child.element.parentNode) {
            child.element.parentNode.removeChild(child.element);
        } else if (child.nodeName && child.parentNode) {
            child.parentNode.removeChild(child);
        }

        const index = this.children.indexOf(child);

        if (~index) {
            this.children.splice(index, 1);
        }
    }

    replace(oldChild: Interface | any, newChild: Interface | any): void {
        if (!this.children) {
            return;
        }

        const index = this.children.indexOf(oldChild);

        if (~index) {
            this.children[index] = newChild;

            newChild.parent = this;
        }

        if (oldChild.element && oldChild.element.parentNode) {
            if (newChild.element) {
                oldChild.element.parentNode.replaceChild(newChild.element, oldChild.element);
            } else if (newChild.nodeName) {
                oldChild.element.parentNode.replaceChild(newChild, oldChild.element);
            }
        } else if (oldChild.nodeName && oldChild.parentNode) {
            if (newChild.element) {
                oldChild.parentNode.replaceChild(newChild.element, oldChild);
            } else if (newChild.nodeName) {
                oldChild.parentNode.replaceChild(newChild, oldChild);
            }
        }
    }

    clone(deep?: boolean): Interface {
        if (!this.element) {
            return undefined as any;
        }

        return new Interface(this.element.cloneNode(deep) as HTMLElement);
    }

    empty(): this | undefined {
        if (!this.element) {
            return;
        }

        for (let i = this.children!.length - 1; i >= 0; i--) {
            if (this.children![i] && this.children![i].destroy) {
                this.children![i].destroy();
            }
        }

        this.children!.length = 0;

        this.element.innerHTML = '';

        return this;
    }

    attr(props: Record<string, string | number>): this | undefined {
        if (!this.element) {
            return;
        }

        for (const key in props) {
            this.element.setAttribute(key, String(props[key]));
        }

        return this;
    }

    css(props: CSSProps): this | undefined {
        if (!this.element) {
            return;
        }

        const style = this.style;
        const elementStyle = (this.element as HTMLElement).style;

        for (const key in props) {
            if (~Transforms.indexOf(key)) {
                style[key] = props[key] as number;
                this.isTransform = true;
                continue;
            }

            if (~Filters.indexOf(key)) {
                style[key] = props[key] as number;
                this.isFilter = true;
                continue;
            }

            if (~Numeric.indexOf(key)) {
                style[key] = props[key] as number;

                if (props[key] === '') {
                    elementStyle.removeProperty(key);
                } else {
                    (elementStyle as any)[key] = props[key];
                }
            } else {
                if (typeof props[key] === 'number') {
                    style[key] = props[key] as number;
                }

                (elementStyle as any)[key] = typeof props[key] !== 'string' ? `${props[key]}px` : props[key];
            }
        }

        if (this.isTransform) {
            let transform = '';

            if (style.x !== undefined || style.y !== undefined || style.z !== undefined) {
                const x = style.x !== undefined ? style.x : 0;
                const y = style.y !== undefined ? style.y : 0;
                const z = style.z !== undefined ? style.z : 0;

                transform += `translate3d(${x}px, ${y}px, ${z}px)`;
            }

            if (style.skewX !== undefined) {
                transform += `skewX(${style.skewX}deg)`;
            }

            if (style.skewY !== undefined) {
                transform += `skewY(${style.skewY}deg)`;
            }

            if (style.rotation !== undefined) {
                transform += `rotate(${style.rotation}deg)`;
            }

            if (style.rotationX !== undefined) {
                transform += `rotateX(${style.rotationX}deg)`;
            }

            if (style.rotationY !== undefined) {
                transform += `rotateY(${style.rotationY}deg)`;
            }

            if (style.rotationZ !== undefined) {
                transform += `rotateZ(${style.rotationZ}deg)`;
            }

            if (style.scale !== undefined) {
                transform += `scale(${style.scale})`;
            }

            if (style.scaleX !== undefined) {
                transform += `scaleX(${style.scaleX})`;
            }

            if (style.scaleY !== undefined) {
                transform += `scaleY(${style.scaleY})`;
            }

            if (style.scaleZ !== undefined) {
                transform += `scaleZ(${style.scaleZ})`;
            }

            elementStyle.transform = transform;
        }

        if (this.isFilter) {
            let filter = '';

            if (style.blur !== undefined) {
                filter += `blur(${style.blur}px)`;
            }

            if (style.brightness !== undefined) {
                filter += `brightness(${style.brightness})`;
            }

            if (style.contrast !== undefined) {
                filter += `contrast(${style.contrast})`;
            }

            if (style.grayscale !== undefined) {
                filter += `grayscale(${style.grayscale})`;
            }

            if (style.hue !== undefined) {
                filter += `hue-rotate(${style.hue}deg)`;
            }

            if (style.invert !== undefined) {
                filter += `invert(${style.invert})`;
            }

            if (style.saturate !== undefined) {
                filter += `saturate(${style.saturate})`;
            }

            if (style.sepia !== undefined) {
                filter += `sepia(${style.sepia})`;
            }

            elementStyle.filter = filter;
        }

        return this;
    }

    text(string?: string): this | string | undefined {
        if (!this.element) {
            return;
        }

        if (string === undefined) {
            return this.element.textContent ?? '';
        } else {
            this.element.textContent = string;
        }

        return this;
    }

    html(string?: string): this | string | undefined {
        if (!this.element) {
            return;
        }

        if (string === undefined) {
            return this.element.innerHTML;
        } else {
            this.element.innerHTML = string;
        }

        return this;
    }

    hide(): this {
        return this.css({ display: 'none' }) as this;
    }

    show(): this {
        return this.css({ display: '' }) as this;
    }

    invisible(): this {
        return this.css({ visibility: 'hidden' }) as this;
    }

    visible(): this {
        return this.css({ visibility: '' }) as this;
    }

    inView(): boolean | undefined {
        if (!this.element) {
            return;
        }

        const bounds = this.element.getBoundingClientRect();
        const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);

        return !(bounds.bottom < 0 || bounds.top - viewHeight >= 0);
    }

    atPoint(p: { x: number; y: number }): boolean | undefined {
        if (!this.element) {
            return;
        }

        const b = this.element.getBoundingClientRect();

        return p.y > b.top && p.x > b.left && p.y < b.bottom && p.x < b.right;
    }

    intersects(object: Interface | any): boolean | undefined {
        if (!this.element) {
            return;
        }

        const a = this.element.getBoundingClientRect();
        let b: DOMRect;

        if (object.element) {
            b = object.element.getBoundingClientRect();
        } else if (object.nodeName) {
            b = object.getBoundingClientRect();
        } else {
            return;
        }

        return a.bottom > b.top && a.right > b.left && a.top < b.bottom && a.left < b.right;
    }

    drawLine(progress?: number): this | undefined {
        if (!this.element) {
            return;
        }

        const p: number = progress ?? this.progress ?? 0;
        progress = p;
        const start = this.start ?? 0;
        const offset = this.offset ?? 0;

        const length = (this.element as unknown as SVGGeometryElement).getTotalLength();
        const dash = length * progress;
        const gap = length - dash;

        const style: CSSProps = {
            strokeDasharray: `${dash},${gap}`,
            strokeDashoffset: -length * (start + offset)
        };

        return this.css(style) as this;
    }

    tween(
        props: CSSProps,
        duration: number,
        ease: EasingName | EasingFunction | string,
        delay?: number | (() => void) | null,
        complete?: (() => void) | null,
        update?: (() => void) | null
    ): Promise<void> | undefined {
        if (typeof delay !== 'number') {
            update = complete as (() => void) | null;
            complete = delay as (() => void) | null;
            delay = 0;
        }

        if (!ticker.isAnimating) {
            ticker.start();
        }

        if (!this.element) {
            return;
        }

        const computedStyle = getComputedStyle(this.element);

        for (const key in props) {
            if (this.style[key] === undefined) {
                if (~Transforms.indexOf(key) || ~Filters.indexOf(key) || ~Numeric.indexOf(key)) {
                    this.style[key] = ~Lacuna1.indexOf(key) ? 1 : 0;
                } else if (typeof (computedStyle as any)[key] === 'string') {
                    this.style[key] = parseFloat((computedStyle as any)[key]);
                }
            }

            if (isNaN(this.style[key])) {
                delete this.style[key];
            }
        }

        const promise = tween(this.style, props as Record<string, any>, duration, ease, delay, complete, () => {
            this.css(this.style);

            if (update) {
                update();
            }
        });

        return promise;
    }

    clearTween(): this {
        clearTween(this.style);

        return this;
    }

    destroy(): null {
        if (!this.children) {
            return null;
        }

        if (this.parent && this.parent.remove) {
            this.parent.remove(this);
        }

        this.clearTween();

        this.events.destroy();

        for (let i = this.children.length - 1; i >= 0; i--) {
            if (this.children[i] && this.children[i].destroy) {
                this.children[i].destroy();
            }
        }

        for (const prop in this) {
            (this as any)[prop] = null;
        }

        return null;
    }
}

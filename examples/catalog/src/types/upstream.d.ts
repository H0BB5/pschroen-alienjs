declare module '@alienkitty/space.js' {
  export interface PanelUpdate {
    path: Array<string | number | readonly [string, number]>;
    value?: unknown;
    index?: number;
    target: unknown;
  }

  export interface PanelItemOptions {
    name?: string;
    type?: string;
    [key: string]: unknown;
  }

  export class EventEmitter {
    on(type: string, callback: (...events: unknown[]) => void): void;
    off(type: string, callback: (...events: unknown[]) => void): void;
  }

  export class Interface {
    constructor(element: HTMLElement);
    clearTween(): this;
  }

  export class PanelItem {
    constructor(options: PanelItemOptions);
  }

  export class Panel {
    readonly element: HTMLElement;
    readonly events: EventEmitter;
    add(item: PanelItem): PanelItem;
    animateIn(fast?: boolean): void;
    setPanelValue(name: string, value: unknown): void;
    setPanelIndex(name: string, index: number): void;
    destroy(): null;
  }

  export class Magnetic {
    constructor(object: Interface, options?: { threshold?: number });
    destroy(): null;
  }
}

declare module '@alienkitty/alien.js/three' {
  import type { Vector3 } from 'three';

  export class Wobble {
    constructor(position?: Vector3);
    scale: number;
    lerpSpeed: number;
    update(time: number): void;
  }
}

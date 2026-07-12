// Interim ambient declarations for @alienkitty/space.js, which does not yet
// publish its own TypeScript declarations to npm. Only the surface used by
// the Aliencn components is declared. Delete this file once an
// @alienkitty/space.js release ships bundled types.
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
    invert(inverted: boolean): void;
    destroy(): null;
  }

  export class Magnetic {
    constructor(object: Interface, options?: { threshold?: number });
    destroy(): null;
  }
}

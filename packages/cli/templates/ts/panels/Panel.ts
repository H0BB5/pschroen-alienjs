import { Interface, Stage, ticker } from '@hobbs/alien-core';

import { PanelItem } from './PanelItem';

export class Panel extends Interface {
    invertColors: {
        light: string;
        lightTriplet: string;
        lightLine: string;
        dark: string;
        darkTriplet: string;
        darkLine: string;
    };

    startTime: number;
    frame: number;
    items: PanelItem[];
    animatedIn: boolean;
    openColor: Interface | null;

    constructor() {
        super('.panel');

        if (!Stage.root) {
            Stage.root = document.querySelector(':root');
            Stage.rootStyle = getComputedStyle(Stage.root!);
        }

        this.invertColors = {
            light: Stage.rootStyle!.getPropertyValue('--ui-invert-light-color').trim(),
            lightTriplet: Stage.rootStyle!.getPropertyValue('--ui-invert-light-color-triplet').trim(),
            lightLine: Stage.rootStyle!.getPropertyValue('--ui-invert-light-color-line').trim(),
            dark: Stage.rootStyle!.getPropertyValue('--ui-invert-dark-color').trim(),
            darkTriplet: Stage.rootStyle!.getPropertyValue('--ui-invert-dark-color-triplet').trim(),
            darkLine: Stage.rootStyle!.getPropertyValue('--ui-invert-dark-color-line').trim()
        };

        this.startTime = performance.now();
        this.frame = 0;

        this.items = [];
        this.animatedIn = false;
        this.openColor = null;

        this.init();

        this.addListeners();
    }

    init() {
        this.hide();
        this.css({
            width: 'var(--ui-panel-width)',
            pointerEvents: 'auto',
            webkitUserSelect: 'none',
            userSelect: 'none'
        });
    }

    addListeners() {
        Stage.events.on('color_picker', this.onColorPicker);
    }

    removeListeners() {
        Stage.events.off('color_picker', this.onColorPicker);

        this.items.forEach(item => {
            item.events.off('update', this.onUpdate);
        });
    }

    // Event handlers

    onColorPicker = ({ open, target }: { open: boolean; target: Interface }) => {
        if (!this.openColor && !this.element!.contains(target.element!)) {
            return;
        }

        if (open) {
            this.disable(target);

            this.openColor = target;
        } else {
            this.enable();

            this.openColor = null;
        }
    };

    onUpdate = (e: any) => {
        this.events.emit('update', e);
    };

    // Public methods

    add(item: PanelItem): PanelItem {
        item.events.on('update', this.onUpdate);

        this.items.push(item);

        return super.add(item) as PanelItem;
    }

    getPanelIndex(name: string): number | undefined {
        let index: number | undefined;

        for (let i = 0, l = this.items.length; i < l; i++) {
            const { view } = this.items[i] as any;

            if (!view) {
                continue;
            }

            if (view.name === name && view.setIndex) {
                index = view.index;
                break;
            }

            if (view.group && view.group.children[0] && view.group.children[0].setPanelIndex) {
                index = view.group.children[0].getPanelIndex(name);

                if (index !== undefined) {
                    break;
                }
            }
        }

        return index;
    }

    getPanelValue(name: string): any {
        let value: any;

        for (let i = 0, l = this.items.length; i < l; i++) {
            const { view } = this.items[i] as any;

            if (!view) {
                continue;
            }

            if (view.name === name && view.setValue) {
                value = view.keys[view.index];
                break;
            }

            if (view.group && view.group.children[0] && view.group.children[0].setPanelValue) {
                value = view.group.children[0].getPanelValue(name);

                if (value !== undefined) {
                    break;
                }
            }
        }

        return value;
    }

    setPanelIndex(name: string, index: number, path: [string, number][] = []) {
        for (let i = 0, l = this.items.length; i < l; i++) {
            const { view } = this.items[i] as any;

            if (!view) {
                continue;
            }

            if (path.length) {
                const [pathName, pathIndex] = path[0];

                if (view.name === pathName) {
                    view.setIndex(pathIndex);
                    path.shift();
                }
            } else if (view.name === name && view.setIndex) {
                view.setIndex(index);
                break;
            }

            if (view.group && view.group.children[0] && view.group.children[0].setPanelIndex) {
                view.group.children[0].setPanelIndex(name, index, path);
            }
        }
    }

    setPanelValue(name: string, value: any, path: [string, number][] = []) {
        for (let i = 0, l = this.items.length; i < l; i++) {
            const { view } = this.items[i] as any;

            if (!view) {
                continue;
            }

            if (path.length) {
                const [pathName, pathIndex] = path[0];

                if (view.name === pathName) {
                    view.setIndex(pathIndex);
                    path.shift();
                }
            } else if (view.name === name && view.setValue) {
                view.setValue(value);
                break;
            }

            if (view.group && view.group.children[0] && view.group.children[0].setPanelValue) {
                view.group.children[0].setPanelValue(name, value, path);
            }
        }
    }

    invert(isInverted: boolean) {
        Stage.root!.style.setProperty('--ui-color', isInverted ? this.invertColors.light : this.invertColors.dark);
        Stage.root!.style.setProperty('--ui-color-triplet', isInverted ? this.invertColors.lightTriplet : this.invertColors.darkTriplet);
        Stage.root!.style.setProperty('--ui-color-line', isInverted ? this.invertColors.lightLine : this.invertColors.darkLine);

        Stage.events.emit('invert', { invert: isInverted });
    }

    update() {
        if (!ticker.isAnimating && ++this.frame > ticker.frame) {
            ticker.onTick(performance.now() - this.startTime);
        }
    }

    animateIn(fast?: boolean) {
        this.show();

        this.items.forEach((item, i) => item.animateIn(i * 15, fast));

        this.animatedIn = true;
    }

    animateOut(callback?: () => void) {
        this.items.forEach((item, i) => {
            item.animateOut(i, this.items.length - 1, (this.items.length - 1 - i) * 15, () => {
                this.hide();

                if (callback) {
                    callback();
                }
            });
        });

        this.animatedIn = false;
    }

    enable() {
        this.items.forEach(item => {
            if ((item as any).view && (item as any).view.group && (item as any).view.container) {
                item.enable((item as any).view.container);
            }

            item.enable();
        });
    }

    disable(target?: Interface) {
        this.items.forEach(item => {
            if ((item as any).view && (item as any).view.group && (item as any).view.container) {
                item.disable((item as any).view.container);
            }

            if (target && item.element!.contains(target.element!)) {
                return;
            }

            item.disable();
        });
    }

    activate() {
        this.clearTween().tween({ opacity: 1 }, 300, 'easeOutSine');
    }

    deactivate() {
        this.clearTween().tween({ opacity: 0 }, 300, 'easeOutSine');
    }

    destroy() {
        this.removeListeners();

        return super.destroy();
    }
}

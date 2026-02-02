import { Interface } from '@hobbs/alien-core';

import { PanelLink } from './PanelLink';
import { PanelThumbnail } from './PanelThumbnail';
import { PanelGraph } from './PanelGraph';
import { PanelMeter } from './PanelMeter';
import { List } from './List';
import { Slider } from './Slider';
import { Toggle } from './Toggle';
import { Content } from './Content';
import { ColorPicker } from './ColorPicker';

export interface PanelItemData {
    name?: string;
    type?: 'spacer' | 'divider' | 'link' | 'thumbnail' | 'graph' | 'meter' | 'list' | 'slider' | 'toggle' | 'content' | 'color';
    [key: string]: any;
}

export class PanelItem extends Interface {
    data: PanelItemData;
    container!: Interface;
    content?: Interface;
    line?: Interface;
    view?: any;
    graph?: PanelGraph | PanelMeter;

    constructor(data: PanelItemData) {
        super('.panel-item');

        this.data = data;

        this.init();
    }

    init() {
        this.container = new Interface('.container');
        this.container.css({
            boxSizing: 'border-box'
        });
        this.add(this.container);

        if (!this.data.type) {
            this.content = new Interface('.content');
            this.content.css({
                textTransform: 'uppercase',
                whiteSpace: 'nowrap'
            });
            this.content.text(this.data.name);
            this.container.add(this.content);
        } else if (this.data.type === 'spacer') {
            this.container.css({
                height: 'var(--ui-spacer-height)'
            });
        } else if (this.data.type === 'divider') {
            this.container.css({
                margin: 'var(--ui-divider-margin)'
            });

            this.line = new Interface('.line');
            this.line.css({
                height: 'var(--ui-divider-height)',
                backgroundColor: 'var(--ui-color-divider-line)'
            });
            this.container.add(this.line);
        } else if (this.data.type === 'link') {
            this.container.css({
                margin: 'var(--ui-link-margin)'
            });

            this.view = new PanelLink(this.data as any);
            this.view.events.on('update', this.onUpdate);
            this.container.add(this.view);
        } else if (this.data.type === 'thumbnail') {
            this.view = new PanelThumbnail(this.data as any);
            this.view.events.on('update', this.onUpdate);
            this.container.add(this.view);
        } else if (this.data.type === 'graph') {
            this.container.css({
                margin: 'var(--ui-graph-margin)'
            });

            this.graph = new PanelGraph(this.data as any);
            this.container.add(this.graph);
        } else if (this.data.type === 'meter') {
            this.container.css({
                margin: 'var(--ui-graph-margin)'
            });

            this.graph = new PanelMeter(this.data as any);
            this.container.add(this.graph);
        } else if (this.data.type === 'list') {
            this.view = new List(this.data as any);
            this.view.events.on('update', this.onUpdate);
            this.container.add(this.view);
        } else if (this.data.type === 'slider') {
            this.view = new Slider(this.data as any);
            this.view.events.on('update', this.onUpdate);
            this.container.add(this.view);
        } else if (this.data.type === 'toggle') {
            this.view = new Toggle(this.data as any);
            this.view.events.on('update', this.onUpdate);
            this.container.add(this.view);
        } else if (this.data.type === 'content') {
            this.view = new Content(this.data as any);
            this.view.events.on('update', this.onUpdate);
            this.container.add(this.view);
        } else if (this.data.type === 'color') {
            this.container.css({
                margin: 'var(--ui-color-picker-margin)'
            });

            this.view = new ColorPicker(this.data as any);
            this.view.events.on('update', this.onUpdate);
            this.container.add(this.view);
        }
    }

    removeListeners() {
        if (this.view) {
            this.view.events.off('update', this.onUpdate);
        }
    }

    // Event handlers

    onUpdate = (e: any) => {
        this.events.emit('update', e);
    };

    // Public methods

    animateIn(delay: number, fast?: boolean) {
        this.clearTween();

        if (this.graph) {
            (this.graph as any).enable();
        }

        if (fast) {
            this.css({ y: 0, opacity: 1 });
        } else {
            this.css({ y: -10, opacity: 0 })!.tween({ y: 0, opacity: 1 }, 400, 'easeOutCubic', delay);
        }
    }

    animateOut(index: number, total: number, delay: number, callback?: () => void) {
        this.clearTween().tween({ y: -10, opacity: 0 }, 500, 'easeInCubic', delay, () => {
            if (this.graph) {
                (this.graph as any).disable();
            }

            if (index === 0 && callback) {
                callback();
            }
        });
    }

    enable(target: Interface = this.container) {
        target.clearTween();
        target.tween({ opacity: 1 }, 500, 'easeInOutSine', () => {
            target.css({ pointerEvents: 'auto' });
        });
    }

    disable(target: Interface = this.container) {
        target.clearTween();
        target.css({ pointerEvents: 'none' });
        target.tween({ opacity: 0.35 }, 500, 'easeInOutSine');
    }

    destroy() {
        this.removeListeners();

        return super.destroy();
    }
}

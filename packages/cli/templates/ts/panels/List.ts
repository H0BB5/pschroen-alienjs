import { Interface } from '@hobbs/alien-core';

import { ListToggle } from './ListToggle';
import { ListSelect } from './ListSelect';

export class List extends Interface {
    name: string;
    list: Map<string, any>;
    keys: string[];
    values: any[];
    index: number;
    callback?: (value: string, target: List) => void;

    items: (ListToggle | ListSelect)[];
    group?: Interface;

    container!: Interface;

    constructor({
        name,
        list,
        value,
        callback
    }: {
        name: string;
        list: Map<string, any>;
        value?: string;
        callback?: (value: string, target: List) => void;
    }) {
        super('.list');

        this.name = name;
        this.list = list;
        this.keys = Array.from(this.list.keys());
        this.values = Array.from(this.list.values());
        this.index = this.keys.indexOf(value!);
        this.callback = callback;

        this.items = [];

        this.init();
        this.initViews();

        this.setIndex(this.index);
    }

    init() {
        this.container = new Interface('.container');
        this.container.css({
            height: 'var(--ui-panel-item-height)'
        });
        this.add(this.container);
    }

    initViews() {
        if (this.keys.length > 2) {
            const item = new ListSelect({ list: this.keys, index: this.index });
            item.events.on('click', this.onClick);
            this.container.add(item);
            this.items.push(item);
        } else {
            this.keys.forEach((name, index) => {
                const item = new ListToggle({ name, index });
                item.events.on('click', this.onClick);
                this.container.add(item);
                this.items.push(item);
            });
        }
    }

    removeListeners() {
        this.items.forEach(item => {
            item.events.off('click', this.onClick);
        });
    }

    // Event handlers

    onClick = ({ target }: { target: { index: number } }) => {
        this.index = target.index;

        this.update();
    };

    onUpdate = (e: any) => {
        e.path.unshift([this.name, this.index]);

        this.events.emit('update', e);
    };

    // Public methods

    hasContent(): boolean {
        return !!this.group;
    }

    setContent(content: Interface) {
        content.events.on('update', this.onUpdate);

        if (!this.group) {
            this.group = new Interface('.group');
            this.group.css({
                position: 'relative'
            });
            this.add(this.group);
        }

        const oldGroup = this.group;

        const newGroup = this.group.clone();
        newGroup.add(content);

        this.replace(oldGroup, newGroup);
        this.group = newGroup;

        oldGroup.destroy();
    }

    toggleContent(show: boolean) {
        if (show) {
            this.group!.show();
        } else {
            this.group!.hide();
        }
    }

    setList(list: Map<string, any>) {
        this.list = list;
        this.keys = Array.from(this.list.keys());
        this.values = Array.from(this.list.values());

        if (this.keys.length > 2) {
            (this.items[0] as ListSelect).setList(this.keys);
        } else {
            this.items.forEach((item, index) => {
                (item as ListToggle).setName(this.keys[index]);
            });
        }
    }

    setIndex(index: number, notify: boolean = true) {
        this.index = index;

        if (this.keys.length > 2) {
            (this.items[0] as ListSelect).setIndex(this.index);
        }

        this.update(notify);
    }

    setValue(value: any, notify: boolean = true) {
        this.index = this.values.indexOf(value);

        if (this.keys.length > 2) {
            (this.items[0] as ListSelect).setIndex(this.index);
        }

        this.update(notify);
    }

    update(notify: boolean = true) {
        if (notify) {
            const value = this.keys[this.index];

            this.events.emit('update', { path: [], index: this.index, target: this });

            if (this.callback) {
                this.callback(value, this);
            }
        }

        if (this.keys.length > 2) {
            return;
        }

        const target = this.items[this.index] as ListToggle;

        if (target && !target.active) {
            target.activate();
        }

        this.items.forEach(item => {
            if (item !== target && (item as ListToggle).active) {
                (item as ListToggle).deactivate();
            }
        });
    }

    destroy() {
        this.removeListeners();

        return super.destroy();
    }
}

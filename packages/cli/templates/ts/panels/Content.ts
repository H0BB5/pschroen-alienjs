import { Interface } from '@hobbs/alien-core';

export class Content extends Interface {
    callback?: (value: undefined, target: Content) => void;

    group?: Interface;

    constructor({
        callback
    }: {
        callback?: (value: undefined, target: Content) => void;
    }) {
        super('.content');

        this.callback = callback;

        this.update();
    }

    // Event handlers

    onUpdate = (e: any) => {
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

    update() {
        this.events.emit('update', { target: this });

        if (this.callback) {
            this.callback(undefined, this);
        }
    }
}

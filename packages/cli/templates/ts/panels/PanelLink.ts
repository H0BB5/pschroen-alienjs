import { Interface } from '@hobbs/alien-core';

export class PanelLink extends Interface {
    name: string;
    value: string;
    callback?: (value: string, target: PanelLink) => void;
    line!: Interface;

    constructor({
        name,
        value,
        callback
    }: {
        name: string;
        value: string;
        callback?: (value: string, target: PanelLink) => void;
    }) {
        super('.panel-link');

        this.name = name;
        this.value = value;
        this.callback = callback;

        this.init();
        this.setValue(this.value, false);

        this.addListeners();
    }

    init() {
        this.css({
            position: 'relative',
            width: 'fit-content',
            height: 'var(--ui-link-height)',
            lineHeight: 16,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            cursor: 'pointer'
        });
        this.text(this.value);

        this.line = new Interface('.line');
        this.line.css({
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 1,
            height: 'var(--ui-link-underline-height)',
            backgroundColor: 'var(--ui-color)',
            transformOrigin: 'left center',
            scaleX: 0
        });
        this.add(this.line);
    }

    addListeners() {
        this.element!.addEventListener('mouseenter', this.onHover as EventListener);
        this.element!.addEventListener('mouseleave', this.onHover as EventListener);
        this.element!.addEventListener('click', this.onClick);
    }

    removeListeners() {
        this.element!.removeEventListener('mouseenter', this.onHover as EventListener);
        this.element!.removeEventListener('mouseleave', this.onHover as EventListener);
        this.element!.removeEventListener('click', this.onClick);
    }

    // Event handlers

    onHover = ({ type }: MouseEvent) => {
        this.line.clearTween();

        if (type === 'mouseenter') {
            this.line.css({ transformOrigin: 'left center', scaleX: 0 })!.tween({ scaleX: 1 }, 800, 'easeOutQuint');
        } else {
            this.line.css({ transformOrigin: 'right center' })!.tween({ scaleX: 0 }, 500, 'easeOutQuint');
        }
    };

    onClick = () => {
        this.update();
    };

    // Public methods

    setValue(value: string, notify: boolean = true) {
        this.value = value;

        this.element!.childNodes[0].nodeValue = this.value;

        this.update(notify);
    }

    update(notify: boolean = true) {
        if (notify) {
            this.events.emit('update', { path: [], value: this.value, target: this });

            if (this.callback) {
                this.callback(this.value, this);
            }
        }
    }

    destroy() {
        this.removeListeners();

        return super.destroy();
    }
}

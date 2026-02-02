import { useEffect, useRef } from 'react';

import { Panel } from './Panel';
import { PanelItem } from './PanelItem';

/**
 * React hook for creating and managing a Panel.
 *
 * Handles mounting, animation, and cleanup automatically.
 * Returns the Panel instance for imperative access (e.g. setPanelValue, invert).
 *
 * @example
 * ```jsx
 * const panel = usePanel([
 *     { type: 'slider', name: 'Speed', min: 0, max: 100, value: 50 },
 *     { type: 'toggle', name: 'Enabled', value: true },
 * ], {
 *     onUpdate: (e) => console.log(e.target.name, e.value),
 * });
 * ```
 */
export function usePanel(items, options = {}) {
    const panelRef = useRef(null);

    useEffect(() => {
        const panel = new Panel();
        panelRef.current = panel;

        if (options.onUpdate) {
            panel.events.on('update', options.onUpdate);
        }

        for (const item of items) {
            panel.add(new PanelItem(item));
        }

        const target = options.container ?? document.body;
        target.appendChild(panel.element);

        panel.animateIn(options.fast);

        return () => {
            panel.destroy();
            panelRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return panelRef.current;
}

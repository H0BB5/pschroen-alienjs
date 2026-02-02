import { useEffect, useRef } from 'react';

import { Panel } from './Panel';
import { PanelItem } from './PanelItem';
import type { PanelItemData } from './PanelItem';

export interface UsePanelOptions {
    /**
     * Where to mount the panel. Defaults to document.body.
     */
    container?: HTMLElement | null;

    /**
     * Skip the animate-in transition.
     */
    fast?: boolean;

    /**
     * Called when any panel item value changes.
     */
    onUpdate?: (e: { path: string[]; value: any; target: any }) => void;
}

/**
 * React hook for creating and managing a Panel.
 *
 * Handles mounting, animation, and cleanup automatically.
 * Returns the Panel instance for imperative access (e.g. setPanelValue, invert).
 *
 * @example
 * ```tsx
 * const panel = usePanel([
 *     { type: 'slider', name: 'Speed', min: 0, max: 100, value: 50 },
 *     { type: 'toggle', name: 'Enabled', value: true },
 * ], {
 *     onUpdate: (e) => console.log(e.target.name, e.value),
 * });
 * ```
 */
export function usePanel(
    items: PanelItemData[],
    options: UsePanelOptions = {}
): Panel | null {
    const panelRef = useRef<Panel | null>(null);

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
        target.appendChild(panel.element!);

        panel.animateIn(options.fast);

        return () => {
            panel.destroy();
            panelRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return panelRef.current;
}

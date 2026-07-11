# Component catalog

All components use semantic `--aliencn-*` CSS tokens and plain class names. They do not require Tailwind, a class-variance package, or product-specific Checkpoint vocabulary. Import `aliencn.css` once from the framework-approved global entry point.

## Dashboard components

| Component | Purpose | Accessibility notes |
| --- | --- | --- |
| `button` | Primary, secondary, ghost, and danger actions with sizes and loading state | Native button, disabled and `aria-busy` states |
| `card` | Surface with header, title, description, content, and footer | Semantic section root |
| `badge` | Neutral or semantic status label | Status role and visible tone, not color alone |
| `input-field` | Standalone input and integrated label/hint/error field | Automatic IDs, `aria-describedby`, `aria-invalid`, live errors |
| `tabs` | Controlled or uncontrolled tab set | Arrow/Home/End keyboard navigation and complete tab relationships |
| `dialog` | Controlled modal composition | Native `<dialog>`, labels, Escape handling, close control |
| `switch` | Controlled boolean toggle | Native button with switch role and checked state |
| `skeleton` | Loading placeholder | Decorative and motion-reduced |
| `empty-state` | Icon, title, description, and single action slot | Heading-based readable structure |
| `banner` | Persistent info, success, warning, or danger notice | Status/alert roles and labeled dismissal |

These patterns were adapted from the interaction and information hierarchy of the Checkpoint component set, then rewritten as generic, framework-agnostic CSS components.

## Experiential components

### `panel`

`AlienPanel` dynamically loads Space.js on the client, creates `Panel` and `PanelItem` instances, narrows update events to the upstream `PanelUpdate` type, reports load failures, and explicitly removes the root DOM element during cleanup. `onReady` exposes a narrow handle rather than leaking an untyped implementation object.

### `magnetic`

`Magnetic` wraps the official Space.js `Interface` and `Magnetic` classes. It does not initialize when reduced motion is requested, reports dynamic-import failures, and cleanup removes transforms and active tweens.

### `shader-canvas`

`ShaderCanvas` dynamically loads Three.js and `Wobble` from `@alienkitty/alien.js/three`. It owns renderer, geometry, material, observer, and animation-frame cleanup. The shader pauses entirely for reduced motion and provides an accessible image label plus a WebGL failure state.

## Theme tokens

The foundation stylesheet defines light, dark, system-dark, status, focus, radius, typography, duration, and surface tokens. Set `data-aliencn-theme="light"` or `"dark"` on an ancestor to override the system preference. Space.js compatibility variables map back to those same tokens, including complete invert and panel variables.

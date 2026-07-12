# Component catalog

All components use semantic `--aliencn-*` CSS tokens and plain class names. They do not require Tailwind, a class-variance package, or product-specific Checkpoint vocabulary. Import `aliencn.css` once from the framework-approved global entry point.

## Dashboard components

| Component | Purpose | Accessibility notes |
| --- | --- | --- |
| `button` | Primary, secondary, ghost, and danger actions with sizes and loading state | Native button, disabled and `aria-busy` states |
| `card` | Surface with header, title, description, content, and footer | Semantic section root |
| `badge` | Neutral or semantic status label | Visible tone, not color alone; opt into a live `status` role with `live` for badges whose text updates in place |
| `input-field` | Standalone input and integrated label/hint/error field | Automatic IDs, `aria-describedby`, `aria-invalid`, live errors |
| `tabs` | Controlled or uncontrolled tab set | Arrow/Home/End keyboard navigation and complete tab relationships |
| `dialog` | Controlled modal composition | Native `<dialog>`, labels, Escape handling, close control |
| `switch` | Controlled boolean toggle | Native button with switch role and checked state |
| `skeleton` | Loading placeholder | Decorative and motion-reduced |
| `empty-state` | Icon, title, description, and single action slot | Heading-based readable structure |
| `banner` | Persistent info, success, warning, or danger notice | Status/alert roles and labeled dismissal |

These patterns were adapted from the interaction and information hierarchy of the Checkpoint component set, then rewritten as generic, framework-agnostic CSS components.

## Experiential components

In TypeScript projects these components install interim ambient declaration files (`space-types.d.ts`, `alien-types.d.ts`) because the published `@alienkitty` packages do not yet ship their own types. Delete those files once upstream releases include declarations.

### `panel`

`AlienPanel` dynamically loads Space.js on the client, creates `Panel` and `PanelItem` instances, narrows update events to the upstream `PanelUpdate` type, reports load failures, and explicitly removes the root DOM element during cleanup. `onReady` exposes a narrow handle rather than leaking an untyped implementation object.

`items` and `fast` are captured once on mount, so parent re-renders (including `onUpdate` state updates) never destroy and rebuild the panel. Update values after mount through the `onReady` handle's `setValue` and `setIndex`.

### `magnetic`

`Magnetic` wraps the official Space.js `Interface` and `Magnetic` classes. It does not initialize when reduced motion is requested, reports dynamic-import failures, and cleanup removes transforms and active tweens.

### `shader-canvas`

`ShaderCanvas` dynamically loads Three.js and `Wobble` from `@alienkitty/alien.js/three`. It owns renderer, geometry, material, observer, and animation-frame cleanup. The Wobble output feeds a `uWobble` shader uniform that drifts the glow center and wave phase organically. Changing `color`, `speed`, or `intensity` updates uniforms in place without recreating the WebGL context, and device-pixel-ratio changes are re-applied on resize. The shader pauses entirely for reduced motion and provides an accessible image label plus a WebGL failure state announced outside the image role.

## Theme tokens

The foundation stylesheet defines light, dark, system-dark, status, focus, radius, typography, duration, and surface tokens. Set `data-aliencn-theme="dark"` on any ancestor to create a dark island; set `data-aliencn-theme="light"` on the root `<html>` element to opt out of system dark mode (a nested light island inside system dark is not supported). Space.js compatibility variables map back to those same tokens, including complete invert and panel variables.

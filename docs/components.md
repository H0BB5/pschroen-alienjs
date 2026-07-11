# Component catalog

All components use semantic `--aliencn-*` CSS tokens and plain class names. They do not require Tailwind, a class-variance package, or product-specific Checkpoint vocabulary. Import `aliencn.css` once from the framework-approved global entry point.

## Visual language

Aliencn is intentionally not a neutral SaaS skin. Its default theme inherits the compact, monochrome visual grammar of Alien.js and Space.js and the experiential restraint of KYA: dark optical surfaces, hairline grids, square geometry, corner registration marks, telemetry-scale mono labels, spectral signal colors, and short scan/glitch transitions. Component hierarchy still follows the proven Checkpoint dashboard patterns, but rounded cards, pill-heavy states, pastel fills, and a single brand-purple accent are deliberately absent.

The stylesheet is dark by default. Set `data-aliencn-theme="light"` on an ancestor for the high-contrast paper theme, or `data-aliencn-theme="dark"` to state the default explicitly. Both themes preserve the same geometry and motion language.

Space.js consumes generic root-level `--ui-*` variables. Aliencn keeps those aliases opt-in so installing the foundation stylesheet cannot silently restyle another UI system. When rendering `AlienPanel`, put `data-aliencn-space` on the root `<html>` element (alongside the theme attribute when using the light theme).

## Dashboard components

| Component | Purpose | Accessibility notes |
| --- | --- | --- |
| `button` | Primary, secondary, ghost, and danger actions with sizes and loading state | Native button, disabled and `aria-busy` states |
| `card` | Surface with header, title, description, content, and footer | Semantic section root |
| `badge` | Neutral or semantic status label | Visible marker plus text, not color alone; pass `role="status"` only for live updates |
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

`AlienPanel` dynamically loads Space.js on the client, validates the required `data-aliencn-space` root opt-in, creates `Panel` and `PanelItem` instances, narrows update events to the upstream `PanelUpdate` type, reports load failures, and explicitly removes the root DOM element during cleanup. `onReady` exposes a narrow handle rather than leaking an untyped implementation object. The upstream panel is a compact, pointer-oriented developer control surface; use Aliencn's native React controls for user-facing accessible forms.

### `magnetic`

`Magnetic` wraps the official Space.js `Interface` and `Magnetic` classes. It does not initialize when reduced motion is requested, reports dynamic-import failures, and cleanup removes transforms and active tweens.

### `shader-canvas`

`ShaderCanvas` dynamically loads Three.js and `Wobble` from `@alienkitty/alien.js/three`. It owns renderer, geometry, material, observer, and animation-frame cleanup. The shader pauses entirely for reduced motion and provides an accessible image label plus a WebGL failure state.

## Theme tokens

The foundation stylesheet defines dark-default and explicit light themes, spectral status, focus, square geometry, typography, duration, grid, and optical-surface tokens. The opt-in `data-aliencn-space` root scope maps Space.js compatibility variables back to those same tokens, including its original compact typography, Viridis graph range, invert, and panel variables.

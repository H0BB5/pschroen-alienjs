# Motion family provenance

The five `.js` modules in this directory are byte-faithful copies of the KYA-OS motion layer.
They are dependency-free vanilla ES modules, which is the point of the family: every KYA-OS surface, whether a Next.js app or a fully static site, runs these exact bytes.

- Source repository: `kya-os-site`
- Source path: `src/ui/`
- Source commit: `9be55b88bc6b05afa174c5230218af79bcd82ebf`

| Template | Source file |
| --- | --- |
| `UIUtils.js` | `src/ui/UIUtils.js` |
| `Title.js` | `src/ui/Title.js` |
| `GlitchText.js` | `src/ui/GlitchText.js` |
| `SmoothScroll.js` | `src/ui/SmoothScroll.js` |
| `PageTransition.js` | `src/ui/PageTransition.js` |

The import graph is closed: every module imports only `./UIUtils.js`.

These files are declared `verbatim` in `src/registry.ts`, so `aliencn add motion` copies them without import rewriting, option templating, or TypeScript transpilation, and `aliencn diff motion` compares installed copies byte-for-byte against this directory.
Do not edit them here; port upstream changes from `kya-os-site` and update the commit above.

The sibling `*.d.ts` templates (registry item `motion-types`) and `motion-react.tsx` (registry item `motion-react`) are authored in this repository; they are interim type shims and a thin React wrapper, not part of the vendored bytes.

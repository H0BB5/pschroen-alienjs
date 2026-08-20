# Aliencn component catalog

This standalone Next.js app is the local visual and interaction reference for Aliencn. It renders every registry component and keeps the generated files unmodified so registry drift remains detectable.

From the repository root:

```sh
npm install
npm run example:dev
```

Then open [http://localhost:3000](http://localhost:3000).

Useful commands:

```sh
npm run example:sync       # regenerate every component from the local CLI
npm run example:typecheck  # strict TypeScript verification
npm run example:build      # standalone production build
npm run example:check      # sync integrity, CLI doctor, types, and build
```

The temporary upstream declarations in `src/types/upstream.d.ts` mirror only the APIs used by the catalog. Remove that bridge after the coordinated typed Alien.js and Space.js releases are published.

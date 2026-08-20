import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    bin: 'src/bin.ts'
  },
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'node20',
  platform: 'node',
  splitting: false,
  sourcemap: true,
  treeshake: true
});

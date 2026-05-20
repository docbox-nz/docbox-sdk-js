import { defineConfig } from 'rolldown';

export default defineConfig([
  // Browser builds
  {
    external: ['axios'],
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.browser.cjs',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/index.browser.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    platform: 'browser',
  },

  // Node builds
  {
    external: ['axios'],
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.node.cjs',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/index.node.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    platform: 'node',
  },
]);

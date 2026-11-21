import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig([
  // Type definitions
  {
    external: ['axios'],
    input: 'src/index.ts',
    plugins: [
      dts({
        generator: 'oxc',
      }),
    ],
    output: [
      {
        dir: 'dist',
        format: 'esm',
        sourcemap: true,
      },
    ],
  },

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

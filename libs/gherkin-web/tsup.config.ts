import { defineConfig } from 'tsup';

export default defineConfig([
  // Build index.ts for types
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    splitting: false,
    outDir: 'dist',
    target: 'esnext'
  },
  // Build individual modules without types
  {
    entry: [
      'src/cucumber.ts',
      'src/gherkin.ts',
      'src/playwright.ts',
    ],
    format: ['esm'],
    dts: false,
    clean: false,
    sourcemap: true,
    splitting: false,
    outDir: 'dist',
    target: 'esnext',
    external: [
      './cucumber',
      './gherkin', 
      './playwright'
    ]
  }
]); 
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
      'src/puppeteer.ts',
      'src/assert.ts',
    ],
    format: ['esm'],
    dts: true,
    clean: false,
    sourcemap: true,
    splitting: false,
    outDir: 'dist',
    target: 'esnext',
    external: [
      './cucumber',
      './gherkin', 
      './playwright',
      './puppeteer',
      './assert'
    ]
  }
]); 
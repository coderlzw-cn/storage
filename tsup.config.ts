import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'iife'],
    globalName: 'store',
    dts: true,
    minify: true,
    // splitting: false, //
    sourcemap: true,
    clean: true,
});

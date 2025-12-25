import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    globals: true,
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'tests/**',
        'test/**',
        'dist/**',
        '.idea/**',
        '.git/**',
        '.nyc_output/**',
        'coverage/**',
        '**/types.ts',
        '**/vite.config.*',
        '**/vitest.config.*',
        '**/metadata.json',
        '**/package.json',
        '**/tsconfig.json',
        '**/README.md',
        '**/index.html',
        '**/public/**',
        '**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
      ],
    },
  },
});
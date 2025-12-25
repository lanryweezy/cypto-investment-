import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with DOM testing library matchers
expect.extend(matchers);

// Run a cleanup after each test case (e.g., clear jsdom)
afterEach(() => {
  cleanup();
});
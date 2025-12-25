import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Run a cleanup after each test case (e.g., clear jsdom)
afterEach(() => {
  cleanup();
});
// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
import { createWriteOrder } from './write-order';

afterEach(() => vi.useRealTimers());

it('bounds client tracking and frees expired entries', () => {
  vi.useFakeTimers();
  const check = createWriteOrder(2, 60_000);
  expect(check('session', { clientId: 'a', sequence: 1 })).toBe('accept');
  expect(check('session', { clientId: 'b', sequence: 1 })).toBe('accept');
  expect(check('session', { clientId: 'c', sequence: 1 })).toBe('full');
  expect(check('session', { clientId: 'a', sequence: 1 })).toBe('stale');
  vi.advanceTimersByTime(60_000);
  expect(check('session', { clientId: 'c', sequence: 1 })).toBe('accept');
});

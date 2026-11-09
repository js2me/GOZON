import { expect, it } from 'vitest';
import { createSyncClientId } from './sync-client-id';

it('generates distinct client IDs with getRandomValues', () => {
  const first = createSyncClientId();
  const second = createSyncClientId();
  expect(first).toMatch(/^[0-9a-f]{32}$/);
  expect(second).toMatch(/^[0-9a-f]{32}$/);
  expect(second).not.toBe(first);
});

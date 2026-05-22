import type { ReactNode } from 'react';
import { isValidElement } from 'react';
import type { ActionButtonIconComponent } from '..';

export function isIconComponent(
  value: ReactNode | ActionButtonIconComponent | undefined,
): value is ActionButtonIconComponent {
  if (value == null || isValidElement(value)) {
    return false;
  }
  if (typeof value === 'function') {
    return true;
  }
  if (typeof value === 'object' && '$$typeof' in value) {
    const { $$typeof } = value as { $$typeof: symbol };
    return (
      $$typeof === Symbol.for('react.forward_ref') ||
      $$typeof === Symbol.for('react.memo')
    );
  }
  return false;
}

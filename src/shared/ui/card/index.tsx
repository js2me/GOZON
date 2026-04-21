import type { HTMLAttributes } from 'react';
import { cx } from 'yummies/css';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cx('rounded-2xl bg-white p-4 shadow-sm', className)}
      {...props}
    />
  );
}

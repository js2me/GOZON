import { type ReactNode, useEffect, useState } from 'react';

type ClientOnlyProps = {
  children: ReactNode;
  /** То же дерево на SSR и на клиенте до `useEffect` — иначе будет hydration mismatch. */
  fallback: ReactNode;
};

/**
 * Рендерит `fallback` на сервере и при первом клиентском проходе гидрации,
 * затем заменяет на `children` (данные из sessionStorage / запросов и т.д.).
 */
export function ClientOnly({ children, fallback }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

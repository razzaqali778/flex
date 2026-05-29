import type { ReactNode } from 'react';

export function ScrollableTable({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`table-scroll ${className}`}>
      <div className="min-w-0 overflow-x-auto rounded-2xl">{children}</div>
    </div>
  );
}

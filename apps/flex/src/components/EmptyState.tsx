import type { ReactNode } from 'react';

export function EmptyState({
  title,
  children,
  className = '',
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`empty-state ${className}`}>
      <p className="font-medium text-slate-200">{title}</p>
      {children && <div className="text-sm text-flex-muted mt-2">{children}</div>}
    </div>
  );
}

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function SectionHeader({
  icon: Icon,
  title,
  action,
  className = '',
}: {
  icon?: LucideIcon;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`section-header ${className}`}>
      <h3 className="section-title">
        {Icon && <Icon className="w-5 h-5 text-flex-accent shrink-0" aria-hidden />}
        {title}
      </h3>
      {action}
    </div>
  );
}

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const styles: Record<Variant, string> = {
  success: 'bg-flex-success/20 text-flex-success border-flex-success/30',
  warning: 'bg-flex-warning/20 text-flex-warning border-flex-warning/30',
  danger: 'bg-flex-danger/20 text-flex-danger border-flex-danger/30',
  info: 'bg-flex-accent/20 text-flex-accent border-flex-accent/30',
  neutral: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

export function Badge({
  children,
  variant = 'neutral',
  className = '',
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

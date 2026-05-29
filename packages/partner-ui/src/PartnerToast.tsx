import { useEffect } from 'react';
import { X } from 'lucide-react';

export function PartnerToast({
  variant,
  children,
  onDismiss,
  autoDismissMs = 6000,
}: {
  variant: 'success' | 'error';
  children: React.ReactNode;
  onDismiss?: () => void;
  /** Auto-hide success toasts; errors stay until dismissed. */
  autoDismissMs?: number;
}) {
  useEffect(() => {
    if (variant !== 'success' || !onDismiss || autoDismissMs <= 0) return;
    const timer = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [variant, onDismiss, autoDismissMs, children]);

  return (
    <div className={`partner-toast partner-toast-dismissible ${variant}`} role="status">
      <span className="partner-toast-body">{children}</span>
      {onDismiss && (
        <button type="button" className="partner-toast-close" aria-label="Dismiss" onClick={onDismiss}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}

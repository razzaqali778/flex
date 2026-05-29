import { ArrowDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ScrollToBottomProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  deps?: unknown[];
}

export function ScrollToBottom({ containerRef, deps = [] }: ScrollToBottomProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setVisible(scrollHeight - scrollTop - clientHeight > 120);
    };

    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [containerRef, deps]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() =>
        containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
      }
      className="fixed bottom-28 sm:bottom-32 right-4 sm:right-8 z-30 flex items-center gap-1.5 px-3 py-2 rounded-full glass border border-flex-accent/30 text-xs text-flex-accent shadow-glow hover:bg-flex-accent/10 transition-all animate-chat-fade-in"
      aria-label="Scroll to bottom"
    >
      <ArrowDown className="w-3.5 h-3.5" />
      Latest
    </button>
  );
}

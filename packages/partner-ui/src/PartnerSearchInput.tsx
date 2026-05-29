import { useRef } from 'react';
import { Search, X } from 'lucide-react';

export function PartnerSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const localRef = useRef<HTMLInputElement>(null);

  return (
    <label className="partner-search">
      <Search size={16} aria-hidden />
      <input
        ref={localRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder ?? 'Search'}
      />
      {value.length > 0 && (
        <button
          type="button"
          className="partner-search-clear"
          aria-label="Clear search"
          onClick={() => {
            onChange('');
            localRef.current?.focus();
          }}
        >
          <X size={14} />
        </button>
      )}
    </label>
  );
}

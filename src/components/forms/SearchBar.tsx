import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  debounceMs = 300,
  className = '',
  autoFocus,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Simple debounce via onChange — caller can debounce if needed
  function handleChange(val: string) {
    setLocalValue(val);
    const timer = setTimeout(() => onChange(val), debounceMs);
    return () => clearTimeout(timer);
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] z-10">
        <Search className="h-4 w-4" />
      </div>
      <Input
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        wrapperClassName="pl-9 pr-9"
      />
      {localValue && (
        <button
          onClick={() => { setLocalValue(''); onChange(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

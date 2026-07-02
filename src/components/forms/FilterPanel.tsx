import { ChevronDown, X, Filter } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterPanelProps {
  filters: {
    key: string;
    label: string;
    options: FilterOption[];
    selected: string | string[];
  }[];
  onFilterChange: (key: string, value: string | string[]) => void;
  onClear: () => void;
  className?: string;
}

export function FilterPanel({ filters, onFilterChange, onClear, className = '' }: FilterPanelProps) {
  const hasActiveFilters = filters.some((f) => {
    const v = f.selected;
    return Array.isArray(v) ? v.length > 0 : !!v;
  });

  return (
    <div className={`flex flex-wrap items-end gap-3 ${className}`}>
      <div className="flex items-center gap-1.5 text-sm font-medium text-[rgb(var(--text-secondary))]">
        <Filter className="h-4 w-4" />
        Lọc:
      </div>

      {filters.map((filter) => (
        <div key={filter.key} className="relative group">
          <select
            value={filter.selected as string}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-3 pr-7 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] appearance-none cursor-pointer hover:border-[rgb(var(--primary-light))] transition-colors"
          >
            <option value="">{filter.label} — Tất cả</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[rgb(var(--text-muted))] pointer-events-none" />
        </div>
      ))}

      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-1.5 text-xs text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--error))] hover:text-[rgb(var(--error))] transition-colors"
        >
          <X className="h-3 w-3" />
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}

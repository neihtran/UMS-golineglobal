import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
}

const PRESETS = [
  { label: 'Hôm nay', days: 0 },
  { label: '7 ngày', days: 7 },
  { label: '30 ngày', days: 30 },
  { label: '90 ngày', days: 90 },
  { label: 'Năm nay', days: -1 },
];

function toInputDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className = '',
}: DateRangePickerProps) {
  const today = toInputDate(new Date());

  function applyPreset(days: number) {
    if (days === -1) {
      // Start of year
      const y = new Date().getFullYear();
      onStartDateChange(`${y}-01-01`);
      onEndDateChange(today);
    } else {
      onStartDateChange(toInputDate(addDays(new Date(), -days)));
      onEndDateChange(today);
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-3 ${className}`}>
      {/* Date inputs */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-[rgb(var(--text-muted))]" />
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] px-2 py-1 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]"
        />
        <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] px-2 py-1 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]"
        />
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-[rgb(var(--border))]" />

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset.days)}
            className="rounded-full border border-[rgb(var(--border))] px-2.5 py-0.5 text-xs text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary-light))] hover:text-[rgb(var(--primary))] transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

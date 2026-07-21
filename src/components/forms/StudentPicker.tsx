import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useHqnhatStudents } from '@/hooks/useHqnhat';
import type { HqnhatStudent } from '@/types/hqnhat.types';

interface StudentPickerProps {
  value: number | null | undefined;
  onChange: (studentId: number, student?: HqnhatStudent) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  /** Chỉ hiển thị sinh viên đang học (status=1). Mặc định true. */
  onlyStudying?: boolean;
}

/**
 * Dropdown lookup sinh viên có ô tìm kiếm.
 * Mặc định chỉ liệt kê sinh viên có status = 1 (Đang học) và tồn tại trong bảng students.
 */
export function StudentPicker({
  value,
  onChange,
  error,
  required,
  placeholder = 'Tìm mã SV hoặc họ tên...',
  onlyStudying = true,
}: StudentPickerProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useHqnhatStudents({
    per_page: 100,
    status: onlyStudying ? 1 : undefined,
  });

  const allStudents: HqnhatStudent[] = Array.isArray(data?.data) ? data.data : [];

  const selected = allStudents.find((s) => s.id === value);
  const displayValue = search || (selected ? `${selected.student_code} — ${selected.full_name}` : '');

  const filtered = allStudents.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      s.full_name.toLowerCase().includes(q) ||
      s.student_code.toLowerCase().includes(q)
    );
  }).slice(0, 20);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (s: HqnhatStudent) => {
    onChange(s.id, s);
    setSearch(`${s.student_code} — ${s.full_name}`);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))] pointer-events-none" />
        <input
          type="text"
          value={displayValue}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
            setHighlight(0);
            if (e.target.value) onChange(0);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`h-10 w-full rounded-lg border bg-[rgb(var(--bg-card))] pl-10 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))/0.2] ${
            error ? 'border-red-400' : 'border-[rgb(var(--border))]'
          }`}
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))] transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-3 text-sm text-[rgb(var(--text-muted))] text-center">
              Đang tải danh sách sinh viên...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-3 py-3 text-sm text-[rgb(var(--text-muted))] text-center">
              {search ? 'Không tìm thấy sinh viên phù hợp' : 'Chưa có sinh viên đang học'}
            </div>
          ) : (
            <>
              {!search.trim() && (
                <div className="px-3 py-1.5 text-xs text-[rgb(var(--text-muted))] border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-hover))]">
                  {allStudents.length} sinh viên đang học
                </div>
              )}
              {filtered.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelect(s)}
                  onMouseEnter={() => setHighlight(i)}
                  className={`w-full text-left px-3 py-2 text-sm border-b border-[rgb(var(--border))] last:border-0 ${
                    highlight === i ? 'bg-[rgb(var(--bg-hover))]' : ''
                  }`}
                >
                  <span className="font-mono font-semibold">{s.student_code}</span>
                  <span className="ml-2 text-[rgb(var(--text-secondary))]">{s.full_name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {required && !value && (
        <span className="absolute right-9 top-1/2 -translate-y-1/2 text-red-500 text-xs">*</span>
      )}
    </div>
  );
}
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Command,
  ArrowRight,
  FileText,
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  BarChart3,
  Bell,
} from 'lucide-react';
import { Badge } from '@/components/ui';
import { useTranslation } from 'react-i18next';

interface SearchResult {
  id: string;
  type: 'page' | 'document' | 'user' | 'student' | 'course';
  title: string;
  subtitle?: string;
  badge?: string;
  url: string;
  icon?: React.ReactNode;
}

const QUICK_LINKS: SearchResult[] = [
  { id: 'ql1', type: 'page', title: 'Tổng quan hệ thống', subtitle: 'Dashboard', url: '/dashboard', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'ql2', type: 'page', title: 'Quản lý tài khoản', subtitle: 'IAM', url: '/iam/tai-khoan', icon: <Users className="h-4 w-4" /> },
  { id: 'ql3', type: 'page', title: 'Danh sách viên chức', subtitle: 'HRM', url: '/hrm/vien-chuc', icon: <Users className="h-4 w-4" /> },
  { id: 'ql4', type: 'page', title: 'Danh sách sinh viên', subtitle: 'SIS', url: '/sis/sinh-vien', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'ql5', type: 'page', title: 'Quản lý học phí', subtitle: 'FIN', url: '/fin/hoc-phi', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'ql6', type: 'page', title: 'Khóa học', subtitle: 'LMS', url: '/lms', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'ql7', type: 'page', title: 'Cổng thông tin', subtitle: 'PORTAL', url: '/portal', icon: <Bell className="h-4 w-4" /> },
];

const RECENT_SEARCHES = [
  'Danh sách viên chức khoa CNTT',
  'Báo cáo học phí Q2',
  'Quy trình thi trực tuyến',
];

const MODULE_ICON: Record<string, React.ReactNode> = {
  page: <FileText className="h-4 w-4" />,
  user: <Users className="h-4 w-4" />,
  student: <GraduationCap className="h-4 w-4" />,
  course: <BookOpen className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
};

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const { t } = useTranslation('common');
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results: SearchResult[] = query
    ? QUICK_LINKS.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const allItems = query ? results : QUICK_LINKS;

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && allItems[selectedIndex]) {
      navigate(allItems[selectedIndex].url);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-xl rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <Search className="h-5 w-5 text-[rgb(var(--text-muted))] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('globalSearch.placeholder')}
            className="flex-1 bg-transparent text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] px-1.5 py-0.5 text-[10px] text-[rgb(var(--text-muted))]">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {query ? (
            results.length > 0 ? (
              <div className="space-y-0.5">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">
                  {t('globalSearch.resultCount', { count: results.length })}
                </p>
                {results.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => { navigate(item.url); onClose(); }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      i === selectedIndex
                        ? 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]'
                        : 'hover:bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-primary))]'
                    }`}
                  >
                    <span className="shrink-0 text-[rgb(var(--text-muted))]">
                      {item.icon ?? MODULE_ICON[item.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-xs text-[rgb(var(--text-muted))]">{item.subtitle}</p>
                      )}
                    </div>
                    {item.badge && <Badge variant="neutral" size="sm">{item.badge}</Badge>}
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--text-muted))]" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 text-center">
                <Search className="h-8 w-8 text-[rgb(var(--text-muted))] mb-3" />
                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{t('globalSearch.noResults')}</p>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{t('globalSearch.noResultsHint')}</p>
              </div>
            )
          ) : (
            <div className="space-y-4">
              {/* Recent searches */}
              <div>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">
                  {t('globalSearch.recentSearches')}
                </p>
                {RECENT_SEARCHES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] transition-colors"
                  >
                    <Search className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                    {s}
                  </button>
                ))}
              </div>

              {/* Quick links */}
              <div>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">
                  {t('globalSearch.quickAccess')}
                </p>
                {QUICK_LINKS.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => { navigate(item.url); onClose(); }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      i === selectedIndex
                        ? 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]'
                        : 'hover:bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-primary))]'
                    }`}
                  >
                    <span className="shrink-0 text-[rgb(var(--text-muted))]">
                      {item.icon ?? MODULE_ICON[item.type]}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                    </div>
                    {item.subtitle && (
                      <Badge variant="neutral" size="sm">{item.subtitle}</Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[rgb(var(--border)/0.6)] px-5 py-2.5">
          <div className="flex items-center gap-4 text-xs text-[rgb(var(--text-muted))]">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] px-1 py-0.5">↑↓</kbd>
              Điều hướng
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] px-1 py-0.5">↵</kbd>
              Mở
            </span>
          </div>
          <kbd className="flex items-center gap-1 rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] px-2 py-0.5 text-xs text-[rgb(var(--text-muted))]">
            <Command className="h-3 w-3" /> K
          </kbd>
        </div>
      </div>
    </div>
  );
}

// ─── Keyboard shortcut hook (used by Header) ───────────────────────────────

export function useKeyboardShortcut(key: string, callback: () => void) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === key) {
        e.preventDefault();
        callback();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback]);
}

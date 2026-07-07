import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Search, Plus, Star } from 'lucide-react';
import { Button, Badge, TablePagination, TableSkeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination, useDebounce } from '@/hooks';
import { useCourseList } from '@/hooks/useLms';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
  draft: { variant: 'neutral', label: 'Bản nháp' },
  published: { variant: 'success', label: 'Đã xuất bản' },
  archived: { variant: 'neutral', label: 'Lưu trữ' },
  closed: { variant: 'warning', label: 'Đóng' },
};

export default function CourseList() {
  const { t } = useTranslation('lms');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [status, setStatus] = useState('');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });

  const { data, isLoading } = useCourseList({
    search: debouncedSearch || undefined,
    status: status || undefined,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });

  const list: any[] = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('course.title')}
        description={`${total} khóa học trong hệ thống`}
        breadcrumbs={[{ label: 'LMS', href: '/lms' }, { label: 'Khóa học' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('course.export')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>{t('course.add')}</Button>
          </>
        }
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm mã, tên khóa học..."
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="draft">{t('course.status.draft')}</option>
          <option value="published">{t('course.status.published')}</option>
          <option value="archived">{t('course.status.archived')}</option>
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton colSpan={8} rows={8} />
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border))] p-12 text-center">
          <p className="text-[rgb(var(--text-muted))]">{t('empty.title')}</p>
          <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">{t('empty.description')}</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgb(var(--border)/0.6)]">
                  {['Mã', 'Tên khóa học', 'Giảng viên', 'Bộ môn', 'Tín chỉ', 'SV đăng ký', 'Đánh giá', 'Trạng thái'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                {list.map((c: any) => {
                  const sc = STATUS_CONFIG[c.status] || { variant: 'neutral' as const, label: c.status ?? '—' };
                  return (
                    <tr key={c._id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex h-8 w-12 items-center justify-center rounded-md bg-[rgb(var(--primary)/0.1)] text-[10px] font-bold text-[rgb(var(--primary))]">
                          {c.code ?? '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[rgb(var(--text-primary))]">{c.name ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{c.instructorName || '—'}</td>
                      <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{c.departmentName || '—'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-[rgb(var(--primary))]">{c.credits ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{c.enrolledCount ?? 0}</td>
                      <td className="px-4 py-3">
                        {c.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-[rgb(var(--primary))] text-[rgb(var(--primary))]" />
                            <span className="text-xs font-semibold text-[rgb(var(--primary))]">{Number(c.rating).toFixed(1)}</span>
                          </div>
                        ) : <span className="text-[rgb(var(--text-muted))]">—</span>}
                      </td>
                      <td className="px-4 py-3"><Badge variant={sc.variant} size="sm">{sc.label}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <TablePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            pageSizeOptions={[10, 25, 50]}
          />
        </>
      )}
    </div>
  );
}

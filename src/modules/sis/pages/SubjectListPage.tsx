import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useSubjectList } from '@/hooks/useSis';

export default function SubjectListPage() {
  const { t } = useTranslation('sis');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const { data, isLoading } = useSubjectList({
    search,
    page,
    pageSize,
  });

  const list = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  if (isLoading && list.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[rgb(var(--text-muted))]">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('subject.titleList')}
        description={t('subject.descriptionList', { count: total })}
        breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: t('subject.breadcrumb.list') }]}
        actions={<Button leftIcon={<Plus className="h-4 w-4" />}>{t('subject.add')}</Button>}
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('subject.filter.searchPlaceholder')}
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2"
          />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border))] p-12 text-center">
          <p className="text-[rgb(var(--text-muted))]">{t('subject.empty.title')}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgb(var(--border)/0.6)]">
                {[
                  t('subject.table.maMH'),
                  t('subject.table.tenMon'),
                  t('subject.table.tinChi'),
                  t('subject.table.lt'),
                  t('subject.table.th'),
                  t('subject.table.loai'),
                  t('subject.table.khoa'),
                  t('subject.table.giangVien'),
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
              {list.map((s: any) => {
                const dept = s.department?.name || s.departmentName || '—';
                const typeLabel = s.isActive === false ? 'Ngừng' : 'Bắt buộc';
                const typeVariant = s.isActive === false ? 'neutral' : 'success';
                return (
                  <tr key={s._id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex h-8 w-12 items-center justify-center rounded-md bg-[rgb(var(--primary)/0.1)] text-[10px] font-bold text-[rgb(var(--primary))]">
                        {s.code}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[rgb(var(--text-primary))]">{s.name}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[rgb(var(--primary))]">{s.credits}</td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{s.theoryHours}h</td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{s.practiceHours}h</td>
                    <td className="px-4 py-3">
                      <Badge variant={typeVariant as 'success' | 'accent' | 'info'} size="sm">
                        {typeLabel}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{dept}</td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">—</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

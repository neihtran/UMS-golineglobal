import { useState } from 'react';
import { Plus, Search, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { TablePagination } from '@/components/ui';
import { useCurriculumList } from '@/hooks/useSis';

const EDUCATION_LEVEL_MAP: Record<string, { variant: 'success' | 'accent' | 'info'; label: string }> = {
  regular: { variant: 'accent', label: 'Cử nhân' },
  advanced: { variant: 'success', label: 'Kỹ sư' },
};

export default function CurriculumListPage() {
  const { t } = useTranslation('sis');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useCurriculumList({
    search: search || undefined,
    page,
    pageSize,
  });

  const list = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  if (isLoading && list.length === 0) {
    return <div className="flex items-center justify-center h-64"><p className="text-[rgb(var(--text-muted))]">Đang tải...</p></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('curriculum.titleList')}
        description={t('curriculum.descriptionList', { count: total })}
        breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: t('curriculum.breadcrumb.list') }]}
        actions={<Button leftIcon={<Plus className="h-4 w-4" />}>{t('curriculum.add')}</Button>}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('curriculum.searchPlaceholder')} className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2" />
        </div>
      </div>
      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border))] p-12 text-center">
          <p className="text-[rgb(var(--text-muted))]">{t('curriculum.empty.title')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {list.map((c: any) => (
              <div key={c._id} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-5 hover:border-[rgb(var(--primary)/0.3)] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{c.name}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{c.code}</p>
                    </div>
                  </div>
                  <Badge variant={c.status === 'active' ? 'success' : 'neutral'} dot size="sm">
                    {c.status === 'active' ? t('curriculum.status.effect') : t('curriculum.status.notEffect')}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-[rgb(var(--bg-base))]">
                    <p className="text-lg font-bold text-[rgb(var(--text-primary))]">{c.durationYears ?? c.startYear ?? '—'}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{t('curriculum.nienKhoa')}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-[rgb(var(--bg-base))]">
                    <p className="text-lg font-bold text-[rgb(var(--primary))]">{c.totalCredits ?? c.credits ?? '—'}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{t('curriculum.tinChi')}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-[rgb(var(--bg-base))]">
                    <p className="text-xs font-semibold text-[rgb(var(--text-primary))]">{c.educationLevel || c.major || '—'}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{t('curriculum.detail.nganh')}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-[rgb(var(--border)/0.4)]">
                  <Badge variant={EDUCATION_LEVEL_MAP[c.educationLevel]?.variant ?? 'info'} size="sm">{EDUCATION_LEVEL_MAP[c.educationLevel]?.label ?? c.educationLevel ?? '—'}</Badge>
                  <Button variant="ghost" size="sm">{t('curriculum.chiTiet')} →</Button>
                </div>
              </div>
            ))}
          </div>
          <TablePagination
            page={page}
            pageSize={pageSize}
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

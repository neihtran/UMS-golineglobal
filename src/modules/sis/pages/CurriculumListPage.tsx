import { useState } from 'react';
import { Plus, Search, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const CURRICULA = [
  { id: 'c1', code: 'CT2026-CNTT', name: 'Chương trình đào tạo CNTT 2026', major: 'Công nghệ Thông tin', degree: 'Kỹ sư', years: 4, credits: 150, status: 'active' },
  { id: 'c2', code: 'CT2026-ATTT', name: 'Chương trình đào tạo ATTT 2026', major: 'An toàn Thông tin', degree: 'Kỹ sư', years: 4, credits: 148, status: 'active' },
  { id: 'c3', code: 'CT2025-KHMT', name: 'Chương trình đào tạo KHMT 2025', major: 'Khoa học Máy tính', degree: 'Kỹ sư', years: 4, credits: 152, status: 'inactive' },
  { id: 'c4', code: 'CT2026-TTH', name: 'Chương trình đào tạo Toán-Tin 2026', major: 'Sư phạm Toán-Tin', degree: 'Cử nhân', years: 4, credits: 140, status: 'active' },
  { id: 'c5', code: 'CT2024-DHTT', name: 'Chương trình đào tạo ĐH Tin học 2024', major: 'Đại học Tin học', degree: 'Cử nhân', years: 3, credits: 120, status: 'inactive' },
];

const DEGREE_CONFIG: Record<string, string> = { 'Kỹ sư': 'success', 'Cử nhân': 'accent' };

export default function CurriculumListPage() {
  const { t } = useTranslation('sis');
  const { pagination, setPage } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');

  const filtered = CURRICULA.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()),
  );
  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('curriculum.titleList')}
        description={t('curriculum.descriptionList', { count: CURRICULA.length })}
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {paged.map((c) => (
          <Card key={c.id} className="hover:border-[rgb(var(--primary)/0.3)] transition-colors">
            <CardContent className="p-5">
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
                  <p className="text-lg font-bold text-[rgb(var(--text-primary))]">{c.years}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{t('curriculum.nienKhoa')}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-[rgb(var(--bg-base))]">
                  <p className="text-lg font-bold text-[rgb(var(--primary))]">{c.credits}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{t('curriculum.tinChi')}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-[rgb(var(--bg-base))]">
                  <p className="text-xs font-semibold text-[rgb(var(--text-primary))]">{c.major}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{t('curriculum.detail.nganh')}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-[rgb(var(--border)/0.4)]">
                <Badge variant={DEGREE_CONFIG[c.degree] as any} size="sm">{c.degree}</Badge>
                <Button variant="ghost" size="sm">{t('curriculum.chiTiet')} →</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

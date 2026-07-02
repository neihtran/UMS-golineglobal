import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const SUBJECTS = [
  { id: 's1', code: 'CS101', name: 'Nhập môn Lập trình Python', credits: 3, theory: 45, practice: 30, type: 'BB', dept: 'Khoa CNTT', instructor: 'TS. Nguyễn Văn Minh' },
  { id: 's2', code: 'CS201', name: 'Cấu trúc Dữ liệu & Giải thuật', credits: 4, theory: 60, practice: 30, type: 'BB', dept: 'Khoa CNTT', instructor: 'PGS.TS. Lê Thị Lan' },
  { id: 's3', code: 'MATH101', name: 'Giải tích 1', credits: 4, theory: 60, practice: 30, type: 'BB', dept: 'Khoa Toán', instructor: 'TS. Bùi Minh Tuấn' },
  { id: 's4', code: 'ENG101', name: 'Tiếng Anh Đại cương', credits: 3, theory: 45, practice: 15, type: 'TC', dept: 'Khoa NN', instructor: 'ThS. Trần Hoàng Nam' },
  { id: 's5', code: 'PHYS101', name: 'Vật lý Đại cương', credits: 3, theory: 45, practice: 15, type: 'BB', dept: 'Khoa Vật lý', instructor: 'TS. Hoàng Thu Lan' },
  { id: 's6', code: 'CHEM101', name: 'Hóa học Đại cương', credits: 3, theory: 45, practice: 15, type: 'TC', dept: 'Khoa Hóa', instructor: 'PGS.TS. Đặng Văn Minh' },
];

const TYPE_CONFIG: Record<string, { label: string; variant: 'success' | 'accent' | 'info' }> = {
  BB: { label: 'Bắt buộc', variant: 'success' },
  TC: { label: 'Tự chọn', variant: 'accent' },
  TC2: { label: 'Tự chọn 2', variant: 'info' },
};

export default function SubjectListPage() {
  const { t } = useTranslation('sis');
  const { pagination, setPage } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const types = ['all', ...Array.from(new Set(SUBJECTS.map((s) => s.type)))];
  const filtered = SUBJECTS.filter((s) => {
    const match = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || s.type === typeFilter;
    return match && matchType;
  });
  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('subject.titleList')}
        description={t('subject.descriptionList', { count: SUBJECTS.length })}
        breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: t('subject.breadcrumb.list') }]}
        actions={<Button leftIcon={<Plus className="h-4 w-4" />}>{t('subject.add')}</Button>}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('subject.filter.searchPlaceholder')} className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2" />
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2">
          {types.map((tOpt) => <option key={tOpt} value={tOpt}>{tOpt === 'all' ? t('subject.filter.allTypes') : TYPE_CONFIG[tOpt]?.label ?? tOpt}</option>)}
        </select>
      </div>
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgb(var(--border)/0.6)]">
              {[
                t('subject.table.maMH'), t('subject.table.tenMon'), t('subject.table.tinChi'),
                t('subject.table.lt'), t('subject.table.th'), t('subject.table.loai'),
                t('subject.table.khoa'), t('subject.table.giangVien')
              ].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
            {paged.map((s) => (
              <tr key={s.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex h-8 w-12 items-center justify-center rounded-md bg-[rgb(var(--primary)/0.1)] text-[10px] font-bold text-[rgb(var(--primary))]">
                    {s.code}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-[rgb(var(--text-primary))]">{s.name}</td>
                <td className="px-4 py-3 text-sm font-bold text-[rgb(var(--primary))]">{s.credits}</td>
                <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{s.theory}h</td>
                <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{s.practice}h</td>
                <td className="px-4 py-3"><Badge variant={TYPE_CONFIG[s.type].variant} size="sm">{TYPE_CONFIG[s.type].label}</Badge></td>
                <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{s.dept}</td>
                <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{s.instructor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

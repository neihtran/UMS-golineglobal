import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const ENROLLMENTS = [
  { id: 'e1', studentCode: 'SV2026001', studentName: 'Nguyễn Văn An', class: 'CNTT-2026.1', course: 'CS101', courseName: 'Nhập môn Lập trình Python', semester: 'HK1 2026-2027', status: 'approved', enrolledAt: '2026-08-15' },
  { id: 'e2', studentCode: 'SV2026002', studentName: 'Trần Thị Bình', class: 'CNTT-2026.1', course: 'CS101', courseName: 'Nhập môn Lập trình Python', semester: 'HK1 2026-2027', status: 'approved', enrolledAt: '2026-08-15' },
  { id: 'e3', studentCode: 'SV2026003', studentName: 'Lê Minh Cường', class: 'CNTT-2026.1', course: 'MATH101', courseName: 'Giải tích 1', semester: 'HK1 2026-2027', status: 'pending', enrolledAt: '2026-08-18' },
  { id: 'e4', studentCode: 'SV2026004', studentName: 'Phạm Thu Dung', class: 'CNTT-2026.2', course: 'CS101', courseName: 'Nhập môn Lập trình Python', semester: 'HK1 2026-2027', status: 'rejected', enrolledAt: '2026-08-16' },
  { id: 'e5', studentCode: 'SV2026005', studentName: 'Hoàng Văn E', class: 'TOAN-2026.1', course: 'MATH101', courseName: 'Giải tích 1', semester: 'HK1 2026-2027', status: 'approved', enrolledAt: '2026-08-15' },
  { id: 'e6', studentCode: 'SV2026006', studentName: 'Vũ Thị F', class: 'CNTT-2026.1', course: 'ENG101', courseName: 'Tiếng Anh Đại cương', semester: 'HK1 2026-2027', status: 'pending', enrolledAt: '2026-08-19' },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; labelKey: string }> = {
  approved: { variant: 'success', labelKey: 'enrollment.status.approved' },
  pending: { variant: 'warning', labelKey: 'enrollment.status.pending' },
  rejected: { variant: 'error', labelKey: 'enrollment.status.rejected' },
};

export default function EnrollmentListPage() {
  const { t } = useTranslation('sis');
  const { pagination, setPage } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const statuses = ['all', 'approved', 'pending', 'rejected'];
  const filtered = ENROLLMENTS.filter((e) => {
    const match = !search || e.studentName.toLowerCase().includes(search.toLowerCase()) || e.studentCode.includes(search);
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return match && matchStatus;
  });
  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const STATUS_FILTER_LABELS: Record<string, string> = {
    all: t('enrollment.filter.allStatuses'),
    approved: t('enrollment.status.approved'),
    pending: t('enrollment.status.pending'),
    rejected: t('enrollment.status.rejected'),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('enrollment.titleList')}
        description={t('enrollment.descriptionList', { count: ENROLLMENTS.length, semester: 'HK1 2026-2027' })}
        breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: t('enrollment.breadcrumb.list') }]}
        actions={<Button leftIcon={<Plus className="h-4 w-4" />}>{t('enrollment.add')}</Button>}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('enrollment.filter.searchPlaceholder')} className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2">
          {statuses.map((s) => <option key={s} value={s}>{STATUS_FILTER_LABELS[s]}</option>)}
        </select>
      </div>
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgb(var(--border)/0.6)]">
              {[t('enrollment.table.maSV'), t('enrollment.table.hoTen'), t('enrollment.table.lop'), t('enrollment.table.monHoc'), t('enrollment.table.hocKy'), t('enrollment.table.trangThai'), t('enrollment.table.ngayDK')].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
            {paged.map((e) => (
              <tr key={e.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                <td className="px-4 py-3 text-xs font-mono text-[rgb(var(--text-secondary))]">{e.studentCode}</td>
                <td className="px-4 py-3 text-sm font-medium text-[rgb(var(--text-primary))]">{e.studentName}</td>
                <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{e.class}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[rgb(var(--primary)/0.1)] text-[10px] font-bold text-[rgb(var(--primary))]">{e.course}</div>
                    <span className="text-sm text-[rgb(var(--text-primary))]">{e.courseName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-[rgb(var(--text-secondary))]">{e.semester}</td>
                <td className="px-4 py-3"><Badge variant={STATUS_CONFIG[e.status].variant} dot size="sm">{t(STATUS_CONFIG[e.status].labelKey)}</Badge></td>
                <td className="px-4 py-3 text-xs text-[rgb(var(--text-secondary))]">{e.enrolledAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

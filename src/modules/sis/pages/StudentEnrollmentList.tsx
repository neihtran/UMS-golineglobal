import { useState } from 'react';
import {
  Plus, Download, CheckCircle2, XCircle, AlertTriangle,
  Award,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Badge, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TablePagination, TableEmpty } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const ENROLLMENTS = [
  { id: 'er01', studentId: 'SV-2024-0142', studentName: 'Nguyễn Minh Tuấn', class: 'CNTT-K24', major: 'CNTT', status: 'registered', semester: 'HK2/2025-2026', registerDate: '2026-01-15', courses: 7, credits: 21, gpa: 3.45 },
  { id: 'er02', studentId: 'SV-2024-0167', studentName: 'Trần Thu Hà', class: 'CNTT-K24', major: 'CNTT', status: 'completed', semester: 'HK2/2025-2026', registerDate: '2026-01-10', courses: 6, credits: 18, gpa: 3.82 },
  { id: 'er03', studentId: 'SV-2024-0089', studentName: 'Lê Đình Phong', class: 'CNTT-K24', major: 'CNTT', status: 'failed', semester: 'HK2/2025-2026', registerDate: '2026-01-12', courses: 7, credits: 21, gpa: 1.85 },
  { id: 'er04', studentId: 'SV-2023-0211', studentName: 'Phạm Thị Lan', class: 'KT-K23', major: 'Kinh tế', status: 'registered', semester: 'HK2/2025-2026', registerDate: '2026-01-14', courses: 8, credits: 24, gpa: 3.21 },
  { id: 'er05', studentId: 'SV-2024-0056', studentName: 'Bùi Hoàng Nam', class: 'LUAT-K24', major: 'Luật', status: 'withdrawn', semester: 'HK2/2025-2026', registerDate: '2026-01-08', courses: 5, credits: 15, gpa: 0 },
  { id: 'er06', studentId: 'SV-2023-0304', studentName: 'Đặng Minh Châu', class: 'NN-K23', major: 'Ngoại ngữ', status: 'registered', semester: 'HK2/2025-2026', registerDate: '2026-01-15', courses: 6, credits: 18, gpa: 3.65 },
];

const MAJORS = ['Tất cả', 'CNTT', 'Kinh tế', 'Luật', 'Ngoại ngữ'];

export default function StudentEnrollmentList() {
  const { t } = useTranslation('sis');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [major, setMajor] = useState('Tất cả');
  const [status, setStatus] = useState('all');

  const filtered = ENROLLMENTS.filter((e) => {
    const match = !search || e.studentName.toLowerCase().includes(search.toLowerCase()) || e.studentId.toLowerCase().includes(search.toLowerCase());
    const matchMajor = major === 'Tất cả' || e.major === major;
    const matchStatus = status === 'all' || e.status === status;
    return match && matchMajor && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral' | 'info'; labelKey: string; icon: React.ReactNode }> = {
    registered: { variant: 'info', labelKey: 'enrollment.status.registered', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    completed: { variant: 'success', labelKey: 'enrollment.status.completed', icon: <Award className="h-3.5 w-3.5" /> },
    failed: { variant: 'error', labelKey: 'enrollment.status.failed', icon: <XCircle className="h-3.5 w-3.5" /> },
    withdrawn: { variant: 'neutral', labelKey: 'enrollment.status.withdrawn', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  };

  const SUMMARY_STATS = [
    { labelKey: 'enrollment.status.registered', value: 3, icon: <CheckCircle2 className="h-5 w-5" />, color: 'info' },
    { labelKey: 'enrollment.status.completed', value: 1, icon: <Award className="h-5 w-5" />, color: 'success' },
    { labelKey: 'enrollment.status.failed', value: 1, icon: <XCircle className="h-5 w-5" />, color: 'error' },
    { labelKey: 'enrollment.status.withdrawn', value: 1, icon: <AlertTriangle className="h-5 w-5" />, color: 'neutral' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('enrollment.title')}
        description={t('enrollment.description')}
        breadcrumbs={[{ label: 'SIS', href: '/sis' }, { label: t('enrollment.title') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('enrollment.export')}</Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('enrollment.print')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => window.location.href = '/sis/dang-ky-hoc-phan/tao'}>{t('enrollment.openSession')}</Button>
          </>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {SUMMARY_STATS.map((s) => (
          <div key={s.labelKey} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3 hover-lift">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{t(s.labelKey)}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder={t('enrollment.filter.searchPlaceholder')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} wrapperClassName="w-72" />
        <select value={major} onChange={(e) => { setMajor(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          {MAJORS.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          <option value="all">{t('enrollment.filter.allStatuses')}</option>
          <option value="registered">{t('enrollment.status.registered')}</option>
          <option value="completed">{t('enrollment.status.completed')}</option>
          <option value="failed">{t('enrollment.status.failed')}</option>
          <option value="withdrawn">{t('enrollment.status.withdrawn')}</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('enrollment.table.mssv')}</TableHeadCell>
            <TableHeadCell>{t('enrollment.table.sinhVien')}</TableHeadCell>
            <TableHeadCell>{t('enrollment.table.nganh')}</TableHeadCell>
            <TableHeadCell>{t('enrollment.table.hocKy')}</TableHeadCell>
            <TableHeadCell className="text-center">{t('enrollment.table.soHP')}</TableHeadCell>
            <TableHeadCell className="text-center">{t('enrollment.table.tinChi')}</TableHeadCell>
            <TableHeadCell className="text-center">{t('enrollment.table.gpa')}</TableHeadCell>
            <TableHeadCell>{t('enrollment.table.ngayDK')}</TableHeadCell>
            <TableHeadCell>{t('enrollment.table.trangThai')}</TableHeadCell>
            <TableHeadCell>{t('enrollment.table.thaoTac')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={10} message={t('enrollment.empty.title')} />
          ) : (
            paged.map((e) => {
              const sc = STATUS_CONFIG[e.status];
              return (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{e.studentId}</TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))]">{e.studentName}</TableCell>
                  <TableCell>
                    <p className="text-[rgb(var(--text-secondary))]">{e.class}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{e.major}</p>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{e.semester}</TableCell>
                  <TableCell className="text-center font-semibold text-[rgb(var(--text-primary))]">{e.courses}</TableCell>
                  <TableCell className="text-center text-[rgb(var(--text-secondary))]">{e.credits}</TableCell>
                  <TableCell className={`text-center font-bold ${e.gpa >= 3.5 ? 'text-[rgb(var(--success))]' : e.gpa >= 2.0 ? 'text-[rgb(var(--warning))]' : 'text-[rgb(var(--error))]'}`}>
                    {e.gpa > 0 ? e.gpa.toFixed(2) : '—'}
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{e.registerDate}</TableCell>
                  <TableCell>
                    <Badge variant={sc.variant} dot size="sm">{t(sc.labelKey)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => window.location.href = `/sis/dang-ky-hoc-phan/${e.id}`}>{t('enrollment.action.chiTiet')}</Button>
                      {e.status === 'registered' && (
                        <Button variant="ghost" size="sm" onClick={() => window.location.href = `/sis/dang-ky-hoc-phan/${e.id}/sua`}>{t('enrollment.table.sua')}</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={pagination.page} pageSize={pagination.pageSize} total={filtered.length}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}

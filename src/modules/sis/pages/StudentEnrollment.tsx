import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Download, UserPlus, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge, Button, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const ENROLLMENTS = [
  { id: 'e1', studentId: 'sv001', name: 'Nguyễn Văn An', class: 'CNTT-K60A', major: 'CNTT', semester: 'HK2/2025-2026', status: 'registered', registeredAt: '15/01/2026', approvedBy: 'ThS. Trần Văn B' },
  { id: 'e2', studentId: 'sv002', name: 'Trần Thị Bình', class: 'KT-K59B', major: 'Kinh tế', semester: 'HK2/2025-2026', status: 'registered', registeredAt: '16/01/2026', approvedBy: 'TS. Lê Văn C' },
  { id: 'e3', studentId: 'sv003', name: 'Lê Hoàng Cường', class: 'LUAT-K61A', major: 'Luật', semester: 'HK2/2025-2026', status: 'registered', registeredAt: '17/01/2026', approvedBy: 'PGS.TS. Phạm Văn D' },
  { id: 'e4', studentId: 'sv004', name: 'Phạm Thị Dung', class: 'NN-K60A', major: 'Ngoại ngữ', semester: 'HK2/2025-2026', status: 'pending', registeredAt: '20/01/2026', approvedBy: '—' },
  { id: 'e5', studentId: 'sv005', name: 'Đặng Minh Tuấn', class: 'SP-K59A', major: 'Sư phạm', semester: 'HK2/2025-2026', status: 'rejected', registeredAt: '18/01/2026', approvedBy: 'TS. Hoàng Văn E' },
];

export default function StudentEnrollment() {
  const { t } = useTranslation('sis');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = ENROLLMENTS.filter((e) => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.studentId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'info'; labelKey: string; icon: React.ReactNode }> = {
    registered: { variant: 'success', labelKey: 'enrollment.status.registered', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    pending: { variant: 'warning', labelKey: 'enrollment.status.pending', icon: null },
    rejected: { variant: 'error', labelKey: 'enrollment.status.rejected', icon: <XCircle className="h-3.5 w-3.5" /> },
  };

  const STATS = [
    { labelKey: 'enrollment.stats.totalEnrollments', value: '4,521', icon: <Users className="h-5 w-5" />, color: 'primary' },
    { labelKey: 'enrollment.stats.approved', value: '3,892', icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
    { labelKey: 'enrollment.stats.pending', value: '412', icon: <Users className="h-5 w-5" />, color: 'warning' },
    { labelKey: 'enrollment.stats.rejected', value: '217', icon: <XCircle className="h-5 w-5" />, color: 'error' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('enrollment.title')}
        description={t('enrollment.description')}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('enrollment.title') },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('enrollment.export')}</Button>
            <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => window.location.href = '/sis/dang-ky-hoc-phan/tao'}>{t('enrollment.create')}</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => (
          <Card key={s.labelKey}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{t(s.labelKey)}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="px-5 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder={t('enrollment.filter.searchStudent')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-64 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2"
          >
            <option value="all">{t('enrollment.filter.allStatuses')}</option>
            <option value="registered">{t('enrollment.status.registered')}</option>
            <option value="pending">{t('enrollment.status.pending')}</option>
            <option value="rejected">{t('enrollment.status.rejected')}</option>
          </select>
          <span className="text-sm text-[rgb(var(--text-muted))] ml-auto">{filtered.length} {t('enrollment.empty.title')}</span>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>{t('enrollment.table.maSV')}</TableHeadCell>
              <TableHeadCell>{t('enrollment.table.hoTen')}</TableHeadCell>
              <TableHeadCell>{t('enrollment.table.lop')}</TableHeadCell>
              <TableHeadCell>{t('enrollment.table.nganh')}</TableHeadCell>
              <TableHeadCell>{t('enrollment.table.hocKy')}</TableHeadCell>
              <TableHeadCell>{t('enrollment.table.trangThai')}</TableHeadCell>
              <TableHeadCell>{t('enrollment.table.ngayDangKy')}</TableHeadCell>
              <TableHeadCell>{t('enrollment.table.thaoTac')}</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((e) => {
              const sc = STATUS_CONFIG[e.status];
              return (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{e.studentId}</TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))]">{e.name}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{e.class}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{e.major}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{e.semester}</TableCell>
                  <TableCell>
                    <Badge variant={sc.variant} dot size="sm">{t(sc.labelKey)}</Badge>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))] text-xs">{e.registeredAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {e.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="sm" className="text-[rgb(var(--success))]">{t('enrollment.action.duyet')}</Button>
                          <Button variant="ghost" size="sm" className="text-[rgb(var(--error))]">{t('enrollment.action.tuChoi')}</Button>
                        </>
                      )}
                      <Link to={`/sis/dang-ky-hoc-phan/${e.id}`}>
                        <Button variant="ghost" size="sm">{t('enrollment.action.chiTiet')}</Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

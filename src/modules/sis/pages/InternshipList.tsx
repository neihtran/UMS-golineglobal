import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Briefcase,
  MapPin,
  CheckCircle2,
  Clock,
  GraduationCap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Input,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TablePagination,
  TableEmpty,
  Card,
  CardContent,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useInternshipList } from '@/hooks/useSis';
import { usePagination } from '@/hooks';

const gradeColor = (g: number) => {
  if (g >= 8.5) return 'text-[rgb(var(--success))]';
  if (g >= 7.0) return 'text-[rgb(var(--primary))]';
  if (g >= 5.0) return 'text-[rgb(var(--warning))]';
  return 'text-[rgb(var(--error))]';
};

const gradeLabel = (g: number) => {
  if (g >= 8.5) return 'A';
  if (g >= 7.5) return 'B+';
  if (g >= 7.0) return 'B';
  if (g >= 6.5) return 'C+';
  if (g >= 6.0) return 'C';
  if (g >= 5.0) return 'D';
  return 'F';
};

export default function InternshipList() {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [filterMajor, setFilterMajor] = useState('Tất cả');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  const { data, isLoading } = useInternshipList({
    page: pagination.page,
    pageSize: pagination.pageSize,
  });

  const all = data?.data ?? [];
  const total = data?.pagination?.total ?? all.length;

  const filtered = all.filter((i: any) => {
    const matchSearch =
      !search ||
      (i.studentName && i.studentName.toLowerCase().includes(search.toLowerCase())) ||
      (i.studentCode && i.studentCode.toLowerCase().includes(search.toLowerCase())) ||
      (i.company && i.company.toLowerCase().includes(search.toLowerCase()));
    const matchMajor = filterMajor === 'Tất cả' || i.major === filterMajor;
    const matchStatus = filterStatus === 'Tất cả' || i.status === filterStatus;
    return matchSearch && matchMajor && matchStatus;
  });

  const completed = all.filter((i: any) => i.status === 'completed').length;
  const inProgress = all.filter((i: any) => i.status === 'in_progress').length;
  const grades = all.filter((i: any) => i.grade != null);
  const avgGrade = grades.length > 0
    ? grades.reduce((s: number, i: any) => s + (i.grade ?? 0), 0) / grades.length
    : 0;

  const STATS = [
    { labelKey: 'internship.stats.totalRegistrations', value: total, icon: <Briefcase className="h-5 w-5" />, color: 'primary' },
    { labelKey: 'internship.stats.inProgress', value: inProgress, icon: <Clock className="h-5 w-5" />, color: 'warning' },
    { labelKey: 'internship.stats.completed', value: completed, icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
    { labelKey: 'internship.stats.avgGrade', value: avgGrade > 0 ? avgGrade.toFixed(1) : '—', icon: <GraduationCap className="h-5 w-5" />, color: 'accent' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('internship.title')}
        description={t('internship.description')}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: 'Đào tạo', href: '/sis' },
          { label: t('internship.breadcrumb.list') },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Search className="h-4 w-4" />}>{t('internship.filter')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/sis/thuc-tap/tao')}>{t('internship.add')}</Button>
          </>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((s) => (
          <Card key={s.labelKey}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{t(s.labelKey)}</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{isLoading ? '—' : s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder={t('internship.filter.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-80"
        />
        <select value={filterMajor} onChange={(e) => { setFilterMajor(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          <option value="Tất cả">Tất cả ngành</option>
          <option value="CNTT">CNTT</option>
          <option value="Kế toán">Kế toán</option>
          <option value="QTKD">QTKD</option>
          <option value="NNT">NNT</option>
          <option value="Tài chính">Tài chính</option>
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          <option value="Tất cả">{t('internship.filter.allStatuses')}</option>
          <option value="registered">{t('internship.status.registered')}</option>
          <option value="in_progress">{t('internship.status.in_progress')}</option>
          <option value="pending_report">{t('internship.status.pending_report')}</option>
          <option value="completed">{t('internship.status.completed')}</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>{t('internship.table.sinhVien')}</TableHeadCell>
            <TableHeadCell>{t('internship.table.nganh')}</TableHeadCell>
            <TableHeadCell>{t('internship.table.congTy')}</TableHeadCell>
            <TableHeadCell>{t('internship.table.viTri')}</TableHeadCell>
            <TableHeadCell>{t('internship.table.diaDiem')}</TableHeadCell>
            <TableHeadCell>{t('internship.table.thoiGian')}</TableHeadCell>
            <TableHeadCell>{t('internship.table.trangThai')}</TableHeadCell>
            <TableHeadCell>{t('internship.table.tienDo')}</TableHeadCell>
            <TableHeadCell>{t('internship.table.diem')}</TableHeadCell>
            <TableHeadCell>{t('internship.table.thaoTac')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmpty colSpan={11} message={t('common:common.loading')} />
          ) : filtered.length === 0 ? (
            <TableEmpty colSpan={11} message={t('internship.empty.title')} />
          ) : (
            filtered.map((i: any, idx: number) => {
            const statusLabelMap: Record<string, string> = {
              registered: t('internship.status.registered'),
              in_progress: t('internship.status.in_progress'),
              pending_report: t('internship.status.pending_report'),
              completed: t('internship.status.completed'),
              rejected: t('internship.status.rejected'),
            };
              return (
                <TableRow key={i._id ?? i.id}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(pagination.page - 1) * pagination.pageSize + idx + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{i.studentName ?? '—'}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{i.studentCode ?? '—'} — {i.class ?? '—'}</p>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="neutral" size="sm">{i.major ?? '—'}</Badge></TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-[rgb(var(--text-primary))]">{i.company ?? '—'}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{i.supervisor ?? ''}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{i.position ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-[rgb(var(--text-muted))]">
                      <MapPin className="h-3 w-3" />
                      {i.location ?? '—'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-[rgb(var(--text-secondary))]">
                      <p>{i.startDate ?? '—'}</p>
                      <p>→ {i.endDate ?? '—'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={i.status === 'completed' ? 'success' : i.status === 'in_progress' ? 'warning' : i.status === 'rejected' ? 'error' : 'neutral'} size="sm">
                      {statusLabelMap[i.status] ?? i.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {i.status === 'completed' ? (
                      <Badge variant="success" size="sm">100%</Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-[rgb(var(--border))]">
                          <div className="h-full rounded-full bg-[rgb(var(--primary))]" style={{ width: `${i.progress ?? 0}%` }} />
                        </div>
                        <span className="text-xs text-[rgb(var(--text-muted))]">{i.progress ?? 0}%</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {i.grade != null ? (
                      <div>
                        <span className={`text-sm font-bold ${gradeColor(i.grade)}`}>{Number(i.grade).toFixed(1)}</span>
                        <span className="text-xs text-[rgb(var(--text-muted))] ml-1">({gradeLabel(i.grade)})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/sis/thuc-tap/${i._id ?? i.id}`)}>{t('internship.table.chiTiet')}</Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}

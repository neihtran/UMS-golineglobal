import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Briefcase,
  MapPin,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
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
import { usePagination } from '@/hooks';

type Internship = {
  id: string;
  studentCode: string;
  studentName: string;
  class: string;
  major: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  supervisor: string;
  supervisorPhone: string;
  status: 'registered' | 'in_progress' | 'completed' | 'rejected' | 'pending_report';
  progress: number;
  reportSubmitted: boolean;
  grade: number | null;
};

const INTERNSHIPS: Internship[] = [
  { id: 'it001', studentCode: 'SV2022001', studentName: 'Nguyễn Thị Lan Anh', class: 'CNTT-K24', major: 'CNTT', company: 'FPT Software Đà Nẵng', position: 'Thực tập sinh Backend', location: 'Đà Nẵng', startDate: '2026-06-01', endDate: '2026-08-31', supervisor: 'Nguyễn Văn Minh', supervisorPhone: '0901234567', status: 'in_progress', progress: 45, reportSubmitted: false, grade: null },
  { id: 'it002', studentCode: 'SV2022003', studentName: 'Trần Hoàng Nam', class: 'CNTT-K24', major: 'CNTT', company: 'Viettel Solutions', position: 'Thực tập sinh DevOps', location: 'Đà Nẵng', startDate: '2026-06-01', endDate: '2026-08-31', supervisor: 'Lê Thị Hương', supervisorPhone: '0902345678', status: 'in_progress', progress: 60, reportSubmitted: false, grade: null },
  { id: 'it003', studentCode: 'SV2022005', studentName: 'Phạm Thu Hà', class: 'KT-K24', major: 'Kế toán', company: 'KPMG Việt Nam', position: 'Thực tập sinh Kế toán', location: 'TP. Hồ Chí Minh', startDate: '2026-05-15', endDate: '2026-08-15', supervisor: 'Trần Văn Lợi', supervisorPhone: '0912345678', status: 'pending_report', progress: 100, reportSubmitted: false, grade: null },
  { id: 'it004', studentCode: 'SV2022008', studentName: 'Lê Đình Phong', class: 'QTKD-K24', major: 'QTKD', company: 'VnExpress', position: 'Thực tập sinh Marketing', location: 'TP. Hồ Chí Minh', startDate: '2026-04-01', endDate: '2026-06-30', supervisor: 'Phạm Thị Mai', supervisorPhone: '0934567890', status: 'completed', progress: 100, reportSubmitted: true, grade: 8.5 },
  { id: 'it005', studentCode: 'SV2022009', studentName: 'Đặng Minh Tuấn', class: 'CNTT-K24', major: 'CNTT', company: 'Amazon Web Services Vietnam', position: 'Thực tập sinh Cloud', location: 'Đà Nẵng', startDate: '2026-06-01', endDate: '2026-08-31', supervisor: 'Hoàng Văn Tùng', supervisorPhone: '0945678901', status: 'in_progress', progress: 30, reportSubmitted: false, grade: null },
  { id: 'it006', studentCode: 'SV2022012', studentName: 'Bùi Thị Hồng', class: 'NN-K24', major: 'NNT', company: 'Công ty TNHH Một Thành viên ABC', position: 'Thực tập sinh Nhân sự', location: 'Đà Nẵng', startDate: '2026-06-15', endDate: '2026-09-15', supervisor: 'Vũ Thị Lan', supervisorPhone: '0956789012', status: 'registered', progress: 0, reportSubmitted: false, grade: null },
  { id: 'it007', studentCode: 'SV2022015', studentName: 'Ngô Văn Hùng', class: 'TC-K24', major: 'Tài chính', company: 'BIDV Đà Nẵng', position: 'Thực tập sinh Tín dụng', location: 'Đà Nẵng', startDate: '2026-04-01', endDate: '2026-06-30', supervisor: 'Đặng Hoàng Long', supervisorPhone: '0967890123', status: 'completed', progress: 100, reportSubmitted: true, grade: 9.0 },
  { id: 'it008', studentCode: 'SV2022018', studentName: 'Trịnh Thị Thanh', class: 'CNTT-K23', major: 'CNTT', company: 'Google Developer Group Đà Nẵng', position: 'Thực tập sinh Mobile', location: 'Đà Nẵng', startDate: '2026-03-01', endDate: '2026-05-31', supervisor: 'Nguyễn Thị Phương', supervisorPhone: '0978901234', status: 'completed', progress: 100, reportSubmitted: true, grade: 7.5 },
  { id: 'it009', studentCode: 'SV2022020', studentName: 'Vũ Đức Anh', class: 'CNTT-K24', major: 'CNTT', company: 'Lazada Việt Nam', position: 'Thực tập sinh QA', location: 'TP. Hồ Chí Minh', startDate: '2026-06-01', endDate: '2026-08-31', supervisor: 'Lý Thị Hà', supervisorPhone: '0989012345', status: 'in_progress', progress: 20, reportSubmitted: false, grade: null },
  { id: 'it010', studentCode: 'SV2022022', studentName: 'Hoàng Minh Châu', class: 'QTKD-K24', major: 'QTKD', company: 'Shopee Việt Nam', position: 'Thực tập sinh Operations', location: 'TP. Hồ Chí Minh', startDate: '2026-05-01', endDate: '2026-07-31', supervisor: 'Trần Văn Minh', supervisorPhone: '0990123456', status: 'pending_report', progress: 100, reportSubmitted: false, grade: null },
];

const MAJOR_FILTERS = ['Tất cả', 'CNTT', 'Kế toán', 'QTKD', 'NNT', 'Tài chính'];
const STATUS_FILTERS = ['Tất cả', 'registered', 'in_progress', 'pending_report', 'completed'];

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

  const filtered = INTERNSHIPS.filter((i) => {
    const matchSearch =
      !search ||
      i.studentName.toLowerCase().includes(search.toLowerCase()) ||
      i.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      i.company.toLowerCase().includes(search.toLowerCase());
    const matchMajor = filterMajor === 'Tất cả' || i.major === filterMajor;
    const matchStatus = filterStatus === 'Tất cả' || i.status === filterStatus;
    return matchSearch && matchMajor && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const completed = INTERNSHIPS.filter((i) => i.status === 'completed').length;
  const inProgress = INTERNSHIPS.filter((i) => i.status === 'in_progress').length;
  const avgGrade = INTERNSHIPS.filter((i) => i.grade !== null)
    .reduce((s, i) => s + (i.grade ?? 0), 0) / INTERNSHIPS.filter((i) => i.grade !== null).length;

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'error' | 'info'; labelKey: string; icon: React.ReactNode }> = {
    registered: { variant: 'info', labelKey: 'internship.status.registered', icon: <FileText className="h-3.5 w-3.5" /> },
    in_progress: { variant: 'warning', labelKey: 'internship.status.in_progress', icon: <Clock className="h-3.5 w-3.5" /> },
    pending_report: { variant: 'neutral', labelKey: 'internship.status.pending_report', icon: <FileText className="h-3.5 w-3.5" /> },
    completed: { variant: 'success', labelKey: 'internship.status.completed', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    rejected: { variant: 'error', labelKey: 'internship.status.rejected', icon: <XCircle className="h-3.5 w-3.5" /> },
  };

  const STATS = [
    { labelKey: 'internship.stats.totalRegistrations', value: INTERNSHIPS.length, icon: <Briefcase className="h-5 w-5" />, color: 'primary' },
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
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
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
          {MAJOR_FILTERS.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          {STATUS_FILTERS.map(s => (
            <option key={s} value={s}>
              {s === 'Tất cả' ? t('internship.filter.allStatuses') : t(STATUS_CONFIG[s]?.labelKey ?? s)}
            </option>
          ))}
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('internship.table.stt')}</TableHeadCell>
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
          {paged.length === 0 ? (
            <TableEmpty colSpan={11} message={t('internship.empty.title')} />
          ) : paged.map((i, idx) => {
            const sc = STATUS_CONFIG[i.status];
            return (
              <TableRow key={i.id}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                  {(pagination.page - 1) * pagination.pageSize + idx + 1}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{i.studentName}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{i.studentCode} — {i.class}</p>
                  </div>
                </TableCell>
                <TableCell><Badge variant="neutral" size="sm">{i.major}</Badge></TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm text-[rgb(var(--text-primary))]">{i.company}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{i.supervisor}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-[rgb(var(--text-secondary))]">{i.position}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-[rgb(var(--text-muted))]">
                    <MapPin className="h-3 w-3" />
                    {i.location}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-[rgb(var(--text-secondary))]">
                    <p>{i.startDate}</p>
                    <p>→ {i.endDate}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={sc.variant} size="sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                    {sc.icon}{t(sc.labelKey)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {i.status === 'completed' ? (
                    <Badge variant="success" size="sm">100%</Badge>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-[rgb(var(--border))]">
                        <div className="h-full rounded-full bg-[rgb(var(--primary))]" style={{ width: `${i.progress}%` }} />
                      </div>
                      <span className="text-xs text-[rgb(var(--text-muted))]">{i.progress}%</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {i.grade !== null ? (
                    <div>
                      <span className={`text-sm font-bold ${gradeColor(i.grade)}`}>{i.grade.toFixed(1)}</span>
                      <span className="text-xs text-[rgb(var(--text-muted))] ml-1">({gradeLabel(i.grade)})</span>
                    </div>
                  ) : (
                    <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/sis/thuc-tap/${i.id}`)}>{t('internship.table.chiTiet')}</Button>
                </TableCell>
              </TableRow>
            );
          })}
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

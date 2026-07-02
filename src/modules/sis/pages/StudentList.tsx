import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Upload, UserPlus } from 'lucide-react';
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
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

type Status = 'studying' | 'reserved' | 'suspended' | 'graduated' | 'quit';

const MOCK_STUDENTS = [
  { id: 'sv001', msv: 'SV-2022-0001', name: 'Nguyễn Văn An', dob: '2004-05-12', class: 'CNTT-K60A', major: 'Công nghệ thông tin', dept: 'Khoa CNTT', cohort: '2022', gpa: 3.45, credits: 98, status: 'studying' as Status },
  { id: 'sv002', msv: 'SV-2022-0002', name: 'Trần Thị Bình', dob: '2004-08-20', class: 'KT-K60A', major: 'Kinh tế', dept: 'Khoa Kinh tế', cohort: '2022', gpa: 3.72, credits: 102, status: 'studying' as Status },
  { id: 'sv003', msv: 'SV-2023-0001', name: 'Lê Hoàng Nam', dob: '2005-03-05', class: 'CNTT-K61A', major: 'Công nghệ thông tin', dept: 'Khoa CNTT', cohort: '2023', gpa: 2.89, credits: 48, status: 'studying' as Status },
  { id: 'sv004', msv: 'SV-2021-0001', name: 'Phạm Thu Lan', dob: '2003-11-18', class: 'LUAT-K59', major: 'Luật', dept: 'Khoa Luật', cohort: '2021', gpa: 3.18, credits: 118, status: 'reserved' as Status },
  { id: 'sv005', msv: 'SV-2022-0003', name: 'Bùi Đình Sơn', dob: '2004-07-30', class: 'NN-K60A', major: 'Ngôn ngữ Anh', dept: 'Khoa Ngoại ngữ', cohort: '2022', gpa: 3.91, credits: 96, status: 'studying' as Status },
  { id: 'sv006', msv: 'SV-2020-0001', name: 'Đặng Minh Tuấn', dob: '2002-01-22', class: 'CNTT-K58A', major: 'Công nghệ thông tin', dept: 'Khoa CNTT', cohort: '2020', gpa: 3.65, credits: 128, status: 'graduated' as Status },
  { id: 'sv007', msv: 'SV-2023-0002', name: 'Vũ Thị Hương', dob: '2005-09-14', class: 'SP-K61A', major: 'Sư phạm Toán', dept: 'Khoa Sư phạm', cohort: '2023', gpa: 3.22, credits: 44, status: 'studying' as Status },
  { id: 'sv008', msv: 'SV-2022-0004', name: 'Hoàng Phương Linh', dob: '2004-12-01', class: 'CNTT-K60B', major: 'Công nghệ thông tin', dept: 'Khoa CNTT', cohort: '2022', gpa: 2.45, credits: 94, status: 'suspended' as Status },
  { id: 'sv009', msv: 'SV-2021-0002', name: 'Ngô Thanh Mai', dob: '2003-06-08', class: 'Y-K59', major: 'Y khoa', dept: 'Khoa Y dược', cohort: '2021', gpa: 3.58, credits: 120, status: 'studying' as Status },
  { id: 'sv010', msv: 'SV-2024-0001', name: 'Trịnh Văn Hùng', dob: '2006-02-28', class: 'CNTT-K62A', major: 'Công nghệ thông tin', dept: 'Khoa CNTT', cohort: '2024', gpa: 0, credits: 0, status: 'studying' as Status },
];

const GPA_COLOR = (gpa: number) =>
  gpa >= 3.6 ? 'success' : gpa >= 3.0 ? 'info' : gpa >= 2.0 ? 'warning' : 'error';

export default function StudentList() {
  const { t } = useTranslation('sis');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('Tất cả');
  const [status, setStatus] = useState<Status | 'all'>('all');

  const filtered = MOCK_STUDENTS.filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.msv.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === 'Tất cả' || s.dept === dept;
    const matchStatus = status === 'all' || s.status === status;
    return matchSearch && matchDept && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('student.title')}
        description={t('student.description', { count: filtered.length })}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('student.breadcrumb.list') },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />}>{t('student.import')}</Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('student.export')}</Button>
            <Button leftIcon={<UserPlus className="h-4 w-4" />}>{t('student.add')}</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder={t('student.filter.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-64"
        />
        <select
          value={dept}
          onChange={(e) => { setDept(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          {[t('student.filter.allDepts'), 'Khoa CNTT', 'Khoa Kinh tế', 'Khoa Luật', 'Khoa Ngoại ngữ', 'Khoa Sư phạm', 'Khoa Y dược'].map((d) => <option key={d}>{d}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as Status | 'all'); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          <option value="all">{t('student.filter.allStatuses')}</option>
          <option value="studying">{t('student.status.studying')}</option>
          <option value="reserved">{t('student.status.reserved')}</option>
          <option value="suspended">{t('student.status.suspended')}</option>
          <option value="graduated">{t('student.status.graduated')}</option>
          <option value="quit">{t('student.status.quit')}</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('student.table.stt')}</TableHeadCell>
            <TableHeadCell>{t('student.table.sinhVien')}</TableHeadCell>
            <TableHeadCell>{t('student.table.maSV')}</TableHeadCell>
            <TableHeadCell>{t('student.table.lop')}</TableHeadCell>
            <TableHeadCell>{t('student.table.nganhKhoa')}</TableHeadCell>
            <TableHeadCell>{t('student.table.gpa')}</TableHeadCell>
            <TableHeadCell>{t('student.table.tinChi')}</TableHeadCell>
            <TableHeadCell>{t('student.table.thaoTac')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={8} message={t('student.empty.title')} />
          ) : (
            <>
            {paged.map((s, i) => (
              <TableRow key={s.id}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                  {(pagination.page - 1) * pagination.pageSize + i + 1}
                </TableCell>
                <TableCell>
                  <Link to={`/sis/sinh-vien/${s.id}`} className="flex items-center gap-2.5 hover:text-[rgb(var(--primary))]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                      {s.name.split(' ').slice(-2).map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{s.dob}</p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{s.msv}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{s.class}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm text-[rgb(var(--text-primary))]">{s.major}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{s.dept}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={GPA_COLOR(s.gpa) as 'success' | 'warning' | 'error' | 'info'} className="font-mono">
                    {s.gpa > 0 ? s.gpa.toFixed(2) : '—'}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">{s.credits}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link to={`/sis/sinh-vien/${s.id}`}><Button variant="ghost" size="sm">{t('student.action.chiTiet')}</Button></Link>
                    <Link to={`/sis/sinh-vien/${s.id}/sua`}><Button variant="ghost" size="sm">{t('student.action.sua')}</Button></Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            </>
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}

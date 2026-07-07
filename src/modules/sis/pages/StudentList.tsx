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
} from '@/components/ui';
import { LoadingState, EmptyState } from '@/components/data-display';
import { PageHeader } from '@/components/layout';
import { useStudentList } from '@/hooks/useSis';
import { useDepartmentList } from '@/hooks/useHrm';

type Status = 'studying' | 'reserved' | 'suspended' | 'graduated' | 'quit';

const GPA_COLOR = (gpa: number) =>
  gpa >= 3.6 ? 'success' : gpa >= 3.0 ? 'info' : gpa >= 2.0 ? 'warning' : 'error';

export default function StudentList() {
  const { t } = useTranslation('sis');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const { data: deptData } = useDepartmentList({ pageSize: 100 });
  const departments = deptData?.data ?? [];
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useStudentList({
    search,
    status: status === 'all' ? undefined : status,
    department: department || undefined,
    page,
    pageSize,
  });

  const list = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  if (isLoading && list.length === 0) {
    return <LoadingState message="Đang tải danh sách sinh viên..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('student.title')}
        description={t('student.description', { count: total })}
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
          value={department}
          onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          <option value="">{t('student.filter.allDepts')}</option>
          {departments.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as Status | 'all'); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          <option value="all">{t('student.filter.allStatuses')}</option>
          <option value="studying">{t('student.status.studying')}</option>
          <option value="graduated">{t('student.status.graduated')}</option>
          <option value="suspended">{t('student.status.suspended')}</option>
          <option value="transferred">{t('student.status.transferred')}</option>
          <option value="dropped">{t('student.status.dropped')}</option>
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
          {list.length === 0 ? (
            <tr>
              <td colSpan={8}>
                <EmptyState
                  title={t('student.empty.title')}
                  description="Bắt đầu bằng việc thêm sinh viên đầu tiên."
                  icon={<UserPlus className="h-12 w-12 text-[rgb(var(--text-muted))]" />}
                  action={<Button leftIcon={<UserPlus className="h-4 w-4" />}>{t('student.add')}</Button>}
                />
              </td>
            </tr>
          ) : (
            list.map((s: any, i: number) => (
              <TableRow key={s._id}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                  {(page - 1) * pageSize + i + 1}
                </TableCell>
                <TableCell>
                  <Link to={`/sis/sinh-vien/${s._id}`} className="flex items-center gap-2.5 hover:text-[rgb(var(--primary))]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                      {s.name?.split(' ').slice(-2).map((n: string) => n[0]).join('') ?? '?'}
                    </div>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{s.dob ? new Date(s.dob).toLocaleDateString('vi-VN') : ''}</p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{s.studentId}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">{s.className || '—'}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm text-[rgb(var(--text-primary))]">{s.major || '—'}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{s.department?.name || '—'}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={GPA_COLOR(s.gpa ?? 0) as 'success' | 'warning' | 'error' | 'info'} className="font-mono">
                    {s.gpa != null ? s.gpa.toFixed(2) : '—'}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">{s.creditsEarned}/{s.creditsRequired}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link to={`/sis/sinh-vien/${s._id}`}><Button variant="ghost" size="sm">{t('student.action.chiTiet')}</Button></Link>
                    <Link to={`/sis/sinh-vien/${s._id}/sua`}><Button variant="ghost" size="sm">{t('student.action.sua')}</Button></Link>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}

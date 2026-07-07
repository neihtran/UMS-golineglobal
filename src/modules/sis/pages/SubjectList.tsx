import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Edit2, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Button, Input, Badge,
  Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell,
  TablePagination, TableEmpty,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useSubjectList } from '@/hooks/useSis';
import { useDepartmentList } from '@/hooks/useHrm';

type SubjectType = 'theory' | 'practice' | 'project' | 'internship';

const TYPE_CONFIG: Record<SubjectType, { variant: 'info' | 'accent' | 'warning' | 'primary'; labelKey: string }> = {
  theory: { variant: 'info', labelKey: 'subject.type.lyThuyet' },
  practice: { variant: 'accent', labelKey: 'subject.type.thucHanh' },
  project: { variant: 'warning', labelKey: 'subject.type.doAn' },
  internship: { variant: 'primary', labelKey: 'subject.type.thucTap' },
};

export default function SubjectList() {
  const { t } = useTranslation('sis');
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');

  const { data: deptData } = useDepartmentList({ pageSize: 100 });
  const departments = deptData?.data ?? [];

  const deptApi = dept || undefined;

  const { data, isLoading } = useSubjectList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: search || undefined,
    department: deptApi,
    sortBy: 'code',
    sortDir: 'asc',
  });

  const records = (data?.data ?? []) as any[];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('subject.title')}
        description={t('subject.description')}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('curriculum.breadcrumb.list'), href: '/sis/chuong-trinh-dao-tao' },
          { label: t('subject.breadcrumb.list') },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('subject.export')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => window.location.href = '/sis/chuong-trinh-dao-tao/mon-hoc/tao'}>{t('subject.add')}</Button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder={t('subject.filter.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-64"
        />
        <select
          value={dept}
          onChange={(e) => { setDept(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          <option value="">{t('subject.filter.allDepts')}</option>
          {departments.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('subject.table.maMon')}</TableHeadCell>
            <TableHeadCell>{t('subject.table.tenMon')}</TableHeadCell>
            <TableHeadCell>{t('subject.table.tinChi')}</TableHeadCell>
            <TableHeadCell>{t('subject.table.hocKy')}</TableHeadCell>
            <TableHeadCell>{t('subject.table.loai')}</TableHeadCell>
            <TableHeadCell>{t('subject.table.khoaPhuTrach')}</TableHeadCell>
            <TableHeadCell>{t('subject.table.trangThai')}</TableHeadCell>
            <TableHeadCell>{t('subject.table.thaoTac')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmpty colSpan={8} message="Đang tải..." />
          ) : records.length === 0 ? (
            <TableEmpty colSpan={8} message={t('subject.empty.title')} />
          ) : (
            records.map((s: any) => {
              const tc = TYPE_CONFIG[s.type as SubjectType];
              return (
                <TableRow key={s._id ?? s.code}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{s.code}</TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))]">{s.name}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.credits}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{(s.semesterOffered || []).join(', ') || '—'}</TableCell>
                  <TableCell><Badge variant={(TYPE_CONFIG[s.type as SubjectType]?.variant ?? 'neutral') as any} size="sm">{t(tc?.labelKey ?? '')}</Badge></TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.departmentName || s.department || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={s.isActive !== false ? 'success' : 'neutral'} dot size="sm">
                      {s.isActive !== false ? t('subject.status.active') : t('subject.status.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => navigate(`/sis/chuong-trinh-dao-tao/mon-hoc/${s._id ?? s.code}`)}>{t('subject.action.xem')}</Button>
                      <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => navigate(`/sis/chuong-trinh-dao-tao/mon-hoc/${s._id ?? s.code}/sua`)}>{t('subject.action.sua')}</Button>
                    </div>
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
        total={data?.pagination?.total ?? 0}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}

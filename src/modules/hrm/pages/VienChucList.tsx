import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserPlus,
  Download,
  Upload,
} from 'lucide-react';
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
  TableSkeleton,
  Modal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useVienChucList, useDepartmentList } from '@/hooks';

type VCStatus = 'active' | 'trial' | 'leave' | 'inactive';
type ContractType = 'Cơ hữu' | 'Thỉnh giảng' | 'Thử việc';

const CONTRACT_BADGE: Record<string, 'primary' | 'accent' | 'warning'> = {
  'Cơ hữu': 'primary',
  'Thỉnh giảng': 'accent',
  'Thử việc': 'warning',
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(v);
}

function getInitials(name: string) {
  return name.split(' ').slice(-2).map((n) => n[0]).join('').toUpperCase();
}

export default function VienChucList() {
  const { t } = useTranslation('vienChuc');
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [status, setStatus] = useState<VCStatus | 'all'>('all');
  const [contract, setContract] = useState<ContractType | 'all'>('all');
  const [importOpen, setImportOpen] = useState(false);

  const { data, isLoading } = useVienChucList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: search || undefined,
    status: status === 'all' ? undefined : status,
    department: dept || undefined,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const { data: deptData } = useDepartmentList({ pageSize: 100 });
  const departments = deptData?.data ?? [];

  const records = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description', { count: total })}
        breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: t('breadcrumb.list') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />} onClick={() => setImportOpen(true)}>{t('importExcel')}</Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('exportExcel')}</Button>
            <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => navigate('/hrm/vien-chuc/tao')}>{t('add')}</Button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder={t('filter.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-64"
        />
        <select
          value={dept}
          onChange={(e) => { setDept(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          <option value="">{t('filter.departmentAll')}</option>
          {departments.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as VCStatus | 'all'); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          <option value="all">{t('filter.statusAll')}</option>
          <option value="active">{t('status.active')}</option>
          <option value="trial">{t('status.trial')}</option>
          <option value="leave">{t('status.leave')}</option>
          <option value="inactive">{t('status.inactive')}</option>
        </select>
        <select
          value={contract}
          onChange={(e) => { setContract(e.target.value as ContractType | 'all'); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          <option value="all">{t('filter.contractAll')}</option>
          <option value="Cơ hữu">{t('contract.permanent')}</option>
          <option value="Thỉnh giảng">{t('contract.visiting')}</option>
          <option value="Thử việc">{t('contract.probation')}</option>
        </select>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>{t('table.hoTen')}</TableHeadCell>
            <TableHeadCell>{t('table.maVC')}</TableHeadCell>
            <TableHeadCell>{t('table.chucDanh')}</TableHeadCell>
            <TableHeadCell>{t('table.khoaDonVi')}</TableHeadCell>
            <TableHeadCell>{t('table.loaiHD')}</TableHeadCell>
            <TableHeadCell className="text-right">{t('table.luongCoBan')}</TableHeadCell>
            <TableHeadCell>{t('table.trangThai')}</TableHeadCell>
            <TableHeadCell>{t('table.thaoTac')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={9} rows={5} />
          ) : records.length === 0 ? (
            <TableEmpty colSpan={9} message={t('empty.title')} description={t('empty.description')} />
          ) : (
            records.map((vc: any, i: number) => {
              const statusConfig = {
                active: { variant: 'success' as const, label: t('status.active') },
                trial: { variant: 'warning' as const, label: t('status.trial') },
                leave: { variant: 'error' as const, label: t('status.leave') },
                inactive: { variant: 'neutral' as const, label: t('status.inactive') },
              }[vc.status as VCStatus] ?? { variant: 'neutral' as const, label: vc.status };

              const contractLabel = vc.contractType || '—';

              return (
                <TableRow key={vc._id ?? vc.id}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(pagination.page - 1) * pagination.pageSize + i + 1}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/hrm/vien-chuc/${vc._id ?? vc.id}`}
                      className="flex items-center gap-2.5 hover:text-[rgb(var(--primary))] transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                        {getInitials(vc.name)}
                      </div>
                      <div>
                        <p className="font-medium">{vc.name}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{vc.title}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{vc.code}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{vc.position || '—'}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">
                    {vc.department?.name ?? vc.dept ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={CONTRACT_BADGE[contractLabel] ?? 'neutral'}>{contractLabel}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {vc.salary ? formatCurrency(vc.salary) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant} dot>{statusConfig.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link to={`/hrm/vien-chuc/${vc._id ?? vc.id}`}>
                        <Button variant="ghost" size="sm">{t('action.detail')}</Button>
                      </Link>
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
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />

      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title={t('import.title')}
        description={t('import.description')}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setImportOpen(false)}>{t('common.cancel')}</Button>
            <Button leftIcon={<Upload className="h-4 w-4" />}>{t('import.uploadImport')}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center border-2 border-dashed border-[rgb(var(--border))] rounded-xl py-10 px-6 cursor-pointer hover:border-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)/0.02)] transition-all">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.08)]">
                <Upload className="h-6 w-6 text-[rgb(var(--primary))]" />
              </div>
              <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{t('import.dropzone')}</p>
              <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">{t('import.dropzoneOr')}</p>
              <p className="mt-2 text-[10px] text-[rgb(var(--text-muted))]">{t('import.dropzoneHint')}</p>
            </div>
          </div>
          <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-3">
            <p className="text-xs font-semibold text-[rgb(var(--text-secondary))] mb-2">{t('import.fileStructure')}</p>
            <div className="grid grid-cols-2 gap-1">
              {(t('import.fileStructureCols', { returnObjects: true }) as unknown as string[]).map((col: string) => (
                <div key={col} className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-muted))]">
                  <div className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--primary))]" />
                  {col}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[rgb(var(--success)/0.2)] bg-[rgb(var(--success)/0.04)] px-3 py-2">
            <div className="text-xs text-[rgb(var(--success))]">
              <strong>{t('import.template')}</strong>
            </div>
            <Button variant="ghost" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />} className="ml-auto shrink-0 text-[rgb(var(--success))]">
              {t('import.downloadTemplate')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

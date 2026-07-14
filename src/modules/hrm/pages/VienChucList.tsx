import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Modal,
  DetailModal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useDetailModal } from '@/hooks/useDetailModal';
import { useVienChucList, useVienChucStats } from '@/hooks/useHrm';
import VienChucDetail from './VienChucDetail';
import VienChucForm from './VienChucForm';

// ─── Types ────────────────────────────────────────────────────────────────────

type ContractType = 'Cơ hữu' | 'Thỉnh giảng' | 'Thử việc';
type VCStatus = 'active' | 'trial' | 'leave' | 'inactive';

interface VienChucItem {
  _id: string;
  code: string;
  name: string;
  dob?: string;
  title?: string;
  position?: string;
  contractType?: ContractType;
  salary?: number;
  status?: VCStatus;
  department?: {
    _id: string;
    name: string;
    code?: string;
  };
}

const CONTRACT_BADGE: Record<ContractType, 'primary' | 'accent' | 'warning'> = {
  'Cơ hữu': 'primary',
  'Thỉnh giảng': 'accent',
  'Thử việc': 'warning',
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(v);
}

export default function VienChucList() {
  const { t } = useTranslation('vienChuc');
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [status, setStatus] = useState<VCStatus | ''>('');
  const [contract, setContract] = useState<ContractType | 'all'>('all');
  const [importOpen, setImportOpen] = useState(false);

  const { selectedId, openDetail, openEdit, close, isEditMode } = useDetailModal({ size: 'fullscreen' });

  // Fetch VienChuc data from API
  const { data: listData, isLoading, isError } = useVienChucList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search,
    status: status,
    department: dept,
  });

  // Fetch stats for the header
  const { data: statsData } = useVienChucStats();

  const staffList: VienChucItem[] = listData?.data || [];
  const paginationInfo = listData?.pagination || { total: 0, page: 1, pageSize: 10, totalPages: 0 };
  const totalCount = statsData?.data?.total || paginationInfo.total || staffList.length;

  const selectedStaff = selectedId ? staffList.find((s) => s._id === selectedId) : null;

  const handleDetail = (id: string) => {
    // Navigate to detail page instead of modal for API data
    navigate(`/hrm/vien-chuc/${id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description', { count: totalCount })}
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
          {statsData?.data?.byDepartment?.map((d: any) => (
            <option key={d._id} value={d.name}>{d.name}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as VCStatus | ''); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          <option value="">{t('filter.statusAll')}</option>
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
            <TableHeadCell>{t('table.stt')}</TableHeadCell>
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
            <TableEmpty colSpan={9} message={t('common:common.loading')} />
          ) : isError ? (
            <TableEmpty colSpan={9} message="Đã xảy ra lỗi khi tải dữ liệu" />
          ) : staffList.length === 0 ? (
            <TableEmpty colSpan={9} message={t('empty.title')} description={t('empty.description')} />
          ) : (
            staffList.map((s, i) => {
              const sc = {
                active: { variant: 'success' as const, label: t('status.active') },
                trial: { variant: 'warning' as const, label: t('status.trial') },
                leave: { variant: 'error' as const, label: t('status.leave') },
                inactive: { variant: 'neutral' as const, label: t('status.inactive') },
              }[s.status as VCStatus] || { variant: 'neutral' as const, label: s.status || '' };
              const contractLabel = {
                'Cơ hữu': t('contract.permanent'),
                'Thỉnh giảng': t('contract.visiting'),
                'Thử việc': t('contract.probation'),
              }[s.contractType as ContractType] || s.contractType || '';
              return (
                <TableRow key={s._id}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(pagination.page - 1) * pagination.pageSize + i + 1}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleDetail(s._id)}
                      className="flex items-center gap-2.5 hover:text-[rgb(var(--primary))] transition-colors text-left w-full"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                        {s.name?.split(' ').slice(-2).map((n) => n[0]).join('') || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{s.title}</p>
                      </div>
                    </button>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{s.code}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.position}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.department?.name || '-'}</TableCell>
                  <TableCell><Badge variant={CONTRACT_BADGE[s.contractType as ContractType] || 'primary'}>{contractLabel}</Badge></TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatCurrency(s.salary || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={sc.variant} dot>{sc.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleDetail(s._id)}>{t('action.detail')}</Button>
                      <Button variant="ghost" size="sm" onClick={() => openDetail(s._id)}>{t('action.edit')}</Button>
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
        total={paginationInfo.total}
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

      {/* Detail / Edit Modal */}
      <DetailModal
        open={!!selectedId && !isEditMode}
        onClose={close}
        title={selectedStaff?.name || ''}
        description={selectedStaff ? `${selectedStaff.code} · ${selectedStaff.title} · ${selectedStaff.department?.name || ''}` : ''}
        size="fullscreen"
        onEdit={() => openEdit(selectedId!)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={close}>Đóng</Button>
          </div>
        }
      >
        {selectedStaff && (
          <VienChucDetail id={selectedStaff._id} />
        )}
      </DetailModal>

      {/* Edit Modal */}
      <DetailModal
        open={isEditMode}
        onClose={close}
        title={t('action.edit')}
        description={selectedStaff ? `${selectedStaff.code} · ${selectedStaff.name}` : ''}
        size="fullscreen"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={close}>Đóng</Button>
          </div>
        }
      >
        {isEditMode && selectedStaff && (
          <VienChucForm
            initialValues={{
              code: selectedStaff.code || '',
              name: selectedStaff.name || '',
              dob: selectedStaff.dob || '',
              dept: selectedStaff.department?.name || '',
              title: selectedStaff.title || '',
              position: selectedStaff.position || '',
              contractType: selectedStaff.contractType || 'Cơ hữu',
              salary: selectedStaff.salary?.toString() || '0',
            }}
            onSubmit={(values) => { console.log('Saving:', values); close(); }}
            onCancel={close}
            submitLabel="Lưu thay đổi"
          />
        )}
      </DetailModal>
    </div>
  );
}

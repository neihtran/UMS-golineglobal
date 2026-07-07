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
import VienChucDetail from './VienChucDetail';
import VienChucForm from './VienChucForm';

// ─── Types ────────────────────────────────────────────────────────────────────

type ContractType = 'Cơ hữu' | 'Thỉnh giảng' | 'Thử việc';
type Status = 'active' | 'trial' | 'leave' | 'inactive';

const MOCK_STAFF = [
  { id: 'vc001', code: 'VC-2020-001', name: 'Nguyễn Hoàng Long', dob: '1985-03-15', title: 'PGS.TS', position: 'Trưởng khoa', dept: 'Khoa CNTT', contract: 'Cơ hữu' as ContractType, salary: 18500000, status: 'active' as Status, joinDate: '2015-09-01' },
  { id: 'vc002', code: 'VC-2018-042', name: 'Trần Thị Mai Lan', dob: '1990-07-22', title: 'TS', position: 'Phó trưởng khoa', dept: 'Khoa Kinh tế', contract: 'Cơ hữu' as ContractType, salary: 15200000, status: 'active' as Status, joinDate: '2013-09-01' },
  { id: 'vc003', code: 'VC-2022-108', name: 'Lê Văn Minh', dob: '1995-11-08', title: 'ThS', position: 'Giảng viên', dept: 'Khoa Luật', contract: 'Thử việc' as ContractType, salary: 9800000, status: 'trial' as Status, joinDate: '2026-01-15' },
  { id: 'vc004', code: 'VC-2019-067', name: 'Phạm Thu Hà', dob: '1988-04-30', title: 'ThS', position: 'Chuyên viên', dept: 'Phòng Tổ chức', contract: 'Cơ hữu' as ContractType, salary: 11200000, status: 'active' as Status, joinDate: '2017-03-20' },
  { id: 'vc005', code: 'VC-2021-089', name: 'Bùi Đình Nam', dob: '1992-09-12', title: 'TS', position: 'Giảng viên', dept: 'Khoa Ngoại ngữ', contract: 'Thỉnh giảng' as ContractType, salary: 8500000, status: 'active' as Status, joinDate: '2021-09-01' },
  { id: 'vc006', code: 'VC-2017-031', name: 'Đặng Thị Oanh', dob: '1982-12-05', title: 'PGS', position: 'Trưởng bộ môn', dept: 'Khoa Sư phạm', contract: 'Cơ hữu' as ContractType, salary: 17200000, status: 'leave' as Status, joinDate: '2010-09-01' },
  { id: 'vc007', code: 'VC-2023-115', name: 'Vũ Minh Tuấn', dob: '1997-06-18', title: 'CN', position: 'Kỹ thuật viên', dept: 'Phòng CNTT', contract: 'Thử việc' as ContractType, salary: 7200000, status: 'trial' as Status, joinDate: '2026-03-01' },
  { id: 'vc008', code: 'VC-2016-022', name: 'Hoàng Thị Lan', dob: '1978-01-25', title: 'PGS.TS', position: 'Phó Hiệu trưởng', dept: 'Ban Giám hiệu', contract: 'Cơ hữu' as ContractType, salary: 22000000, status: 'active' as Status, joinDate: '2008-09-01' },
  { id: 'vc009', code: 'VC-2020-074', name: 'Ngô Thanh Sơn', dob: '1991-08-14', title: 'ThS', position: 'Giảng viên', dept: 'Khoa Y dược', contract: 'Cơ hữu' as ContractType, salary: 13200000, status: 'active' as Status, joinDate: '2019-09-01' },
  { id: 'vc010', code: 'VC-2024-120', name: 'Trịnh Thu Phương', dob: '1998-03-09', title: 'ThS', position: 'Chuyên viên', dept: 'Phòng Tài chính', contract: 'Cơ hữu' as ContractType, salary: 10500000, status: 'active' as Status, joinDate: '2024-06-01' },
  { id: 'vc011', code: 'VC-2015-011', name: 'Lý Văn Hùng', dob: '1975-10-20', title: 'GS.TS', position: 'Hiệu trưởng', dept: 'Ban Giám hiệu', contract: 'Cơ hữu' as ContractType, salary: 28000000, status: 'active' as Status, joinDate: '2005-09-01' },
  { id: 'vc012', code: 'VC-2022-099', name: 'Đào Thị Lan', dob: '1994-05-17', title: 'ThS', position: 'Thư ký', dept: 'Phòng Tổ chức', contract: 'Thỉnh giảng' as ContractType, salary: 7800000, status: 'active' as Status, joinDate: '2022-09-01' },
];

const CONTRACT_BADGE: Record<ContractType, 'primary' | 'accent' | 'warning'> = {
  'Cơ hữu': 'primary',
  'Thỉnh giảng': 'accent',
  'Thử việc': 'warning',
};

const DEPARTMENTS = ['Khoa CNTT', 'Khoa Kinh tế', 'Khoa Luật', 'Khoa Ngoại ngữ', 'Khoa Sư phạm', 'Khoa Y dược', 'Khoa Khoa học', 'Phòng Tổ chức', 'Phòng Tài chính', 'Phòng CNTT', 'Ban Giám hiệu'];

function formatCurrency(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(v);
}

export default function VienChucList() {
  const { t } = useTranslation('vienChuc');
  const navigate = useNavigate();
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [contract, setContract] = useState<ContractType | 'all'>('all');
  const [importOpen, setImportOpen] = useState(false);

  const { selectedId, openDetail, openEdit, close, isEditMode } = useDetailModal({ size: 'fullscreen' });

  const selectedStaff = selectedId ? MOCK_STAFF.find((s) => s.id === selectedId) : null;

  const filtered = MOCK_STAFF.filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()) || s.dept.toLowerCase().includes(search.toLowerCase());
    const matchDept = !dept || s.dept === dept;
    const matchStatus = status === 'all' || s.status === status;
    const matchContract = contract === 'all' || s.contract === contract;
    return matchSearch && matchDept && matchStatus && matchContract;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description', { count: filtered.length })}
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
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as Status | 'all'); setPage(1); }}
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
          {paged.length === 0 ? (
            <TableEmpty colSpan={9} message={t('empty.title')} description={t('empty.description')} />
          ) : (
            paged.map((s, i) => {
              const sc = {
                active: { variant: 'success' as const, label: t('status.active') },
                trial: { variant: 'warning' as const, label: t('status.trial') },
                leave: { variant: 'error' as const, label: t('status.leave') },
                inactive: { variant: 'neutral' as const, label: t('status.inactive') },
              }[s.status];
              const contractLabel = {
                'Cơ hữu': t('contract.permanent'),
                'Thỉnh giảng': t('contract.visiting'),
                'Thử việc': t('contract.probation'),
              }[s.contract];
              return (
                <TableRow key={s.id}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(pagination.page - 1) * pagination.pageSize + i + 1}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => openDetail(s.id)}
                      className="flex items-center gap-2.5 hover:text-[rgb(var(--primary))] transition-colors text-left w-full"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-semibold text-[rgb(var(--primary))]">
                        {s.name.split(' ').slice(-2).map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{s.title}</p>
                      </div>
                    </button>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{s.code}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.position}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{s.dept}</TableCell>
                  <TableCell><Badge variant={CONTRACT_BADGE[s.contract]}>{contractLabel}</Badge></TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatCurrency(s.salary)}</TableCell>
                  <TableCell>
                    <Badge variant={sc.variant} dot>{sc.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(s.id)}>{t('action.detail')}</Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(s.id)}>{t('action.edit')}</Button>
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
        total={filtered.length}
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
        open={!!selectedId}
        onClose={close}
        title={selectedStaff ? selectedStaff.name : ''}
        description={selectedStaff ? `${selectedStaff.code} · ${selectedStaff.title} · ${selectedStaff.dept}` : ''}
        size="fullscreen"
        onEdit={() => openEdit(selectedId!)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={close}>Đóng</Button>
          </div>
        }
      >
        {isEditMode ? (
          <VienChucForm
            initialValues={selectedStaff ? {
              code: selectedStaff.code,
              name: selectedStaff.name,
              dob: selectedStaff.dob,
              dept: selectedStaff.dept,
              title: selectedStaff.title,
              position: selectedStaff.position,
              contractType: selectedStaff.contract,
              salary: selectedStaff.salary.toString(),
            } : {}}
            onSubmit={(values) => { console.log('Saving:', values); close(); }}
            onCancel={close}
            submitLabel="Lưu thay đổi"
          />
        ) : (
          selectedStaff ? (
            <VienChucDetail id={selectedStaff.id} />
          ) : null
        )}
      </DetailModal>
    </div>
  );
}

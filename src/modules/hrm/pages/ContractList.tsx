import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Eye, Edit3, FileText, Clock } from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty, Modal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const CONTRACTS = [
  { id: 'c01', code: 'HD-2020-001', staff: 'Nguyễn Hoàng Long', dept: 'Khoa CNTT', position: 'Trưởng khoa', type: 'Cơ hữu', salary: 18500000, startDate: '2020-03-15', endDate: '', status: 'active', file: 'HD_NguyenHoangLong_2020.pdf' },
  { id: 'c02', code: 'HD-2020-042', staff: 'Trần Thị Mai Lan', dept: 'Khoa Kinh tế', position: 'Phó trưởng khoa', type: 'Cơ hữu', salary: 15200000, startDate: '2020-08-01', endDate: '', status: 'active', file: 'HD_TranThiMaiLan_2020.pdf' },
  { id: 'c03', code: 'HD-2022-108', staff: 'Lê Văn Minh', dept: 'Khoa Luật', position: 'Giảng viên', type: 'Thỉnh giảng', salary: 9800000, startDate: '2022-09-01', endDate: '2026-08-31', status: 'active', file: 'HD_LeVanMinh_2022.pdf' },
  { id: 'c04', code: 'HD-2022-201', staff: 'Phạm Thu Hà', dept: 'Phòng Tổ chức', position: 'Chuyên viên', type: 'Cơ hữu', salary: 11200000, startDate: '2022-01-10', endDate: '', status: 'active', file: 'HD_PhamThuHa_2022.pdf' },
  { id: 'c05', code: 'HD-2019-015', staff: 'Hoàng Thị Lan', dept: 'Ban Giám hiệu', position: 'Phó Hiệu trưởng', type: 'Cơ hữu', salary: 22000000, startDate: '2019-04-01', endDate: '', status: 'expiring', file: 'HD_HoangThiLan_2019.pdf' },
  { id: 'c06', code: 'HD-2023-055', staff: 'Đỗ Minh Tuấn', dept: 'Khoa Ngoại ngữ', position: 'Giảng viên', type: 'Thử việc', salary: 7500000, startDate: '2025-06-01', endDate: '2025-12-01', status: 'expiring', file: 'HD_DoMinhTuan_2023.pdf' },
  { id: 'c07', code: 'HD-2018-011', staff: 'Lý Văn Hùng', dept: 'Ban Giám hiệu', position: 'Hiệu trưởng', type: 'Cơ hữu', salary: 28000000, startDate: '2018-01-15', endDate: '', status: 'active', file: 'HD_LyVanHung_2018.pdf' },
  { id: 'c08', code: 'HD-2024-033', staff: 'Vũ Thị Hương', dept: 'Khoa Sư phạm', position: 'Trợ giảng', type: 'Thỉnh giảng', salary: 6000000, startDate: '2024-09-01', endDate: '2025-08-31', status: 'expired', file: 'HD_VuThiHuong_2024.pdf' },
];

const TYPE_CONFIG: Record<string, { color: string }> = {
  'Cơ hữu': { color: 'rgb(var(--primary))' },
  'Thỉnh giảng': { color: 'rgb(var(--accent))' },
  'Thử việc': { color: 'rgb(var(--warning))' },
};

function fmt(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(v);
}

type SelectField = React.ChangeEvent<HTMLSelectElement>;
type InputField = React.ChangeEvent<HTMLInputElement>;
type TextareaField = React.ChangeEvent<HTMLTextAreaElement>;

export default function ContractList() {
  const { t } = useTranslation('hrm');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');

  const [createOpen, setCreateOpen] = useState(false);
  const [expiringOpen, setExpiringOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<typeof CONTRACTS[0] | null>(null);

  const [createForm, setCreateForm] = useState({
    staff: '', dept: '', position: '', type: 'Cơ hữu',
    salary: '', startDate: '', endDate: '', file: '', note: '',
  });

  const [editForm, setEditForm] = useState({
    staff: '', dept: '', position: '', type: 'Cơ hữu',
    salary: '', startDate: '', endDate: '', note: '',
  });

  const filtered = CONTRACTS.filter((c) => {
    const match = !search || c.staff.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'all' || c.status === status;
    const matchType = type === 'all' || c.type === type;
    return match && matchStatus && matchType;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);
  const expiringList = CONTRACTS.filter(c => c.status === 'expiring');

  const openDetail = (c: typeof CONTRACTS[0]) => { setSelectedContract(c); setDetailOpen(true); };
  const openEdit = (c: typeof CONTRACTS[0]) => {
    setSelectedContract(c);
    setEditForm({
      staff: c.staff, dept: c.dept, position: c.position, type: c.type,
      salary: c.salary.toString(), startDate: c.startDate, endDate: c.endDate, note: '',
    });
    setEditOpen(true);
  };

  const statusVariant = (s: string) => s === 'active' ? 'success' : s === 'expiring' ? 'warning' : 'error';
  const statusLabel = (s: string) =>
    s === 'active' ? t('contract.statusActive') :
    s === 'expiring' ? t('contract.statusExpiring') :
    t('contract.statusExpired');

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('title')}
        description={t('description')}
        breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: t('breadcrumb.contract') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('exportExcel')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>{t('createContract')}</Button>
          </>
        }
      />

      {/* Alert sắp hết hạn */}
      {expiringList.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-[rgb(var(--warning)/0.3)] bg-[rgb(var(--warning)/0.05)] px-4 py-3">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-[rgb(var(--warning))]" />
            <span className="text-sm text-[rgb(var(--text-primary))]">
              {t('alert.expiringContracts', { count: expiringList.length })}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="text-[rgb(var(--warning))]" onClick={() => setExpiringOpen(true)}>{t('alert.viewList')}</Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder={t('filter.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-72"
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          <option value="all">{t('filter.statusAll')}</option>
          <option value="active">{t('contract.statusActive')}</option>
          <option value="expiring">{t('contract.statusExpiring')}</option>
          <option value="expired">{t('contract.statusExpired')}</option>
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          <option value="all">{t('filter.typeAll')}</option>
          <option value="Cơ hữu">{t('contract.permanent')}</option>
          <option value="Thỉnh giảng">{t('contract.visiting')}</option>
          <option value="Thử việc">{t('contract.probation')}</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('table.maHD')}</TableHeadCell>
            <TableHeadCell>{t('table.hoTen')}</TableHeadCell>
            <TableHeadCell>{t('table.donVi')}</TableHeadCell>
            <TableHeadCell>{t('table.loaiHD')}</TableHeadCell>
            <TableHeadCell className="text-right">{t('table.luongCoBan')}</TableHeadCell>
            <TableHeadCell>{t('table.ngayKy')}</TableHeadCell>
            <TableHeadCell>{t('table.ngayHetHan')}</TableHeadCell>
            <TableHeadCell>{t('table.trangThai')}</TableHeadCell>
            <TableHeadCell>{t('table.thaoTac')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={9} message={t('empty.noContracts')} />
          ) : (
            paged.map((c) => {
              const tc = TYPE_CONFIG[c.type];
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{c.code}</TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))]">{c.staff}</TableCell>
                  <TableCell>
                    <p className="text-[rgb(var(--text-secondary))]">{c.dept}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{c.position}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm" style={{ color: tc.color, borderColor: tc.color }}>
                      {c.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{fmt(c.salary)}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{c.startDate}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">
                    {c.endDate || <span className="text-[rgb(var(--text-muted))] italic">{t('contract.indefinite')}</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(c.status) as 'success'|'warning'|'error'} dot size="sm">{statusLabel(c.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => openDetail(c)}>{t('action.detail')}</Button>
                      <Button variant="ghost" size="sm" leftIcon={<Edit3 className="h-3.5 w-3.5" />} onClick={() => openEdit(c)}>{t('action.edit')}</Button>
                      <Button variant="ghost" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />} />
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

      {/* MODAL 1: Create contract */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('modal.createTitle')}
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t('cancel')}</Button>
            <Button variant="primary" onClick={() => setCreateOpen(false)}>{t('modal.saveContract')}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.staffName')}</label>
              <Input value={createForm.staff} onChange={(e: InputField) => setCreateForm(f => ({ ...f, staff: e.target.value }))} placeholder={t('form.staffNamePlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.dept')}</label>
              <Input value={createForm.dept} onChange={(e: InputField) => setCreateForm(f => ({ ...f, dept: e.target.value }))} placeholder="VD: Khoa CNTT" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.position')}</label>
              <Input value={createForm.position} onChange={(e: InputField) => setCreateForm(f => ({ ...f, position: e.target.value }))} placeholder="VD: Giảng viên" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.contractType')}</label>
              <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]" value={createForm.type} onChange={(e: SelectField) => setCreateForm(f => ({ ...f, type: e.target.value }))}>
                <option>{t('contract.permanent')}</option><option>{t('contract.visiting')}</option><option>{t('contract.probation')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.salary')} (VNĐ)</label>
              <Input type="number" value={createForm.salary} onChange={(e: InputField) => setCreateForm(f => ({ ...f, salary: e.target.value }))} placeholder="VD: 12000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.signDate')}</label>
              <Input type="date" value={createForm.startDate} onChange={(e: InputField) => setCreateForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.endDate')}</label>
              <Input type="date" value={createForm.endDate} onChange={(e: InputField) => setCreateForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.attachFile')}</label>
              <div className="flex items-center gap-2">
                <Input value={createForm.file} onChange={(e: InputField) => setCreateForm(f => ({ ...f, file: e.target.value }))} placeholder={t('form.selectFile')} />
                <Button variant="outline" size="sm">{t('form.browse')}</Button>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.note')}</label>
              <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none" rows={2} placeholder={t('form.notePlaceholder')} value={createForm.note} onChange={(e: TextareaField) => setCreateForm(f => ({ ...f, note: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Expiring contracts */}
      <Modal
        open={expiringOpen}
        onClose={() => setExpiringOpen(false)}
        title={t('modal.expiringTitle')}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setExpiringOpen(false)}>{t('close')}</Button>
            <Button variant="primary" onClick={() => setExpiringOpen(false)}>{t('modal.renewAll')}</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[rgb(var(--text-secondary))]">{t('modal.expiringDesc', { count: expiringList.length })}</p>
          {expiringList.map((c) => {
            const tc = TYPE_CONFIG[c.type];
            return (
              <div key={c.id} className="flex items-center gap-4 rounded-lg border border-[rgb(var(--warning)/0.3)] bg-[rgb(var(--warning)/0.04)] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[rgb(var(--text-primary))]">{c.staff}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{c.dept} · {c.position}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="neutral" size="sm" style={{ color: tc.color, borderColor: tc.color }}>{c.type}</Badge>
                  <p className="text-xs text-[rgb(var(--warning))] mt-1">{t('form.expires')}: <strong>{c.endDate}</strong></p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setExpiringOpen(false); openEdit(c); }}>{t('modal.renew')}</Button>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* MODAL 3: Contract detail */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={t('modal.detailTitle')}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>{t('close')}</Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('modal.downloadFile')}</Button>
            <Button variant="primary" leftIcon={<Edit3 className="h-4 w-4" />} onClick={() => { setDetailOpen(false); if (selectedContract) openEdit(selectedContract); }}>{t('action.edit')}</Button>
          </div>
        }
      >
        {selectedContract && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-lg font-bold text-white">
                {selectedContract.staff.split(' ').slice(-2).map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedContract.staff}</p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{selectedContract.code} · {selectedContract.dept} · {selectedContract.position}</p>
              </div>
              <Badge variant={statusVariant(selectedContract.status) as 'success'|'warning'|'error'} dot className="ml-auto">{statusLabel(selectedContract.status)}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: t('form.contractType'), value: selectedContract.type },
                { label: t('form.salary'), value: fmt(selectedContract.salary) },
                { label: t('form.signDate'), value: selectedContract.startDate },
                { label: t('form.endDate'), value: selectedContract.endDate || t('contract.indefinite') },
                { label: t('form.attachFile'), value: selectedContract.file },
                { label: t('table.trangThai'), value: statusLabel(selectedContract.status) },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 border-b border-[rgb(var(--border)/0.4)] pb-2">
                  <span className="shrink-0 text-[rgb(var(--text-muted))] w-40">{label}:</span>
                  <span className="font-medium text-[rgb(var(--text-primary))]">{value}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] text-center text-[rgb(var(--text-muted))]">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{t('modal.contractFile')}: <strong className="font-mono">{selectedContract.file}</strong></p>
              <p className="text-xs mt-1">{t('modal.downloadHint')}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 4: Edit contract */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={t('modal.editTitle')}
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditOpen(false)}>{t('cancel')}</Button>
            <Button variant="primary" onClick={() => setEditOpen(false)}>{t('modal.saveChanges')}</Button>
          </div>
        }
      >
        {selectedContract && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-sm font-bold text-[rgb(var(--primary))]">
                {selectedContract.staff.split(' ').slice(-2).map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedContract.staff}</p>
                <p className="text-xs text-[rgb(var(--text-secondary))]">{selectedContract.code}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.dept')}</label>
                <Input value={editForm.dept} onChange={(e: InputField) => setEditForm(f => ({ ...f, dept: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.position')}</label>
                <Input value={editForm.position} onChange={(e: InputField) => setEditForm(f => ({ ...f, position: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.contractType')}</label>
                <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]" value={editForm.type} onChange={(e: SelectField) => setEditForm(f => ({ ...f, type: e.target.value }))}>
                  <option>{t('contract.permanent')}</option><option>{t('contract.visiting')}</option><option>{t('contract.probation')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.salary')} (VNĐ)</label>
                <Input type="number" value={editForm.salary} onChange={(e: InputField) => setEditForm(f => ({ ...f, salary: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.signDate')}</label>
                <Input type="date" value={editForm.startDate} onChange={(e: InputField) => setEditForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.endDate')}</label>
                <Input type="date" value={editForm.endDate} onChange={(e: InputField) => setEditForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.note')}</label>
                <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none" rows={2} placeholder={t('form.notePlaceholder')} value={editForm.note} onChange={(e: TextareaField) => setEditForm(f => ({ ...f, note: e.target.value }))} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

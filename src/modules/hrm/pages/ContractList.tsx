import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Eye, Edit3, FileText, Clock } from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty, TableSkeleton, Modal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination, useDebounce } from '@/hooks';
import { useContractList } from '@/hooks/useHrm';
import { useNotificationStore } from '@/stores/notificationStore';
import type { ContractListFilters } from '@/hooks/useHrm';
import type { ContractHistoryItem } from '@/services/hrm.service';

const TYPE_CONFIG: Record<string, { color: string }> = {
  'Cơ hữu': { color: 'rgb(var(--primary))' },
  'Thỉnh giảng': { color: 'rgb(var(--accent))' },
  'Thử việc': { color: 'rgb(var(--warning))' },
};

export default function ContractList() {
  const { t } = useTranslation('hrm');
  const notify = useNotificationStore((s) => s.addNotification);
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');

  const [createOpen, setCreateOpen] = useState(false);
  const [expiringOpen, setExpiringOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractHistoryItem | null>(null);

  const [createForm, setCreateForm] = useState({
    staff: '', dept: '', position: '', type: 'Cơ hữu',
    salary: '', startDate: '', endDate: '', file: '', note: '',
  });

  const [editForm, setEditForm] = useState({
    staff: '', dept: '', position: '', type: 'Cơ hữu',
    salary: '', startDate: '', endDate: '', note: '',
  });

  const debouncedSearch = useDebounce(search, 400);

  const filters: ContractListFilters = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: debouncedSearch || undefined,
    type: type === 'all' ? undefined : type,
    sortBy: 'year',
    sortDir: 'desc',
  };

  const { data, isLoading } = useContractList(filters);

  const records = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  // Mock expiring list from records (contracts with endDate within 30 days)
  const expiringList = records.filter(c => {
    if (!c.note?.includes('expiring')) return false;
    return true;
  });

  const openDetail = (c: ContractHistoryItem) => { setSelectedContract(c); setDetailOpen(true); };
  const openEdit = (c: ContractHistoryItem) => {
    setSelectedContract(c);
    setEditForm({
      staff: c.employeeName || '', dept: '', position: '', type: c.type,
      salary: '', startDate: c.year ? `${c.year}-01-01` : '', endDate: '', note: c.note || '',
    });
    setEditOpen(true);
  };

  const statusVariant = (s: string) =>
    s === 'active' ? 'success' : s === 'expiring' ? 'warning' : 'error';
  const statusLabel = (s: string) =>
    s === 'active' ? t('contract.statusActive') :
    s === 'expiring' ? t('contract.statusExpiring') :
    t('contract.statusExpired');

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('title')}
        description={t('description')}
        breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: t('contract.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('exportExcel')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>{t('contract.createContract')}</Button>
          </>
        }
      />

      {/* Alert sắp hết hạn */}
      {expiringList.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-[rgb(var(--warning)/0.3)] bg-[rgb(var(--warning)/0.05)] px-4 py-3">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-[rgb(var(--warning))]" />
            <span className="text-sm text-[rgb(var(--text-primary))]">
              {t('contract.alert.expiringContracts', { count: expiringList.length })}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="text-[rgb(var(--warning))]" onClick={() => setExpiringOpen(true)}>{t('contract.alert.viewList')}</Button>
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
            <TableHeadCell>{t('contract.table.nam')}</TableHeadCell>
            <TableHeadCell>{t('table.trangThai')}</TableHeadCell>
            <TableHeadCell>{t('table.thaoTac')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={7} rows={5} />
          ) : records.length === 0 ? (
            <TableEmpty colSpan={7} message={t('empty.noContracts')} />
          ) : (
            records.map((c) => {
              const tc = TYPE_CONFIG[c.type] || { color: 'rgb(var(--text-muted))' };
              const contractStatus = c.status === 'Hieu luc' ? 'active' : c.status === 'Sap het han' ? 'expiring' : 'expired';
              return (
                <TableRow key={c._id}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">
                    {c.employeeCode || c._id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))]">{c.employeeName || '—'}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">—</TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm" style={{ color: tc.color, borderColor: tc.color }}>
                      {c.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{c.year}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(contractStatus) as 'success'|'warning'|'error'} dot size="sm">{statusLabel(contractStatus)}</Badge>
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
        page={pagination.page} pageSize={pagination.pageSize} total={total}
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
            <Button variant="primary" onClick={() => { setCreateOpen(false); notify({ type: 'success', title: 'Thành công', message: 'Đã tạo hợp đồng mới' }); }}>{t('modal.saveContract')}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('contract.form.staffName')}</label>
              <Input value={createForm.staff} onChange={(e) => setCreateForm(f => ({ ...f, staff: e.target.value }))} placeholder={t('contract.form.staffNamePlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('contract.form.dept')}</label>
              <Input value={createForm.dept} onChange={(e) => setCreateForm(f => ({ ...f, dept: e.target.value }))} placeholder="VD: Khoa CNTT" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('contract.form.position')}</label>
              <Input value={createForm.position} onChange={(e) => setCreateForm(f => ({ ...f, position: e.target.value }))} placeholder="VD: Giảng viên" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('contract.form.contractType')}</label>
              <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]"
                value={createForm.type} onChange={(e) => setCreateForm(f => ({ ...f, type: e.target.value }))}>
                <option>{t('contract.permanent')}</option><option>{t('contract.visiting')}</option><option>{t('contract.probation')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('contract.form.salary')} (VNĐ)</label>
              <Input type="number" value={createForm.salary} onChange={(e) => setCreateForm(f => ({ ...f, salary: e.target.value }))} placeholder="VD: 12000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('contract.form.signDate')}</label>
              <Input type="date" value={createForm.startDate} onChange={(e) => setCreateForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('contract.form.endDate')}</label>
              <Input type="date" value={createForm.endDate} onChange={(e) => setCreateForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('contract.form.attachFile')}</label>
              <div className="flex items-center gap-2">
                <Input value={createForm.file} onChange={(e) => setCreateForm(f => ({ ...f, file: e.target.value }))} placeholder={t('contract.form.selectFile')} />
                <Button variant="outline" size="sm">{t('contract.form.browse')}</Button>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('contract.form.note')}</label>
              <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none" rows={2} placeholder={t('contract.form.notePlaceholder')} value={createForm.note} onChange={(e) => setCreateForm(f => ({ ...f, note: e.target.value }))} />
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
            <Button variant="primary" onClick={() => { setExpiringOpen(false); notify({ type: 'success', title: 'Thành công', message: 'Đã gia hạn hợp đồng' }); }}>{t('modal.renewAll')}</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[rgb(var(--text-secondary))]">{t('modal.expiringDesc', { count: expiringList.length })}</p>
          {expiringList.map((c) => {
            const tc = TYPE_CONFIG[c.type] || { color: 'rgb(var(--text-muted))' };
            return (
              <div key={c._id} className="flex items-center gap-4 rounded-lg border border-[rgb(var(--warning)/0.3)] bg-[rgb(var(--warning)/0.04)] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[rgb(var(--text-primary))]">{c.employeeName || '—'}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{c.type}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="neutral" size="sm" style={{ color: tc.color, borderColor: tc.color }}>{c.type}</Badge>
                  <p className="text-xs text-[rgb(var(--warning))] mt-1">{c.year}</p>
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
                {(selectedContract.employeeName || '?').split(' ').slice(-2).map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedContract.employeeName || '—'}</p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{selectedContract.employeeCode || selectedContract._id.slice(-8).toUpperCase()} · {selectedContract.type}</p>
              </div>
              <Badge variant={statusVariant(selectedContract.status === 'Hieu luc' ? 'active' : 'expiring') as 'success'|'warning'|'error'} dot className="ml-auto">{statusLabel(selectedContract.status === 'Hieu luc' ? 'active' : 'expiring')}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: t('form.contractType'), value: selectedContract.type },
                { label: t('contract.table.nam'), value: String(selectedContract.year) },
                { label: t('form.note'), value: selectedContract.note || '—' },
                { label: t('table.trangThai'), value: statusLabel(selectedContract.status === 'Hieu luc' ? 'active' : 'expiring') },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 border-b border-[rgb(var(--border)/0.4)] pb-2">
                  <span className="shrink-0 text-[rgb(var(--text-muted))] w-40">{label}:</span>
                  <span className="font-medium text-[rgb(var(--text-primary))]">{value}</span>
                </div>
              ))}
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
            <Button variant="primary" onClick={() => { setEditOpen(false); notify({ type: 'success', title: 'Thành công', message: 'Đã cập nhật hợp đồng' }); }}>{t('modal.saveChanges')}</Button>
          </div>
        }
      >
        {selectedContract && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-sm font-bold text-[rgb(var(--primary))]">
                {(selectedContract.employeeName || '?').split(' ').slice(-2).map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedContract.employeeName || '—'}</p>
                <p className="text-xs text-[rgb(var(--text-secondary))]">{selectedContract.year}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.dept')}</label>
                <Input value={editForm.dept} onChange={(e) => setEditForm(f => ({ ...f, dept: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.position')}</label>
                <Input value={editForm.position} onChange={(e) => setEditForm(f => ({ ...f, position: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.contractType')}</label>
                <select className="w-full h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2]" value={editForm.type} onChange={(e) => setEditForm(f => ({ ...f, type: e.target.value }))}>
                  <option>{t('contract.permanent')}</option><option>{t('contract.visiting')}</option><option>{t('contract.probation')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('table.nam')}</label>
                <Input type="number" value={editForm.startDate ? editForm.startDate.slice(0, 4) : ''} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('form.note')}</label>
                <textarea className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2] resize-none" rows={2} placeholder={t('form.notePlaceholder')} value={editForm.note} onChange={(e) => setEditForm(f => ({ ...f, note: e.target.value }))} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

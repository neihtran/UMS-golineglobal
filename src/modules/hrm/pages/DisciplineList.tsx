import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Eye, Trash2 } from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty, Modal, TableSkeleton, ConfirmModal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination, useDebounce } from '@/hooks';
import { useDisciplineList, useDeleteDiscipline } from '@/hooks/useHrm';
import { useNotificationStore } from '@/stores/notificationStore';
import type { DisciplineItem } from '@/services/hrm.service';

const TYPE_CONFIG: Record<string, string> = {
  warning: 'discipline.type.warning',
  reprimand: 'discipline.type.reprimand',
  demotion: 'discipline.type.demotion',
  dismissal: 'discipline.type.dismissal',
};

export default function DisciplineList() {
  const { t } = useTranslation('hrm');
  const notify = useNotificationStore((s) => s.addNotification);
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [chiTietOpen, setChiTietOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DisciplineItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useDisciplineList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: debouncedSearch || undefined,
    type: type === 'all' ? undefined : type,
  });

  const deleteDiscipline = useDeleteDiscipline();

  const items = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const handleDelete = (item: DisciplineItem) => {
    deleteDiscipline.mutate(
      item._id,
      {
        onSuccess: () => {
          notify({ type: 'success', title: 'Đã xóa', message: `Đã xóa kỷ luật ${item._id}` });
          setDeleteId(null);
        },
        onError: () => notify({ type: 'error', title: 'Lỗi', message: 'Không thể xóa' }),
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('discipline.title')}
        description={t('discipline.description')}
        breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: t('discipline.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('exportExcel')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>{t('discipline.add')}</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder={t('filter.searchPlaceholder')} value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} wrapperClassName="w-72" />
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]">
          <option value="all">{t('discipline.filter.typeAll')}</option>
          <option value="warning">{t('discipline.type.warning')}</option>
          <option value="reprimand">{t('discipline.type.reprimand')}</option>
          <option value="demotion">{t('discipline.type.demotion')}</option>
          <option value="dismissal">{t('discipline.type.dismissal')}</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>{t('discipline.table.employee')}</TableHeadCell>
            <TableHeadCell>{t('discipline.table.type')}</TableHeadCell>
            <TableHeadCell>{t('discipline.table.reason')}</TableHeadCell>
            <TableHeadCell>{t('discipline.table.date')}</TableHeadCell>
            <TableHeadCell>{t('discipline.table.decisionNo')}</TableHeadCell>
            <TableHeadCell>{t('discipline.table.action')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={7} rows={8} />
          ) : items.length === 0 ? (
            <TableEmpty colSpan={7} message={t('empty.noDiscipline')} />
          ) : (
            items.map((d, i) => (
              <TableRow key={d._id}>
                <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                  {(pagination.page - 1) * pagination.pageSize + i + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">
                      {(d.employeeName || 'NA').split(' ').slice(-2).map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-[rgb(var(--text-primary))]">{d.employeeName || '—'}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{d.employeeCode || ''}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="warning" size="sm">{t(TYPE_CONFIG[d.type] || d.type)}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-[rgb(var(--text-secondary))]">{d.reason}</TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">
                  {d.date ? new Date(d.date).toLocaleDateString('vi-VN') : '—'}
                </TableCell>
                <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{d.decisionNo || '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}
                      onClick={() => { setSelectedItem(d); setChiTietOpen(true); }}>Chi tiết</Button>
                    <Button variant="ghost" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5 text-[rgb(var(--error))]" />}
                      onClick={() => setDeleteId(d._id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination page={pagination.page} pageSize={pagination.pageSize} total={total}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} pageSizeOptions={[10, 25, 50]} />

      {/* Modal Detail */}
      <Modal open={chiTietOpen} onClose={() => setChiTietOpen(false)} title={t('discipline.modal.detailTitle')} size="lg"
        footer={<div className="flex justify-end"><Button variant="outline" onClick={() => setChiTietOpen(false)}>Đóng</Button></div>}>
        {selectedItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex gap-3 border-b border-[rgb(var(--border)/0.4)] pb-2">
                <span className="shrink-0 text-[rgb(var(--text-muted))]">Người vi phạm:</span>
                <span className="font-medium text-[rgb(var(--text-primary))]">{selectedItem.employeeName || '—'}</span>
              </div>
              <div className="flex gap-3 border-b border-[rgb(var(--border)/0.4)] pb-2">
                <span className="shrink-0 text-[rgb(var(--text-muted))]">Mã NV:</span>
                <span className="font-medium text-[rgb(var(--text-primary))]">{selectedItem.employeeCode || '—'}</span>
              </div>
              <div className="flex gap-3 border-b border-[rgb(var(--border)/0.4)] pb-2">
                <span className="shrink-0 text-[rgb(var(--text-muted))]">Hình thức:</span>
                <Badge variant="warning" size="sm">{t(TYPE_CONFIG[selectedItem.type] || selectedItem.type)}</Badge>
              </div>
              <div className="flex gap-3 border-b border-[rgb(var(--border)/0.4)] pb-2">
                <span className="shrink-0 text-[rgb(var(--text-muted))]">Ngày:</span>
                <span className="font-medium text-[rgb(var(--text-primary))]">
                  {selectedItem.date ? new Date(selectedItem.date).toLocaleDateString('vi-VN') : '—'}
                </span>
              </div>
              <div className="flex gap-3 border-b border-[rgb(var(--border)/0.4)] pb-2">
                <span className="shrink-0 text-[rgb(var(--text-muted))]">Số quyết định:</span>
                <span className="font-medium text-[rgb(var(--text-primary))]">{selectedItem.decisionNo || '—'}</span>
              </div>
            </div>
            {selectedItem.reason && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-1.5">Lý do</p>
                <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-3 text-sm text-[rgb(var(--text-secondary))]">
                  {selectedItem.reason}
                </div>
              </div>
            )}
            {selectedItem.description && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-1.5">Mô tả</p>
                <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-3 text-sm text-[rgb(var(--text-secondary))]">
                  {selectedItem.description}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          const item = items.find(d => d._id === deleteId);
          if (item) handleDelete(item);
        }}
        title="Xác nhận xóa"
        description="Bạn có chắc muốn xóa kỷ luật này không?"
        confirmText="Xóa"
        variant="danger"
      />
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Clock, CheckCircle2, FileText, XCircle } from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty, ConfirmModal, Modal,
  TableSkeleton,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination, useDebounce } from '@/hooks';
import { useAppointmentList, useAppointmentStats, useUpdateAppointment } from '@/hooks/useHrm';
import { useNotificationStore } from '@/stores/notificationStore';
import type { AppointmentItem } from '@/services/hrm.service';

const TYPE_CONFIG: Record<string, { color: string; labelKey: string }> = {
  'Bo nhiem': { color: 'primary', labelKey: 'appointment.appointmentType.boNhiem' },
  'Bo nhiem moi': { color: 'info', labelKey: 'appointment.appointmentType.boNhiemMoi' },
  'Bo nhiem lai': { color: 'primary', labelKey: 'appointment.appointmentType.boNhiemLai' },
  'Thang chuc': { color: 'success', labelKey: 'appointment.appointmentType.thangChuc' },
};

export default function AppointmentList() {
  const { t } = useTranslation('hrm');
  const notify = useNotificationStore((s) => s.addNotification);
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useAppointmentList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
  });

  const { data: statsData } = useAppointmentStats();

  const updateAppointment = useUpdateAppointment();

  const items = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const stats = useMemo(() => {
    const raw = (statsData as any) ?? {};
    const totalFromStats = typeof raw.total === 'number' ? raw.total : total;
    const pending = typeof raw.byStatus === 'object' && raw.byStatus ? (raw.byStatus.pending as number) ?? 0 : 0;
    const approved = typeof raw.byStatus === 'object' && raw.byStatus ? (raw.byStatus.approved as number) ?? 0 : 0;
    const rejected = typeof raw.byStatus === 'object' && raw.byStatus ? (raw.byStatus.rejected as number) ?? 0 : 0;
    return [
      { labelKey: 'appointment.stats.total', value: totalFromStats, icon: <FileText className="h-5 w-5" />, color: 'primary' },
      { labelKey: 'appointment.stats.pending', value: pending, icon: <Clock className="h-5 w-5" />, color: 'warning' },
      { labelKey: 'appointment.stats.approved', value: approved, icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
      { labelKey: 'appointment.stats.rejected', value: rejected, icon: <XCircle className="h-5 w-5" />, color: 'error' },
    ];
  }, [statsData, total]);

  const statusVariant = (s: string) =>
    s === 'pending' ? 'warning' : s === 'approved' ? 'success' : 'error';
  const statusLabel = (s: string) =>
    s === 'pending' ? t('appointment.status.pending') :
    s === 'approved' ? t('appointment.status.approved') : t('appointment.status.rejected');

  const handleApprove = (id: string) => {
    updateAppointment.mutate(
      { id, data: { status: 'approved' } },
      { onSuccess: () => notify({ type: 'success', title: 'Đã duyệt', message: 'Đã duyệt bổ nhiệm' }), onError: () => notify({ type: 'error', title: 'Lỗi', message: 'Không thể duyệt' }) }
    );
    setConfirmAction(null);
  };

  const handleReject = (id: string) => {
    updateAppointment.mutate(
      { id, data: { status: 'rejected' } },
      { onSuccess: () => notify({ type: 'success', title: 'Đã từ chối', message: 'Đã từ chối bổ nhiệm' }), onError: () => notify({ type: 'error', title: 'Lỗi', message: 'Không thể từ chối' }) }
    );
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('appointment.title')}
        description={t('appointment.description')}
        breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: t('appointment.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('exportExcel')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>{t('appointment.createAppointment')}</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.labelKey} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{t(s.labelKey)}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder={t('filter.searchPlaceholder')} value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} wrapperClassName="w-72" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]">
          <option value="all">{t('filter.statusAll')}</option>
          <option value="pending">{t('appointment.status.pending')}</option>
          <option value="approved">{t('appointment.status.approved')}</option>
          <option value="rejected">{t('appointment.status.rejected')}</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>{t('appointment.table.vienChuc')}</TableHeadCell>
            <TableHeadCell>{t('appointment.table.type')}</TableHeadCell>
            <TableHeadCell>{t('appointment.table.fromPosition')}</TableHeadCell>
            <TableHeadCell>{t('appointment.table.toPosition')}</TableHeadCell>
            <TableHeadCell>{t('appointment.table.effectiveDate')}</TableHeadCell>
            <TableHeadCell>{t('table.trangThai')}</TableHeadCell>
            <TableHeadCell>{t('table.thaoTac')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colSpan={8} rows={6} />
          ) : items.length === 0 ? (
            <TableEmpty colSpan={8} message={t('empty.noAppointments')} />
          ) : (
            items.map((a, i) => {
              const tc = TYPE_CONFIG[a.type] || { color: 'neutral', labelKey: a.type };
              return (
                <TableRow key={a._id}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(pagination.page - 1) * pagination.pageSize + i + 1}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-[rgb(var(--text-primary))]">{a.employeeName || '—'}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{a.employeeCode || ''}</p>
                  </TableCell>
                  <TableCell><Badge variant={tc.color as 'info' | 'primary' | 'success'} size="sm">{t(tc.labelKey)}</Badge></TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{a.title}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{a.note || '—'}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{a.fromDate ? new Date(a.fromDate).toLocaleDateString('vi-VN') : '—'}</TableCell>
                  <TableCell><Badge variant={statusVariant(a.status) as 'warning' | 'success' | 'error'} dot size="sm">{statusLabel(a.status)}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedAppointment(a); setDetailOpen(true); }}>{t('action.viewDetail')}</Button>
                      {a.status !== 'approved' && a.status !== 'rejected' && (
                        <>
                          <Button variant="ghost" size="sm" className="text-[rgb(var(--success))] hover:text-[rgb(var(--success))] hover:bg-[rgb(var(--success)/0.08)]"
                            onClick={() => setConfirmAction({ id: a._id, type: 'approve' })}>Duyệt</Button>
                          <Button variant="ghost" size="sm" className="text-[rgb(var(--error))] hover:text-[rgb(var(--error))] hover:bg-[rgb(var(--error)/0.08)]"
                            onClick={() => setConfirmAction({ id: a._id, type: 'reject' })}>Từ chối</Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination page={pagination.page} pageSize={pagination.pageSize} total={total}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} pageSizeOptions={[10, 25, 50]} />

      {/* Modal Chi tiet ho so bo nhiem */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={t('appointment.modal.detailTitle')}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>{t('close')}</Button>
            <Button variant="primary" leftIcon={<FileText className="h-4 w-4" />} onClick={() => setDetailOpen(false)}>{t('appointment.modal.downloadQD')}</Button>
          </div>
        }
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-lg font-bold text-white">
                {(selectedAppointment.employeeName || 'NA').split(' ').slice(-2).map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedAppointment.employeeName || '—'}</p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{selectedAppointment.employeeCode || ''} · {selectedAppointment.department || ''}</p>
              </div>
              <Badge variant={statusVariant(selectedAppointment.status) as 'warning' | 'success' | 'error'} dot className="ml-auto">{statusLabel(selectedAppointment.status)}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: t('appointment.modal.appointmentType'), value: t(TYPE_CONFIG[selectedAppointment.type]?.labelKey || selectedAppointment.type) },
                { label: t('appointment.table.fromPosition'), value: selectedAppointment.title },
                { label: t('appointment.table.toPosition'), value: selectedAppointment.note || '—' },
                { label: t('appointment.table.effectiveDate'), value: selectedAppointment.fromDate ? new Date(selectedAppointment.fromDate).toLocaleDateString('vi-VN') : '—' },
                { label: t('appointment.table.requester'), value: '—' },
                { label: t('table.trangThai'), value: statusLabel(selectedAppointment.status) },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 border-b border-[rgb(var(--border)/0.4)] pb-2">
                  <span className="shrink-0 text-[rgb(var(--text-muted))] w-36">{label}:</span>
                  <span className="font-medium text-[rgb(var(--text-primary))]">{value}</span>
                </div>
              ))}
            </div>
            {selectedAppointment.note && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-1.5">{t('appointment.modal.reason')}</p>
                <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-3 text-sm text-[rgb(var(--text-secondary))]">{selectedAppointment.note}</div>
              </div>
            )}
            <div className="p-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] text-center text-[rgb(var(--text-muted))]">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{t('appointment.modal.decisionFile')}: <strong className="font-mono">{selectedAppointment._id}.pdf</strong></p>
              <p className="text-xs mt-1">{t('contract.modal.downloadHint')}</p>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.type === 'approve') handleApprove(confirmAction.id);
          else handleReject(confirmAction.id);
        }}
        title={confirmAction?.type === 'approve' ? t('appointment.modal.approveTitle') : t('appointment.modal.rejectTitle')}
        description={confirmAction?.type === 'approve' ? t('appointment.modal.approveDesc') : t('appointment.modal.rejectDesc')}
        confirmText={confirmAction?.type === 'approve' ? t('appointment.modal.confirmApprove') : t('appointment.modal.confirmReject')}
        variant={confirmAction?.type === 'reject' ? 'danger' : 'primary'}
      />
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, AlertTriangle, CheckCircle2, FileText, Download, XCircle, Search } from 'lucide-react';
import { Card, CardContent, Badge, Button, Select, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TableEmpty, TablePagination, Modal, ConfirmModal } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useLeaveList, useLeaveStats, useApproveLeave, useRejectLeave } from '@/hooks/useLeave';

const LEAVE_TYPES = [
  { value: 'all', labelKey: 'filter.typeAll' },
  { value: 'annual', labelKey: 'leave.filter.typeAnnual' },
  { value: 'sick', labelKey: 'leave.filter.typeSick' },
  { value: 'unpaid', labelKey: 'leave.filter.typeUnpaid' },
  { value: 'maternity', labelKey: 'leave.filter.typeMaternity' },
  { value: 'paternity', labelKey: 'leave.filter.typePaternity' },
];

const LEAVE_TYPE_LABEL: Record<string, string> = {
  annual: 'leave.typeLabel.annual',
  sick: 'leave.typeLabel.sick',
  unpaid: 'leave.typeLabel.unpaid',
  maternity: 'leave.typeLabel.maternity',
  paternity: 'leave.typeLabel.paternity',
  other: 'leave.typeLabel.other',
};

export default function LeaveRequestList() {
  const { t } = useTranslation('hrm');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const { data: listData, isLoading, refetch } = useLeaveList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: search || undefined,
    type: type === 'all' ? undefined : type,
    status: statusFilter === 'all' ? undefined : statusFilter,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const { data: statsData } = useLeaveStats();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();

  const records = listData?.data ?? [];
  const total = listData?.pagination?.total ?? 0;

  const stats = [
    { labelKey: 'leave.stats.pending', value: String(statsData?.data?.pending ?? 0), icon: <Clock className="h-5 w-5" />, color: 'warning' },
    { labelKey: 'leave.stats.approvedMonth', value: String(statsData?.data?.approved ?? 0), icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
    { labelKey: 'leave.stats.rejected', value: String(statsData?.data?.rejected ?? 0), icon: <AlertTriangle className="h-5 w-5" />, color: 'error' },
    { labelKey: 'leave.stats.totalMonth', value: String(statsData?.data?.total ?? records.length), icon: <FileText className="h-5 w-5" />, color: 'primary' },
  ];

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'approve') {
      approveMutation.mutate(confirmAction.id, {
        onSuccess: () => { refetch(); setConfirmAction(null); },
      });
    } else {
      rejectMutation.mutate({ id: confirmAction.id, reason: '' }, {
        onSuccess: () => { refetch(); setConfirmAction(null); },
      });
    }
  };

  const statusVariant = (s: string) =>
    s === 'approved' ? 'success' : s === 'pending' ? 'warning' : s === 'rejected' ? 'error' : 'neutral';
  const statusLabel = (s: string) =>
    s === 'approved' ? t('leave.status.approved') :
    s === 'pending' ? t('leave.status.pending') :
    s === 'rejected' ? t('leave.status.rejected') :
    t('leave.status.cancelled');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('leave.title')}
        description={t('leave.description')}
        breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: t('leave.breadcrumb') }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('exportReport')}</Button>
            <Link to="/hrm/nghi-phep/tao">
              <Button leftIcon={<FileText className="h-4 w-4" />}>{t('leave.createLeaveRequest')}</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.labelKey}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{t(s.labelKey)}</p>
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <input
                type="text"
                placeholder={t('filter.searchPlaceholder')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 pl-9 text-sm placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--primary))] focus:outline-none"
              />
            </div>
            <Select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} options={LEAVE_TYPES.map(tOpt => ({ value: tOpt.value, label: t(tOpt.labelKey) }))} className="w-44" />
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} options={[
              { value: 'all', label: t('filter.all') }, { value: 'pending', label: t('leave.status.pending') }, { value: 'approved', label: t('leave.status.approved') }, { value: 'rejected', label: t('leave.status.rejected') }
            ]} className="w-36" />
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Mã đơn</TableHeadCell>
                <TableHeadCell>{t('leave.table.employee')}</TableHeadCell>
                <TableHeadCell>{t('table.loai')}</TableHeadCell>
                <TableHeadCell>{t('table.tuNgay')}</TableHeadCell>
                <TableHeadCell>{t('table.denNgay')}</TableHeadCell>
                <TableHeadCell>{t('table.soNgay')}</TableHeadCell>
                <TableHeadCell>{t('table.trangThai')}</TableHeadCell>
                <TableHeadCell></TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableEmpty colSpan={8} message={t('common.loading')} />
              ) : records.length === 0 ? (
                <TableEmpty colSpan={8} message={t('empty.noLeaveRequests')} />
              ) : (
                records.map((r: any) => {
                  const typeLabel = LEAVE_TYPE_LABEL[r.type] ? t(LEAVE_TYPE_LABEL[r.type]) : r.type;
                  return (
                    <TableRow key={r._id ?? r.id} className="hover:bg-[rgb(var(--bg-hover))]">
                      <TableCell className="text-xs font-mono text-[rgb(var(--text-muted))]">#{String(r._id ?? r.id).slice(-8)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{r.employeeName}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">{r.departmentName || '—'}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="neutral" size="sm">{typeLabel}</Badge></TableCell>
                      <TableCell className="text-sm">{r.startDate ? new Date(r.startDate).toLocaleDateString('vi-VN') : '—'}</TableCell>
                      <TableCell className="text-sm">{r.endDate ? new Date(r.endDate).toLocaleDateString('vi-VN') : '—'}</TableCell>
                      <TableCell className="text-sm font-medium">{r.days ?? '—'}</TableCell>
                      <TableCell><Badge variant={statusVariant(r.status) as 'success'|'warning'|'error'|'neutral'} size="sm">{statusLabel(r.status)}</Badge></TableCell>
                      <TableCell>
                        {r.status === 'pending' ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost" size="sm"
                              className="text-[rgb(var(--success))] hover:text-[rgb(var(--success))] hover:bg-[rgb(var(--success)/0.08)]"
                              leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                              onClick={() => setConfirmAction({ id: String(r._id ?? r.id), type: 'approve' })}
                              loading={approveMutation.isPending}
                            >
                              {t('action.approve')}
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              className="text-[rgb(var(--error))] hover:text-[rgb(var(--error))] hover:bg-[rgb(var(--error)/0.08)]"
                              leftIcon={<XCircle className="h-3.5 w-3.5" />}
                              onClick={() => setConfirmAction({ id: String(r._id ?? r.id), type: 'reject' })}
                              loading={rejectMutation.isPending}
                            >
                              {t('action.reject')}
                            </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedRequest(r); setDetailOpen(true); }}>{t('action.viewDetail')}</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <TablePagination page={pagination.page} pageSize={pagination.pageSize} total={total} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={t('leave.modal.detailTitle')}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>{t('close')}</Button>
          </div>
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-lg font-bold text-white">
                {(selectedRequest.employeeName || '?').split(' ').slice(-2).map((n: string) => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedRequest.employeeName}</p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{selectedRequest.departmentName || '—'}</p>
              </div>
              <Badge variant={statusVariant(selectedRequest.status) as 'success'|'warning'|'error'|'neutral'} dot className="ml-auto">{statusLabel(selectedRequest.status)}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: t('table.loai'), value: LEAVE_TYPE_LABEL[selectedRequest.type] ? t(LEAVE_TYPE_LABEL[selectedRequest.type]) : selectedRequest.type },
                { label: t('table.tuNgay'), value: selectedRequest.startDate ? new Date(selectedRequest.startDate).toLocaleDateString('vi-VN') : '—' },
                { label: t('table.denNgay'), value: selectedRequest.endDate ? new Date(selectedRequest.endDate).toLocaleDateString('vi-VN') : '—' },
                { label: t('vienChucDetail.modal.leaveDays'), value: `${selectedRequest.days ?? '—'} ${t('vienChucDetail.leaveDaysUnit')}` },
                { label: t('table.nguoiDuyet'), value: selectedRequest.approverName || '—' },
                { label: t('table.ngayDuyet'), value: selectedRequest.approvedAt ? new Date(selectedRequest.approvedAt).toLocaleDateString('vi-VN') : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 border-b border-[rgb(var(--border)/0.4)] pb-2">
                  <span className="shrink-0 text-[rgb(var(--text-muted))] w-40">{label}:</span>
                  <span className="font-medium text-[rgb(var(--text-primary))]">{value}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-1.5">{t('leave.modal.reason')}</p>
              <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-3 text-sm text-[rgb(var(--text-secondary))]">
                {selectedRequest.reason || '—'}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={confirmAction?.type === 'approve' ? t('leave.modal.approveTitle') : t('leave.modal.rejectTitle')}
        description={confirmAction?.type === 'approve' ? t('leave.modal.approveDesc') : t('leave.modal.rejectDesc')}
        confirmText={confirmAction?.type === 'approve' ? t('leave.modal.confirmApprove') : t('leave.modal.confirmReject')}
        variant={confirmAction?.type === 'reject' ? 'danger' : 'primary'}
      />
    </div>
  );
}

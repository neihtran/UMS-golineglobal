import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, AlertTriangle, CheckCircle2, FileText, Download, XCircle, CheckCircle, Search } from 'lucide-react';
import { Card, CardContent, Badge, Button, Select, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TableEmpty, TablePagination, DetailModal, ConfirmModal } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';
import { useDetailModal } from '@/hooks/useDetailModal';

const REQUESTS = [
  { id: 'l1', code: 'NP-2026-001', employee: 'Nguyễn Văn Long', dept: 'Phòng Tuyển sinh', type: 'Nghỉ phép năm', from: '2026-07-01', to: '2026-07-05', days: 5, reason: 'Nghỉ du lịch cùng gia đình', status: 'approved', approver: 'TS. Trần Thị Lan', approvedAt: '2026-06-20' },
  { id: 'l2', code: 'NP-2026-002', employee: 'Trần Thị Mai', dept: 'Khoa CNTT', type: 'Nghỉ phép năm', from: '2026-08-10', to: '2026-08-15', days: 4, reason: 'Việc gia đình', status: 'pending', approver: '—', approvedAt: '—' },
  { id: 'l3', code: 'NP-2026-003', employee: 'Lê Văn Minh', dept: 'Khoa Kinh tế', type: 'Nghỉ ốm', from: '2026-06-22', to: '2026-06-23', days: 2, reason: 'Bị sốt cao', status: 'approved', approver: 'TS. Trần Thị Lan', approvedAt: '2026-06-21' },
  { id: 'l4', code: 'NP-2026-004', employee: 'Phạm Thu Hà', dept: 'Phòng Tổ chức', type: 'Nghỉ việc riêng', from: '2026-07-15', to: '2026-07-15', days: 1, reason: 'Làm thủ tục cá nhân', status: 'rejected', approver: 'TS. Trần Thị Lan', approvedAt: '2026-06-22' },
  { id: 'l5', code: 'NP-2026-005', employee: 'Bùi Đình Nam', dept: 'Khoa Ngoại ngữ', type: 'Nghỉ phép năm', from: '2026-09-01', to: '2026-09-03', days: 3, reason: 'Nghỉ hè', status: 'pending', approver: '—', approvedAt: '—' },
];

const TYPES = [
  { value: 'all', labelKey: 'filter.typeAll' },
  { value: 'Nghỉ phép năm', labelKey: 'leave.filter.typeAnnual' },
  { value: 'Nghỉ ốm', labelKey: 'leave.filter.typeSick' },
  { value: 'Nghỉ việc riêng', labelKey: 'leave.filter.typeUnpaid' },
  { value: 'Nghỉ thai sản', labelKey: 'leave.filter.typeMaternity' },
  { value: 'Nghỉ không lương', labelKey: 'leave.filter.typePaternity' },
];

const TYPE_LABEL_KEY: Record<string, string> = {
  'Nghỉ phép năm': 'leave.typeLabel.annual',
  'Nghỉ ốm': 'leave.typeLabel.sick',
  'Nghỉ việc riêng': 'leave.typeLabel.unpaid',
  'Nghỉ thai sản': 'leave.typeLabel.maternity',
  'Nghỉ không lương': 'leave.typeLabel.paternity',
};

export default function LeaveRequestList() {
  const { t } = useTranslation('hrm');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [requests, setRequests] = useState(REQUESTS);
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null);

  const { selectedId, openDetail, close } = useDetailModal({ size: 'fullscreen' });
  const selectedRequest = selectedId ? requests.find((r) => r.id === selectedId) ?? null : null;

  const filtered = requests.filter((r) => {
    const matchSearch = !search || r.employee.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase());
    const matchType = type === 'all' || r.type === type;
    const matchStatus = status === 'all' || r.status === status;
    return matchSearch && matchType && matchStatus;
  });

  const handleApprove = (id: string) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'approved', approver: 'TS. Trần Thị Lan', approvedAt: new Date().toISOString().slice(0, 10) } : r));
  };

  const handleReject = (id: string) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'rejected', approver: 'TS. Trần Thị Lan', approvedAt: new Date().toISOString().slice(0, 10) } : r));
  };

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const statusVariant = (s: string) =>
    s === 'approved' ? 'success' : s === 'pending' ? 'warning' : s === 'rejected' ? 'error' : 'neutral';
  const statusLabel = (s: string) =>
    s === 'approved' ? t('leave.status.approved') :
    s === 'pending' ? t('leave.status.pending') :
    s === 'rejected' ? t('leave.status.rejected') :
    t('leave.status.cancelled');

  const stats = [
    { labelKey: 'leave.stats.pending', value: String(requests.filter(r => r.status === 'pending').length), icon: <Clock className="h-5 w-5" />, color: 'warning' },
    { labelKey: 'leave.stats.approvedMonth', value: String(requests.filter(r => r.status === 'approved').length), icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
    { labelKey: 'leave.stats.rejected', value: String(requests.filter(r => r.status === 'rejected').length), icon: <AlertTriangle className="h-5 w-5" />, color: 'error' },
    { labelKey: 'leave.stats.totalMonth', value: String(requests.length), icon: <FileText className="h-5 w-5" />, color: 'primary' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('leave.title')}
        description={t('leave.description')}
        breadcrumbs={[{ label: 'HRM' }, { label: t('leave.breadcrumb') }]}
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
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1] text-[rgb(var(--${s.color}))]`}>
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
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 pl-9 text-sm placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--primary))] focus:outline-none"
              />
            </div>
            <Select value={type} onChange={(e) => setType(e.target.value)} options={TYPES.map(tOpt => ({ value: tOpt.value, label: t(tOpt.labelKey) }))} className="w-44" />
            <Select value={status} onChange={(e) => setStatus(e.target.value)} options={[
              { value: 'all', label: t('filter.all') }, { value: 'pending', label: t('leave.status.pending') }, { value: 'approved', label: t('leave.status.approved') }, { value: 'rejected', label: t('leave.status.rejected') }
            ]} className="w-36" />
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>{t('leave.table.code')}</TableHeadCell>
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
              {paged.length === 0 ? (
                <TableEmpty colSpan={8} message={t('empty.noLeaveRequests')} />
              ) : (
                paged.map((r) => (
                  <TableRow key={r.id} className="hover:bg-[rgb(var(--bg-hover))]">
                    <TableCell className="text-xs font-mono text-[rgb(var(--text-muted))]">{r.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{r.employee}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{r.dept}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="neutral" size="sm">{t(TYPE_LABEL_KEY[r.type] || r.type)}</Badge></TableCell>
                    <TableCell className="text-sm">{r.from}</TableCell>
                    <TableCell className="text-sm">{r.to}</TableCell>
                    <TableCell className="text-sm font-medium">{r.days}</TableCell>
                    <TableCell><Badge variant={statusVariant(r.status) as 'success'|'warning'|'error'|'neutral'} size="sm">{statusLabel(r.status)}</Badge></TableCell>
                    <TableCell>
                      {r.status === 'pending' ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost" size="sm"
                            className="text-[rgb(var(--success))] hover:text-[rgb(var(--success))] hover:bg-[rgb(var(--success)/0.08)]"
                            leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                            onClick={() => setConfirmAction({ id: r.id, type: 'approve' })}
                          >
                            {t('action.approve')}
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="text-[rgb(var(--error))] hover:text-[rgb(var(--error))] hover:bg-[rgb(var(--error)/0.08)]"
                            leftIcon={<XCircle className="h-3.5 w-3.5" />}
                            onClick={() => setConfirmAction({ id: r.id, type: 'reject' })}
                          >
                            {t('action.reject')}
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => openDetail(r.id)}>{t('action.viewDetail')}</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <TablePagination page={pagination.page} pageSize={pagination.pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={selectedRequest ? `${t('leave.modal.detailTitle')} — ${selectedRequest.employee}` : ''}
        description={selectedRequest ? `${selectedRequest.code} · ${selectedRequest.dept}` : ''}
        size="fullscreen"
        onEdit={selectedRequest?.status === 'pending' ? () => {/* could open edit form */} : undefined}
        onPrint={selectedRequest ? () => window.print() : undefined}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04)] border border-[rgb(var(--primary)/0.2)]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-lg font-bold text-white">
                {selectedRequest.employee.split(' ').slice(-2).map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedRequest.employee}</p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{selectedRequest.code} · {selectedRequest.dept}</p>
              </div>
              <Badge variant={statusVariant(selectedRequest.status) as 'success'|'warning'|'error'|'neutral'} dot className="ml-auto">{statusLabel(selectedRequest.status)}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: t('table.loai'), value: selectedRequest.type },
                { label: t('table.tuNgay'), value: selectedRequest.from },
                { label: t('table.denNgay'), value: selectedRequest.to },
                { label: t('vienChucDetail.modal.leaveDays'), value: `${selectedRequest.days} ${t('vienChucDetail.leaveDaysUnit')}` },
                { label: t('table.nguoiDuyet'), value: selectedRequest.approver },
                { label: t('table.ngayDuyet'), value: selectedRequest.approvedAt },
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
                {selectedRequest.reason}
              </div>
            </div>
          </div>
        )}
      </DetailModal>

      <ConfirmModal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.type === 'approve') handleApprove(confirmAction.id);
          else handleReject(confirmAction.id);
          setConfirmAction(null);
        }}
        title={confirmAction?.type === 'approve' ? t('leave.modal.approveTitle') : t('leave.modal.rejectTitle')}
        description={confirmAction?.type === 'approve' ? t('leave.modal.approveDesc') : t('leave.modal.rejectDesc')}
        confirmText={confirmAction?.type === 'approve' ? t('leave.modal.confirmApprove') : t('leave.modal.confirmReject')}
        variant={confirmAction?.type === 'reject' ? 'danger' : 'primary'}
      />
    </div>
  );
}

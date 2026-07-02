import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Clock, CheckCircle2, FileText, XCircle, CheckCircle } from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty, ConfirmModal, Modal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const APPOINTMENTS = [
  { id: 'a01', code: 'BN-2026-001', name: 'Nguyen Hoang Long', dept: 'Khoa CNTT', from: 'Truong khoa', to: 'Pho Hieu truong', date: '2026-08-01', type: 'Bo nhiem lai', status: 'pending', requester: 'TS. Tran Thi Lan', reason: 'Bo nhiem giu chuc vu Pho Hieu truong' },
  { id: 'a02', code: 'BN-2026-002', name: 'Tran Thi Mai Lan', dept: 'Khoa Kinh te', from: 'Giang vien', to: 'Pho truong khoa', date: '2026-07-15', type: 'Bo nhiem moi', status: 'pending', requester: 'TS. Tran Thi Lan', reason: 'Bo nhiem giu chuc vu Pho truong khoa Kinh te' },
  { id: 'a03', code: 'BN-2025-015', name: 'Le Van Minh', dept: 'Khoa Luat', from: 'Thac si', to: 'Truong bo mon', date: '2025-09-01', type: 'Bo nhiem lai', status: 'approved', requester: 'TS. Tran Thi Lan', reason: 'Bo nhiem giu chuc Truong bo mon Luat hinh su' },
  { id: 'a04', code: 'BN-2025-016', name: 'Pham Thu Ha', dept: 'Phong To chuc', from: 'Nhan vien', to: 'Truong phong', date: '2025-10-01', type: 'Bo nhiem moi', status: 'approved', requester: 'TS. Tran Thi Lan', reason: 'Bo nhiem giu chuc Truong phong To chuc - Hanh chinh' },
  { id: 'a05', code: 'BN-2024-030', name: 'Hoang Thi Lan', dept: 'Ban Giam hieu', from: 'Pho Hieu truong', to: 'Hieu truong', date: '2024-10-01', type: 'Bo nhiem lai', status: 'approved', requester: 'PGS.TS. Ly Van Hung', reason: 'Bo nhiem giu chuc Hieu truong nhiem ky 2024-2029' },
  { id: 'a06', code: 'BN-2026-003', name: 'Bui Dinh Nam', dept: 'Khoa Ngoai ngu', from: 'Tro giang', to: 'Giang vien', date: '2026-09-01', type: 'Thang chuc', status: 'rejected', requester: 'TS. Tran Thi Lan', reason: 'Thang chuc tu Tro giang len Giang vien chinh' },
];

const TYPE_CONFIG: Record<string, { color: string; labelKey: string }> = {
  'Bo nhiem': { color: 'primary', labelKey: 'appointment.appointmentType.boNhiem' },
  'Bo nhiem moi': { color: 'info', labelKey: 'appointment.appointmentType.boNhiemMoi' },
  'Bo nhiem lai': { color: 'primary', labelKey: 'appointment.appointmentType.boNhiemLai' },
  'Thang chuc': { color: 'success', labelKey: 'appointment.appointmentType.thangChuc' },
};

export default function AppointmentList() {
  const { t } = useTranslation('hrm');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [appointments, setAppointments] = useState(APPOINTMENTS);
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<typeof APPOINTMENTS[0] | null>(null);

  const filtered = appointments.filter((a) => {
    const match = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'all' || a.status === status;
    return match && matchStatus;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const handleApprove = (id: string) => {
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'approved' } : a));
  };

  const handleReject = (id: string) => {
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'rejected' } : a));
  };

  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  const statusVariant = (s: string) =>
    s === 'pending' ? 'warning' : s === 'approved' ? 'success' : 'error';
  const statusLabel = (s: string) =>
    s === 'pending' ? t('appointment.status.pending') :
    s === 'approved' ? t('appointment.status.approved') : t('appointment.status.rejected');

  const stats = [
    { labelKey: 'appointment.stats.total', value: appointments.length, icon: <FileText className="h-5 w-5" />, color: 'primary' },
    { labelKey: 'appointment.stats.pending', value: pendingCount, icon: <Clock className="h-5 w-5" />, color: 'warning' },
    { labelKey: 'appointment.stats.approved', value: appointments.filter(a => a.status === 'approved').length, icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
    { labelKey: 'appointment.stats.rejected', value: appointments.filter(a => a.status === 'rejected').length, icon: <XCircle className="h-5 w-5" />, color: 'error' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('appointment.title')}
        description={t('appointment.description')}
        breadcrumbs={[{ label: 'HRM', href: '/hrm' }, { label: t('appointment.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('exportExcel')}</Button>
            <Link to="/hrm/bo-nhiem/tao"><Button leftIcon={<Plus className="h-4 w-4" />}>{t('appointment.createAppointment')}</Button></Link>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.labelKey} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1] text-[rgb(var(--${s.color}))]`}>
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
        <Input
          placeholder={t('filter.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          wrapperClassName="w-72"
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          <option value="all">{t('filter.statusAll')}</option>
          <option value="pending">{t('appointment.status.pending')}</option>
          <option value="approved">{t('appointment.status.approved')}</option>
          <option value="rejected">{t('appointment.status.rejected')}</option>
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t('appointment.table.maHoSo')}</TableHeadCell>
            <TableHeadCell>{t('table.vienChuc')}</TableHeadCell>
            <TableHeadCell>{t('appointment.table.donVi')}</TableHeadCell>
            <TableHeadCell>{t('appointment.table.loai')}</TableHeadCell>
            <TableHeadCell>{t('appointment.table.fromPosition')}</TableHeadCell>
            <TableHeadCell>{t('appointment.table.toPosition')}</TableHeadCell>
            <TableHeadCell>{t('appointment.table.effectiveDate')}</TableHeadCell>
            <TableHeadCell>{t('table.trangThai')}</TableHeadCell>
            <TableHeadCell>{t('table.thaoTac')}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={9} message={t('empty.noAppointments')} />
          ) : (
            paged.map((a) => {
              const tc = TYPE_CONFIG[a.type] || { color: 'neutral' };
              return (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs text-[rgb(var(--text-secondary))]">{a.code}</TableCell>
                  <TableCell>
                    <p className="font-medium text-[rgb(var(--text-primary))]">{a.name}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{t('appointment.table.requester')}: {a.requester}</p>
                  </TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{a.dept}</TableCell>
                  <TableCell><Badge variant={tc.color as 'info' | 'primary' | 'success'} size="sm">{t(tc.labelKey)}</Badge></TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{a.from}</TableCell>
                  <TableCell className="font-medium text-[rgb(var(--text-primary))]">{a.to}</TableCell>
                  <TableCell className="text-[rgb(var(--text-secondary))]">{a.date}</TableCell>
                  <TableCell><Badge variant={statusVariant(a.status) as 'warning'|'success'|'error'} dot size="sm">{statusLabel(a.status)}</Badge></TableCell>
                  <TableCell>
                    {a.status === 'pending' ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost" size="sm"
                          className="text-[rgb(var(--success))] hover:text-[rgb(var(--success))] hover:bg-[rgb(var(--success)/0.08)]"
                          leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                          onClick={() => setConfirmAction({ id: a.id, type: 'approve' })}
                        >
                          {t('action.approve')}
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="text-[rgb(var(--error))] hover:text-[rgb(var(--error))] hover:bg-[rgb(var(--error)/0.08)]"
                          leftIcon={<XCircle className="h-3.5 w-3.5" />}
                          onClick={() => setConfirmAction({ id: a.id, type: 'reject' })}
                        >
                          {t('action.reject')}
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedAppointment(a); setDetailOpen(true); }}>{t('action.viewDetail')}</Button>
                    )}
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

      {/* Modal Chi tiet ho so bo nhiem */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={t('appointment.modal.detailTitle')}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>{t('close')}</Button>
            <Button variant="primary" leftIcon={<Download className="h-4 w-4" />} onClick={() => setDetailOpen(false)}>{t('appointment.modal.downloadQD')}</Button>
          </div>
        }
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--primary)/0.04] border border-[rgb(var(--primary)/0.2]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)) text-lg font-bold text-white">
                {selectedAppointment.name.split(' ').slice(-2).map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-[rgb(var(--text-primary))]">{selectedAppointment.name}</p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{selectedAppointment.code} · {selectedAppointment.dept}</p>
              </div>
              <Badge variant={statusVariant(selectedAppointment.status) as 'warning'|'success'|'error'} dot className="ml-auto">{statusLabel(selectedAppointment.status)}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: t('appointment.modal.appointmentType'), value: t(TYPE_CONFIG[selectedAppointment.type]?.labelKey || selectedAppointment.type) },
                { label: t('appointment.table.fromPosition'), value: selectedAppointment.from },
                { label: t('appointment.table.toPosition'), value: selectedAppointment.to },
                { label: t('appointment.table.effectiveDate'), value: selectedAppointment.date },
                { label: t('appointment.table.requester'), value: selectedAppointment.requester },
                { label: t('table.trangThai'), value: statusLabel(selectedAppointment.status) },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 border-b border-[rgb(var(--border)/0.4] pb-2">
                  <span className="shrink-0 text-[rgb(var(--text-muted))] w-36">{label}:</span>
                  <span className="font-medium text-[rgb(var(--text-primary))]">{value}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-1.5">{t('appointment.modal.reason')}</p>
              <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-3 text-sm text-[rgb(var(--text-secondary))]">
                {selectedAppointment.reason}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] text-center text-[rgb(var(--text-muted))]">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{t('appointment.modal.decisionFile')}: <strong className="font-mono">{selectedAppointment.code}.pdf</strong></p>
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
          setConfirmAction(null);
        }}
        title={confirmAction?.type === 'approve' ? t('appointment.modal.approveTitle') : t('appointment.modal.rejectTitle')}
        description={confirmAction?.type === 'approve' ? t('appointment.modal.approveDesc') : t('appointment.modal.rejectDesc')}
        confirmText={confirmAction?.type === 'approve' ? t('appointment.modal.confirmApprove') : t('appointment.modal.confirmReject')}
        variant={confirmAction?.type === 'reject' ? 'danger' : 'primary'}
      />
    </div>
  );
}
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Send } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui';
import { useCreateLeave, useLeaveBalance, useLeaveList } from '@/hooks/useLeave';
import { useAuthStore } from '@/stores/authStore';
import type { LeaveRequest } from '@/services/leave.service';

const LEAVE_TYPES = [
  { id: 'annual', labelKey: 'leaveRequestForm.leaveTypeAnnual', color: 'primary' },
  { id: 'sick', labelKey: 'leaveRequestForm.leaveTypeSick', color: 'warning' },
  { id: 'unpaid', labelKey: 'leaveRequestForm.leaveTypeUnpaid', color: 'neutral' },
  { id: 'maternity', labelKey: 'leaveRequestForm.leaveTypeMaternity', color: 'accent' },
  { id: 'paternity', labelKey: 'leaveRequestForm.leaveTypePaternity', color: 'accent' },
  { id: 'other', labelKey: 'leaveRequestForm.leaveTypeOther', color: 'info' },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error'; labelKey: string }> = {
  approved: { variant: 'success', labelKey: 'leave.status.approved' },
  pending: { variant: 'warning', labelKey: 'leave.status.pending' },
  rejected: { variant: 'error', labelKey: 'leave.status.rejected' },
};

export default function LeaveRequestForm() {
  const { t } = useTranslation('hrm');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const createLeave = useCreateLeave();
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Fetch leave balance for current user (if user has a staff/VienChuc record)
  const { data: balanceData } = useLeaveBalance((user as any)?.vienChucId || (user as any)?.employeeId || '');
  const balance = balanceData;

  // Fetch leave history for current user
  const { data: historyData } = useLeaveList({
    page: 1,
    pageSize: 10,
    employeeId: (user as any)?.vienChucId || (user as any)?.employeeId || undefined,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });
  const leaveHistory = historyData?.data ?? [];

  function calculateDays() {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e < s) return 0;
    return Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1;
  }

  const days = calculateDays();

  const handleSubmit = () => {
    setSubmitError('');
    if (!leaveType || !startDate || !endDate || days <= 0 || !reason) {
      setSubmitError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (!user?.id) {
      setSubmitError('Không xác định được người dùng');
      return;
    }
    createLeave.mutate(
      {
        employeeId: user.id,
        type: leaveType,
        startDate,
        endDate,
        reason,
      } as Partial<LeaveRequest>,
      {
        onSuccess: () => {
          navigate('/hrm/nghi-phep');
        },
        onError: (err: any) => {
          setSubmitError(err?.response?.data?.error?.message || 'Gửi đơn thất bại');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('leaveRequestForm.title')}
        description={t('leaveRequestForm.descriptionStaff')}
        breadcrumbs={[
          { label: 'HRM', href: '/hrm' },
          { label: t('leave.breadcrumb'), href: '/hrm/nghi-phep' },
          { label: t('leaveRequestForm.breadcrumb') },
        ]}
        actions={
          <div className="flex gap-2">
            <Link to="/hrm/nghi-phep">
              <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>{t('leaveRequestForm.btn.back')}</Button>
            </Link>
          </div>
        }
      />

      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('leaveRequestForm.formTitle')}</h3>
            </div>
            <CardContent className="space-y-5 p-5">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                  {t('leaveRequestForm.leaveType')} <span className="text-[rgb(var(--error))]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {LEAVE_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setLeaveType(type.id)}
                      className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${
                        leaveType === type.id
                          ? `border-[rgb(var(--${type.color}))] bg-[rgb(var(--${type.color})/0.1)] text-[rgb(var(--text-primary))]`
                          : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary-light))]'
                      }`}
                    >
                      {t(type.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label={t('leaveRequestForm.fromDate')} required error={startDate && endDate && days < 0 ? t('leaveRequestForm.dateError') : undefined}>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </FormField>
                <FormField label={t('leaveRequestForm.toDate')} required>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </FormField>
              </div>

              {days > 0 && (
                <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 ${
                  days > 12
                    ? 'border-[rgb(var(--error)/0.3)] bg-[rgb(var(--error)/0.05)]'
                    : 'border-[rgb(var(--success)/0.3)] bg-[rgb(var(--success)/0.05)]'
                }`}>
                  <Calendar className={`h-4 w-4 ${days > 12 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--success))]'}`} />
                  <div>
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                      {days} {t('leaveRequestForm.daysSummary')} {days > 12 ? t('leaveRequestForm.daysSummaryExceed') : ''}
                    </p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">
                      {t('leaveRequestForm.annualLeaveRemaining')}: 12 {t('leaveRequestForm.daysSummary')}
                    </p>
                  </div>
                </div>
              )}

              <FormField label={t('leaveRequestForm.reason')} required>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('leaveRequestForm.reasonPlaceholder')}
                  rows={4}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3] resize-none"
                />
              </FormField>

              <div className="flex justify-end gap-3 pt-2 border-t border-[rgb(var(--border)/0.6)]">
                <Button variant="outline" onClick={() => navigate('/hrm/nghi-phep')}>{t('leaveRequestForm.btn.cancel')}</Button>
                <Button leftIcon={<Send className="h-4 w-4" />}
                  disabled={createLeave.isPending || !leaveType || !startDate || !endDate || days <= 0 || !reason}
                  loading={createLeave.isPending}
                  onClick={handleSubmit}>
                  {createLeave.isPending ? 'Đang gửi...' : t('leaveRequestForm.btn.submit')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h4 className="font-semibold text-[rgb(var(--text-primary))]">{t('leaveRequestForm.balance.title')}</h4>
              {(() => {
                const annual = balance?.byType?.find((b) => b.type === 'annual');
                const entitled = annual?.entitled ?? 12;
                const used = annual?.used ?? 0;
                const remaining = annual?.remaining ?? 12;
                return [
                  { labelKey: 'leaveRequestForm.balance.total', value: entitled, color: 'primary' },
                  { labelKey: 'leaveRequestForm.balance.used', value: used, color: 'warning' },
                  { labelKey: 'leaveRequestForm.balance.remaining', value: remaining, color: 'success' },
                ].map((item) => (
                  <div key={item.labelKey} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-[rgb(var(--text-secondary))]">{t(item.labelKey)}</span>
                      <span className="font-semibold text-[rgb(var(--text-primary))]">
                        {item.value} {t('leaveRequestForm.daysSummary')}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[rgb(var(--success))]"
                        style={{ width: entitled > 0 ? `${(remaining / entitled) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                ));
              })()}
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h4 className="font-semibold text-[rgb(var(--text-primary))]">{t('leaveRequestForm.history.title')} {balance?.year ?? new Date().getFullYear()}</h4>
            </div>
            <div className="divide-y divide-[rgb(var(--border)/0.4)]">
              {leaveHistory.length === 0 ? (
                <p className="text-sm text-[rgb(var(--text-muted))] px-5 py-4">Chưa có lịch sử nghỉ phép.</p>
              ) : (
                leaveHistory.map((h: any) => {
                  const sc = STATUS_CONFIG[h.status] ?? { variant: 'neutral', labelKey: 'leave.status.pending' };
                  return (
                    <div key={h._id} className="px-5 py-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{h.reason}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                            {h.startDate ? new Date(h.startDate).toLocaleDateString('vi-VN') : ''} — {h.endDate ? new Date(h.endDate).toLocaleDateString('vi-VN') : ''}
                          </p>
                        </div>
                        <Badge variant={sc.variant} size="sm">{t(sc.labelKey)}</Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
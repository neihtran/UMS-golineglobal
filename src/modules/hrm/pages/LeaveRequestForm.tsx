import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Send, Eye } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui';

const MOCK_VC = {
  id: 'vc001', code: 'VC-2020-001', name: 'Nguyen Hoang Long', dept: 'Khoa CNTT',
  position: 'Truong khoa', availableDays: 12, usedDays: 8, pendingDays: 0,
};

const LEAVE_TYPES = [
  { id: 'annual', labelKey: 'leaveRequestForm.leaveTypeAnnual', color: 'primary' },
  { id: 'sick', labelKey: 'leaveRequestForm.leaveTypeSick', color: 'warning' },
  { id: 'unpaid', labelKey: 'leaveRequestForm.leaveTypeUnpaid', color: 'neutral' },
  { id: 'maternity', labelKey: 'leaveRequestForm.leaveTypeMaternity', color: 'accent' },
  { id: 'paternity', labelKey: 'leaveRequestForm.leaveTypePaternity', color: 'accent' },
  { id: 'other', labelKey: 'leaveRequestForm.leaveTypeOther', color: 'info' },
];

const LEAVE_HISTORY = [
  { id: 'l1', type: 'annual', startDate: '2026-04-15', endDate: '2026-04-19', days: 5, reason: 'Nghi phep nam 2026', status: 'approved', approvedBy: 'TS. Tran Thi Lan', approvedAt: '2026-04-10' },
  { id: 'l2', type: 'sick', startDate: '2026-02-03', endDate: '2026-02-04', days: 2, reason: 'Om dau', status: 'approved', approvedBy: 'TS. Tran Thi Lan', approvedAt: '2026-02-03' },
  { id: 'l3', type: 'annual', startDate: '2025-12-25', endDate: '2025-12-31', days: 7, reason: 'Nghi Tet Duong lich', status: 'approved', approvedBy: 'PGS.TS. Hoang Thi Lan', approvedAt: '2025-12-20' },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error'; labelKey: string }> = {
  approved: { variant: 'success', labelKey: 'leave.status.approved' },
  pending: { variant: 'warning', labelKey: 'leave.status.pending' },
  rejected: { variant: 'error', labelKey: 'leave.status.rejected' },
};

export default function LeaveRequestForm() {
  const { t } = useTranslation('hrm');
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  function calculateDays() {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e < s) return 0;
    return Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1;
  }

  const days = calculateDays();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('leaveRequestForm.title')}
        description={`${t('leaveRequestForm.descriptionStaff')}: ${MOCK_VC.name} · ${MOCK_VC.dept}`}
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
            <Button variant="outline" leftIcon={<Eye className="h-4 w-4" />}>{t('leaveRequestForm.btn.viewDetail')}</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                  days > MOCK_VC.availableDays
                    ? 'border-[rgb(var(--error)/0.3)] bg-[rgb(var(--error)/0.05)]'
                    : 'border-[rgb(var(--success)/0.3)] bg-[rgb(var(--success)/0.05)]'
                }`}>
                  <Calendar className={`h-4 w-4 ${days > MOCK_VC.availableDays ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--success))]'}`} />
                  <div>
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                      {days} {t('leaveRequestForm.daysSummary')} {days > MOCK_VC.availableDays ? t('leaveRequestForm.daysSummaryExceed') : ''}
                    </p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">
                      {t('leaveRequestForm.annualLeaveRemaining')}: {MOCK_VC.availableDays} {t('leaveRequestForm.daysSummary')}
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
                <Button variant="outline">{t('leaveRequestForm.btn.cancel')}</Button>
                <Button leftIcon={<Send className="h-4 w-4" />}
                  disabled={!leaveType || !startDate || !endDate || days <= 0 || !reason}>
                  {t('leaveRequestForm.btn.submit')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h4 className="font-semibold text-[rgb(var(--text-primary))]">{t('leaveRequestForm.balance.title')}</h4>
              {[
                { labelKey: 'leaveRequestForm.balance.total', value: 20, color: 'primary' },
                { labelKey: 'leaveRequestForm.balance.used', value: MOCK_VC.usedDays, color: 'warning' },
                { labelKey: 'leaveRequestForm.balance.remaining', value: MOCK_VC.availableDays, color: 'success' },
              ].map((item) => (
                <div key={item.labelKey} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[rgb(var(--text-secondary))]">{t(item.labelKey)}</span>
                    <span className="font-semibold text-[rgb(var(--text-primary))]">{item.value} {t('leaveRequestForm.daysSummary')}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                    <div className="h-full rounded-full bg-[rgb(var(--success))]" style={{ width: `${(MOCK_VC.availableDays / 20) * 100}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h4 className="font-semibold text-[rgb(var(--text-primary))]">{t('leaveRequestForm.history.title')} 2026</h4>
            </div>
            <div className="divide-y divide-[rgb(var(--border)/0.4)]">
              {LEAVE_HISTORY.map((h) => {
                const sc = STATUS_CONFIG[h.status];
                return (
                  <div key={h.id} className="px-5 py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{h.reason}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                          {h.startDate} - {h.endDate} · {h.days} {t('leaveRequestForm.daysSummary')}
                        </p>
                      </div>
                      <Badge variant={sc.variant} size="sm">{t(sc.labelKey)}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
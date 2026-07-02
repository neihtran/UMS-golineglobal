import { CalendarPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const BALANCES = [
  { type: 'annual', label: 'Nghỉ phép năm', total: 12, used: 6, remaining: 6, color: '#16A34A' },
  { type: 'sick', label: 'Nghỉ ốm', total: 30, used: 2, remaining: 28, color: '#2D5D8A' },
  { type: 'unpaid', label: 'Nghỉ không lương', total: 0, used: 0, remaining: 0, color: '#94A3B8' },
  { type: 'maternity', label: 'Nghỉ thai sản', total: 180, used: 0, remaining: 180, color: '#7C3AED' },
];

const LEAVE_HISTORY = [
  { id: 'l1', type: 'annual', reason: 'Nghỉ phép năm', start: '10/03/2026', end: '14/03/2026', days: 5, status: 'approved', approver: 'PGS.TS. Nguyễn Văn A' },
  { id: 'l2', type: 'sick', reason: 'Ốm đau', start: '25/02/2026', end: '26/02/2026', days: 2, status: 'approved', approver: 'PGS.TS. Nguyễn Văn A' },
  { id: 'l3', type: 'annual', reason: 'Nghỉ Tết Nguyên đán', start: '20/01/2026', end: '29/01/2026', days: 8, status: 'approved', approver: 'PGS.TS. Nguyễn Văn A' },
  { id: 'l4', type: 'unpaid', reason: 'Việc gia đình', start: '05/04/2026', end: '07/04/2026', days: 3, status: 'rejected', approver: '—' },
];

const TYPE_LABELS: Record<string, string> = {
  annual: 'Nghỉ phép năm', sick: 'Nghỉ ốm', unpaid: 'Nghỉ không lương', maternity: 'Nghỉ thai sản',
};

export default function LeaveBalance() {
  const { t } = useTranslation('hrm');
  const pieData = BALANCES.filter((b) => b.remaining > 0).map((b) => ({ name: b.label, value: b.remaining, color: b.color }));
  const currentYear = new Date().getFullYear();

  const statusVariant = (s: string) =>
    s === 'approved' ? 'success' : s === 'rejected' ? 'error' : 'warning';
  const statusLabel = (s: string) =>
    s === 'approved' ? t('leave.status.approved') :
    s === 'rejected' ? t('leave.status.rejected') : t('leave.status.pending');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('leaveBalance.title')}
        description={t('leaveBalance.description')}
        breadcrumbs={[
          { label: 'HRM', href: '/hrm' },
          { label: t('leave.breadcrumb'), href: '/hrm/nghi-phep' },
          { label: t('leaveBalance.breadcrumb') },
        ]}
        actions={
          <Button leftIcon={<CalendarPlus className="h-4 w-4" />}>{t('leaveBalance.addBalance')}</Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Pie chart */}
        <Card className="lg:col-span-1">
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('leaveBalance.overview')}</h3>
          </div>
          <CardContent className="flex flex-col items-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={pieData[i].color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v} ngày`} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2 w-full">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs text-[rgb(var(--text-secondary))]">{d.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-[rgb(var(--text-primary))]">{d.value}d</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Balances */}
        <div className="lg:col-span-3 space-y-4">
          {BALANCES.map((b) => (
            <Card key={b.type}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ background: b.color }} />
                    <div>
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{b.label}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{t('leaveBalance.usedDays', { used: b.used, total: b.total })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{b.remaining}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{t('leaveBalance.daysRemaining')}</p>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-[rgb(var(--bg-base))] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(b.used / b.total) * 100}%`, background: b.color }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* History */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('leaveBalance.history', { year: currentYear })}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--border)/0.6)]">
                {[
                  t('leaveBalance.table.type'), t('leaveBalance.table.reason'),
                  t('leaveBalance.table.from'), t('leaveBalance.table.to'),
                  t('leaveBalance.table.days'), t('leaveBalance.table.status'),
                  t('leaveBalance.table.approver'),
                ].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
              {LEAVE_HISTORY.map((l) => (
                  <tr key={l.id} className="hover:bg-[rgb(var(--bg-hover))]">
                    <td className="px-4 py-3"><Badge variant="neutral" size="sm">{TYPE_LABELS[l.type]}</Badge></td>
                    <td className="px-4 py-3 text-[rgb(var(--text-primary))]">{l.reason}</td>
                    <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{l.start}</td>
                    <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{l.end}</td>
                    <td className="px-4 py-3 font-semibold text-[rgb(var(--text-primary))]">{l.days}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant(l.status) as 'success'|'error'|'warning'|'neutral'} dot size="sm">{statusLabel(l.status)}</Badge></td>
                    <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{l.approver}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

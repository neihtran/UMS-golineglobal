import { CalendarPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, Badge, Button, TableSkeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { leaveService } from '@/services/leave.service';

const STATUS_VARIANT: Record<string, 'success' | 'error' | 'warning' | 'neutral'> = {
  approved: 'success', rejected: 'error', pending: 'warning', cancelled: 'neutral',
};

const TYPE_LABELS: Record<string, string> = {
  annual: 'Nghỉ phép năm', sick: 'Nghỉ ốm', unpaid: 'Nghỉ không lương', maternity: 'Nghỉ thai sản', paternity: 'Nghỉ phép cha', other: 'Khác',
};

export default function LeaveBalance() {
  const { t } = useTranslation('hrm');
  const { id: employeeId } = useParams<{ id: string }>();
  const [pieData, setPieData] = useState<any[]>([]);

  const { data: balanceData, isLoading } = useQuery({
    queryKey: ['leave', 'balance', employeeId],
    queryFn: () => leaveService.getLeaveBalance(employeeId!).then((r) => r.data.data),
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (balanceData?.byType) {
      setPieData(balanceData.byType.filter((b: any) => b.remaining > 0).map((b: any) => ({
        name: b.label,
        value: b.remaining,
        color: b.color,
      })));
    }
  }, [balanceData]);

  const currentYear = balanceData?.year ?? new Date().getFullYear();
  const balances = balanceData?.byType ?? [];

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

      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : (
        <>
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
              {balances.map((b: any) => (
                <Card key={b.type}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ background: b.color }} />
                        <div>
                          <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{b.label}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">{t('leaveBalance.usedDays', { used: b.used, total: b.entitled })}</p>
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
                        style={{ width: `${b.entitled > 0 ? (b.used / b.entitled) * 100 : 0}%`, background: b.color }}
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
                  {!balanceData?.history || balanceData.history.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-[rgb(var(--text-muted))]">Chưa có lịch sử nghỉ phép</td></tr>
                  ) : (
                    (balanceData.history as any[]).map((l) => (
                      <tr key={l.id} className="hover:bg-[rgb(var(--bg-hover))]">
                        <td className="px-4 py-3"><Badge variant="neutral" size="sm">{TYPE_LABELS[l.type] ?? l.type}</Badge></td>
                        <td className="px-4 py-3 text-[rgb(var(--text-primary))]">{l.reason}</td>
                        <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{l.start}</td>
                        <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{l.end}</td>
                        <td className="px-4 py-3 font-semibold text-[rgb(var(--text-primary))]">{l.days}</td>
                        <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[l.status] ?? 'neutral'} dot size="sm">{l.status}</Badge></td>
                        <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{l.approver}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

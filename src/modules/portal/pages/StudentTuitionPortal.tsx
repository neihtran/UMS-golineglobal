import { useTranslation } from 'react-i18next';
import {
  Download,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const PAYMENT_STATUS: Record<string, 'success' | 'error' | 'warning' | 'neutral'> = {
  paid: 'success',
  unpaid: 'error',
  partial: 'warning',
  exempted: 'neutral',
  deferred: 'neutral',
};

const TUITION_HISTORY = [
  { semester: 'Học kỳ 1, 2025–2026', total: 15000000, paid: 15000000, remaining: 0, status: 'paid', dueDate: '15/09/2025', paidAt: '10/09/2025' },
  { semester: 'Học kỳ 2, 2025–2026', total: 15000000, paid: 5000000, remaining: 10000000, status: 'partial', dueDate: '15/02/2026', paidAt: '12/02/2026' },
  { semester: 'Học kỳ 1, 2024–2025', total: 14000000, paid: 14000000, remaining: 0, status: 'paid', dueDate: '15/09/2024', paidAt: '08/09/2024' },
];

const PAYMENT_HISTORY = [
  { id: 'p1', semester: 'HK2/2025-2026', method: 'Chuyển khoản', amount: 5000000, date: '12/02/2026', status: 'partial' },
  { id: 'p2', semester: 'HK1/2025-2026', method: 'Tiền mặt', amount: 15000000, date: '10/09/2025', status: 'paid' },
  { id: 'p3', semester: 'HK2/2024-2025', method: 'Chuyển khoản', amount: 14000000, date: '15/01/2025', status: 'paid' },
];

function formatVND(v: number) {
  return v.toLocaleString('vi-VN');
}

export default function StudentTuitionPortal() {
  const { t } = useTranslation('portal');
  const totalDebt = TUITION_HISTORY.reduce((sum, tu) => sum + tu.remaining, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('tuition.title')}
        description={t('tuition.description')}
        breadcrumbs={[{ label: 'PORTAL' }, { label: t('tuition.breadcrumb') }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('tuition.exportInvoice')}</Button>
            <Button leftIcon={<CreditCard className="h-4 w-4" />}>{t('tuition.payNow')}</Button>
          </div>
        }
      />

      {totalDebt > 0 && (
        <Card className="border-[rgb(var(--warning)/0.5)]">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertTriangle className="h-5 w-5 text-[rgb(var(--warning))]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{t('tuition.debtAlert')}</p>
              <p className="text-xs text-[rgb(var(--text-muted))]">{t('tuition.debtReminder')}</p>
            </div>
            <p className="text-lg font-bold text-[rgb(var(--error))]">{formatVND(totalDebt)}đ</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: t('tuition.totalTuition'), value: `${formatVND(TUITION_HISTORY.reduce((s, tu) => s + tu.total, 0))}đ`, icon: <BookOpen className="h-5 w-5" />, color: 'primary' },
          { label: t('tuition.paid'), value: `${formatVND(TUITION_HISTORY.reduce((s, tu) => s + tu.paid, 0))}đ`, icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
          { label: t('tuition.remaining'), value: `${formatVND(totalDebt)}đ`, icon: <CreditCard className="h-5 w-5" />, color: totalDebt > 0 ? 'error' : 'success' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
                <p className="text-lg font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('tuition.paymentHistory')}</h3>
        </div>
        <div className="divide-y divide-[rgb(var(--border)/0.4)]">
          {PAYMENT_HISTORY.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)]">
                  <CreditCard className="h-5 w-5 text-[rgb(var(--primary))]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{p.semester}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{p.method} · {p.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[rgb(var(--text-primary))]">{formatVND(p.amount)}đ</p>
                <Badge variant={PAYMENT_STATUS[p.status] ?? 'neutral'} size="sm">{t(`tuition.status.${p.status}`)}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('tuition.semesterDetail')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--border)/0.6)]">
                {[t('tuition.table.semester'), t('tuition.table.totalDebt'), t('tuition.table.paidAmount'), t('tuition.table.remainingAmount'), t('tuition.table.dueDate'), t('tuition.table.status')].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
              {TUITION_HISTORY.map((tu) => (
                <tr key={tu.semester} className="hover:bg-[rgb(var(--bg-hover))]">
                  <td className="px-4 py-3 text-sm font-medium text-[rgb(var(--text-primary))]">{tu.semester}</td>
                  <td className="px-4 py-3 text-sm">{formatVND(tu.total)}đ</td>
                  <td className="px-4 py-3 text-sm text-[rgb(var(--success))]">{formatVND(tu.paid)}đ</td>
                  <td className={`px-4 py-3 text-sm font-medium ${tu.remaining > 0 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--success))]'}`}>{formatVND(tu.remaining)}đ</td>
                  <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{tu.dueDate}</td>
                  <td><Badge variant={PAYMENT_STATUS[tu.status] ?? 'neutral'} size="sm">{t(`tuition.status.${tu.status}`)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

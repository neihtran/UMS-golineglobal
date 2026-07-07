import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  Bell,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTuitionList, useExpenditureList } from '@/hooks/useFin';

function formatVND(v: number) {
  if (!Number.isFinite(v)) return '0';
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)} tỷ`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)} triệu`;
  return `${v.toLocaleString('vi-VN')}đ`;
}

const CATEGORY_LABELS: Record<string, string> = {
  personnel: 'Lương',
  equipment: 'Thiết bị',
  infrastructure: 'Đầu tư',
  research: 'NCKH',
  training: 'Đào tạo',
  student_support: 'Học bổng',
  administrative: 'Vận hành',
  other: 'Khác',
};

function getExpenditureDate(e: { date?: string; requestDate?: string; createdAt?: string }) {
  return e.date || e.requestDate || e.createdAt || '';
}

function abbreviateMonth(date: Date) {
  return `T${date.getMonth() + 1}`;
}

export default function FINDashboard() {
  const { t } = useTranslation('fin');

  const tuitionQuery = useTuitionList({ page: 1, pageSize: 1000 });
  const expenditureQuery = useExpenditureList({ page: 1, pageSize: 1000 });

  const tuitionList = tuitionQuery.data?.data ?? [];
  const expenditureList = expenditureQuery.data?.data ?? [];

  const tuitionStats = useMemo(() => {
    const totalCollected = tuitionList.reduce((sum: number, item: any) => sum + (item.paidAmount ?? item.amountPaid ?? item.paid ?? 0), 0);
    const totalAmount = tuitionList.reduce((sum: number, item: any) => sum + (item.amount ?? item.totalAmount ?? item.total ?? 0), 0);
    const debt = Math.max(totalAmount - totalCollected, 0);
    const unpaidCount = tuitionList.filter((item: any) => item.status === 'unpaid' || item.status === 'overdue').length;
    return { totalCollected, totalAmount, debt, unpaidCount, total: tuitionList.length };
  }, [tuitionList]);

  const expenditureStats = useMemo(() => {
    const totalExpenditure = expenditureList.reduce((sum: number, item: any) => sum + (item.amount ?? 0), 0);
    const approved = expenditureList.filter((item: any) => item.status === 'approved' || item.status === 'completed').reduce((sum: number, item: any) => sum + (item.amount ?? 0), 0);
    return { totalExpenditure, approved };
  }, [expenditureList]);

  const cashflow = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};
    tuitionList.forEach((item: any) => {
      const dateStr = item.paidAt || item.createdAt;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return;
      const key = abbreviateMonth(d);
      const paid = item.paidAmount ?? item.amountPaid ?? item.paid ?? 0;
      months[key] = months[key] || { income: 0, expense: 0 };
      months[key].income += paid;
    });
    expenditureList.forEach((item: any) => {
      const dateStr = getExpenditureDate(item);
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return;
      const key = abbreviateMonth(d);
      const amount = item.amount ?? 0;
      months[key] = months[key] || { income: 0, expense: 0 };
      months[key].expense += amount;
    });
    const order = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
    return order.filter((m) => months[m]).map((m) => ({ month: m, income: months[m].income / 1e9, expense: months[m].expense / 1e9 }));
  }, [tuitionList, expenditureList]);

  const tuitionByMajor = useMemo(() => {
    const buckets: Record<string, number> = {};
    tuitionList.forEach((item: any) => {
      const key = item.className || item.class || item.departmentName || item.department || 'Khác';
      const amount = item.amount ?? item.totalAmount ?? item.total ?? 0;
      buckets[key] = (buckets[key] || 0) + amount;
    });
    return Object.entries(buckets)
      .map(([name, amount]) => ({ name, amount: amount / 1e9 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [tuitionList]);

  const topExpenses = useMemo(() => {
    return [...expenditureList]
      .sort((a: any, b: any) => (b.amount ?? 0) - (a.amount ?? 0))
      .slice(0, 5)
      .map((item: any) => ({
        desc: item.name || item.title || 'Phiếu chi',
        amount: item.amount ?? 0,
        date: getExpenditureDate(item),
        cat: CATEGORY_LABELS[item.category] || item.category || 'Khác',
      }));
  }, [expenditureList]);

  const isLoading = tuitionQuery.isLoading || expenditureQuery.isLoading;

  const heroStats = [
    {
      label: t('dashboard.statTuition'),
      value: formatVND(tuitionStats.totalCollected),
      target: formatVND(tuitionStats.totalAmount),
      pct: tuitionStats.totalAmount > 0 ? Math.round((tuitionStats.totalCollected / tuitionStats.totalAmount) * 100) : 0,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'primary',
    },
    {
      label: t('dashboard.statSalary'),
      value: formatVND(expenditureStats.totalExpenditure),
      sub: t('dashboard.statSalarySub'),
      pct: 100,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'success',
    },
    {
      label: t('dashboard.statBudget'),
      value: formatVND(expenditureStats.approved),
      pct: expenditureStats.totalExpenditure > 0 ? Math.round((expenditureStats.approved / expenditureStats.totalExpenditure) * 100) : 0,
      icon: <TrendingDown className="h-5 w-5" />,
      color: 'accent',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        breadcrumbs={[{ label: 'FIN' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>
            <Link to="/fin/hoc-phi">
              <Button leftIcon={<DollarSign className="h-4 w-4" />}>{t('tuitionManagement')}</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {heroStats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                  {s.icon}
                </div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              </div>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{isLoading ? '—' : s.value}</p>
              {s.target && <p className="text-xs text-[rgb(var(--text-muted))]">/ {isLoading ? '—' : s.target}</p>}
              {s.sub && <p className="text-xs text-[rgb(var(--success))] font-medium mt-0.5">{s.sub}</p>}
              <div className="mt-3 h-2 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                <div
                  className={`h-full rounded-full bg-[rgb(var(--${s.color}))]`}
                  style={{ width: `${s.pct}%` }}
                />
              </div>
              <p className="text-[10px] text-[rgb(var(--text-muted))] mt-1">{s.pct}%</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-[rgb(var(--error)/0.3)] bg-[rgb(var(--error)/0.05)] px-4 py-3">
        <AlertTriangle className="h-5 w-5 text-[rgb(var(--error))] shrink-0" />
        <p className="text-sm text-[rgb(var(--text-primary))]">
          <strong>{t('alert.title')}</strong>
          {' '}{tuitionStats.unpaidCount > 0 ? `${tuitionStats.unpaidCount} sinh viên chưa thanh toán` : t('alert.debt')}
        </p>
        <Button size="sm" variant="outline" className="ml-auto shrink-0" leftIcon={<Bell className="h-3.5 w-3.5" />}>
          {t('alert.remind')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('chart.cashflow')}</h3>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[rgb(var(--success))]" />
                  <span className="text-[rgb(var(--text-muted))]">{t('chart.income')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[rgb(var(--error))]" />
                  <span className="text-[rgb(var(--text-muted))]">{t('chart.expense')}</span>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="h-64">
            {cashflow.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-[rgb(var(--text-muted))]">
                {isLoading ? 'Đang tải...' : 'Chưa có dữ liệu dòng tiền'}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashflow} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(1)}t`} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(2)} tỷ`} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="income" stroke="rgb(var(--success))" fill="rgb(var(--success)/0.1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" stroke="rgb(var(--error))" fill="rgb(var(--error)/0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('chart.tuitionByMajor')}</h3>
          </div>
          <CardContent className="h-64">
            {tuitionByMajor.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-[rgb(var(--text-muted))]">
                {isLoading ? 'Đang tải...' : 'Chưa có dữ liệu học phí'}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tuitionByMajor} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(1)}t`} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(2)} tỷ`} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="amount" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('topExpense.title')}</h3>
          <Badge variant="neutral">{t('topExpense.period')}</Badge>
        </div>
        <div className="divide-y divide-[rgb(var(--border)/0.5)]">
          {isLoading ? (
            <div className="px-5 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Đang tải...</div>
          ) : topExpenses.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Chưa có phiếu chi nào</div>
          ) : (
            topExpenses.map((e, i) => (
              <div key={`${e.desc}-${i}`} className="flex items-center gap-4 px-5 py-3 hover:bg-[rgb(var(--bg-hover))] transition-colors">
                <span className="h-6 w-6 rounded-full bg-[rgb(var(--bg-base))] flex items-center justify-center text-xs font-bold text-[rgb(var(--text-muted))] shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{e.desc}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{e.date ? new Date(e.date).toLocaleDateString('vi-VN') : '—'}</p>
                </div>
                <Badge variant="neutral" size="sm">{e.cat}</Badge>
                <p className="text-sm font-mono font-semibold text-[rgb(var(--text-primary))] shrink-0">
                  {formatVND(e.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

import { Link } from 'react-router-dom';
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

const CASHFLOW = [
  { month: 'T1', income: 14.2, expense: 3.1 },
  { month: 'T2', income: 2.8, expense: 3.3 },
  { month: 'T3', income: 1.5, expense: 3.0 },
  { month: 'T4', income: 0.8, expense: 2.9 },
  { month: 'T5', income: 0.6, expense: 3.2 },
  { month: 'T6', income: 0.4, expense: 3.2 },
];

const TUITION_BARS = [
  { name: 'CNTT', amount: 4.2 }, { name: 'Kinh tế', amount: 3.1 },
  { name: 'Luật', amount: 1.8 }, { name: 'Ngoại ngữ', amount: 2.2 },
  { name: 'Sư phạm', amount: 1.4 }, { name: 'Y dược', amount: 2.8 },
];

const TOP_EXPENSES = [
  { desc: 'Chi lương giảng viên T6', amount: 3200000000, date: '2026-06-25', cat: 'Lương' },
  { desc: 'Mua thiết bị phòng Lab CS3', amount: 850000000, date: '2026-06-20', cat: 'Đầu tư' },
  { desc: 'Điện nước tháng 6', amount: 320000000, date: '2026-06-18', cat: 'Vận hành' },
  { desc: 'Học bổng sinh viên K62', amount: 480000000, date: '2026-06-15', cat: 'Học bổng' },
  { desc: 'Bảo trì hệ thống mạng', amount: 210000000, date: '2026-06-10', cat: 'CNTT' },
];

function formatVND(v: number) {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)} tỷ`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)} triệu`;
  return `${v.toLocaleString('vi-VN')}đ`;
}

export default function FINDashboard() {
  const { t } = useTranslation('fin');

  const HERO_STATS = [
    { label: t('dashboard.statTuition'), value: '12.4 tỷ', target: '14.6 tỷ', pct: 85, icon: <DollarSign className="h-5 w-5" />, color: 'primary' },
    { label: t('dashboard.statSalary'), value: '3.2 tỷ', sub: t('dashboard.statSalarySub'), pct: 100, icon: <TrendingUp className="h-5 w-5" />, color: 'success' },
    { label: t('dashboard.statBudget'), value: '18.7 tỷ', pct: 60, icon: <TrendingDown className="h-5 w-5" />, color: 'accent' },
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
        {HERO_STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                  {s.icon}
                </div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              </div>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
              {s.target && <p className="text-xs text-[rgb(var(--text-muted))]">/ {s.target}</p>}
              {s.sub && <p className="text-xs text-[rgb(var(--success))] font-medium mt-0.5">{s.sub}</p>}
              <div className="mt-3 h-2 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[rgb(var(--${s.color}))]"
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
          {' '}{t('alert.debt')}
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CASHFLOW} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}t`} />
                <Tooltip formatter={(v: number) => `${v} tỷ`} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="income" stroke="rgb(var(--success))" fill="rgb(var(--success)/0.1)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="rgb(var(--error))" fill="rgb(var(--error)/0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('chart.tuitionByMajor')}</h3>
          </div>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TUITION_BARS} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}t`} />
                <Tooltip formatter={(v: number) => `${v} tỷ`} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="amount" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('topExpense.title')}</h3>
          <Badge variant="neutral">{t('topExpense.period')}</Badge>
        </div>
        <div className="divide-y divide-[rgb(var(--border)/0.5)]">
          {TOP_EXPENSES.map((e, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-[rgb(var(--bg-hover))] transition-colors">
              <span className="h-6 w-6 rounded-full bg-[rgb(var(--bg-base))] flex items-center justify-center text-xs font-bold text-[rgb(var(--text-muted))] shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{e.desc}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">{e.date}</p>
              </div>
              <Badge variant="neutral" size="sm">{e.cat}</Badge>
              <p className="text-sm font-mono font-semibold text-[rgb(var(--text-primary))] shrink-0">
                {formatVND(e.amount)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

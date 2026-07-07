import { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, BarChart3, Activity } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from 'recharts';

const KPI_GROUPS = [
  { group: 'Đào tạo', items: [
    { id: 'k1', name: 'Tỷ lệ tốt nghiệp', value: 87.5, target: 85, unit: '%', trend: 'up' },
    { id: 'k2', name: 'Điểm TB đầu vào', value: 24.2, target: 24, unit: 'đ', trend: 'up' },
    { id: 'k3', name: 'Tỷ lệ việc làm sau TN', value: 92, target: 90, unit: '%', trend: 'up' },
    { id: 'k4', name: 'Số sinh viên đạt chuẩn đầu ra', value: 78, target: 80, unit: '%', trend: 'down' },
  ]},
  { group: 'Nhân sự', items: [
    { id: 'k5', name: 'Tỷ lệ GV có học hàm', value: 35, target: 30, unit: '%', trend: 'up' },
    { id: 'k6', name: 'CBNV đạt chuẩn năng lực', value: 68, target: 75, unit: '%', trend: 'down' },
  ]},
  { group: 'Tài chính', items: [
    { id: 'k7', name: 'Tỷ lệ thu học phí', value: 94.2, target: 95, unit: '%', trend: 'up' },
    { id: 'k8', name: 'Chi phí/đầu sinh viên', value: 42, target: 40, unit: 'tr', trend: 'down' },
  ]},
];

const PIE_DATA = [
  { name: 'Đạt', value: 5, color: 'rgb(var(--success))' },
  { name: 'Gần đạt', value: 3, color: 'rgb(var(--warning))' },
  { name: 'Chưa đạt', value: 2, color: 'rgb(var(--error))' },
];

const TREND_ICON = { up: <TrendingUp className="h-3.5 w-3.5 text-[rgb(var(--success))]" />, down: <TrendingDown className="h-3.5 w-3.5 text-[rgb(var(--error))]" />, stable: <Minus className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" /> };

function kpiVariant(value: number, target: number) {
  if (value >= target) return 'success';
  if (value >= target * 0.9) return 'warning';
  return 'error';
}

export default function KPIsPage() {
  const [search, setSearch] = useState('');

  const filtered = KPI_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((k) => !search || k.name.toLowerCase().includes(search.toLowerCase())),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chỉ số KPIs"
        description="Theo dõi & đánh giá hiệu suất hệ thống"
        breadcrumbs={[{ label: 'BI', href: '/bi' }, { label: 'Chỉ số KPIs' }]}
        actions={<Button variant="outline" size="sm">Xuất báo cáo</Button>}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 lg:grid-cols-6">
        {[
          { label: 'Tổng KPIs', value: '10', icon: <BarChart3 className="h-4 w-4"  animationDuration={1500} animationEasing="ease-out" radius={[4, 4, 0, 0]} />, color: 'primary' },
          { label: 'Đạt', value: '5', icon: <TrendingUp className="h-4 w-4" />, color: 'success' },
          { label: 'Gần đạt', value: '3', icon: <Activity className="h-4 w-4" />, color: 'warning' },
          { label: 'Chưa đạt', value: '2', icon: <TrendingDown className="h-4 w-4" />, color: 'error' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>{s.icon}</div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm chỉ số..." className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {filtered.map((g) => (
            <div key={g.group}>
              <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-2">{g.group}</p>
              <div className="grid grid-cols-1 gap-3">
                {g.items.map((k) => {
                  const pct = Math.min(100, (k.value / k.target) * 100);
                  const variant = kpiVariant(k.value, k.target);
                  return (
                    <Card key={k.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{k.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[rgb(var(--text-muted))]">Mục tiêu: {k.target}{k.unit}</span>
                            {TREND_ICON[k.trend as keyof typeof TREND_ICON]}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-lg font-bold text-[rgb(var(--${variant}))]`}>{k.value}{k.unit}</span>
                              <Badge variant={variant} size="sm">{pct >= 100 ? 'Đạt' : pct >= 90 ? 'Gần đạt' : 'Chưa'}</Badge>
                            </div>
                            <div className="h-2 w-full rounded-full bg-[rgb(var(--border))] overflow-hidden">
                              <div className={`h-full rounded-full bg-[rgb(var(--${variant}))]`} style={{ width: `${Math.min(100, pct)}%` }} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Tổng quan KPIs</h3>
          </div>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart animationDuration={1500} animationEasing="ease-out">
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3} animationDuration={1500} animationEasing="ease-out">
                  {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} KPIs`, '']} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 w-full">
              {PIE_DATA.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-[rgb(var(--text-secondary))]">{d.name}</span>
                  </div>
                  <span className="font-bold text-[rgb(var(--text-primary))]">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, TrendingUp, DollarSign, PieChart, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const EXPENSES = [
  { id: 'e1', code: 'CP001', description: 'Chi phí vật liệu văn phòng Q1/2026', category: 'Vật liệu', amount: 45000000, dept: 'Phòng HC', date: '2026-03-15', status: 'approved' },
  { id: 'e2', code: 'CP002', description: 'Chi phí điện nước tháng 3/2026', category: 'Điện nước', amount: 125000000, dept: 'Phòng HC', date: '2026-03-31', status: 'approved' },
  { id: 'e3', code: 'CP003', description: 'Mua sắm thiết bị phòng lab CNTT', category: 'Thiết bị', amount: 320000000, dept: 'Khoa CNTT', date: '2026-04-05', status: 'pending' },
  { id: 'e4', code: 'CP004', description: 'Chi phí in ấn tài liệu học kỳ', category: 'In ấn', amount: 18000000, dept: 'Phòng Đào tạo', date: '2026-04-10', status: 'pending' },
  { id: 'e5', code: 'CP005', description: 'Sửa chữa hệ thống PCCC', category: 'Sửa chữa', amount: 75000000, dept: 'Phòng HC', date: '2026-04-12', status: 'rejected' },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Vật liệu': 'primary', 'Điện nước': 'info', 'Thiết bị': 'accent',
  'In ấn': 'warning', 'Sửa chữa': 'neutral',
};

function fmt(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
}

export default function ExpensesPage() {
  const { t } = useTranslation('fin');
  const navigate = useNavigate();
  const { pagination, setPage } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');

  const filtered = EXPENSES.filter((e) =>
    !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.code.toLowerCase().includes(search.toLowerCase()),
  );
  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
    approved: { variant: 'success', label: t('expenditure.status.approved') },
    pending: { variant: 'warning', label: t('expenditure.status.pending') },
    rejected: { variant: 'error', label: t('expenditure.status.rejected') },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('expenditure.title')}
        description={t('expenditure.description')}
        breadcrumbs={[{ label: 'FIN', href: '/fin' }, { label: t('expenditure.title') }]}
        actions={<><Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('expenditure.export')}</Button><Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/fin/chi-tieu/tao')}>{t('expenditure.add')}</Button></>}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: t('expenditure.statTotal'), value: fmt(583000000), color: 'error', icon: <DollarSign className="h-5 w-5" /> },
          { label: t('expenditure.statApproved'), value: fmt(170000000), color: 'success', icon: <TrendingUp className="h-5 w-5" /> },
          { label: t('expenditure.statPending'), value: fmt(338000000), color: 'warning', icon: <PieChart className="h-5 w-5" /> },
          { label: t('expenditure.statRejected'), value: fmt(75000000), color: 'neutral', icon: <DollarSign className="h-5 w-5" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-sm font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('expenditure.search')} className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2" />
        </div>
        <p className="text-sm text-[rgb(var(--text-muted))]">
          {t('expenditure.total')} <span className="font-bold text-[rgb(var(--text-primary))]">{fmt(total)}</span>
        </p>
      </div>
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgb(var(--border)/0.6)]">
              {['Mã', 'Mô tả', 'Loại', 'Phòng', 'Số tiền', 'Ngày', 'Trạng thái'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
            {paged.map((e) => (
              <tr key={e.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                <td className="px-4 py-3 text-xs font-mono text-[rgb(var(--text-secondary))]">{e.code}</td>
                <td className="px-4 py-3 text-sm text-[rgb(var(--text-primary))]">{e.description}</td>
                <td className="px-4 py-3"><Badge variant={CATEGORY_COLORS[e.category] as any} size="sm">{e.category}</Badge></td>
                <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{e.dept}</td>
                <td className="px-4 py-3 text-sm font-bold text-[rgb(var(--error))]">{fmt(e.amount)}</td>
                <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{e.date}</td>
                <td className="px-4 py-3"><Badge variant={STATUS_CONFIG[e.status].variant} dot size="sm">{STATUS_CONFIG[e.status].label}</Badge></td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/fin/chi-tieu/${e.id}`)}>{t('expenditure.detail')}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

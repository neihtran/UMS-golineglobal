import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, TrendingUp, DollarSign, PieChart, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useExpenditureList } from '@/hooks/useFin';

function fmt(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
}

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  draft: { variant: 'neutral', label: 'Nháp' },
  pending: { variant: 'warning', label: 'Chờ duyệt' },
  approved: { variant: 'success', label: 'Đã duyệt' },
  rejected: { variant: 'error', label: 'Từ chối' },
  completed: { variant: 'neutral', label: 'Hoàn thành' },
};

export default function ExpensesPage() {
  const { t } = useTranslation('fin');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const { data, isLoading } = useExpenditureList({
    search: search || undefined,
    status: status || undefined,
    page,
    pageSize,
  });

  const list = data?.data ?? [];

  const totalAmount = list.reduce((s: number, e: any) => s + (e.amount ?? 0), 0);
  const approvedAmount = list.filter((e: any) => e.status === 'approved').reduce((s: number, e: any) => s + (e.amount ?? 0), 0);
  const pendingAmount = list.filter((e: any) => e.status === 'pending').reduce((s: number, e: any) => s + (e.amount ?? 0), 0);
  const rejectedAmount = list.filter((e: any) => e.status === 'rejected').reduce((s: number, e: any) => s + (e.amount ?? 0), 0);

  if (isLoading && list.length === 0) {
    return <div className="flex items-center justify-center h-64"><p className="text-[rgb(var(--text-muted))]">Đang tải...</p></div>;
  }

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
          { label: 'Tổng chi', value: fmt(totalAmount), color: 'error', icon: <DollarSign className="h-5 w-5" /> },
          { label: 'Đã duyệt', value: fmt(approvedAmount), color: 'success', icon: <TrendingUp className="h-5 w-5" /> },
          { label: 'Chờ duyệt', value: fmt(pendingAmount), color: 'warning', icon: <PieChart className="h-5 w-5" /> },
          { label: 'Từ chối', value: fmt(rejectedAmount), color: 'neutral', icon: <DollarSign className="h-5 w-5" /> },
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
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2">
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>
      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border))] p-12 text-center">
          <p className="text-[rgb(var(--text-muted))]">Không có khoản chi nào</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgb(var(--border)/0.6)]">
                {['Mã', 'Tên khoản chi', 'Loại', 'Số tiền', 'Trạng thái'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
              {list.map((e: any) => {
                const sc = STATUS_CONFIG[e.status] || { variant: 'neutral' as const, label: e.status };
                return (
                  <tr key={e._id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-[rgb(var(--text-secondary))]">{e.name?.slice(0, 20)}</td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--text-primary))]">{e.name || '—'}</td>
                    <td className="px-4 py-3"><Badge variant="info" size="sm">{e.category || '—'}</Badge></td>
                    <td className="px-4 py-3 text-sm font-bold text-[rgb(var(--error))]">{fmt(e.amount ?? 0)}</td>
                    <td className="px-4 py-3"><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

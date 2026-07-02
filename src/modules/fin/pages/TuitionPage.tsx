import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, CreditCard, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const TUITIONS = [
  { id: 't1', studentCode: 'SV2026001', studentName: 'Nguyễn Văn An', class: 'CNTT-2026.1', semester: 'HK1 2026-2027', amount: 18500000, paid: 18500000, status: 'paid', paidAt: '2026-08-01' },
  { id: 't2', studentCode: 'SV2026002', studentName: 'Trần Thị Bình', class: 'CNTT-2026.1', semester: 'HK1 2026-2027', amount: 18500000, paid: 10000000, status: 'partial', paidAt: '2026-08-05' },
  { id: 't3', studentCode: 'SV2026003', studentName: 'Lê Minh Cường', class: 'CNTT-2026.1', semester: 'HK1 2026-2027', amount: 18500000, paid: 0, status: 'unpaid', paidAt: '' },
  { id: 't4', studentCode: 'SV2026004', studentName: 'Phạm Thu Dung', class: 'CNTT-2026.2', semester: 'HK1 2026-2027', amount: 18500000, paid: 18500000, status: 'paid', paidAt: '2026-08-02' },
  { id: 't5', studentCode: 'SV2026005', studentName: 'Hoàng Văn E', class: 'TOAN-2026.1', semester: 'HK1 2026-2027', amount: 18500000, paid: 5000000, status: 'partial', paidAt: '2026-08-08' },
  { id: 't6', studentCode: 'SV2026006', studentName: 'Vũ Thị F', class: 'CNTT-2026.1', semester: 'HK1 2026-2027', amount: 18500000, paid: 0, status: 'overdue', paidAt: '' },
];

function fmt(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
}

export default function TuitionPage() {
  const { t } = useTranslation('fin');
  const navigate = useNavigate();
  const { pagination, setPage } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const statuses = ['all', 'paid', 'partial', 'unpaid', 'overdue'];
  const filtered = TUITIONS.filter((tuition) => {
    const match = !search || tuition.studentName.toLowerCase().includes(search.toLowerCase()) || tuition.studentCode.includes(search);
    const matchStatus = statusFilter === 'all' || tuition.status === statusFilter;
    return match && matchStatus;
  });
  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);
  const totalAmount = filtered.reduce((s, tuition) => s + tuition.amount, 0);
  const totalPaid = filtered.reduce((s, tuition) => s + tuition.paid, 0);

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string; icon: React.ReactNode }> = {
    paid: { variant: 'success', label: t('tuition.status.paid'), icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    partial: { variant: 'warning', label: t('tuition.status.partial'), icon: <Clock className="h-3.5 w-3.5" /> },
    unpaid: { variant: 'error', label: t('tuition.status.unpaid'), icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    overdue: { variant: 'error', label: t('tuition.status.overdue'), icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('tuition.title')}
        description={t('tuition.description')}
        breadcrumbs={[{ label: 'FIN', href: '/fin' }, { label: t('tuition.title') }]}
        actions={<><Button variant="outline" size="sm">{t('tuition.exportDebt')}</Button><Button leftIcon={<Plus className="h-4 w-4" />} size="sm" onClick={() => navigate('/fin/hoc-phi/tao')}>{t('tuition.add')}</Button></>}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: t('tuition.statTotal'), value: fmt(totalAmount), color: 'primary' },
          { label: t('tuition.statCollected'), value: fmt(totalPaid), color: 'success' },
          { label: t('tuition.statRemaining'), value: fmt(totalAmount - totalPaid), color: 'error' },
          { label: t('tuition.statRate'), value: `${totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0}%`, color: 'accent' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              <CreditCard className="h-5 w-5" />
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
            placeholder={t('tuition.search')} className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2">
          {statuses.map((s) => <option key={s} value={s}>{s === 'all' ? t('tuition.filterAll') : STATUS_CONFIG[s]?.label || s}</option>)}
        </select>
      </div>
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgb(var(--border)/0.6)]">
              {[t('tuition.maSv'), t('tuition.hoTen'), t('tuition.lop'), t('tuition.hocPhi'), t('tuition.daDong'), t('tuition.conNo'), t('tuition.trangThai'), t('tuition.ngayDong')].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
            {paged.map((tuition) => {
              const sc = STATUS_CONFIG[tuition.status];
              const remaining = tuition.amount - tuition.paid;
              return (
                <tr key={tuition.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-[rgb(var(--text-secondary))]">{tuition.studentCode}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[rgb(var(--text-primary))]">{tuition.studentName}</td>
                  <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{tuition.class}</td>
                  <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{fmt(tuition.amount)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[rgb(var(--success))]">{fmt(tuition.paid)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[rgb(var(--error))]">{fmt(remaining)}</td>
                  <td className="px-4 py-3"><Badge variant={sc.variant} size="sm">{sc.icon} {sc.label}</Badge></td>
                  <td className="px-4 py-3 text-xs text-[rgb(var(--text-secondary))]">{tuition.paidAt || '—'}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/fin/hoc-phi/${tuition.id}`)}>{t('tuition.detail')}</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

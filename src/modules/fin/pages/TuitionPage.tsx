import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useTuitionList } from '@/hooks/useFin';

function fmt(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
}

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; labelKey: string }> = {
  paid: { variant: 'success', labelKey: 'fin:tuition.status.paid' },
  partial: { variant: 'warning', labelKey: 'fin:tuition.status.partial' },
  unpaid: { variant: 'error', labelKey: 'fin:tuition.status.unpaid' },
  overdue: { variant: 'error', labelKey: 'fin:tuition.status.overdue' },
  refunded: { variant: 'neutral', labelKey: 'fin:tuition.status.refunded' },
  waived: { variant: 'neutral', labelKey: 'fin:tuition.status.waived' },
};

export default function TuitionPage() {
  const { t } = useTranslation('fin');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const { data, isLoading } = useTuitionList({
    search: search || undefined,
    status: status || undefined,
    page,
    pageSize,
  });

  const list = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  if (isLoading && list.length === 0) {
    return <div className="flex items-center justify-center h-64"><p className="text-[rgb(var(--text-muted))]">Đang tải...</p></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('tuition.title')}
        description={`${total} bản ghi học phí`}
        actions={<Button leftIcon={<Plus className="h-4 w-4" />}>Tạo học phí</Button>}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm mã SV, tên sinh viên..."
            className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-2"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{t(cfg.labelKey)}</option>
          ))}
        </select>
      </div>
      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border))] p-12 text-center">
          <p className="text-[rgb(var(--text-muted))]">Không có bản ghi nào</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgb(var(--border)/0.6)]">
                {['Mã SV', 'Họ tên', 'Học kỳ', 'Tổng tiền', 'Đã thanh toán', 'Còn nợ', 'Trạng thái'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
              {list.map((tuition: any) => {
                const sc = STATUS_CONFIG[tuition.status] || { variant: 'neutral' as const, labelKey: `fin:tuition.status.${tuition.status}` };
                const unpaid = tuition.amount - (tuition.paidAmount ?? 0);
                return (
                  <tr key={tuition._id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-[rgb(var(--text-secondary))]">{tuition.studentId}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[rgb(var(--text-primary))]">{tuition.studentName || '—'}</td>
                    <td className="px-4 py-3 text-xs text-[rgb(var(--text-secondary))]">{tuition.semester} {tuition.academicYear}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[rgb(var(--text-primary))]">{fmt(tuition.amount)}</td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">{fmt(tuition.paidAmount ?? 0)}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${unpaid > 0 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--text-secondary))]'}`}>
                      {unpaid > 0 ? fmt(unpaid) : '—'}
                    </td>
                    <td className="px-4 py-3"><Badge variant={sc.variant} size="sm">{t(sc.labelKey)}</Badge></td>
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

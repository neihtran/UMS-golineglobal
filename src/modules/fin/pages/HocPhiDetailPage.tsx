import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Printer, Download, CreditCard, CheckCircle2,
  Clock, User,
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useTuitionDetail } from '@/hooks/useFin';
import type { Tuition } from '@/services/fin.service';

function fmt(v?: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v ?? 0);
}

export default function HocPhiDetailPage() {
  const { t } = useTranslation('fin');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: tuition, isLoading } = useTuitionDetail(id || '');

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
    paid: { variant: 'success', label: t('tuition.status.paid') || 'Đã thanh toán' },
    pending: { variant: 'warning', label: t('tuition.status.pending') || 'Chờ thanh toán' },
    overdue: { variant: 'error', label: t('tuition.status.overdue') || 'Quá hạn' },
    exempt: { variant: 'neutral', label: t('tuition.status.exempt') || 'Miễn giảm' },
  };

  if (isLoading || !tuition) {
    return (
      <div className="space-y-6">
        <PageHeader title={isLoading ? 'Đang tải...' : 'Không tìm thấy'} breadcrumbs={[{ label: 'FIN', href: '/fin' }, { label: 'Học phí' }]} />
        <div className="flex items-center justify-center h-64">
          <p className="text-[rgb(var(--text-muted))]">{isLoading ? 'Đang tải thông tin học phí...' : 'Không tìm thấy học phí này.'}</p>
        </div>
      </div>
    );
  }

  const d = tuition as Tuition;
  const sc = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.pending;
  const breakdown = (d as any).breakdown || (d as any).items || [];
  const history = (d as any).history || (d as any).versions || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Học phí ${typeof d.student === 'object' ? (d.student as any).name || d.studentName : d.studentName || ''}`}
        description={`${d.code || ''} · ${d.semester || ''}`}
        breadcrumbs={[
          { label: 'FIN', href: '/fin' },
          { label: t('tuition.title', { defaultValue: 'Học phí' }), href: '/fin/hoc-phi' },
          { label: d.code || '' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/fin/hoc-phi')}>
              {t('detail.tuition.back')}
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Printer className="h-4 w-4" />}>{t('detail.tuition.print')}</Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>{t('detail.tuition.download')}</Button>
          </div>
        }
      />

      {/* Status bar */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
        <Badge variant={sc.variant} dot>{sc.label}</Badge>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className="text-xs text-[rgb(var(--text-muted))]">
          {t('detail.tuition.createdAt')} <span className="font-medium text-[rgb(var(--text-secondary))]">
            {d.createdAt ? new Date(d.createdAt).toLocaleDateString('vi-VN') : ''}
          </span>
        </span>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className="text-xs text-[rgb(var(--text-muted))]">
          Hạn: <span className="font-medium text-[rgb(var(--text-secondary))]">
            {d.dueDate ? new Date(d.dueDate).toLocaleDateString('vi-VN') : ''}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: '1fr 340px' }}>
        {/* Main content */}
        <div className="space-y-4">
          {/* Student info */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('detail.tuition.studentInfo')}</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-[rgb(var(--text-muted))]">{(d as any).student?.code || d.studentCode || ''}</p>
                  <h2 className="text-base font-bold text-[rgb(var(--text-primary))] mt-0.5">
                    {(d as any).student?.name || d.studentName || '—'}
                  </h2>
                  <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                    {(d as any).student?.className || d.class || ''} · {(d as any).student?.department?.name || d.department || ''}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[rgb(var(--border)/0.6)]">
                {[
                  { label: 'Mã SV', value: (d as any).student?.code || d.studentCode || '' },
                  { label: 'Lớp', value: (d as any).student?.className || d.class || '' },
                  { label: 'Khóa', value: (d as any).student?.cohort || d.cohort || '' },
                  { label: 'Học kỳ', value: d.semester || '' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-xs text-[rgb(var(--text-muted))] w-24 shrink-0">{item.label}:</span>
                    <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">{item.value || '—'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tuition breakdown */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('detail.tuition.breakdown')}</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              {breakdown.length > 0 ? (
                <div className="space-y-3">
                  {breakdown.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[rgb(var(--border)/0.4)] last:border-0">
                      <span className="text-sm text-[rgb(var(--text-secondary))]">{item.item || item.name || item.description || ''}</span>
                      <span className="text-sm font-medium font-mono text-[rgb(var(--text-primary))]">{fmt(item.amount || 0)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 border-t border-[rgb(var(--border))]">
                    <span className="font-semibold text-[rgb(var(--text-primary))]">{t('detail.tuition.total')}</span>
                    <span className="text-lg font-bold text-[rgb(var(--text-primary))]">{fmt(d.amount || d.totalAmount || 0)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-8 w-8 mx-auto text-[rgb(var(--text-muted))] mb-2" />
                  <p className="text-sm text-[rgb(var(--text-muted))]">Chưa có chi tiết học phí.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment info */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('detail.tuition.paymentInfo')}</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-[rgb(var(--border))] p-4 text-center">
                  <p className="text-xs text-[rgb(var(--text-muted))]">{t('detail.tuition.total')}</p>
                  <p className="text-lg font-black text-[rgb(var(--text-primary))] mt-1">{fmt(d.amount || d.totalAmount || 0)}</p>
                </div>
                <div className="rounded-xl border border-[rgb(var(--success)/0.3)] bg-[rgb(var(--success)/0.04)] p-4 text-center">
                  <p className="text-xs text-[rgb(var(--text-muted))]">Đã thanh toán</p>
                  <p className="text-lg font-black text-[rgb(var(--success))] mt-1">{fmt(d.paid || d.amountPaid || 0)}</p>
                </div>
                <div className="rounded-xl border border-[rgb(var(--error)/0.3)] bg-[rgb(var(--error)/0.04)] p-4 text-center">
                  <p className="text-xs text-[rgb(var(--text-muted))]">Còn nợ</p>
                  <p className="text-lg font-black text-[rgb(var(--error))] mt-1">{fmt((d.amount || d.totalAmount || 0) - (d.paid || d.amountPaid || 0))}</p>
                </div>
              </div>
              {d.status === 'paid' && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[rgb(var(--success)/0.04)] border border-[rgb(var(--success)/0.15)]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[rgb(var(--success))]">Đã thanh toán</p>
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                      {d.paidAt ? new Date(d.paidAt).toLocaleDateString('vi-VN') : ''} · Số biên nhận: <span className="font-mono">{d.receiptNo || ''}</span>
                    </p>
                  </div>
                </div>
              )}
              {[
                { label: 'Phương thức', value: d.paymentMethod || d.method || '' },
                { label: 'Ngày thanh toán', value: d.paidAt ? new Date(d.paidAt).toLocaleDateString('vi-VN') : '' },
                { label: 'Số biên nhận', value: d.receiptNo || '' },
                { label: 'Ref. ngân hàng', value: (d as any).bankRef || '' },
              ].map((item) => (
                item.value ? (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="text-xs text-[rgb(var(--text-muted))] w-36 shrink-0 pt-0.5">{item.label}:</span>
                    <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                  </div>
                ) : null
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('detail.tuition.actions')}</h3>
            </div>
            <CardContent className="p-3 space-y-2">
              <Button className="w-full" size="sm" leftIcon={<Printer className="h-3.5 w-3.5" />}>{t('detail.tuition.printReceipt')}</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>{t('detail.tuition.downloadInvoice')}</Button>
              {d.status === 'unpaid' && (
                <Button className="w-full" size="sm" leftIcon={<CreditCard className="h-3.5 w-3.5" />}>{t('detail.tuition.recordPayment')}</Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[rgb(var(--text-muted))]" />
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('detail.tuition.history')}</h3>
            </div>
            <CardContent className="p-3 space-y-3">
              {history.length > 0 ? history.map((h: any, i: number) => (
                <div key={i} className="relative pl-5">
                  <div className={`absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-[rgb(var(--primary))]' : 'bg-[rgb(var(--border))]'}`} />
                  {i < history.length - 1 && <div className="absolute left-2.5 top-5 bottom-0 w-px bg-[rgb(var(--border)/0.5)]" />}
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-[rgb(var(--primary))]">v{h.version || '1.0'}</span>
                    <span className="text-[10px] text-[rgb(var(--text-muted))]">{h.time ? new Date(h.time).toLocaleString('vi-VN') : ''}</span>
                  </div>
                  <p className="text-xs font-medium text-[rgb(var(--text-primary))]">{h.action || ''}</p>
                  <p className="text-[10px] text-[rgb(var(--text-muted))]">{h.user?.name || h.userName || h.user || ''}</p>
                </div>
              )) : (
                <p className="text-xs text-[rgb(var(--text-muted))] text-center py-4">Chưa có lịch sử.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

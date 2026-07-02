import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Printer, Download, CreditCard, CheckCircle2,
  AlertTriangle, Clock, User, CalendarDays,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const TUITION_DETAIL = {
  id: 'th001',
  code: 'TH-2026-HK2-001',
  student: 'Nguyễn Văn An',
  studentCode: 'SV2026001',
  class: 'K60-CNTT',
  dept: 'Khoa Công nghệ Thông tin',
  semester: 'HK2-2025/2026',
  cohort: '2026',
  amount: 12500000,
  paid: 12500000,
  remaining: 0,
  method: 'Chuyển khoản',
  paidAt: '2026-06-20',
  dueDate: '2026-07-15',
  status: 'paid',
  createdAt: '2026-01-15',
  receiptNo: 'PT-2026-00234',
  bankRef: 'REF-VCB-20260620001234',
  note: '',
  history: [
    { version: '1.0', time: '2026-01-15 08:00', user: 'Hệ thống', action: 'Tạo phiếu thu học phí' },
    { version: '1.1', time: '2026-06-20 14:30', user: 'Nguyễn Thị Lan', action: 'Xác nhận thanh toán' },
  ],
  breakdown: [
    { item: 'Học phí chính khóa', amount: 9500000 },
    { item: 'Phí thực hành', amount: 2000000 },
    { item: 'Phí bảo hiểm', amount: 300000 },
    { item: 'Phí thư viện', amount: 200000 },
    { item: 'Phí sử dụng CSVC', amount: 500000 },
  ],
};

function fmt(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
}

export default function HocPhiDetailPage() {
  const { t } = useTranslation('fin');
  const navigate = useNavigate();
  const d = TUITION_DETAIL;

  const STATUS_CONFIG: Record<string, { variant: 'info' | 'success' | 'warning' | 'error'; label: string; icon: React.ReactNode }> = {
    paid: { variant: 'success', label: t('tuition.status.paid'), icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    partial: { variant: 'warning', label: t('tuition.status.partial'), icon: <Clock className="h-3.5 w-3.5" /> },
    unpaid: { variant: 'error', label: t('tuition.status.unpaid'), icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    overdue: { variant: 'error', label: t('tuition.status.overdue'), icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  };

  const sc = STATUS_CONFIG[d.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.unpaid;
  const [showRemind, setShowRemind] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${t('tuition.title')} — ${d.student}`}
        description={`FIN-01 · ${d.code} · ${d.semester}`}
        breadcrumbs={[
          { label: 'FIN', href: '/fin' },
          { label: t('tuition.title'), href: '/fin/hoc-phi' },
          { label: d.student },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/fin/hoc-phi')}>
              {t('detail.tuition.back')}
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Printer className="h-4 w-4" />}>{t('detail.tuition.print')}</Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>{t('detail.tuition.download')}</Button>
            {d.status !== 'paid' && (
              <Button size="sm" leftIcon={<CreditCard className="h-4 w-4" />} onClick={() => setShowRemind(true)}>
                {t('detail.tuition.sendRemind')}
              </Button>
            )}
          </div>
        }
      />

      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-[rgb(var(--${sc.variant})/0.1)] text-[rgb(var(--${sc.variant}))]`}>
          {sc.icon} {sc.label}
        </span>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-[rgb(var(--primary)/0.08)] text-[rgb(var(--primary))]">
          <CalendarDays className="h-3 w-3" />
          {t('detail.tuition.dueDate')} {d.dueDate}
        </span>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className="text-xs text-[rgb(var(--text-muted))]">
          {t('detail.tuition.semester')} <span className="font-medium text-[rgb(var(--text-secondary))]">{d.semester}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: '1fr 300px' }}>
        <div className="space-y-4">
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('detail.tuition.student')}</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-[rgb(var(--text-muted))]">{d.studentCode}</p>
                  <h2 className="text-base font-bold text-[rgb(var(--text-primary))] mt-0.5">{d.student}</h2>
                  <p className="text-sm text-[rgb(var(--text-secondary))] mt-1 leading-relaxed">{d.class} · {d.dept}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[rgb(var(--border)/0.6)]">
                {[
                  { label: t('detail.tuition.fields.maSv'), value: d.studentCode },
                  { label: t('detail.tuition.fields.lop'), value: d.class },
                  { label: t('detail.tuition.fields.khoa'), value: d.dept },
                  { label: t('detail.tuition.fields.khoaHoc'), value: d.cohort },
                  { label: t('detail.tuition.fields.hocKy'), value: d.semester },
                  { label: t('detail.tuition.fields.ngayTao'), value: d.createdAt },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-xs text-[rgb(var(--text-muted))] w-20 shrink-0">{item.label}:</span>
                    <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('detail.tuition.breakdown')}</h3>
            </div>
            <CardContent className="p-5 space-y-3">
              {d.breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-[rgb(var(--text-secondary))]">{item.item}</span>
                  <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{fmt(item.amount)}</span>
                </div>
              ))}
              <div className="border-t border-[rgb(var(--border)/0.6)] pt-3 mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{t('createTuition.breakdown.total')}</span>
                <span className="text-sm font-bold text-[rgb(var(--text-primary))]">{fmt(d.amount)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('detail.tuition.payment')}</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[rgb(var(--text-muted))]">{t('detail.tuition.progress')}</span>
                  <span className="text-xs font-bold text-[rgb(var(--text-primary))]">
                    {fmt(d.paid)} / {fmt(d.amount)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-[rgb(var(--bg-base))] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[rgb(var(--success))]"
                    style={{ width: `${Math.round((d.paid / d.amount) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-3 text-center">
                  <p className="text-xs text-[rgb(var(--text-muted))]">{t('detail.tuition.fields.tongNo')}</p>
                  <p className="text-base font-bold text-[rgb(var(--text-primary))]">{fmt(d.amount)}</p>
                </div>
                <div className="rounded-xl border border-[rgb(var(--success)/0.3)] bg-[rgb(var(--success)/0.04)] p-3 text-center">
                  <p className="text-xs text-[rgb(var(--text-muted))]">{t('detail.tuition.fields.daDong')}</p>
                  <p className="text-base font-bold text-[rgb(var(--success))]">{fmt(d.paid)}</p>
                </div>
                <div className="rounded-xl border border-[rgb(var(--error)/0.3)] bg-[rgb(var(--error)/0.04)] p-3 text-center">
                  <p className="text-xs text-[rgb(var(--text-muted))]">{t('detail.tuition.fields.conNo')}</p>
                  <p className="text-base font-bold text-[rgb(var(--error))]">{fmt(d.remaining)}</p>
                </div>
              </div>

              {[
                { label: t('detail.tuition.fields.maBienNhan'), value: d.receiptNo },
                { label: t('detail.tuition.fields.ngayThanhToan'), value: d.paidAt },
                { label: t('detail.tuition.fields.phuongThuc'), value: d.method },
                { label: t('detail.tuition.fields.maThamChieu'), value: d.bankRef },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-36 shrink-0 pt-0.5">{item.label}</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('detail.tuition.actions')}</h3>
            </div>
            <CardContent className="p-3 space-y-2">
              <Button className="w-full" size="sm" leftIcon={<Printer className="h-3.5 w-3.5" />}>{t('detail.tuition.print')}</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>{t('detail.tuition.download')}</Button>
              {d.status !== 'paid' && (
                <Button variant="outline" className="w-full" size="sm" leftIcon={<CreditCard className="h-3.5 w-3.5" />} onClick={() => setShowRemind(true)}>{t('detail.tuition.sendRemind')}</Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('detail.tuition.infoCard')}</h3>
            </div>
            <CardContent className="p-4 space-y-3">
              {[
                { label: t('detail.tuition.fields.maPhieu'), value: d.code },
                { label: t('detail.tuition.fields.maSv'), value: d.studentCode },
                { label: t('detail.tuition.fields.hoTen'), value: d.student },
                { label: t('detail.tuition.fields.lop'), value: d.class },
                { label: t('detail.tuition.fields.hocKy'), value: d.semester },
                { label: t('detail.tuition.fields.hanDong'), value: d.dueDate },
                { label: t('detail.tuition.fields.ngayDong'), value: d.paidAt },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-20 shrink-0 pt-0.5">{item.label}</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[rgb(var(--text-muted))]" />
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('detail.tuition.history')}</h3>
            </div>
            <CardContent className="p-3 space-y-3">
              {d.history.map((h, i) => (
                <div key={i} className="relative pl-5">
                  <div className={`absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-[rgb(var(--primary))]' : 'bg-[rgb(var(--border))]'}`} />
                  {i < d.history.length - 1 && <div className="absolute left-2.5 top-5 bottom-0 w-px bg-[rgb(var(--border)/0.5)]" />}
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-[rgb(var(--primary))]">v{h.version}</span>
                    <span className="text-[10px] text-[rgb(var(--text-muted))]">{h.time}</span>
                  </div>
                  <p className="text-xs font-medium text-[rgb(var(--text-primary))]">{h.action}</p>
                  <p className="text-[10px] text-[rgb(var(--text-muted))]">{h.user}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {showRemind && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[rgb(var(--bg-card))] rounded-2xl p-6 w-96 shadow-2xl border border-[rgb(var(--border))]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--warning)/0.1)]">
                <CreditCard className="h-6 w-6 text-[rgb(var(--warning))]" />
              </div>
              <div>
                <h3 className="font-bold text-[rgb(var(--text-primary))]">{t('detail.tuition.remindTitle')}</h3>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{d.student} — {d.code}</p>
              </div>
            </div>
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-5">{t('detail.tuition.remindMsg')}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowRemind(false)}>{t('detail.tuition.cancel')}</Button>
              <Button className="flex-1" onClick={() => setShowRemind(false)}>{t('detail.tuition.confirm')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

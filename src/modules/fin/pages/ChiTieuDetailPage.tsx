import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2, XCircle, Printer, Download,
  FileText, Clock, ShieldCheck, CreditCard, AlertTriangle,
} from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';

const EXPENSE_DETAIL = {
  id: 'e1',
  code: 'CP001',
  title: 'Chi phí vật liệu văn phòng Q1/2026',
  description: 'Chi phí vật liệu văn phòng Q1/2026 bao gồm giấy A4, bút, văn phòng phẩm phục vụ hoạt động hành chính của Phòng Hành chính trong quý I năm 2026.',
  category: 'Vật liệu',
  dept: 'Phòng Hành chính',
  date: '2026-03-15',
  requester: 'Nguyễn Văn Minh',
  requesterRole: 'Trưởng phòng HC',
  urgency: 'thường',
  amount: 45000000,
  paidTo: 'Công ty TNHH Văn phòng Phẩm ABC',
  bankAccount: '1234567890 - Ngân hàng VietinBank - CN TP.HCM',
  paymentMethod: 'Chuyển khoản',
  status: 'approved',
  approver: 'TS. Hoàng Đức Anh',
  approverRole: 'Phó Hiệu trưởng',
  approvedAt: '2026-03-16',
  note: 'Đã kiểm tra hóa đơn và chứng từ đầy đủ.',
  history: [
    { version: '1.0', time: '2026-03-15 09:30', user: 'Nguyễn Văn Minh', action: 'Tạo phiếu chi' },
    { version: '1.1', time: '2026-03-15 14:00', user: 'Nguyễn Văn Minh', action: 'Bổ sung hóa đơn' },
    { version: '1.2', time: '2026-03-16 10:00', user: 'TS. Hoàng Đức Anh', action: 'Phê duyệt phiếu chi' },
  ],
};

function fmt(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
}

interface ChiTieuDetailPageProps {
  id?: string;
}

export default function ChiTieuDetailPage({ id }: ChiTieuDetailPageProps) {
  const params = useParams();
  const actualId = id ?? (params.id ?? '');
  const { t } = useTranslation('fin');
  const [showReject, setShowReject] = useState(false);
  const d = { ...EXPENSE_DETAIL, id: actualId };

  const STATUS_CONFIG: Record<string, { variant: 'info' | 'success' | 'warning' | 'error'; label: string; icon: React.ReactNode }> = {
    draft: { variant: 'info', label: t('expenditure.status.draft') || 'Bản nháp', icon: <FileText className="h-3.5 w-3.5" /> },
    pending: { variant: 'warning', label: t('expenditure.status.pending'), icon: <Clock className="h-3.5 w-3.5" /> },
    approved: { variant: 'success', label: t('expenditure.status.approved'), icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    rejected: { variant: 'error', label: t('expenditure.status.rejected'), icon: <XCircle className="h-3.5 w-3.5" /> },
  };

  const sc = STATUS_CONFIG[d.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" leftIcon={<Printer className="h-4 w-4" />}>{t('detail.expenditure.print')}</Button>
        <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>{t('detail.expenditure.download')}</Button>
        {d.status === 'pending' && (
          <>
            <Button size="sm" leftIcon={<CheckCircle2 className="h-4 w-4" />}>{t('detail.expenditure.approve')}</Button>
            <Button variant="outline" size="sm" className="!text-[rgb(var(--error))]" leftIcon={<XCircle className="h-4 w-4" />} onClick={() => setShowReject(true)}>{t('detail.expenditure.reject')}</Button>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-[rgb(var(--${sc.variant})/0.1)] text-[rgb(var(--${sc.variant}))]`}>
          {sc.icon} {sc.label}
        </span>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-[rgb(var(--bg-base))] text-[rgb(var(--text-secondary))]">
          <AlertTriangle className="h-3 w-3" />
          {t('detail.expenditure.urgency.label')} {d.urgency === 'khẩn' ? t('detail.expenditure.urgency.urgent') : t('detail.expenditure.urgency.normal')}
        </span>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className="text-xs text-[rgb(var(--text-muted))]">
          {t('detail.expenditure.createdAt')} <span className="font-medium text-[rgb(var(--text-secondary))]">{d.date}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: '1fr 300px' }}>
        <div className="space-y-4">
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('detail.expenditure.info')}</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-[rgb(var(--text-muted))]">{d.code}</p>
                  <h2 className="text-base font-bold text-[rgb(var(--text-primary))] mt-0.5">{d.title}</h2>
                  <p className="text-sm text-[rgb(var(--text-secondary))] mt-1 leading-relaxed">{d.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[rgb(var(--border)/0.6)]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-24 shrink-0">{t('detail.expenditure.fields.danhMuc')}:</span>
                  <Badge variant="primary" size="sm">{d.category}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-24 shrink-0">{t('detail.expenditure.fields.donVi')}:</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">{d.dept}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-24 shrink-0">{t('detail.expenditure.fields.nguoiLap')}:</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">{d.requester}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-24 shrink-0">{t('detail.expenditure.fields.ngayLap')}:</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">{d.date}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-24 shrink-0">{t('detail.expenditure.fields.phuongThuc')}:</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">{d.paymentMethod}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('detail.expenditure.payment')}</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[rgb(var(--error)/0.04)] border border-[rgb(var(--error)/0.15)]">
                <div>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{t('detail.expenditure.fields.soTien')}</p>
                  <p className="text-2xl font-black text-[rgb(var(--error))]">{fmt(d.amount)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-[rgb(var(--error))]" />
              </div>
              {[
                { label: t('detail.expenditure.fields.nguoiNhan'), value: d.paidTo },
                { label: t('detail.expenditure.fields.soTaiKhoan'), value: d.bankAccount },
                { label: t('detail.expenditure.fields.phuongThuc'), value: d.paymentMethod },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-40 shrink-0 pt-0.5">{item.label}</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {d.status === 'approved' && (
            <Card>
              <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('detail.expenditure.approval')}</h3>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[rgb(var(--success)/0.04)] border border-[rgb(var(--success)/0.15)]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[rgb(var(--success))]">{t('detail.expenditure.approvedLabel')}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{t('detail.expenditure.approvedDate')} {d.approvedAt}</p>
                  </div>
                </div>
                {[
                  { label: t('detail.expenditure.fields.nguoiDuyet'), value: d.approver },
                  { label: t('detail.expenditure.fields.chucVu'), value: d.approverRole },
                  { label: t('detail.expenditure.fields.ngayDuyet'), value: d.approvedAt },
                  { label: t('detail.expenditure.fields.ghiChu'), value: d.note },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="text-xs text-[rgb(var(--text-muted))] w-40 shrink-0 pt-0.5">{item.label}</span>
                    <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('detail.expenditure.actions')}</h3>
            </div>
            <CardContent className="p-3 space-y-2">
              <Button className="w-full" size="sm" leftIcon={<Printer className="h-3.5 w-3.5" />}>{t('detail.expenditure.print')}</Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>{t('detail.expenditure.download')}</Button>
              {d.status === 'pending' && (
                <>
                  <Button className="w-full" size="sm" leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}>{t('detail.expenditure.approve')}</Button>
                  <Button variant="outline" className="w-full !text-[rgb(var(--error))] hover:!bg-[rgb(var(--error)/0.04)]" size="sm" leftIcon={<XCircle className="h-3.5 w-3.5" />} onClick={() => setShowReject(true)}>{t('detail.expenditure.reject')}</Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('detail.expenditure.infoCard')}</h3>
            </div>
            <CardContent className="p-4 space-y-3">
              {[
                { label: t('detail.expenditure.fields.soPhieu'), value: d.code },
                { label: t('detail.expenditure.fields.danhMuc'), value: d.category },
                { label: t('detail.expenditure.fields.donVi'), value: d.dept },
                { label: t('detail.expenditure.fields.nguoiLap'), value: d.requester },
                { label: t('detail.expenditure.fields.doiTuongNhan'), value: d.paidTo },
                { label: t('detail.expenditure.fields.ngayLap'), value: d.date },
                { label: t('detail.expenditure.fields.ngayDuyet'), value: d.approvedAt },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-24 shrink-0 pt-0.5">{item.label}</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[rgb(var(--text-muted))]" />
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('detail.expenditure.history')}</h3>
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

      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[rgb(var(--bg-card))] rounded-2xl p-6 w-96 shadow-2xl border border-[rgb(var(--border))]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--error)/0.1)]">
                <XCircle className="h-6 w-6 text-[rgb(var(--error))]" />
              </div>
              <div>
                <h3 className="font-bold text-[rgb(var(--text-primary))]">{t('detail.expenditure.rejectTitle')}</h3>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{d.code}</p>
              </div>
            </div>
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-5">{t('detail.expenditure.rejectMsg')}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowReject(false)}>{t('detail.expenditure.cancel')}</Button>
              <Button className="flex-1 !bg-[rgb(var(--error))] hover:!bg-[rgb(var(--error-light))]" onClick={() => setShowReject(false)}>
                {t('detail.expenditure.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

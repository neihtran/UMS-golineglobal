import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, Send, Download, Clock,
  FileText, CheckCircle2, AlertTriangle, Users, PenLine,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useTranslation } from 'react-i18next';

const DOC_DETAIL = {
  id: 'd2',
  number: 'KH-2026-015',
  type: 'ke-hoach',
  typeLabel: 'Kế hoạch',
  title: 'Kế hoạch tuyển sinh HK1 2026-2027',
  abstract: 'Kế hoạch tuyển sinh hệ đại học chính quy, liên thông, vừa làm vừa học năm học 2026-2027 của Trường Đại học.',
  urgency: 'thường',
  internalType: 'Đi nội bộ & ngoài',
  author: 'ThS. Trần Hoàng Nam',
  authorRole: 'Phó Trưởng phòng Đào tạo',
  dept: 'Phòng Đào tạo',
  createdAt: '15/06/2026 10:00',
  updatedAt: '18/06/2026 14:30',
  status: 'pending',
  statusLabel: 'Chờ ký',
  content: `<p style="text-align: right;"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></p>
<p style="text-align: right;"><strong>Độc lập - Tự do - Hạnh phúc</strong></p>
<hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;" />
<p style="text-align: center;"><strong>SỐ: KH-2026-015/ĐT-ĐH</strong></p>
<p>&nbsp;</p>
<p style="text-align: center; font-size: 16px;"><strong>KẾ HOẠCH TUYỂN SINH HỌC KỲ 1 NĂM HỌC 2026-2027</strong></p>
<p>&nbsp;</p>
<p><strong>Kính gửi:</strong></p>
<ul>
<li>- Hiệu trưởng</li>
<li>- Phó Hiệu trưởng</li>
<li>- Trưởng các Khoa/Phòng/Bộ môn</li>
<li>- Ban Quản lý các Khoa</li>
</ul>
<p>&nbsp;</p>
<p>Căn cứ Quy chế tuyển sinh đại học, cao đẳng ngành Giáo dục Mầm non;</p>
<p>Căn cứ Kế hoạch năm học 2026-2027;</p>
<p>&nbsp;</p>
<p><strong>Điều 1. Đối tượng tuyển sinh</strong></p>
<p>Tuyển sinh hệ đại học chính quy các ngành đào tạo của Trường.</p>
<p>&nbsp;</p>
<p><strong>Điều 2. Chỉ tiêu tuyển sinh</strong></p>
<p>Tổng chỉ tiêu: 2.500 thí sinh cho tất cả các ngành.</p>
<p>&nbsp;</p>
<p><strong>Điều 3. Thời gian tuyển sinh</strong></p>
<p>Đợt 1: 15/07/2026 – 30/07/2026</p>
<p>Đợt 2 (bổ sung): 01/08/2026 – 15/08/2026</p>
<p>&nbsp;</p>
<p><strong>Điều 4. Hồ sơ dự tuyển</strong></p>
<p>Thí sinh nộp hồ sơ theo quy định tại Phòng Đào tạo hoặc qua hệ thống trực tuyến.</p>
<p>&nbsp;</p>
<p><strong>Nơi nhận:</strong></p>
<ul>
<li>- Như trên;</li>
<li>- Lưu.</li>
</ul>`,
  signers: [
    { name: 'PGS.TS. Lê Thị Lan', role: 'Trưởng phòng Đào tạo', status: 'signed', signedAt: '18/06/2026' },
    { name: 'PGS.TS. Nguyễn Văn Minh', role: 'Trưởng khoa', status: 'pending', signedAt: null },
  ],
  recipients: ['Hiệu trưởng', 'Phó Hiệu trưởng', 'Khoa CNTT', 'Khoa Sư phạm', 'Phòng HC'],
  history: [
    { version: '1.0', time: '15/06/2026 10:00', user: 'ThS. Trần Hoàng Nam', action: 'Tạo mới' },
    { version: '1.1', time: '16/06/2026 11:30', user: 'ThS. Trần Hoàng Nam', action: 'Cập nhật chỉ tiêu tuyển sinh' },
    { version: '1.2', time: '18/06/2026 14:30', user: 'ThS. Trần Hoàng Nam', action: 'Gửi rà soát' },
  ],
};

const STATUS_CONFIG: Record<string, { variant: 'info' | 'success' | 'warning' | 'neutral'; statusKey: string; icon: React.ReactNode }> = {
  draft: { variant: 'info', statusKey: 'status.draft', icon: <PenLine className="h-3.5 w-3.5" /> },
  pending: { variant: 'warning', statusKey: 'status.pending', icon: <Clock className="h-3.5 w-3.5" /> },
  approved: { variant: 'success', statusKey: 'status.approved', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  signed: { variant: 'success', statusKey: 'status.signed', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
};

export default function DocumentDetailPage() {
  const { t } = useTranslation('dms');
  const { id } = useParams();
  const navigate = useNavigate();
  const d = DOC_DETAIL;
  const sc = STATUS_CONFIG[d.status as keyof typeof STATUS_CONFIG];
  const [showDelete, setShowDelete] = useState(false);

  const urgencyKey = d.urgency === 'khẩn' ? 'khan' : d.urgency === 'mật' ? 'mat' : 'thuong';

  const infoLeftItems = [
    { labelKey: 'common.type', value: d.typeLabel },
    { labelKey: 'common.scope', value: d.internalType },
    { labelKey: 'common.author', value: d.author },
    { labelKey: 'common.dept', value: d.dept },
    { labelKey: 'common.createdAt', value: d.createdAt },
  ];

  const infoRightItems = [
    { labelKey: 'common.documentNumber', value: d.number },
    { labelKey: 'common.type', value: d.typeLabel },
    { labelKey: 'common.urgency', value: t(`urgency.${urgencyKey}`) },
    { labelKey: 'common.author', value: d.author },
    { labelKey: 'common.dept', value: d.dept },
    { labelKey: 'common.createdAt', value: d.createdAt },
    { labelKey: 'common.updatedAt', value: d.updatedAt },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('document.detail.title')}
        description={`${d.number} · ${d.typeLabel}`}
        breadcrumbs={[
          { label: 'DMS', href: '/dms' },
          { label: t('document.detail.breadcrumbPending'), href: '/dms/cho-ky' },
          { label: d.number },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/dms/cho-ky')}>
              {t('common.back')}
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>{t('common.downloadFile')}</Button>
            <Button variant="outline" size="sm" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => navigate(`/dms/soan-thao/${id}`)}>{t('common.edit')}</Button>
            <Button variant="outline" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[rgb(var(--error))]" onClick={() => setShowDelete(true)}>
              {t('common.delete')}
            </Button>
            <Button size="sm" leftIcon={<Send className="h-4 w-4" />}>
              {t('action.sendSign')}
            </Button>
          </div>
        }
      />

      {/* Status strip */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-[rgb(var(--${sc.variant})/0.1)] text-[rgb(var(--${sc.variant}))]`}>
          {sc.icon} {t(sc.statusKey)}
        </span>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
          d.urgency === 'khẩn' ? 'bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))]' :
          d.urgency === 'mật' ? 'bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]' :
          'bg-[rgb(var(--bg-base))] text-[rgb(var(--text-muted))]'
        }`}>
          {d.urgency === 'khẩn' && <AlertTriangle className="h-3 w-3" />}
          {t('document.detail.urgencyLabel')}: {t(`urgency.${urgencyKey}`)}
        </span>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className="text-xs text-[rgb(var(--text-muted))]">
          {t('common.updatedAtLabel')}: <span className="font-medium text-[rgb(var(--text-secondary))]">{d.updatedAt}</span>
        </span>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 300px' }}>
        {/* LEFT */}
        <div className="space-y-4">
          {/* Header info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-[rgb(var(--text-muted))]">{d.number}</p>
                  <h2 className="text-lg font-bold text-[rgb(var(--text-primary))] mt-0.5">{d.title}</h2>
                  <p className="text-sm text-[rgb(var(--text-secondary))] mt-1 leading-relaxed">{d.abstract}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[rgb(var(--border)/0.6)]">
                {infoLeftItems.map((item) => (
                  <div key={item.labelKey} className="flex items-center gap-2">
                    <span className="text-xs text-[rgb(var(--text-muted))] w-20 shrink-0">{t(item.labelKey)}:</span>
                    <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Document content */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('document.detail.contentTitle')}</h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>{t('common.download')}</Button>
                <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />}>{t('common.edit')}</Button>
              </div>
            </div>
            <CardContent className="p-8 bg-white min-h-96">
              <div
                className="prose max-w-none text-sm text-gray-800"
                dangerouslySetInnerHTML={{ __html: d.content }}
              />
            </CardContent>
          </Card>

          {/* Recipients */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center gap-2">
              <Users className="h-4 w-4 text-[rgb(var(--text-muted))]" />
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('document.detail.recipientsTitle')} ({d.recipients.length})</h3>
            </div>
            <CardContent className="p-4 flex flex-wrap gap-2">
              {d.recipients.map((r, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgb(var(--bg-base))] border border-[rgb(var(--border)/0.5)] text-xs font-medium text-[rgb(var(--text-secondary))]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-[9px] font-bold text-[rgb(var(--primary))]">{i + 1}</span>
                  {r}
                </span>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {/* Signers */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center gap-2">
              <PenLine className="h-4 w-4 text-[rgb(var(--text-muted))]" />
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('document.detail.signersTitle')} ({d.signers.length})</h3>
            </div>
            <CardContent className="p-3 space-y-3">
              {d.signers.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    s.status === 'signed'
                      ? 'bg-[rgb(var(--success))] text-white'
                      : 'bg-[rgb(var(--warning)/0.15)] text-[rgb(var(--warning))]'
                  }`}>
                    {s.status === 'signed' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[rgb(var(--text-primary))]">{s.name}</p>
                    <p className="text-[10px] text-[rgb(var(--text-muted))]">{s.role}</p>
                    {s.signedAt && <p className="text-[10px] text-[rgb(var(--success))] mt-0.5">{t('workflow.signedSuccess')} · {s.signedAt}</p>}
                    {s.status === 'pending' && <p className="text-[10px] text-[rgb(var(--warning))] mt-0.5">{t('workflow.pendingSigner')}</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('document.detail.infoTitle')}</h3>
            </div>
            <CardContent className="p-4 space-y-3">
              {infoRightItems.map((item) => (
                <div key={item.labelKey} className="flex items-start gap-2">
                  <span className="text-xs text-[rgb(var(--text-muted))] w-16 shrink-0 pt-0.5">{t(item.labelKey)}</span>
                  <span className="text-xs font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[rgb(var(--text-muted))]" />
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('common.history')}</h3>
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

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[rgb(var(--bg-card))] rounded-2xl p-6 w-96 shadow-2xl border border-[rgb(var(--border))]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--error)/0.1)]">
                <Trash2 className="h-6 w-6 text-[rgb(var(--error))]" />
              </div>
              <div>
                <h3 className="font-bold text-[rgb(var(--text-primary))]">{t('document.detail.deleteConfirmTitle')}</h3>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{d.number}</p>
              </div>
            </div>
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-5">{t('document.detail.deleteConfirmDesc')}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDelete(false)}>{t('common.cancel')}</Button>
              <Button className="flex-1 !bg-[rgb(var(--error))] hover:!bg-[rgb(var(--error-light))]" onClick={() => { setShowDelete(false); navigate('/dms/cho-ky'); }}>
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

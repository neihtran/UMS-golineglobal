import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, Send, Download, Clock,
  FileText, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useTranslation } from 'react-i18next';

const DRAFT_DETAIL = {
  id: 'd1',
  number: 'CV-2026-001',
  type: 'cv',
  typeLabel: 'Công văn',
  title: 'Quy chế đào tạo thạc sĩ ngành CNTT',
  abstract: 'Quy định về quy chế đào tạo thạc sĩ ngành Công nghệ Thông tin, bao gồm điều kiện tuyển sinh, chương trình đào tạo, đánh giá và cấp bằng.',
  urgency: 'thường',
  urgencyColor: 'neutral',
  internalType: 'Đi nội bộ & ngoài',
  author: 'ThS. Trần Hoàng Nam',
  authorRole: 'Phó Trưởng phòng Đào tạo',
  dept: 'Phòng Đào tạo',
  createdAt: '25/06/2026 14:30',
  updatedAt: '26/06/2026 09:15',
  status: 'draft',
  statusLabel: 'Bản nháp',
  recipients: ['Hiệu trưởng', 'Phó Hiệu trưởng', 'Khoa CNTT', 'Khoa Toán', 'Phòng HC'],
  content: `<p style="text-align: right;"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></p>
<p style="text-align: right;"><strong>Độc lập - Tự do - Hạnh phúc</strong></p>
<hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;" />
<p style="text-align: center;"><strong>SỐ: CV-2026-001/ĐT-ĐH</strong></p>
<p>&nbsp;</p>
<p style="text-align: center; font-size: 16px;"><strong>QUY CHẾ ĐÀO TẠO THẠC SĨ NGÀNH CÔNG NGHỆ THÔNG TIN</strong></p>
<p>&nbsp;</p>
<p><strong>Kính gửi:</strong></p>
<ul>
<li>- Hiệu trưởng</li>
<li>- Phó Hiệu trưởng các Khoa/Phòng</li>
<li>- Ban Quản lý Khoa CNTT</li>
</ul>
<p>&nbsp;</p>
<p>Căn cứ Luật Giáo dục số 43/2019/QH14 ngày 14/6/2019;</p>
<p>Căn cứ Quy chế đào tạo sau đại học của Bộ Giáo dục và Đào tạo;</p>
<p>&nbsp;</p>
<p><strong>Điều 1. Phạm vi điều chỉnh</strong></p>
<p>Quy chế này quy định về quy trình tuyển sinh, tổ chức đào tạo, đánh giá kết quả học tập và cấp bằng thạc sĩ ngành Công nghệ Thông tin tại Trường Đại học.</p>
<p>&nbsp;</p>
<p><strong>Nơi nhận:</strong></p>
<ul>
<li>- Như trên;</li>
<li>- Lưu.</li>
</ul>`,
  history: [
    { version: '1.0', time: '25/06/2026 14:30', user: 'ThS. Trần Hoàng Nam', action: 'Tạo mới' },
    { version: '1.1', time: '25/06/2026 16:45', user: 'ThS. Trần Hoàng Nam', action: 'Cập nhật nội dung Điều 3-4' },
    { version: '1.2', time: '26/06/2026 09:15', user: 'ThS. Trần Hoàng Nam', action: 'Bổ sung Điều 5 về cấp bằng' },
  ],
};

const STATUS_CONFIG: Record<string, { variant: 'info' | 'success' | 'warning'; labelKey: string; icon: React.ReactNode }> = {
  draft: { variant: 'info', labelKey: 'status.draft', icon: <FileText className="h-3.5 w-3.5" /> },
  review: { variant: 'warning', labelKey: 'status.review', icon: <Clock className="h-3.5 w-3.5" /> },
  submitted: { variant: 'success', labelKey: 'status.submitted', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
};

export default function BanNhapDetailPage() {
  const { t } = useTranslation('dms');
  const { id } = useParams();
  const navigate = useNavigate();
  const d = DRAFT_DETAIL;
  const sc = STATUS_CONFIG[d.status as keyof typeof STATUS_CONFIG];
  const [showDelete, setShowDelete] = useState(false);

  const urgencyKey = d.urgency === 'khẩn' ? 'khan' : d.urgency === 'mật' ? 'mat' : 'thuong';

  const infoLeftItems = [
    { labelKey: 'common.type', value: d.typeLabel },
    { labelKey: 'banNhap.detail.scope', value: d.internalType },
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
        title={d.title}
        description={`${t('moduleCode')} · ${d.number} · ${d.typeLabel}`}
        breadcrumbs={[
          { label: 'DMS', href: '/dms' },
          { label: t('draft.breadcrumb'), href: '/dms/ban-nhap' },
          { label: d.number },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/dms/ban-nhap')}>
              {t('common.back')}
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>{t('common.downloadFile')}</Button>
            <Button variant="outline" size="sm" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => navigate(`/dms/ban-nhap/${id}/sua`)}>
              {t('common.edit')}
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[rgb(var(--error))]" onClick={() => setShowDelete(true)}>
              {t('common.delete')}
            </Button>
            <Button size="sm" leftIcon={<Send className="h-4 w-4" />} onClick={() => navigate('/dms/cho-ky')}>
              {t('banNhap.detail.sendSign')}
            </Button>
          </div>
        }
      />

      {/* Status + urgency strip */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-[rgb(var(--${sc.variant})/0.1)] text-[rgb(var(--${sc.variant}))]`}>
          {sc.icon} {t(sc.labelKey)}
        </span>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
          d.urgency === 'khẩn' ? 'bg-[rgb(var(--error)/0.1)] text-[rgb(var(--error))]' :
          d.urgency === 'mật' ? 'bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))]' :
          'bg-[rgb(var(--bg-base))] text-[rgb(var(--text-muted))]'
        }`}>
          {d.urgency === 'khẩn' && <AlertTriangle className="h-3 w-3" />}
          {t('banNhap.detail.urgencyLabel')}: {t(`urgency.${urgencyKey}`)}
        </span>
        <span className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className="text-xs text-[rgb(var(--text-muted))]">
          {t('common.updatedAtLabel')}: <span className="font-medium text-[rgb(var(--text-secondary))]">{d.updatedAt}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: '1fr 300px' }}>
        {/* Left: Document content */}
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
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('banNhap.detail.contentTitle')}</h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>{t('banNhap.detail.download')}</Button>
                <Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => navigate(`/dms/ban-nhap/${id}/sua`)}>{t('common.edit')}</Button>
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
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
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

        {/* Right: Info + History */}
        <div className="space-y-4">
          {/* Quick actions */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('banNhap.detail.actionsTitle')}</h3>
            </div>
            <CardContent className="p-3 space-y-2">
              <Button className="w-full" size="sm" leftIcon={<Send className="h-3.5 w-3.5" />} onClick={() => navigate('/dms/cho-ky')}>
                {t('banNhap.detail.sendSign')}
              </Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => navigate(`/dms/ban-nhap/${id}/sua`)}>
                {t('banNhap.detail.edit')}
              </Button>
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
                {t('banNhap.detail.downloadFile')}
              </Button>
              <Button variant="outline" className="w-full !text-[rgb(var(--error))] hover:!bg-[rgb(var(--error)/0.04)]" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setShowDelete(true)}>
                {t('banNhap.detail.deleteDraft')}
              </Button>
            </CardContent>
          </Card>

          {/* Document info */}
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('banNhap.detail.infoTitle')}</h3>
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
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('banNhap.detail.historyTitle')}</h3>
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
                <h3 className="font-bold text-[rgb(var(--text-primary))]">{t('banNhap.detail.deleteConfirmTitle')}</h3>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{d.number}</p>
              </div>
            </div>
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-5">{t('banNhap.detail.deleteConfirmDesc')}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDelete(false)}>{t('common.cancel')}</Button>
              <Button className="flex-1 !bg-[rgb(var(--error))] hover:!bg-[rgb(var(--error-light))]" onClick={() => { setShowDelete(false); navigate('/dms/ban-nhap'); }}>
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Edit2, Trash2, Download, Clock,
  FileText, CheckCircle2, AlertTriangle, Users, PenLine,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { useTranslation } from 'react-i18next';

type DocStatus = 'draft' | 'pending' | 'approved' | 'signed';

interface DocumentRecord {
  id: string;
  number: string;
  type: string;
  typeLabel: string;
  title: string;
  abstract: string;
  urgency: string;
  internalType: string;
  author: string;
  authorRole: string;
  dept: string;
  createdAt: string;
  updatedAt: string;
  status: DocStatus;
  statusLabel: string;
  content: string;
  signers: { name: string; role: string; status: 'signed' | 'pending'; signedAt: string | null }[];
  recipients: string[];
  history: { version: string; time: string; user: string; action: string }[];
}

const MOCK_MAP: Record<string, DocumentRecord> = {
  d1: {
    id: 'd1',
    number: 'QĐ-2026-001',
    type: 'quyet-dinh',
    typeLabel: 'Quyết định',
    title: 'Quyết định thành lập Hội đồng Tuyển sinh',
    abstract: 'Thành lập Hội đồng Tuyển sinh năm 2026 gồm 7 thành viên',
    urgency: 'khẩn',
    internalType: 'Đi nội bộ & ngoài',
    author: 'Nguyễn Văn A',
    authorRole: 'Trưởng phòng Tuyển sinh',
    dept: 'Phòng Tuyển sinh',
    createdAt: '20/06/2026 09:00',
    updatedAt: '22/06/2026 14:30',
    status: 'pending',
    statusLabel: 'Chờ ký',
    content: `<p style="text-align: center;"><strong>QUYẾT ĐỊNH</strong></p>
<p style="text-align: center;"><strong>Về việc thành lập Hội đồng Tuyển sinh năm 2026</strong></p>
<p>&nbsp;</p>
<p><strong>Điều 1.</strong> Thành lập Hội đồng Tuyển sinh năm 2026 gồm 7 thành viên.</p>
<p><strong>Điều 2.</strong> Hội đồng có nhiệm vụ tổ chức tuyển sinh đại học chính quy năm 2026.</p>`,
    signers: [
      { name: 'PGS.TS. Nguyễn Văn Hiệu', role: 'Hiệu trưởng', status: 'pending', signedAt: null },
      { name: 'PGS.TS. Trần Thị Hương', role: 'Phó Hiệu trưởng', status: 'pending', signedAt: null },
    ],
    recipients: ['Hiệu trưởng', 'Phó Hiệu trưởng', 'Phòng Tuyển sinh', 'Khoa CNTT', 'Phòng HC'],
    history: [
      { version: '1.0', time: '20/06/2026 09:00', user: 'Nguyễn Văn A', action: 'Tạo mới' },
      { version: '1.1', time: '22/06/2026 14:30', user: 'Nguyễn Văn A', action: 'Gửi rà soát' },
    ],
  },
  d2: {
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
  },
  d3: {
    id: 'd3',
    number: 'KH-2026-016',
    type: 'ke-hoach',
    typeLabel: 'Kế hoạch',
    title: 'Kế hoạch bảo trì hệ thống tháng 7/2026',
    abstract: 'Bảo trì định kỳ hệ thống LMS và Portal',
    urgency: 'thường',
    internalType: 'Nội bộ',
    author: 'Lê Văn C',
    authorRole: 'Trưởng phòng CNTT',
    dept: 'Phòng CNTT',
    createdAt: '15/06/2026 10:00',
    updatedAt: '15/06/2026 10:00',
    status: 'pending',
    statusLabel: 'Chờ ký',
    content: `<p style="text-align: center;"><strong>KẾ HOẠCH BẢO TRÌ HỆ THỐNG THÁNG 7/2026</strong></p>
<p>&nbsp;</p>
<p>Bảo trì định kỳ hệ thống LMS và Portal.</p>`,
    signers: [
      { name: 'PGS.TS. Nguyễn Văn Hiệu', role: 'Hiệu trưởng', status: 'pending', signedAt: null },
    ],
    recipients: ['Phòng CNTT', 'Phòng Đào tạo', 'Các Khoa'],
    history: [
      { version: '1.0', time: '15/06/2026 10:00', user: 'Lê Văn C', action: 'Tạo mới' },
    ],
  },
  d4: {
    id: 'd4',
    number: 'BC-2026-012',
    type: 'bao-cao',
    typeLabel: 'Báo cáo',
    title: 'Báo cáo tổng kết công tác tuyển sinh năm 2026',
    abstract: 'Tổng kết tuyển sinh 2026 với 1,850 chỉ tiêu',
    urgency: 'thường',
    internalType: 'Nội bộ',
    author: 'Phạm Thu D',
    authorRole: 'Trưởng phòng Tuyển sinh',
    dept: 'Phòng Tuyển sinh',
    createdAt: '10/06/2026 14:00',
    updatedAt: '10/06/2026 14:00',
    status: 'approved',
    statusLabel: 'Đã duyệt',
    content: `<p style="text-align: center;"><strong>BÁO CÁO TỔNG KẾT CÔNG TÁC TUYỂN SINH NĂM 2026</strong></p>
<p>&nbsp;</p>
<p>Tổng kết tuyển sinh 2026 với 1,850 chỉ tiêu.</p>`,
    signers: [
      { name: 'PGS.TS. Nguyễn Văn Hiệu', role: 'Hiệu trưởng', status: 'signed', signedAt: '10/06/2026' },
    ],
    recipients: ['Phòng Tuyển sinh', 'Ban Giám hiệu'],
    history: [
      { version: '1.0', time: '10/06/2026 14:00', user: 'Phạm Thu D', action: 'Tạo mới' },
    ],
  },
  d5: {
    id: 'd5',
    number: 'HD-2026-008',
    type: 'huong-dan',
    typeLabel: 'Hướng dẫn',
    title: 'Hướng dẫn đăng ký học phần kỳ 3 năm học 2025-2026',
    abstract: 'Đăng ký HP từ 01/07 đến 10/07/2026',
    urgency: 'khẩn',
    internalType: 'Nội bộ',
    author: 'Hoàng Văn E',
    authorRole: 'Phó Trưởng phòng Đào tạo',
    dept: 'Phòng Đào tạo',
    createdAt: '22/06/2026 11:00',
    updatedAt: '22/06/2026 11:00',
    status: 'pending',
    statusLabel: 'Từ chối',
    content: `<p style="text-align: center;"><strong>HƯỚNG DẪN ĐĂNG KÝ HỌC PHẦN KỲ 3</strong></p>
<p>&nbsp;</p>
<p>Đăng ký HP từ 01/07 đến 10/07/2026.</p>`,
    signers: [
      { name: 'PGS.TS. Lê Thị Lan', role: 'Trưởng phòng Đào tạo', status: 'pending', signedAt: null },
    ],
    recipients: ['Sinh viên', 'Các Khoa', 'Phòng Đào tạo'],
    history: [
      { version: '1.0', time: '22/06/2026 11:00', user: 'Hoàng Văn E', action: 'Tạo mới' },
    ],
  },
};

const STATUS_CONFIG: Record<DocStatus, { variant: 'info' | 'success' | 'warning' | 'neutral'; statusKey: string; icon: React.ReactNode }> = {
  draft: { variant: 'info', statusKey: 'status.draft', icon: <PenLine className="h-3.5 w-3.5" /> },
  pending: { variant: 'warning', statusKey: 'status.pending', icon: <Clock className="h-3.5 w-3.5" /> },
  approved: { variant: 'success', statusKey: 'status.approved', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  signed: { variant: 'success', statusKey: 'status.signed', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
};

interface DocumentDetailPageProps {
  id?: string;
}

export default function DocumentDetailPage({ id }: DocumentDetailPageProps) {
  const params = useParams();
  const actualId = id ?? (params.id ?? '');
  const { t } = useTranslation('dms');
  const d = MOCK_MAP[actualId];
  const sc = d ? STATUS_CONFIG[d.status] : undefined;
  const [showDelete, setShowDelete] = useState(false);

  if (!d || !sc) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{t('document.detail.notFound')}</p>
      </div>
    );
  }

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
              <Button className="flex-1 !bg-[rgb(var(--error))] hover:!bg-[rgb(var(--error-light))]" onClick={() => setShowDelete(false)}>
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
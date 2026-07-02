import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Eye,
  ArrowUpDown,
  Bell,
  Clock,
  Shield,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useTranslation } from 'react-i18next';

const DOC = {
  id: 'd001',
  number: 'CV-2026-0234',
  title: 'Công văn về việc tăng cường an ninh mạng',
  type: 'cv',
  typeLabel: 'Công văn',
  from: 'Bộ GD&ĐT',
  to: 'Các trường đại học trên toàn quốc',
  date: '2026-06-20',
  deadline: '5 ngày nữa',
  urgency: 'khẩn',
  unread: true,
  preview: 'Công văn yêu cầu các trường đại học tăng cường các biện pháp bảo đảm an ninh mạng, bảo vệ dữ liệu cá nhân sinh viên và nhân viên.',
  tags: ['Công nghệ', 'An ninh', 'Bộ GD&ĐT'],
  body: `
    <h2>Kính gửi: Ban Giám hiệu các trường đại học</h2>
    <p>Thời gian gần đây, lực lượng An ninh mạng phát hiện nhiều vụ tấn công vào hệ thống thông tin của các trường đại học trên cả nước. Nhằm tăng cường công tác bảo vệ dữ liệu, Bộ GD&ĐT đề nghị các trường thực hiện các biện pháp sau:</p>
    <h3>1. Kiểm tra và cập nhật hệ thống</h3>
    <p>Rà soát toàn bộ hệ thống thông tin, cập nhật bản vá bảo mật, kiểm tra firewall và hệ thống phát hiện xâm nhập.</p>
    <h3>2. Bảo vệ dữ liệu cá nhân</h3>
    <p>Đảm bảo tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân. Mã hóa dữ liệu nhạy cảm, giới hạn quyền truy cập.</p>
    <h3>3. Báo cáo định kỳ</h3>
    <p>Gửi báo cáo đánh giá rủi ro bảo mật về Bộ GD&ĐT trước ngày 30/06/2026.</p>
    <p>Mọi thắc mắc xin liên hệ: phong-cntt@moet.gov.vn</p>
  `,
  workflow: [
    { step: 'Nhận văn bản', assignee: 'Phòng CNTT', status: 'completed', completedAt: '2026-06-20 09:00' },
    { step: 'Phân công xử lý', assignee: 'Trưởng phòng CNTT', status: 'completed', completedAt: '2026-06-20 10:30' },
    { step: 'Xử lý & Phân tích', assignee: 'Đội An ninh mạng', status: 'processing', completedAt: null },
    { step: 'Trình ký', assignee: 'Phó Hiệu trưởng', status: 'pending', completedAt: null },
    { step: 'Hoàn tất', assignee: 'Ban Giám hiệu', status: 'pending', completedAt: null },
  ],
  comments: [
    { id: 'c1', author: 'Trần Thị Lan', role: 'Trưởng phòng CNTT', text: 'Đã phân công cho đội An ninh mạng rà soát hệ thống.', time: '2026-06-20 10:35', resolved: false },
    { id: 'c2', author: 'Bùi Minh Tuấn', role: 'Chuyên viên CNTT', text: 'Đã bắt đầu quét lỗ hổng, đã phát hiện 2 vấn đề nhỏ đã được sửa.', time: '2026-06-20 14:20', resolved: false },
  ],
};

const URGENCY_CONFIG: Record<string, { color: 'error' | 'neutral' | 'warning' }> = {
  khẩn: { color: 'error' },
  thường: { color: 'neutral' },
  mật: { color: 'warning' },
};

const workflowKeys = [
  'workflow.receiveDoc',
  'workflow.assign',
  'workflow.process',
  'workflow.submitSign',
  'workflow.complete',
] as const;

export default function DMSDocumentDetail() {
  const { t } = useTranslation('dms');
  const [newComment, setNewComment] = useState('');

  const uc = URGENCY_CONFIG[DOC.urgency as keyof typeof URGENCY_CONFIG];
  const urgencyKey = DOC.urgency === 'khẩn' ? 'khan' : DOC.urgency === 'mật' ? 'mat' : 'thuong';

  const docInfoItems = [
    { labelKey: 'inbox.docNumber', value: DOC.number },
    { labelKey: 'inbox.docType', value: DOC.typeLabel },
    { labelKey: 'inbox.urgencyLabel', value: t(`urgency.${urgencyKey}`) },
    { labelKey: 'inbox.fromUnit', value: DOC.from },
    { labelKey: 'inbox.receiveDate', value: DOC.date },
    { labelKey: 'inbox.deadlineLabel', value: DOC.deadline },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('document.detail.titleWithNumber', { number: DOC.number })}
        description={DOC.title}
        breadcrumbs={[
          { label: 'DMS', href: '/dms' },
          { label: t('inbox.breadcrumbInbox'), href: '/dms' },
          { label: DOC.number },
        ]}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            <Link to="/dms">{t('common.backToList')}</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant={uc.color as any}>{t(`urgency.${urgencyKey}`)}</Badge>
                    <Badge variant="neutral">{DOC.typeLabel}</Badge>
                    {DOC.unread && <Badge variant="primary">{t('status.unread')}</Badge>}
                  </div>
                  <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">{DOC.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[rgb(var(--text-muted))]">
                    <span>{t('inbox.docNumber')}: <strong className="text-[rgb(var(--text-secondary))]">{DOC.number}</strong></span>
                    <span>·</span>
                    <span>{t('dashboard.from')}: {DOC.from}</span>
                    <span>·</span>
                    <span>{t('inbox.receiveDate')}: {DOC.date}</span>
                    <span>·</span>
                    <span className="text-[rgb(var(--error))] font-medium">{t('inbox.deadlineLabel')}: {DOC.deadline}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                  {t('inbox.viewPdf')}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {DOC.tags.map((tag) => (
                  <Badge key={tag} variant="neutral">{tag}</Badge>
                ))}
              </div>

              <div className="border-t border-[rgb(var(--border)/0.6)] pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-2">{t('document.detail.contentTitle')}</h4>
                <div
                  className="prose prose-sm max-w-none text-[rgb(var(--text-secondary))] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: DOC.body }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[rgb(var(--primary))]" />
                {t('common.comment')} ({DOC.comments.length})
              </h3>
            </div>
            <CardContent className="space-y-4">
              {DOC.comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">
                    {c.author.split(' ').map((n) => n[0]).slice(-2).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{c.author}</span>
                      <Badge variant="neutral" size="sm">{c.role}</Badge>
                      <span className="text-[10px] text-[rgb(var(--text-muted))]">{c.time}</span>
                    </div>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">{c.text}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-2 border-t border-[rgb(var(--border)/0.6)]">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t('common.writeComment')}
                  className="flex-1 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]"
                />
                <Button size="sm" leftIcon={<ArrowUpDown className="h-3.5 w-3.5" />}>{t('common.send')}</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('inbox.actionsTitle')}</h3>
            </div>
            <CardContent className="space-y-2 pt-3">
              <Button fullWidth size="sm" leftIcon={<ArrowUpDown className="h-4 w-4" />}>{t('action.transfer')}</Button>
              <Button fullWidth size="sm" variant="outline" leftIcon={<Shield className="h-4 w-4" />}>{t('action.signVgca')}</Button>
              <Button fullWidth size="sm" variant="outline" leftIcon={<Bell className="h-4 w-4" />}>{t('action.remind')}</Button>
              <Button fullWidth size="sm" variant="outline">{t('action.archive')}</Button>
              <Button fullWidth size="sm" variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('common.download')}</Button>
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('inbox.docInfoTitle')}</h3>
            </div>
            <CardContent className="space-y-3 pt-3">
              {docInfoItems.map((item) => (
                <div key={item.labelKey} className="flex justify-between text-sm">
                  <span className="text-[rgb(var(--text-muted))]">{t(item.labelKey)}</span>
                  <span className="font-medium text-[rgb(var(--text-primary))]">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('inbox.workflowTitle')}</h3>
            </div>
            <CardContent className="pt-4">
              <div className="space-y-0">
                {DOC.workflow.map((step, i) => {
                  return (
                    <div key={step.step} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          step.status === 'completed' ? 'bg-[rgb(var(--success))] text-white' :
                          step.status === 'processing' ? 'bg-[rgb(var(--primary))] text-white animate-pulse' :
                          'bg-[rgb(var(--bg-base))] border border-[rgb(var(--border))] text-[rgb(var(--text-muted))]'
                        }`}>
                          {step.status === 'completed' ? '✓' : i + 1}
                        </div>
                        {i < DOC.workflow.length - 1 && (
                          <div className={`w-0.5 flex-1 ${step.status === 'completed' ? 'bg-[rgb(var(--success))]' : 'bg-[rgb(var(--border))]'}`}
                            style={{ minHeight: 32 }}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className={`text-sm font-medium ${step.status === 'completed' ? 'text-[rgb(var(--text-primary))]' : 'text-[rgb(var(--text-muted))]'}`}>
                          {t(`inbox.${workflowKeys[i]}`)}
                        </p>
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{step.assignee}</p>
                        {step.completedAt && (
                          <p className="text-[10px] text-[rgb(var(--text-muted))] mt-0.5">{step.completedAt}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

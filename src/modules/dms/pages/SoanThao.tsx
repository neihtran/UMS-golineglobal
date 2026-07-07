import { useState } from 'react';
import {
  Save,
  Send,
  Upload,
  Eye,
  Clock,
  Tag,
  ChevronRight,
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  Image,
  Paperclip,
  AlertTriangle,
} from 'lucide-react';
import { Button, Card, CardContent, Modal } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useTranslation } from 'react-i18next';

const DOC_TYPES = [
  { value: 'qd', labelKey: 'docType.qd', code: 'QĐ' },
  { value: 'cv', labelKey: 'docType.cv', code: 'CV' },
  { value: 'bc', labelKey: 'docType.bc', code: 'BC' },
  { value: 'tb', labelKey: 'docType.tb', code: 'TB' },
  { value: 'cn', labelKey: 'soanthao.chỉ thị - Nghị quyết', code: 'CT/NQ' },
];

const FLOW_ROLES = [
  { id: 'r1', label: 'Người soạn thảo', role: 'NHAN_VIEN', assignee: 'TS. Nguyễn Văn A', dept: 'Văn phòng' },
  { id: 'r2', label: 'Trưởng phòng phụ trách', role: 'TRUONG_KHOA', assignee: 'PGS.TS. Trần Văn B', dept: 'Văn phòng' },
  { id: 'r3', label: 'Phó Hiệu trưởng phụ trách', role: 'PHO_HIEU_TRUONG', assignee: 'PGS.TS. Lê Thị C', dept: 'Ban Giám hiệu' },
  { id: 'r4', label: 'Hiệu trưởng ký', role: 'HIEU_TRUONG', assignee: 'PGS.TS. Nguyễn H. D', dept: 'Ban Giám hiệu' },
];

const FLOW_ROLE_LABEL_KEYS = [
  'soanthao.flowRole.drafter',
  'soanthao.flowRole.deptHead',
  'soanthao.flowRole.viceRector',
  'soanthao.flowRole.rector',
] as const;

const URGENCY_OPTIONS = [
  { value: 'normal', labelKey: 'soanthao.urgencyNormal' },
  { value: 'urgent', labelKey: 'soanthao.urgencyUrgent' },
  { value: 'very_urgent', labelKey: 'soanthao.urgencyVeryUrgent' },
] as const;

const SECURITY_OPTIONS = [
  { value: 'public', labelKey: 'soanthao.securityPublic' },
  { value: 'internal', labelKey: 'soanthao.securityInternal' },
  { value: 'secret', labelKey: 'soanthao.securitySecret' },
] as const;

export default function SoanThao() {
  const { t } = useTranslation('dms');
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('qd');
  const [urgency, setUrgency] = useState('normal');
  const [security, setSecurity] = useState('internal');
  const [showPreview, setShowPreview] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);

  const selectedType = DOC_TYPES.find((d) => d.value === docType);
  const previewCode = `${selectedType?.code ?? 'VB'}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('soanthao.title')}
        description={t('soanthao.description')}
        breadcrumbs={[{ label: 'DMS', href: '/dms' }, { label: t('soanthao.breadcrumbDraft') }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Eye className="h-4 w-4" />} onClick={() => setShowPreview(true)}>{t('soanthao.preview')}</Button>
            <Button variant="outline" leftIcon={<Save className="h-4 w-4" />}>{t('soanthao.saveDraft')}</Button>
            <Button leftIcon={<Send className="h-4 w-4" />}>{t('soanthao.sendApproval')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Editor */}
        <Card className="lg:col-span-2">
          <CardContent className="space-y-5 p-5">
            {/* Meta row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--text-secondary))] mb-1.5 uppercase tracking-wide">{t('soanthao.docTypeLabel')}</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]"
                >
                  {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{t(d.labelKey)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--text-secondary))] mb-1.5 uppercase tracking-wide">{t('soanthao.docCode')}</label>
                <input
                  readOnly
                  value={previewCode}
                  className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] px-3 text-sm font-mono text-[rgb(var(--text-muted))]"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[rgb(var(--text-secondary))] mb-1.5 uppercase tracking-wide">{t('soanthao.abstractLabel')}</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('soanthao.abstractPlaceholder')}
                  className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--text-secondary))] mb-1.5 uppercase tracking-wide">{t('soanthao.urgencyLabel')}</label>
                <div className="flex gap-2">
                  {URGENCY_OPTIONS.map((u) => (
                    <button
                      key={u.value}
                      onClick={() => setUrgency(u.value)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        urgency === u.value
                          ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))] text-white'
                          : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary-light))]'
                      }`}
                    >
                      {t(u.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--text-secondary))] mb-1.5 uppercase tracking-wide">{t('soanthao.securityLabel')}</label>
                <div className="flex gap-2">
                  {SECURITY_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSecurity(s.value)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        security === s.value
                          ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))] text-white'
                          : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary-light))]'
                      }`}
                    >
                      {t(s.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1 border-b border-[rgb(var(--border)/0.6)] pb-3">
              <button className="rounded p-1.5 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))]"><Bold className="h-4 w-4" /></button>
              <button className="rounded p-1.5 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))]"><Italic className="h-4 w-4" /></button>
              <button className="rounded p-1.5 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))]"><Underline className="h-4 w-4" /></button>
              <div className="mx-1 h-4 w-px bg-[rgb(var(--border))]" />
              <button className="rounded p-1.5 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))]"><List className="h-4 w-4" /></button>
              <button className="rounded p-1.5 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))]"><AlignLeft className="h-4 w-4" /></button>
              <div className="mx-1 h-4 w-px bg-[rgb(var(--border))]" />
              <button className="rounded p-1.5 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))]"><Image className="h-4 w-4" /></button>
              <button className="rounded p-1.5 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))]" onClick={() => setShowAttachModal(true)}>
                <Paperclip className="h-4 w-4" />
              </button>
            </div>

            {/* Content area */}
            <div className="min-h-[300px] rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-4">
              <div className="mb-4 text-center border-b border-[rgb(var(--border)/0.4)] pb-4">
                <p className="text-xs text-[rgb(var(--text-muted))]">{t('soanthao.logoPlaceholder')}</p>
                <h2 className="text-base font-bold text-[rgb(var(--text-primary))] mt-2">{title || t('soanthao.draftTitle')}</h2>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{t('soanthao.docNumber', { code: previewCode })}</p>
              </div>
              <textarea
                placeholder={t('soanthao.contentPlaceholder')}
                className="w-full min-h-[220px] rounded border-0 bg-transparent text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none resize-y"
              />
            </div>
          </CardContent>
        </Card>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Routing flow */}
          <Card>
            <div className="px-4 py-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">{t('soanthao.approvalFlow')}</h3>
            </div>
            <CardContent className="p-3 space-y-1">
              {FLOW_ROLES.map((role, i) => (
                <div key={role.id} className="flex items-center gap-3 py-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[rgb(var(--text-primary))]">{t(FLOW_ROLE_LABEL_KEYS[i])}</p>
                    <p className="text-[10px] text-[rgb(var(--text-muted))]">{role.assignee} · {role.dept}</p>
                  </div>
                  {i < FLOW_ROLES.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-[rgb(var(--text-muted))] shrink-0" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <div className="px-4 py-3 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">{t('soanthao.attachments')}</h3>
              <button
                onClick={() => setShowAttachModal(true)}
                className="rounded p-1 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)/0.05)]"
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>
            <CardContent className="p-3">
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="h-10 w-10 rounded-full bg-[rgb(var(--bg-hover))] flex items-center justify-center mb-2">
                  <Paperclip className="h-5 w-5 text-[rgb(var(--text-muted))]" />
                </div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{t('soanthao.noAttachments')}</p>
                <button
                  onClick={() => setShowAttachModal(true)}
                  className="mt-2 text-xs font-medium text-[rgb(var(--primary))] hover:underline"
                >
                  {t('soanthao.addAttachment')}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Meta summary */}
          <Card>
            <div className="px-4 py-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">{t('soanthao.docInfo')}</h3>
            </div>
            <CardContent className="p-4 space-y-2.5">
              {[
                { icon: <Tag className="h-3.5 w-3.5" />, labelKey: 'common.type', valueKey: selectedType?.labelKey ? t(selectedType.labelKey) : '—' },
                { icon: <Clock className="h-3.5 w-3.5" />, labelKey: 'soanthao.dateLabel', valueKey: new Date().toLocaleDateString('vi-VN') },
                { icon: <AlertTriangle className="h-3.5 w-3.5" />, labelKey: 'soanthao.levelLabel', valueKey: URGENCY_OPTIONS.find(u => u.value === urgency) ? t(URGENCY_OPTIONS.find(u => u.value === urgency)!.labelKey) : '' },
                { icon: <Eye className="h-3.5 w-3.5" />, labelKey: 'soanthao.securityLabel', valueKey: SECURITY_OPTIONS.find(s => s.value === security) ? t(SECURITY_OPTIONS.find(s => s.value === security)!.labelKey) : '' },
              ].map(({ icon, labelKey, valueKey }) => (
                <div key={labelKey} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-[rgb(var(--text-muted))]">{icon}</span>
                  <div>
                    <p className="text-[10px] text-[rgb(var(--text-muted))] uppercase">{t(labelKey)}</p>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{valueKey}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview modal */}
      <Modal open={showPreview} onClose={() => setShowPreview(false)} title={t('soanthao.previewTitle')}>
        <div className="space-y-4">
          <div className="rounded-lg border border-[rgb(var(--border))] bg-white p-8 text-black min-h-[400px]">
            <div className="text-center mb-6 border-b pb-4">
              <p className="text-xs text-gray-400">{t('soanthao.logoPlaceholder')}</p>
              <h2 className="text-lg font-bold mt-2">{title || t('soanthao.draftTitle')}</h2>
              <p className="text-xs text-gray-400 mt-1">{t('soanthao.docNumber', { code: previewCode })}</p>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700">
              <p className="text-sm leading-relaxed text-gray-400 italic">{t('soanthao.previewEmpty')}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>{t('common.close')}</Button>
            <Button leftIcon={<Send className="h-4 w-4" />}>{t('soanthao.sendApproval')}</Button>
          </div>
        </div>
      </Modal>

      {/* Attach modal */}
      <Modal open={showAttachModal} onClose={() => setShowAttachModal(false)} title={t('soanthao.attachModalTitle')}>
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-dashed border-[rgb(var(--border))] p-8 text-center hover:border-[rgb(var(--primary-light))] transition-colors cursor-pointer">
            <Upload className="h-8 w-8 text-[rgb(var(--text-muted))] mx-auto mb-2" />
            <p className="text-sm text-[rgb(var(--text-secondary))]">{t('soanthao.dragDropHint')}</p>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{t('soanthao.fileTypesHint')}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAttachModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => setShowAttachModal(false)}>{t('common.add')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

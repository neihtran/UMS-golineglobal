import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save, Send, FileText, Bold, Italic, Underline,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Link, Image, Table, Download, Eye, Printer, X, ZoomIn,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useTranslation } from 'react-i18next';

const TYPE_OPTIONS = [
  { id: 'cv', labelKey: 'docType.cv', prefix: 'CV' },
  { id: 'qd', labelKey: 'docType.qd', prefix: 'QD' },
  { id: 'tb', labelKey: 'docType.tb', prefix: 'TB' },
  { id: 'hd', labelKey: 'soanthao.hd', prefix: 'HD' },
  { id: 'bc', labelKey: 'docType.bc', prefix: 'BC' },
];

const URGENCY_OPTIONS = [
  { id: 'thường', labelKey: 'urgency.thuong', color: 'neutral' },
  { id: 'khẩn', labelKey: 'urgency.khan', color: 'error' },
  { id: 'mật', labelKey: 'urgency.mat', color: 'warning' },
];

const INTERNAL_OPTIONS = [
  { id: 'noi-bo', labelKey: 'scope.noi_bo' },
  { id: 'di-ngoai', labelKey: 'scope.di_ngoai' },
  { id: 'di-noi-bo', labelKey: 'scope.di_noi_bo' },
];

const TOOLBAR_GROUPS = [
  {
    group: 'format',
    items: [{ icon: Bold, labelKey: 'soanthaoMoi.formatBold' }, { icon: Italic, labelKey: 'soanthaoMoi.formatItalic' }, { icon: Underline, labelKey: 'soanthaoMoi.formatUnderline' }],
  },
  {
    group: 'list',
    items: [{ icon: List, labelKey: 'soanthaoMoi.formatList' }, { icon: ListOrdered, labelKey: 'soanthaoMoi.formatListOrdered' }],
  },
  {
    group: 'align',
    items: [{ icon: AlignLeft, labelKey: 'soanthaoMoi.alignLeft' }, { icon: AlignCenter, labelKey: 'soanthaoMoi.alignCenter' }, { icon: AlignRight, labelKey: 'soanthaoMoi.alignRight' }],
  },
  {
    group: 'insert',
    items: [{ icon: Link, labelKey: 'soanthaoMoi.insertLink' }, { icon: Image, labelKey: 'soanthaoMoi.insertImage' }, { icon: Table, labelKey: 'soanthaoMoi.insertTable' }],
  },
];

const TEMPLATE = `<p style="text-align: right;"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></p>
<p style="text-align: right;"><strong>Độc lập - Tự do - Hạnh phúc</strong></p>
<hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;" />
<p style="text-align: center;"><strong>SỐ: ___________/2026-________</strong></p>
<p>&nbsp;</p>
<p style="text-align: center; font-size: 16px;"><strong>TIÊU ĐỀ VĂN BẢN</strong></p>
<p>&nbsp;</p>
<p><strong>Kính gửi:</strong> [Tên đơn vị/người nhận]</p>
<p>&nbsp;</p>
<p>[Nội dung văn bản...]</p>
<p>&nbsp;</p>
<p><strong>Nơi nhận:</strong></p>
<ul>
<li>- Như trên;</li>
<li>- Lưu.</li>
</ul>`;

// Dữ liệu mock — ánh xạ id → văn bản cần sửa
const DOC_REGISTRY: Record<string, {
  typeId: string;
  typeLabelKey: string;
  title: string;
  abstract: string;
  urgencyId: string;
  internalId: string;
  content: string;
}> = {
  d1: {
    typeId: 'cv',
    typeLabelKey: 'docType.cv',
    title: 'Quy chế đào tạo thạc sĩ ngành CNTT',
    abstract: 'Quy định về quy chế đào tạo thạc sĩ ngành Công nghệ Thông tin, bao gồm điều kiện tuyển sinh, chương trình đào tạo, đánh giá và cấp bằng.',
    urgencyId: 'thường',
    internalId: 'di-noi-bo',
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
<p><strong>Điều 2. Đối tượng áp dụng</strong></p>
<p>Quy chế này áp dụng cho thí sinh dự thi, học viên, giảng viên và các đơn vị có liên quan.</p>
<p>&nbsp;</p>
<p><strong>Nơi nhận:</strong></p>
<ul>
<li>- Như trên;</li>
<li>- Lưu.</li>
</ul>`,
  },
  d2: {
    typeId: 'kh',
    typeLabelKey: 'soanthaoMoi.typeKh',
    title: 'Kế hoạch tuyển sinh HK1 2026-2027',
    abstract: 'Kế hoạch tuyển sinh hệ đại học chính quy, liên thông, vừa làm vừa học năm học 2026-2027 của Trường Đại học.',
    urgencyId: 'thường',
    internalId: 'di-noi-bo',
    content: `<p style="text-align: right;"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></p>
<p style="text-align: right;"><strong>Độc lập - Tự do - Hạnh phúc</strong></p>
<hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;" />
<p style="text-align: center;"><strong>SỐ: KH-2026-015/ĐT-ĐH</strong></p>
<p>&nbsp;</p>
<p style="text-align: center; font-size: 16px;"><strong>KẾ HOẠCH TUYỂN SINH HỌC KỲ 1 NĂM HỌC 2026-2027</strong></p>
<p>&nbsp;</p>
<p><strong>Kính gửi:</strong> Hiệu trưởng, Phó Hiệu trưởng, Trưởng các Khoa/Phòng/Bộ môn</p>
<p>&nbsp;</p>
<p>Căn cứ Quy chế tuyển sinh đại học, cao đẳng ngành Giáo dục Mầm non;</p>
<p>Căn cứ Kế hoạch năm học 2026-2027;</p>
<p>&nbsp;</p>
<p><strong>Điều 1. Đối tượng tuyển sinh</strong></p>
<p>Tuyển sinh hệ đại học chính quy các ngành đào tạo của Trường.</p>
<p>&nbsp;</p>
<p><strong>Nơi nhận:</strong></p>
<ul>
<li>- Như trên;</li>
<li>- Lưu.</li>
</ul>`,
  },
};

function countWords(html: string) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
  const tokens = text.split(/\s+/).filter(Boolean);
  return { words: tokens.length, chars: text.replace(/\s+/g, '').length };
}

function countLines(html: string) {
  return (html.match(/<p/g) || []).length;
}

export default function SoanThaoMoiPage() {
  const { t } = useTranslation('dms');
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Khi edit → load data từ registry, không thì blank
  const initData = isEditMode ? DOC_REGISTRY[id!] : null;
  const initDocType = isEditMode && initData ? TYPE_OPTIONS.find((tp) => tp.id === initData!.typeId) ?? null : null;
  const initUrgency = isEditMode && initData ? URGENCY_OPTIONS.find((u) => u.id === initData!.urgencyId) ?? null : null;
  const initInternal = isEditMode && initData ? INTERNAL_OPTIONS.find((i) => i.id === initData!.internalId) ?? null : null;

  const [docType, setDocType] = useState<typeof TYPE_OPTIONS[0] | null>(initDocType);
  const [urgency, setUrgency] = useState<typeof URGENCY_OPTIONS[0] | null>(initUrgency);
  const [internalType, setInternalType] = useState<typeof INTERNAL_OPTIONS[0] | null>(initInternal);
  const [title, setTitle] = useState(initData?.title ?? '');
  const [abstract, setAbstract] = useState(initData?.abstract ?? '');
  const [content, setContent] = useState(initData?.content ?? TEMPLATE);
  const [htmlView, setHtmlView] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const stats = useMemo(() => countWords(content), [content]);
  const lines = useMemo(() => countLines(content), [content]);
  const pageCount = Math.max(1, Math.ceil(lines / 28));

  const pageTitle = isEditMode
    ? t('soanthaoMoi.titleEdit')
    : (title || t('soanthaoMoi.titleNew'));

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageTitle}
        description={
          isEditMode
            ? t(initData?.typeLabelKey ?? '')
            : docType
              ? `${t(docType.labelKey)}${title ? ` · "${title}"` : ` · ${t('soanthaoMoi.noTitle')}`}`
              : t('soanthaoMoi.noTypeSelected')
        }
        breadcrumbs={[
          { label: 'DMS', href: '/dms' },
          { label: t('draft.breadcrumb'), href: '/dms/ban-nhap' },
          { label: isEditMode ? t('soanthaoMoi.breadcrumbEdit') : (title || t('soanthaoMoi.breadcrumbNew')) },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />} onClick={() => setPreviewOpen(true)}>
              {t('soanthaoMoi.preview')}
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Printer className="h-4 w-4" />}>{t('soanthaoMoi.print')}</Button>
            <Button variant="outline" size="sm" leftIcon={<Save className="h-4 w-4" />} onClick={() => setSaved(true)}>
              {saved ? `${t('soanthaoMoi.saved')} ✓` : t('soanthaoMoi.saveDraft')}
            </Button>
            <Button
              size="sm"
              leftIcon={<Send className="h-4 w-4" />}
              onClick={() => isEditMode ? navigate(`/dms/cho-ky/${id}`) : navigate('/dms/cho-ky')}
              disabled={!docType || !title.trim()}
            >
              {t('soanthaoMoi.sendSign')}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6" style={{ gridTemplateColumns: docType ? '300px 1fr' : '1fr' }}>
        {/* LEFT: Metadata */}
        {docType && (
          <div className="space-y-4">
            <Card>
              <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('soanthaoMoi.docTypeTitle')}</h3>
              </div>
              <CardContent className="p-3 space-y-1.5">
                {TYPE_OPTIONS.map((tp) => (
                  <button
                    key={tp.id}
                    onClick={() => setDocType(tp)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                      docType.id === tp.id
                        ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.04)]'
                        : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.3)]'
                    }`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      docType.id === tp.id ? 'bg-[rgb(var(--primary))] text-white' : 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]'
                    }`}>{tp.prefix}</div>
                    <span className={`text-sm font-medium ${docType.id === tp.id ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-primary))]'}`}>{t(tp.labelKey)}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
                <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('soanthaoMoi.docInfoTitle')}</h3>
              </div>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[rgb(var(--text-secondary))] mb-1.5">
                    {t('soanthaoMoi.titleField')} <span className="text-[rgb(var(--error))]">{t('soanthaoMoi.titleRequired')}</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('soanthaoMoi.titlePlaceholder')}
                    className="w-full h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('soanthaoMoi.abstractField')}</label>
                  <textarea
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    placeholder={t('soanthaoMoi.abstractPlaceholder')}
                    rows={3}
                    className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('soanthaoMoi.urgencyField')}</label>
                  <div className="flex gap-2">
                    {URGENCY_OPTIONS.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => setUrgency(u)}
                        className={`flex-1 px-2 py-1.5 rounded-lg border text-xs font-medium text-center transition-all ${
                          urgency?.id === u.id
                            ? `border-[rgb(var(--${u.color}))] bg-[rgb(var(--${u.color})/0.1)] text-[rgb(var(--${u.color}))]`
                            : 'border-[rgb(var(--border))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary)/0.3)]'
                        }`}
                      >{t(u.labelKey)}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[rgb(var(--text-secondary))] mb-1.5">{t('soanthaoMoi.scopeField')}</label>
                  <div className="space-y-1.5">
                    {INTERNAL_OPTIONS.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setInternalType(o)}
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs font-medium text-left transition-all ${
                          internalType?.id === o.id
                            ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.04)] text-[rgb(var(--primary))]'
                            : 'border-[rgb(var(--border))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary)/0.3)]'
                        }`}
                      >{t(o.labelKey)}</button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <div className="flex-1 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-3 text-center">
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{stats.words}</p>
                <p className="text-[10px] text-[rgb(var(--text-muted))]">{t('soanthaoMoi.words')}</p>
              </div>
              <div className="flex-1 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-3 text-center">
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{stats.chars}</p>
                <p className="text-[10px] text-[rgb(var(--text-muted))]">{t('soanthaoMoi.chars')}</p>
              </div>
              <div className="flex-1 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-3 text-center">
                <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{pageCount}</p>
                <p className="text-[10px] text-[rgb(var(--text-muted))]">{t('soanthaoMoi.pages')}</p>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT: Editor */}
        {docType && (
          <div className="space-y-3">
            {/* Title bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-[rgb(var(--text-muted))]">
                      {docType.prefix}-{new Date().getFullYear()}-{'___'}
                    </p>
                    <h2 className="text-base font-bold text-[rgb(var(--text-primary))] truncate">
                      {title || <span className="text-[rgb(var(--text-muted))] font-normal italic">{t('soanthaoMoi.noTitle')}</span>}
                    </h2>
                  </div>
                  {!isEditMode && (
                    <button
                      onClick={() => { setDocType(null); setTitle(''); setContent(TEMPLATE); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))] transition-colors"
                      title={t('soanthao.clickToChange')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Toolbar */}
            <Card className="!rounded-b-none">
              <div className="px-4 py-2 border-b border-[rgb(var(--border)/0.6)] flex items-center gap-1 flex-wrap">
                {TOOLBAR_GROUPS.map((group, gi) => (
                  <div key={group.group} className="flex items-center">
                    {group.items.map((item) => (
                      <button
                        key={item.labelKey}
                        title={t(item.labelKey)}
                        className="flex h-8 w-8 items-center justify-center rounded text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))] transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                      </button>
                    ))}
                    {gi < TOOLBAR_GROUPS.length - 1 && (
                      <div className="h-5 w-px bg-[rgb(var(--border))] mx-1.5" />
                    )}
                  </div>
                ))}
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => setHtmlView(!htmlView)}
                    className={`h-7 px-2.5 rounded text-xs font-medium transition-colors ${
                      htmlView ? 'bg-[rgb(var(--primary))] text-white' : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))]'
                    }`}
                  >
                    {t('soanthaoMoi.html')}
                  </button>
                </div>
              </div>
            </Card>

            {/* Editor */}
            <Card className="!rounded-t-none">
              {htmlView ? (
                <CardContent className="p-4">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-96 font-mono text-sm text-[rgb(var(--text-secondary))] bg-[rgb(var(--bg-base))] rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2"
                  />
                </CardContent>
              ) : (
                <CardContent className="p-8 min-h-[480px] bg-white">
                  <div
                    className="prose max-w-none text-sm text-gray-800"
                    dangerouslySetInnerHTML={{ __html: content }}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setContent((e.target as HTMLElement).innerHTML)}
                  />
                </CardContent>
              )}
            </Card>

            {/* Footer */}
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-[rgb(var(--text-muted))]">
                {t('soanthao.autoSave')}: {saved ? t('soanthao.autoSaveNow') : t('soanthao.autoSaveAgo', { minutes: 2 })}
              </p>
              <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
                {t('common.downloadDocx')}
              </Button>
            </div>
          </div>
        )}

        {/* Empty: choose doc type */}
        {!docType && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center h-96 rounded-xl border-2 border-dashed border-[rgb(var(--border))]">
              <div className="text-center">
                <FileText className="h-16 w-16 text-[rgb(var(--text-muted))] mx-auto mb-4" />
                <p className="text-base font-semibold text-[rgb(var(--text-primary))]">
                  {isEditMode ? t('soanthaoMoi.noDocFound') : t('soanthaoMoi.chooseDocType')}
                </p>
                <p className="text-sm text-[rgb(var(--text-muted))] mt-1">
                  {isEditMode ? t('soanthaoMoi.noDocFoundHint') : t('soanthaoMoi.chooseDocTypeHint')}
                </p>
              </div>
            </div>
            {!isEditMode && (
              <Card>
                <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
                  <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('soanthaoMoi.docTypeTitle')}</h3>
                </div>
                <CardContent className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TYPE_OPTIONS.map((tp) => (
                    <button
                      key={tp.id}
                      onClick={() => setDocType(tp)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl border border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.4)] hover:bg-[rgb(var(--primary)/0.03)] transition-all"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">{tp.prefix}</div>
                      <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{t(tp.labelKey)}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setPreviewOpen(false); }}
        >
          <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))' }}>
            <div className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgb(var(--border))' }}>
              <div className="flex items-center gap-3">
                <ZoomIn className="h-5 w-5 text-[rgb(var(--text-muted))]" />
                <h2 className="font-bold text-[rgb(var(--text-primary))]">{t('soanthaoMoi.previewModalTitle')}</h2>
                <span className="text-xs text-[rgb(var(--text-muted))]">· A4</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))] transition-colors">
                  <Printer className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))] transition-colors">
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-[rgb(var(--bg-base))]">
              <div className="mx-auto bg-white rounded-lg shadow-lg" style={{ width: '210mm', minHeight: '297mm', padding: '20mm 25mm' }}>
                <div
                  className="prose max-w-none text-sm text-gray-800"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-3 shrink-0"
              style={{ borderTop: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--bg-base))' }}>
              <div className="flex items-center gap-4">
                <span className="text-xs text-[rgb(var(--text-muted))]">
                  {t('soanthaoMoi.wordsPages', { words: stats.words, pages: pageCount })}
                </span>
                <span className="text-xs text-[rgb(var(--text-muted))]">{t('soanthaoMoi.paperSize')}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewOpen(false)}>{t('soanthaoMoi.close')}</Button>
                <Button size="sm" leftIcon={<Printer className="h-4 w-4" />}>{t('soanthaoMoi.printDoc')}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

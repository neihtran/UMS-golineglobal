import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, Download, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useTranslation } from 'react-i18next';

const DOCS: Record<string, {
  number: string;
  title: string;
  signer: string;
  signedAt: string;
  type: string;
  typeLabelKey: string;
  level: string;
  verifyCode: string;
  org: string;
  summary: string;
}> = {
  s1: {
    number: 'QĐ-2026-0156', title: 'Quyết định công nhận tốt nghiệp đợt 1/2026',
    signer: 'PGS.TS. Nguyễn Văn Hiệu', signedAt: '2026-06-25 14:32',
    type: 'qđ', typeLabelKey: 'docType.qd', level: 'Trường', verifyCode: 'VBS-2026-00789',
    org: 'Phòng Đào tạo', summary: 'Công nhận tốt nghiệp cho 125 sinh viên đợt 1/2026 các ngành CNTT, Kinh tế, Luật.',
  },
  s2: {
    number: 'CV-2026-0231', title: 'Công văn về việc triển khai học kỳ 2 năm học 2025-2026',
    signer: 'PGS.TS. Nguyễn Văn Hiệu', signedAt: '2026-06-24 09:15',
    type: 'cv', typeLabelKey: 'docType.cv', level: 'Trường', verifyCode: 'VBS-2026-00788',
    org: 'Phòng Đào tạo', summary: 'Triển khai kế hoạch học kỳ 2/2025-2026, phân công giảng dạy và lịch thi.',
  },
};

const INFO_ITEMS = [
  { labelKey: 'signed.detail.signer' },
  { labelKey: 'signed.detail.orgLabel' },
  { labelKey: 'signed.detail.signTime' },
  { labelKey: 'signed.detail.verifyCode' },
] as const;

export default function SignedDocumentDetail() {
  const { t } = useTranslation('dms');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const doc = DOCS[id ?? ''];

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{t('signed.detail.notFound')}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dms/van-ban-da-ky')}>{t('common.backToList')}</Button>
      </div>
    );
  }

  const infoValues = [doc.signer, doc.org, doc.signedAt, doc.verifyCode];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${doc.number} — ${t('common.detail')}`}
        description={doc.title}
        breadcrumbs={[
          { label: 'DMS', href: '/dms' },
          { label: t('signed.detail.breadcrumbSigned'), href: '/dms/van-ban-da-ky' },
          { label: doc.number },
        ]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Shield className="h-4 w-4" />}>{t('signed.detail.verifySign')}</Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('signed.detail.downloadPdf')}</Button>
            <Button leftIcon={<CheckCircle2 className="h-4 w-4" />}>{t('signed.detail.confirmReceived')}</Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">{t(doc.typeLabelKey)}</Badge>
            <Badge variant="neutral">{doc.level}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {INFO_ITEMS.map((item, i) => (
              <div key={item.labelKey}>
                <p className="text-[10px] uppercase text-[rgb(var(--text-muted))]">{t(item.labelKey)}</p>
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{infoValues[i]}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] uppercase text-[rgb(var(--text-muted))] mb-1">{t('common.summary')}</p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">{doc.summary}</p>
          </div>

          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] p-6 text-center">
            <p className="text-sm text-[rgb(var(--text-muted))]">{t('signed.detail.pdfPreview')}</p>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{t('signed.detail.pdfPreviewHint')}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/dms/van-ban-da-ky')}>
          {t('common.backToList')}
        </Button>
      </div>
    </div>
  );
}

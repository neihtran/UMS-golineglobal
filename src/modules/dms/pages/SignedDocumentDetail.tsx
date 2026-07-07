import { useParams } from 'react-router-dom';
import { Download, CheckCircle2, Shield } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';

interface SignedDocRecord {
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
}

const MOCK_MAP: Record<string, SignedDocRecord> = {
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
  s3: {
    number: 'TB-2026-0112', title: 'Thông báo lịch thi học kỳ 2 năm học 2025-2026',
    signer: 'TS. Trần Thị Hương', signedAt: '2026-06-23 16:45',
    type: 'tb', typeLabelKey: 'docType.tb', level: 'Khoa', verifyCode: 'VBS-2026-00787',
    org: 'Phòng Đào tạo', summary: 'Lịch thi học kỳ 2 năm học 2025-2026 cho tất cả các khoa.',
  },
  s4: {
    number: 'QĐ-2026-0155', title: 'Quyết định bổ nhiệm Trưởng khoa Công nghệ thông tin',
    signer: 'PGS.TS. Nguyễn Văn Hiệu', signedAt: '2026-06-22 11:20',
    type: 'qđ', typeLabelKey: 'docType.qd', level: 'Trường', verifyCode: 'VBS-2026-00786',
    org: 'Phòng Tổ chức', summary: 'Bổ nhiệm Trưởng khoa Công nghệ thông tin nhiệm kỳ 2026-2031.',
  },
  s5: {
    number: 'CV-2026-0228', title: 'Công văn về đăng ký đề tài NCKH cấp trường năm 2026',
    signer: 'PGS.TS. Nguyễn Văn Hiệu', signedAt: '2026-06-21 08:30',
    type: 'cv', typeLabelKey: 'docType.cv', level: 'Trường', verifyCode: 'VBS-2026-00785',
    org: 'Phòng NCKH', summary: 'Đăng ký đề tài NCKH cấp trường năm 2026, hạn chót 30/07/2026.',
  },
  s6: {
    number: 'QĐ-2026-0154', title: 'Quyết định khen thưởng CBGV nhân ngày Nhà giáo Việt Nam 20/11',
    signer: 'PGS.TS. Nguyễn Văn Hiệu', signedAt: '2026-06-20 15:00',
    type: 'qđ', typeLabelKey: 'docType.qd', level: 'Trường', verifyCode: 'VBS-2026-00784',
    org: 'Phòng Tổ chức', summary: 'Khen thưởng CBGV nhân ngày Nhà giáo Việt Nam 20/11 năm 2026.',
  },
  s7: {
    number: 'CV-2026-0225', title: 'Công văn về việc thay đổi lịch thi cuối kỳ',
    signer: 'TS. Trần Thị Hương', signedAt: '2026-06-19 10:00',
    type: 'cv', typeLabelKey: 'docType.cv', level: 'Khoa', verifyCode: 'VBS-2026-00783',
    org: 'Khoa Kinh tế', summary: 'Thay đổi lịch thi cuối kỳ các môn thuộc khoa Kinh tế.',
  },
  s8: {
    number: 'TT-2026-0034', title: 'Tờ trình đề nghị phê duyệt kinh phí mua sắm thiết bị',
    signer: 'PGS.TS. Nguyễn Văn Hiệu', signedAt: '2026-06-18 14:00',
    type: 'tt', typeLabelKey: 'soanthaoMoi.typeTt', level: 'Trường', verifyCode: 'VBS-2026-00782',
    org: 'Phòng Tài chính', summary: 'Đề nghị phê duyệt kinh phí mua sắm thiết bị phòng thí nghiệm CNTT.',
  },
};

const INFO_ITEMS = [
  { labelKey: 'signed.detail.signer' },
  { labelKey: 'signed.detail.orgLabel' },
  { labelKey: 'signed.detail.signTime' },
  { labelKey: 'signed.detail.verifyCode' },
] as const;

interface SignedDocumentDetailProps {
  id?: string;
}

export default function SignedDocumentDetail({ id }: SignedDocumentDetailProps) {
  const params = useParams();
  const actualId = id ?? (params.id ?? '');
  const { t } = useTranslation('dms');
  const doc = MOCK_MAP[actualId];

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-bold text-[rgb(var(--text-primary))]">{t('signed.detail.notFound')}</p>
      </div>
    );
  }

  const infoValues = [doc.signer, doc.org, doc.signedAt, doc.verifyCode];

  return (
    <div className="space-y-6">
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

      <div className="flex justify-start gap-2">
        <Button variant="outline" leftIcon={<Shield className="h-4 w-4" />}>{t('signed.detail.verifySign')}</Button>
        <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('signed.detail.downloadPdf')}</Button>
        <Button leftIcon={<CheckCircle2 className="h-4 w-4" />}>{t('signed.detail.confirmReceived')}</Button>
      </div>
    </div>
  );
}
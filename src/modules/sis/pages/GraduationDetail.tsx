import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const GRADUATION = {
  id: 'gr01', studentId: 'SV-2021-0045', studentName: 'Nguyễn Hoàng Minh',
  class: 'CNTT-K21', major: 'Công nghệ thông tin', dept: 'Khoa CNTT',
  cohort: '2021', enrollmentDate: '2021-09-01', graduationYear: 2025,
  gpa: 3.72, totalCredits: 140, thesisScore: 8.5,
  thesis: 'Nghiên cứu ứng dụng AI trong nhận diện hình ảnh y tế',
  thesisAdvisor: 'PGS.TS. Lê Văn Minh',
  thesisDefendedAt: '2026-01-20', degree: 'Xuất sắc',
  diplomaNo: 'ĐH-2026-00001', diplomaDate: '2026-02-28',
  status: 'graduated', graduationSemester: 'HK2/2024-2025',
};

const REQUIREMENTS = [
  { labelKey: 'graduation.detail.requirementFields.tongTinChi', required: '140', actual: '140', met: true },
  { labelKey: 'graduation.detail.requirementFields.gpaTichLuy', required: '≥ 2.0', actual: '3.72', met: true },
  { labelKey: 'graduation.detail.requirementFields.diemLuanVan', required: '≥ 5.0', actual: '8.5', met: true },
  { labelKey: 'graduation.detail.requirementFields.chungChiGDTC', required: 'Đạt', actual: 'Đạt', met: true },
  { labelKey: 'graduation.detail.requirementFields.chungChiGDP', required: 'Đạt', actual: 'Đạt', met: true },
  { labelKey: 'graduation.detail.requirementFields.ngoaiNgu', required: 'B1', actual: 'B2', met: true },
  { labelKey: 'graduation.detail.requirementFields.ctdt', required: 'Hoàn thành', actual: 'Hoàn thành', met: true },
];

export default function GraduationDetail() {
  const { t } = useTranslation('sis');
  const g = GRADUATION;
  const metCount = REQUIREMENTS.filter((r) => r.met).length;

  const SUMMARY_STATS = [
    { labelKey: 'graduation.detail.summary.gpaTichLuy', value: g.gpa.toFixed(2) },
    { labelKey: 'graduation.detail.summary.tongTinChi', value: g.totalCredits },
    { labelKey: 'graduation.detail.summary.diemLuanVan', value: g.thesisScore.toFixed(1) },
    { labelKey: 'graduation.detail.summary.xeploai', value: g.degree },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${t('graduation.title')} — ${g.studentName}`}
        description={`${g.studentId} · ${g.major} · ${t('graduation.detail.fields.khoaHoc')} ${g.cohort}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('graduation.breadcrumb.list'), href: '/sis/tot-nghiep' },
          { label: g.studentName },
        ]}
        actions={
          <>
            <Link to="/sis/tot-nghiep">
              <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>{t('graduation.detail.back')}</Button>
            </Link>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('graduation.detail.export')}</Button>
            <Button variant="outline" leftIcon={<Printer className="h-4 w-4" />}>{t('graduation.print')}</Button>
          </>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {SUMMARY_STATS.map(({ labelKey, value }) => (
          <Card key={labelKey}>
            <CardContent className="p-4">
              <p className="text-xs text-[rgb(var(--text-muted))]">{t(labelKey)}</p>
              <p className="mt-1 text-xl font-bold text-[rgb(var(--text-primary))]">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Thông tin sinh viên */}
      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('graduation.detail.studentInfo')}</h3>
          <Badge variant="success" dot>{g.status === 'graduated' ? t('graduation.status.graduated') : t('graduation.status.pending_review')}</Badge>
        </div>
        <CardContent className="pt-5 grid grid-cols-3 gap-4">
          {[
            { labelKey: 'graduation.detail.fields.hoTen', value: g.studentName },
            { labelKey: 'graduation.detail.fields.maSinhVien', value: g.studentId },
            { labelKey: 'graduation.detail.fields.lop', value: g.class },
            { labelKey: 'graduation.detail.fields.nganh', value: g.major },
            { labelKey: 'graduation.detail.fields.khoa', value: g.dept },
            { labelKey: 'graduation.detail.fields.khoaHoc', value: g.cohort },
            { labelKey: 'graduation.detail.fields.ngayNhapHoc', value: g.enrollmentDate },
            { labelKey: 'graduation.detail.fields.hocKyXet', value: g.graduationSemester },
            { labelKey: 'graduation.detail.fields.namTotNghiep', value: g.graduationYear },
          ].map(({ labelKey, value }) => (
            <div key={labelKey}>
              <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{t(labelKey)}</p>
              <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Điều kiện tốt nghiệp */}
      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('graduation.detail.requirements')}</h3>
          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{t('graduation.detail.requirementNote', { count: metCount, total: REQUIREMENTS.length })}</p>
        </div>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 gap-3">
            {REQUIREMENTS.map((r) => (
              <div key={r.labelKey} className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] px-4 py-3">
                <span className="text-sm text-[rgb(var(--text-secondary))]">{t(r.labelKey)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[rgb(var(--text-muted))]">{t('graduation.detail.requirementsDetail.required')}: {r.required}</span>
                  <span className={`text-sm font-semibold ${r.met ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--error))]'}`}>{r.actual}</span>
                  {r.met ? (
                    <svg className="h-4 w-4 text-[rgb(var(--success))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="h-4 w-4 text-[rgb(var(--error))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Luận văn */}
      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('graduation.detail.thesis')}</h3>
        </div>
        <CardContent className="pt-5 grid grid-cols-2 gap-4">
          {[
            { labelKey: 'graduation.detail.thesisFields.tenDetai', value: g.thesis },
            { labelKey: 'graduation.detail.thesisFields.nguoiHuongDan', value: g.thesisAdvisor },
            { labelKey: 'graduation.detail.thesisFields.ngayBaoVe', value: g.thesisDefendedAt },
            { labelKey: 'graduation.detail.thesisFields.diemLuanVan', value: `${g.thesisScore}/10` },
          ].map(({ labelKey, value }) => (
            <div key={labelKey}>
              <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{t(labelKey)}</p>
              <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Văn bằng */}
      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center gap-3">
          <Award className="h-5 w-5 text-[rgb(var(--warning))]" />
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('graduation.detail.diploma')}</h3>
        </div>
        <CardContent className="pt-5 grid grid-cols-3 gap-4">
          {[
            { labelKey: 'graduation.detail.diplomaFields.soHieu', value: g.diplomaNo },
            { labelKey: 'graduation.detail.diplomaFields.ngayCap', value: g.diplomaDate },
            { labelKey: 'graduation.detail.diplomaFields.loaiBang', value: 'Cử nhân' },
            { labelKey: 'graduation.detail.diplomaFields.chuyenNganh', value: g.major },
            { labelKey: 'graduation.detail.diplomaFields.hinhThucDaoTao', value: 'Chính quy' },
            { labelKey: 'graduation.detail.diplomaFields.xeploaiTotNghiep', value: g.degree, isRanking: true },
          ].map(({ labelKey, value, isRanking }) => (
            <div key={labelKey}>
              <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{t(labelKey)}</p>
              <p className={`text-sm font-semibold ${isRanking ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--text-primary))]'}`}>{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

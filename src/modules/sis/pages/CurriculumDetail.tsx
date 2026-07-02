import { Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Download, BookOpen, Users, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const PROGRAM = {
  id: 'ct1', code: 'CTDT-CNTT-2021', name: 'Chương trình đào tạo Công nghệ Thông tin',
  version: 'V3.0', year: 2021, totalCredits: 120, minGPA: 2.0,
  degree: 'Đại học', major: 'Công nghệ thông tin',
  duration: '4 năm (8 học kỳ)', targetOutput: 'CDR1, CDR2, CDR3, CDR4',
  description: 'Chương trình đào tạo cử nhân CNTT trang bị kiến thức nền tảng và chuyên sâu về phát triển phần mềm, hệ thống thông tin và an toàn mạng.',
  status: 'active', subjects: 48,
};

const SEMESTERS = [
  {
    semester: 1, name: 'Học kỳ 1', subjects: [
      { code: 'INT1005', name: 'Nhập môn Tin học', credits: 3, type: 'Lý thuyết', hours: 45, exam: 'Thi viết' },
      { code: 'GEN1011', name: 'Toán cao cấp A1', credits: 4, type: 'Lý thuyết', hours: 60, exam: 'Thi viết' },
      { code: 'GEN1012', name: 'Tiếng Anh A1', credits: 3, type: 'Thực hành', hours: 45, exam: 'Thi thực hành' },
      { code: 'GEN1013', name: 'Giáo dục thể chất 1', credits: 1, type: 'Thực hành', hours: 30, exam: 'Đạt/Không đạt' },
      { code: 'GEN1014', name: 'Triết học Mác-Lênin', credits: 3, type: 'Lý thuyết', hours: 45, exam: 'Thi viết' },
    ]
  },
  {
    semester: 2, name: 'Học kỳ 2', subjects: [
      { code: 'INT2201', name: 'Cấu trúc dữ liệu', credits: 4, type: 'Lý thuyết', hours: 60, exam: 'Thi viết' },
      { code: 'GEN1021', name: 'Toán rời rạc', credits: 4, type: 'Lý thuyết', hours: 60, exam: 'Thi viết' },
      { code: 'GEN1022', name: 'Tiếng Anh A2', credits: 3, type: 'Thực hành', hours: 45, exam: 'Thi thực hành' },
      { code: 'GEN1023', name: 'Vật lý đại cương', credits: 3, type: 'Lý thuyết', hours: 45, exam: 'Thi viết' },
      { code: 'GEN1024', name: 'Giáo dục thể chất 2', credits: 1, type: 'Thực hành', hours: 30, exam: 'Đạt/Không đạt' },
    ]
  },
  {
    semester: 3, name: 'Học kỳ 3', subjects: [
      { code: 'INT3110', name: 'Cơ sở dữ liệu', credits: 4, type: 'Lý thuyết', hours: 60, exam: 'Thi viết' },
      { code: 'INT3201', name: 'Mạng máy tính', credits: 3, type: 'Thực hành', hours: 45, exam: 'Thi thực hành' },
      { code: 'GEN2011', name: 'Xác suất thống kê', credits: 3, type: 'Lý thuyết', hours: 45, exam: 'Thi viết' },
      { code: 'GEN2012', name: 'Tư tưởng HCM', credits: 2, type: 'Lý thuyết', hours: 30, exam: 'Thi viết' },
    ]
  },
  {
    semester: 8, name: 'Học kỳ 8', subjects: [
      { code: 'INT4001', name: 'Đồ án tốt nghiệp', credits: 10, type: 'Đồ án', hours: 300, exam: 'Bảo vệ' },
      { code: 'INT4002', name: 'Thực tập tốt nghiệp', credits: 5, type: 'Thực tập', hours: 150, exam: 'Báo cáo' },
    ]
  },
];

const TYPE_BADGE: Record<string, 'info' | 'accent' | 'warning'> = {
  'Lý thuyết': 'info', 'Thực hành': 'accent', 'Đồ án': 'warning', 'Thực tập': 'accent',
};

export default function CurriculumDetail() {
  const { t } = useTranslation('sis');
  const program = PROGRAM;

  return (
    <div className="space-y-6">
      <PageHeader
        title={program.name}
        description={`${program.code} · ${program.version} · ${program.major} · ${program.degree}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('curriculum.titleList'), href: '/sis/chuong-trinh-dao-tao' },
          { label: program.code },
        ]}
        actions={
          <>
            <Link to="/sis/chuong-trinh-dao-tao">
              <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>{t('curriculum.detail.back')}</Button>
            </Link>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('curriculum.export')}</Button>
            <Button leftIcon={<Edit2 className="h-4 w-4" />}>{t('curriculum.detail.edit')}</Button>
          </>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { labelKey: 'curriculum.detail.tongTinChi', value: program.totalCredits, icon: <BookOpen className="h-4 w-4" /> },
          { labelKey: 'curriculum.detail.soMon', value: program.subjects, icon: <BookOpen className="h-4 w-4" /> },
          { labelKey: 'curriculum.detail.thoiGian', value: program.duration, icon: <GraduationCap className="h-4 w-4" /> },
          { labelKey: 'curriculum.detail.gpaToiThieu', value: program.minGPA.toFixed(1), icon: <Users className="h-4 w-4" /> },
        ].map(({ labelKey, value, icon }) => (
          <Card key={labelKey}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                {icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">{t(labelKey)}</p>
                <p className="text-lg font-bold text-[rgb(var(--text-primary))]">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Description */}
      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('curriculum.detail.intro')}</h3>
        </div>
        <CardContent>
          <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{program.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="primary">{t('curriculum.detail.nganh')}: {program.major}</Badge>
            <Badge variant="info">{t('curriculum.detail.bac')}: {program.degree}</Badge>
            <Badge variant="success">{t('curriculum.detail.nam')}: {program.year}</Badge>
            <Badge variant="accent">{t('curriculum.detail.phienBan')}: {program.version}</Badge>
            <Badge variant={program.status === 'active' ? 'success' : 'neutral'} dot>
              {program.status === 'active' ? t('curriculum.status.active') : t('curriculum.status.inactive')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Semester breakdown */}
      {SEMESTERS.map((sem) => {
        const totalCredits = sem.subjects.reduce((acc, s) => acc + s.credits, 0);
        return (
          <Card key={sem.semester}>
            <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary))] text-sm font-bold text-white">
                  HK{sem.semester}
                </div>
                <div>
                  <h3 className="font-semibold text-[rgb(var(--text-primary))]">{sem.name}</h3>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{sem.subjects.length} môn · {totalCredits} tín chỉ</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[rgb(var(--bg-base))]">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))]">{t('curriculum.tableDetail.maMonHoc')}</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))]">{t('curriculum.tableDetail.tenMonHoc')}</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-[rgb(var(--text-secondary))]">{t('curriculum.tableDetail.tongTc')}</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-[rgb(var(--text-secondary))]">{t('curriculum.tableDetail.soTiet')}</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))]">{t('curriculum.tableDetail.loai')}</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))]">{t('curriculum.tableDetail.thi')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                  {sem.subjects.map((s) => (
                    <tr key={s.code} className="hover:bg-[rgb(var(--bg-hover))]">
                      <td className="px-4 py-2.5 font-mono text-xs text-[rgb(var(--text-secondary))]">{s.code}</td>
                      <td className="px-4 py-2.5 font-medium text-[rgb(var(--text-primary))]">{s.name}</td>
                      <td className="px-4 py-2.5 text-center text-[rgb(var(--text-secondary))]">{s.credits}</td>
                      <td className="px-4 py-2.5 text-center text-[rgb(var(--text-secondary))]">{s.hours}</td>
                      <td className="px-4 py-2.5"><Badge variant={TYPE_BADGE[s.type]} size="sm">{s.type}</Badge></td>
                      <td className="px-4 py-2.5 text-xs text-[rgb(var(--text-muted))]">{s.exam}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

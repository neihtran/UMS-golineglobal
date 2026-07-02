import { Link } from 'react-router-dom';
import { ArrowLeft, Edit2, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

type SubjectType = 'theory' | 'practice' | 'project' | 'internship';

const SUBJECTS: Record<string, {
  code: string; name: string; credits: number; semester: number;
  hours: number; type: SubjectType; dept: string; status: 'active' | 'inactive';
  description: string; exam: string; prerequisites: string[]; programs: string[];
}> = {
  'INT1005': {
    code: 'INT1005', name: 'Nhập môn Tin học', credits: 3, semester: 1,
    hours: 45, type: 'theory', dept: 'Khoa CNTT', status: 'active',
    exam: 'Thi viết (90 phút)',
    description: 'Môn học giới thiệu các khái niệm cơ bản về tin học, hệ điều hành, mạng máy tính, và lập trình Python. Trang bị kiến thức nền tảng cho sinh viên bước vào ngành CNTT.',
    prerequisites: [],
    programs: ['CTDT-CNTT-2021'],
  },
  'INT2201': {
    code: 'INT2201', name: 'Cấu trúc dữ liệu', credits: 4, semester: 2,
    hours: 60, type: 'theory', dept: 'Khoa CNTT', status: 'active',
    exam: 'Thi viết (120 phút)',
    description: 'Nghiên cứu các cấu trúc dữ liệu cơ bản: mảng, danh sách liên kết, cây, đồ thị. Phân tích và đánh giá độ phức tạp thuật toán. Thực hành cài đặt bằng C++.',
    prerequisites: ['INT1005'],
    programs: ['CTDT-CNTT-2021'],
  },
  'INT3110': {
    code: 'INT3110', name: 'Cơ sở dữ liệu', credits: 4, semester: 3,
    hours: 60, type: 'theory', dept: 'Khoa CNTT', status: 'active',
    exam: 'Thi viết + Thực hành',
    description: 'Thiết kế CSDL quan hệ, ngôn ngữ SQL, tối ưu hóa truy vấn, quản trị CSDL với hệ quản trị SQL Server.',
    prerequisites: ['INT2201'],
    programs: ['CTDT-CNTT-2021'],
  },
  'INT3201': {
    code: 'INT3201', name: 'Mạng máy tính', credits: 3, semester: 3,
    hours: 45, type: 'practice', dept: 'Khoa CNTT', status: 'active',
    exam: 'Thi thực hành (60 phút)',
    description: 'Mô hình OSI, TCP/IP, giao thức mạng, cấu hình router/switch, quản trị mạng cục bộ và WAN.',
    prerequisites: ['INT1005'],
    programs: ['CTDT-CNTT-2021'],
  },
  'INT3301': {
    code: 'INT3301', name: 'Lập trình hướng đối tượng', credits: 4, semester: 2,
    hours: 60, type: 'practice', dept: 'Khoa CNTT', status: 'active',
    exam: 'Thi thực hành (90 phút)',
    description: 'Các nguyên lý lập trình hướng đối tượng (kế thừa, đa hình, đóng gói), thiết kế lớp, design pattern cơ bản với Java.',
    prerequisites: ['INT1005'],
    programs: ['CTDT-CNTT-2021'],
  },
  'INT3401': {
    code: 'INT3401', name: 'Trí tuệ nhân tạo', credits: 3, semester: 5,
    hours: 45, type: 'theory', dept: 'Khoa CNTT', status: 'active',
    exam: 'Thi viết (90 phút)',
    description: 'Các thuật toán tìm kiếm, logic mờ, mạng neural, học máy cơ bản. Thực hành với Python và thư viện scikit-learn.',
    prerequisites: ['INT2201', 'GEN2011'],
    programs: ['CTDT-CNTT-2021'],
  },
  'INT3501': {
    code: 'INT3501', name: 'An toàn thông tin', credits: 3, semester: 4,
    hours: 45, type: 'theory', dept: 'Khoa CNTT', status: 'inactive',
    exam: 'Thi viết (90 phút)',
    description: 'Mã hóa dữ liệu, bảo mật mạng, tấn công và phòng thủ hệ thống, chính sách bảo mật.',
    prerequisites: ['INT3201'],
    programs: ['CTDT-CNTT-2021'],
  },
  'INT4001': {
    code: 'INT4001', name: 'Đồ án tốt nghiệp', credits: 10, semester: 8,
    hours: 300, type: 'project', dept: 'Khoa CNTT', status: 'active',
    exam: 'Bảo vệ trước hội đồng',
    description: 'Sinh viên thực hiện đồ án tốt nghiệp dưới sự hướng dẫn của giảng viên. Đề tài phải có tính ứng dụng thực tiễn, được bảo vệ trước hội đồng chấm.',
    prerequisites: [],
    programs: ['CTDT-CNTT-2021'],
  },
  'GEN1011': {
    code: 'GEN1011', name: 'Toán cao cấp A1', credits: 4, semester: 1,
    hours: 60, type: 'theory', dept: 'Khoa Khoa học', status: 'active',
    exam: 'Thi viết (120 phút)',
    description: 'Giải tích hàm một biến: giới hạn, đạo hàm, tích phân, chuỗi số. Ứng dụng trong các bài toán kỹ thuật.',
    prerequisites: [],
    programs: ['CTDT-CNTT-2021'],
  },
  'GEN1012': {
    code: 'GEN1012', name: 'Tiếng Anh A1', credits: 3, semester: 1,
    hours: 45, type: 'practice', dept: 'Khoa Ngoại ngữ', status: 'active',
    exam: 'Thi thực hành',
    description: 'Tiếng Anh cơ bản cho người mới bắt đầu. Ngữ pháp, từ vựng giao tiếp hàng ngày, nghe và nói.',
    prerequisites: [],
    programs: ['CTDT-CNTT-2021'],
  },
  'GEN2011': {
    code: 'GEN2011', name: 'Xác suất thống kê', credits: 3, semester: 3,
    hours: 45, type: 'theory', dept: 'Khoa Khoa học', status: 'active',
    exam: 'Thi viết (90 phút)',
    description: 'Xác suất cơ bản, biến ngẫu nhiên, phân phối xác suất, ước lượng thống kê, kiểm định giả thuyết.',
    prerequisites: ['GEN1011'],
    programs: ['CTDT-CNTT-2021'],
  },
  'INT4002': {
    code: 'INT4002', name: 'Thực tập tốt nghiệp', credits: 5, semester: 8,
    hours: 150, type: 'internship', dept: 'Khoa CNTT', status: 'active',
    exam: 'Báo cáo thực tập',
    description: 'Sinh viên thực tập tại doanh nghiệp IT tối thiểu 8 tuần. Viết báo cáo và được đánh giá bởi cả cơ sở thực tập và giảng viên.',
    prerequisites: [],
    programs: ['CTDT-CNTT-2021'],
  },
};

const TYPE_CONFIG: Record<SubjectType, { variant: 'info' | 'accent' | 'warning' | 'primary'; label: string }> = {
  theory: { variant: 'info', label: 'Lý thuyết' },
  practice: { variant: 'accent', label: 'Thực hành' },
  project: { variant: 'warning', label: 'Đồ án' },
  internship: { variant: 'primary', label: 'Thực tập' },
};

export default function SubjectDetail() {
  const { t } = useTranslation('sis');
  // Lấy code từ URL hoặc dùng mặc định
  const code = window.location.pathname.split('/').pop() ?? 'INT1005';
  const subject = SUBJECTS[code] ?? SUBJECTS['INT1005'];
  const tc = TYPE_CONFIG[subject.type];

  return (
    <div className="space-y-6">
      <PageHeader
        title={subject.name}
        description={`${subject.code} · ${tc.label} · ${subject.dept}`}
        breadcrumbs={[
          { label: 'SIS', href: '/sis' },
          { label: t('curriculum.titleList'), href: '/sis/chuong-trinh-dao-tao' },
          { label: t('subject.titleList'), href: '/sis/chuong-trinh-dao-tao/mon-hoc' },
          { label: subject.code },
        ]}
        actions={
          <>
            <Link to="/sis/chuong-trinh-dao-tao/mon-hoc">
              <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>{t('subject.detail.back')}</Button>
            </Link>
            <Link to={`/sis/chuong-trinh-dao-tao/mon-hoc/${code}/sua`}>
              <Button leftIcon={<Edit2 className="h-4 w-4" />}>{t('subject.detail.edit')}</Button>
            </Link>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { labelKey: 'subject.detail.maMon', value: subject.code, icon: <BookOpen className="h-4 w-4" /> },
          { labelKey: 'subject.detail.soTinChi', value: subject.credits, icon: <BookOpen className="h-4 w-4" /> },
          { labelKey: 'subject.detail.soTiet', value: subject.hours, icon: <BookOpen className="h-4 w-4" /> },
          { labelKey: 'subject.detail.hocKy', value: `HK ${subject.semester}`, icon: <BookOpen className="h-4 w-4" /> },
        ].map(({ labelKey, value }) => (
          <Card key={labelKey}>
            <CardContent className="p-4">
              <p className="text-xs text-[rgb(var(--text-muted))]">{t(labelKey)}</p>
              <p className="mt-1 text-lg font-bold text-[rgb(var(--text-primary))]">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Thông tin */}
      <Card>
        <div className="px-5 py-4 border-b border-[rgb(var(--border)/0.6)]">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('subject.detail.info')}</h3>
        </div>
        <CardContent className="grid grid-cols-2 gap-4 pt-5">
          <div>
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{t('subject.detail.loaiMonHoc')}</p>
            <Badge variant={tc.variant}>{tc.label}</Badge>
          </div>
          <div>
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{t('subject.detail.khoaPhuTrach')}</p>
            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{subject.dept}</p>
          </div>
          <div>
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{t('subject.detail.hinhThucThi')}</p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">{subject.exam}</p>
          </div>
          <div>
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{t('subject.detail.trangThai')}</p>
            <Badge variant={subject.status === 'active' ? 'success' : 'neutral'} dot>
              {subject.status === 'active' ? t('subject.status.active') : t('subject.status.inactive')}
            </Badge>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{t('subject.detail.moTa')}</p>
            <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{subject.description}</p>
          </div>
          <div>
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{t('subject.detail.ctdtApDung')}</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {subject.programs.map((p) => (
                <Badge key={p} variant="primary" size="sm">{p}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-[rgb(var(--text-muted))] mb-1">{t('subject.detail.monTienQuyet')}</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {subject.prerequisites.length === 0 ? (
                <span className="text-sm text-[rgb(var(--text-muted))] italic">{t('subject.detail.khongCo')}</span>
              ) : (
                subject.prerequisites.map((p) => (
                  <Link key={p} to={`/sis/chuong-trinh-dao-tao/mon-hoc/${p}`}>
                    <Badge variant="accent" size="sm" className="hover:text-[rgb(var(--primary))] cursor-pointer">{p}</Badge>
                  </Link>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

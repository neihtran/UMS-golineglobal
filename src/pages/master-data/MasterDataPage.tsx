import { Link } from 'react-router-dom';
import {
  Users, Building2, GraduationCap, BookOpen, ScrollText,
  Landmark, Award, Globe, FileText, DollarSign,
  ShieldCheck, Users2, ClipboardList, Star, MapPin,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

// ─── Danh mục 20+ thẻ ──────────────────────────────────────────────────

const MASTER_CATEGORIES = [
  // Nhóm: Nhân sự & Tổ chức
  {
    group: 'Nhân sự & Tổ chức',
    color: 'primary',
    items: [
      { label: 'Người dùng', desc: '1,247 tài khoản', icon: <Users className="h-5 w-5" />, route: '/iam/tai-khoan', color: 'primary' },
      { label: 'Đơn vị', desc: '12 phòng ban, 8 khoa', icon: <Building2 className="h-5 w-5" />, route: '/hrm/don-vi', color: 'primary' },
      { label: 'Viên chức', desc: '312 viên chức', icon: <Users2 className="h-5 w-5" />, route: '/hrm/vien-chuc', color: 'primary' },
      { label: 'Sinh viên', desc: '8,430 sinh viên', icon: <GraduationCap className="h-5 w-5" />, route: '/sis/sinh-vien', color: 'primary' },
      { label: 'Chức vụ', desc: '34 chức vụ', icon: <Award className="h-5 w-5" />, route: '/hrm/bo-nhiem', color: 'primary' },
    ],
  },
  // Nhóm: Đào tạo
  {
    group: 'Đào tạo',
    color: 'accent',
    items: [
      { label: 'Môn học', desc: '284 môn học', icon: <BookOpen className="h-5 w-5" />, route: '/sis/mon-hoc', color: 'accent' },
      { label: 'CTĐT', desc: '42 chương trình', icon: <ScrollText className="h-5 w-5" />, route: '/sis/chuong-trinh-dao-tao', color: 'accent' },
      { label: 'Ngành đào tạo', desc: '18 ngành', icon: <GraduationCap className="h-5 w-5" />, route: '/sis/mon-hoc', color: 'accent' },
      { label: 'Hình thức đào tạo', desc: '5 hình thức', icon: <BookOpen className="h-5 w-5" />, route: '/sis/mon-hoc', color: 'accent' },
      { label: 'Khoá đào tạo', desc: '16 khóa', icon: <Star className="h-5 w-5" />, route: '/dce/khoa-dao-tao', color: 'accent' },
    ],
  },
  // Nhóm: Công tác Đảng
  {
    group: 'Công tác Đảng',
    color: 'error',
    items: [
      { label: 'Chi bộ', desc: '12 chi bộ', icon: <Landmark className="h-5 w-5" />, route: '/pms/dang-vien', color: 'error' },
      { label: 'Đảng viên', desc: '128 đảng viên', icon: <Users className="h-5 w-5" />, route: '/pms/dang-vien', color: 'error' },
    ],
  },
  // Nhóm: Tài chính
  {
    group: 'Tài chính',
    color: 'warning',
    items: [
      { label: 'Học phí', desc: 'Biểu học phí theo ngành', icon: <DollarSign className="h-5 w-5" />, route: '/fin/hoc-phi', color: 'warning' },
      { label: 'Loại chi', desc: '42 loại chi', icon: <FileText className="h-5 w-5" />, route: '/fin/chi-tieu', color: 'warning' },
    ],
  },
  // Nhóm: Hành chính
  {
    group: 'Hành chính',
    color: 'info',
    items: [
      { label: 'Hợp đồng', desc: 'Mẫu hợp đồng lao động', icon: <FileText className="h-5 w-5" />, route: '/hrm/hop-dong', color: 'info' },
      { label: 'Văn bản mẫu', desc: '28 mẫu văn bản', icon: <ClipboardList className="h-5 w-5" />, route: '/dms/ban-nhap', color: 'info' },
      { label: 'Danh hiệu thi đua', desc: '18 danh hiệu', icon: <Award className="h-5 w-5" />, route: '/qa/khieu-nai', color: 'info' },
    ],
  },
  // Nhóm: Tham chiếu
  {
    group: 'Tham chiếu',
    color: 'neutral',
    items: [
      { label: 'Quốc gia', desc: '195 quốc gia', icon: <Globe className="h-5 w-5" />, route: '/hrm/vien-chuc', color: 'neutral' },
      { label: 'Tỉnh / TP', desc: '63 tỉnh/thành phố', icon: <MapPin className="h-5 w-5" />, route: '/hrm/vien-chuc', color: 'neutral' },
      { label: 'Quận / Huyện', desc: '705 quận/huyện', icon: <MapPin className="h-5 w-5" />, route: '/hrm/vien-chuc', color: 'neutral' },
      { label: 'Dân tộc', desc: '54 dân tộc', icon: <Users className="h-5 w-5" />, route: '/hrm/vien-chuc', color: 'neutral' },
      { label: 'Tôn giáo', desc: '16 tôn giáo', icon: <ShieldCheck className="h-5 w-5" />, route: '/hrm/vien-chuc', color: 'neutral' },
      { label: 'Loại phòng KTX', desc: '6 loại phòng', icon: <Building2 className="h-5 w-5" />, route: '/ktx/phong', color: 'neutral' },
      { label: 'Bằng cấp', desc: '8 loại bằng cấp', icon: <Award className="h-5 w-5" />, route: '/hrm/vien-chuc', color: 'neutral' },
      { label: 'Hạng thưởng', desc: '5 hạng thưởng', icon: <Star className="h-5 w-5" />, route: '/qa/khieu-nai', color: 'neutral' },
    ],
  },
];

export default function MasterDataPage() {
  const totalItems = MASTER_CATEGORIES.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh mục chung"
        description={`${totalItems} danh mục hệ thống — Master Data — IAM-05`}
        breadcrumbs={[{ label: 'IAM', href: '/iam' }, { label: 'Danh mục chung' }]}
      />

      {MASTER_CATEGORIES.map((group) => (
        <div key={group.group} className="space-y-3">
          {/* Group header */}
          <div className="flex items-center gap-2">
            <div className={`h-1 w-3 rounded-full bg-[rgb(var(--${group.color}))]`} />
            <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">{group.group}</h3>
            <span className="text-xs text-[rgb(var(--text-muted))]">{group.items.length} danh mục</span>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {group.items.map((item) => (
              <Link
                key={item.label}
                to={item.route}
                className="group"
              >
                <Card className="hover:border-[rgb(var(--primary-light))] hover:shadow-md transition-all duration-200 cursor-pointer">
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--${item.color})/0.1)] text-[rgb(var(--${item.color}))] group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <div className={`h-1.5 w-1.5 rounded-full bg-[rgb(var(--${item.color}))] opacity-50`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--primary))] transition-colors">
                        {item.label}
                      </p>
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

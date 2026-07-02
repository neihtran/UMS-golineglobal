import { Link } from 'react-router-dom';
import { BookOpen, Users, ShieldCheck, BarChart3, ExternalLink, ChevronRight, Zap, Award, Globe } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';

const FEATURES = [
  {
    icon: <BookOpen className="h-7 w-7" />,
    title: 'Quản lý Khóa học',
    description: 'Tạo, xuất bản và quản trị nội dung học tập số SCORM/xAPI. Theo dõi tiến độ học viên theo thời gian thực.',
    color: 'primary',
  },
  {
    icon: <Users className="h-7 w-7" />,
    title: 'Theo dõi Tiến độ',
    description: 'Cập nhật tự động trạng thái học tập, tỷ lệ hoàn thành bài giảng, bài tập và kết quả thi của từng học viên.',
    color: 'success',
  },
  {
    icon: <Award className="h-7 w-7" />,
    title: 'Đánh giá Thực tập',
    description: 'Giảng viên trường phổ thông và đơn vị ngoài không cần tài khoản — chỉ cần mở link được gửi qua email để đánh giá.',
    color: 'accent',
  },
  {
    icon: <BarChart3 className="h-7 w-7" />,
    title: 'Báo cáo & Phân tích',
    description: 'Dashboard BI trực quan: tỷ lệ hoàn thành, điểm trung bình, xếp hạng khóa học và hoạt động học tập 6 tuần gần nhất.',
    color: 'info',
  },
  {
    icon: <Globe className="h-7 w-7" />,
    title: 'Liên thông Quốc gia',
    description: 'Đồng bộ dữ liệu đào tạo với HEMIS và VNeID. Đảm bảo tuân thủ chuẩn dữ liệu giáo dục quốc gia.',
    color: 'warning',
  },
  {
    icon: <ShieldCheck className="h-7 w-7" />,
    title: 'Bảo mật & RBAC',
    description: 'Phân quyền chi tiết theo vai trò: Quản trị, Giảng viên, Sinh viên. Mỗi vai trò có giao diện và quyền riêng biệt.',
    color: 'primary',
  },
];

const QUICK_ACCESS = [
  { label: 'Danh sách khóa học', href: '/lms/khoa-hoc', desc: '148 khóa học đang hoạt động', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Nội dung khóa học', href: '/lms/thu-vien-hoc-lieu', desc: 'Quản lý học liệu số', icon: <Zap className="h-5 w-5" /> },
  { label: 'Bảng điểm', href: '/lms/bang-diem', desc: 'Xem & xuất điểm', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Bài tập sinh viên', href: '/lms/bai-tap-sinh-vien', desc: 'Nộp và chấm bài tập', icon: <Award className="h-5 w-5" /> },
];

export default function LMSLanding() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-gradient-to-br from-[rgb(var(--bg-card))] to-[rgb(var(--bg-base))]">
        {/* Background accent */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[rgb(var(--primary)/0.06)] blur-3xl pointer-events-none" />
        <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-[rgb(var(--success)/0.05)] blur-3xl pointer-events-none" />

        <div className="relative px-8 py-10 lg:px-12 lg:py-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--primary)/0.3)] bg-[rgb(var(--primary)/0.06)] px-3 py-1 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-[rgb(var(--success))] animate-pulse" />
              <span className="text-xs font-medium text-[rgb(var(--primary))]">Hệ thống đang hoạt động — 4.821 học viên trực tuyến</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-[rgb(var(--text-primary))] leading-tight">
              Dạy học Số <span className="text-[rgb(var(--primary))]">LMS</span>
            </h1>
            <p className="mt-3 text-base text-[rgb(var(--text-secondary))] leading-relaxed max-w-xl">
              Nền tảng quản lý học tập trực tuyến — tạo khóa học, theo dõi tiến độ, chấm bài tập và xuất báo cáo điểm số.
              Hỗ trợ chuẩn SCORM/xAPI, tích hợp đồng bộ với HEMIS.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 mt-6">
              {[
                { value: '148', label: 'Khóa học' },
                { value: '4.821', label: 'Học viên' },
                { value: '68.4%', label: 'Hoàn thành' },
                { value: '7.82', label: 'Điểm TB' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{value}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{label}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/lms/khoa-hoc">
                <Button leftIcon={<BookOpen className="h-4 w-4" />}>
                  Xem khóa học
                </Button>
              </Link>
              <Button variant="outline" leftIcon={<ExternalLink className="h-4 w-4" />} onClick={() => window.open('#', '_blank')}>
                Đánh giá thực tập
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Tính năng nổi bật</h2>
          <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">6 phân hệ quản lý học tập toàn diện</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="group hover:border-[rgb(var(--primary)/0.3)] transition-colors cursor-default">
              <CardContent className="p-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl mb-4 bg-[rgb(var(--${f.color})/0.1)] text-[rgb(var(--${f.color}))]`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-2">{f.title}</h3>
                <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick access */}
      <div>
        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACCESS.map((q) => (
            <Link key={q.href} to={q.href} className="group block">
              <Card className="hover:border-[rgb(var(--primary)/0.3)] transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
                    {q.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--primary))] transition-colors">{q.label}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))] truncate">{q.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--primary))] transition-colors shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

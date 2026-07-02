import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  Bell,
  Download,
  Plus,
  ArrowRight,
  FileText,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const ANNOUNCEMENTS = [
  { id: 'a1', pinned: true, category: 'Học vụ', title: 'Thông báo lịch thi học kỳ 2 năm học 2025-2026', excerpt: 'Kỳ thi được tổ chức từ ngày 15/07/2026 đến 25/07/2026. Sinh viên cần mang thẻ SV và CCCD khi vào phòng thi.', author: 'Phòng Đào tạo', date: '2026-06-20', views: 4821, comments: 34 },
  { id: 'a2', pinned: true, category: 'Học bổng', title: 'Học bổng khuyến khích học tập năm học 2025-2026', excerpt: 'Thông báo danh sách sinh viên được nhận học bổng khuyến khích học tập. Đợt 1: 450 sinh viên với tổng kinh phí 1.8 tỷ đồng.', author: 'Phòng Công tác SV', date: '2026-06-18', views: 3210, comments: 56 },
  { id: 'a3', pinned: false, category: 'Tuyển sinh', title: 'Tuyển sinh ngành Trí tuệ Nhân tạo khóa 2026', excerpt: 'Trường tuyển sinh chương trình Cử nhân Trí tuệ Nhân tạo với 50 chỉ tiêu. Điểm chuẩn dự kiến: 26 điểm.', author: 'Phòng Tuyển sinh', date: '2026-06-15', views: 2150, comments: 12 },
  { id: 'a4', pinned: false, category: 'Sự kiện', title: 'Ngày hội việc làm mùa hè 2026', excerpt: 'Ngày hội việc làm với sự tham gia của 40 doanh nghiệp, 1,200 vị trí tuyển dụng. Đăng ký tham gia trước 30/06/2026.', author: 'Trung tâm HTDN', date: '2026-06-12', views: 1840, comments: 28 },
  { id: 'a5', pinned: false, category: 'Thông báo', title: 'Bảo trì hệ thống LMS ngày Chủ nhật 22/06', excerpt: 'Hệ thống Dạy học Số (LMS) sẽ bảo trì từ 02:00 đến 06:00 ngày 22/06/2026. Mọi hoạt động học tập tạm ngưng trong thời gian này.', author: 'Phòng CNTT', date: '2026-06-10', views: 987, comments: 3 },
  { id: 'a6', pinned: false, category: 'Học vụ', title: 'Đăng ký học phần kỳ 3 năm học 2025-2026', excerpt: 'Sinh viên đăng ký học phần trực tuyến từ ngày 01/07/2026 đến 10/07/2026 qua cổng PORTAL.', author: 'Phòng Đào tạo', date: '2026-06-08', views: 3650, comments: 41 },
];

const CATEGORIES = [
  { name: 'Học vụ', icon: '📚', color: 'primary', count: 24, labelKey: 'announcement.category.academic' },
  { name: 'Học bổng', icon: '🎓', color: 'success', count: 8, labelKey: 'announcement.category.scholarship' },
  { name: 'Tuyển sinh', icon: '📝', color: 'info', count: 12, labelKey: 'announcement.category.admission' },
  { name: 'Sự kiện', icon: '🎉', color: 'accent', count: 15, labelKey: 'announcement.category.event' },
  { name: 'Thông báo', icon: '📢', color: 'warning', count: 31, labelKey: 'announcement.category.notice' },
  { name: 'NCKH', icon: '🔬', color: 'neutral', count: 6, labelKey: 'announcement.category.research' },
];

const CATEGORY_COLORS: Record<string, string> = {
  primary: 'primary',
  success: 'success',
  info: 'info',
  accent: 'accent',
  warning: 'warning',
  neutral: 'neutral',
};

export default function PORTALDashboard() {
  const { t } = useTranslation('portal');
  const navigate = useNavigate();
  const [category, setCategory] = useState('');

  const filtered = !category
    ? ANNOUNCEMENTS
    : ANNOUNCEMENTS.filter((a) => a.category === category);

  const catClass = (color: string, active: boolean) => {
    if (active) return 'border-[rgb(var(--' + color + '))] bg-[rgb(var(--' + color + '))] text-white';
    return 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary-light))]';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        breadcrumbs={[{ label: 'PORTAL' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/portal/thong-bao/tao')}>{t('announcement.create')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {[
          { label: t('quickLinks.courseReg'), icon: <GraduationCap className="h-5 w-5" />, route: '/portal/dkHP', color: 'primary' },
          { label: t('quickLinks.examSchedule'), icon: <Calendar className="h-5 w-5" />, route: '/portal/lich-thi', color: 'accent' },
          { label: t('quickLinks.gradeLookup'), icon: <FileText className="h-5 w-5" />, route: '/portal/diem', color: 'info' },
          { label: t('quickLinks.ktxReg'), icon: <Bell className="h-5 w-5" />, route: '/portal/ktx', color: 'warning' },
        ].map((link) => (
          <Link
            key={link.label}
            to={link.route}
            className={'flex items-center gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 hover:border-[rgb(var(--primary-light))] hover:bg-[rgb(var(--bg-hover))] transition-all group'}
          >
            <div className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--' + link.color + ')/0.1)] text-[rgb(var(--' + link.color + '))]'}>
              {link.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-[rgb(var(--text-primary))] leading-tight">{link.label}</p>
              <ArrowRight className="h-3 w-3 text-[rgb(var(--text-muted))] mt-0.5 group-hover:text-[rgb(var(--primary))] transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory('')}
              className={'rounded-full border px-3 py-1 text-xs font-medium transition-colors ' + catClass('primary', !category)}
            >
              {t('filter.all')}
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.name}
                onClick={() => setCategory(c.name)}
                className={'rounded-full border px-3 py-1 text-xs font-medium transition-colors ' + catClass(CATEGORY_COLORS[c.color], category === c.name)}
              >
                {c.icon} {t(c.labelKey)}
              </button>
            ))}
          </div>

          {filtered.filter((a) => a.pinned).length > 0 && (
            <div className="space-y-2">
              {filtered.filter((a) => a.pinned).map((ann) => (
                <Card key={ann.id} className="border-l-4 border-l-[rgb(var(--accent))]">
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--accent)/0.1)] text-lg">
                      📌
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="accent">{ann.category}</Badge>
                        <span className="text-xs text-[rgb(var(--text-muted))]">{ann.author}</span>
                        <span className="text-xs text-[rgb(var(--text-muted))]">·</span>
                        <span className="text-xs text-[rgb(var(--text-muted))]">{ann.date}</span>
                      </div>
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{ann.title}</p>
                      <p className="text-xs text-[rgb(var(--text-secondary))] mt-1 leading-relaxed">{ann.excerpt}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[rgb(var(--text-muted))]">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {ann.views.toLocaleString()}</span>
                        <span className="flex items-center gap-1">💬 {ann.comments}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                      {t('announcement.detail')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {filtered.filter((a) => !a.pinned).map((ann) => (
              <Card key={ann.id} className="hover:border-[rgb(var(--primary-light))] transition-colors">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-lg">
                    {CATEGORIES.find((c) => c.name === ann.category)?.icon ?? '📄'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="neutral">{ann.category}</Badge>
                      <span className="text-xs text-[rgb(var(--text-muted))]">{ann.author}</span>
                      <span className="text-xs text-[rgb(var(--text-muted))]">·</span>
                      <span className="text-xs text-[rgb(var(--text-muted))]">{ann.date}</span>
                    </div>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{ann.title}</p>
                    <p className="text-xs text-[rgb(var(--text-secondary))] mt-1 leading-relaxed line-clamp-2">{ann.excerpt}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[rgb(var(--text-muted))]">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {ann.views.toLocaleString()}</span>
                      <span className="flex items-center gap-1">💬 {ann.comments}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                    {t('announcement.detail')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('category.title')}</h3>
            </div>
            <div className="divide-y divide-[rgb(var(--border)/0.5)]">
              {CATEGORIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setCategory(c.name === category ? '' : c.name)}
                  className="flex w-full items-center justify-between px-4 py-2.5 hover:bg-[rgb(var(--bg-hover))] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{c.icon}</span>
                    <span className="text-sm text-[rgb(var(--text-secondary))]">{t(c.labelKey)}</span>
                  </div>
                  <Badge variant="neutral" size="sm">{c.count}</Badge>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('statistics.title')}</h3>
            </div>
            <CardContent className="space-y-3 pt-3">
              {[
                { label: t('announcement.statTotal'), value: '96' },
                { label: t('announcement.statPinned'), value: '12' },
                { label: t('announcement.statViewsWeek'), value: '18.4K' },
                { label: t('announcement.statCommentsWeek'), value: '234' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-[rgb(var(--text-muted))]">{label}</span>
                  <span className="font-semibold text-[rgb(var(--text-primary))]">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

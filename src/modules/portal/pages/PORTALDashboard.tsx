import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useAnnouncementList } from '@/hooks/usePortal';
import type { Announcement } from '@/services/portal.service';

const CATEGORY_META: Record<string, { icon: string; color: string; labelKey: string }> = {
  academic: { icon: '📚', color: 'primary', labelKey: 'announcement.category.academic' },
  scholarship: { icon: '🎓', color: 'success', labelKey: 'announcement.category.scholarship' },
  recruitment: { icon: '📝', color: 'info', labelKey: 'announcement.category.admission' },
  event: { icon: '🎉', color: 'accent', labelKey: 'announcement.category.event' },
  administrative: { icon: '📢', color: 'warning', labelKey: 'announcement.category.notice' },
  other: { icon: '🔬', color: 'neutral', labelKey: 'announcement.category.research' },
};

const QUICK_LINKS = [
  { labelKey: 'quickLinks.courseReg', icon: <GraduationCap className="h-5 w-5" />, route: '/portal/dkHP', color: 'primary' },
  { labelKey: 'quickLinks.examSchedule', icon: <Calendar className="h-5 w-5" />, route: '/portal/lich-thi', color: 'accent' },
  { labelKey: 'quickLinks.gradeLookup', icon: <FileText className="h-5 w-5" />, route: '/portal/diem', color: 'info' },
  { labelKey: 'quickLinks.ktxReg', icon: <Bell className="h-5 w-5" />, route: '/portal/ktx', color: 'warning' },
];

export default function PORTALDashboard() {
  const { t } = useTranslation('portal');
  const navigate = useNavigate();
  const [category, setCategory] = useState('');

  const announcementsQuery = useAnnouncementList({
    page: 1,
    pageSize: 50,
    sortBy: 'publishedAt',
    sortDir: 'desc',
  });

  const announcements: Announcement[] = announcementsQuery.data?.data ?? [];
  const totalCount = announcementsQuery.data?.pagination?.total ?? announcements.length;
  const pinnedCount = announcements.filter((a) => a.isPinned).length;

  // Compute weekly stats (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentAnnouncements = announcements.filter((a) => a.publishedAt && new Date(a.publishedAt) >= sevenDaysAgo);
  const weeklyViews = recentAnnouncements.reduce((s, a) => s + (a.viewCount || 0), 0);
  const weeklyComments = recentAnnouncements.reduce((s, a) => s + (a.commentCount || 0), 0);

  // Build category summary from data
  const categorySummary = Object.entries(CATEGORY_META).map(([key, meta]) => ({
    key,
    name: key,
    icon: meta.icon,
    color: meta.color,
    labelKey: meta.labelKey,
    count: announcements.filter((a) => a.category === key).length,
  }));

  const filtered = !category
    ? announcements
    : announcements.filter((a) => a.category === category);

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
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.labelKey}
            to={link.route}
            className={'flex items-center gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 hover:border-[rgb(var(--primary-light))] hover:bg-[rgb(var(--bg-hover))] transition-all group'}
          >
            <div className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--' + link.color + ')/0.1)] text-[rgb(var(--' + link.color + '))]'}>
              {link.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-[rgb(var(--text-primary))] leading-tight">{t(link.labelKey)}</p>
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
            {categorySummary.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={'rounded-full border px-3 py-1 text-xs font-medium transition-colors ' + catClass(c.color, category === c.key)}
              >
                {c.icon} {t(c.labelKey)}
              </button>
            ))}
          </div>

          {announcementsQuery.isLoading ? (
            <div className="px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Đang tải...</div>
          ) : (
            <>
              {filtered.filter((a) => a.isPinned).length > 0 && (
                <div className="space-y-2">
                  {filtered.filter((a) => a.isPinned).map((ann) => (
                    <Card key={ann._id} className="border-l-4 border-l-[rgb(var(--accent))]">
                      <CardContent className="flex items-start gap-4 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--accent)/0.1)] text-lg">
                          📌
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="accent">{ann.category}</Badge>
                            <span className="text-xs text-[rgb(var(--text-muted))]">{ann.authorName ?? '—'}</span>
                            <span className="text-xs text-[rgb(var(--text-muted))]">·</span>
                            <span className="text-xs text-[rgb(var(--text-muted))]">{ann.publishedAt ? new Date(ann.publishedAt).toLocaleDateString('vi-VN') : '—'}</span>
                          </div>
                          <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{ann.title}</p>
                          <p className="text-xs text-[rgb(var(--text-secondary))] mt-1 leading-relaxed">{ann.summary ?? ann.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-[rgb(var(--text-muted))]">
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {(ann.viewCount ?? 0).toLocaleString()}</span>
                            <span className="flex items-center gap-1">💬 {ann.commentCount ?? 0}</span>
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
                {filtered.filter((a) => !a.isPinned).map((ann) => {
                  const meta = CATEGORY_META[ann.category] ?? CATEGORY_META.other;
                  return (
                    <Card key={ann._id} className="hover:border-[rgb(var(--primary-light))] transition-colors">
                      <CardContent className="flex items-start gap-4 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary)/0.1)] text-lg">
                          {meta.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="neutral">{ann.category}</Badge>
                            <span className="text-xs text-[rgb(var(--text-muted))]">{ann.authorName ?? '—'}</span>
                            <span className="text-xs text-[rgb(var(--text-muted))]">·</span>
                            <span className="text-xs text-[rgb(var(--text-muted))]">{ann.publishedAt ? new Date(ann.publishedAt).toLocaleDateString('vi-VN') : '—'}</span>
                          </div>
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{ann.title}</p>
                          <p className="text-xs text-[rgb(var(--text-secondary))] mt-1 leading-relaxed line-clamp-2">{ann.summary ?? ann.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-[rgb(var(--text-muted))]">
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {(ann.viewCount ?? 0).toLocaleString()}</span>
                            <span className="flex items-center gap-1">💬 {ann.commentCount ?? 0}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                          {t('announcement.detail')}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Chưa có thông báo nào</div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <div className="px-4 pt-4 pb-3 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{t('category.title')}</h3>
            </div>
            <div className="divide-y divide-[rgb(var(--border)/0.5)]">
              {categorySummary.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key === category ? '' : c.key)}
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
                { label: t('announcement.statTotal'), value: totalCount.toString() },
                { label: t('announcement.statPinned'), value: pinnedCount.toString() },
                { label: t('announcement.statViewsWeek'), value: weeklyViews > 1000 ? `${(weeklyViews / 1000).toFixed(1)}K` : weeklyViews.toString() },
                { label: t('announcement.statCommentsWeek'), value: weeklyComments.toString() },
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
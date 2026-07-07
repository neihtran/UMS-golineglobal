import {
  Download,
  Plus,
  FileText,
  DollarSign,
  Users,
  Award,
  Star,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  useResearchProjectList,
  usePublicationList,
} from '@/hooks/useRit';
import type { Publication, ResearchProject } from '@/services/rit.service';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'info'; label: string }> = {
  active: { variant: 'success', label: 'Đang thực hiện' },
  review: { variant: 'warning', label: 'Nghiệm thu' },
  done: { variant: 'info', label: 'Hoàn thành' },
  approved: { variant: 'success', label: 'Đã duyệt' },
  ongoing: { variant: 'success', label: 'Đang thực hiện' },
  completed: { variant: 'info', label: 'Hoàn thành' },
  suspended: { variant: 'warning', label: 'Tạm dừng' },
  cancelled: { variant: 'warning', label: 'Đã hủy' },
  proposal: { variant: 'warning', label: 'Đề xuất' },
};

const LEVEL_BADGE: Record<string, 'error' | 'warning' | 'neutral'> = {
  'Cấp Bộ': 'error',
  'Cấp trường': 'warning',
};

const formatVND = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value || 0);

export default function RITDashboard() {
  const { t } = useTranslation('rit');
  const navigate = useNavigate();

  const projectsQuery = useResearchProjectList({ page: 1, pageSize: 20 });
  const publicationsQuery = usePublicationList({ page: 1, pageSize: 20, sortBy: 'year', sortDir: 'desc' });

  const projects: ResearchProject[] = projectsQuery.data?.data ?? [];
  const publications: Publication[] = publicationsQuery.data?.data ?? [];

  const totalProjects = projectsQuery.data?.pagination?.total ?? projects.length;
  const inProgressProjects = projects.filter((p) => p.status === 'ongoing' || p.status === 'approved');
  const totalBudget = projects.reduce((s, p) => s + (p.approvedBudget || 0), 0);
  const scopusPapers = publications.filter(
    (p) => p.quartile === 'Q1' || p.quartile === 'Q2'
  ).length;

  const stats = [
    {
      label: t('dashboard.totalProjects'),
      value: totalProjects.toLocaleString('vi-VN'),
      sub: `${inProgressProjects.length} đang triển khai`,
      icon: <FileText className="h-5 w-5" />,
      color: 'primary',
    },
    {
      label: t('dashboard.inProgress'),
      value: inProgressProjects.length.toLocaleString('vi-VN'),
      sub: `${projects.filter((p) => p.fundingSource === 'school').length} cấp trường, ${projects.filter((p) => p.fundingSource !== 'school').length} cấp Bộ`,
      icon: <Clock className="h-5 w-5" />,
      color: 'accent',
    },
    {
      label: t('dashboard.yearlyBudget'),
      value: `${(totalBudget / 1_000_000_000).toFixed(1)} tỷ`,
      sub: `${projects.length} đề tài`,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'success',
    },
    {
      label: t('dashboard.scopusPapers'),
      value: scopusPapers.toLocaleString('vi-VN'),
      sub: `${publications.length} tổng công trình`,
      icon: <Award className="h-5 w-5" />,
      color: 'info',
    },
  ];

  const recentProjects = projects.slice(0, 5);
  const recentPublications = publications.slice(0, 4);

  // Group budget by department for bar chart
  const budgetByDept = projects.reduce<Record<string, number>>((acc, p) => {
    const key = p.departmentName ?? p.department ?? 'Khác';
    acc[key] = (acc[key] ?? 0) + (p.approvedBudget || 0);
    return acc;
  }, {});
  const budgetBars = Object.entries(budgetByDept).map(([name, budget]) => ({
    name,
    budget: budget / 1_000_000_000,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('titleShort')}
        description={t('description')}
        breadcrumbs={[{ label: 'RIT' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/rit/de-tai/tao')}>{t('addProject')}</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">
                  {projectsQuery.isLoading ? '…' : s.value}
                </p>
                <p className="text-xs text-[rgb(var(--success))]">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Project list */}
        <Card className="lg:col-span-2">
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.researchProjects')}</h3>
            <Badge variant="neutral">{t('dashboard.totalProjects')}: {totalProjects}</Badge>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {projectsQuery.isLoading ? (
              <div className="px-5 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Đang tải...</div>
            ) : recentProjects.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Chưa có đề tài nào</div>
            ) : (
              recentProjects.map((p) => {
                const sc = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.active;
                const displayStatus =
                  p.status === 'ongoing' ? 'active' :
                  p.status === 'completed' ? 'done' :
                  p.status;
                const displaySc = STATUS_CONFIG[displayStatus] ?? sc;
                return (
                  <div key={p._id} className="px-5 py-4 hover:bg-[rgb(var(--bg-hover))] transition-colors cursor-pointer" onClick={() => navigate(`/rit/de-tai/${p._id}`)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-xs text-[rgb(var(--text-muted))]">{p.code}</span>
                          <Badge variant="neutral">{p.field}</Badge>
                          {p.fundingSource && (
                            <Badge variant={LEVEL_BADGE[p.fundingSource] ?? 'neutral'} size="sm">{p.fundingSource}</Badge>
                          )}
                          <Badge variant={displaySc.variant} size="sm">{displaySc.label}</Badge>
                        </div>
                        <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{p.title}</p>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-[rgb(var(--text-muted))]">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {p.leaderName ?? '—'}</span>
                          <span>{p.departmentName ?? p.department}</span>
                          {p.endDate && <span>📅 {p.endDate}</span>}
                        </div>
                        {(p.status === 'ongoing' || p.status === 'approved') && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-[10px] text-[rgb(var(--text-muted))] mb-1">
                              <span>{t('dashboard.progress')}</span><span>{p.progress}%</span>
                            </div>
                            <div className="h-1.5 w-48 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                              <div className="h-full rounded-full bg-[rgb(var(--primary))]" style={{ width: `${p.progress}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                          {formatVND(p.approvedBudget)}
                        </p>
                        <p className="text-[10px] text-[rgb(var(--text-muted))]">{t('dashboard.budget')}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Publications sidebar */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-[rgb(var(--warning))]" />
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.publications')}</h3>
            </div>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {publicationsQuery.isLoading ? (
              <div className="px-5 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Đang tải...</div>
            ) : recentPublications.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Chưa có công trình nào</div>
            ) : (
              recentPublications.map((pub) => {
                const authorNames = pub.authors?.map((a) => a.name).filter(Boolean).join(', ') || pub.coAuthors?.join(', ') || '—';
                const journalLine = [pub.journalName ?? pub.conferenceName ?? '', pub.year].filter(Boolean).join(', ');
                return (
                  <div key={pub._id} className="px-5 py-3">
                    <p className="text-xs font-medium text-[rgb(var(--primary))] mb-0.5">{authorNames}</p>
                    <p className="text-xs text-[rgb(var(--text-secondary))] italic line-clamp-2">"{pub.title}"</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-[rgb(var(--text-muted))]">{journalLine}</span>
                      {pub.quartile && <Badge variant="info" size="sm">{pub.quartile}</Badge>}
                    </div>
                    <p className="text-[10px] text-[rgb(var(--text-muted))] mt-0.5">📖 {pub.citationCount ?? 0} trích dẫn</p>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Budget chart */}
      <Card>
        <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.budgetByFaculty')}</h3>
          <span className="text-xs text-[rgb(var(--text-muted))]">{t('dashboard.revenue')}: tỷ đồng</span>
        </div>
        <CardContent className="h-64">
          {budgetBars.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-[rgb(var(--text-muted))]">Chưa có dữ liệu</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetBars} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(2)} tỷ đồng`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="budget" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} name={t('dashboard.budget')} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
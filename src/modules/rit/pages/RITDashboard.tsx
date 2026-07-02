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

const RIT_STATS = [
  { label: 'Đề tài NCKH', value: '47', change: '+8 năm nay', icon: <FileText className="h-5 w-5" />, color: 'primary' },
  { label: 'Đang thực hiện', value: '23', sub: '12 cấp trường, 11 cấp Bộ', icon: <Clock className="h-5 w-5" />, color: 'accent' },
  { label: 'Kinh phí năm nay', value: '4.2 tỷ', change: '+18%', icon: <DollarSign className="h-5 w-5" />, color: 'success' },
  { label: 'Bài báo SCOPUS', value: '38', change: '+12', icon: <Award className="h-5 w-5" />, color: 'info' },
];

const PROJECTS = [
  { id: 'p1', code: 'NCKH-2026-001', title: 'Ứng dụng AI trong phát hiện gian lận thi cử', leader: 'PGS.TS. Nguyễn Hoàng Long', dept: 'Khoa CNTT', level: 'Cấp Bộ', budget: 850000000, status: 'active', progress: 65, deadline: '2026-12-31', field: 'AI & Giáo dục' },
  { id: 'p2', code: 'NCKH-2026-002', title: 'Nghiên cứu năng lượng tái tạo cho vùng nông thôn', leader: 'TS. Bùi Minh Tuấn', dept: 'Khoa Khoa học', level: 'Cấp Bộ', budget: 1200000000, status: 'active', progress: 40, deadline: '2027-06-30', field: 'Năng lượng' },
  { id: 'p3', code: 'NCKH-2026-007', title: 'Phát triển hệ thống học trực tuyến cho vùng sâu', leader: 'ThS. Lê Thị Lan', dept: 'Khoa Sư phạm', level: 'Cấp trường', budget: 320000000, status: 'active', progress: 80, deadline: '2026-09-30', field: 'Giáo dục' },
  { id: 'p4', code: 'NCKH-2025-015', title: 'Khảo sát thị trường lao động cho sinh viên tốt nghiệp', leader: 'TS. Trần Hoàng Nam', dept: 'Khoa Kinh tế', level: 'Cấp trường', budget: 280000000, status: 'review', progress: 95, deadline: '2026-06-30', field: 'Kinh tế' },
  { id: 'p5', code: 'NCKH-2024-008', title: 'NCKH vật liệu composite từ phụ phẩm nông nghiệp', leader: 'PGS.TS. Đặng Văn Minh', dept: 'Khoa Khoa học', level: 'Cấp Bộ', budget: 1800000000, status: 'done', progress: 100, deadline: '2025-12-31', field: 'Vật liệu' },
];

const PUBLICATIONS = [
  { author: 'PGS.TS. Nguyễn Hoàng Long', title: 'AI-based anomaly detection in online examination systems', journal: 'IEEE Access', year: 2025, citations: 12, indexed: 'SCOPUS Q1' },
  { author: 'TS. Bùi Minh Tuấn', title: 'Solar energy adoption in rural Vietnam: barriers and opportunities', journal: 'Renewable Energy', year: 2025, citations: 8, indexed: 'SCOPUS Q1' },
  { author: 'ThS. Lê Thị Lan', title: 'E-learning adoption in remote areas: a Vietnam case study', journal: 'Education and Information Technologies', year: 2026, citations: 3, indexed: 'SCOPUS Q2' },
  { author: 'TS. Trần Hoàng Nam', title: 'Graduate employability in Vietnam: a longitudinal survey', journal: 'Journal of Education and Work', year: 2025, citations: 15, indexed: 'SCOPUS Q2' },
];

const BUDGET_BARS = [
  { name: 'CNTT', budget: 1.8 }, { name: 'Khoa học', budget: 2.1 },
  { name: 'Kinh tế', budget: 0.5 }, { name: 'Sư phạm', budget: 0.4 },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'info'; label: string }> = {
  active: { variant: 'success', label: 'Đang thực hiện' },
  review: { variant: 'warning', label: 'Nghiệm thu' },
  done: { variant: 'info', label: 'Hoàn thành' },
};

const LEVEL_BADGE: Record<string, 'error' | 'warning' | 'neutral'> = {
  'Cấp Bộ': 'error',
  'Cấp trường': 'warning',
};

export default function RITDashboard() {
  const { t } = useTranslation('rit');
  const navigate = useNavigate();

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
        {RIT_STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{t(s.label === 'Đề tài NCKH' ? 'dashboard.totalProjects' : s.label === 'Đang thực hiện' ? 'dashboard.inProgress' : s.label === 'Kinh phí năm nay' ? 'dashboard.yearlyBudget' : 'dashboard.scopusPapers')}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
                <p className="text-xs text-[rgb(var(--success))]">{s.change ?? '12 ' + t('dashboard.schoolLevel') + ', 11 ' + t('dashboard.ministryLevel')}</p>
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
            <Badge variant="neutral">{t('dashboard.totalProjects')}: 47</Badge>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {PROJECTS.map((p) => {
              const sc = STATUS_CONFIG[p.status];
              return (
                <div key={p.id} className="px-5 py-4 hover:bg-[rgb(var(--bg-hover))] transition-colors cursor-pointer" onClick={() => navigate(`/rit/de-tai/${p.id}`)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs text-[rgb(var(--text-muted))]">{p.code}</span>
                        <Badge variant="neutral">{p.field}</Badge>
                        <Badge variant={LEVEL_BADGE[p.level]} size="sm">{p.level}</Badge>
                        <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                      </div>
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{p.title}</p>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-[rgb(var(--text-muted))]">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {p.leader}</span>
                        <span>{p.dept}</span>
                        <span>📅 {p.deadline}</span>
                      </div>
                      {p.status === 'active' && (
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
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(p.budget)}
                      </p>
                      <p className="text-[10px] text-[rgb(var(--text-muted))]">{t('dashboard.budget')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
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
            {PUBLICATIONS.map((pub, i) => (
              <div key={i} className="px-5 py-3">
                <p className="text-xs font-medium text-[rgb(var(--primary))] mb-0.5">{pub.author}</p>
                <p className="text-xs text-[rgb(var(--text-secondary))] italic line-clamp-2">"{pub.title}"</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-[rgb(var(--text-muted))]">{pub.journal}, {pub.year}</span>
                  <Badge variant="info" size="sm">{pub.indexed}</Badge>
                </div>
                <p className="text-[10px] text-[rgb(var(--text-muted))] mt-0.5">📖 {pub.citations} trích dẫn</p>
              </div>
            ))}
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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={BUDGET_BARS} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`${v} tỷ đồng`]} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="budget" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} name={t('dashboard.budget')} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

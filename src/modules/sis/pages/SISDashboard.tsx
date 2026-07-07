import { Link } from 'react-router-dom';
import {
  Users,
  Award,
  Download,
  GraduationCap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Badge,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStudentStats, useCurriculumList } from '@/hooks/useSis';

export default function SISDashboard() {
  const { t } = useTranslation('sis');
  const { data: statsData } = useStudentStats();
  const { data: curriculumData } = useCurriculumList({ pageSize: 100 });

  const s = (statsData as any) ?? {};
  const curriculums = curriculumData?.data ?? [];

  const totalStudents = s.total ?? 0;
  const studying = s.byStatus?.studying ?? 0;
  const graduated = s.byStatus?.graduated ?? 0;

  const byDeptData = (s.byDepartment ?? []).slice(0, 6).map((d: any) => ({
    name: d.name?.length > 10 ? d.name.slice(0, 10) + '…' : d.name,
    fullName: d.name,
    count: d.count,
  }));

  const byLevelData = (s.byLevel ?? []).map((l: any) => ({
    name: l._id ?? 'Khác',
    count: l.count,
  }));

  const CARDS = [
    { labelKey: 'dashboard.stats.totalStudents', value: totalStudents.toLocaleString('vi-VN'), icon: <Users className="h-5 w-5" />, color: 'primary' },
    { labelKey: 'dashboard.stats.studying', value: studying.toLocaleString('vi-VN'), icon: <GraduationCap className="h-5 w-5" />, color: 'success' },
    { labelKey: 'dashboard.stats.graduated', value: graduated.toLocaleString('vi-VN'), icon: <Award className="h-5 w-5" />, color: 'accent' },
    { labelKey: 'dashboard.stats.byLevel', value: byLevelData.length, icon: <GraduationCap className="h-5 w-5" />, color: 'info' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
        breadcrumbs={[{ label: 'SIS' }]}
        actions={
          <>
            <Link to="/sis/sinh-vien"><Badge variant="info" dot>{totalStudents.toLocaleString('vi-VN')} {t('dashboard.studentsEnrolled')}</Badge></Link>
            <button className="flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-1.5 text-sm text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary-light))] transition-colors">
              <Download className="h-3.5 w-3.5" /> {t('dashboard.report')}
            </button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((s) => (
          <Card key={s.labelKey}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color}))/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{t(s.labelKey)}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar: by department */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.chart.studentsByDept')}</h3>
          </div>
          <CardContent className="h-64">
            {byDeptData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDeptData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(v: any, _: any, i: any) => [`${v} SV`, (i.payload as any).fullName]} />
                  <Bar dataKey="count" fill="rgb(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[rgb(var(--text-muted))]">Chưa có dữ liệu</div>
            )}
          </CardContent>
        </Card>

        {/* Curriculum summary */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.chart.curriculumSummary')}</h3>
          </div>
          <CardContent className="space-y-3">
            {curriculums.length === 0 ? (
              <p className="text-sm text-[rgb(var(--text-muted))] py-4 text-center">Chưa có chương trình đào tạo</p>
            ) : (
              curriculums.map((c: any) => (
                <div key={c._id} className="flex items-center justify-between py-2 border-b border-[rgb(var(--border)/0.4)] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{c.name}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{c.code} · {c.totalCredits} tín chỉ</p>
                  </div>
                  <Badge variant={c.status === 'active' ? 'success' : 'neutral'} size="sm" dot>
                    {c.status === 'active' ? t('curriculum.status.active') : t('curriculum.status.inactive')}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Enrollment status by level */}
        {byLevelData.length > 0 && (
          <Card>
            <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.chart.studentsByLevel')}</h3>
            </div>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byLevelData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="rgb(var(--accent))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

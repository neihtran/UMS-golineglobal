import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  Download,
  Plus,
  Users,
  Award,
  FileText,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { usePartyMemberList, useActivityList } from '@/hooks/usePms';
import type { Activity, PartyMember } from '@/services/pms.service';

const ROLE_BADGE: Record<string, 'error' | 'warning' | 'neutral' | 'info'> = {
  'Bí thư Đảng ủy': 'error',
  'Phó Bí thư Đảng ủy': 'error',
  'Bí thư Chi bộ': 'warning',
  'Chi ủy viên': 'info',
  'Đảng viên': 'neutral',
};

export default function PMSDashboard() {
  const { t } = useTranslation('pms');
  const navigate = useNavigate();

  const membersQuery = usePartyMemberList({ page: 1, pageSize: 50 });
  const activitiesQuery = useActivityList({ page: 1, pageSize: 100 });

  const members: PartyMember[] = membersQuery.data?.data ?? [];
  const activities: Activity[] = activitiesQuery.data?.data ?? [];

  const totalMembers = membersQuery.data?.pagination?.total ?? members.length;
  const probationary = members.filter((m) => m.partyStatus === 'probationary').length;
  const official = members.filter((m) => m.partyStatus === 'official').length;
  const branches = new Set(members.map((m) => m.branchId).filter(Boolean)).size;

  const stats = [
    {
      label: t('dashboard.totalMembers'),
      value: totalMembers.toLocaleString('vi-VN'),
      change: `${official} chính thức`,
      icon: <Users className="h-5 w-5" />,
      color: 'primary',
    },
    {
      label: t('dashboard.partyCells'),
      value: branches.toLocaleString('vi-VN'),
      sub: t('dashboard.cellUnits', { khoa: '—', phong: '—' }),
      icon: <Landmark className="h-5 w-5" />,
      color: 'accent',
    },
    {
      label: t('dashboard.probationary'),
      value: probationary.toLocaleString('vi-VN'),
      sub: t('dashboard.probationaryDesc'),
      icon: <Award className="h-5 w-5" />,
      color: 'warning',
    },
    {
      label: t('dashboard.centralCells'),
      value: branches > 0 ? '1' : '0',
      sub: t('dashboard.centralCellsDesc'),
      icon: <Star className="h-5 w-5" />,
      color: 'success',
    },
  ];

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
    active: { variant: 'success', label: t('member.status.active') },
    probation: { variant: 'warning', label: t('member.status.probation') },
    suspended: { variant: 'neutral', label: t('member.status.suspended') },
  };

  const recentMembers = members.slice(0, 8);

  // Build 6-month activity aggregation from real activity list
  const monthLabels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
  const now = new Date();
  const activityBuckets = monthLabels.map((m, idx) => {
    const offset = 5 - idx;
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
    const inMonth = activities.filter((a) => {
      const ad = new Date(a.startDate);
      return ad >= start && ad < end;
    });
    return {
      month: m,
      meetings: inMonth.filter((a) => a.type === 'meeting').length,
      studies: inMonth.filter((a) => a.type === 'study' || a.type === 'training').length,
      campaigns: inMonth.filter((a) => a.type === 'volunteer').length,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('titleShort')}
        description={t('description')}
        breadcrumbs={[{ label: 'PMS' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/pms/dang-vien/tao')}>{t('addMember')}</Button>
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
                  {membersQuery.isLoading ? '…' : s.value}
                </p>
                <p className="text-xs text-[rgb(var(--success))]">{s.change ?? s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Member list */}
        <Card className="lg:col-span-2">
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.memberList')}</h3>
          </div>
          <div className="overflow-x-auto">
            {membersQuery.isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Đang tải...</div>
            ) : recentMembers.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">Chưa có đảng viên nào</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--border)/0.6)]">
                    {[t('table.name'), t('table.joinDate'), t('table.branch'), t('table.position'), t('dashboard.education'), t('dashboard.achievements'), t('table.status'), ''].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                  {recentMembers.map((member) => {
                    const sc = STATUS_CONFIG[member.partyStatus] ?? STATUS_CONFIG.active;
                    return (
                      <tr key={member._id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--error)/0.1)] text-xs font-bold text-[rgb(var(--error))]">
                              {(member.employeeName ?? '—').split(' ').slice(-2).map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium text-[rgb(var(--text-primary))]">{member.employeeName ?? '—'}</p>
                              <p className="text-xs text-[rgb(var(--text-muted))]">{t('dashboard.birthDate')} {member.dateOfBirth}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{member.joinDate}</td>
                        <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))] max-w-[140px] truncate">{member.branchName ?? member.branchId}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant={ROLE_BADGE[member.partyPosition ?? ''] ?? 'neutral'} size="sm">{member.partyPosition ?? '—'}</Badge>
                        </td>
                        <td className="px-4 py-2.5"><Badge variant="neutral" size="sm">{member.educationLevel ?? '—'}</Badge></td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
                        </td>
                        <td className="px-4 py-2.5"><Badge variant={sc.variant} size="sm">{sc.label}</Badge></td>
                        <td className="px-4 py-2.5">
                          <Button variant="ghost" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />} onClick={() => navigate(`/pms/dang-vien/${member._id}`)}>{t('member.profile')}</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* Activity chart */}
        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[rgb(var(--error))]" />
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.activity6months')}</h3>
            </div>
          </div>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityBuckets} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="meetings" fill="rgb(var(--error))" radius={[4, 4, 0, 0]} name={t('dashboard.activities.meetings')} />
                <Bar dataKey="studies" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} name={t('dashboard.activities.studies')} />
                <Bar dataKey="campaigns" fill="rgb(var(--success))" radius={[4, 4, 0, 0]} name={t('dashboard.activities.campaigns')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
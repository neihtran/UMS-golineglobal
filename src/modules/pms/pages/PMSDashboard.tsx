import {
  useNavigate,
} from 'react-router-dom';
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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

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

  const PMS_STATS = [
    { label: t('dashboard.totalMembers'), value: '128', change: t('dashboard.newMembers', {count:'5'}), icon: <Users className="h-5 w-5" />, color: 'primary' },
    { label: t('dashboard.partyCells'), value: '12', sub: t('dashboard.cellUnits', {khoa:'8', phong:'4'}), icon: <Landmark className="h-5 w-5" />, color: 'accent' },
    { label: t('dashboard.probationary'), value: '8', sub: t('dashboard.probationaryDesc'), icon: <Award className="h-5 w-5" />, color: 'warning' },
    { label: t('dashboard.centralCells'), value: '1', sub: t('dashboard.centralCellsDesc'), icon: <Star className="h-5 w-5" />, color: 'success' },
  ];

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string }> = {
    active: { variant: 'success', label: t('member.status.active') },
    probation: { variant: 'warning', label: t('member.status.probation') },
    suspended: { variant: 'neutral', label: t('member.status.suspended') },
  };

  const ACTIVITY = [
    { month: 'T1', meetings: 12, studies: 8, campaigns: 2 },
    { month: 'T2', meetings: 10, studies: 6, campaigns: 1 },
    { month: 'T3', meetings: 14, studies: 10, campaigns: 3 },
    { month: 'T4', meetings: 11, studies: 7, campaigns: 2 },
    { month: 'T5', meetings: 13, studies: 9, campaigns: 4 },
    { month: 'T6', meetings: 12, studies: 8, campaigns: 3 },
  ];

  const PARTY_MEMBERS = [
    { id: 'pm1', name: 'GS.TS. Lý Văn Hùng', dob: '1975-10-20', joinDate: '2001-05-15', branch: 'Chi bộ Khoa CNTT', role: 'Bí thư Chi bộ', education: 'Tiến sĩ', status: 'active', achievements: 5 },
    { id: 'pm2', name: 'PGS.TS. Hoàng Thị Lan', dob: '1978-01-25', joinDate: '2003-08-01', branch: 'Chi bộ Ban Giám hiệu', role: 'Phó Bí thư Đảng ủy', education: 'Tiến sĩ', status: 'active', achievements: 4 },
    { id: 'pm3', name: 'TS. Trần Văn Minh', dob: '1982-06-12', joinDate: '2008-03-20', branch: 'Chi bộ Khoa Kinh tế', role: 'Đảng viên', education: 'Tiến sĩ', status: 'active', achievements: 3 },
    { id: 'pm4', name: 'ThS. Nguyễn Thị Oanh', dob: '1985-09-30', joinDate: '2010-07-01', branch: 'Chi bộ Phòng Tổ chức', role: 'Chi ủy viên', education: 'Thạc sĩ', status: 'active', achievements: 2 },
    { id: 'pm5', name: 'CN. Bùi Văn Nam', dob: '1992-03-15', joinDate: '2019-01-10', branch: 'Chi bộ Khoa Sư phạm', role: 'Đảng viên dự bị', education: 'Cử nhân', status: 'probation', achievements: 0 },
    { id: 'pm6', name: 'TS. Lê Thu Hà', dob: '1988-11-08', joinDate: '2015-05-01', branch: 'Chi bộ Khoa Y dược', role: 'Đảng viên', education: 'Tiến sĩ', status: 'active', achievements: 3 },
    { id: 'pm7', name: 'ThS. Đặng Hoàng Sơn', dob: '1986-04-22', joinDate: '2012-03-15', branch: 'Chi bộ Khoa Ngoại ngữ', role: 'Chi ủy viên', education: 'Thạc sĩ', status: 'active', achievements: 2 },
    { id: 'pm8', name: 'PGS.TS. Vũ Minh Quang', dob: '1974-07-18', joinDate: '1999-06-01', branch: 'Chi bộ Ban Giám hiệu', role: 'Bí thư Đảng ủy', education: 'Tiến sĩ', status: 'active', achievements: 6 },
  ];

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
        {PMS_STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-0.5">{s.value}</p>
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border)/0.6)]">
                  {[t('table.name'), t('table.joinDate'), t('table.branch'), t('table.position'), t('dashboard.education'), t('dashboard.achievements'), t('table.status'), ''].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
                {PARTY_MEMBERS.map((member) => {
                  const sc = STATUS_CONFIG[member.status];
                  return (
                    <tr key={member.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--error)/0.1)] text-xs font-bold text-[rgb(var(--error))]">
                            {member.name.split(' ').slice(-2).map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-[rgb(var(--text-primary))]">{member.name}</p>
                            <p className="text-xs text-[rgb(var(--text-muted))]">{t('dashboard.birthDate')} {member.dob}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">{member.joinDate}</td>
                      <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))] max-w-[140px] truncate">{member.branch}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={ROLE_BADGE[member.role] ?? 'neutral'} size="sm">{member.role}</Badge>
                      </td>
                      <td className="px-4 py-2.5"><Badge variant="neutral" size="sm">{member.education}</Badge></td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: member.achievements }).map((_, i) => (
                            <span key={i} className="text-amber-400 text-xs">★</span>
                          ))}
                          {member.achievements === 0 && (
                            <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5"><Badge variant={sc.variant} size="sm">{sc.label}</Badge></td>
                      <td className="px-4 py-2.5">
                        <Button variant="ghost" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />} onClick={() => navigate(`/pms/dang-vien/${member.id}`)}>{t('member.profile')}</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
              <BarChart data={ACTIVITY} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border)/0.5)" />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }}  cursor={{ fill: 'rgb(var(--border)/0.1)' }} />
                <Bar dataKey="meetings" fill="rgb(var(--error))" radius={[4, 4, 0, 0]} name={t('dashboard.activities.meetings')}  animationDuration={1500} animationEasing="ease-out" />
                <Bar dataKey="studies" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} name={t('dashboard.activities.studies')}  animationDuration={1500} animationEasing="ease-out" />
                <Bar dataKey="campaigns" fill="rgb(var(--success))" radius={[4, 4, 0, 0]} name={t('dashboard.activities.campaigns')}  animationDuration={1500} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

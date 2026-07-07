import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  User,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';

const TASKS = [
  { id: 't1', title: 'Soạn thảo báo cáo công tác tuyển sinh 2026', assignee: 'Nguyễn Văn Long', dept: 'Phòng Tuyển sinh', priority: 'high', status: 'in-progress', due: '2026-06-28', progress: 65, module: 'SIS' },
  { id: 't2', title: 'Cập nhật chương trình đào tạo ngành CNTT', assignee: 'TS. Thảo Nguyễn', dept: 'Khoa CNTT', priority: 'high', status: 'in-progress', due: '2026-06-30', progress: 40, module: 'SIS' },
  { id: 't3', title: 'Kiểm tra an ninh mạng cuối quý', assignee: 'Bùi Minh Tuấn', dept: 'Phòng CNTT', priority: 'medium', status: 'pending', due: '2026-07-05', progress: 0, module: 'INT' },
  { id: 't4', title: 'Duyệt hồ sơ miễn giảm học phí đợt 2', assignee: 'Trần Thị Lan', dept: 'Phòng Tài chính', priority: 'high', status: 'pending', due: '2026-06-26', progress: 0, module: 'FIN' },
  { id: 't5', title: 'Tổng kết điểm thi giữa kỳ các môn', assignee: 'TS. Lê Minh', dept: 'Khoa CNTT', priority: 'medium', status: 'done', due: '2026-06-20', progress: 100, module: 'EXAM' },
  { id: 't6', title: 'Đăng ký nghỉ phép quý 2/2026', assignee: 'Phạm Thu Lan', dept: 'Phòng Tổ chức', priority: 'low', status: 'done', due: '2026-06-15', progress: 100, module: 'HRM' },
  { id: 't7', title: 'Triển khai OCR đọc hóa đơn T6', assignee: 'Huy Nguyễn', dept: 'Phòng CNTT', priority: 'medium', status: 'in-progress', due: '2026-07-01', progress: 80, module: 'OCR' },
  { id: 't8', title: 'Biên soạn nội dung portal kỳ 3', assignee: 'Đặng Thu Hà', dept: 'Phòng Truyền thông', priority: 'low', status: 'in-progress', due: '2026-07-10', progress: 30, module: 'PORTAL' },
];

export default function WMSDashboard() {
  const { t } = useTranslation('wms');
  const [filter, setFilter] = useState<'all' | 'mine'>('all');

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral'; label: string; color: string }> = {
    'in-progress': { variant: 'warning', label: t('dashboard.distributionItems.inProgress'), color: '#E8A020' },
    'pending': { variant: 'neutral', label: t('dashboard.distributionItems.pending'), color: '#94A3B8' },
    'done': { variant: 'success', label: t('dashboard.distributionItems.done'), color: '#16A34A' },
  };

  const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
    high: { label: t('task.priority.high'), color: 'rgb(var(--error))' },
    medium: { label: t('task.priority.medium'), color: 'rgb(var(--warning))' },
    low: { label: t('task.priority.low'), color: 'rgb(var(--text-muted))' },
  };

  const DISTRIBUTION = [
    { name: t('dashboard.distributionItems.done'), value: 89, color: '#16A34A' },
    { name: t('dashboard.distributionItems.inProgress'), value: 47, color: '#E8A020' },
    { name: t('dashboard.distributionItems.pending'), value: 12, color: '#94A3B8' },
    { name: t('dashboard.distributionItems.overdue'), value: 7, color: '#DC2626' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        breadcrumbs={[{ label: 'WMS' }]}
        actions={<Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t('dashboard.statTotal'), value: '284', change: '+18', icon: <ClipboardList className="h-5 w-5" />, color: 'primary' },
          { label: t('dashboard.statInProgress'), value: '47', sub: t('dashboard.statInProgressSub'), icon: <Clock className="h-5 w-5" />, color: 'warning' },
          { label: t('dashboard.statPending'), value: '12', sub: t('dashboard.statPendingSub'), icon: <AlertTriangle className="h-5 w-5" />, color: 'error' },
          { label: t('dashboard.statCompleted'), value: '89', change: '+23', icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
        ].map((s) => (
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
        <Card className="lg:col-span-2">
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)] flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.taskList')}</h3>
            <div className="flex gap-2">
              {(['all', 'mine'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                    filter === f
                      ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))] text-white'
                      : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))]'
                  }`}
                >
                  {f === 'all' ? t('task.filterAll') : t('task.filterMine')}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.5)]">
            {TASKS.map((task) => {
              const sc = STATUS_CONFIG[task.status];
              const pc = PRIORITY_CONFIG[task.priority];
              const isOverdue = task.due < '2026-06-25' && task.status !== 'done';
              return (
                <div key={task.id} className="flex items-start gap-3 px-5 py-3 hover:bg-[rgb(var(--bg-hover))] transition-colors">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: pc.color }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <Badge variant="neutral" size="sm">{task.module}</Badge>
                      <span className={`text-xs font-medium ${isOverdue ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--text-muted))]'}`}>
                        {isOverdue ? `⚠️ ${t('task.overdue')}: ${task.due}` : `📅 ${task.due}`}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{task.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-[rgb(var(--text-muted))]">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {task.assignee}</span>
                      <span>{task.dept}</span>
                    </div>
                    {task.status === 'in-progress' && (
                      <div className="mt-2">
                        <div className="h-1.5 w-48 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                          <div className="h-full rounded-full bg-[rgb(var(--warning))]" style={{ width: `${task.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-[rgb(var(--text-muted))]">{task.progress}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.distribution')}</h3>
          </div>
          <CardContent className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart animationDuration={1500} animationEasing="ease-out">
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Pie
                  data={DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                 animationDuration={1500} animationEasing="ease-out">
                  {DISTRIBUTION.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v} ${t('task.title').toLowerCase()}`} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="px-5 pb-4 space-y-2">
            {DISTRIBUTION.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-[rgb(var(--text-secondary))]">{d.name}</span>
                </div>
                <span className="font-semibold text-[rgb(var(--text-primary))]">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

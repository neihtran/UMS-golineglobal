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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTaskList } from '@/hooks/useWms';
import { useAuthStore } from '@/stores/authStore';

export default function WMSDashboard() {
  const { t } = useTranslation('wms');
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const currentUserId = useAuthStore((s: any) => s.user?.id);

  const filters = {
    page: 1,
    pageSize: 200,
    ...(filter === 'mine' && currentUserId ? { assignedTo: currentUserId } : {}),
  };

  const { data: tasksResp, isLoading } = useTaskList(filters);

  const allTasks = (tasksResp?.data ?? []) as any[];
  const total = tasksResp?.pagination?.total ?? allTasks.length;

  const tasks = filter === 'mine' ? allTasks : allTasks;

  const inProgressCount = tasks.filter((task: any) => task.status === 'in_progress').length;
  const pendingCount = tasks.filter((task: any) => task.status === 'todo' || task.status === 'review').length;
  const doneCount = tasks.filter((task: any) => task.status === 'done').length;
  const overdueCount = tasks.filter((task: any) => {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date(task.dueDate) < new Date();
  }).length;

  const WMS_STATS = [
    { label: t('dashboard.statTotal'), value: total, change: '+' + Math.min(total, 18), icon: <ClipboardList className="h-5 w-5" />, color: 'primary' },
    { label: t('dashboard.statInProgress'), value: inProgressCount, sub: overdueCount > 0 ? `${overdueCount} ${t('dashboard.distributionItems.overdue')}` : t('dashboard.statInProgressSub'), icon: <Clock className="h-5 w-5" />, color: 'warning' },
    { label: t('dashboard.statPending'), value: pendingCount, sub: t('dashboard.statPendingSub'), icon: <AlertTriangle className="h-5 w-5" />, color: 'error' },
    { label: t('dashboard.statCompleted'), value: doneCount, change: '+' + Math.min(doneCount, 23), icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' },
  ];

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'neutral' | 'info'; label: string; color: string }> = {
    todo: { variant: 'neutral', label: t('task.status.todo'), color: '#94A3B8' },
    'in-progress': { variant: 'warning', label: t('task.status.in_progress'), color: '#E8A020' },
    in_progress: { variant: 'warning', label: t('task.status.in_progress'), color: '#E8A020' },
    pending: { variant: 'neutral', label: t('task.status.pending_approval'), color: '#94A3B8' },
    review: { variant: 'info', label: t('task.status.review'), color: '#2563EB' },
    done: { variant: 'success', label: t('task.status.done'), color: '#16A34A' },
    cancelled: { variant: 'neutral', label: t('task.status.cancelled') ?? 'Đã hủy', color: '#94A3B8' },
  };

  const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
    low: { label: t('task.priority.low'), color: 'rgb(var(--text-muted))' },
    medium: { label: t('task.priority.medium'), color: 'rgb(var(--warning))' },
    high: { label: t('task.priority.high'), color: 'rgb(var(--error))' },
    critical: { label: t('task.priority.urgent'), color: 'rgb(var(--error))' },
    urgent: { label: t('task.priority.urgent'), color: 'rgb(var(--error))' },
  };

  const DISTRIBUTION = [
    { name: t('dashboard.distributionItems.done'), value: doneCount, color: '#16A34A' },
    { name: t('dashboard.distributionItems.inProgress'), value: inProgressCount, color: '#E8A020' },
    { name: t('dashboard.distributionItems.pending'), value: pendingCount, color: '#94A3B8' },
    { name: t('dashboard.distributionItems.overdue'), value: overdueCount, color: '#DC2626' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        breadcrumbs={[{ label: 'WMS' }]}
        actions={<Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>{t('export')}</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {WMS_STATS.map((s) => (
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-4 animate-pulse">
                  <div className="h-3 w-2/3 rounded bg-[rgb(var(--bg-hover))]" />
                  <div className="mt-2 h-2 w-1/3 rounded bg-[rgb(var(--bg-hover))]" />
                </div>
              ))
            ) : tasks.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[rgb(var(--text-muted))]">—</p>
            ) : (
              tasks.slice(0, 20).map((task: any) => {
                const sc = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.todo;
                const pc = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.low;
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
                return (
                  <div key={task._id} className="flex items-start gap-3 px-5 py-3 hover:bg-[rgb(var(--bg-hover))] transition-colors">
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: pc.color }} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        {task.projectName && <Badge variant="neutral" size="sm">{task.projectName}</Badge>}
                        <span className={`text-xs font-medium ${isOverdue ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--text-muted))]'}`}>
                          {isOverdue ? `⚠️ ${t('task.overdue')}: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '—'}` : `📅 ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '—'}`}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{task.title ?? '—'}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-[rgb(var(--text-muted))]">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {task.assignedToName ?? task.assignedTo ?? '—'}</span>
                      </div>
                      {task.status === 'in_progress' && (
                        <div className="mt-2">
                          <div className="h-1.5 w-48 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                            <div className="h-full rounded-full bg-[rgb(var(--warning))]" style={{ width: `${task.progress ?? 0}%` }} />
                          </div>
                          <span className="text-[10px] text-[rgb(var(--text-muted))]">{task.progress ?? 0}%</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card>
          <div className="px-5 pt-5 pb-4 border-b border-[rgb(var(--border)/0.6)]">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('dashboard.distribution')}</h3>
          </div>
          <CardContent className="h-52 flex items-center justify-center">
            {DISTRIBUTION.length === 0 ? (
              <p className="text-sm text-[rgb(var(--text-muted))]">—</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {DISTRIBUTION.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v} ${t('task.title').toLowerCase()}`} contentStyle={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
          <div className="px-5 pb-4 space-y-2">
            {DISTRIBUTION.length === 0 ? (
              <p className="text-xs text-[rgb(var(--text-muted))]">—</p>
            ) : (
              DISTRIBUTION.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-[rgb(var(--text-secondary))]">{d.name}</span>
                  </div>
                  <span className="font-semibold text-[rgb(var(--text-primary))]">{d.value}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
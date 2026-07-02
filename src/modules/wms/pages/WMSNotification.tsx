import { Card, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { CheckCheck, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

const TASKS = [
  { id: 't1', title: 'Hoàn thành báo cáo KPI tháng 6', deadline: '28/06/2026', priority: 'high', status: 'in_progress', module: 'BI', assignee: 'Nguyễn Văn Admin', progress: 60, daysLeft: 2 },
  { id: 't2', title: 'Cập nhật học liệu LMS môn INT2201', deadline: '30/06/2026', priority: 'medium', status: 'todo', module: 'LMS', assignee: 'Thảo Nguyễn', progress: 20, daysLeft: 4 },
  { id: 't3', title: 'Duyệt đơn nghỉ phép viên chức tháng 6', deadline: '27/06/2026', priority: 'urgent', status: 'in_progress', module: 'HRM', assignee: 'Chu Hanh', progress: 80, daysLeft: 1 },
  { id: 't4', title: 'Tổng hợp minh chứng AUN số 3', deadline: '15/07/2026', priority: 'high', status: 'todo', module: 'QA', assignee: 'Nguyễn Văn Admin', progress: 0, daysLeft: 19 },
  { id: 't5', title: 'Kiểm tra kết nối API HEMIS', deadline: '25/06/2026', priority: 'urgent', status: 'done', module: 'INT', assignee: 'Nguyễn Văn Admin', progress: 100, daysLeft: -1 },
];

const PRIORITY_CONFIG: Record<string, { variant: 'error' | 'warning' | 'info' | 'neutral'; label: string }> = {
  urgent: { variant: 'error', label: 'Khẩn cấp' },
  high: { variant: 'warning', label: 'Cao' },
  medium: { variant: 'info', label: 'Trung bình' },
  low: { variant: 'neutral', label: 'Thấp' },
};

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'info' | 'error' | 'neutral'; label: string; icon: React.ReactNode }> = {
  done: { variant: 'success', label: 'Hoàn thành', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  in_progress: { variant: 'warning', label: 'Đang làm', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  todo: { variant: 'info', label: 'Chưa làm', icon: <Info className="h-3.5 w-3.5" /> },
};

export default function WMSNotification() {
  const urgent = TASKS.filter((t) => t.priority === 'urgent' && t.status !== 'done');
  const upcoming = TASKS.filter((t) => t.daysLeft >= 0 && t.daysLeft <= 3 && t.status !== 'done');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Công việc của tôi"
        description="WMS-01 — Theo dõi công việc được giao và deadline"
        breadcrumbs={[
          { label: 'WMS', href: '/wms' },
          { label: 'Công việc' },
        ]}
        actions={
          <Button variant="outline" leftIcon={<CheckCheck className="h-4 w-4" />} onClick={() => window.location.href = '/wms/cong-viec'}>
            Xem tất cả
          </Button>
        }
      />

      {/* Urgent */}
      {urgent.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[rgb(var(--error))] flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[rgb(var(--error))] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[rgb(var(--error))]" />
            </span>
            Cần xử lý ngay ({urgent.length})
          </h3>
          <div className="space-y-2">
            {urgent.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg border border-[rgb(var(--error)/0.3)] bg-[rgb(var(--error)/0.04)] px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--error)/0.1)]">
                  <AlertTriangle className="h-4 w-4 text-[rgb(var(--error))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{t.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="neutral" size="sm">{t.module}</Badge>
                    <span className="text-xs text-[rgb(var(--text-muted))]">·</span>
                    <span className="text-xs text-[rgb(var(--error))]">Hạn: {t.deadline}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm">Xem</Button>
                    <Button size="sm" className="bg-[rgb(var(--error))]">Xử lý</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">Sắp đến hạn</h3>
        {upcoming.map((t) => {
          const sc = STATUS_CONFIG[t.status];
          const pc = PRIORITY_CONFIG[t.priority];
          return (
            <Card key={t.id} className="hover:border-[rgb(var(--border))] transition-all">
              <div className="flex items-start gap-4 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)]">
                  {sc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[rgb(var(--text-primary))]">{t.title}</p>
                    <Badge variant={pc.variant} size="sm">{pc.label}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[rgb(var(--text-muted))]">
                    <span>{t.module}</span>
                    <span>·</span>
                    <span>{t.assignee}</span>
                    <span>·</span>
                    <span className={t.daysLeft <= 1 ? 'text-[rgb(var(--error))] font-semibold' : ''}>Còn {t.daysLeft} ngày</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[rgb(var(--bg-base))] overflow-hidden">
                      <div className="h-full rounded-full bg-[rgb(var(--primary))]" style={{ width: `${t.progress}%` }} />
                    </div>
                    <span className="text-xs text-[rgb(var(--text-muted))] shrink-0">{t.progress}%</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent completed */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">Hoàn thành gần đây</h3>
        {TASKS.filter((t) => t.status === 'done').map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-[rgb(var(--success))]" />
            <div className="flex-1">
              <p className="text-sm text-[rgb(var(--text-secondary))]">{t.title}</p>
              <p className="text-xs text-[rgb(var(--text-muted))]">{t.module} · {t.assignee}</p>
            </div>
            <Badge variant="success" size="sm" dot>Hoàn thành</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Plus, CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const TASKS = [
  { id: 't1', title: 'Hoàn thành báo cáo tháng 6', assignee: 'Nguyễn Văn Minh', due: '2026-06-30', priority: 'high', status: 'in-progress' },
  { id: 't2', title: 'Soạn đề thi giữa kỳ Python', assignee: 'TS. Lê Thị Lan', due: '2026-07-05', priority: 'medium', status: 'todo' },
  { id: 't3', title: 'Cập nhật CTĐT ngành CNTT', assignee: 'ThS. Trần Hoàng Nam', due: '2026-07-10', priority: 'medium', status: 'todo' },
  { id: 't4', title: 'Kiểm tra thiết bị phòng lab', assignee: 'Bùi Minh Tuấn', due: '2026-06-28', priority: 'high', status: 'done' },
  { id: 't5', title: 'Duyệt đơn nghỉ phép NV', assignee: 'PGS. Đặng Văn Minh', due: '2026-06-26', priority: 'low', status: 'overdue' },
];

const COLUMNS = [
  { id: 'todo', label: 'Cần làm', icon: <Circle className="h-4 w-4" />, color: 'neutral' },
  { id: 'in-progress', label: 'Đang làm', icon: <Clock className="h-4 w-4" />, color: 'warning' },
  { id: 'done', label: 'Hoàn thành', icon: <CheckCircle2 className="h-4 w-4" />, color: 'success' },
  { id: 'overdue', label: 'Quá hạn', icon: <AlertTriangle className="h-4 w-4" />, color: 'error' },
];
const PRIORITY_COLORS: Record<string, 'error' | 'warning' | 'success'> = { high: 'error', medium: 'warning', low: 'success' };

export default function WMSKanbanPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kanban Board"
        description="Quản lý công việc theo trạng thái"
        breadcrumbs={[{ label: 'WMS', href: '/wms' }, { label: 'Kanban' }]}
        actions={<Button leftIcon={<Plus className="h-4 w-4" />}>Tạo công việc</Button>}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const colTasks = TASKS.filter((t) => t.status === col.id);
          return (
            <div key={col.id}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-[rgb(var(--${col.color})/0.1)] text-[rgb(var(--${col.color}))]`}>
                  {col.icon}
                </div>
                <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{col.label}</span>
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[rgb(var(--${col.color})/0.1)] px-1.5 text-[10px] font-bold text-[rgb(var(--${col.color}))]">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {colTasks.map((task) => (
                  <Card key={task.id} className="hover:border-[rgb(var(--primary)/0.3)] transition-colors cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={PRIORITY_COLORS[task.priority]} size="sm">
                          {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp'}
                        </Badge>
                        <span className="text-[10px] text-[rgb(var(--text-muted))]">📅 {task.due}</span>
                      </div>
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))] leading-snug">{task.title}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-2">👤 {task.assignee}</p>
                    </CardContent>
                  </Card>
                ))}
                {colTasks.length === 0 && (
                  <div className="rounded-xl border border-dashed border-[rgb(var(--border))] p-6 text-center">
                    <p className="text-xs text-[rgb(var(--text-muted))]">Không có công việc</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Download, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Card, DetailModal } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useDetailModal } from '@/hooks';
import TaskDetail from './TaskDetail';

const TASKS = [
  { id: 't1', title: 'Soạn thảo báo cáo công tác tuyển sinh 2026', assignee: 'Nguyễn Văn Long', dept: 'Phòng Tuyển sinh', priority: 'high', status: 'in_progress', due: '2026-06-28', progress: 65, module: 'SIS' },
  { id: 't2', title: 'Cập nhật chương trình đào tạo ngành CNTT', assignee: 'TS. Thảo Nguyễn', dept: 'Khoa CNTT', priority: 'high', status: 'in_progress', due: '2026-06-30', progress: 40, module: 'SIS' },
  { id: 't3', title: 'Kiểm tra an ninh mạng cuối quý', assignee: 'Bùi Minh Tuấn', dept: 'Phòng CNTT', priority: 'medium', status: 'todo', due: '2026-07-05', progress: 0, module: 'INT' },
  { id: 't4', title: 'Duyệt hồ sơ miễn giảm học phí đợt 2', assignee: 'Trần Thị Lan', dept: 'Phòng Tài chính', priority: 'high', status: 'todo', due: '2026-06-26', progress: 0, module: 'FIN' },
  { id: 't5', title: 'Tổng kết điểm thi giữa kỳ các môn', assignee: 'TS. Lê Minh', dept: 'Khoa CNTT', priority: 'medium', status: 'done', due: '2026-06-20', progress: 100, module: 'EXAM' },
  { id: 't6', title: 'Đăng ký nghỉ phép quý 2/2026', assignee: 'Phạm Thu Lan', dept: 'Phòng Tổ chức', priority: 'low', status: 'done', due: '2026-06-15', progress: 100, module: 'HRM' },
  { id: 't7', title: 'Triển khai OCR đọc hóa đơn T6', assignee: 'Huy Nguyễn', dept: 'Phòng CNTT', priority: 'medium', status: 'in_progress', due: '2026-07-01', progress: 80, module: 'OCR' },
  { id: 't8', title: 'Biên soạn nội dung portal kỳ 3', assignee: 'Đặng Thu Hà', dept: 'Phòng Truyền thông', priority: 'low', status: 'in_progress', due: '2026-07-10', progress: 30, module: 'PORTAL' },
  { id: 't9', title: 'Phân bổ kinh phí NCKH cấp trường', assignee: 'PGS.TS. Nguyễn Hoàng Long', dept: 'Phòng KHCN', priority: 'high', status: 'todo', due: '2026-06-30', progress: 0, module: 'RIT' },
  { id: 't10', title: 'Rà soát chất lượng đề thi cuối kỳ', assignee: 'TS. Bùi Minh Tuấn', dept: 'Phòng Đào tạo', priority: 'medium', status: 'review', due: '2026-07-10', progress: 90, module: 'EXAM' },
  { id: 't11', title: 'Đối soát dữ liệu sinh viên với HEMIS', assignee: 'Chu Hanh', dept: 'Phòng Đào tạo', priority: 'medium', status: 'in_progress', due: '2026-07-02', progress: 55, module: 'INT' },
  { id: 't12', title: 'Bàn giao tài liệu kế nhiệm KTX', assignee: 'Lê Thị Hương', dept: 'KTX', priority: 'low', status: 'done', due: '2026-06-20', progress: 100, module: 'KTX' },
];

export default function TaskList() {
  const { t } = useTranslation('wms');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { selectedId, openDetail, close } = useDetailModal({ size: 'fullscreen' });
  const selectedTask = selectedId ? TASKS.find((task) => task.id === selectedId) : null;

  const filtered = TASKS.filter((task) => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    return true;
  });

  const counts = {
    all: TASKS.length,
    todo: TASKS.filter((task) => task.status === 'todo').length,
    in_progress: TASKS.filter((task) => task.status === 'in_progress').length,
    review: TASKS.filter((task) => task.status === 'review').length,
    done: TASKS.filter((task) => task.status === 'done').length,
  };

  const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'info' | 'neutral'; label: string; color: string }> = {
    todo: { variant: 'neutral', label: t('task.status.todo'), color: '#94A3B8' },
    in_progress: { variant: 'warning', label: t('task.status.in_progress'), color: '#E8A020' },
    review: { variant: 'info', label: t('task.status.review'), color: '#2563EB' },
    done: { variant: 'success', label: t('task.status.done'), color: '#16A34A' },
  };

  const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
    high: { label: t('task.priority.high'), color: 'rgb(var(--error))' },
    medium: { label: t('task.priority.medium'), color: 'rgb(var(--warning))' },
    low: { label: t('task.priority.low'), color: 'rgb(var(--text-muted))' },
  };

  const filterTabs = [
    { id: 'all', label: t('task.filterAll'), count: counts.all },
    { id: 'todo', label: t('task.status.todo'), count: counts.todo },
    { id: 'in_progress', label: t('task.status.in_progress'), count: counts.in_progress },
    { id: 'review', label: t('task.status.review'), count: counts.review },
    { id: 'done', label: t('task.status.done'), count: counts.done },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('task.title')}
        description={t('task.subtitle')}
        breadcrumbs={[
          { label: 'WMS', href: '/wms' },
          { label: t('task.title') },
        ]}
        actions={
          <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>{t('task.export')}</Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {filterTabs.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === f.id
                ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))] text-white'
                : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--primary-light))]'
            }`}
          >
            {f.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
              statusFilter === f.id ? 'bg-white/20' : 'bg-[rgb(var(--bg-base))]'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--border)/0.6)]">
                {['', t('task.tenCv'), t('task.nguoiNhan'), t('task.donVi'), t('task.doUuTien'), t('task.hanChot'), t('task.tienDo'), t('task.trangThai'), ''].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border)/0.4)]">
              {filtered.map((task) => {
                const sc = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG];
                const pc = PRIORITY_CONFIG[task.priority];
                const isOverdue = task.due < '2026-06-25' && task.status !== 'done';
                return (
                  <tr key={task.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: pc.color }} title={pc.label} />
                    </td>
                    <td className="px-4 py-2.5">
                      <div>
                        <p className={`text-sm font-medium ${isOverdue ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--text-primary))]'}`}>
                          {isOverdue ? `⚠️ ` : ''}{task.title}
                        </p>
                        <Badge variant="neutral" size="sm" className="mt-1">{task.module}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[rgb(var(--text-secondary))]">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-[10px] font-bold text-[rgb(var(--primary))]">
                          {task.assignee.split(' ').map((n) => n[0]).slice(-2).join('')}
                        </div>
                        <span className="text-xs">{task.assignee}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[rgb(var(--text-muted))]">{task.dept}</td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: pc.color }} />
                        {pc.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs tabular-nums text-[rgb(var(--text-muted))]">
                      {isOverdue ? (
                        <span className="text-[rgb(var(--error))] font-medium">{t('task.overdue')}: {task.due}</span>
                      ) : (
                        task.due
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              task.progress >= 100 ? 'bg-[rgb(var(--success))]' :
                              task.progress > 0 ? 'bg-[rgb(var(--primary))]' :
                              'bg-[rgb(var(--text-muted))]'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[rgb(var(--text-muted))] w-7">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(task.id)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-[rgb(var(--text-muted))]">
            {t('task.noResult')}
          </div>
        )}
      </Card>

      <DetailModal
        open={!!selectedId}
        onClose={close}
        title={selectedTask?.title ?? ''}
        description={selectedTask ? `#${selectedTask.id} · ${selectedTask.module}` : ''}
        size="fullscreen"
      >
        {selectedId ? <TaskDetail id={selectedId} /> : null}
      </DetailModal>
    </div>
  );
}

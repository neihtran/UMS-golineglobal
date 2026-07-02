import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus, Filter, AlertTriangle, User, Calendar,
  GripVertical, ChevronRight, MoreVertical, Pencil, Trash2,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useNavigate } from 'react-router-dom';

type Task = {
  id: string;
  title: string;
  assignee: string;
  dept: string;
  priority: string;
  dueDate: string;
  tags: string[];
  progress?: number;
};

type Column = {
  id: string;
  title: string;
  color: string;
  colorBg: string;
  borderColor: string;
  tasks: Task[];
};

export default function TaskBoard() {
  const { t } = useTranslation('wms');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('Tất cả');
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS(t));
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = useCallback((taskId: string) => {
    setDraggedTaskId(taskId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColId(colId);
  }, []);

  const handleDragLeave = useCallback((_e: React.DragEvent) => {
    setDragOverColId(null);
  }, []);

  const handleDrop = useCallback(
    (targetColId: string) => {
      if (!draggedTaskId) return;

      setColumns((prev) => {
        const next: Column[] = [];
        let moved: Task | undefined;

        for (const col of prev) {
          const filtered = col.tasks.filter((t) => t.id !== draggedTaskId);
          if (filtered.length !== col.tasks.length) {
            moved = col.tasks.find((t) => t.id === draggedTaskId);
            next.push({ ...col, tasks: filtered });
          } else {
            next.push(col);
          }
        }

        if (moved) {
          return next.map((col) =>
            col.id === targetColId
              ? { ...col, tasks: [...col.tasks, moved!] }
              : col,
          );
        }
        return prev;
      });

      setDraggedTaskId(null);
      setDragOverColId(null);
    },
    [draggedTaskId],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null);
    setDragOverColId(null);
  }, []);

  const isOverdue = (date: string) => new Date(date) < new Date();

  const deptOptions = ['Tất cả', 'Phòng Tổ chức', 'Khoa CNTT', 'Khoa Kinh tế', 'Phòng Tài chính', 'Phòng CNTT', 'Ban Giám hiệu'];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('kanban.title')}
        description={t('kanban.subtitle')}
        breadcrumbs={[{ label: 'WMS', href: '/wms' }, { label: 'Kanban' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
              {t('kanban.filter')}
            </Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/wms/tao-cv')}>
              {t('kanban.addTask')}
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder={t('task.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          wrapperClassName="w-80"
        />
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]"
        >
          {deptOptions.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-4 gap-4 overflow-x-auto">
        {columns.map((col) => {
          const filteredTasks = col.tasks.filter((task) => {
            const matchSearch = !search || task.title.toLowerCase().includes(search.toLowerCase());
            const matchDept = filterDept === 'Tất cả' || task.dept === filterDept;
            return matchSearch && matchDept;
          });

          const isOver = dragOverColId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(col.id)}
              className={clsxTransition(
                'flex flex-col gap-3 rounded-xl border-2 border-dashed transition-colors min-h-[200px] p-1',
                isOver
                  ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary-light))/0.05]'
                  : 'border-transparent',
              )}
            >
              <div
                className={clsxTransition(
                  'flex items-center gap-2 rounded-xl border px-4 py-3',
                  col.borderColor,
                  col.colorBg,
                )}
              >
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: col.color }} />
                <span className="font-semibold text-[rgb(var(--text-primary))] truncate">{col.title}</span>
                <span
                  className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: col.color }}
                >
                  {filteredTasks.length}
                </span>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                {filteredTasks.map((task) => {
                  const overdue = isOverdue(task.dueDate) && col.id !== 'done';
                  const isDragging = draggedTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onDragEnd={handleDragEnd}
                      className={clsxTransition(
                        'group rounded-xl border bg-[rgb(var(--bg-card))] p-3 cursor-grab active:cursor-grabbing transition-all select-none',
                        isDragging
                          ? 'opacity-40 scale-95 border-[rgb(var(--primary))]'
                          : 'border-[rgb(var(--border))] hover:-translate-y-0.5 hover:shadow-md hover:border-[rgb(var(--primary-light))]',
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <GripVertical className="h-3.5 w-3.5 text-[rgb(var(--text-muted))] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <TaskActionMenu taskId={task.id} onView={() => navigate(`/wms/cong-viec/${task.id}`)} />
                      </div>

                      <div className="flex items-center gap-1.5 mb-2">
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getPriorityStyle(task.priority)}`}>
                          {t(`task.priority.${task.priority === 'medium' ? 'medium' : task.priority}`)}
                        </span>
                        {overdue && (
                          <span className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                            <AlertTriangle className="h-3 w-3" />
                            {t('task.overdue')}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => navigate(`/wms/cong-viec/${task.id}`)}
                        className="text-sm font-medium text-[rgb(var(--text-primary))] leading-tight mb-2 text-left w-full hover:text-[rgb(var(--primary))] transition-colors"
                      >
                        {task.title}
                      </button>

                      {task.progress !== undefined && task.progress < 100 && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-[rgb(var(--text-muted))]">{t('task.tienDo')}</span>
                            <span className="text-[10px] font-semibold text-[rgb(var(--primary))]">{task.progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                            <div className="h-full rounded-full bg-[rgb(var(--primary))] transition-all" style={{ width: `${task.progress}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mb-2">
                        {task.tags.map((tag) => (
                          <span key={tag} className="rounded bg-[rgb(var(--border))] px-1.5 py-0.5 text-[10px] font-medium text-[rgb(var(--text-secondary))]">{tag}</span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-muted))]">
                          <User className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[80px]">{task.assignee.split(' ').slice(-1)[0]}</span>
                        </div>
                        <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500 font-semibold' : 'text-[rgb(var(--text-muted))]'}`}>
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span className="whitespace-nowrap">{task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[rgb(var(--border))] py-8 text-center">
                    <p className="text-xs text-[rgb(var(--text-muted))]">
                      {dragOverColId === col.id ? t('kanban.dropHere') : t('kanban.noTask')}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => navigate('/wms/tao-cv')}
                  className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-[rgb(var(--border))] p-2 text-xs text-[rgb(var(--text-muted))] transition-colors hover:border-[rgb(var(--primary-light))] hover:text-[rgb(var(--primary))]"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>{t('kanban.addNew')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskActionMenu({ taskId, onView }: { taskId: string; onView: () => void }) {
  const { t } = useTranslation('wms');
  return (
    <div className="relative group/menu">
      <button
        onClick={(e) => {
          e.stopPropagation();
          const menu = document.getElementById(`task-menu-${taskId}`);
          menu?.classList.toggle('hidden');
        }}
        className="rounded p-1 text-[rgb(var(--text-muted))] opacity-0 group-hover:opacity-100 hover:bg-[rgb(var(--border))] transition-all"
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </button>
      <div
        id={`task-menu-${taskId}`}
        className="hidden absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] shadow-lg py-1"
      >
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--border))] transition-colors"
        >
          <ChevronRight className="h-3 w-3" />
          {t('menu.view')}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); console.log('Edit', taskId); }}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--border))] transition-colors"
        >
          <Pencil className="h-3 w-3" />
          {t('menu.edit')}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); console.log('Delete', taskId); }}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          {t('menu.delete')}
        </button>
      </div>
    </div>
  );
}

function clsxTransition(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

function getPriorityStyle(priority: string) {
  const styles: Record<string, string> = {
    urgent: 'text-red-600 bg-red-50 border-red-200',
    high: 'text-amber-600 bg-amber-50 border-amber-200',
    medium: 'text-blue-600 bg-blue-50 border-blue-200',
    low: 'text-slate-500 bg-slate-50 border-slate-200',
  };
  return styles[priority] || styles.low;
}

function INITIAL_COLUMNS(t: ReturnType<typeof useTranslation>['t']): Column[] {
  return [
    {
      id: 'todo',
      title: t('task.status.todo'),
      color: '#D97706',
      colorBg: 'bg-amber-50',
      borderColor: 'border-amber-200',
      tasks: [
        { id: 't1', title: 'Hoàn thiện báo cáo tổng kết năm học 2025-2026', assignee: 'Phạm Thu Hà', dept: 'Phòng Tổ chức', priority: 'high', dueDate: '2026-06-30', tags: ['HRM', 'Báo cáo'], progress: 0 },
        { id: 't2', title: 'Cập nhật CTĐT ngành Kinh tế theo chuẩn mới của Bộ', assignee: 'Trần Thị Mai Lan', dept: 'Khoa Kinh tế', priority: 'high', dueDate: '2026-08-01', tags: ['SIS', 'CTĐT'], progress: 0 },
        { id: 't3', title: 'Triển khai LMS cho 20 lớp học mới HK2', assignee: 'Ngô Thanh Sơn', dept: 'Khoa CNTT', priority: 'medium', dueDate: '2026-07-01', tags: ['LMS'], progress: 0 },
        { id: 't4', title: 'Rà soát hồ sơ tuyển dụng giảng viên CNTT', assignee: 'Bùi Đình Nam', dept: 'Khoa Ngoại ngữ', priority: 'low', dueDate: '2026-07-10', tags: ['HRM', 'Tuyển dụng'], progress: 0 },
      ],
    },
    {
      id: 'in_progress',
      title: t('task.status.in_progress'),
      color: '#2563EB',
      colorBg: 'bg-blue-50',
      borderColor: 'border-blue-200',
      tasks: [
        { id: 't5', title: 'Số hóa 500 hồ sơ sinh viên khóa 2019-2023', assignee: 'Trịnh Thu Phương', dept: 'Phòng Tổ chức', priority: 'medium', dueDate: '2026-07-15', tags: ['OCR', 'SIS'], progress: 40 },
        { id: 't6', title: 'Kiểm tra bảo mật hệ thống trước đợt thi cuối kỳ', assignee: 'Vũ Minh Tuấn', dept: 'Phòng CNTT', priority: 'urgent', dueDate: '2026-06-28', tags: ['IAM'], progress: 25 },
        { id: 't7', title: 'Biên soạn nội dung portal cho kỳ 3', assignee: 'Đặng Thu Hà', dept: 'Phòng Truyền thông', priority: 'low', dueDate: '2026-07-10', tags: ['PORTAL'], progress: 30 },
      ],
    },
    {
      id: 'pending_approval',
      title: t('task.status.pending_approval'),
      color: '#9333EA',
      colorBg: 'bg-purple-50',
      borderColor: 'border-purple-200',
      tasks: [
        { id: 't8', title: 'Duyệt hồ sơ miễn giảm học phí đợt 2', assignee: 'Trần Thị Lan', dept: 'Phòng Tài chính', priority: 'high', dueDate: '2026-06-26', tags: ['FIN'], progress: 0 },
        { id: 't9', title: 'Phê duyệt đề tài NCKH cấp trường năm 2026', assignee: 'Lý Văn Hùng', dept: 'Ban Giám hiệu', priority: 'high', dueDate: '2026-06-27', tags: ['RIT'], progress: 0 },
      ],
    },
    {
      id: 'done',
      title: t('task.status.done'),
      color: '#16A34A',
      colorBg: 'bg-green-50',
      borderColor: 'border-green-200',
      tasks: [
        { id: 't10', title: 'Tổ chức thi thử cho sinh viên năm 4 ngành CNTT', assignee: 'Nguyễn Hoàng Long', dept: 'Khoa CNTT', priority: 'high', dueDate: '2026-06-20', tags: ['EXAM'], progress: 100 },
        { id: 't11', title: 'Rà soát hồ sơ tuyển dụng giảng viên CNTT', assignee: 'Bùi Đình Nam', dept: 'Khoa Ngoại ngữ', priority: 'low', dueDate: '2026-06-15', tags: ['HRM'], progress: 100 },
        { id: 't12', title: 'Cập nhật chương trình đào tạo ngành CNTT', assignee: 'TS. Thảo Nguyễn', dept: 'Khoa CNTT', priority: 'medium', dueDate: '2026-06-10', tags: ['SIS'], progress: 100 },
      ],
    },
  ];
}

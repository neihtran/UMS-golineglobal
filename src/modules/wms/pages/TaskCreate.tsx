import { useState } from 'react';
import { Plus, Filter, Clock, CheckCircle2, Circle, ArrowRight, Calendar } from 'lucide-react';
import {
  Button, Input, Badge, Table, TableHead, TableBody, TableRow,
  TableHeadCell, TableCell, TablePagination, TableEmpty,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const TASKS = [
  { id: 't01', title: 'Hoàn thiện báo cáo tổng kết năm học 2025-2026', assignee: 'Phạm Thu Hà', dept: 'Phòng Tổ chức', module: 'HRM', priority: 'high', status: 'todo', dueDate: '2026-06-30', progress: 0, subtasks: 0 },
  { id: 't02', title: 'Triển khai LMS cho 20 lớp học mới HK2', assignee: 'Ngô Thanh Sơn', dept: 'Khoa CNTT', module: 'LMS', priority: 'high', status: 'in_progress', dueDate: '2026-07-01', progress: 65, subtasks: 3 },
  { id: 't03', title: 'Số hóa 500 hồ sơ sinh viên khóa 2019-2023', assignee: 'Trịnh Thu Phương', dept: 'Phòng Tổ chức', module: 'OCR', priority: 'medium', status: 'in_progress', dueDate: '2026-07-15', progress: 40, subtasks: 5 },
  { id: 't04', title: 'Cập nhật CTĐT ngành Kinh tế theo chuẩn mới', assignee: 'Trần Thị Mai Lan', dept: 'Khoa Kinh tế', module: 'SIS', priority: 'medium', status: 'todo', dueDate: '2026-08-01', progress: 0, subtasks: 0 },
  { id: 't05', title: 'Kiểm tra bảo mật hệ thống trước đợt thi cuối kỳ', assignee: 'Vũ Minh Tuấn', dept: 'Phòng CNTT', module: 'IAM', priority: 'urgent', status: 'todo', dueDate: '2026-06-28', progress: 0, subtasks: 0 },
  { id: 't06', title: 'Tổ chức thi thử cho sinh viên năm 4 ngành CNTT', assignee: 'Nguyễn Hoàng Long', dept: 'Khoa CNTT', module: 'EXAM', priority: 'high', status: 'done', dueDate: '2026-06-20', progress: 100, subtasks: 8 },
  { id: 't07', title: 'Rà soát hồ sơ tuyển dụng giảng viên CNTT', assignee: 'Bùi Đình Nam', dept: 'Khoa Ngoại ngữ', module: 'HRM', priority: 'low', status: 'done', dueDate: '2026-06-15', progress: 100, subtasks: 0 },
];

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'info' | 'neutral'; label: string; icon: React.ReactNode }> = {
  todo: { variant: 'warning', label: 'Cần làm', icon: <Circle className="h-3.5 w-3.5" /> },
  in_progress: { variant: 'info', label: 'Đang làm', icon: <Clock className="h-3.5 w-3.5" /> },
  done: { variant: 'success', label: 'Hoàn thành', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
};

const PRIORITY_CONFIG: Record<string, { variant: 'error' | 'warning' | 'neutral'; label: string }> = {
  urgent: { variant: 'error', label: 'Khẩn cấp' },
  high: { variant: 'warning', label: 'Cao' },
  medium: { variant: 'neutral', label: 'Trung bình' },
  low: { variant: 'neutral', label: 'Thấp' },
};

const MODULE_COLORS: Record<string, string> = {
  HRM: '#2563EB', LMS: '#059669', OCR: '#CA8A04', SIS: '#7C3AED',
  IAM: '#1E3A5F', EXAM: '#CA8A04', WMS: '#9333EA', FIN: '#DC2626',
};

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export default function TaskCreate() {
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('Tất cả');
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('all');

  const filtered = TASKS
    .filter((t) => {
      const match = !search || t.title.toLowerCase().includes(search.toLowerCase());
      const matchModule = module === 'Tất cả' || t.module === module;
      const matchPriority = priority === 'all' || t.priority === priority;
      const matchStatus = status === 'all' || t.status === status;
      return match && matchModule && matchPriority && matchStatus;
    })
    .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9));

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const counts = { todo: 0, in_progress: 0, done: 0 };
  TASKS.forEach((t) => { if (t.status in counts) counts[t.status as keyof typeof counts]++; });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Giao việc & Theo dõi"
        description="WMS-01 — Workflow có deadline và trách nhiệm rõ ràng"
        breadcrumbs={[{ label: 'WMS', href: '/wms' }, { label: 'Công việc' }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>Bộ lọc</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>Tạo công việc mới</Button>
          </>
        }
      />

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'todo', label: 'Cần làm', count: counts.todo, color: 'warning' },
          { key: 'in_progress', label: 'Đang làm', count: counts.in_progress, color: 'info' },
          { key: 'done', label: 'Hoàn thành', count: counts.done, color: 'success' },
        ].map((s) => (
          <div key={s.key} className={`rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${status === s.key ? 'border-[rgb(var(--primary))] ring-1 ring-[rgb(var(--primary)/0.2)]' : ''}`}
            onClick={() => setStatus(status === s.key ? 'all' : s.key)}>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {STATUS_CONFIG[s.key].icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder="Tìm công việc..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} wrapperClassName="w-80" />
        <select value={module} onChange={(e) => { setModule(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          {['Tất cả', 'HRM', 'LMS', 'OCR', 'SIS', 'IAM', 'EXAM', 'FIN'].map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2]">
          <option value="all">Tất cả mức độ</option>
          <option value="urgent">Khẩn cấp</option>
          <option value="high">Cao</option>
          <option value="medium">Trung bình</option>
          <option value="low">Thấp</option>
        </select>
        {status !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setStatus('all')}>Xóa lọc</Button>
        )}
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>STT</TableHeadCell>
            <TableHeadCell>Công việc</TableHeadCell>
            <TableHeadCell>Người nhận</TableHeadCell>
            <TableHeadCell>Module</TableHeadCell>
            <TableHeadCell>Mức độ</TableHeadCell>
            <TableHeadCell>Trạng thái</TableHeadCell>
            <TableHeadCell>Tiến độ</TableHeadCell>
            <TableHeadCell>Hạn</TableHeadCell>
            <TableHeadCell>Thao tác</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.length === 0 ? (
            <TableEmpty colSpan={9} message="Không tìm thấy công việc nào" />
          ) : (
            paged.map((t, i) => {
              const sc = STATUS_CONFIG[t.status];
              const pc = PRIORITY_CONFIG[t.priority];
              return (
                <TableRow key={t.id}>
                  <TableCell className="text-[rgb(var(--text-muted))] tabular-nums">
                    {(pagination.page - 1) * pagination.pageSize + i + 1}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-[rgb(var(--text-primary))]">{t.title}</p>
                    {t.subtasks > 0 && (
                      <p className="text-xs text-[rgb(var(--text-muted))]">{t.subtasks} công việc con</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-[rgb(var(--text-secondary))]">{t.assignee}</p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{t.dept}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm" style={{ borderLeftColor: MODULE_COLORS[t.module], borderLeftWidth: 3 }}>
                      {t.module}
                    </Badge>
                  </TableCell>
                  <TableCell><Badge variant={pc.variant} size="sm">{pc.label}</Badge></TableCell>
                  <TableCell><Badge variant={sc.variant} dot size="sm">{sc.label}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-[rgb(var(--border))]">
                        <div
                          className="h-full rounded-full bg-[rgb(var(--primary))] transition-all progress-fill"
                          style={{ width: `${t.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[rgb(var(--text-muted))]">{t.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-[rgb(var(--text-secondary))]">
                      <Calendar className="h-3.5 w-3.5" />
                      {t.dueDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" leftIcon={<ArrowRight className="h-3.5 w-3.5" />}>Xem</Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={pagination.page} pageSize={pagination.pageSize} total={filtered.length}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}

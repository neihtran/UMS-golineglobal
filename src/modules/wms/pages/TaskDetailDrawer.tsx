import { useState } from 'react';
import {
  Button,
  Badge,
} from '@/components/ui';
import {
  X,
  User,
  Calendar,
  Tag,
  Clock,
  Paperclip,
  MessageSquare,
  Send,
} from 'lucide-react';

const COMMENTS = [
  { id: 'c1', author: 'TS. Trần Thị Lan', avatar: 'TL', text: 'Tôi đã xem qua, cần bổ sung thêm phần tài liệu tham khảo ở mục 3.2.', time: '2 giờ trước', resolved: false },
  { id: 'c2', author: 'Bạn', avatar: 'ME', text: 'Đã cập nhật tài liệu. Em gửi lại để anh xem lại ạ.', time: '1 giờ trước', resolved: false },
];

const TASK = {
  id: 't1',
  title: 'Soạn thảo báo cáo công tác tuyển sinh 2026',
  assignee: 'Nguyễn Văn Long',
  dept: 'Phòng Tuyển sinh',
  priority: 'high',
  status: 'in_progress',
  dueDate: '2026-06-28',
  progress: 65,
  module: 'SIS',
  description: 'Tổng hợp dữ liệu tuyển sinh năm 2026, bao gồm số thí sinh đăng ký, điểm chuẩn, tỷ lệ nhập học theo từng ngành.',
  subtasks: [
    { id: 's1', title: 'Thu thập dữ liệu từ Phòng Tuyển sinh', done: true },
    { id: 's2', title: 'Phân tích theo khoa và ngành', done: true },
    { id: 's3', title: 'Viết báo cáo tổng kết', done: false },
    { id: 's4', title: 'Thiết kế biểu đồ minh họa', done: false },
    { id: 's5', title: 'Nộp báo cáo cho Ban Giám hiệu', done: false },
  ],
};

const PRIORITY_CONFIG = {
  high: { label: 'Cao', color: 'rgb(var(--error))' },
  medium: { label: 'Trung bình', color: 'rgb(var(--warning))' },
  low: { label: 'Thấp', color: 'rgb(var(--text-muted))' },
};

const STATUS_CONFIG = {
  'todo': { label: 'Việc mới', variant: 'neutral' as const },
  'in_progress': { label: 'Đang thực hiện', variant: 'warning' as const },
  'pending_approval': { label: 'Chờ duyệt', variant: 'info' as const },
  'done': { label: 'Hoàn thành', variant: 'success' as const },
};

interface TaskDetailProps {
  taskId?: string;
  onClose: () => void;
}

export default function TaskDetailDrawer({ taskId: _taskId, onClose }: TaskDetailProps) {
  const [newComment, setNewComment] = useState('');
  const pc = PRIORITY_CONFIG[TASK.priority as keyof typeof PRIORITY_CONFIG];
  const sc = STATUS_CONFIG[TASK.status as keyof typeof STATUS_CONFIG];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[rgb(var(--bg-card))] shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[rgb(var(--border)/0.6)] px-6 py-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="neutral">{TASK.module}</Badge>
            <Badge variant="warning" size="sm">{sc.label}</Badge>
            <div className="h-2 w-2 rounded-full" style={{ background: pc.color }} />
          </div>
          <h2 className="text-base font-bold text-[rgb(var(--text-primary))] leading-tight">{TASK.title}</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: <User className="h-3.5 w-3.5" />, label: 'Người phụ trách', value: TASK.assignee },
            { icon: <Calendar className="h-3.5 w-3.5" />, label: 'Hạn chót', value: TASK.dueDate },
            { icon: <Tag className="h-3.5 w-3.5" />, label: 'Mức ưu tiên', value: pc.label },
            { icon: <Clock className="h-3.5 w-3.5" />, label: 'Ngày tạo', value: '2026-06-20' },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-2.5">
              <span className="mt-0.5 text-[rgb(var(--text-muted))]">{icon}</span>
              <div>
                <p className="text-[10px] text-[rgb(var(--text-muted))] uppercase">{label}</p>
                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-2">Mô tả</h4>
          <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{TASK.description}</p>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">Tiến độ</h4>
            <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{TASK.progress}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[rgb(var(--border))] overflow-hidden">
            <div className="h-full rounded-full bg-[rgb(var(--warning))]" style={{ width: `${TASK.progress}%` }} />
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-3">Công việc con</h4>
          <div className="space-y-2">
            {TASK.subtasks.map((sub) => (
              <label key={sub.id} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" defaultChecked={sub.done}
                  className="h-4 w-4 shrink-0 rounded border-[rgb(var(--border))] text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary-light))/0.3]" />
                <span className={`text-sm transition-colors ${
                  sub.done ? 'line-through text-[rgb(var(--text-muted))]' : 'text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--primary))]'
                }`}>
                  {sub.title}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Attachments */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-3">Tài liệu đính kèm</h4>
          <div className="space-y-2">
            {[
              { name: 'Bao_cao_Tuyen_sinh_2026_draft.docx', size: '2.1 MB' },
              { name: 'Bieu_do_tuyen_sinh.png', size: '0.8 MB' },
            ].map((file) => (
              <div key={file.name} className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] p-3 hover:border-[rgb(var(--primary-light))] transition-colors cursor-pointer">
                <Paperclip className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[rgb(var(--text-primary))] truncate">{file.name}</p>
                  <p className="text-[10px] text-[rgb(var(--text-muted))]">{file.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-3 flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5" />
            Bình luận ({COMMENTS.length})
          </h4>
          <div className="space-y-3">
            {COMMENTS.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary)/0.1)] text-xs font-bold text-[rgb(var(--primary))]">
                  {comment.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{comment.author}</span>
                    <span className="text-[10px] text-[rgb(var(--text-muted))]">{comment.time}</span>
                  </div>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.3]"
            />
            <Button size="sm" leftIcon={<Send className="h-3.5 w-3.5" />}>Gửi</Button>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-[rgb(var(--border)/0.6)] px-6 py-4 flex justify-between gap-2">
        <Button variant="outline" size="sm">Hủy công việc</Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Lưu nháp</Button>
          <Button size="sm">Cập nhật</Button>
        </div>
      </div>
    </div>
  );
}

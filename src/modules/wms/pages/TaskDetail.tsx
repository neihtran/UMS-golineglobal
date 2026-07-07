import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  X,
  User,
  Calendar,
  Tag,
  Clock,
  Paperclip,
  MessageSquare,
  Send,
  Edit3,
  MoreVertical,
} from 'lucide-react';
import {
  Button,
  Badge,
  DropdownMenu,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  Avatar,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';

interface TaskDetailProps {
  id?: string;
}

type Subtask = { id: string; title: string; done: boolean };
type TaskComment = {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
};

const TASK = {
  id: 't1',
  title: 'Soạn thảo báo cáo công tác tuyển sinh 2026',
  assignee: 'Nguyễn Văn Long',
  dept: 'Phòng Tuyển sinh',
  priority: 'high',
  status: 'in_progress' as const,
  dueDate: '2026-06-28',
  progress: 65,
  module: 'SIS',
  createdBy: 'Trần Thị Lan',
  createdAt: '2026-06-20',
  description:
    'Tổng hợp dữ liệu tuyển sinh năm 2026, bao gồm số thí sinh đăng ký, điểm chuẩn, tỷ lệ nhập học theo từng ngành. Kết quả báo cáo sẽ được trình Ban Giám hiệu trước ngày 30/6.',
  tags: ['Tuyển sinh', 'Báo cáo', 'SIS'],
  subtasks: [
    { id: 's1', title: 'Thu thập dữ liệu từ Phòng Tuyển sinh', done: true },
    { id: 's2', title: 'Phân tích theo khoa và ngành', done: true },
    { id: 's3', title: 'Viết báo cáo tổng kết', done: false },
    { id: 's4', title: 'Thiết kế biểu đồ minh họa', done: false },
    { id: 's5', title: 'Nộp báo cáo cho Ban Giám hiệu', done: false },
  ],
  attachments: [
    { name: 'Bao_cao_Tuyen_sinh_2026_draft.docx', size: '2.1 MB' },
    { name: 'Bieu_do_tuyen_sinh.png', size: '0.8 MB' },
  ],
  comments: [
    {
      id: 'c1',
      author: 'TS. Trần Thị Lan',
      avatar: 'TL',
      text: 'Tôi đã xem qua, cần bổ sung thêm phần tài liệu tham khảo ở mục 3.2.',
      time: '2 giờ trước',
    },
    {
      id: 'c2',
      author: 'Bạn',
      avatar: 'ME',
      text: 'Đã cập nhật tài liệu. Em gửi lại để anh xem lại ạ.',
      time: '1 giờ trước',
    },
  ],
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; color: string; variant: 'error' | 'warning' | 'neutral' }
> = {
  high: { label: 'Cao', color: 'rgb(var(--error))', variant: 'error' },
  medium: { label: 'Trung bình', color: 'rgb(var(--warning))', variant: 'warning' },
  low: { label: 'Thấp', color: 'rgb(var(--text-muted))', variant: 'neutral' },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'info' | 'neutral' }
> = {
  todo: { label: 'Việc mới', variant: 'neutral' },
  in_progress: { label: 'Đang thực hiện', variant: 'warning' },
  pending_approval: { label: 'Chờ duyệt', variant: 'info' },
  done: { label: 'Hoàn thành', variant: 'success' },
};

const MODULE_COLORS: Record<string, string> = {
  HRM: '#2563EB',
  LMS: '#059669',
  OCR: '#CA8A04',
  SIS: '#7C3AED',
  IAM: '#1E3A5F',
  EXAM: '#CA8A04',
  WMS: '#9333EA',
  FIN: '#DC2626',
};

export default function TaskDetail({ id: propId }: TaskDetailProps = {}) {
  const params = useParams<{ id: string }>();
  const id = propId ?? params.id;
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<TaskComment[]>(TASK.comments);
  const [subtasks, setSubtasks] = useState<Subtask[]>(TASK.subtasks);

  const pc = PRIORITY_CONFIG[TASK.priority];
  const sc = STATUS_CONFIG[TASK.status];
  const completedSubtasks = subtasks.filter((s) => s.done).length;
  const subtaskProgress = subtasks.length
    ? Math.round((completedSubtasks / subtasks.length) * 100)
    : 0;

  const toggleSubtask = (subId: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)),
    );
  };

  const sendComment = () => {
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c${Date.now()}`,
        author: 'Bạn',
        avatar: 'ME',
        text: newComment.trim(),
        time: 'Vừa xong',
      },
    ]);
    setNewComment('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[rgb(var(--text-primary))]">{TASK.title}</h1>
          <p className="text-xs text-[rgb(var(--text-muted))]">#{id ?? TASK.id}</p>
        </div>
        <DropdownMenu
          trigger={
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
          items={[
            { id: 'edit', label: 'Chỉnh sửa', icon: <Edit3 className="h-3.5 w-3.5" />, onClick: () => navigate(`/wms/tao-cv?edit=${TASK.id}`) },
            { id: 'del', label: 'Xóa công việc', icon: <X className="h-3.5 w-3.5" />, danger: true, onClick: () => console.log('Xóa', TASK.id) },
          ]}
          closeOnItemClick
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata */}
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="neutral" style={{ borderLeftColor: MODULE_COLORS[TASK.module], borderLeftWidth: 3 }}>
                  {TASK.module}
                </Badge>
                <Badge variant={sc.variant} dot>{sc.label}</Badge>
                <div className="h-2 w-2 rounded-full" style={{ background: pc.color }} />
                <span className="text-xs text-[rgb(var(--text-muted))]">
                  #{id ?? TASK.id}
                </span>
              </div>
              <h1 className="text-lg font-bold text-[rgb(var(--text-primary))] leading-snug mb-4">
                {TASK.title}
              </h1>
              <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                {TASK.description}
              </p>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[rgb(var(--text-primary))]">Tiến độ</span>
                <span className="text-sm font-bold text-[rgb(var(--primary))]">
                  {subtaskProgress}%
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[rgb(var(--border))] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[rgb(var(--primary))] transition-all"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
              <p className="text-xs text-[rgb(var(--text-muted))]">
                {completedSubtasks}/{subtasks.length} công việc con hoàn thành
              </p>
            </CardContent>
          </Card>

          {/* Subtasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
                Công việc con
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeadCell className="w-10"></TableHeadCell>
                    <TableHeadCell>Công việc con</TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subtasks.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={sub.done}
                          onChange={() => toggleSubtask(sub.id)}
                          className="h-4 w-4 rounded border-[rgb(var(--border))] text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary-light))/0.3]"
                        />
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-sm ${
                            sub.done
                              ? 'line-through text-[rgb(var(--text-muted))]'
                              : 'text-[rgb(var(--text-primary))]'
                          }`}
                        >
                          {sub.title}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {subtasks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2}>
                        <p className="text-sm text-[rgb(var(--text-muted))] py-2">
                          Chưa có công việc con
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] flex items-center gap-2">
                <Paperclip className="h-3.5 w-3.5" />
                Tài liệu đính kèm ({TASK.attachments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {TASK.attachments.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] p-3 hover:border-[rgb(var(--primary-light))] transition-colors cursor-pointer"
                >
                  <Paperclip className="h-4 w-4 text-[rgb(var(--text-muted))] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[rgb(var(--text-primary))] truncate">{file.name}</p>
                    <p className="text-[10px] text-[rgb(var(--text-muted))]">{file.size}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5" />
                Bình luận ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar size="sm">{comment.avatar}</Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                        {comment.author}
                      </span>
                      <span className="text-[10px] text-[rgb(var(--text-muted))]">{comment.time}</span>
                    </div>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">{comment.text}</p>
                  </div>
                </div>
              ))}
              <div className="mt-3 flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), sendComment())}
                />
                <Button size="sm" leftIcon={<Send className="h-3.5 w-3.5" />} onClick={sendComment}>
                  Gửi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
                Trạng thái
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[rgb(var(--text-secondary))]">Trạng thái</span>
                <Badge variant={sc.variant} dot>{sc.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[rgb(var(--text-secondary))]">Mức ưu tiên</span>
                <Badge variant={pc.variant}>{pc.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[rgb(var(--text-secondary))]">Tiến độ</span>
                <span className="text-sm font-semibold text-[rgb(var(--primary))]">
                  {TASK.progress}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Assignee */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
                Người phụ trách
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar size="sm">
                  {TASK.assignee
                    .split(' ')
                    .slice(-2)
                    .map((n) => n[0])
                    .join('')}
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                    {TASK.assignee}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{TASK.dept}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
                Thời gian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: <User className="h-3.5 w-3.5" />, label: 'Người tạo', value: TASK.createdBy },
                { icon: <Clock className="h-3.5 w-3.5" />, label: 'Ngày tạo', value: TASK.createdAt },
                { icon: <Calendar className="h-3.5 w-3.5" />, label: 'Hạn chót', value: TASK.dueDate },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-[rgb(var(--text-muted))]">{icon}</span>
                  <div>
                    <p className="text-[10px] text-[rgb(var(--text-muted))] uppercase">{label}</p>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" />
                Thẻ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {TASK.tags.map((tag) => (
                  <Badge key={tag} variant="neutral" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const NOTIFICATIONS = [
  { id: 'n1', type: 'info', title: 'Đăng ký học phần mở', content: 'Hệ thống đăng ký học phần HK2/2025-2026 sẽ mở từ ngày 15/01/2026. Sinh viên chú ý đăng ký đúng thời gian.', time: '2026-06-26 07:00', read: false, module: 'SIS' },
  { id: 'n2', type: 'warning', title: 'Hạn nộp học phí', content: 'Bạn còn nợ 10,000,000đ học phí HK2/2025-2026. Hạn chót: 30/06/2026. Vui lòng thanh toán kịp thời.', time: '2026-06-25 09:00', read: false, module: 'FIN' },
  { id: 'n3', type: 'success', title: 'Bài tập đã được chấm', content: 'Giảng viên TS. Nguyễn Văn A đã chấm bài tập tuần 5 – Cấu trúc dữ liệu. Điểm: 9.0/10.', time: '2026-06-24 16:30', read: true, module: 'LMS' },
  { id: 'n4', type: 'info', title: 'Lịch thi giữa kỳ', content: 'Lịch thi giữa kỳ HK2/2025-2026 đã được công bố. Xem chi tiết tại mục Thi trực tuyến.', time: '2026-06-23 10:00', read: true, module: 'EXAM' },
  { id: 'n5', type: 'error', title: 'Thiếu bằng chứng kiểm định', content: 'Tiêu chuẩn AUN số 3 còn thiếu 5 minh chứng. Vui lòng bổ sung trước ngày 15/07/2026.', time: '2026-06-22 14:00', read: true, module: 'QA' },
  { id: 'n6', type: 'info', title: 'Thư viện mở cửa', content: 'Thư viện trường mở cửa từ 07:00 đến 21:00 các ngày trong tuần. Sách giáo trình mới đã được cập nhật.', time: '2026-06-21 08:00', read: true, module: 'LIB' },
  { id: 'n7', type: 'success', title: 'Đơn nghỉ phép được duyệt', content: 'Đơn xin nghỉ phép 5 ngày của bạn đã được PGS.TS. Nguyễn Văn A duyệt.', time: '2026-06-20 11:00', read: true, module: 'HRM' },
];

const TYPE_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  info: { bg: 'bg-[rgb(var(--info)/0.1)]', text: 'text-[rgb(var(--info))]', dot: 'bg-[rgb(var(--info))]' },
  success: { bg: 'bg-[rgb(var(--success)/0.1)]', text: 'text-[rgb(var(--success))]', dot: 'bg-[rgb(var(--success))]' },
  warning: { bg: 'bg-[rgb(var(--warning)/0.1)]', text: 'text-[rgb(var(--warning))]', dot: 'bg-[rgb(var(--warning))]' },
  error: { bg: 'bg-[rgb(var(--error)/0.1)]', text: 'text-[rgb(var(--error))]', dot: 'bg-[rgb(var(--error))]' },
};

export default function NotificationCenter() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const items = filter === 'unread' ? NOTIFICATIONS.filter((n) => !n.read) : NOTIFICATIONS;
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thông báo"
        description="Tất cả thông báo từ các phân hệ trong hệ thống"
        breadcrumbs={[
          { label: 'Thông báo' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'unread' ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<Bell className="h-4 w-4" />}
              onClick={() => setFilter(filter === 'unread' ? 'all' : 'unread')}
            >
              Chưa đọc ({unreadCount})
            </Button>
            <Button variant="outline" size="sm" leftIcon={<CheckCheck className="h-4 w-4" />}>
              Đánh dấu đã đọc
            </Button>
          </div>
        }
      />

      <div className="space-y-3">
        {items.map((n) => {
          const tc = TYPE_CONFIG[n.type];
          return (
            <Card
              key={n.id}
              className={`transition-all ${n.read ? 'opacity-70' : 'border-l-4 border-l-[rgb(var(--primary))]'}`}
            >
              <div className="flex items-start gap-4 p-5">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tc.bg}`}>
                  <Bell className={`h-5 w-5 ${tc.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-[rgb(var(--text-primary))]">{n.title}</p>
                    {!n.read && <div className="h-2 w-2 rounded-full bg-[rgb(var(--primary))]" />}
                  </div>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">{n.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="neutral" size="sm">{n.module}</Badge>
                    <span className="text-xs text-[rgb(var(--text-muted))]">{n.time}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

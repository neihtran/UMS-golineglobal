import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell, BellRing, CheckCheck, Trash2,
  Calendar, AlertTriangle, Info, CheckCircle2, Megaphone,
} from 'lucide-react';
import {
  Button, Input, Badge,
  TablePagination,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { usePagination } from '@/hooks';

const NOTIFICATIONS = [
  { id: 'n01', title: 'Thông báo nghỉ lễ Quốc khánh 2/9', content: 'Trường nghỉ lễ Quốc khánh từ ngày 01/09 đến 03/09/2026. Sinh viên không có lớp học trong thời gian này.', type: 'info', priority: 'normal', from: 'Phòng Tổ chức', createdAt: '2026-06-26 08:00', isRead: false, target: 'all' },
  { id: 'n02', title: 'Kết quả xét tốt nghiệp đợt 1/2026', content: 'Danh sách sinh viên đủ điều kiện tốt nghiệp đợt 1 năm 2026 đã được công bố. Sinh viên có thể tra cứu kết quả trên portal.', type: 'success', priority: 'normal', from: 'Phòng Đào tạo', createdAt: '2026-06-25 14:30', isRead: false, target: 'sinh-vien' },
  { id: 'n03', title: 'Cảnh báo: Hạn đóng học phí HK2 còn 5 ngày', content: 'Hạn đóng học phí HK2/2025-2026 là ngày 30/06/2026. Sinh viên chưa đóng học phí vui lòng nộp đúng hạn để tránh ảnh hưởng đến việc học tập.', type: 'warning', priority: 'high', from: 'Phòng Tài chính', createdAt: '2026-06-25 10:00', isRead: true, target: 'sinh-vien' },
  { id: 'n04', title: 'Lịch thi giữa kỳ HK2/2025-2026', content: 'Lịch thi giữa kỳ HK2 đã được công bố. Sinh viên tra cứu lịch thi trên portal và chuẩn bị đầy đủ giấy tờ.', type: 'info', priority: 'normal', from: 'Phòng Khảo thí', createdAt: '2026-06-24 09:00', isRead: true, target: 'sinh-vien' },
  { id: 'n05', title: 'Thông báo thay đổi địa điểm lớp học', content: 'Một số lớp học chuyển địa điểm từ Tòa A sang Tòa B từ ngày 01/07. Sinh viên theo dõi thông báo trên portal.', type: 'info', priority: 'low', from: 'Phòng Đào tạo', createdAt: '2026-06-23 16:00', isRead: true, target: 'sinh-vien' },
  { id: 'n06', title: 'Kết quả phản hồi khiếu nại đợt 2/2026', content: 'Đã có kết quả xử lý khiếu nại của một số sinh viên về điểm thi. Sinh viên liên hệ Phòng Khảo thí để được giải đáp.', type: 'success', priority: 'normal', from: 'Phòng Công tác sinh viên', createdAt: '2026-06-22 11:00', isRead: true, target: 'sinh-vien' },
  { id: 'n07', title: 'Workshop: Kỹ năng phỏng vấn xin việc', content: 'Trường tổ chức workshop về kỹ năng phỏng vấn xin việc cho sinh viên năm cuối. Đăng ký tham gia qua portal trước ngày 30/06.', type: 'info', priority: 'normal', from: 'Trung tâm Hỗ trợ sinh viên', createdAt: '2026-06-21 08:30', isRead: false, target: 'sinh-vien' },
  { id: 'n08', title: 'Cảnh báo: Email lừa đảo giả danh nhà trường', content: 'Một số email giả danh nhà trường đang được gửi đến sinh viên. Nhà trường không yêu cầu cung cấp mật khẩu qua email. Cảnh báo sinh viên cẩn thận.', type: 'warning', priority: 'high', from: 'Phòng CNTT', createdAt: '2026-06-20 15:00', isRead: true, target: 'all' },
];

export default function NotificationList() {
  const { t } = useTranslation('portal');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [showUnread, setShowUnread] = useState(false);

  const TYPE_CONFIG: Record<string, { variant: 'info' | 'success' | 'warning' | 'error' | 'neutral' | 'accent'; label: string; icon: React.ReactNode }> = {
    info: { variant: 'info', label: t('notification.type.info'), icon: <Info className="h-4 w-4" /> },
    success: { variant: 'success', label: t('notification.type.success'), icon: <CheckCircle2 className="h-4 w-4" /> },
    warning: { variant: 'warning', label: t('notification.type.warning'), icon: <AlertTriangle className="h-4 w-4" /> },
    event: { variant: 'accent', label: t('notification.type.event'), icon: <Megaphone className="h-4 w-4" /> },
  };

  const filtered = NOTIFICATIONS.filter((n) => {
    const match = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchType = type === 'all' || n.type === type;
    const matchRead = !showUnread || !n.isRead;
    return match && matchType && matchRead;
  });

  const paged = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);
  const unreadCount = NOTIFICATIONS.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('notification.title')}
        description={t('notification.description')}
        breadcrumbs={[{ label: 'PORTAL', href: '/portal' }, { label: t('notification.breadcrumb') }]}
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<CheckCheck className="h-4 w-4" />}>{t('notification.markAllRead')}</Button>
            <Button variant="outline" size="sm" leftIcon={<Trash2 className="h-4 w-4" />}>{t('notification.deleteOld')}</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          { label: t('notification.statTotal'), value: NOTIFICATIONS.length, icon: <Bell className="h-5 w-5" />, color: 'primary' },
          { label: t('notification.statUnread'), value: unreadCount, icon: <BellRing className="h-5 w-5" />, color: 'warning' },
          { label: t('notification.statRead'), value: NOTIFICATIONS.length - unreadCount, icon: <CheckCheck className="h-5 w-5" />, color: 'success' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--${s.color})/0.1)] text-[rgb(var(--${s.color}))]`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--text-muted))]">{s.label}</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder={t('notification.searchPlaceholder')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} wrapperClassName="w-80" />
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light)/0.2)]">
          <option value="all">{t('filter.allTypes')}</option>
          <option value="info">{t('notification.type.info')}</option>
          <option value="success">{t('notification.type.success')}</option>
          <option value="warning">{t('notification.type.warning')}</option>
        </select>
        <Button
          variant={showUnread ? 'primary' : 'outline'}
          size="sm"
          leftIcon={<BellRing className="h-4 w-4" />}
          onClick={() => { setShowUnread(!showUnread); setPage(1); }}
        >
          {showUnread ? t('filter.onlyUnread') : t('filter.all')}
        </Button>
      </div>

      <div className="space-y-2">
        {paged.length === 0 ? (
          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-12 text-center">
            <Bell className="h-12 w-12 text-[rgb(var(--border))] mx-auto mb-3" />
            <p className="text-sm text-[rgb(var(--text-muted))]">{t('notification.noNotifications')}</p>
          </div>
        ) : (
          paged.map((n) => {
            const tc = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
            return (
              <div
                key={n.id}
                className={`group rounded-xl border p-4 transition-all hover:shadow-md ${
                  n.isRead
                    ? 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]'
                    : 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.02)] shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                    n.isRead ? 'bg-[rgb(var(--border)/0.5)] text-[rgb(var(--text-muted))]' : 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]'
                  }`}>
                    {tc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!n.isRead && (
                        <div className="h-2 w-2 rounded-full bg-[rgb(var(--primary))] shrink-0" />
                      )}
                      <h4 className={`text-sm font-semibold truncate ${n.isRead ? 'text-[rgb(var(--text-secondary))]' : 'text-[rgb(var(--text-primary))]'}`}>
                        {n.title}
                      </h4>
                      {n.priority === 'high' && (
                        <Badge variant="error" size="sm">{t('notification.important')}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[rgb(var(--text-muted))] leading-relaxed line-clamp-2">{n.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[rgb(var(--text-muted))]">
                      <span className="flex items-center gap-1">
                        <Bell className="h-3 w-3" />
                        {n.from}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {n.createdAt}
                      </span>
                      <Badge variant={tc.variant} size="sm">{tc.label}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.isRead && (
                      <Button variant="ghost" size="sm" leftIcon={<CheckCheck className="h-3.5 w-3.5" />}>{t('notification.markRead')}</Button>
                    )}
                    <Button variant="ghost" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />} className="text-red-400">{t('notification.delete')}</Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <TablePagination
        page={pagination.page} pageSize={pagination.pageSize} total={filtered.length}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}

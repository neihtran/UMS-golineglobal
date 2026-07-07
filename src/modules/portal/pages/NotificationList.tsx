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
import { useNotificationList } from '@/hooks/usePortal';

export default function NotificationList() {
  const { t } = useTranslation('portal');
  const { pagination, setPage, setPageSize } = usePagination({ initialPage: 1, initialPageSize: 10 });
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [showUnread, setShowUnread] = useState(false);

  const { data, isLoading } = useNotificationList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    ...(type !== 'all' ? { type } : {}),
    ...(showUnread ? { isRead: false } : {}),
  });

  const notifications = (data?.data ?? []) as any[];
  const meta = data?.pagination;

  const filtered = notifications;

  const TYPE_CONFIG: Record<string, { variant: 'info' | 'success' | 'warning' | 'error' | 'neutral' | 'accent'; label: string; icon: React.ReactNode }> = {
    info: { variant: 'info', label: t('notification.type.info'), icon: <Info className="h-4 w-4" /> },
    success: { variant: 'success', label: t('notification.type.success'), icon: <CheckCircle2 className="h-4 w-4" /> },
    warning: { variant: 'warning', label: t('notification.type.warning'), icon: <AlertTriangle className="h-4 w-4" /> },
    event: { variant: 'accent', label: t('notification.type.event'), icon: <Megaphone className="h-4 w-4" /> },
  };

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  const totalCount = meta?.total ?? notifications.length;

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
          { label: t('notification.statTotal'), value: totalCount, icon: <Bell className="h-5 w-5" />, color: 'primary' },
          { label: t('notification.statUnread'), value: unreadCount, icon: <BellRing className="h-5 w-5" />, color: 'warning' },
          { label: t('notification.statRead'), value: totalCount - unreadCount, icon: <CheckCheck className="h-5 w-5" />, color: 'success' },
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
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-[rgb(var(--bg-hover))] animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 rounded bg-[rgb(var(--bg-hover))] animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-[rgb(var(--bg-hover))] animate-pulse" />
                  <div className="h-3 w-1/3 rounded bg-[rgb(var(--bg-hover))] animate-pulse" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-12 text-center">
            <Bell className="h-12 w-12 text-[rgb(var(--border))] mx-auto mb-3" />
            <p className="text-sm text-[rgb(var(--text-muted))]">{t('notification.noNotifications')}</p>
          </div>
        ) : (
          filtered.map((n) => {
            const tc = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
            return (
              <div
                key={n._id}
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
                    <p className="text-xs text-[rgb(var(--text-muted))] leading-relaxed line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[rgb(var(--text-muted))]">
                      <span className="flex items-center gap-1">
                        <Bell className="h-3 w-3" />
                        {n.userName ?? '-'}
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
        page={pagination.page} pageSize={pagination.pageSize} total={meta?.total ?? filtered.length}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}

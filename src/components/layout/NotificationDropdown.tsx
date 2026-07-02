import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, X, AlertCircle, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui';
import { useNotificationStore, useUnreadCount, type Notification, type NotificationType } from '@/stores/notificationStore';
import { useTranslation } from 'react-i18next';

const ICONS: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-[rgb(var(--success))]" />,
  error: <AlertCircle className="h-4 w-4 text-[rgb(var(--error))]" />,
  warning: <AlertTriangle className="h-4 w-4 text-[rgb(var(--warning))]" />,
  info: <Info className="h-4 w-4 text-[rgb(var(--info))]" />,
};

function NotificationItem({ notif, onClose }: { notif: Notification; onClose: () => void }) {
  const { t } = useTranslation('common');
  return (
    <div
      className={`group flex items-start gap-3 px-4 py-3 border-b border-[rgb(var(--border)/0.4)] last:border-0 transition-colors hover:bg-[rgb(var(--bg-hover))] ${
        !notif.read ? 'bg-[rgb(var(--primary)/0.03)]' : ''
      }`}
    >
      <div className="mt-0.5 shrink-0">{ICONS[notif.type]}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!notif.read ? 'font-semibold text-[rgb(var(--text-primary))]' : 'text-[rgb(var(--text-secondary))]'}`}>
          {notif.title}
        </p>
        {notif.message && (
          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5 line-clamp-2">{notif.message}</p>
        )}
        {notif.actionUrl && (
          <Link
            to={notif.actionUrl}
            onClick={onClose}
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[rgb(var(--primary))] hover:underline"
          >
          {notif.actionLabel ?? t('header.notification.viewDetail')}
          </Link>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {!notif.read && <div className="h-2 w-2 rounded-full bg-[rgb(var(--primary))]" />}
        <button
          onClick={onClose}
          className="opacity-0 group-hover:opacity-100 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-all"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { t } = useTranslation('common');
  const { notifications, markAllAsRead } = useNotificationStore();

  return (
    <div className="w-96 max-h-[480px] flex flex-col rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--border)/0.6)]">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[rgb(var(--text-primary))]" />
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('header.notification.title')}</h3>
          <Badge variant="error" size="sm">{useUnreadCount()}</Badge>
        </div>
        <button
          onClick={markAllAsRead}
          className="flex items-center gap-1.5 text-xs text-[rgb(var(--primary))] hover:underline"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          {t('header.notification.markAllRead')}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Bell className="h-8 w-8 text-[rgb(var(--text-muted))] mb-3" />
            <p className="text-sm text-[rgb(var(--text-secondary))]">{t('header.notification.noNotifications')}</p>
          </div>
        ) : (
          notifications.slice(0, 8).map((notif: Notification) => (
            <NotificationItem
              key={notif.id}
              notif={notif}
              onClose={onClose}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[rgb(var(--border)/0.6)] px-4 py-2.5 text-center">
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-xs font-semibold text-[rgb(var(--primary))] hover:underline"
        >
          {t('header.notification.viewAll')}
        </Link>
      </div>
    </div>
  );
}

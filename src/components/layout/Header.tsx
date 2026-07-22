import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Moon,
  Sun,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { ROLE_LABELS } from '@/constants/modules';
import type { Role } from '@/constants/modules';
import { GlobalSearch, useKeyboardShortcut } from './GlobalSearch';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLogout } from '@/hooks/useAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationItem = {
  id: string;
  titleKey: string;
  module: string;
  timeKey: string;
  unread: boolean;
  icon: string;
};

// ─── Demo data (i18n keys) ──────────────────────────────────────────────────

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', titleKey: 'header.notification.contractExpiring', module: 'HRM', timeKey: 'header.notification.minutesAgo', unread: true, icon: '📋' },
  { id: 'n2', titleKey: 'header.notification.ktxApproval', module: 'KTX', timeKey: 'header.notification.minutesAgo', unread: true, icon: '🏠' },
  { id: 'n3', titleKey: 'header.notification.examStarting', module: 'EXAM', timeKey: 'header.notification.hourAgo', unread: false, icon: '📝' },
  { id: 'n4', titleKey: 'header.notification.hemisSynced', module: 'INT', timeKey: 'header.notification.hoursAgo', unread: false, icon: '✅' },
  { id: 'n5', titleKey: 'header.notification.tuitionPending', module: 'FIN', timeKey: 'header.notification.hoursAgo', unread: false, icon: '💰' },
];

// ─── Notification Dropdown ────────────────────────────────────────────────────

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('common');
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const unreadCount = DEMO_NOTIFICATIONS.filter((n) => n.unread).length;
  const items = tab === 'unread'
    ? DEMO_NOTIFICATIONS.filter((n) => n.unread)
    : DEMO_NOTIFICATIONS;

  return (
    <div
      className="w-96 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] shadow-[var(--shadow-xl)]"
      role="dialog"
      aria-label={t('notification.title')}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgb(var(--border)/0.6)] px-4 py-3">
        <h3 className="font-semibold text-[rgb(var(--text-primary))]">{t('notification.title')}</h3>
        <button className="text-xs font-medium text-[rgb(var(--primary))] hover:underline">
          {t('notification.markAllRead')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgb(var(--border)/0.6)]">
        {(['all', 'unread'] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={clsx(
              'flex-1 py-2.5 text-sm font-medium transition-colors',
              tab === tabKey
                ? 'border-b-2 border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]',
            )}
          >
            {tabKey === 'all' ? t('notification.all') : `${t('notification.unread')} (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="max-h-80 overflow-y-auto">
        {items.length === 0 ? (
          <div className="py-10 text-center text-sm text-[rgb(var(--text-muted))]">
            {t('notification.noNotifications')}
          </div>
        ) : (
          items.map((n) => (
            <button
              key={n.id}
              onClick={onClose}
              className={clsx(
                'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                'hover:bg-[rgb(var(--bg-hover))]',
                n.unread && 'bg-[rgb(var(--primary)/0.03)]',
              )}
            >
              <span className="mt-0.5 text-lg leading-none">{n.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={clsx(
                  'text-sm',
                  n.unread ? 'font-semibold text-[rgb(var(--text-primary))]' : 'text-[rgb(var(--text-secondary))]',
                )}>
                  {t(n.titleKey)}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[rgb(var(--text-muted))]">
                  <span className="font-medium">{n.module}</span>
                  <span>·</span>
                  <span>{t(n.timeKey)}</span>
                </p>
              </div>
              {n.unread && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[rgb(var(--primary))]" aria-label={t('notification.new')} />
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[rgb(var(--border)/0.6)] px-4 py-2.5">
        <Link
          to="/notifications"
          onClick={onClose}
          className="block text-center text-sm font-medium text-[rgb(var(--primary))] hover:underline"
        >
          {t('notification.viewAll')}
        </Link>
      </div>
    </div>
  );
}

// ─── User Dropdown ────────────────────────────────────────────────────────────

function UserDropdown({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('common');
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();

  const roleLabel = user?.role ? ROLE_LABELS[user.role as Role] : '';

  const handleLogout = () => {
    logoutMutation.mutate();
    onClose();
  };

  return (
    <div
      className="w-64 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] shadow-[var(--shadow-xl)] py-1"
      role="menu"
    >
      {/* User info */}
      <div className="px-4 py-3 border-b border-[rgb(var(--border)/0.6)]">
        <p className="truncate font-semibold text-[rgb(var(--text-primary))]">{user?.displayName || user?.name || user?.username}</p>
        <p className="truncate text-xs text-[rgb(var(--text-muted))]">{user?.email}</p>
        <span className="mt-1.5 inline-flex rounded-full bg-[rgb(var(--primary)/0.1)] px-2 py-0.5 text-[10px] font-bold text-[rgb(var(--primary))] capitalize">
          {roleLabel}
        </span>
      </div>

      {/* Links */}
      <div className="py-1">
        {[
          { icon: <User className="h-4 w-4" />, labelKey: 'user.profile', href: '/profile' },
          { icon: <Settings className="h-4 w-4" />, labelKey: 'user.settings', href: '/settings' },
        ].map(({ icon, labelKey, href }) => (
          <Link
            key={href}
            to={href}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2 text-sm text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))] transition-colors"
            role="menuitem"
          >
            {icon}
            {t(labelKey)}
          </Link>
        ))}
      </div>

      {/* Logout */}
      <div className="border-t border-[rgb(var(--border)/0.6)] py-1">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[rgb(var(--error))] hover:bg-red-50 transition-colors"
          role="menuitem"
        >
          <LogOut className="h-4 w-4" />
          {t('nav:module.logout')}
        </button>
      </div>
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { t } = useTranslation('common');
  const user = useAuthStore((state) => state.user);
  const { mode, setMode } = useThemeStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useKeyboardShortcut('k', () => setSearchOpen((o) => !o));
  const isDark = mode === 'dark';

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
      setNotifOpen(false);
    }
    if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
      setUserMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [handleOutsideClick]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, []);

  return (
    <>
      <header
        className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-6"
        role="banner"
      >
        {/* ── Left: hamburger + logo + search ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-1.5 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))] transition-colors"
            aria-label={t('header.openNav')}
          >
            <Menu className="h-5 w-5" />
          </button>

          <img
            src="/logo-pedagogy.png"
            alt={t('nav.brandFull')}
            className="h-9 w-auto hidden sm:block"
          />

          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-base))] px-3 py-1.5 text-sm text-[rgb(var(--text-muted))] hover:border-[rgb(var(--primary-light))] hover:text-[rgb(var(--text-secondary))] transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="text-[13px]">{t('searchPlaceholder')}</span>
            <kbd className="ml-2 hidden lg:inline-flex rounded border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-1.5 py-0.5 text-[10px]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* ── Right: actions ── */}
        <div className="flex items-center gap-1" role="toolbar" aria-label={t('header.quickActions')}>
          <button
            onClick={() => setMode(isDark ? 'light' : 'dark')}
            className="rounded-lg p-2 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))] transition-colors"
            aria-label={isDark ? t('theme.light') : t('theme.dark')}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <LanguageSwitcher />

          {/* Notifications
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen((o) => !o); setUserMenuOpen(false); }}
              className="relative rounded-lg p-2 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))] transition-colors"
              aria-label={t('notification.title')}
              aria-expanded={notifOpen ? 'true' : 'false'}
              aria-haspopup="true"
            >
              <Bell className="h-4 w-4" />
              <span
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[rgb(var(--error))]"
                aria-label={t('notification.new')}
              />
            </button>

            {notifOpen && (
              <div
                className="absolute right-0 top-full mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                role="menu"
              >
                <NotificationDropdown onClose={() => setNotifOpen(false)} />
              </div>
            )}
          </div> */}

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setUserMenuOpen((o) => !o); setNotifOpen(false); }}
              className="flex items-center gap-2 rounded-lg p-1.5 pl-2 hover:bg-[rgb(var(--bg-hover))] transition-colors"
              aria-label={t('user.account')}
              aria-expanded={userMenuOpen ? 'true' : 'false'}
              aria-haspopup="true"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-sm font-bold text-white"
                aria-hidden="true"
              >
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>

              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))] leading-tight">{user?.name}</p>
                <p className="text-[10px] text-[rgb(var(--text-muted))] leading-tight">
                  {user?.role ? ROLE_LABELS[user.role as Role] : ''}
                </p>
              </div>

              <ChevronDown
                className={clsx(
                  'hidden md:block h-3.5 w-3.5 text-[rgb(var(--text-muted))] transition-transform duration-200',
                  userMenuOpen && 'rotate-180',
                )}
              />
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                role="menu"
              >
                <UserDropdown onClose={() => setUserMenuOpen(false)} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global search overlay */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

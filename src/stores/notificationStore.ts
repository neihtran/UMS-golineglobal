import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

let idCounter = 0;
function genId() {
  return `notif-${Date.now()}-${++idCounter}`;
}

export const useNotificationStore = create<NotificationState>()((set, _get) => ({
  notifications: [
    { id: 'n1', type: 'warning', title: '234 sinh viên chưa đóng học phí kỳ 2', message: 'Tổng nợ ~2.8 tỷ đồng cần được nhắc nhở', read: false, createdAt: new Date().toISOString(), actionUrl: '/fin/hoc-phi', actionLabel: 'Xem danh sách' },
    { id: 'n2', type: 'info', title: 'Hệ thống LMS bảo trì ngày 22/06', message: '02:00 - 06:00. Mọi hoạt động học tập tạm ngưng.', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'n3', type: 'success', title: 'Đợt học bổng khuyến khích đã giải ngân', message: '450 sinh viên nhận được học bổng tổng kinh phí 1.8 tỷ đồng.', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'n4', type: 'error', title: 'Cảnh báo gian lận thi', message: 'Phát hiện 1 thao tác bất thường trong kỳ thi ENG301.', read: true, createdAt: new Date(Date.now() - 172800000).toISOString(), actionUrl: '/exam', actionLabel: 'Xem chi tiết' },
  ],

  unreadCount: 0,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: genId(),
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    })),

  markAsRead: (id: string) =>
    set((state) => ({
      notifications: state.notifications.map((n: Notification) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n: Notification) => ({ ...n, read: true })),
    })),

  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n: Notification) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));

export function useUnreadCount() {
  return useNotificationStore((state: NotificationState) => state.notifications.filter((n: Notification) => !n.read).length);
}

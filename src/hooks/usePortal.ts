/**
 * usePortal — TanStack Query hooks for PORTAL module.
 * Provides hooks for announcements and notifications.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  announcementService,
  notificationService,
} from '@/services/portal.service';
import type {
  AnnouncementFilters,
  Announcement,
  NotificationFilters,
  Notification,
} from '@/services/portal.service';
import { useNotificationStore } from '@/stores/notificationStore';

// ─── Announcements ───────────────────────────────────────────────────────────────

export const useAnnouncementList = (filters: AnnouncementFilters) =>
  useQuery({
    queryKey: ['portal', 'announcements', 'list', filters],
    queryFn: () => announcementService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useAnnouncementDetail = (id: string) =>
  useQuery({
    queryKey: ['portal', 'announcements', id],
    queryFn: () => announcementService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateAnnouncement = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: announcementService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'announcements'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo thông báo mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo thông báo thất bại',
      });
    },
  });
};

export const useUpdateAnnouncement = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Announcement> }) =>
      announcementService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['portal', 'announcements'] });
      qc.setQueryData(['portal', 'announcements', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật thông báo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Cập nhật thất bại',
      });
    },
  });
};

export const useDeleteAnnouncement = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: announcementService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'announcements'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa thông báo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Xóa thất bại',
      });
    },
  });
};

export const usePublishAnnouncement = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: announcementService.publish,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['portal', 'announcements'] });
      qc.setQueryData(['portal', 'announcements', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã đăng thông báo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Đăng thông báo thất bại',
      });
    },
  });
};

export const useUnpublishAnnouncement = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: announcementService.unpublish,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['portal', 'announcements'] });
      qc.setQueryData(['portal', 'announcements', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã gỡ thông báo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Gỡ thông báo thất bại',
      });
    },
  });
};

export const usePinAnnouncement = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: announcementService.pin,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['portal', 'announcements'] });
      qc.setQueryData(['portal', 'announcements', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã ghim thông báo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Ghim thất bại',
      });
    },
  });
};

export const useUnpinAnnouncement = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: announcementService.unpin,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['portal', 'announcements'] });
      qc.setQueryData(['portal', 'announcements', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã bỏ ghim thông báo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Bỏ ghim thất bại',
      });
    },
  });
};

export const useReactToAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reaction }: { id: string; reaction: string }) =>
      announcementService.react(id, reaction),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'announcements'] });
    },
    onError: (error: any) => {
      console.error('React error:', error?.response?.data?.error?.message);
    },
  });
};

export const useIncrementAnnouncementView = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: announcementService.incrementView,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'announcements'] });
    },
  });
};

// ─── Notifications ──────────────────────────────────────────────────────────────

export const useNotificationList = (filters: NotificationFilters) =>
  useQuery({
    queryKey: ['portal', 'notifications', 'list', filters],
    queryFn: () => notificationService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useNotificationDetail = (id: string) =>
  useQuery({
    queryKey: ['portal', 'notifications', id],
    queryFn: () => notificationService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: ['portal', 'notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount().then((r) => r.data),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });

export const useSendNotification = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: notificationService.send,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'notifications'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã gửi thông báo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Gửi thông báo thất bại',
      });
    },
  });
};

export const useSendBulkNotification = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ userIds, data }: { userIds: string[]; data: Partial<Notification> }) =>
      notificationService.sendBulk(userIds, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'notifications'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã gửi thông báo hàng loạt' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Gửi thông báo thất bại',
      });
    },
  });
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: (_result, _id) => {
      qc.invalidateQueries({ queryKey: ['portal', 'notifications'] });
    },
    onError: (error: any) => {
      console.error('Mark read error:', error?.response?.data?.error?.message);
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'notifications'] });
    },
    onError: (error: any) => {
      console.error('Mark all read error:', error?.response?.data?.error?.message);
    },
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'notifications'] });
    },
    onError: (error: any) => {
      console.error('Delete notification error:', error?.response?.data?.error?.message);
    },
  });
};

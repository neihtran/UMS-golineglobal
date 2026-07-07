/**
 * PORTAL service — API client cho module PORTAL.
 * Backend routes: /api/portal/*
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── Announcements ───────────────────────────────────────────────────────────────
export interface AnnouncementFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  priority?: string;
  targetAudience?: string;
  isPinned?: boolean;
  isActive?: boolean;
  publishedFrom?: string;
  publishedTo?: string;
  createdBy?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  category: 'academic' | 'administrative' | 'event' | 'scholarship' | 'recruitment' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  targetAudience: 'all' | 'student' | 'staff' | 'faculty' | 'admin';
  isPinned: boolean;
  isActive: boolean;
  publishedAt?: string;
  expiresAt?: string;
  authorId: string;
  authorName?: string;
  attachments: { name: string; url: string; size: number }[];
  viewCount: number;
  reactionCount: number;
  commentCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const announcementService = {
  list: (filters: AnnouncementFilters = {}) =>
    apiClient.get<PaginatedResponse<Announcement>>('/portal/announcements', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Announcement>>(`/portal/announcements/${id}`),

  create: (data: Partial<Announcement>) =>
    apiClient.post<ApiResponse<Announcement>>('/portal/announcements', data),

  update: (id: string, data: Partial<Announcement>) =>
    apiClient.patch<ApiResponse<Announcement>>(`/portal/announcements/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/portal/announcements/${id}`),

  publish: (id: string) =>
    apiClient.post<ApiResponse<Announcement>>(`/portal/announcements/${id}/publish`),

  unpublish: (id: string) =>
    apiClient.post<ApiResponse<Announcement>>(`/portal/announcements/${id}/unpublish`),

  pin: (id: string) =>
    apiClient.post<ApiResponse<Announcement>>(`/portal/announcements/${id}/pin`),

  unpin: (id: string) =>
    apiClient.post<ApiResponse<Announcement>>(`/portal/announcements/${id}/unpin`),

  react: (id: string, reaction: string) =>
    apiClient.post<ApiResponse<any>>(`/portal/announcements/${id}/react`, { reaction }),

  incrementView: (id: string) =>
    apiClient.post<ApiResponse<any>>(`/portal/announcements/${id}/view`),
};

// ─── Notifications ──────────────────────────────────────────────────────────────
export interface NotificationFilters {
  page?: number;
  pageSize?: number;
  type?: string;
  isRead?: boolean;
  priority?: string;
  userId?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Notification {
  _id: string;
  userId: string;
  userName?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'announcement' | 'system';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  link?: string;
  isRead: boolean;
  readAt?: string;
  expiresAt?: string;
  data?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export const notificationService = {
  list: (filters: NotificationFilters = {}) =>
    apiClient.get<PaginatedResponse<Notification>>('/portal/notifications', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Notification>>(`/portal/notifications/${id}`),

  markRead: (id: string) =>
    apiClient.post<ApiResponse<Notification>>(`/portal/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.post<ApiResponse<any>>('/portal/notifications/read-all'),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/portal/notifications/${id}`),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>('/portal/notifications/unread-count'),

  send: (data: Partial<Notification>) =>
    apiClient.post<ApiResponse<Notification>>('/portal/notifications', data),

  sendBulk: (userIds: string[], data: Partial<Notification>) =>
    apiClient.post<ApiResponse<any>>('/portal/notifications/bulk', { userIds, ...data }),
};

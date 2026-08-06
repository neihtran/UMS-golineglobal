// ─── LMS Hooks ──────────────────────────────────────────────────────────────────
// TanStack Query hooks for LMS Module
//
// Part 2: Lessons hooks bổ sung (reorder, get detail, create, update, reorder contents)

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/stores/notificationStore';
import { lessonsApi, lessonContentsApi } from '@/services/lmsApi';
import type {
  Lesson,
  LessonContent,
  LessonContentCreatePayload,
  LessonContentUpdatePayload,
  LessonCreatePayload,
  LessonUpdatePayload,
  ReorderItem,
} from '@/types/lms.types';
import { LMS_QUERY_KEYS } from './useLms';

// ─── Lesson: hook bổ sung (reorder, create, update, detail) ───────────────────
export const useCreateLesson = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (payload: LessonCreatePayload) => lessonsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.lessons.all });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Tạo bài học thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

export const useUpdateLesson = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LessonUpdatePayload }) =>
      lessonsApi.update(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.lessons.all });
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.lessons.detail(vars.id) });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Cập nhật bài học thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

export const useReorderLessons = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (orders: ReorderItem[]) => lessonsApi.reorder(orders),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.lessons.all });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật thứ tự bài học' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

// ─── LessonContent: hook bổ sung (get detail, create, update, reorder) ────────
export const useLessonContent = (id?: number | string) =>
  useQuery({
    queryKey: LMS_QUERY_KEYS.lessonContents.detail(Number(id)),
    queryFn: async () => (await lessonContentsApi.get(id!)).data,
    enabled: !!id,
  });

export const useCreateLessonContent = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (payload: LessonContentCreatePayload) => lessonContentsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.lessonContents.all });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Tạo nội dung bài học thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

export const useUpdateLessonContent = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LessonContentUpdatePayload }) =>
      lessonContentsApi.update(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.lessonContents.all });
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.lessonContents.detail(vars.id) });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Cập nhật nội dung bài học thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

export const useReorderLessonContents = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (orders: ReorderItem[]) => lessonContentsApi.reorder(orders),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.lessonContents.all });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật thứ tự nội dung' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

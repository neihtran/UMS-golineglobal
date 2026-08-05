// â”€â”€â”€ LMS Hooks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TanStack Query hooks for LMS Module
//
// Part 1: LearningCourses, CourseMaterials, CourseModules, Lessons, LessonContents

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/stores/notificationStore';
import {
  courseMaterialsApi,
  courseModulesApi,
  learningCoursesApi,
  lessonContentsApi,
  lessonsApi,
} from '@/services/lmsApi';
import type {
  CourseMaterial,
  CourseMaterialCreatePayload,
  CourseMaterialListParams,
  CourseMaterialUpdatePayload,
  CourseModule,
  CourseModuleCreatePayload,
  CourseModuleListParams,
  CourseModuleUpdatePayload,
  LearningCourse,
  LearningCourseCreatePayload,
  LearningCourseListParams,
  Lesson,
  LessonContent,
  LessonContentListParams,
  LessonCreatePayload,
  LessonListParams,
  LessonUpdatePayload,
  ReorderItem,
} from '@/types/lms.types';

// â”€â”€â”€ Query Keys â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const LMS_QUERY_KEYS = {
  learningCourses: {
    all: ['lms', 'learning-courses'] as const,
    list: (params?: LearningCourseListParams) =>
      ['lms', 'learning-courses', 'list', params ?? {}] as const,
    detail: (id: number) => ['lms', 'learning-courses', 'detail', id] as const,
  },
  courseMaterials: {
    all: ['lms', 'course-materials'] as const,
    list: (params?: CourseMaterialListParams) =>
      ['lms', 'course-materials', 'list', params ?? {}] as const,
    detail: (id: number) => ['lms', 'course-materials', 'detail', id] as const,
  },
  courseModules: {
    all: ['lms', 'course-modules'] as const,
    list: (params?: CourseModuleListParams) =>
      ['lms', 'course-modules', 'list', params ?? {}] as const,
    detail: (id: number) => ['lms', 'course-modules', 'detail', id] as const,
  },
  lessons: {
    all: ['lms', 'lessons'] as const,
    list: (params?: LessonListParams) =>
      ['lms', 'lessons', 'list', params ?? {}] as const,
    detail: (id: number) => ['lms', 'lessons', 'detail', id] as const,
  },
  lessonContents: {
    all: ['lms', 'lesson-contents'] as const,
    list: (params?: LessonContentListParams) =>
      ['lms', 'lesson-contents', 'list', params ?? {}] as const,
    detail: (id: number) => ['lms', 'lesson-contents', 'detail', id] as const,
  },
};

// â”€â”€â”€ LearningCourses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const useLearningCourses = (params?: LearningCourseListParams) =>
  useQuery({
    queryKey: LMS_QUERY_KEYS.learningCourses.list(params),
    queryFn: async () => (await learningCoursesApi.list(params)).data,
  });

export const useLearningCourse = (id?: number | string) =>
  useQuery({
    queryKey: LMS_QUERY_KEYS.learningCourses.detail(Number(id)),
    queryFn: async () => (await learningCoursesApi.get(id!)).data,
    enabled: !!id,
  });

export const useCreateLearningCourse = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (payload: LearningCourseCreatePayload) => learningCoursesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.learningCourses.all });
      notify.addNotification({ type: 'success', title: 'ThÃ nh cÃ´ng', message: 'Táº¡o khÃ³a há»c LMS thÃ nh cÃ´ng' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lá»—i', message: err.message }),
  });
};

export const useUpdateLearningCourse = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<LearningCourseCreatePayload> }) =>
      learningCoursesApi.update(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.learningCourses.all });
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.learningCourses.detail(vars.id) });
      notify.addNotification({ type: 'success', title: 'ThÃ nh cÃ´ng', message: 'Cáº­p nháº­t khÃ³a há»c LMS thÃ nh cÃ´ng' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lá»—i', message: err.message }),
  });
};

export const useDeleteLearningCourse = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (id: number | string) => learningCoursesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.learningCourses.all });
      notify.addNotification({ type: 'success', title: 'ThÃ nh cÃ´ng', message: 'XÃ³a khÃ³a há»c LMS thÃ nh cÃ´ng' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lá»—i', message: err.message }),
  });
};

// â”€â”€â”€ CourseMaterials â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const useCourseMaterials = (params?: CourseMaterialListParams) =>
  useQuery({
    queryKey: LMS_QUERY_KEYS.courseMaterials.list(params),
    queryFn: async () => (await courseMaterialsApi.list(params)).data,
  });

export const useCourseMaterial = (id?: number | string) =>
  useQuery({
    queryKey: LMS_QUERY_KEYS.courseMaterials.detail(Number(id)),
    queryFn: async () => (await courseMaterialsApi.get(id!)).data,
    enabled: !!id,
  });

export const useCreateCourseMaterial = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (payload: CourseMaterialCreatePayload) => courseMaterialsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.courseMaterials.all });
      notify.addNotification({ type: 'success', title: 'ThÃ nh cÃ´ng', message: 'Táº¡o há»c liá»‡u thÃ nh cÃ´ng' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lá»—i', message: err.message }),
  });
};

export const useUpdateCourseMaterial = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CourseMaterialUpdatePayload }) =>
      courseMaterialsApi.update(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.courseMaterials.all });
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.courseMaterials.detail(vars.id) });
      notify.addNotification({ type: 'success', title: 'ThÃ nh cÃ´ng', message: 'Cáº­p nháº­t há»c liá»‡u thÃ nh cÃ´ng' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lá»—i', message: err.message }),
  });
};

export const useDeleteCourseMaterial = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (id: number | string) => courseMaterialsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.courseMaterials.all });
      notify.addNotification({ type: 'success', title: 'ThÃ nh cÃ´ng', message: 'XÃ³a há»c liá»‡u thÃ nh cÃ´ng' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lá»—i', message: err.message }),
  });
};

// â”€â”€â”€ CourseModules â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const useCourseModules = (params?: CourseModuleListParams) =>
  useQuery({
    queryKey: LMS_QUERY_KEYS.courseModules.list(params),
    queryFn: async () => (await courseModulesApi.list(params)).data,
  });

export const useCourseModule = (id?: number | string) =>
  useQuery({
    queryKey: LMS_QUERY_KEYS.courseModules.detail(Number(id)),
    queryFn: async () => (await courseModulesApi.get(id!)).data,
    enabled: !!id,
  });

export const useCreateCourseModule = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (payload: CourseModuleCreatePayload) => courseModulesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.courseModules.all });
      notify.addNotification({ type: 'success', title: 'ThÃ nh cÃ´ng', message: 'Táº¡o chÆ°Æ¡ng há»c thÃ nh cÃ´ng' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lá»—i', message: err.message }),
  });
};

export const useUpdateCourseModule = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CourseModuleUpdatePayload }) =>
      courseModulesApi.update(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.courseModules.all });
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.courseModules.detail(vars.id) });
      notify.addNotification({ type: 'success', title: 'ThÃ nh cÃ´ng', message: 'Cáº­p nháº­t chÆ°Æ¡ng há»c thÃ nh cÃ´ng' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lá»—i', message: err.message }),
  });
};

export const useDeleteCourseModule = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (id: number | string) => courseModulesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.courseModules.all });
      notify.addNotification({ type: 'success', title: 'ThÃ nh cÃ´ng', message: 'XÃ³a chÆ°Æ¡ng há»c thÃ nh cÃ´ng' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lá»—i', message: err.message }),
  });
};

export const useReorderCourseModules = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (orders: ReorderItem[]) => courseModulesApi.reorder(orders),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.courseModules.all });
      notify.addNotification({ type: 'success', title: 'ThÃ nh cÃ´ng', message: 'ÄÃ£ cáº­p nháº­t thá»© tá»± chÆ°Æ¡ng há»c' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lá»—i', message: err.message }),
  });
};

// â”€â”€â”€ Lessons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const useLessons = (params?: LessonListParams) =>
  useQuery({
    queryKey: LMS_QUERY_KEYS.lessons.list(params),
    queryFn: async () => (await lessonsApi.list(params)).data,
  });

export const useLesson = (id?: number | string) =>
  useQuery({
    queryKey: LMS_QUERY_KEYS.lessons.detail(Number(id)),
    queryFn: async () => (await lessonsApi.get(id!)).data,
    enabled: !!id,
  });

export const useCreateLesson = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (payload: LessonCreatePayload) => lessonsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.lessons.all });
      notify.addNotification({ type: 'success', title: 'ThÃ nh cÃ´ng', message: 'Táº¡o bÃ i há»c thÃ nh cÃ´ng' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lá»—i', message: err.message }),
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
      notify.addNotification({ type: 'success', title: 'ThÃ nh cÃ´ng', message: 'Cáº­p nháº­t bÃ i há»c thÃ nh cÃ´ng' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lá»—i', message: err.message }),
  });
};

export const useDeleteLesson = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (id: number | string) => lessonsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.lessons.all });
      notify.addNotification({ type: 'success', title: 'ThÃ nh cÃ´ng', message: 'XÃ³a bÃ i há»c thÃ nh cÃ´ng' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lá»—i', message: err.message }),
  });
};

// â”€â”€â”€ LessonContents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const useLessonContents = (params?: LessonContentListParams) =>
  useQuery({
    queryKey: LMS_QUERY_KEYS.lessonContents.list(params),
    queryFn: async () => (await lessonContentsApi.list(params)).data,
  });

export const useDeleteLessonContent = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (id: number | string) => lessonContentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.lessonContents.all });
      notify.addNotification({ type: 'success', title: 'ThÃ nh cÃ´ng', message: 'XÃ³a ná»™i dung bÃ i há»c thÃ nh cÃ´ng' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lá»—i', message: err.message }),
  });
};


// ─── LMS Hooks ──────────────────────────────────────────────────────────────────
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
  CourseMaterialListParams,
  CourseMaterialCreatePayload,
  CourseMaterialUpdatePayload,
  CourseModuleListParams,
  CourseModuleCreatePayload,
  CourseModuleUpdatePayload,
  LearningCourseListParams,
  LearningCourseCreatePayload,
  LessonListParams,
  LessonCreatePayload,
  LessonUpdatePayload,
  LessonContentListParams,
  ReorderItem,
} from '@/types/lms.types';

// ─── Query Keys ─────────────────────────────────────────────────────────────────
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

// ─── LearningCourses ───────────────────────────────────────────────────────────
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
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Tạo khóa học LMS thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
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
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Cập nhật khóa học LMS thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

export const useDeleteLearningCourse = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (id: number | string) => learningCoursesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.learningCourses.all });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Xóa khóa học LMS thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

// ─── CourseMaterials ───────────────────────────────────────────────────────────
export const useCourseMaterials = (params?: CourseMaterialListParams) =>
  useQuery({
    queryKey: LMS_QUERY_KEYS.courseMaterials.list(params),
    queryFn: async () => (await courseMaterialsApi.list(params)).data,
    enabled: !!params?.learning_course_id,
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
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Tạo học liệu thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
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
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Cập nhật học liệu thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

export const useDeleteCourseMaterial = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (id: number | string) => courseMaterialsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.courseMaterials.all });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Xóa học liệu thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

// ─── CourseModules ─────────────────────────────────────────────────────────────
export const useCourseModules = (params?: CourseModuleListParams) =>
  useQuery({
    queryKey: LMS_QUERY_KEYS.courseModules.list(params),
    queryFn: async () => (await courseModulesApi.list(params)).data,
    enabled: !!params?.learning_course_id,
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
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Tạo chương học thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
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
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Cập nhật chương học thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

export const useDeleteCourseModule = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (id: number | string) => courseModulesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.courseModules.all });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Xóa chương học thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

export const useReorderCourseModules = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (orders: ReorderItem[]) => courseModulesApi.reorder(orders),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.courseModules.all });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật thứ tự chương học' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

// ─── Lessons ───────────────────────────────────────────────────────────────────
export const useLessons = (params?: LessonListParams) =>
  useQuery({
    queryKey: LMS_QUERY_KEYS.lessons.list(params),
    queryFn: async () => (await lessonsApi.list(params)).data,
    enabled: !!params?.course_module_id,
  });

/** Fetch all lessons for a given learning course (via course modules). */
export const useCourseLessons = (learningCourseId?: number) => {
  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: LMS_QUERY_KEYS.courseModules.list({ learning_course_id: learningCourseId, per_page: 100 }),
    queryFn: async () => (await courseModulesApi.list({ learning_course_id: learningCourseId, per_page: 100 })).data,
    enabled: !!learningCourseId,
  });

  const moduleIds = (modulesData?.data ?? []).map((m) => m.id);

  const { data: lessonsData, isLoading: lessonsLoading } = useQuery({
    queryKey: ['lms', 'course-lessons', 'all', learningCourseId] as const,
    queryFn: async () => {
      if (moduleIds.length === 0) return [];
      const results = await Promise.all(
        moduleIds.map((mid) => lessonsApi.list({ course_module_id: mid, per_page: 100 }))
      );
      return results.flatMap((r) => r.data.data);
    },
    enabled: moduleIds.length > 0,
  });

  return {
    data: lessonsData ?? [],
    isLoading: modulesLoading || lessonsLoading,
  };
};

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

export const useDeleteLesson = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (id: number | string) => lessonsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.lessons.all });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Xóa bài học thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

// ─── LessonContents ────────────────────────────────────────────────────────────
export const useLessonContents = (params?: LessonContentListParams) =>
  useQuery({
    queryKey: LMS_QUERY_KEYS.lessonContents.list(params),
    queryFn: async () => (await lessonContentsApi.list(params)).data,
    enabled: !!params?.lesson_id,
  });

export const useDeleteLessonContent = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (id: number | string) => lessonContentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_QUERY_KEYS.lessonContents.all });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Xóa nội dung bài học thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

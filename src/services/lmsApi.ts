// ─── LMS API Service ──────────────────────────────────────────────────────────────
// Client wrapper cho LMS endpoints
// https://api.hqnhat.id.vn/api/v1/lms
//
// Part 1:
//   - LearningCourses     /learning-courses
//   - CourseMaterials     /course-materials     (multipart upload)
//   - CourseModules       /course-modules       (hierarchy của course)
//   - Lessons             /lessons
//   - LessonContents      /lesson-contents

import { lmsApi, lmsApiClient } from '@/lib/lmsApiClient';
import type {
  Assignment,
  AssignmentCreatePayload,
  AssignmentListParams,
  AssignmentSubmission,
  AssignmentSubmissionCreatePayload,
  AssignmentSubmissionListParams,
  AssignmentUpdatePayload,
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
  LessonContentCreatePayload,
  LessonContentListParams,
  LessonContentUpdatePayload,
  LessonCreatePayload,
  LessonListParams,
  LessonUpdatePayload,
  LmsDetailResponse,
  LmsListResponse,
  ReorderItem,
} from '@/types/lms.types';

const BASE = '/lms';

// ─── Helpers ────────────────────────────────────────────────────────────────────
/** Build FormData cho multipart upload (course-materials). */
function buildMaterialFormData(payload: CourseMaterialCreatePayload | CourseMaterialUpdatePayload) {
  const fd = new FormData();
  fd.append('title', payload.title ?? '');
  if (payload.description != null) fd.append('description', payload.description);
  if (payload.learning_course_id != null) {
    fd.append('learning_course_id', String(payload.learning_course_id));
  }
  if (payload.material_type) fd.append('material_type', payload.material_type);
  if (payload.file_path != null) fd.append('file_path', payload.file_path);
  if (payload.duration != null) fd.append('duration', String(payload.duration));
  if (payload.display_order != null) fd.append('display_order', String(payload.display_order));
  // form-data expects "1" / "0" cho is_downloadable
  fd.append('is_downloadable', payload.is_downloadable ? '1' : '0');
  if (payload.status) fd.append('status', payload.status);
  if (payload.file) fd.append('file', payload.file);
  return fd;
}

/**
 * Build FormData cho multipart upload (lesson-contents).
 * `content_type = video` không upload file vật lý — bắt buộc dùng `external_url`.
 */
function buildLessonContentFormData(payload: LessonContentCreatePayload | LessonContentUpdatePayload) {
  const fd = new FormData();
  fd.append('title', payload.title ?? '');
  if (payload.lesson_id != null) fd.append('lesson_id', String(payload.lesson_id));
  if (payload.content_type) fd.append('content_type', payload.content_type);
  if (payload.content != null) fd.append('content', payload.content);
  if (payload.external_url != null) fd.append('external_url', payload.external_url);
  if (payload.duration != null) fd.append('duration', String(payload.duration));
  fd.append('is_downloadable', payload.is_downloadable ? '1' : '0');
  if (payload.status) fd.append('status', payload.status);
  if (payload.file) fd.append('file', payload.file);
  return fd;
}

// ─── LearningCourses ─────────────────────────────────────────────────────────────
export const learningCoursesApi = {
  list: (params: LearningCourseListParams = {}) =>
    lmsApi.get<LmsListResponse<LearningCourse>>(BASE + '/learning-courses', { params }),

  get: (id: number | string) =>
    lmsApi.get<LmsDetailResponse<LearningCourse>>(BASE + '/learning-courses/' + id),

  create: (payload: LearningCourseCreatePayload) =>
    lmsApi.post<LmsDetailResponse<LearningCourse>>(BASE + '/learning-courses', payload),

  update: (id: number | string, payload: Partial<LearningCourseCreatePayload>) =>
    lmsApi.put<LmsDetailResponse<LearningCourse>>(BASE + '/learning-courses/' + id, payload),

  delete: (id: number | string) =>
    lmsApi.delete<LmsDetailResponse<null>>(BASE + '/learning-courses/' + id),
};

// ─── CourseMaterials ─────────────────────────────────────────────────────────────
export const courseMaterialsApi = {
  list: (params: CourseMaterialListParams = {}) =>
    lmsApi.get<LmsListResponse<CourseMaterial>>(BASE + '/course-materials', { params }),

  get: (id: number | string) =>
    lmsApi.get<LmsDetailResponse<CourseMaterial>>(BASE + '/course-materials/' + id),

  create: (payload: CourseMaterialCreatePayload) =>
    lmsApi.post<LmsDetailResponse<CourseMaterial>>(
      BASE + '/course-materials',
      buildMaterialFormData(payload),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  update: (id: number | string, payload: CourseMaterialUpdatePayload) =>
    lmsApi.post<LmsDetailResponse<CourseMaterial>>(
      BASE + '/course-materials/' + id + '?_method=PUT',
      buildMaterialFormData(payload),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  delete: (id: number | string) =>
    lmsApi.delete<LmsDetailResponse<null>>(BASE + '/course-materials/' + id),

  /** Trả về blob — dùng cho nút "Tải xuống" */
  download: async (id: number | string) => {
    const res = await lmsApiClient.get(BASE + '/course-materials/' + id + '/download', {
      responseType: 'blob',
    });
    return res.data as Blob;
  },

  /** Trả về URL stream để nhúng vào <iframe> cho view PDF/Image inline */
  viewUrl: (id: number | string) => `${BASE}/course-materials/${id}/view`,
};

// ─── CourseModules ───────────────────────────────────────────────────────────────
export const courseModulesApi = {
  list: (params: CourseModuleListParams = {}) =>
    lmsApi.get<LmsListResponse<CourseModule>>(BASE + '/course-modules', { params }),

  get: (id: number | string) =>
    lmsApi.get<LmsDetailResponse<CourseModule>>(BASE + '/course-modules/' + id),

  create: (payload: CourseModuleCreatePayload) =>
    lmsApi.post<LmsDetailResponse<CourseModule>>(BASE + '/course-modules', payload),

  update: (id: number | string, payload: CourseModuleUpdatePayload) =>
    lmsApi.put<LmsDetailResponse<CourseModule>>(BASE + '/course-modules/' + id, payload),

  delete: (id: number | string) =>
    lmsApi.delete<LmsDetailResponse<null>>(BASE + '/course-modules/' + id),

  reorder: (orders: ReorderItem[]) =>
    lmsApi.post<LmsDetailResponse<null>>(BASE + '/course-modules/reorder', { orders }),
};

// ─── Lessons ─────────────────────────────────────────────────────────────────────
export const lessonsApi = {
  list: (params: LessonListParams = {}) =>
    lmsApi.get<LmsListResponse<Lesson>>(BASE + '/lessons', { params }),

  get: (id: number | string) =>
    lmsApi.get<LmsDetailResponse<Lesson>>(BASE + '/lessons/' + id),

  create: (payload: LessonCreatePayload) =>
    lmsApi.post<LmsDetailResponse<Lesson>>(BASE + '/lessons', payload),

  update: (id: number | string, payload: LessonUpdatePayload) =>
    lmsApi.put<LmsDetailResponse<Lesson>>(BASE + '/lessons/' + id, payload),

  delete: (id: number | string) =>
    lmsApi.delete<LmsDetailResponse<null>>(BASE + '/lessons/' + id),

  reorder: (orders: ReorderItem[]) =>
    lmsApi.post<LmsDetailResponse<null>>(BASE + '/lessons/reorder', { orders }),
};

// ─── LessonContents ──────────────────────────────────────────────────────────────
export const lessonContentsApi = {
  list: (params: LessonContentListParams = {}) =>
    lmsApi.get<LmsListResponse<LessonContent>>(BASE + '/lesson-contents', { params }),

  get: (id: number | string) =>
    lmsApi.get<LmsDetailResponse<LessonContent>>(BASE + '/lesson-contents/' + id),

  create: (payload: LessonContentCreatePayload) =>
    lmsApi.post<LmsDetailResponse<LessonContent>>(
      BASE + '/lesson-contents',
      buildLessonContentFormData(payload),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  update: (id: number | string, payload: LessonContentUpdatePayload) =>
    lmsApi.post<LmsDetailResponse<LessonContent>>(
      BASE + '/lesson-contents/' + id + '?_method=PUT',
      buildLessonContentFormData(payload),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  delete: (id: number | string) =>
    lmsApi.delete<LmsDetailResponse<null>>(BASE + '/lesson-contents/' + id),

  reorder: (orders: ReorderItem[]) =>
    lmsApi.post<LmsDetailResponse<null>>(BASE + '/lesson-contents/reorder', { orders }),

  download: async (id: number | string) => {
    const res = await lmsApiClient.get(BASE + '/lesson-contents/' + id + '/download', {
      responseType: 'blob',
    });
    return res.data as Blob;
  },
};

// ─── Assignments ───────────────────────────────────────────────────────────────────
export const assignmentsApi = {
  list: (params: AssignmentListParams = {}) =>
    lmsApi.get<LmsListResponse<Assignment>>(BASE + '/assignments', { params }),

  get: (id: number | string) =>
    lmsApi.get<LmsDetailResponse<Assignment>>(BASE + '/assignments/' + id),

  create: (payload: AssignmentCreatePayload) =>
    lmsApi.post<LmsDetailResponse<Assignment>>(BASE + '/assignments', payload),

  update: (id: number | string, payload: AssignmentUpdatePayload) =>
    lmsApi.put<LmsDetailResponse<Assignment>>(BASE + '/assignments/' + id, payload),

  delete: (id: number | string) =>
    lmsApi.delete<LmsDetailResponse<null>>(BASE + '/assignments/' + id),
};

// ─── AssignmentSubmissions ────────────────────────────────────────────────────────
export const assignmentSubmissionsApi = {
  list: (params: AssignmentSubmissionListParams = {}) =>
    lmsApi.get<LmsListResponse<AssignmentSubmission>>(BASE + '/assignment-submissions', { params }),

  get: (id: number | string) =>
    lmsApi.get<LmsDetailResponse<AssignmentSubmission>>(BASE + '/assignment-submissions/' + id),

  /** Nộp bài (multipart/form-data) */
  submit: (payload: AssignmentSubmissionCreatePayload) => {
    const fd = new FormData();
    fd.append('assignment_id', String(payload.assignment_id));
    if (payload.student_id != null) fd.append('student_id', String(payload.student_id));
    fd.append('submission_type', payload.submission_type);
    if (payload.content != null) fd.append('content', payload.content);
    if (payload.file) fd.append('file', payload.file);
    return lmsApi.post<LmsDetailResponse<AssignmentSubmission>>(
      BASE + '/assignment-submissions',
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  /** Bài nộp mới nhất của sinh viên cho một bài tập */
  latest: (assignmentId: number | string, studentId?: number) => {
    const params: Record<string, string | number> = {};
    if (studentId) params.student_id = studentId;
    return lmsApi.get<LmsDetailResponse<AssignmentSubmission | null>>(
      BASE + '/assignments/' + assignmentId + '/latest-submission',
      { params }
    );
  },

  /** Lịch sử nộp của một sinh viên cho một bài tập */
  history: (assignmentId: number | string, studentId: number) =>
    lmsApi.get<LmsDetailResponse<AssignmentSubmission[]>>(
      BASE + '/assignments/' + assignmentId + '/submission-history',
      { params: { student_id: studentId } }
    ),
};

export default {
  learningCoursesApi,
  courseMaterialsApi,
  courseModulesApi,
  lessonsApi,
  lessonContentsApi,
  assignmentsApi,
  assignmentSubmissionsApi,
};

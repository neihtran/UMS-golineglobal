// ─── LMS Module Types ──────────────────────────────────────────────────────────────
// Backend: https://api.hqnhat.id.vn/api/v1/lms
// Part 1: LearningCourses, CourseMaterials, CourseModules, Lessons, LessonContents

// ─── Enums ───────────────────────────────────────────────────────────────────────
export type LearningCourseStatus = 'active' | 'inactive' | 'archived';
export type LearningCourseEnrollment = 'self_enrollment' | 'invitation' | 'course_section';
export type LearningCourseVisibility = 'public' | 'private';

export type CourseMaterialType =
  | 'video'
  | 'pdf'
  | 'slide'
  | 'document'
  | 'source_code'
  | 'archive'
  | 'image'
  | 'link';

export type LessonContentType =
  | 'video'
  | 'pdf'
  | 'slide'
  | 'document'
  | 'image'
  | 'audio'
  | 'source_code'
  | 'link';

export type LessonType = 'video' | 'document' | 'reading' | 'practice' | 'assignment';

export type LmsStatus = 'active' | 'inactive';

// ─── LearningCourse ──────────────────────────────────────────────────────────────
export interface LearningCourse {
  id: number;
  code: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  course_section_id: number | null;
  lecturer_id: number | null;
  start_date: string | null; // YYYY-MM-DD
  end_date: string | null;
  enrollment_type: LearningCourseEnrollment | null;
  visibility: LearningCourseVisibility | null;
  status: LearningCourseStatus | null;
  lecturer?: { id: number; full_name: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface LearningCourseCreatePayload {
  code: string;
  name: string;
  description?: string | null;
  thumbnail?: string | null;
  course_section_id?: number | null;
  lecturer_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  enrollment_type?: LearningCourseEnrollment | null;
  visibility?: LearningCourseVisibility | null;
  status?: LearningCourseStatus;
}

export interface LearningCourseListParams {
  page?: number;
  per_page?: number;
  search?: string;
  code?: string;
  name?: string;
  status?: LearningCourseStatus;
  enrollment_type?: LearningCourseEnrollment;
  visibility?: LearningCourseVisibility;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── CourseMaterial ───────────────────────────────────────────────────────────────
export interface CourseMaterial {
  id: number;
  title: string;
  description: string | null;
  learning_course_id: number | null;
  material_type: CourseMaterialType | null;
  file_path: string | null;
  file_size: number | null; // bytes
  duration: number | null; // seconds
  display_order: number | null;
  is_downloadable: boolean;
  status: LmsStatus | null;
  learning_course?: { id: number; code: string; name: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface CourseMaterialCreatePayload {
  title: string;
  description?: string | null;
  learning_course_id?: number | null;
  material_type: CourseMaterialType;
  file_path?: string | null;
  duration?: number | null;
  display_order?: number | null;
  is_downloadable?: boolean;
  status?: LmsStatus;
  /** File đính kèm (multipart). Không dùng khi material_type là video|link. */
  file?: File | null;
}

export interface CourseMaterialUpdatePayload {
  title?: string;
  description?: string | null;
  learning_course_id?: number | null;
  material_type?: CourseMaterialType;
  file_path?: string | null;
  duration?: number | null;
  display_order?: number | null;
  is_downloadable?: boolean;
  status?: LmsStatus;
  file?: File | null;
}

export interface CourseMaterialListParams {
  page?: number;
  per_page?: number;
  title?: string;
  learning_course_id?: number;
  material_type?: CourseMaterialType;
  is_downloadable?: 0 | 1;
  status?: LmsStatus;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── CourseModule ────────────────────────────────────────────────────────────────
export interface CourseModule {
  id: number;
  title: string;
  description: string | null;
  learning_course_id: number;
  display_order: number;
  is_published: boolean;
  status: LmsStatus | null;
  learning_course?: { id: number; code: string; name: string } | null;
  lessons?: Lesson[];
  created_at?: string;
  updated_at?: string;
}

export interface CourseModuleCreatePayload {
  title: string;
  description?: string | null;
  learning_course_id: number;
  is_published?: boolean;
  status?: LmsStatus;
  display_order?: number;
}

export interface CourseModuleUpdatePayload {
  title?: string;
  description?: string | null;
  is_published?: boolean;
  status?: LmsStatus;
  display_order?: number;
}

export interface CourseModuleListParams {
  page?: number;
  per_page?: number;
  title?: string;
  learning_course_id?: number;
  is_published?: 0 | 1;
  status?: LmsStatus;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface ReorderItem {
  id: number;
  display_order: number;
}

// ─── Lesson ──────────────────────────────────────────────────────────────────────
export interface Lesson {
  id: number;
  title: string;
  summary: string | null;
  course_module_id: number | null;
  lesson_type: LessonType | null;
  estimated_minutes: number | null;
  display_order: number;
  is_preview: boolean;
  is_published: boolean;
  status: LmsStatus | null;
  course_module?: { id: number; title: string } | null;
  contents?: LessonContent[];
  created_at?: string;
  updated_at?: string;
}

export interface LessonCreatePayload {
  title: string;
  summary?: string | null;
  course_module_id?: number | null;
  lesson_type?: LessonType;
  estimated_minutes?: number | null;
  display_order?: number;
  is_preview?: boolean;
  is_published?: boolean;
  status?: LmsStatus;
}

export interface LessonUpdatePayload {
  title?: string;
  summary?: string | null;
  lesson_type?: LessonType;
  estimated_minutes?: number | null;
  display_order?: number;
  is_preview?: boolean;
  is_published?: boolean;
  status?: LmsStatus;
}

export interface LessonListParams {
  page?: number;
  per_page?: number;
  title?: string;
  course_module_id?: number;
  lesson_type?: LessonType;
  is_published?: 0 | 1;
  status?: LmsStatus;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── LessonContent ───────────────────────────────────────────────────────────────
export interface LessonContent {
  id: number;
  title: string;
  lesson_id: number | null;
  content_type: LessonContentType | null;
  content: string | null;
  file_path: string | null;
  external_url: string | null;
  duration: number | null;
  display_order: number | null;
  is_downloadable: boolean;
  status: LmsStatus | null;
  lesson?: { id: number; title: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface LessonContentListParams {
  page?: number;
  per_page?: number;
  title?: string;
  lesson_id?: number;
  content_type?: LessonContentType;
  is_downloadable?: 0 | 1;
  status?: LmsStatus;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── List response shape (dùng chung) ────────────────────────────────────────────
export interface LmsListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface LmsDetailResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

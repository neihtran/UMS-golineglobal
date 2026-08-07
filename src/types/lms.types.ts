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
  /** Filter theo ID giảng viên (employee_profiles.id). Admin-only filter; backend tự override với employee_id cho lecturer. */
  lecturer_id?: number;
  course_section_id?: number;
  start_date?: string;
  end_date?: string;
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

export interface LessonContentCreatePayload {
  title: string;
  lesson_id: number | null;
  content_type: LessonContentType;
  content?: string | null;
  external_url?: string | null;
  duration?: number | null;
  is_downloadable?: boolean;
  status?: LmsStatus;
  /** File đính kèm (multipart). Không dùng khi content_type là video. */
  file?: File | null;
}

export interface LessonContentUpdatePayload {
  title?: string;
  lesson_id?: number | null;
  content_type?: LessonContentType;
  content?: string | null;
  external_url?: string | null;
  duration?: number | null;
  is_downloadable?: boolean;
  status?: LmsStatus;
  file?: File | null;
}

// ─── Assignment ────────────────────────────────────────────────────────────────────
export type AssignmentType = 'file' | 'text' | 'url' | 'mixed';
export type AssignmentStatus = 'active' | 'inactive';

export interface Assignment {
  id: number;
  title: string;
  description: string | null;
  learning_course_id: number | null;
  lesson_id: number | null;
  assignment_type: AssignmentType | null;
  open_at: string | null;        // YYYY-MM-DD HH:MM:SS
  due_at: string | null;
  close_at: string | null;
  max_score: number | null;
  max_attempts: number | null;
  allow_late_submission: boolean;
  allow_resubmission: boolean;
  status: AssignmentStatus | null;
  learning_course?: { id: number; code: string; name: string } | null;
  lesson?: { id: number; title: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface AssignmentCreatePayload {
  title: string;
  description?: string | null;
  learning_course_id?: number | null;
  lesson_id?: number | null;
  assignment_type: AssignmentType;
  open_at?: string | null;
  due_at?: string | null;
  close_at?: string | null;
  max_score?: number | null;
  max_attempts?: number | null;
  allow_late_submission?: boolean;
  allow_resubmission?: boolean;
  status?: AssignmentStatus;
}

export interface AssignmentUpdatePayload {
  title?: string;
  description?: string | null;
  assignment_type?: AssignmentType;
  open_at?: string | null;
  due_at?: string | null;
  close_at?: string | null;
  max_score?: number | null;
  max_attempts?: number | null;
  allow_late_submission?: boolean;
  allow_resubmission?: boolean;
  status?: AssignmentStatus;
}

export interface AssignmentListParams {
  page?: number;
  per_page?: number;
  learning_course_id?: number;
  lesson_id?: number;
  title?: string;
  assignment_type?: AssignmentType;
  status?: AssignmentStatus;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── AssignmentSubmission ──────────────────────────────────────────────────────
export type SubmissionStatus = 'submitted' | 'late' | 'returned' | 'graded';
export type SubmissionType = 'file' | 'text' | 'url';

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  student_id: number;
  submission_type: SubmissionType | null;
  content: string | null;        // text/url content
  file_path: string | null;      // for file uploads
  submitted_at: string | null;
  attempt_number: number;
  status: SubmissionStatus | null;
  score: number | null;
  feedback: string | null;
  student?: {
    id: number;
    full_name: string;
    student_code: string;
  } | null;
  assignment?: {
    id: number;
    title: string;
    max_score: number | null;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface AssignmentSubmissionCreatePayload {
  assignment_id: number;
  student_id?: number | null;
  submission_type: SubmissionType;
  content?: string | null;
  file?: File | null;
}

export interface AssignmentSubmissionListParams {
  page?: number;
  per_page?: number;
  assignment_id?: number;
  student_id?: number;
  student_name?: string;
  status?: SubmissionStatus;
  latest_only?: 0 | 1;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── DiscussionTopic & DiscussionPost ──────────────────────────────────────────────
export type DiscussionStatus = 'active' | 'inactive';
export type DiscussionPostStatus = 'active' | 'hidden' | 'deleted';

export interface DiscussionTopic {
  id: number;
  title: string;
  description: string | null;
  learning_course_id: number;
  lesson_id: number | null;
  created_by: number | null;
  is_pinned: boolean;
  is_locked: boolean;
  status: DiscussionStatus | null;
  learning_course?: { id: number; code: string; name: string } | null;
  lesson?: { id: number; title: string } | null;
  creator?: { id: number; full_name: string; avatar?: string | null } | null;
  posts_count?: number;
  last_activity_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DiscussionTopicCreatePayload {
  title: string;
  description?: string | null;
  learning_course_id: number;
  lesson_id?: number | null;
  is_pinned?: boolean;
  is_locked?: boolean;
  status?: DiscussionStatus;
}

export interface DiscussionTopicUpdatePayload {
  title?: string;
  description?: string | null;
  is_pinned?: boolean;
  is_locked?: boolean;
  status?: DiscussionStatus;
}

export interface DiscussionTopicListParams {
  page?: number;
  per_page?: number;
  learning_course_id?: number;
  lesson_id?: number;
  title?: string;
  created_by?: number;
  is_locked?: boolean;
  status?: DiscussionStatus;
  sort_by?: 'id' | 'title' | 'learning_course_id' | 'lesson_id' | 'created_by' | 'is_pinned' | 'is_locked' | 'status' | 'created_at' | 'updated_at';
  sort_direction?: 'asc' | 'desc';
}

export interface DiscussionPostAuthor {
  id: number;
  full_name: string;
  avatar?: string | null;
}

export interface DiscussionPost {
  id: number;
  discussion_topic_id: number;
  user_id: number | null;
  parent_post_id: number | null;
  content: string;
  is_answer: boolean;
  status: DiscussionPostStatus | null;
  replies_count: number;
  user: DiscussionPostAuthor | null;
  created_at?: string;
  updated_at?: string;
}

export interface DiscussionPostCreatePayload {
  discussion_topic_id: number;
  parent_post_id?: number | null;
  content: string;
  status?: DiscussionPostStatus;
}

export interface DiscussionPostUpdatePayload {
  content?: string;
  status?: DiscussionPostStatus;
}

export interface DiscussionPostListParams {
  page?: number;
  per_page?: number;
  discussion_topic_id?: number;
  parent_post_id?: number | null;
  is_answer?: 0 | 1;
  status?: DiscussionPostStatus;
  sort_by?: 'id' | 'discussion_topic_id' | 'user_id' | 'parent_post_id' | 'is_answer' | 'status' | 'created_at' | 'updated_at';
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

// ─── Attendance Sessions & Records (Part 5) ───────────────────────────────────────

/** Lifecycle status của phiên điểm danh */
export type AttendanceSessionStatus = 'scheduled' | 'active' | 'closed';

/** Phương thức xác thực điểm danh */
export type AttendanceMethod = 'qr_code' | 'gps' | 'face_recognition' | 'manual';

/** Trạng thái điểm danh của sinh viên */
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

/** Phương thức xác thực trên bản ghi */
export type VerificationMethod = 'qr_code' | 'gps' | 'face_recognition' | 'manual';

// ─── AttendanceSession ────────────────────────────────────────────────────────────
export interface AttendanceSession {
  id: number;
  title: string;
  learning_course_id: number;
  lesson_id: number | null;
  attendance_method: AttendanceMethod | null;
  start_time: string; // ISO 8601 datetime
  end_time: string; // ISO 8601 datetime
  qr_code: string | null; // Backend secret, never expose to UI
  latitude: number | null; // GPS center
  longitude: number | null; // GPS center
  radius: number | null; // meters
  face_recognition: boolean;
  status: AttendanceSessionStatus | null;
  learning_course?: { id: number; code: string; name: string } | null;
  lesson?: { id: number; title: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceSessionCreatePayload {
  title: string;
  learning_course_id: number;
  lesson_id?: number | null;
  attendance_method: AttendanceMethod;
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
  latitude?: number | null;
  longitude?: number | null;
  radius?: number | null;
  face_recognition?: boolean;
  status?: AttendanceSessionStatus;
}

export type AttendanceSessionUpdatePayload = Partial<AttendanceSessionCreatePayload>;

export interface AttendanceSessionListParams {
  page?: number;
  per_page?: number;
  learning_course_id?: number;
  lesson_id?: number;
  title?: string;
  attendance_method?: AttendanceMethod;
  status?: AttendanceSessionStatus;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface AttendanceSessionQrToken {
  session_id: number;
  step: number;
  token: string;
  expires_in: number;
}

// ─── AttendanceRecord ─────────────────────────────────────────────────────────────
export interface AttendanceRecord {
  id: number;
  attendance_session_id: number;
  student_id: number;
  check_in_time: string | null; // ISO 8601 datetime
  attendance_status: AttendanceStatus | null;
  verification_method: VerificationMethod | null;
  latitude: number | null;
  longitude: number | null;
  note: string | null;
  student?: {
    id: number;
    student_code: string;
    full_name: string;
    email?: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceRecordUpdatePayload {
  attendance_status?: AttendanceStatus;
  check_in_time?: string | null;
  verification_method?: VerificationMethod | null;
  note?: string | null;
}

export interface AttendanceRecordListParams {
  page?: number;
  per_page?: number;
  attendance_session_id?: number;
  student_id?: number;
  attendance_status?: AttendanceStatus;
  verification_method?: VerificationMethod;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface BulkAttendanceRecord {
  student_id: number;
  attendance_status: AttendanceStatus;
  note?: string | null;
}

export interface AttendanceSummary {
  session_id: number;
  total_students: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_rate: number;
}

// ─── Student Self Check-in (Public — no auth) ─────────────────────────────────────
export interface StudentCheckInPayload {
  attendance_session_id: number;
  qr_token?: string | null;
  student_code?: string | null;
  student_id?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  note?: string | null;
}

// ─── HQNhat API Types ─────────────────────────────────────────────────────
// TypeScript types derived from the HQNhat OpenAPI spec
// (https://api.hqnhat.id.vn/docs?api-docs.json)

export interface HqnhatMajor {
  id: number;
  department_id: number;
  code: string;
  name: string;
  degree_level: number; // 1: Đại học, 2: Thạc sĩ, 3: Tiến sĩ
  description: string | null;
  status: number; // 1: DRAFT, 2: PENDING, 3: PUBLISHED, 4: ARCHIVED
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface HqnhatSpecialization {
  id: number;
  major_id: number;
  code: string;
  name: string;
  description: string | null;
  status: number; // 0: inactive, 1: active
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface HqnhatTrainingSystem {
  id: number;
  code: string;
  name: string;
  description: string | null;
  status: number; // 0: inactive, 1: active
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

// ─── Response envelope ────────────────────────────────────────────────────
export interface HqnhatPaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface HqnhatListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: HqnhatPaginationMeta;
}

export interface HqnhatDetailResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Query parameter types ────────────────────────────────────────────────
export interface HqnhatMajorListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  department_id?: number;
  code?: string;
  name?: string;
  degree_level?: number;
  status?: 1 | 2 | 3 | 4;
  include_deleted?: boolean;
}

export interface HqnhatSpecializationListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  major_id?: number;
  code?: string;
  name?: string;
  status?: 0 | 1;
}

export interface HqnhatTrainingSystemListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  code?: string;
  name?: string;
  status?: 0 | 1;
}

export interface HqnhatMajorCreatePayload {
  department_id: number;
  code: string;
  name: string;
  degree_level: number; // 1: Đại học, 2: Thạc sĩ, 3: Tiến sĩ
  description: string;
  status: 0 | 1; // 0: INACTIVE, 1: ACTIVE
}

export interface HqnhatSpecializationCreatePayload {
  major_id: number;
  code: string;
  name: string;
  description: string;
  status: 0 | 1;
}

export interface HqnhatTrainingSystemCreatePayload {
  code: string;
  name: string;
  description?: string;
  status: 0 | 1;
}

// ══════════════════════════════════════════════════════════════════════════
// ACADEMIC TERMS (Học kỳ)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatAcademicTerm {
  id: number;
  code: string; // VD: "HK1_2023_2024"
  academic_year: string; // VD: "2023-2024"
  semester: number; // 1, 2, 3 (hè)
  start_date: string | null; // YYYY-MM-DD
  end_date: string | null; // YYYY-MM-DD
  registration_start: string | null;
  registration_end: string | null;
  status: number; // 0: PLANNING, 1: REGISTRATION, 2: STUDYING, 3: FINISHED
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface HqnhatAcademicTermListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  code?: string;
  academic_year?: string;
  semester?: number;
  status?: 0 | 1 | 2 | 3;
  include_deleted?: boolean;
}

export interface HqnhatAcademicTermCreatePayload {
  code: string;
  academic_year: string;
  semester: number;
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  status?: 0 | 1 | 2 | 3;
}

// ══════════════════════════════════════════════════════════════════════════
// CURRICULUMS (Chương trình đào tạo)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatCurriculum {
  id: number;
  code: string;
  name: string;
  major_id: number | string;
  specialization_id: number | string | null;
  training_system_id: number | string;
  course_id: number | string;
  total_credit: number | string;
  elective_credit: number | string;
  description: string | null;
  status: number; // 0: INACTIVE, 1: ACTIVE
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface HqnhatCurriculumListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  code?: string;
  name?: string;
  major_id?: number;
  training_system_id?: number;
  status?: 0 | 1;
}

export interface HqnhatCurriculumCreatePayload {
  code: string;
  name: string;
  major_id: number | string;
  specialization_id?: number | string | null;
  training_system_id: number | string;
  course_id: number | string;
  total_credit: number | string;
  elective_credit?: number | string;
  description?: string;
  status?: 0 | 1;
}

// ══════════════════════════════════════════════════════════════════════════
// COURSES (Khóa học / Khóa sinh viên)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatCourse {
  id: number;
  code: string; // VD: "K67"
  name: string; // VD: "Khóa 67"
  start_year: number; // VD: 2022
  end_year: number; // VD: 2026
  description: string | null;
  status: number; // 0: inactive, 1: active
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface HqnhatCourseListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  code?: string;
  name?: string;
  start_year?: number;
  end_year?: number;
  status?: 0 | 1;
}

export interface HqnhatCourseCreatePayload {
  code: string;
  name: string;
  start_year: number;
  end_year: number;
  description: string;
  status: 0 | 1;
}

// ══════════════════════════════════════════════════════════════════════════
// SUBJECT TYPES (Nhóm môn học)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatSubjectType {
  id: number;
  code: string; // VD: "TYPE_A"
  name: string; // VD: "Nhóm môn đại cương"
  description: string | null;
  status: number; // 0: inactive, 1: active
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface HqnhatSubjectTypeListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  code?: string;
  name?: string;
  status?: 0 | 1;
}

export interface HqnhatSubjectTypeCreatePayload {
  code: string;
  name: string;
  description?: string;
  status: 0 | 1;
}

// ══════════════════════════════════════════════════════════════════════════
// SUBJECTS (Môn học)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatSubject {
  id: number;
  code: string; // VD: "IT101"
  name: string;
  subject_type_id: number;
  credit: number;
  theory_hours: number;
  practice_hours: number;
  lab_hours: number;
  description: string | null;
  status: number; // 0: inactive, 1: active
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface HqnhatSubjectListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  code?: string;
  name?: string;
  subject_type_id?: number;
  status?: 0 | 1;
}

export interface HqnhatSubjectCreatePayload {
  code: string;
  name: string;
  subject_type_id: number;
  credit: number;
  theory_hours: number;
  practice_hours: number;
  lab_hours: number;
  description?: string;
  status: 0 | 1;
}

// ══════════════════════════════════════════════════════════════════════════
// CURRICULUM SUBJECTS (Môn học trong CTĐT - quan hệ N-N)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatCurriculumSubject {
  id: number;
  curriculum_id: number | string;
  subject_id: number | string;
  semester: number | null;
  year_no: number | null;
  display_order: number | null;
  is_capstone: boolean | null;
  is_internship: boolean | null;
  is_required: boolean | null;
  elective_group: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HqnhatCurriculumSubjectListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  curriculum_id?: number | string;
  subject_id?: number | string;
  semester?: number;
  year_no?: number;
}

export interface HqnhatCurriculumSubjectCreatePayload {
  curriculum_id: number | string;
  subject_id: number | string;
  semester?: number | null;
  year_no?: number | null;
  display_order?: number | null;
  is_capstone?: boolean | null;
  is_internship?: boolean | null;
  is_required?: boolean | null;
  elective_group?: string | null;
}

export interface HqnhatCurriculumSubjectUpdatePayload {
  curriculum_id: number | string;
  subject_id: number | string;
  semester?: number | null;
  year_no?: number | null;
  display_order?: number | null;
  is_capstone?: boolean | null;
  is_internship?: boolean | null;
  is_required?: boolean | null;
  elective_group?: string | null;
}

// ══════════════════════════════════════════════════════════════════════════
// SUBJECT PREREQUISITES (Tiên quyết học phần)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatSubjectPrerequisite {
  id: number;
  subject_id: number;
  prerequisite_subject_id: number;
  type: number; // 1: prerequisite, 2: corequisite
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HqnhatSubjectPrerequisiteListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  subject_id?: number;
  prerequisite_subject_id?: number;
  type?: 1 | 2;
}

export interface HqnhatSubjectPrerequisiteCreatePayload {
  subject_id: number;
  prerequisite_subject_id: number;
  type: 1 | 2;
}

// ══════════════════════════════════════════════════════════════════════════
// SUBJECT CONDITIONS (Điều kiện học phần)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatSubjectCondition {
  id: number;
  subject_id: number;
  min_gpa: number | string | null;
  min_completed_credit: number | string | null;
  max_failed_subject: number | string | null;
  note: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HqnhatSubjectConditionListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  subject_id?: number;
}

export interface HqnhatSubjectConditionCreatePayload {
  subject_id: number;
  min_gpa?: number | null;
  min_completed_credit?: number | null;
  max_failed_subject?: number | null;
  note?: string | null;
}

// ══════════════════════════════════════════════════════════════════════════
// ADMISSION BATCHES (Đợt tuyển sinh)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatAdmissionBatch {
  id: number;
  code: string;
  name: string;
  year: number;
  start_date: string;
  end_date: string;
  status: number; // 0: INACTIVE, 1: ACTIVE
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface HqnhatAdmissionBatchListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  code?: string;
  name?: string;
  year?: number;
  status?: 0 | 1;
  include_deleted?: boolean;
}

export interface HqnhatAdmissionBatchCreatePayload {
  code: string;
  name: string;
  year: number;
  start_date: string;
  end_date: string;
  status: 0 | 1;
}

// ══════════════════════════════════════════════════════════════════════════
// ADMISSION STUDENTS (Thí sinh trúng tuyển)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatAdmissionStudent {
  id: number;
  batch_id: number;
  training_system_id: number;
  course_id: number;
  candidate_code: string;
  full_name: string;
  gender: number; // 1: MALE, 2: FEMALE, 3: OTHER
  date_of_birth: string | null;
  citizen_id: string | null;
  phone: string | null;
  email: string | null;
  major_id: number | null;
  admission_score: number | null;
  status: number; // 0: PENDING, 1: ACCEPTED, 2: ENROLLED, 3: CANCELLED
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface HqnhatAdmissionStudentListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  candidate_code?: string;
  full_name?: string;
  citizen_id?: string;
  phone?: string;
  email?: string;
  batch_id?: number;
  training_system_id?: number;
  course_id?: number;
  major_id?: number;
  gender?: 1 | 2 | 3;
  status?: 0 | 1 | 2 | 3;
  include_deleted?: boolean;
}

export interface HqnhatAdmissionStudentCreatePayload {
  batch_id: number;
  training_system_id: number;
  course_id: number;
  candidate_code: string;
  full_name: string;
  gender: 1 | 2 | 3;
  date_of_birth?: string;
  citizen_id?: string;
  phone?: string;
  email?: string;
  major_id?: number;
  admission_score?: number;
  status?: 0 | 1 | 2 | 3;
}

// ══════════════════════════════════════════════════════════════════════════
// STUDENT STATUS HISTORIES (Lịch sử trạng thái sinh viên)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatStudentStatusHistory {
  id: number;
  student_id: number;
  status: number; // 1: STUDYING, 2: RESERVED, 3: DROPPED, 4: GRADUATED, 5: TRANSFERRED_MAJOR, 6: TRANSFERRED_CLASS
  effective_date: string; // YYYY-MM-DD
  decision_no: string | null;
  decision_date: string | null;
  reason: string | null;
  note: string | null;
  created_by: number | null;
  created_at?: string | null;
}

export interface HqnhatStudentStatusHistoryListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  student_id?: number;
  status?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface HqnhatStudentStatusHistoryCreatePayload {
  student_id: number;
  status: 1 | 2 | 3 | 4 | 5 | 6;
  effective_date: string;
  decision_no?: string;
  decision_date?: string;
  reason?: string;
  note?: string;
}

// ══════════════════════════════════════════════════════════════════════════
// STUDENT RESERVATIONS (Bảo lưu)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatStudentReservation {
  id: number;
  student_id: number;
  from_date: string; // YYYY-MM-DD
  to_date: string; // YYYY-MM-DD
  semester_from_id: number | null;
  semester_to_id: number | null;
  decision_no: string | null;
  decision_date: string | null;
  reason: string | null;
  status: number; // 1: approved, 2: cancelled
  created_by: number | null;
  created_at?: string | null;
}

export interface HqnhatStudentReservationListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  student_id?: number;
  status?: 1 | 2;
}

export interface HqnhatStudentReservationCreatePayload {
  student_id: number;
  from_date: string;
  to_date: string;
  semester_from_id?: number;
  semester_to_id?: number;
  decision_no?: string;
  decision_date?: string;
  reason?: string;
  status?: 1 | 2;
}

// ══════════════════════════════════════════════════════════════════════════
// STUDENT DROPOUTS (Thôi học)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatStudentDropout {
  id: number;
  student_id: number;
  dropout_date: string; // YYYY-MM-DD
  decision_no: string | null;
  decision_date: string | null;
  reason: string | null;
  status: number; // 1: approved, 2: cancelled
  created_by: number | null;
  created_at?: string | null;
}

export interface HqnhatStudentDropoutListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  student_id?: number;
  status?: 1 | 2;
}

export interface HqnhatStudentDropoutCreatePayload {
  student_id: number;
  dropout_date: string;
  decision_no?: string;
  decision_date?: string;
  reason?: string;
  status?: 1 | 2;
}

// ══════════════════════════════════════════════════════════════════════════
// STUDENT MAJOR CHANGES (Chuyển ngành)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatStudentMajorChange {
  id: number;
  student_id: number;
  from_major_id: number | null;
  to_major_id: number;
  from_specialization_id: number | null;
  to_specialization_id: number | null;
  effective_date: string; // YYYY-MM-DD
  decision_no: string | null;
  decision_date: string | null;
  reason: string | null;
  created_by: number | null;
  created_at?: string | null;
}

export interface HqnhatStudentMajorChangeListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  student_id?: number;
  from_major_id?: number;
  to_major_id?: number;
}

export interface HqnhatStudentMajorChangeCreatePayload {
  student_id: number;
  from_major_id?: number;
  to_major_id: number;
  from_specialization_id?: number;
  to_specialization_id?: number;
  effective_date: string;
  decision_no?: string;
  decision_date?: string;
  reason?: string;
}

// ══════════════════════════════════════════════════════════════════════════
// STUDENT CLASS CHANGES (Chuyển lớp)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatStudentClassChange {
  id: number;
  student_id: number;
  from_class_id: number | null;
  to_class_id: number;
  effective_date: string; // YYYY-MM-DD
  decision_date: string | null;
  decision_no: string | null;
  reason: string | null;
  created_by: number | null;
  created_at?: string | null;
}

export interface HqnhatStudentClassChangeListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  student_id?: number;
  from_class_id?: number;
  to_class_id?: number;
}

export interface HqnhatStudentClassChangeCreatePayload {
  student_id: number;
  from_class_id?: number;
  to_class_id: number;
  effective_date: string;
  decision_date?: string;
  decision_no?: string;
  reason?: string;
}
export interface HqnhatStudent {
  id: number;
  user_id: number | null;
  student_code: string;
  admission_student_id: number | null;
  class_id: number | null;
  major_id: number;
  specialization_id: number | null;
  training_system_id: number;
  course_id: number;
  enrollment_date: string | null;
  full_name: string;
  gender: number | null; // 1: MALE, 2: FEMALE, 3: OTHER
  date_of_birth: string | null;
  citizen_id: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  avatar: string | null;
  status: number; // 1: STUDYING, 2: RESERVED, 3: GRADUATED, 4: DROPPED, 5: TRANSFERRED
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface HqnhatStudentListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  student_code?: string;
  full_name?: string;
  major_id?: number;
  class_id?: number;
  training_system_id?: number;
  course_id?: number;
  status?: 1 | 2 | 3 | 4 | 5;
  include_deleted?: boolean;
}

export interface HqnhatStudentCreatePayload {
  user_id?: number;
  admission_student_id?: number;
  class_id?: number;
  major_id: number;
  specialization_id?: number;
  training_system_id: number;
  course_id: number;
  enrollment_date?: string;
  full_name: string;
  gender?: 1 | 2 | 3;
  date_of_birth?: string;
  citizen_id?: string;
  phone?: string;
  email?: string;
  address?: string;
  avatar?: string;
  status: 1 | 2 | 3 | 4 | 5;
}

// ══════════════════════════════════════════════════════════════════════════
// COURSE SECTIONS (Lớp học phần)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatCourseSection {
  id: number;
  subject_id: number;
  academic_term_id: number;
  section_code: string;
  section_type: number; // 1: THEORY, 2: PRACTICE, 3: LAB, 4: PROJECT
  max_students: number;
  current_students: number;
  registration_start: string | null; // date-time
  registration_end: string | null; // date-time
  status: number; // 0: DRAFT, 1: OPEN, 2: CLOSED, 3: CANCELLED
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HqnhatCourseSectionListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  subject_id?: number;
  academic_term_id?: number;
  section_code?: string;
  section_type?: 1 | 2 | 3 | 4;
  status?: 0 | 1 | 2 | 3;
}

export interface HqnhatCourseSectionCreatePayload {
  subject_id: number;
  academic_term_id: number;
  section_code: string;
  section_type: 1 | 2 | 3 | 4;
  max_students: number;
  current_students?: number;
  registration_start?: string;
  registration_end?: string;
  status: 0 | 1 | 2 | 3;
}

// ══════════════════════════════════════════════════════════════════════════
// CLASS SCHEDULES (Thời khóa biểu)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatClassSchedule {
  id: number;
  course_section_id: number;
  lecturer_id: number;
  room_id: number;
  day_of_week: number; // 1: T2 ... 7: CN
  lesson_from: number;
  lesson_to: number;
  start_date: string | null; // date
  end_date: string | null; // date
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HqnhatClassScheduleListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  course_section_id?: number;
  lecturer_id?: number;
  room_id?: number;
  day_of_week?: number;
}

export interface HqnhatClassScheduleCreatePayload {
  course_section_id: number;
  lecturer_id: number;
  room_id: number;
  day_of_week: number;
  lesson_from: number;
  lesson_to: number;
  start_date?: string;
  end_date?: string;
}

// ══════════════════════════════════════════════════════════════════════════
// SCHEDULE CHANGES (Lịch sử thay đổi lịch học)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatScheduleChange {
  id: number;
  schedule_id: number;
  old_room_id: number | null;
  new_room_id: number | null;
  old_lecturer_id: number | null;
  new_lecturer_id: number | null;
  old_date: string | null;
  new_date: string | null;
  reason: string | null;
  status: number; // 0: pending, 1: approved, 2: rejected
  created_by: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HqnhatScheduleChangeListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  schedule_id?: number;
  status?: 0 | 1 | 2;
}

export interface HqnhatScheduleChangeCreatePayload {
  schedule_id: number;
  new_room_id?: number;
  new_lecturer_id?: number;
  new_date?: string;
  reason?: string;
}

// ══════════════════════════════════════════════════════════════════════════
// COURSE REGISTRATIONS (Đăng ký học phần của sinh viên)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatCourseRegistration {
  id: number;
  student_id: number;
  course_section_id: number;
  registered_at: string | null; // date-time
  cancelled_at: string | null; // date-time
  status: number; // 1: registered, 2: cancelled
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HqnhatCourseRegistrationListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  student_id?: number;
  course_section_id?: number;
  status?: 1 | 2;
}

export interface HqnhatCourseRegistrationCreatePayload {
  student_id: number;
  course_section_id: number;
  status?: 1 | 2;
}

// ══════════════════════════════════════════════════════════════════════════
// CLASSES (Lớp hành chính)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatClass {
  id: number;
  code: string;
  name: string;
  major_id: number;
  specialization_id: number | null;
  course_id: number;
  advisor_id: number | null;
  status: number; // 0: INACTIVE, 1: ACTIVE
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface HqnhatClassListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  code?: string;
  name?: string;
  major_id?: number;
  course_id?: number;
  status?: 0 | 1;
}

export interface HqnhatClassCreatePayload {
  code: string;
  name: string;
  major_id: number;
  course_id: number;
  specialization_id?: number | null;
  advisor_id?: number | null;
  status: 0 | 1;
}

// ══════════════════════════════════════════════════════════════════════════
// ACADEMIC WARNINGS (Cảnh báo học vụ)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatAcademicWarning {
  id: number;
  student_id: number;
  academic_term_id: number;
  warning_type: number; // 1: LOW_GPA, 2: FAILED_SUBJECT, 3: INSUFFICIENT_CREDIT, 4: ACADEMIC_WARNING
  warning_level: number;
  description: string | null;
  resolved_at: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HqnhatAcademicWarningListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  student_id?: number;
  academic_term_id?: number;
  warning_type?: 1 | 2 | 3 | 4;
}

export interface HqnhatAcademicWarningCreatePayload {
  student_id: number;
  academic_term_id: number;
  warning_type: 1 | 2 | 3 | 4;
  warning_level: number;
  description?: string;
}

export interface HqnhatAcademicWarningUpdatePayload {
  student_id?: number;
  academic_term_id?: number;
  warning_type?: 1 | 2 | 3 | 4;
  warning_level?: number;
  description?: string;
  resolved_at?: string | null;
}

// ══════════════════════════════════════════════════════════════════════════
// STUDENT GRADES (Điểm sinh viên)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatStudentGrade {
  id: number;
  course_registration_id: number;
  attendance_score: number | null;
  assignment_score: number | null;
  midterm_score: number | null;
  final_score: number | null;
  total_score: number | null;
  letter_grade: string | null;
  grade_point: number | null;
  is_pass: boolean | null;
  is_locked: boolean;
  locked_at: string | null;
  locked_by: number | null;
}

export interface HqnhatStudentGradeListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  course_registration_id?: number;
  course_section_id?: number;
  student_id?: number;
  is_pass?: boolean;
  is_locked?: boolean;
}

export interface HqnhatStudentGradeUpdatePayload {
  attendance_score?: number | null;
  assignment_score?: number | null;
  midterm_score?: number | null;
  final_score?: number | null;
  total_score?: number | null;
  is_locked?: boolean;
}

export interface HqnhatStudentGradeBulkUpdatePayload {
  grades: Array<{
    id: number;
    attendance_score?: number;
    midterm_score?: number;
    final_score?: number;
    total_score?: number;
  }>;
}

// ══════════════════════════════════════════════════════════════════════════
// GPA HISTORIES (Lịch sử điểm GPA)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatGpaHistory {
  id: number;
  student_id: number;
  academic_term_id: number;
  registered_credit: number;
  earned_credit: number;
  accumulated_credit: number;
  semester_gpa: number;
  cumulative_gpa: number;
  academic_rank: number; // 1: EXCELLENT, 2: VERY_GOOD, 3: GOOD, 4: AVERAGE, 5: WEAK, 6: POOR
}

export interface HqnhatGpaHistoryListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  student_id?: number;
  academic_term_id?: number;
  academic_rank?: 1 | 2 | 3 | 4 | 5 | 6;
}

// ══════════════════════════════════════════════════════════════════════════
// STUDENT LOGS (Nhật ký sinh viên)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatStudentLog {
  id: number;
  student_id: number;
  action: string;
  reference_type: string | null;
  reference_id: number | null;
  description: string | null;
  created_by: number | null;
  created_at: string | null;
}

export interface HqnhatStudentLogListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  student_id?: number;
  action?: string;
  reference_type?: string;
  reference_id?: number;
  created_by?: number;
}

// ══════════════════════════════════════════════════════════════════════════
// STUDENT PROFILES (Hồ sơ sinh viên)
// ══════════════════════════════════════════════════════════════════════════
export interface HqnhatStudentProfile {
  id: number;
  student_id: number;
  father_name: string | null;
  mother_name: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  nationality: string | null;
  ethnicity: string | null;
  religion: string | null;
  insurance_number: string | null;
  bank_name: string | null;
  bank_account: string | null;
}

export interface HqnhatStudentProfileUpdatePayload {
  father_name?: string | null;
  mother_name?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  nationality?: string | null;
  ethnicity?: string | null;
  religion?: string | null;
  insurance_number?: string | null;
  bank_name?: string | null;
  bank_account?: string | null;
}
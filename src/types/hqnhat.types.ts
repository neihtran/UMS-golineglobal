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
  min_gpa: number;
  min_completed_credit: number;
  max_failed_subject: number;
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
  min_gpa: number;
  min_completed_credit: number;
  max_failed_subject: number;
  note?: string;
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
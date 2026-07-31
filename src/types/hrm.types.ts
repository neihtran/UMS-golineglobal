// ─── HRM Module Types ─────────────────────────────────────────────────────────

// ─── Master Data Types ────────────────────────────────────────────────────────

export interface AcademicRank {
  id: number;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
  status: number; // 0: INACTIVE, 1: ACTIVE
  created_at?: string;
  updated_at?: string;
}

export interface AcademicRankCreatePayload {
  code: string;
  name: string;
  description?: string | null;
  sort_order?: number;
  status?: number;
}

export interface AcademicRankListParams {
  code?: string;
  name?: string;
  status?: number;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface Position {
  id: number;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
  status: number; // 0: INACTIVE, 1: ACTIVE
  created_at?: string;
  updated_at?: string;
}

export interface PositionCreatePayload {
  code: string;
  name: string;
  description?: string | null;
  sort_order?: number;
  status?: number;
}

export interface PositionListParams {
  code?: string;
  name?: string;
  status?: number;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── Employee Profile Types ────────────────────────────────────────────────────

export interface EmployeeProfile {
  id: number;
  employee_code: string;
  full_name: string;
  user_id: number | null;
  department_id: number | null;
  position_id: number | null;
  academic_rank_id: number | null;
  employee_type: string; // lecturer | staff | manager | researcher | visiting_lecturer
  employment_type: string; // full_time | part_time | contract
  join_date: string | null;
  official_date: string | null;
  contract_start: string | null;
  contract_end: string | null;
  status: string; // active | inactive | suspended | resigned | retired
  phone: string | null;
  personal_email: string | null;
  work_email: string | null;
  birthday: string | null;
  gender: number; // 1: MALE, 2: FEMALE, 3: OTHER
  marital_status: string | null;
  nationality: string | null;
  ethnicity: string | null;
  religion: string | null;
  identity_no: string | null;
  identity_issue_date: string | null;
  identity_issue_place: string | null;
  tax_code: string | null;
  social_insurance_no: string | null;
  address: string | null;
  note: string | null;
  created_at?: string;
  updated_at?: string;
  // Related data (from API includes)
  department?: {
    id: number;
    name: string;
    code?: string;
  };
  position?: {
    id: number;
    name: string;
    code?: string;
  };
  academic_rank?: {
    id: number;
    name: string;
    code?: string;
  };
}

export interface EmployeeProfileCreatePayload {
  employee_code: string;
  full_name: string;
  department_id?: number | null;
  position_id?: number | null;
  academic_rank_id?: number | null;
  employee_type: string;
  employment_type: string;
  join_date?: string | null;
  official_date?: string | null;
  contract_start?: string | null;
  contract_end?: string | null;
  status?: string;
  phone?: string | null;
  personal_email?: string | null;
  work_email?: string | null;
  birthday?: string | null;
  gender: number;
  marital_status?: string | null;
  nationality?: string | null;
  ethnicity?: string | null;
  religion?: string | null;
  identity_no?: string | null;
  identity_issue_date?: string | null;
  identity_issue_place?: string | null;
  tax_code?: string | null;
  social_insurance_no?: string | null;
  address?: string | null;
  note?: string | null;
}

export interface EmployeeProfileListParams {
  employee_code?: string;
  full_name?: string;
  user_id?: number;
  department_id?: number;
  position_id?: number;
  academic_rank_id?: number;
  employee_type?: string;
  employment_type?: string;
  status?: string;
  gender?: number;
  work_email?: string;
  phone?: string;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── Related Entity Types ──────────────────────────────────────────────────────

export interface Degree {
  id: number;
  employee_id: number;
  degree_name: string;
  major: string | null;
  school: string | null;
  country: string | null;
  graduation_year: number | null;
  classification: string | null;
  file_path: string | null;
  note: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DegreeCreatePayload {
  employee_id: number;
  degree_name: string;
  major?: string | null;
  school?: string | null;
  country?: string | null;
  graduation_year?: number | null;
  classification?: string | null;
  file_path?: string | null;
  note?: string | null;
}

export interface DegreeListParams {
  employee_id?: number;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface Certificate {
  id: number;
  employee_id: number;
  certificate_name: string;
  organization: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  certificate_no: string | null;
  file_path: string | null;
  note: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CertificateCreatePayload {
  employee_id: number;
  certificate_name: string;
  organization?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  certificate_no?: string | null;
  file_path?: string | null;
  note?: string | null;
}

export interface CertificateListParams {
  employee_id?: number;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface TrainingHistory {
  id: number;
  employee_id: number;
  school: string | null;
  program: string | null;
  major: string | null;
  degree: string | null;
  country: string | null;
  start_date: string | null;
  end_date: string | null;
  result: string | null; // excellent | good | fair | average | pass | fail | completed | in_progress
  file_path: string | null;
  note: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TrainingHistoryCreatePayload {
  employee_id: number;
  school?: string | null;
  program?: string | null;
  major?: string | null;
  degree?: string | null;
  country?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  result?: string | null;
  file_path?: string | null;
  note?: string | null;
}

export interface TrainingHistoryListParams {
  employee_id?: number;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface WorkHistory {
  id: number;
  employee_id: number;
  organization: string | null;
  department: string | null;
  position: string | null;
  start_date: string | null;
  end_date: string | null;
  job_description: string | null;
  reason_leave: string | null;
  note: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WorkHistoryCreatePayload {
  employee_id: number;
  organization?: string | null;
  department?: string | null;
  position?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  job_description?: string | null;
  reason_leave?: string | null;
  note?: string | null;
}

export interface WorkHistoryListParams {
  employee_id?: number;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── Work Assignment Types ─────────────────────────────────────────────────────

export interface TeachingAssignment {
  id: number;
  lecturer_id: number;
  course_section_id: number | null;
  teaching_type: string | null; // THEORY | PRACTICE | LAB
  credit: number | null;
  teaching_hours: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string; // PENDING | APPROVED | REJECTED | CANCELLED
  note: string | null;
  created_at?: string;
  updated_at?: string;
  // Related
  lecturer?: {
    id: number;
    full_name: string;
    employee_code?: string;
  };
  course_section?: {
    id: number;
    course_name?: string;
    course_code?: string;
  };
}

export interface TeachingAssignmentCreatePayload {
  lecturer_id: number;
  course_section_id?: number | null;
  teaching_type?: string | null;
  credit?: number | null;
  teaching_hours?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string;
  note?: string | null;
}

export interface TeachingAssignmentListParams {
  lecturer_id?: number;
  course_section_id?: number;
  course_code?: string;
  academic_term_id?: number;
  status?: string;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface AdvisorAssignment {
  id: number;
  lecturer_id: number;
  class_id: number | null;
  academic_term_id: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string; // ACTIVE | INACTIVE
  note: string | null;
  created_at?: string;
  updated_at?: string;
  // Related
  lecturer?: {
    id: number;
    full_name: string;
    employee_code?: string;
  };
  class?: {
    id: number;
    name?: string;
    code?: string;
  };
  academic_term?: {
    id: number;
    name?: string;
    code?: string;
  };
}

export interface AdvisorAssignmentCreatePayload {
  lecturer_id: number;
  class_id?: number | null;
  academic_term_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string;
  note?: string | null;
}

export interface AdvisorAssignmentListParams {
  lecturer_id?: number;
  class_id?: number;
  class_code?: string;
  academic_term_id?: number;
  status?: string;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface InternshipSupervision {
  id: number;
  lecturer_id: number;
  student_id: number | null;
  company_id: number | null;
  academic_term_id: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string; // ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED
  note: string | null;
  created_at?: string;
  updated_at?: string;
  // Related
  lecturer?: {
    id: number;
    full_name: string;
    employee_code?: string;
  };
  student?: {
    id: number;
    full_name?: string;
    student_code?: string;
  };
  company?: {
    id: number;
    name?: string;
  };
  academic_term?: {
    id: number;
    name?: string;
  };
}

export interface InternshipSupervisionCreatePayload {
  lecturer_id: number;
  student_id?: number | null;
  company_id?: number | null;
  academic_term_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string;
  note?: string | null;
}

export interface InternshipSupervisionListParams {
  lecturer_id?: number;
  student_id?: number;
  academic_term_id?: number;
  status?: string;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface ThesisSupervision {
  id: number;
  lecturer_id: number;
  student_id: number | null;
  graduation_project_id: number | null;
  academic_term_id: number | null;
  role: string | null; // MAIN | CO
  status: string; // ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED
  note: string | null;
  created_at?: string;
  updated_at?: string;
  // Related
  lecturer?: {
    id: number;
    full_name: string;
    employee_code?: string;
  };
  student?: {
    id: number;
    full_name?: string;
    student_code?: string;
  };
  graduation_project?: {
    id: number;
    title?: string;
  };
  academic_term?: {
    id: number;
    name?: string;
  };
}

export interface ThesisSupervisionCreatePayload {
  lecturer_id: number;
  student_id?: number | null;
  graduation_project_id?: number | null;
  academic_term_id?: number | null;
  role?: string | null;
  status?: string;
  note?: string | null;
}

export interface ThesisSupervisionListParams {
  lecturer_id?: number;
  student_id?: number;
  academic_term_id?: number;
  status?: string;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── Exam Invigilation Types (Coi thi) ─────────────────────────────────────────

export interface ExamInvigilation {
  id: number;
  lecturer_id: number;
  exam_schedule_id: number;
  role: string; // MAIN | ASSISTANT
  start_time: string | null;
  end_time: string | null;
  status: string; // ASSIGNED | CONFIRMED | COMPLETED | CANCELLED
  note: string | null;
  created_at?: string;
  updated_at?: string;
  // Related data
  lecturer?: {
    id: number;
    full_name: string;
    employee_code: string;
  };
  exam_schedule?: {
    id: number;
    code: string;
    exam_date: string;
    start_time: string;
    end_time: string;
  };
}

export interface ExamInvigilationCreatePayload {
  lecturer_id: number;
  exam_schedule_id: number;
  role?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  note?: string | null;
}

export interface ExamInvigilationListParams {
  lecturer_id?: number;
  exam_schedule_id?: number;
  role?: string;
  status?: string;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── Exam Marking Types (Chấm thi) ─────────────────────────────────────────────

export interface ExamMarking {
  id: number;
  lecturer_id: number;
  exam_schedule_id: number;
  number_of_scripts: number;
  deadline: string | null;
  status: string; // ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED
  note: string | null;
  created_at?: string;
  updated_at?: string;
  // Related data
  lecturer?: {
    id: number;
    full_name: string;
    employee_code: string;
  };
  exam_schedule?: {
    id: number;
    code: string;
    exam_date: string;
    start_time: string;
    end_time: string;
  };
}

export interface ExamMarkingCreatePayload {
  lecturer_id: number;
  exam_schedule_id: number;
  number_of_scripts?: number;
  deadline?: string;
  status?: string;
  note?: string | null;
}

export interface ExamMarkingListParams {
  lecturer_id?: number;
  exam_schedule_id?: number;
  status?: string;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── Common Response Types ─────────────────────────────────────────────────────

export interface HrmListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface HrmDetailResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

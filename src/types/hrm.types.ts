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

// ─── Part 3: Work Schedules (Ca làm việc) ─────────────────────────────────────

export interface WorkSchedule {
  id: number;
  code: string;
  name: string;
  start_time: string | null; // HH:mm:ss
  end_time: string | null;
  break_start: string | null;
  break_end: string | null;
  working_hours: number | null;
  late_after: number | null; // phút
  early_leave_before: number | null; // phút
  status: number; // 0: INACTIVE, 1: ACTIVE
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WorkScheduleCreatePayload {
  code: string;
  name: string;
  start_time?: string | null;
  end_time?: string | null;
  break_start?: string | null;
  break_end?: string | null;
  working_hours?: number | null;
  late_after?: number | null;
  early_leave_before?: number | null;
  status?: number;
  description?: string | null;
}

export interface WorkScheduleListParams {
  code?: string;
  name?: string;
  status?: number;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── Part 3: Employee Schedules (Lịch làm việc nhân viên) ──────────────────────

export interface EmployeeSchedule {
  id: number;
  employee_id: number;
  schedule_id: number;
  working_date: string; // YYYY-MM-DD
  note: string | null;
  created_at?: string;
  updated_at?: string;
  // Related
  employee?: {
    id: number;
    full_name: string;
    employee_code: string;
  };
  schedule?: {
    id: number;
    code: string;
    name: string;
  };
}

export interface EmployeeScheduleCreatePayload {
  employee_id: number;
  schedule_id: number;
  working_date: string;
  note?: string | null;
}

export interface EmployeeScheduleListParams {
  employee_id?: number;
  schedule_id?: number;
  working_date?: string;
  start_date?: string;
  end_date?: string;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── Part 3: Attendances (Chấm công) ──────────────────────────────────────────

export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'holiday' | 'remote';

export interface Attendance {
  id: number;
  employee_id: number;
  schedule_id: number | null;
  attendance_date: string; // YYYY-MM-DD
  check_in: string | null; // HH:mm:ss
  check_out: string | null;
  working_minutes: number | null;
  late_minutes: number | null;
  early_leave_minutes: number | null;
  overtime_minutes: number | null;
  attendance_status: AttendanceStatus;
  remark: string | null;
  created_at?: string;
  updated_at?: string;
  // Related
  employee?: {
    id: number;
    full_name: string;
    employee_code: string;
  };
  schedule?: {
    id: number;
    code: string;
    name: string;
  };
}

export interface AttendanceCreatePayload {
  employee_id: number;
  attendance_date: string;
  schedule_id?: number | null;
  check_in?: string | null;
  check_out?: string | null;
  working_minutes?: number | null;
  late_minutes?: number | null;
  early_leave_minutes?: number | null;
  overtime_minutes?: number | null;
  attendance_status?: AttendanceStatus;
  remark?: string | null;
}

export interface AttendanceListParams {
  employee_id?: number;
  schedule_id?: number;
  attendance_date?: string;
  start_date?: string;
  end_date?: string;
  attendance_status?: AttendanceStatus;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── Part 3: Attendance Logs (Lịch sử check-in/out) ───────────────────────────

export type AttendanceLogAction = 'check_in' | 'check_out';
export type AttendanceLogDeviceType = 'web' | 'mobile' | 'face' | 'fingerprint' | 'card';

export interface AttendanceLog {
  id: number;
  attendance_id: number;
  employee_id: number;
  action: AttendanceLogAction;
  device_type: AttendanceLogDeviceType;
  device_id: string;
  device_name: string | null;
  ip_address: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_path: string | null;
  created_at?: string;
  // Related
  employee?: {
    id: number;
    full_name: string;
    employee_code: string;
  };
  attendance?: {
    id: number;
    attendance_date: string;
  };
}

export interface AttendanceLogCreatePayload {
  attendance_id: number;
  employee_id: number;
  device_id: string;
  action?: AttendanceLogAction;
  device_type?: AttendanceLogDeviceType;
  device_name?: string | null;
  ip_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  photo_path?: string | null;
}

export interface AttendanceLogListParams {
  attendance_id?: number;
  employee_id?: number;
  action?: AttendanceLogAction;
  device_type?: AttendanceLogDeviceType;
  device_id?: string;
  start_date?: string;
  end_date?: string;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── Part 3: Leave Types (Danh mục loại nghỉ) ─────────────────────────────────

export interface LeaveType {
  id: number;
  code: string;
  name: string;
  is_paid: boolean; // true: paid, false: unpaid
  max_days: number | null;
  description: string | null;
  status: number; // 0: INACTIVE, 1: ACTIVE
  created_at?: string;
  updated_at?: string;
}

export interface LeaveTypeCreatePayload {
  code: string;
  name: string;
  is_paid?: boolean;
  max_days?: number | null;
  description?: string | null;
  status?: number;
}

export interface LeaveTypeListParams {
  code?: string;
  name?: string;
  is_paid?: boolean;
  status?: number;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── Part 3: Leave Requests (Đơn nghỉ phép) ──────────────────────────────────

export type LeaveRequestStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type_id: number;
  from_date: string | null; // YYYY-MM-DD
  to_date: string | null;
  total_days: number | null;
  reason: string | null;
  status: LeaveRequestStatus;
  approved_by: number | null;
  approved_at: string | null;
  file_path: string | null;
  note: string | null;
  created_at?: string;
  updated_at?: string;
  // Related
  employee?: {
    id: number;
    full_name: string;
    employee_code: string;
  };
  leave_type?: {
    id: number;
    code: string;
    name: string;
  };
  approver?: {
    id: number;
    full_name: string;
  };
}

export interface LeaveRequestCreatePayload {
  employee_id: number;
  leave_type_id: number;
  from_date: string;
  to_date: string;
  total_days?: number | null;
  reason?: string | null;
  file_path?: string | null;
  status?: LeaveRequestStatus;
  note?: string | null;
}

export interface LeaveRequestListParams {
  employee_id?: number;
  leave_type_id?: number;
  status?: LeaveRequestStatus;
  start_date?: string;
  end_date?: string;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── Part 3: Overtime Requests (Đăng ký OT) ───────────────────────────────────

export type OvertimeRequestStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface OvertimeRequest {
  id: number;
  employee_id: number;
  overtime_date: string; // YYYY-MM-DD
  start_time: string; // YYYY-MM-DD HH:mm:ss
  end_time: string;
  total_hours: number | null;
  reason: string | null;
  status: OvertimeRequestStatus;
  approved_by: number | null;
  approved_at: string | null;
  note: string | null;
  created_at?: string;
  updated_at?: string;
  // Related
  employee?: {
    id: number;
    full_name: string;
    employee_code: string;
  };
  approver?: {
    id: number;
    full_name: string;
  };
}

export interface OvertimeRequestCreatePayload {
  employee_id: number;
  overtime_date: string;
  start_time: string;
  end_time: string;
  total_hours?: number | null;
  reason?: string | null;
  status?: OvertimeRequestStatus;
  note?: string | null;
}

export interface OvertimeRequestListParams {
  employee_id?: number;
  overtime_date?: string;
  start_date?: string;
  end_date?: string;
  approved_by?: number;
  status?: OvertimeRequestStatus;
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

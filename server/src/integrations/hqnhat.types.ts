// ─── HQNHAT API Types ────────────────────────────────────────────────
// TypeScript types for api.hqnhat.id.vn (Laravel OpenAPI 3.0)
// Auto-generated + manually extended to match actual API responses

// Common pagination params
export interface HqnhatListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

// Generic paginated response wrapper
export interface HqnhatPaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message?: string;
}

// Status codes (from API mapping tables)
export type MajorStatusCode = 0 | 1 | 2;
export type MajorStatusLabel = 'active' | 'draft' | 'archived';
export type CurriculumDegreeLevel = 'college' | 'bachelor' | 'master' | 'doctor' | string;
export type StudentClassStatus = 'studying' | 'reserved' | 'graduated' | 'dropped' | 'transferred' | string;

// Faculty
export interface FacultyOptionDto {
  id: number;
  code: string;
  name: string;
  short_name?: string;
  description?: string | null;
  is_active?: boolean;
}

// Major
export interface MajorDto {
  id: number;
  code: string;
  name: string;
  short_name?: string;
  faculty_id?: number;
  faculty?: FacultyOptionDto;
  description?: string | null;
  is_active?: boolean;
  status?: MajorStatusCode | MajorStatusLabel;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

// User (admin/staff)
export interface UserDto {
  id: number;
  username?: string;
  email?: string;
  full_name?: string;
  staff_code?: string;
  is_active?: boolean;
  [key: string]: any;
}

// Specialization (chuyên ngành)
export interface SpecializationDto {
  id: number;
  code: string;
  name: string;
  major_id: number;
  major?: MajorDto;
  description?: string | null;
  is_active?: boolean;
}

// CourseGroup (nhóm học phần)
export interface CourseGroupDto {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  parent_id?: number | null;
  order?: number;
}

// Course (học phần)
export interface CourseDto {
  id: number;
  code: string;
  name: string;
  english_name?: string | null;
  credits: number;
  total_credits?: number;
  theory_hours?: number;
  practice_hours?: number;
  theory_credits?: number;
  pratical_credits?: number;
  course_group_id?: number;
  faculty_id?: number;
  description?: string | null;
  is_active?: boolean;
  [key: string]: any;
}

// Curriculum (chương trình đào tạo)
export interface CurriculumDto {
  id: number;
  code: string;
  name: string;
  major_id: number;
  training_system?: string;
  training_type?: string;
  total_credits?: number;
  required_credits?: number;
  elective_credits?: number;
  duration_years?: number;
  effective_year?: number;
  cohort_year?: number;
  cohort?: number;
  degree_level?: CurriculumDegreeLevel;
  status?: 'active' | 'draft' | 'archived';
  description?: string | null;
  courses?: CurriculumCourseDto[];
  major?: MajorDto;
  [key: string]: any;
}

export interface CurriculumCourseDto {
  course_id: number;
  course?: CourseDto;
  semester?: number;
  year_level?: number;
  is_required?: boolean;
  credits?: number;
}

export interface SyncCurriculumCoursesDto {
  courses: CurriculumCourseDto[];
  replace?: boolean;
}

// StudentClass (lớp sinh viên)
export interface StudentClassDto {
  id: number;
  code: string;
  name: string;
  major_id: number;
  curriculum_id: number;
  course_year: number;
  cohort?: number;
  academic_year: string;
  advisor_id?: number | null;
  faculty_id?: number;
  total_students?: number;
  status?: StudentClassStatus;
  is_active?: boolean;
  [key: string]: any;
}

// Student profile (sinh viên)
export type StudentStatus = 'studying' | 'reserved' | 'graduated' | 'suspended' | 'expelled' | 'dropped' | 'transferred';

export interface StudentProfileDto {
  id: number;
  student_code: string;
  full_name: string;
  first_name?: string;
  last_middle_name?: string;
  date_of_birth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  email?: string | null;
  phone?: string | null;
  phone_1?: string | null;
  avatar?: string | null;
  class_id?: number;
  class?: StudentClassDto;
  curriculum_id?: number;
  curriculum?: CurriculumDto;
  faculty_id?: number;
  status?: StudentStatus;
  enrollment_year?: number;
  cohort?: number;
  admission_date?: string;
  gpa?: number;
  accumulated_credits?: number;
  is_active?: boolean;
  [key: string]: any;
}

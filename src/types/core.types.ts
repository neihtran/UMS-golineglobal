// ─── Core API Types ───────────────────────────────────────────────────────────
// TypeScript types for Core Module API
// Organization → Campus → Faculty/Department/Division → Building

// ════════════════════════════════════════════════════════════════════════════════
// Organization (Tổ chức)
// ════════════════════════════════════════════════════════════════════════════════
export interface Organization {
  id: number;
  code: string;
  name: string;
  short_name: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface OrganizationListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  code?: string;
  name?: string;
  is_active?: boolean;
}

export interface OrganizationCreatePayload {
  code: string;
  name: string;
  short_name?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  is_active?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════════
// Campus (Cơ sở)
// ════════════════════════════════════════════════════════════════════════════════
export interface Campus {
  id: number;
  organization_id: number;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CampusListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  organization_id?: number;
  code?: string;
  name?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
}

export interface CampusCreatePayload {
  organization_id: number;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════════
// Faculty (Khoa)
// ════════════════════════════════════════════════════════════════════════════════
export interface Faculty {
  id: number;
  campus_id: number;
  code: string;
  name: string;
  description: string | null;
  established_date: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface FacultyListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  campus_id?: number;
  code?: string;
  name?: string;
  is_active?: boolean;
}

export interface FacultyCreatePayload {
  campus_id: number;
  code: string;
  name: string;
  description?: string;
  established_date?: string;
  is_active?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════════
// Department (Bộ môn)
// ════════════════════════════════════════════════════════════════════════════════
export interface Department {
  id: number;
  faculty_id: number;
  code: string;
  name: string;
  description: string | null;
  established_date: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DepartmentListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  faculty_id?: number;
  code?: string;
  name?: string;
  is_active?: boolean;
}

export interface DepartmentCreatePayload {
  faculty_id: number;
  code: string;
  name: string;
  description?: string;
  established_date?: string;
  is_active?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════════
// Division (Phòng ban)
// ════════════════════════════════════════════════════════════════════════════════
export interface Division {
  id: number;
  campus_id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DivisionListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  campus_id?: number;
  code?: string;
  name?: string;
  is_active?: boolean;
}

export interface DivisionCreatePayload {
  campus_id: number;
  code: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════════
// Building (Tòa nhà)
// ════════════════════════════════════════════════════════════════════════════════
export interface Building {
  id: number;
  campus_id: number;
  code: string;
  name: string;
  address: string | null;
  total_floor: number | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BuildingListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  campus_id?: number;
  code?: string;
  name?: string;
  address?: string;
  is_active?: boolean;
}

export interface BuildingCreatePayload {
  campus_id: number;
  code?: string;
  name: string;
  address?: string;
  total_floor?: number;
  is_active?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════════
// Floor (Tầng)
// ════════════════════════════════════════════════════════════════════════════════
export interface Floor {
  id: number;
  building_id: number;
  floor_number: number;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface FloorListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  building_id?: number;
}

export interface FloorCreatePayload {
  building_id: number;
  floor_number: number;
  name: string;
}

// ════════════════════════════════════════════════════════════════════════════════
// RoomType (Loại phòng)
// ════════════════════════════════════════════════════════════════════════════════
export interface RoomType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RoomTypeListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  code?: string;
  name?: string;
}

export interface RoomTypeCreatePayload {
  code: string;
  name: string;
  description?: string;
}

// ════════════════════════════════════════════════════════════════════════════════
// Room (Phòng)
// ════════════════════════════════════════════════════════════════════════════════
export interface Room {
  id: number;
  floor_id: number;
  room_type_id: number;
  code: string;
  name: string;
  capacity: number | null;
  area: number | null;
  description: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RoomListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  floor_id?: number;
  room_type_id?: number;
  code?: string;
  name?: string;
  is_active?: boolean;
}

export interface RoomCreatePayload {
  floor_id: number;
  room_type_id: number;
  code: string;
  name: string;
  capacity?: number;
  area?: number;
  description?: string;
  is_active?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════════
// AcademicYear (Năm học)
// ════════════════════════════════════════════════════════════════════════════════
export interface AcademicYear {
  id: number;
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AcademicYearListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  code?: string;
  name?: string;
  is_current?: boolean;
}

export interface AcademicYearCreatePayload {
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════════
// Semester (Học kỳ)
// ════════════════════════════════════════════════════════════════════════════════
export interface Semester {
  id: number;
  academic_year_id: number;
  code: string;
  name: string;
  semester_no: number;
  start_date: string;
  end_date: string;
  registration_start: string | null;
  registration_end: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SemesterListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  academic_year_id?: number;
  code?: string;
  name?: string;
}

export interface SemesterCreatePayload {
  academic_year_id: number;
  code: string;
  name: string;
  semester_no: number;
  start_date: string;
  end_date: string;
  registration_start?: string;
  registration_end?: string;
}

// ════════════════════════════════════════════════════════════════════════════════
// MasterGroup (Nhóm danh mục)
// ════════════════════════════════════════════════════════════════════════════════
export interface MasterGroup {
  id: number;
  code: string;
  name: string;
  description: string | null;
  sort_order: number | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MasterGroupListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  code?: string;
  name?: string;
  is_active?: boolean;
}

export interface MasterGroupCreatePayload {
  code: string;
  name: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════════
// MasterValue (Giá trị danh mục)
// ════════════════════════════════════════════════════════════════════════════════
export interface MasterValue {
  id: number;
  group_id: number;
  code: string;
  name: string;
  value: string | null;
  description: string | null;
  sort_order: number | null;
  is_default: boolean;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  // Nested relation
  master_group?: MasterGroup;
}

export interface MasterValueListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  group_id?: number;
  code?: string;
  name?: string;
  is_default?: boolean;
  is_active?: boolean;
}

export interface MasterValueCreatePayload {
  group_id: number;
  code: string;
  name: string;
  value?: string;
  description?: string;
  sort_order?: number;
  is_default?: boolean;
  is_active?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════════
// Response envelope
// ════════════════════════════════════════════════════════════════════════════════
export interface CorePaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface CoreListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: CorePaginationMeta;
}

export interface CoreDetailResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

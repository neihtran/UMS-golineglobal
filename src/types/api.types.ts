// Shared API Response Types
// These should match the backend response format

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  mfaRequired?: boolean;
  tempToken?: string;
  userId?: string;
  user?: any;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

export interface MfaVerifyRequest {
  tempToken: string;
  code: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
}

// Query params types
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface SearchParams {
  search?: string;
}

// VienChuc types
export interface VienChucFilters extends PaginationParams, SortParams {
  search?: string;
  status?: 'active' | 'trial' | 'leave' | 'inactive' | '';
  department?: string;
}

// Department types
export interface Department {
  _id: string;
  code: string;
  name: string;
  shortName?: string;
  type: 'faculty' | 'department' | 'center' | 'office';
  parent?: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  isActive: boolean;
}

// Leave Request types
export interface LeaveRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  type: 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approver?: string;
  approverName?: string;
  approvedAt?: string;
  days: number;
}

// Stats types
export interface VienChucStats {
  total: number;
  byStatus: Record<string, number>;
  byDepartment: Array<{
    _id: string;
    name: string;
    code: string;
    count: number;
    totalSalary: number;
  }>;
  byContractType: Record<string, number>;
}

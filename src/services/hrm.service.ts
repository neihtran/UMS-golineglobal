/**
 * HRM service — VienChuc, Department, Recruitment, Discipline, SalarySheet, Appointment
 */
import { apiClient } from '@/lib/apiClient';
import type { VienChuc } from '@/types/common.types';

// ─── Response helpers ──────────────────────────────────────────────────────────

interface Paginated<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface RecruitmentItem {
  _id: string;
  code: string;
  title: string;
  description?: string;
  department: { name?: string; code?: string; shortName?: string };
  position: string;
  level: string;
  slots: number;
  applicants: number;
  deadline: string;
  status: 'draft' | 'open' | 'closed' | 'completed' | 'cancelled';
  method: string;
  requirements?: string;
}

export interface DisciplineItem {
  _id: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  type: 'warning' | 'reprimand' | 'demotion' | 'dismissal';
  reason: string;
  description?: string;
  date: string;
  decisionNo?: string;
}

export interface SalarySheetItem {
  _id: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  department?: string;
  month: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  bonus: number;
  netSalary: number;
  status: 'draft' | 'submitted' | 'approved' | 'paid';
}

export interface AppointmentItem {
  _id: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  title: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  department?: string;
  fromDate: string;
  toDate: string;
  note?: string;
}

// ─── VienChuc ──────────────────────────────────────────────────────────────────

export interface VienChucFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  department?: string;
  contractType?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface VienChucListResponse {
  success: boolean;
  data: VienChuc[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface VienChucStats {
  total: number;
  byStatus: { active: number; trial: number; onLeave: number; inactive: number };
  byDepartment: { name: string; count: number }[];
  byContractType: { type: string; count: number }[];
  expiringContractsThisMonth: number;
}

export interface Department {
  _id: string;
  code: string;
  name: string;
  shortName?: string;
  type: 'faculty' | 'department' | 'center' | 'office' | 'institute';
  phone?: string;
  email?: string;
  isActive: boolean;
}

export const hrmService = {
  // ─── VienChuc ────────────────────────────────────────────────────────────────
  getVienChucList: (filters: VienChucFilters = {}) =>
    apiClient.get<VienChucListResponse>('/hrm/vien-chuc', { params: filters }),

  getVienChucById: (id: string) =>
    apiClient.get<{ success: boolean; data: VienChuc }>(`/hrm/vien-chuc/${id}`),

  createVienChuc: (data: Partial<VienChuc>) =>
    apiClient.post<{ success: boolean; data: VienChuc }>('/hrm/vien-chuc', data),

  updateVienChuc: (id: string, data: Partial<VienChuc>) =>
    apiClient.patch<{ success: boolean; data: VienChuc }>(`/hrm/vien-chuc/${id}`, data),

  deleteVienChuc: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/hrm/vien-chuc/${id}`),

  getHrmStats: () =>
    apiClient.get<{
      success: boolean;
      data: VienChucStats;
    }>('/hrm/stats'),

  // ─── Departments ────────────────────────────────────────────────────────────
  getDepartments: (params?: { page?: number; pageSize?: number; type?: string; search?: string }) =>
    apiClient.get<{ success: boolean; data: Department[] }>('/departments', { params }),

  // ─── Recruitment ─────────────────────────────────────────────────────────────
  getRecruitmentList: (params?: { page?: number; pageSize?: number; status?: string; search?: string }) =>
    apiClient.get<Paginated<RecruitmentItem>>('/recruitment', { params }),

  getRecruitmentById: (id: string) =>
    apiClient.get<{ success: boolean; data: RecruitmentItem }>(`/recruitment/${id}`),

  getRecruitmentStats: () =>
    apiClient.get<{ success: boolean; data: Record<string, unknown> }>('/recruitment/stats'),

  createRecruitment: (data: Partial<RecruitmentItem>) =>
    apiClient.post<{ success: boolean; data: RecruitmentItem }>('/recruitment', data),

  updateRecruitment: (id: string, data: Partial<RecruitmentItem>) =>
    apiClient.patch<{ success: boolean; data: RecruitmentItem }>(`/recruitment/${id}`, data),

  deleteRecruitment: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/recruitment/${id}`),

  // ─── Discipline ──────────────────────────────────────────────────────────────
  getDisciplineList: (params?: { page?: number; pageSize?: number; type?: string; search?: string }) =>
    apiClient.get<Paginated<DisciplineItem>>('/discipline', { params }),

  getDisciplineById: (id: string) =>
    apiClient.get<{ success: boolean; data: DisciplineItem }>(`/discipline/${id}`),

  createDiscipline: (data: Partial<DisciplineItem>) =>
    apiClient.post<{ success: boolean; data: DisciplineItem }>('/discipline', data),

  updateDiscipline: (id: string, data: Partial<DisciplineItem>) =>
    apiClient.patch<{ success: boolean; data: DisciplineItem }>(`/discipline/${id}`, data),

  deleteDiscipline: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/discipline/${id}`),

  // ─── Salary Sheet ────────────────────────────────────────────────────────────
  getSalarySheets: (params?: { page?: number; pageSize?: number; month?: string; status?: string; search?: string }) =>
    apiClient.get<Paginated<SalarySheetItem>>('/salary-sheets', { params }),

  getSalarySheetById: (id: string) =>
    apiClient.get<{ success: boolean; data: SalarySheetItem }>(`/salary-sheets/${id}`),

  createSalarySheet: (data: Partial<SalarySheetItem>) =>
    apiClient.post<{ success: boolean; data: SalarySheetItem }>('/salary-sheets', data),

  updateSalarySheet: (id: string, data: Partial<SalarySheetItem>) =>
    apiClient.patch<{ success: boolean; data: SalarySheetItem }>(`/salary-sheets/${id}`, data),

  deleteSalarySheet: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/salary-sheets/${id}`),

  getSalaryStats: () =>
    apiClient.get<{ success: boolean; data: Record<string, unknown> }>('/salary-sheets/stats'),

  // ─── Appointment ─────────────────────────────────────────────────────────────
  getAppointments: (params?: { page?: number; pageSize?: number; status?: string; search?: string }) =>
    apiClient.get<Paginated<AppointmentItem>>('/appointments', { params }),

  getAppointmentById: (id: string) =>
    apiClient.get<{ success: boolean; data: AppointmentItem }>(`/appointments/${id}`),

  createAppointment: (data: Partial<AppointmentItem>) =>
    apiClient.post<{ success: boolean; data: AppointmentItem }>('/appointments', data),

  updateAppointment: (id: string, data: Partial<AppointmentItem>) =>
    apiClient.patch<{ success: boolean; data: AppointmentItem }>(`/appointments/${id}`, data),

  deleteAppointment: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/appointments/${id}`),

  getAppointmentStats: () =>
    apiClient.get<{ success: boolean; data: Record<string, unknown> }>('/appointments/stats'),

  // ─── Staff Detail ────────────────────────────────────────────────────────────
  getContractHistory: (employeeId: string) =>
    apiClient.get<{ success: boolean; data: ContractHistoryItem[] }>(`/hrm/vien-chuc/${employeeId}/contracts`),

  getSalaryHistory: (employeeId: string) =>
    apiClient.get<{ success: boolean; data: SalaryHistoryItem[] }>(`/hrm/vien-chuc/${employeeId}/salary`),

  getStaffTraining: (employeeId: string) =>
    apiClient.get<{ success: boolean; data: StaffTrainingItem[] }>(`/hrm/vien-chuc/${employeeId}/training`),

  getStaffDiscipline: (employeeId: string) =>
    apiClient.get<{ success: boolean; data: StaffDisciplineItem[] }>(`/hrm/vien-chuc/${employeeId}/discipline`),

  getStaffAppointments: (employeeId: string) =>
    apiClient.get<{ success: boolean; data: StaffAppointmentItem[] }>(`/hrm/vien-chuc/${employeeId}/appointments`),

  getStaffAttachments: (employeeId: string) =>
    apiClient.get<{ success: boolean; data: StaffAttachmentItem[] }>(`/hrm/vien-chuc/${employeeId}/attachments`),

  // ─── Contract List ─────────────────────────────────────────────────────────────
  getContractList: (params?: { page?: number; pageSize?: number; search?: string; type?: string; sortBy?: string; sortDir?: 'asc' | 'desc' }) =>
    apiClient.get<{ success: boolean; data: ContractHistoryItem[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }>('/hrm/vien-chuc/contracts', { params }),
};

// ─── Staff Detail Sub-resources ─────────────────────────────────────────────────

export interface ContractHistoryItem {
  _id: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  year: number;
  type: string;
  note?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  salary?: number;
}

export interface SalaryHistoryItem {
  _id: string;
  employeeId: string;
  date: string;
  baseSalary: number;
  allowance: number;
  insurance: number;
  netSalary: number;
}

export interface StaffTrainingItem {
  _id: string;
  employeeId: string;
  name: string;
  organization: string;
  year: number;
  certificate?: string;
}

export interface StaffDisciplineItem {
  _id: string;
  employeeId: string;
  year: number;
  type: 'Khen thuong' | 'Ky luat';
  note: string;
  level: 'success' | 'warning' | 'error';
}

export interface StaffAppointmentItem {
  _id: string;
  employeeId: string;
  type: string;
  title: string;
  decisionNo: string;
  decisionDate: string;
  effectiveDate: string;
  signer: string;
  status: string;
  statusVariant: 'success' | 'neutral' | 'warning' | 'error';
  isCurrent: boolean;
}

export interface StaffAttachmentItem {
  _id: string;
  employeeId: string;
  name: string;
  type: string;
  size: string;
  date: string;
}

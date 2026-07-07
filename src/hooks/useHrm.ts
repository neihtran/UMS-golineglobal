/**
 * useHrm — TanStack Query hooks for HRM (Human Resource Management) module.
 * Provides hooks for VienChuc, Departments, Leave Requests, and Salary Sheets.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrmService } from '@/services/hrm.service';
import type { VienChuc } from '@/types/common.types';

// ─── VienChuc ──────────────────────────────────────────────────────────────────

export const useVienChucList = (filters: Parameters<typeof hrmService.getVienChucList>[0] = {}) =>
  useQuery({
    queryKey: ['hrm', 'vien-chuc', 'list', filters],
    queryFn: () => hrmService.getVienChucList(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  });

export const useVienChucById = (id: string) =>
  useQuery({
    queryKey: ['hrm', 'vien-chuc', id],
    queryFn: () => hrmService.getVienChucById(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

export const useVienChucStats = () =>
  useQuery({
    queryKey: ['hrm', 'stats'],
    queryFn: () => hrmService.getHrmStats().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

export const useCreateVienChuc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrmService.createVienChuc,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hrm', 'vien-chuc'] });
      qc.invalidateQueries({ queryKey: ['hrm', 'stats'] });
    },
  });
};

export const useUpdateVienChuc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VienChuc> }) =>
      hrmService.updateVienChuc(id, data),
    onSuccess: (_result, vars) => {
      qc.invalidateQueries({ queryKey: ['hrm', 'vien-chuc'] });
      qc.setQueryData(['hrm', 'vien-chuc', vars.id], _result.data);
    },
  });
};

export const useDeleteVienChuc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrmService.deleteVienChuc,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hrm', 'vien-chuc'] });
      qc.invalidateQueries({ queryKey: ['hrm', 'stats'] });
    },
  });
};

// ─── Departments ────────────────────────────────────────────────────────────────

export const useDepartmentList = (filters: Parameters<typeof hrmService.getDepartments>[0] = {}) =>
  useQuery({
    queryKey: ['hrm', 'departments', filters],
    queryFn: () => hrmService.getDepartments(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 10,
  });

// ─── Recruitment ───────────────────────────────────────────────────────────────

export const useRecruitmentList = (params: Parameters<typeof hrmService.getRecruitmentList>[0] = {}) =>
  useQuery({
    queryKey: ['hrm', 'recruitment', params],
    queryFn: () => hrmService.getRecruitmentList(params).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });

export const useRecruitmentStats = () =>
  useQuery({
    queryKey: ['hrm', 'recruitment', 'stats'],
    queryFn: () => hrmService.getRecruitmentStats().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

export const useCreateRecruitment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrmService.createRecruitment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hrm', 'recruitment'] }),
  });
};

export const useUpdateRecruitment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof hrmService.updateRecruitment>[1] }) =>
      hrmService.updateRecruitment(id, data),
    onSuccess: (_result, vars) => {
      qc.invalidateQueries({ queryKey: ['hrm', 'recruitment'] });
      qc.setQueryData(['hrm', 'recruitment', 'detail', vars.id], _result.data);
    },
  });
};

export const useDeleteRecruitment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrmService.deleteRecruitment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hrm', 'recruitment'] }),
  });
};

// ─── Discipline ───────────────────────────────────────────────────────────────

export const useDisciplineList = (params: Parameters<typeof hrmService.getDisciplineList>[0] = {}) =>
  useQuery({
    queryKey: ['hrm', 'discipline', params],
    queryFn: () => hrmService.getDisciplineList(params).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });

export const useCreateDiscipline = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrmService.createDiscipline,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hrm', 'discipline'] }),
  });
};

export const useUpdateDiscipline = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof hrmService.updateDiscipline>[1] }) =>
      hrmService.updateDiscipline(id, data),
    onSuccess: (_result, vars) => {
      qc.invalidateQueries({ queryKey: ['hrm', 'discipline'] });
      qc.setQueryData(['hrm', 'discipline', 'detail', vars.id], _result.data);
    },
  });
};

export const useDeleteDiscipline = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrmService.deleteDiscipline,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hrm', 'discipline'] }),
  });
};

// ─── Salary Sheet ─────────────────────────────────────────────────────────────

export const useSalarySheets = (params: Parameters<typeof hrmService.getSalarySheets>[0] = {}) =>
  useQuery({
    queryKey: ['hrm', 'salary-sheets', params],
    queryFn: () => hrmService.getSalarySheets(params).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });

export const useSalaryStats = () =>
  useQuery({
    queryKey: ['hrm', 'salary-sheets', 'stats'],
    queryFn: () => hrmService.getSalaryStats().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

export const useCreateSalarySheet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrmService.createSalarySheet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hrm', 'salary-sheets'] }),
  });
};

export const useUpdateSalarySheet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof hrmService.updateSalarySheet>[1] }) =>
      hrmService.updateSalarySheet(id, data),
    onSuccess: (_result, vars) => {
      qc.invalidateQueries({ queryKey: ['hrm', 'salary-sheets'] });
      qc.setQueryData(['hrm', 'salary-sheets', 'detail', vars.id], _result.data);
    },
  });
};

export const useDeleteSalarySheet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrmService.deleteSalarySheet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hrm', 'salary-sheets'] }),
  });
};

// ─── Appointment ──────────────────────────────────────────────────────────────

export const useAppointmentList = (params: Parameters<typeof hrmService.getAppointments>[0] = {}) =>
  useQuery({
    queryKey: ['hrm', 'appointments', params],
    queryFn: () => hrmService.getAppointments(params).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });

export const useAppointmentStats = () =>
  useQuery({
    queryKey: ['hrm', 'appointments', 'stats'],
    queryFn: () => hrmService.getAppointmentStats().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

export const useCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrmService.createAppointment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hrm', 'appointments'] }),
  });
};

export const useUpdateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof hrmService.updateAppointment>[1] }) =>
      hrmService.updateAppointment(id, data),
    onSuccess: (_result, vars) => {
      qc.invalidateQueries({ queryKey: ['hrm', 'appointments'] });
      qc.setQueryData(['hrm', 'appointments', 'detail', vars.id], _result.data);
    },
  });
};

export const useDeleteAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrmService.deleteAppointment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hrm', 'appointments'] }),
  });
};

// ─── Staff Detail Sub-resources ───────────────────────────────────────────────

export const useStaffContractHistory = (employeeId: string) =>
  useQuery({
    queryKey: ['hrm', 'staff', employeeId, 'contracts'],
    queryFn: () => hrmService.getContractHistory(employeeId).then((r) => r.data),
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 5,
  });

export const useStaffSalaryHistory = (employeeId: string) =>
  useQuery({
    queryKey: ['hrm', 'staff', employeeId, 'salary'],
    queryFn: () => hrmService.getSalaryHistory(employeeId).then((r) => r.data),
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 5,
  });

export const useStaffTraining = (employeeId: string) =>
  useQuery({
    queryKey: ['hrm', 'staff', employeeId, 'training'],
    queryFn: () => hrmService.getStaffTraining(employeeId).then((r) => r.data),
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 5,
  });

export const useStaffDiscipline = (employeeId: string) =>
  useQuery({
    queryKey: ['hrm', 'staff', employeeId, 'discipline'],
    queryFn: () => hrmService.getStaffDiscipline(employeeId).then((r) => r.data),
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 5,
  });

export const useStaffAppointments = (employeeId: string) =>
  useQuery({
    queryKey: ['hrm', 'staff', employeeId, 'appointments'],
    queryFn: () => hrmService.getStaffAppointments(employeeId).then((r) => r.data),
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 5,
  });

export const useStaffAttachments = (employeeId: string) =>
  useQuery({
    queryKey: ['hrm', 'staff', employeeId, 'attachments'],
    queryFn: () => hrmService.getStaffAttachments(employeeId).then((r) => r.data),
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 5,
  });

// ─── Contract List (all contracts, paginated) ──────────────────────────────────

export interface ContractListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const useContractList = (filters: ContractListFilters = {}) =>
  useQuery({
    queryKey: ['hrm', 'contracts', 'list', filters],
    queryFn: () => hrmService.getContractList(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });

/**
 * useWms — TanStack Query hooks for WMS (Work Management) module.
 * Provides hooks for projects and tasks.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, taskService } from '@/services/wms.service';
import type {
  ProjectFilters,
  Project,
  TaskFilters,
  Task,
} from '@/services/wms.service';
import { useNotificationStore } from '@/stores/notificationStore';

// ─── Projects ──────────────────────────────────────────────────────────────────

export const useProjectList = (filters: ProjectFilters) =>
  useQuery({
    queryKey: ['wms', 'projects', 'list', filters],
    queryFn: () => projectService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useProjectDetail = (id: string) =>
  useQuery({
    queryKey: ['wms', 'projects', id],
    queryFn: () => projectService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: projectService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wms', 'projects'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo dự án mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo dự án thất bại',
      });
    },
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => projectService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['wms', 'projects'] });
      qc.setQueryData(['wms', 'projects', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật dự án' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Cập nhật thất bại',
      });
    },
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: projectService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wms', 'projects'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa dự án' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Xóa thất bại',
      });
    },
  });
};

export const useStartProject = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: projectService.start,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['wms', 'projects'] });
      qc.setQueryData(['wms', 'projects', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã bắt đầu dự án' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thao tác thất bại',
      });
    },
  });
};

export const useCompleteProject = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: projectService.complete,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['wms', 'projects'] });
      qc.setQueryData(['wms', 'projects', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hoàn thành dự án' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thao tác thất bại',
      });
    },
  });
};

export const useCancelProject = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => projectService.cancel(id, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['wms', 'projects'] });
      qc.setQueryData(['wms', 'projects', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hủy dự án' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Hủy thất bại',
      });
    },
  });
};

// ─── Tasks ──────────────────────────────────────────────────────────────────────

export const useTaskList = (filters: TaskFilters) =>
  useQuery({
    queryKey: ['wms', 'tasks', 'list', filters],
    queryFn: () => taskService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useTaskDetail = (id: string) =>
  useQuery({
    queryKey: ['wms', 'tasks', id],
    queryFn: () => taskService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useTaskComments = (id: string) =>
  useQuery({
    queryKey: ['wms', 'tasks', id, 'comments'],
    queryFn: () => taskService.getComments(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateTask = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: taskService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wms', 'tasks'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo công việc mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo công việc thất bại',
      });
    },
  });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => taskService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['wms', 'tasks'] });
      qc.setQueryData(['wms', 'tasks', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật công việc' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Cập nhật thất bại',
      });
    },
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: taskService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wms', 'tasks'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa công việc' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Xóa thất bại',
      });
    },
  });
};

export const useStartTask = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: taskService.start,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['wms', 'tasks'] });
      qc.setQueryData(['wms', 'tasks', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã bắt đầu công việc' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thao tác thất bại',
      });
    },
  });
};

export const useCompleteTask = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: taskService.complete,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['wms', 'tasks'] });
      qc.setQueryData(['wms', 'tasks', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hoàn thành công việc' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thao tác thất bại',
      });
    },
  });
};

export const useCancelTask = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => taskService.cancel(id, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['wms', 'tasks'] });
      qc.setQueryData(['wms', 'tasks', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hủy công việc' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Hủy thất bại',
      });
    },
  });
};

export const useAssignTask = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string }) => taskService.assign(id, assignedTo),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['wms', 'tasks'] });
      qc.setQueryData(['wms', 'tasks', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã giao công việc' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Giao việc thất bại',
      });
    },
  });
};

export const useAddTaskComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => taskService.addComment(id, comment),
    onSuccess: (_result, vars) => {
      qc.invalidateQueries({ queryKey: ['wms', 'tasks', vars.id, 'comments'] });
    },
    onError: (error: any) => {
      console.error('Add comment error:', error?.response?.data?.error?.message);
    },
  });
};

/**
 * useLms — TanStack Query hooks for LMS (Learning Management) module.
 * Provides hooks for courses, assignments, and attendance.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  courseService,
  assignmentService,
  attendanceService,
} from '@/services/lms.service';
import type {
  CourseFilters,
  Course,
  AssignmentFilters,
  Assignment,
  AttendanceFilters,
  Attendance,
} from '@/services/lms.service';
import { useNotificationStore } from '@/stores/notificationStore';

// ─── Courses ─────────────────────────────────────────────────────────────────────

export const useCourseList = (filters: CourseFilters) =>
  useQuery({
    queryKey: ['lms', 'courses', 'list', filters],
    queryFn: () => courseService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useCourseDetail = (id: string) =>
  useQuery({
    queryKey: ['lms', 'courses', id],
    queryFn: () => courseService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateCourse = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: courseService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lms', 'courses'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo khóa học mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo khóa học thất bại',
      });
    },
  });
};

export const useUpdateCourse = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> }) => courseService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['lms', 'courses'] });
      qc.setQueryData(['lms', 'courses', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật khóa học' });
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

export const useDeleteCourse = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: courseService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lms', 'courses'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa khóa học' });
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

export const useOpenCourse = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: courseService.open,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['lms', 'courses'] });
      qc.setQueryData(['lms', 'courses', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã mở đăng ký khóa học' });
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

export const useCloseCourse = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: courseService.close,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['lms', 'courses'] });
      qc.setQueryData(['lms', 'courses', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã đóng khóa học' });
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

export const useEnrollCourse = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, studentId }: { id: string; studentId: string }) => courseService.enroll(id, studentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lms', 'courses'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã ghi danh sinh viên' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Ghi danh thất bại',
      });
    },
  });
};

export const useUnenrollCourse = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, studentId }: { id: string; studentId: string }) => courseService.unenroll(id, studentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lms', 'courses'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hủy ghi danh sinh viên' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Hủy ghi danh thất bại',
      });
    },
  });
};

// ─── Assignments ──────────────────────────────────────────────────────────────────

export const useAssignmentList = (filters: AssignmentFilters) =>
  useQuery({
    queryKey: ['lms', 'assignments', 'list', filters],
    queryFn: () => assignmentService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useAssignmentDetail = (id: string) =>
  useQuery({
    queryKey: ['lms', 'assignments', id],
    queryFn: () => assignmentService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useAssignmentSubmissions = (id: string) =>
  useQuery({
    queryKey: ['lms', 'assignments', id, 'submissions'],
    queryFn: () => assignmentService.getSubmissions(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateAssignment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: assignmentService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lms', 'assignments'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo bài tập mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo bài tập thất bại',
      });
    },
  });
};

export const useUpdateAssignment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Assignment> }) =>
      assignmentService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['lms', 'assignments'] });
      qc.setQueryData(['lms', 'assignments', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật bài tập' });
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

export const useDeleteAssignment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: assignmentService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lms', 'assignments'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa bài tập' });
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

export const useSubmitAssignment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { content?: string; attachments?: File[] } }) =>
      assignmentService.submit(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lms', 'assignments'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã nộp bài tập' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Nộp bài thất bại',
      });
    },
  });
};

export const useGradeAssignment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, studentId, score, feedback }: { id: string; studentId: string; score: number; feedback?: string }) =>
      assignmentService.grade(id, studentId, score, feedback),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lms', 'assignments'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã chấm điểm bài tập' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Chấm điểm thất bại',
      });
    },
  });
};

// ─── Attendance ──────────────────────────────────────────────────────────────────

export const useAttendanceList = (filters: AttendanceFilters) =>
  useQuery({
    queryKey: ['lms', 'attendance', 'list', filters],
    queryFn: () => attendanceService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useAttendanceDetail = (id: string) =>
  useQuery({
    queryKey: ['lms', 'attendance', id],
    queryFn: () => attendanceService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useAttendanceBySession = (courseId: string, sessionId: string) =>
  useQuery({
    queryKey: ['lms', 'attendance', 'session', courseId, sessionId],
    queryFn: () => attendanceService.getBySession(courseId, sessionId).then((r) => r.data),
    enabled: !!courseId && !!sessionId,
    staleTime: 1000 * 60 * 2,
  });

export const useStudentAttendanceReport = (studentId: string, courseId?: string) =>
  useQuery({
    queryKey: ['lms', 'attendance', 'student', studentId, courseId],
    queryFn: () => attendanceService.getStudentReport(studentId, courseId).then((r) => r.data),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  });

export const useRecordAttendance = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: attendanceService.record,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lms', 'attendance'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã ghi danh điểm danh' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Ghi điểm danh thất bại',
      });
    },
  });
};

export const useBulkRecordAttendance = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: attendanceService.bulkRecord,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lms', 'attendance'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã ghi điểm danh hàng loạt' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Ghi điểm danh thất bại',
      });
    },
  });
};

export const useUpdateAttendance = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Attendance> }) =>
      attendanceService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['lms', 'attendance'] });
      qc.setQueryData(['lms', 'attendance', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật điểm danh' });
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

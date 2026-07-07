/**
 * useKtx — TanStack Query hooks for KTX (Dormitory) module.
 * Provides hooks for rooms, room registrations, and meal tickets.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  roomService,
  roomRegistrationService,
  mealTicketService,
} from '@/services/ktx.service';
import type {
  RoomFilters,
  Room,
  RoomRegistrationFilters,
  RoomRegistration,
  MealTicketFilters,
  MealTicket,
} from '@/services/ktx.service';
import { useNotificationStore } from '@/stores/notificationStore';

// ─── Rooms ───────────────────────────────────────────────────────────────────────

export const useRoomList = (filters: RoomFilters) =>
  useQuery({
    queryKey: ['ktx', 'rooms', 'list', filters],
    queryFn: () => roomService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useRoomDetail = (id: string) =>
  useQuery({
    queryKey: ['ktx', 'rooms', id],
    queryFn: () => roomService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateRoom = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: roomService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ktx', 'rooms'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm phòng mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo phòng thất bại',
      });
    },
  });
};

export const useUpdateRoom = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Room> }) => roomService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['ktx', 'rooms'] });
      qc.setQueryData(['ktx', 'rooms', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật phòng' });
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

export const useDeleteRoom = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: roomService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ktx', 'rooms'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa phòng' });
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

export const useAssignStudentToRoom = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ roomId, studentId }: { roomId: string; studentId: string }) =>
      roomService.assignStudent(roomId, studentId),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['ktx', 'rooms'] });
      qc.setQueryData(['ktx', 'rooms', vars.roomId], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xếp sinh viên vào phòng' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Xếp phòng thất bại',
      });
    },
  });
};

export const useRemoveStudentFromRoom = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ roomId, studentId }: { roomId: string; studentId: string }) =>
      roomService.removeStudent(roomId, studentId),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['ktx', 'rooms'] });
      qc.setQueryData(['ktx', 'rooms', vars.roomId], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa sinh viên khỏi phòng' });
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

export const useSetRoomMaintenance = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: roomService.setMaintenance,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['ktx', 'rooms'] });
      qc.setQueryData(['ktx', 'rooms', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã chuyển phòng sang bảo trì' });
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

// ─── Room Registrations ─────────────────────────────────────────────────────────

export const useRoomRegistrationList = (filters: RoomRegistrationFilters) =>
  useQuery({
    queryKey: ['ktx', 'room-registrations', 'list', filters],
    queryFn: () => roomRegistrationService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useRoomRegistrationDetail = (id: string) =>
  useQuery({
    queryKey: ['ktx', 'room-registrations', id],
    queryFn: () => roomRegistrationService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateRoomRegistration = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: roomRegistrationService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ktx', 'room-registrations'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã gửi yêu cầu đăng ký phòng' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Đăng ký phòng thất bại',
      });
    },
  });
};

export const useUpdateRoomRegistration = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RoomRegistration> }) =>
      roomRegistrationService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['ktx', 'room-registrations'] });
      qc.setQueryData(['ktx', 'room-registrations', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật đăng ký phòng' });
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

export const useApproveRoomRegistration = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, roomId }: { id: string; roomId?: string }) =>
      roomRegistrationService.approve(id, roomId),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['ktx', 'room-registrations'] });
      qc.invalidateQueries({ queryKey: ['ktx', 'rooms'] });
      qc.setQueryData(['ktx', 'room-registrations', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã duyệt đăng ký phòng' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Duyệt thất bại',
      });
    },
  });
};

export const useRejectRoomRegistration = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      roomRegistrationService.reject(id, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['ktx', 'room-registrations'] });
      qc.setQueryData(['ktx', 'room-registrations', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã từ chối đăng ký phòng' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Từ chối thất bại',
      });
    },
  });
};

export const useCancelRoomRegistration = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: roomRegistrationService.cancel,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['ktx', 'room-registrations'] });
      qc.setQueryData(['ktx', 'room-registrations', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hủy đăng ký phòng' });
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

export const useCheckInRoomRegistration = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: roomRegistrationService.checkIn,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['ktx', 'room-registrations'] });
      qc.invalidateQueries({ queryKey: ['ktx', 'rooms'] });
      qc.setQueryData(['ktx', 'room-registrations', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã check-in thành công' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Check-in thất bại',
      });
    },
  });
};

export const useCheckOutRoomRegistration = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: roomRegistrationService.checkOut,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['ktx', 'room-registrations'] });
      qc.invalidateQueries({ queryKey: ['ktx', 'rooms'] });
      qc.setQueryData(['ktx', 'room-registrations', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã check-out thành công' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Check-out thất bại',
      });
    },
  });
};

// ─── Meal Tickets ──────────────────────────────────────────────────────────────

export const useMealTicketList = (filters: MealTicketFilters) =>
  useQuery({
    queryKey: ['ktx', 'meal-tickets', 'list', filters],
    queryFn: () => mealTicketService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useMealTicketDetail = (id: string) =>
  useQuery({
    queryKey: ['ktx', 'meal-tickets', id],
    queryFn: () => mealTicketService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useStudentMealTickets = (studentId: string, academicYear?: string) =>
  useQuery({
    queryKey: ['ktx', 'meal-tickets', 'student', studentId, academicYear],
    queryFn: () => mealTicketService.getStudentTickets(studentId, academicYear).then((r) => r.data),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateMealTicket = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: mealTicketService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ktx', 'meal-tickets'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo vé ăn mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo vé ăn thất bại',
      });
    },
  });
};

export const useCreateBulkMealTickets = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: mealTicketService.createBulk,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ktx', 'meal-tickets'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo vé ăn hàng loạt' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo vé ăn hàng loạt thất bại',
      });
    },
  });
};

export const useUpdateMealTicket = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MealTicket> }) =>
      mealTicketService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['ktx', 'meal-tickets'] });
      qc.setQueryData(['ktx', 'meal-tickets', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật vé ăn' });
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

export const useCancelMealTicket = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: mealTicketService.cancel,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['ktx', 'meal-tickets'] });
      qc.setQueryData(['ktx', 'meal-tickets', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hủy vé ăn' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Hủy vé ăn thất bại',
      });
    },
  });
};

export const useUseMealTicket = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: mealTicketService.use,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['ktx', 'meal-tickets'] });
      qc.setQueryData(['ktx', 'meal-tickets', id], result.data);
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Sử dụng vé ăn thất bại',
      });
    },
  });
};

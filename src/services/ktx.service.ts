/**
 * KTX (Ký túc xá) service — API client cho module KTX.
 * Backend routes: /api/ktx/*
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── Rooms ───────────────────────────────────────────────────────────────────────
export interface RoomFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  building?: string;
  floor?: number;
  roomType?: string;
  status?: string;
  genderAllowed?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Room {
  _id: string;
  roomNumber: string;
  building: string;
  floor: number;
  roomType: 'single' | 'double' | 'triple' | 'quad' | 'dorm';
  capacity: number;
  currentOccupancy: number;
  status: 'available' | 'full' | 'maintenance' | 'closed';
  genderAllowed: 'male' | 'female' | 'mixed';
  floorType: 'concrete' | 'wooden';
  hasAC: boolean;
  hasFan: boolean;
  hasWifi: boolean;
  hasWaterHeater: boolean;
  hasDesk: boolean;
  hasWardrobe: boolean;
  amenities: string[];
  monthlyRent: number;
  depositAmount: number;
  managerId?: string;
  managerName?: string;
  images: string[];
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const roomService = {
  list: (filters: RoomFilters = {}) =>
    apiClient.get<PaginatedResponse<Room>>('/ktx/rooms', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Room>>(`/ktx/rooms/${id}`),

  create: (data: Partial<Room>) =>
    apiClient.post<ApiResponse<Room>>('/ktx/rooms', data),

  update: (id: string, data: Partial<Room>) =>
    apiClient.patch<ApiResponse<Room>>(`/ktx/rooms/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/ktx/rooms/${id}`),

  assignStudent: (roomId: string, studentId: string) =>
    apiClient.post<ApiResponse<Room>>(`/ktx/rooms/${roomId}/assign`, { studentId }),

  removeStudent: (roomId: string, studentId: string) =>
    apiClient.post<ApiResponse<Room>>(`/ktx/rooms/${roomId}/remove`, { studentId }),

  setMaintenance: (id: string) =>
    apiClient.post<ApiResponse<Room>>(`/ktx/rooms/${id}/maintenance`),
};

// ─── Room Registrations ─────────────────────────────────────────────────────────
export interface RoomRegistrationFilters {
  page?: number;
  pageSize?: number;
  studentId?: string;
  roomId?: string;
  status?: string;
  semester?: string;
  academicYear?: string;
  registrationFrom?: string;
  registrationTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface RoomRegistration {
  _id: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  roomId?: string;
  roomNumber?: string;
  building?: string;
  semester: string;
  academicYear: string;
  status: 'pending' | 'approved' | 'rejected' | 'checked_in' | 'checked_out' | 'cancelled';
  checkInDate?: string;
  checkOutDate?: string;
  reason?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  preferences: {
    building?: string;
    floor?: number;
    genderPreference?: string;
    roommatePreference?: string;
  };
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const roomRegistrationService = {
  list: (filters: RoomRegistrationFilters = {}) =>
    apiClient.get<PaginatedResponse<RoomRegistration>>('/ktx/room-registrations', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<RoomRegistration>>(`/ktx/room-registrations/${id}`),

  create: (data: Partial<RoomRegistration>) =>
    apiClient.post<ApiResponse<RoomRegistration>>('/ktx/room-registrations', data),

  update: (id: string, data: Partial<RoomRegistration>) =>
    apiClient.patch<ApiResponse<RoomRegistration>>(`/ktx/room-registrations/${id}`, data),

  approve: (id: string, roomId?: string) =>
    apiClient.post<ApiResponse<RoomRegistration>>(`/ktx/room-registrations/${id}/approve`, { roomId }),

  reject: (id: string, reason: string) =>
    apiClient.post<ApiResponse<RoomRegistration>>(`/ktx/room-registrations/${id}/reject`, { reason }),

  cancel: (id: string) =>
    apiClient.post<ApiResponse<RoomRegistration>>(`/ktx/room-registrations/${id}/cancel`),

  checkIn: (id: string) =>
    apiClient.post<ApiResponse<RoomRegistration>>(`/ktx/room-registrations/${id}/check-in`),

  checkOut: (id: string) =>
    apiClient.post<ApiResponse<RoomRegistration>>(`/ktx/room-registrations/${id}/check-out`),
};

// ─── Meal Tickets ──────────────────────────────────────────────────────────────
export interface MealTicketFilters {
  page?: number;
  pageSize?: number;
  studentId?: string;
  ticketType?: string;
  status?: string;
  month?: string;
  academicYear?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface MealTicket {
  _id: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  ticketType: 'breakfast' | 'lunch' | 'dinner' | 'all';
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  month: string;
  academicYear: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  usedCount: number;
  remainingCount: number;
  validFrom: string;
  validTo: string;
  paymentStatus: 'unpaid' | 'paid' | 'waived';
  purchasedAt?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const mealTicketService = {
  list: (filters: MealTicketFilters = {}) =>
    apiClient.get<PaginatedResponse<MealTicket>>('/ktx/meal-tickets', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<MealTicket>>(`/ktx/meal-tickets/${id}`),

  create: (data: Partial<MealTicket>) =>
    apiClient.post<ApiResponse<MealTicket>>('/ktx/meal-tickets', data),

  createBulk: (tickets: Partial<MealTicket>[]) =>
    apiClient.post<ApiResponse<any>>('/ktx/meal-tickets/bulk', { tickets }),

  update: (id: string, data: Partial<MealTicket>) =>
    apiClient.patch<ApiResponse<MealTicket>>(`/ktx/meal-tickets/${id}`, data),

  cancel: (id: string) =>
    apiClient.post<ApiResponse<MealTicket>>(`/ktx/meal-tickets/${id}/cancel`),

  use: (id: string) =>
    apiClient.post<ApiResponse<MealTicket>>(`/ktx/meal-tickets/${id}/use`),

  getStudentTickets: (studentId: string, academicYear?: string) =>
    apiClient.get<ApiResponse<MealTicket[]>>(`/ktx/meal-tickets/student/${studentId}`, {
      params: { academicYear },
    }),
};

/**
 * useLib — TanStack Query hooks for LIB (Library) module.
 * Provides hooks for books, borrow records, categories, publishers, and authors.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  bookService,
  borrowRecordService,
  libCategoryService,
  publisherService,
  authorService,
} from '@/services/lib.service';
import type {
  BookFilters,
  Book,
  BorrowRecordFilters,
  LibCategoryFilters,
  LibCategory,
  PublisherFilters,
  Publisher,
  AuthorFilters,
  Author,
} from '@/services/lib.service';
import { useNotificationStore } from '@/stores/notificationStore';

// ─── Books ───────────────────────────────────────────────────────────────────────

export const useBookList = (filters: BookFilters) =>
  useQuery({
    queryKey: ['lib', 'books', 'list', filters],
    queryFn: () => bookService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useBookDetail = (id: string) =>
  useQuery({
    queryKey: ['lib', 'books', id],
    queryFn: () => bookService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useBookSearch = (query: string, filters?: Partial<BookFilters>) =>
  useQuery({
    queryKey: ['lib', 'books', 'search', query, filters],
    queryFn: () => bookService.search(query, filters).then((r) => r.data),
    enabled: !!query,
    staleTime: 1000 * 60 * 5,
  });

export const useBookCopies = (id: string) =>
  useQuery({
    queryKey: ['lib', 'books', id, 'copies'],
    queryFn: () => bookService.getCopies(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateBook = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: bookService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lib', 'books'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm tài liệu mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thêm tài liệu thất bại',
      });
    },
  });
};

export const useUpdateBook = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Book> }) => bookService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['lib', 'books'] });
      qc.setQueryData(['lib', 'books', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật tài liệu' });
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

export const useDeleteBook = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: bookService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lib', 'books'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa tài liệu' });
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

export const useMarkBookLost = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: bookService.markLost,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['lib', 'books'] });
      qc.setQueryData(['lib', 'books', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã đánh dấu mất tài liệu' });
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

export const useMarkBookDamaged = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => bookService.markDamaged(id, note),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['lib', 'books'] });
      qc.setQueryData(['lib', 'books', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã đánh dấu hư hỏng' });
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

export const useWithdrawBook = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => bookService.withdraw(id, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['lib', 'books'] });
      qc.setQueryData(['lib', 'books', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thanh lý tài liệu' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thanh lý thất bại',
      });
    },
  });
};

export const useReserveBook = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: bookService.reserve,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lib', 'books'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã đặt giữ tài liệu' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Đặt giữ thất bại',
      });
    },
  });
};

// ─── Borrow Records ─────────────────────────────────────────────────────────────

export const useBorrowRecordList = (filters: BorrowRecordFilters) =>
  useQuery({
    queryKey: ['lib', 'borrow-records', 'list', filters],
    queryFn: () => borrowRecordService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useBorrowRecordDetail = (id: string) =>
  useQuery({
    queryKey: ['lib', 'borrow-records', id],
    queryFn: () => borrowRecordService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useOverdueBorrowRecords = () =>
  useQuery({
    queryKey: ['lib', 'borrow-records', 'overdue'],
    queryFn: () => borrowRecordService.getOverdue().then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });

export const useReaderBorrowHistory = (readerId: string) =>
  useQuery({
    queryKey: ['lib', 'borrow-records', 'reader', readerId],
    queryFn: () => borrowRecordService.getReaderHistory(readerId).then((r) => r.data),
    enabled: !!readerId,
    staleTime: 1000 * 60 * 5,
  });

export const useBorrowBook = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: borrowRecordService.borrow,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lib', 'borrow-records'] });
      qc.invalidateQueries({ queryKey: ['lib', 'books'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cho mượn tài liệu' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Cho mượn thất bại',
      });
    },
  });
};

export const useReturnBook = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, fineAmount }: { id: string; fineAmount?: number }) =>
      borrowRecordService.return(id, fineAmount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lib', 'borrow-records'] });
      qc.invalidateQueries({ queryKey: ['lib', 'books'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã nhận hoàn tài liệu' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Nhận hoàn thất bại',
      });
    },
  });
};

export const useRenewBorrowRecord = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, newDueDate }: { id: string; newDueDate: string }) =>
      borrowRecordService.renew(id, newDueDate),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['lib', 'borrow-records'] });
      qc.setQueryData(['lib', 'borrow-records', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã gia hạn mượn' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Gia hạn thất bại',
      });
    },
  });
};

export const useReportBorrowRecordLost = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: borrowRecordService.reportLost,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['lib', 'borrow-records'] });
      qc.setQueryData(['lib', 'borrow-records', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã báo mất' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Báo mất thất bại',
      });
    },
  });
};

export const usePayBorrowFine = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      borrowRecordService.payFine(id, amount),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['lib', 'borrow-records'] });
      qc.setQueryData(['lib', 'borrow-records', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thanh toán phí phạt' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thanh toán thất bại',
      });
    },
  });
};

// ─── Categories ─────────────────────────────────────────────────────────────────

export const useLibCategoryList = (filters: LibCategoryFilters) =>
  useQuery({
    queryKey: ['lib', 'categories', 'list', filters],
    queryFn: () => libCategoryService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useLibCategoryDetail = (id: string) =>
  useQuery({
    queryKey: ['lib', 'categories', id],
    queryFn: () => libCategoryService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateLibCategory = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: libCategoryService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lib', 'categories'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm danh mục' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thêm danh mục thất bại',
      });
    },
  });
};

export const useUpdateLibCategory = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LibCategory> }) =>
      libCategoryService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['lib', 'categories'] });
      qc.setQueryData(['lib', 'categories', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật danh mục' });
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

export const useDeleteLibCategory = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: libCategoryService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lib', 'categories'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa danh mục' });
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

// ─── Publishers ─────────────────────────────────────────────────────────────────

export const usePublisherList = (filters: PublisherFilters) =>
  useQuery({
    queryKey: ['lib', 'publishers', 'list', filters],
    queryFn: () => publisherService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const usePublisherDetail = (id: string) =>
  useQuery({
    queryKey: ['lib', 'publishers', id],
    queryFn: () => publisherService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreatePublisher = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: publisherService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lib', 'publishers'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm nhà xuất bản' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thêm nhà xuất bản thất bại',
      });
    },
  });
};

export const useUpdatePublisher = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Publisher> }) =>
      publisherService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['lib', 'publishers'] });
      qc.setQueryData(['lib', 'publishers', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật nhà xuất bản' });
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

export const useDeletePublisher = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: publisherService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lib', 'publishers'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa nhà xuất bản' });
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

// ─── Authors ───────────────────────────────────────────────────────────────────

export const useAuthorList = (filters: AuthorFilters) =>
  useQuery({
    queryKey: ['lib', 'authors', 'list', filters],
    queryFn: () => authorService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useAuthorDetail = (id: string) =>
  useQuery({
    queryKey: ['lib', 'authors', id],
    queryFn: () => authorService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useAuthorSearch = (query: string) =>
  useQuery({
    queryKey: ['lib', 'authors', 'search', query],
    queryFn: () => authorService.search(query).then((r) => r.data),
    enabled: !!query,
    staleTime: 1000 * 60 * 5,
  });

export const useAuthorBooks = (id: string) =>
  useQuery({
    queryKey: ['lib', 'authors', id, 'books'],
    queryFn: () => authorService.getBooks(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateAuthor = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: authorService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lib', 'authors'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm tác giả' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thêm tác giả thất bại',
      });
    },
  });
};

export const useUpdateAuthor = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Author> }) =>
      authorService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['lib', 'authors'] });
      qc.setQueryData(['lib', 'authors', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật tác giả' });
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

export const useDeleteAuthor = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: authorService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lib', 'authors'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa tác giả' });
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

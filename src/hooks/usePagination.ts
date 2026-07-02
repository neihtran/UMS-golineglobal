import { useState, useCallback } from 'react';

interface PaginationState {
  page: number;
  pageSize: number;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  total?: number;
}

interface UsePaginationReturn {
  pagination: PaginationState;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  reset: () => void;
  totalPages: number;
  start: number;
  end: number;
}

export function usePagination(
  options: UsePaginationOptions = {},
): UsePaginationReturn {
  const {
    initialPage = 1,
    initialPageSize = 25,
  } = options;

  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    pageSize: initialPageSize,
  });

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page: Math.max(1, page) }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination({ page: 1, pageSize });
  }, []);

  const reset = useCallback(() => {
    setPagination({ page: 1, pageSize: initialPageSize });
  }, [initialPageSize]);

  const { page, pageSize } = pagination;
  const total = options.total ?? Infinity;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return { pagination, setPage, setPageSize, reset, totalPages, start, end };
}

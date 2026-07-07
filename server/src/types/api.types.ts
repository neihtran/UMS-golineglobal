// ─── Shared API Response Types ─────────────────────────────────────────────────
// Copy of these types must live on frontend at: src/types/api.types.ts
// Field names must match exactly between frontend and backend

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: true;
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
    code:
      | 'VALIDATION_ERROR'
      | 'UNAUTHORIZED'
      | 'TOKEN_EXPIRED'
      | 'FORBIDDEN'
      | 'NOT_FOUND'
      | 'CONFLICT'
      | 'INTERNAL_ERROR'
      | 'RATE_LIMIT'
      | 'BAD_REQUEST';
    message: string;
    details?: unknown;
  };
}

export type ApiError = ErrorResponse;
export type ApiResult<T> = ApiResponse<T> | PaginatedResponse<T> | ErrorResponse;

// ─── Pagination helpers ────────────────────────────────────────────────────────
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function buildPaginationMeta(
  total: number,
  page: number,
  pageSize: number
): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ─── Query options for MongoDB ────────────────────────────────────────────────
export interface QueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
  searchFields?: string[]; // fields to search text in
  filters?: Record<string, unknown>;
}

export function buildMongooseQuery(
  options: QueryOptions
): { filter: Record<string, unknown>; skip: number; limit: number; sort: Record<string, 1 | -1> } {
  const { page = 1, pageSize = 10, sortBy = 'createdAt', sortDir = 'desc', search, searchFields, filters = {} } = options;

  const filter: Record<string, unknown> = { ...filters };

  if (search && searchFields && searchFields.length > 0) {
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: search, $options: 'i' },
    }));
  }

  return {
    filter,
    skip: (page - 1) * pageSize,
    limit: pageSize,
    sort: { [sortBy]: sortDir === 'asc' ? 1 : -1 },
  };
}

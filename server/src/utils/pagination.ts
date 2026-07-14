// Pagination helper for MongoDB queries
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult {
  skip: number;
  limit: number;
  page: number;
  pageSize: number;
}

// Parse pagination params from request query
export const parsePagination = (query: Record<string, any>): PaginationResult => {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize as string, 10) || 10));

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    limit: pageSize,
  };
};

// Build pagination response
export const buildPaginationResponse = (
  total: number,
  page: number,
  pageSize: number
): {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
} => {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
};

// Parse sort params from request query
export interface SortParams {
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const parseSort = (query: Record<string, any>): SortParams => {
  const sortBy = query.sortBy as string;
  const sortDir = (query.sortDir as string) === 'asc' ? 'asc' : 'desc';

  if (!sortBy) return {};

  return { sortBy, sortDir };
};

// Build MongoDB sort object
export const buildSortObject = (sortBy?: string, sortDir?: 'asc' | 'desc'): Record<string, 1 | -1> | undefined => {
  if (!sortBy || !sortDir) return undefined;
  return { [sortBy]: sortDir === 'asc' ? 1 : -1 };
};

// Filter builder for common patterns
export const buildFilter = (
  filters: Record<string, any>,
  allowedFields: string[]
): Record<string, any> => {
  const filter: Record<string, any> = {};

  for (const [key, value] of Object.entries(filters)) {
    if (allowedFields.includes(key) && value !== undefined && value !== '' && value !== null) {
      filter[key] = value;
    }
  }

  return filter;
};

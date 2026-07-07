import { Types } from 'mongoose';

/**
 * Build MongoDB filter from query params.
 */
export function buildFilter(params: Record<string, unknown>): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;

    // Handle special operators
    if (key.endsWith('_ne')) {
      filter[key.slice(0, -3)] = { $ne: value };
    } else if (key.endsWith('_in')) {
      const field = key.slice(0, -3);
      filter[field] = Array.isArray(value)
        ? { $in: value }
        : { $in: (value as string).split(',') };
    } else if (key === 'search' || key === 'q') {
      // Text search handled separately
    } else {
      filter[key] = value;
    }
  }

  return filter;
}

/**
 * Build MongoDB sort object.
 */
export function buildSort(
  sortBy?: string,
  sortDir?: string
): Record<string, 1 | -1> {
  if (!sortBy) return { createdAt: -1 };
  return { [sortBy]: sortDir === 'asc' ? 1 : -1 };
}

/**
 * Convert string to MongoDB ObjectId if valid, otherwise return null.
 */
export function toObjectId(id: string): Types.ObjectId | null {
  if (!id) return null;
  if (Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id) {
    return new Types.ObjectId(id);
  }
  return null;
}

/**
 * Paginate results manually (fallback when mongoose-paginate not used).
 */
export function paginateArray<T>(
  array: T[],
  page: number,
  pageSize: number
): { data: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  const total = array.length;
  const start = (page - 1) * pageSize;
  const data = array.slice(start, start + pageSize);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

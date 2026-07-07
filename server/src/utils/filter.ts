import { Types } from 'mongoose';

/**
 * Validate that a string is a valid MongoDB ObjectId.
 */
export function isValidObjectId(id: string): boolean {
  if (!id) return false;
  return Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id;
}

/**
 * Sanitize a string for safe use in regex/search.
 */
export function sanitizeSearchQuery(query: string): string {
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
}

/**
 * Build $or search across multiple text fields.
 */
export function buildTextSearch(
  search: string,
  fields: string[]
): Record<string, unknown> {
  if (!search) return {};
  const sanitized = sanitizeSearchQuery(search);
  return {
    $or: fields.map((field) => ({
      [field]: { $regex: sanitized, $options: 'i' },
    })),
  };
}

/**
 * Parse comma-separated sort string (e.g. "name:asc,createdAt:desc").
 */
export function parseSortString(
  sortStr?: string
): Record<string, 1 | -1> {
  if (!sortStr) return { createdAt: -1 };

  const sort: Record<string, 1 | -1> = {};
  for (const part of sortStr.split(',')) {
    const [field, dir] = part.trim().split(':');
    if (field) {
      sort[field.trim()] = dir?.toLowerCase() === 'asc' ? 1 : -1;
    }
  }
  return sort;
}

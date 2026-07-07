/**
 * LIB (Library) service — API client cho module LIB.
 * Backend routes: /api/lib/*
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── Books ───────────────────────────────────────────────────────────────────────
export interface BookFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  isbn?: string;
  categoryId?: string;
  authorId?: string;
  publisherId?: string;
  language?: string;
  status?: string;
  location?: string;
  publishedYearFrom?: number;
  publishedYearTo?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Book {
  _id: string;
  title: string;
  titleOriginal?: string;
  isbn: string;
  isbn10?: string;
  barcode?: string;
  callNumber?: string;
  authorIds: string[];
  authorNames?: string[];
  publisherId?: string;
  publisherName?: string;
  publishedYear: number;
  edition?: string;
  volume?: string;
  language: string;
  pageCount?: number;
  summary?: string;
  toc?: string;
  keywords: string[];
  categoryId?: string;
  categoryName?: string;
  coverUrl?: string;
  fileUrl?: string;
  type: 'physical' | 'ebook' | 'journal' | 'thesis' | 'newspaper' | 'other';
  status: 'available' | 'borrowed' | 'reserved' | 'lost' | 'damaged' | 'withdrawn';
  location: string;
  shelf?: string;
  totalCopies: number;
  availableCopies: number;
  borrowCount: number;
  price?: number;
  purchaseDate?: string;
  donor?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const bookService = {
  list: (filters: BookFilters = {}) =>
    apiClient.get<PaginatedResponse<Book>>('/lib/books', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Book>>(`/lib/books/${id}`),

  create: (data: Partial<Book>) =>
    apiClient.post<ApiResponse<Book>>('/lib/books', data),

  update: (id: string, data: Partial<Book>) =>
    apiClient.patch<ApiResponse<Book>>(`/lib/books/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/lib/books/${id}`),

  search: (query: string, filters?: Partial<BookFilters>) =>
    apiClient.get<PaginatedResponse<Book>>('/lib/books/search', { params: { q: query, ...filters } }),

  markLost: (id: string) =>
    apiClient.post<ApiResponse<Book>>(`/lib/books/${id}/lost`),

  markDamaged: (id: string, note?: string) =>
    apiClient.post<ApiResponse<Book>>(`/lib/books/${id}/damaged`, { note }),

  withdraw: (id: string, reason: string) =>
    apiClient.post<ApiResponse<Book>>(`/lib/books/${id}/withdraw`, { reason }),

  reserve: (id: string) =>
    apiClient.post<ApiResponse<any>>(`/lib/books/${id}/reserve`),

  getCopies: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/lib/books/${id}/copies`),
};

// ─── Borrow Records ─────────────────────────────────────────────────────────────
export interface BorrowRecordFilters {
  page?: number;
  pageSize?: number;
  bookId?: string;
  bookTitle?: string;
  readerId?: string;
  status?: string;
  overdue?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
  borrowedFrom?: string;
  borrowedTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface BorrowRecord {
  _id: string;
  bookId: string;
  bookTitle?: string;
  bookBarcode?: string;
  copyId?: string;
  readerId: string;
  readerName?: string;
  readerCode?: string;
  readerType: 'student' | 'staff' | 'faculty' | 'external';
  borrowedDate: string;
  dueDate: string;
  returnedDate?: string;
  actualReturnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue' | 'lost' | 'renewed';
  renewCount: number;
  maxRenew: number;
  fineAmount: number;
  finePaid: number;
  fineStatus: 'none' | 'pending' | 'partial' | 'paid';
  borrowedBy: string;
  borrowedByName?: string;
  returnedTo?: string;
  returnedToName?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const borrowRecordService = {
  list: (filters: BorrowRecordFilters = {}) =>
    apiClient.get<PaginatedResponse<BorrowRecord>>('/lib/borrow-records', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<BorrowRecord>>(`/lib/borrow-records/${id}`),

  borrow: (data: { bookId: string; readerId: string; dueDate: string }) =>
    apiClient.post<ApiResponse<BorrowRecord>>('/lib/borrow-records', data),

  return: (id: string, fineAmount?: number) =>
    apiClient.post<ApiResponse<BorrowRecord>>(`/lib/borrow-records/${id}/return`, { fineAmount }),

  renew: (id: string, newDueDate: string) =>
    apiClient.post<ApiResponse<BorrowRecord>>(`/lib/borrow-records/${id}/renew`, { newDueDate }),

  reportLost: (id: string) =>
    apiClient.post<ApiResponse<BorrowRecord>>(`/lib/borrow-records/${id}/lost`),

  payFine: (id: string, amount: number) =>
    apiClient.post<ApiResponse<any>>(`/lib/borrow-records/${id}/pay-fine`, { amount }),

  getOverdue: () =>
    apiClient.get<PaginatedResponse<BorrowRecord>>('/lib/borrow-records/overdue'),

  getReaderHistory: (readerId: string) =>
    apiClient.get<ApiResponse<BorrowRecord[]>>(`/lib/borrow-records/reader/${readerId}`),
};

// ─── Categories ─────────────────────────────────────────────────────────────────
export interface LibCategoryFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  parentId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface LibCategory {
  _id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  parentName?: string;
  deweyCode?: string;
  itemCount: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const libCategoryService = {
  list: (filters: LibCategoryFilters = {}) =>
    apiClient.get<PaginatedResponse<LibCategory>>('/lib/categories', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<LibCategory>>(`/lib/categories/${id}`),

  create: (data: Partial<LibCategory>) =>
    apiClient.post<ApiResponse<LibCategory>>('/lib/categories', data),

  update: (id: string, data: Partial<LibCategory>) =>
    apiClient.patch<ApiResponse<LibCategory>>(`/lib/categories/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/lib/categories/${id}`),
};

// ─── Publishers ─────────────────────────────────────────────────────────────────
export interface PublisherFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  country?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Publisher {
  _id: string;
  name: string;
  shortName?: string;
  country: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
}

export const publisherService = {
  list: (filters: PublisherFilters = {}) =>
    apiClient.get<PaginatedResponse<Publisher>>('/lib/publishers', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Publisher>>(`/lib/publishers/${id}`),

  create: (data: Partial<Publisher>) =>
    apiClient.post<ApiResponse<Publisher>>('/lib/publishers', data),

  update: (id: string, data: Partial<Publisher>) =>
    apiClient.patch<ApiResponse<Publisher>>(`/lib/publishers/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/lib/publishers/${id}`),
};

// ─── Authors ───────────────────────────────────────────────────────────────────
export interface AuthorFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  country?: string;
  specialization?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Author {
  _id: string;
  name: string;
  nameNative?: string;
  shortBio?: string;
  country?: string;
  birthYear?: number;
  deathYear?: string;
  email?: string;
  website?: string;
  photoUrl?: string;
  specialization: string[];
  bookCount: number;
  createdAt: string;
  updatedAt: string;
}

export const authorService = {
  list: (filters: AuthorFilters = {}) =>
    apiClient.get<PaginatedResponse<Author>>('/lib/authors', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Author>>(`/lib/authors/${id}`),

  create: (data: Partial<Author>) =>
    apiClient.post<ApiResponse<Author>>('/lib/authors', data),

  update: (id: string, data: Partial<Author>) =>
    apiClient.patch<ApiResponse<Author>>(`/lib/authors/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/lib/authors/${id}`),

  search: (query: string) =>
    apiClient.get<PaginatedResponse<Author>>('/lib/authors/search', { params: { q: query } }),

  getBooks: (id: string) =>
    apiClient.get<ApiResponse<Book[]>>(`/lib/authors/${id}/books`),
};

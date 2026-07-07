import { Request, Response } from 'express';
import { Book, BorrowRecord } from '@/models/index.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';

// ─── LIB Stats ─────────────────────────────────────────────────────────────────
export const getLibStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    total, available, borrowed, overdue,
    totalBorrows, activeBorrows,
    byCategory,
  ] = await Promise.all([
    Book.countDocuments(),
    Book.countDocuments({ availableCopies: { $gt: 0 } }),
    Book.countDocuments({ availableCopies: { $eq: 0 } }),
    BorrowRecord.countDocuments({ status: 'overdue' }),
    BorrowRecord.countDocuments(),
    BorrowRecord.countDocuments({ status: 'borrowed' }),
    Book.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);

  res.json({
    success: true,
    data: {
      books: { total, available, borrowed: total - available, overdue },
      borrows: { total: totalBorrows, active: activeBorrows },
      byCategory,
    },
  });
});

// ─── Book CRUD ─────────────────────────────────────────────────────────────────
export const getBookList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.category) filter.category = q.category;
  if (q.department) filter.department = q.department;
  if (q.author) filter.authors = q.author;
  if (q.publisher) filter.publisher = q.publisher;
  if (q.minYear || q.maxYear) filter.publishYear = {};
  if (q.minYear) (filter.publishYear as any).$gte = Number(q.minYear);
  if (q.maxYear) (filter.publishYear as any).$lte = Number(q.maxYear);
  if (q.search) {
    filter.$or = [
      { title: { $regex: q.search, $options: 'i' } },
      { authors: { $regex: q.search, $options: 'i' } },
    ];
  }

  const [books, total] = await Promise.all([
    Book.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    Book.countDocuments(filter),
  ]);

  res.json({ success: true, data: books, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getBookById = asyncHandler(async (req: Request, res: Response) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sách không tồn tại' } }); return; }
  res.json({ success: true, data: book });
});

export const createBook = asyncHandler(async (req: Request, res: Response) => {
  const book = await Book.create(req.body);
  res.status(201).json({ success: true, data: book });
});

export const updateBook = asyncHandler(async (req: Request, res: Response) => {
  const book = await Book.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!book) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sách không tồn tại' } }); return; }
  res.json({ success: true, data: book });
});

// ─── Borrow Record CRUD ────────────────────────────────────────────────────────
export const getBorrowRecordList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.bookId) filter.bookId = q.bookId;
  if (q.borrowerId) filter.borrowerId = q.borrowerId;
  if (q.status) filter.status = q.status;
  if (q.borrowerType) filter.borrowerType = q.borrowerType;
  if (q.fromDate || q.toDate) {
    filter.borrowDate = {};
    if (q.fromDate) (filter.borrowDate as any).$gte = new Date(q.fromDate);
    if (q.toDate) (filter.borrowDate as any).$lte = new Date(q.toDate);
  }

  const [list, total] = await Promise.all([
    BorrowRecord.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { borrowDate: -1 }),
    BorrowRecord.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const createBorrowRecord = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.borrowDate) body.borrowDate = new Date(body.borrowDate);
  if (body.dueDate) body.dueDate = new Date(body.dueDate);
  if (body.returnDate) body.returnDate = new Date(body.returnDate);
  const record = await BorrowRecord.create(body);
  res.status(201).json({ success: true, data: record });
});

export const returnBook = asyncHandler(async (req: Request, res: Response) => {
  const record = await BorrowRecord.findByIdAndUpdate(req.params.id, { $set: { status: 'returned', returnDate: new Date() } }, { new: true });
  if (!record) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Phiếu mượn không tồn tại' } }); return; }
  res.json({ success: true, data: record });
});

export const updateBorrowRecord = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.borrowDate) body.borrowDate = new Date(body.borrowDate);
  if (body.dueDate) body.dueDate = new Date(body.dueDate);
  if (body.returnDate) body.returnDate = new Date(body.returnDate);
  const record = await BorrowRecord.findByIdAndUpdate(req.params.id, { $set: body }, { new: true, runValidators: true });
  if (!record) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Phiếu mượn không tồn tại' } }); return; }
  res.json({ success: true, data: record });
});

export const deleteBorrowRecord = asyncHandler(async (req: Request, res: Response) => {
  const record = await BorrowRecord.findByIdAndDelete(req.params.id);
  if (!record) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Phiếu mượn không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã xóa phiếu mượn' });
});

export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sách không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã xóa sách' });
});

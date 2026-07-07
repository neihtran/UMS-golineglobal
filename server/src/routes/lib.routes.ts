import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  bookQuerySchema,
  createBookSchema,
  updateBookSchema,
  borrowRecordQuerySchema,
  createBorrowRecordSchema,
  idParamSchema,
} from '@/validators/shared.validator.js';
import {
  getLibStats,
  getBookList,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBorrowRecordList,
  createBorrowRecord,
  updateBorrowRecord,
  returnBook,
  deleteBorrowRecord,
} from '@/controllers/lib.controller.js';

const router = Router();
router.use(authMiddleware);

// LIB Dashboard
router.get('/stats', getLibStats);

// Books
router.get('/books', validate(bookQuerySchema, 'query'), getBookList);
router.get('/books/:id', validate(idParamSchema, 'params'), getBookById);
router.post('/books', validate(createBookSchema), createBook);
router.patch('/books/:id', validate(idParamSchema, 'params'), validate(updateBookSchema), updateBook);
router.delete('/books/:id', validate(idParamSchema, 'params'), deleteBook);

// Borrow Records
router.get('/borrows', validate(borrowRecordQuerySchema, 'query'), getBorrowRecordList);
router.post('/borrows', validate(createBorrowRecordSchema), createBorrowRecord);
router.patch('/borrows/:id', validate(idParamSchema, 'params'), validate(createBorrowRecordSchema), updateBorrowRecord);
router.post('/borrows/:id/return', validate(idParamSchema, 'params'), returnBook);
router.delete('/borrows/:id', validate(idParamSchema, 'params'), deleteBorrowRecord);

export default router;

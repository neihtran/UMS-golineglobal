import mongoose, { Schema, Document, Types } from 'mongoose';

export type BookCategory = 'textbook' | 'reference' | 'novel' | 'journal' | 'thesis' | 'magazine' | 'other';

export interface IBook extends Document {
  _id: Types.ObjectId;
  isbn?: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishYear?: number;
  category: BookCategory;
  department?: string;
  totalCopies: number;
  availableCopies: number;
  location?: string;
  coverImage?: string;
  description?: string;
  language: string;
  pages?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    isbn: { type: String, unique: true, sparse: true },
    title: { type: String, required: true, text: true },
    authors: [{ type: String }],
    publisher: String,
    publishYear: Number,
    category: { type: String, enum: ['textbook', 'reference', 'novel', 'journal', 'thesis', 'magazine', 'other'], default: 'other', index: true },
    department: String,
    totalCopies: { type: Number, default: 1, min: 0 },
    availableCopies: { type: Number, default: 1, min: 0 },
    location: String,
    coverImage: String,
    description: String,
    language: { type: String, default: 'vi' },
    pages: Number,
    tags: [{ type: String }],
  },
  { timestamps: true }
);

BookSchema.index({ title: 'text', authors: 'text' });
BookSchema.index({ category: 1, department: 1 });
BookSchema.index({ publisher: 1 });

export const Book = mongoose.model<IBook>('Book', BookSchema);

export interface IBorrowRecord extends Document {
  _id: Types.ObjectId;
  bookId: string;
  bookTitle?: string;
  borrowerId: string;
  borrowerName?: string;
  borrowerType: 'student' | 'staff' | 'external';
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'borrowed' | 'returned' | 'overdue' | 'lost';
  fine: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BorrowRecordSchema = new Schema<IBorrowRecord>(
  {
    bookId: { type: String, required: true, index: true },
    bookTitle: String,
    borrowerId: { type: String, required: true, index: true },
    borrowerName: String,
    borrowerType: { type: String, enum: ['student', 'staff', 'external'], default: 'student' },
    borrowDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    returnDate: Date,
    status: { type: String, enum: ['borrowed', 'returned', 'overdue', 'lost'], default: 'borrowed', index: true },
    fine: { type: Number, default: 0, min: 0 },
    note: String,
  },
  { timestamps: true }
);

BorrowRecordSchema.index({ bookId: 1, status: 1 });
BorrowRecordSchema.index({ borrowerId: 1, status: 1 });
BorrowRecordSchema.index({ borrowDate: -1 });

export const BorrowRecord = mongoose.model<IBorrowRecord>('BorrowRecord', BorrowRecordSchema);

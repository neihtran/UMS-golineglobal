/**
 * Seed script — LIB (Thư viện) data
 * Run: npm run seed:lib
 *
 * Requires: seedSis() and seedHrm() already run.
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Book, BorrowRecord } from '../models/index.js';
import { Student, VienChuc } from '../models/index.js';
import { logger } from '../utils/logger.js';

config();

const BOOKS: Array<Record<string, unknown>> = [
  { isbn: '978-0-13-468599-1', title: 'Introduction to Algorithms (CLRS)', authors: ['Cormen', 'Leiserson', 'Rivest', 'Stein'], publisher: 'MIT Press', publishYear: 2022, category: 'textbook', department: 'KHOA_CNTT', totalCopies: 10, availableCopies: 7, location: 'Kệ A-01', pages: 1312 },
  { isbn: '978-0-262-13472-9', title: 'Structure and Interpretation of Computer Programs', authors: ['Abelson', 'Sussman', 'Sussman'], publisher: 'MIT Press', publishYear: 2022, category: 'textbook', department: 'KHOA_CNTT', totalCopies: 5, availableCopies: 3, location: 'Kệ A-02', pages: 657 },
  { isbn: '978-0-13-235088-4', title: 'Clean Code: A Handbook of Agile Software Craftsmanship', authors: ['Robert C. Martin'], publisher: 'Prentice Hall', publishYear: 2008, category: 'reference', department: 'KHOA_CNTT', totalCopies: 8, availableCopies: 5, location: 'Kệ A-03', pages: 464 },
  { isbn: '978-0-596-51774-8', title: 'JavaScript: The Good Parts', authors: ['Douglas Crockford'], publisher: "O'Reilly", publishYear: 2008, category: 'reference', department: 'KHOA_CNTT', totalCopies: 6, availableCopies: 4, location: 'Kệ A-04', pages: 176 },
  { isbn: '978-0-13-110362-7', title: 'The C Programming Language', authors: ['Kernighan', 'Ritchie'], publisher: 'Prentice Hall', publishYear: 1988, category: 'textbook', department: 'KHOA_CNTT', totalCopies: 4, availableCopies: 2, location: 'Kệ A-05', pages: 272 },
  { isbn: '978-0-201-63361-0', title: 'Design Patterns: Elements of Reusable OO Software', authors: ['Gamma', 'Helm', 'Johnson', 'Vlissides'], publisher: 'Addison-Wesley', publishYear: 1994, category: 'reference', department: 'KHOA_CNTT', totalCopies: 6, availableCopies: 4, location: 'Kệ A-06', pages: 416 },
  { isbn: '978-0-13-110362-8', title: 'Operating System Concepts', authors: ['Silberschatz', 'Galvin', 'Gagne'], publisher: 'Wiley', publishYear: 2018, category: 'textbook', department: 'KHOA_CNTT', totalCopies: 7, availableCopies: 5, location: 'Kệ A-07', pages: 976 },
  { isbn: '978-0-07-246750-5', title: 'Database System Concepts', authors: ['Silberschatz', 'Korth', 'Sudarshan'], publisher: 'McGraw-Hill', publishYear: 2020, category: 'textbook', department: 'KHOA_CNTT', totalCopies: 8, availableCopies: 6, location: 'Kệ A-08', pages: 1376 },
  { isbn: '978-0-12-811905-1', title: 'Computer Networks: A Systems Approach', authors: ['Peterson', 'Davie'], publisher: 'Morgan Kaufmann', publishYear: 2021, category: 'textbook', department: 'KHOA_CNTT', totalCopies: 5, availableCopies: 4, location: 'Kệ A-09', pages: 912 },
  { isbn: '978-0-262-03384-7', title: 'Artificial Intelligence: A Modern Approach', authors: ['Russell', 'Norvig'], publisher: 'Pearson', publishYear: 2020, category: 'textbook', department: 'KHOA_CNTT', totalCopies: 6, availableCopies: 5, location: 'Kệ A-10', pages: 1152 },
  { isbn: '978-0-13-110362-9', title: 'Computer Organization and Design', authors: ['Patterson', 'Hennessy'], publisher: 'Morgan Kaufmann', publishYear: 2022, category: 'textbook', department: 'KHOA_DIENTU', totalCopies: 4, availableCopies: 3, location: 'Kệ B-01', pages: 720 },
  { isbn: '978-0-321-87758-0', title: 'The C++ Programming Language', authors: ['Bjarne Stroustrup'], publisher: 'Addison-Wesley', publishYear: 2013, category: 'reference', department: 'KHOA_CNTT', totalCopies: 4, availableCopies: 3, location: 'Kệ A-11', pages: 1376 },
  { isbn: '978-0-596-15579-0', title: 'Python Cookbook', authors: ['David Beazley', 'Brian Jones'], publisher: "O'Reilly", publishYear: 2013, category: 'reference', department: 'KHOA_CNTT', totalCopies: 5, availableCopies: 3, location: 'Kệ A-12', pages: 706 },
  { isbn: '978-0-131-48694-3', title: 'Kinh tế Vi mô', authors: ['Mankiw'], publisher: 'NXB Kinh tế', publishYear: 2021, category: 'textbook', department: 'KHOA_KINHTE', totalCopies: 10, availableCopies: 8, location: 'Kệ C-01', pages: 768 },
  { isbn: '978-0-131-48695-0', title: 'Kinh tế Vĩ mô', authors: ['Mankiw'], publisher: 'NXB Kinh tế', publishYear: 2021, category: 'textbook', department: 'KHOA_KINHTE', totalCopies: 8, availableCopies: 6, location: 'Kệ C-02', pages: 696 },
  { isbn: '978-0-470-61243-6', title: 'Kế toán Tài chính', authors: ['Brigham'], publisher: 'NXB Tài chính', publishYear: 2020, category: 'textbook', department: 'KHOA_KINHTE', totalCopies: 6, availableCopies: 5, location: 'Kệ C-03', pages: 840 },
  { isbn: '978-0-321-80085-7', title: 'Luật Dân sự Việt Nam', authors: ['Nguyễn Văn A'], publisher: 'NXB Chính trị Quốc gia', publishYear: 2022, category: 'textbook', department: 'KHOA_LUAT', totalCopies: 5, availableCopies: 3, location: 'Kệ D-01', pages: 520 },
  { isbn: '978-0-321-80086-4', title: 'Tiếng Anh Chuyên ngành CNTT', authors: ['Nguyễn Thị B'], publisher: 'NXB ĐHQG-HCM', publishYear: 2023, category: 'textbook', department: 'KHOA_NN', totalCopies: 8, availableCopies: 6, location: 'Kệ E-01', pages: 280 },
  { isbn: '978-0-00-000001-1', title: 'Giải thuật và Lập trình thi đấu', authors: ['Nguyễn Hoàng Long'], publisher: 'NXB CNTT', publishYear: 2024, category: 'reference', department: 'KHOA_CNTT', totalCopies: 3, availableCopies: 2, location: 'Kệ A-13', pages: 350 },
  { isbn: '978-0-00-000002-8', title: 'Quản trị Dự án Phần mềm', authors: ['Trần Hoàng Nam'], publisher: 'NXB CNTT', publishYear: 2024, category: 'textbook', department: 'KHOA_CNTT', totalCopies: 5, availableCopies: 4, location: 'Kệ A-14', pages: 290 },
  { isbn: '978-0-00-000003-5', title: 'An ninh mạng Cơ bản', authors: ['Đặng Thị Ngọc Anh'], publisher: 'NXB CNTT', publishYear: 2025, category: 'textbook', department: 'KHOA_CNTT', totalCopies: 4, availableCopies: 3, location: 'Kệ A-15', pages: 220 },
  { isbn: '978-0-00-000004-2', title: 'Kỹ thuật Xây dựng Cơ bản', authors: ['Vũ Đình Hùng'], publisher: 'NXB Xây dựng', publishYear: 2023, category: 'textbook', department: 'KHOA_KHXD', totalCopies: 6, availableCopies: 5, location: 'Kệ F-01', pages: 480 },
  { isbn: '978-0-00-000005-9', title: 'Cơ khí Chế tạo máy', authors: ['Trần Văn G'], publisher: 'NXB Cơ khí', publishYear: 2022, category: 'textbook', department: 'KHOA_COKHI', totalCopies: 5, availableCopies: 4, location: 'Kệ G-01', pages: 400 },
  { isbn: '978-0-00-000006-6', title: 'Môi trường và Phát triển Bền vững', authors: ['Hoàng Thị H'], publisher: 'NXB Môi trường', publishYear: 2024, category: 'textbook', department: 'KHOA_MOITRUONG', totalCopies: 5, availableCopies: 5, location: 'Kệ H-01', pages: 310 },
  { isbn: '978-0-00-000007-3', title: 'Mạch Điện tử Cơ bản', authors: ['Bùi Hoàng Sơn'], publisher: 'NXB Điện tử', publishYear: 2023, category: 'textbook', department: 'KHOA_DIENTU', totalCopies: 6, availableCopies: 5, location: 'Kệ I-01', pages: 450 },
  { isbn: '978-0-00-000008-0', title: 'An Giang Nổi tiếng', authors: ['Nam Cao'], publisher: 'NXB Văn học', publishYear: 1955, category: 'novel', department: 'KHOA_NN', totalCopies: 3, availableCopies: 2, location: 'Kệ J-01', pages: 180 },
];

export async function seedLib() {
  await Promise.all([Book.deleteMany({}), BorrowRecord.deleteMany({})]);
  logger.info('Cleared existing LIB data');

  const createdBooks = await Book.insertMany(BOOKS.map(b => ({
    ...b,
    description: `Sách: ${b.title}`,
    tags: [b.category, b.publisher],
    language: 'en',
  })));
  logger.info(`✅ Seeded ${createdBooks.length} books`);

  const students = await Student.find({ status: 'studying' }).limit(20);
  const vcList = await VienChuc.find({ status: 'active' }).limit(10);
  const borrowers = [...students.map(s => ({ id: s.studentId, name: s.name, type: 'student' as const })), ...vcList.map(v => ({ id: v._id.toString(), name: v.name, type: 'staff' as const }))];

  const borrowRecords: Array<Record<string, unknown>> = [];
  for (let i = 0; i < 30; i++) {
    const book = createdBooks[Math.floor(Math.random() * createdBooks.length)];
    const borrower = borrowers[Math.floor(Math.random() * borrowers.length)];
    const borrowDate = new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000);
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 30);
    const isReturned = Math.random() > 0.3;
    const status: string = isReturned ? 'returned' : (new Date() > dueDate ? 'overdue' : 'borrowed');

    borrowRecords.push({
      bookId: book._id,
      bookTitle: book.title,
      borrowerId: borrower.id,
      borrowerName: borrower.name,
      borrowerType: borrower.type,
      borrowDate,
      dueDate,
      returnDate: isReturned ? new Date(borrowDate.getTime() + (10 + Math.floor(Math.random() * 20)) * 86400000) : undefined,
      status,
      fine: status === 'overdue' ? Math.floor(Math.random() * 50000) : 0,
      note: '',
    });
  }

  const createdRecords = await BorrowRecord.insertMany(borrowRecords);
  logger.info(`✅ Seeded ${createdRecords.length} borrow records`);

  console.log('\n✅ LIB seed complete!');
  console.log(`   Books: ${createdBooks.length}`);
  console.log(`   Borrow records: ${createdRecords.length}`);
}

// Run directly when executed as script
const isMain = process.argv[1]?.endsWith('seedLib.ts') || process.argv[1]?.endsWith('seedLib.js');
if (isMain) {
  (async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/ums_db');
      await seedLib();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error('❌ seedLib failed:', e);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    }
  })();
}

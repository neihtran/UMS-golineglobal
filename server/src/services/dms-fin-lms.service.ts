import { DocumentModel, IDocument } from '../models/Document.js';
import { DocumentFolder, IDocumentFolder } from '../models/DocumentFolder.js';
import { Tuition, IExpense, Expense, IBudget, Budget } from '../models/Finance.js';
import { Assignment, IAssignment, Submission, ISubmission } from '../models/Learning.js';
import { Types } from 'mongoose';
import type { FilterQuery } from 'mongoose';

// ─── Combined DMS + FIN + LMS Service ───────────────────────────────────────
export class DmsFinLmsService {
  // ─── DMS: Documents ─────────────────────────────────────────────────────

  async createDocument(data: any, userId: string): Promise<IDocument> {
    const doc = new DocumentModel({
      ...data,
      folder: data.folder ? new Types.ObjectId(data.folder) : undefined,
      department: data.department ? new Types.ObjectId(data.department) : undefined,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    await doc.save();
    return doc;
  }

  async listDocuments(filters: any) {
    const { page = 1, pageSize = 10, search, status, type, author, folder } = filters;
    const filter: FilterQuery<IDocument> = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (author) filter.author = new Types.ObjectId(author);
    if (folder) filter.folder = new Types.ObjectId(folder);
    if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { code: { $regex: search, $options: 'i' } }];
    const [data, total] = await Promise.all([
      DocumentModel.find(filter).populate('author', 'displayName').skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 }).lean(),
      DocumentModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IDocument[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getDocumentById(id: string): Promise<IDocument | null> {
    return DocumentModel.findById(id).populate('author', 'displayName email');
  }

  async updateDocument(id: string, data: any, userId: string): Promise<IDocument | null> {
    const update: Record<string, any> = { ...data, updatedBy: new Types.ObjectId(userId) };
    if (data.folder) update.folder = new Types.ObjectId(data.folder);
    if (data.department) update.department = new Types.ObjectId(data.department);
    return DocumentModel.findByIdAndUpdate(id, { $set: update }, { new: true });
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = await DocumentModel.findByIdAndDelete(id);
    return !!result;
  }

  // ─── DMS: Folders ──────────────────────────────────────────────────────

  async createFolder(data: any, userId: string): Promise<IDocumentFolder> {
    const folder = new DocumentFolder({
      ...data,
      parent: data.parent ? new Types.ObjectId(data.parent) : undefined,
      createdBy: new Types.ObjectId(userId),
    });
    await folder.save();
    return folder;
  }

  async listFolders(filters?: { parent?: string }) {
    const filter: FilterQuery<IDocumentFolder> = {};
    if (filters?.parent) filter.parent = new Types.ObjectId(filters.parent);
    return DocumentFolder.find(filter).sort({ name: 1 }).lean();
  }

  async deleteFolder(id: string): Promise<boolean> {
    const childCount = await DocumentFolder.countDocuments({ parent: id });
    if (childCount > 0) throw new Error('Thư mục có thư mục con, không thể xóa');
    const result = await DocumentFolder.findByIdAndDelete(id);
    return !!result;
  }

  // ─── FIN: Tuition ─────────────────────────────────────────────────────

  async createTuition(data: any, userId: string): Promise<any> {
    const tuition = new Tuition({
      ...data,
      student: new Types.ObjectId(data.student),
      dueDate: new Date(data.dueDate),
      createdBy: new Types.ObjectId(userId),
    });
    await tuition.save();
    return tuition;
  }

  async listTuitions(filters: any) {
    const { page = 1, pageSize = 10, student, semester, academicYear, status } = filters;
    const filter: Record<string, any> = {};
    if (student) filter.student = new Types.ObjectId(student);
    if (semester) filter.semester = Number(semester);
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;
    const [data, total] = await Promise.all([
      Tuition.find(filter).populate('student', 'name code').skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 }).lean(),
      Tuition.countDocuments(filter),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getTuitionById(id: string): Promise<any> {
    return Tuition.findById(id).populate('student', 'name code email');
  }

  async updateTuition(id: string, data: any): Promise<any> {
    const update: Record<string, any> = { ...data };
    if (data.paidAt) update.paidAt = new Date(data.paidAt);
    return Tuition.findByIdAndUpdate(id, { $set: update }, { new: true });
  }

  async deleteTuition(id: string): Promise<boolean> {
    const result = await Tuition.findByIdAndDelete(id);
    return !!result;
  }

  // ─── FIN: Expense ─────────────────────────────────────────────────────

  async createExpense(data: any, userId: string): Promise<IExpense> {
    const expense = new Expense({
      ...data,
      date: new Date(data.date),
      department: data.department ? new Types.ObjectId(data.department) : undefined,
      createdBy: new Types.ObjectId(userId),
    });
    await expense.save();
    return expense;
  }

  async listExpenses(filters: any) {
    const { page = 1, pageSize = 10, category, status, department } = filters;
    const filter: FilterQuery<IExpense> = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (department) filter.department = new Types.ObjectId(department);
    const [data, total] = await Promise.all([
      Expense.find(filter).populate('department', 'name code').skip((page - 1) * pageSize).limit(pageSize).sort({ date: -1 }).lean(),
      Expense.countDocuments(filter),
    ]);
    return { data: data as unknown as IExpense[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async approveExpense(id: string, userId: string): Promise<IExpense | null> {
    return Expense.findByIdAndUpdate(id, { $set: { status: 'approved', approvedBy: new Types.ObjectId(userId), approvedAt: new Date() } }, { new: true });
  }

  async deleteExpense(id: string): Promise<boolean> {
    const result = await Expense.findByIdAndDelete(id);
    return !!result;
  }

  // ─── FIN: Budget ─────────────────────────────────────────────────────

  async createBudget(data: any, userId: string): Promise<IBudget> {
    const items = (data.items || []).map((item: any) => ({
      ...item,
      spent: 0,
    }));
    const budget = new Budget({
      ...data,
      department: data.department ? new Types.ObjectId(data.department) : undefined,
      allocated: items.reduce((s: number, i: any) => s + i.allocated, 0),
      remaining: data.totalBudget - items.reduce((s: number, i: any) => s + i.allocated, 0),
      items,
      createdBy: new Types.ObjectId(userId),
    });
    await budget.save();
    return budget;
  }

  async listBudgets(filters: any) {
    const { page = 1, pageSize = 10, year, department, status } = filters;
    const filter: FilterQuery<IBudget> = {};
    if (year) filter.year = Number(year);
    if (department) filter.department = new Types.ObjectId(department);
    if (status) filter.status = status;
    const [data, total] = await Promise.all([
      Budget.find(filter).populate('department', 'name code').skip((page - 1) * pageSize).limit(pageSize).sort({ year: -1 }).lean(),
      Budget.countDocuments(filter),
    ]);
    return { data: data as unknown as IBudget[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getBudgetById(id: string): Promise<IBudget | null> {
    return Budget.findById(id).populate('department', 'name code');
  }

  // ─── LMS: Assignments ─────────────────────────────────────────────────

  async createAssignment(data: any, userId: string): Promise<IAssignment> {
    const assignment = new Assignment({
      ...data,
      course: new Types.ObjectId(data.course),
      dueDate: new Date(data.dueDate),
      openDate: data.openDate ? new Date(data.openDate) : undefined,
      createdBy: new Types.ObjectId(userId),
    });
    await assignment.save();
    return assignment;
  }

  async listAssignments(filters: any) {
    const { page = 1, pageSize = 10, course, status, type } = filters;
    const filter: FilterQuery<IAssignment> = {};
    if (course) filter.course = new Types.ObjectId(course);
    if (status) filter.status = status;
    if (type) filter.type = type;
    const [data, total] = await Promise.all([
      Assignment.find(filter).populate('course', 'name code').skip((page - 1) * pageSize).limit(pageSize).sort({ dueDate: -1 }).lean(),
      Assignment.countDocuments(filter),
    ]);
    return { data: data as unknown as IAssignment[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getAssignmentById(id: string): Promise<IAssignment | null> {
    return Assignment.findById(id).populate('course', 'name code');
  }

  async updateAssignment(id: string, data: any): Promise<IAssignment | null> {
    const update: Record<string, any> = { ...data };
    if (data.course) update.course = new Types.ObjectId(data.course);
    if (data.dueDate) update.dueDate = new Date(data.dueDate);
    return Assignment.findByIdAndUpdate(id, { $set: update }, { new: true });
  }

  async deleteAssignment(id: string): Promise<boolean> {
    await Submission.deleteMany({ assignment: id });
    const result = await Assignment.findByIdAndDelete(id);
    return !!result;
  }

  // ─── LMS: Submissions ────────────────────────────────────────────────

  async createSubmission(data: any, userId: string): Promise<ISubmission> {
    const assignment = await Assignment.findById(data.assignment);
    if (!assignment) throw new Error('Bài tập không tồn tại');

    const existing = await Submission.findOne({ assignment: data.assignment, student: userId });
    if (existing) throw new Error('Đã nộp bài rồi');

    const isLate = assignment.dueDate < new Date();
    const submission = new Submission({
      assignment: new Types.ObjectId(data.assignment),
      student: new Types.ObjectId(userId),
      content: data.content,
      fileUrls: data.fileUrls,
      status: isLate ? 'late' : 'submitted',
      submittedAt: new Date(),
    });
    await submission.save();
    return submission;
  }

  async listSubmissions(filters: any) {
    const { page = 1, pageSize = 10, assignment, student, status } = filters;
    const filter: FilterQuery<ISubmission> = {};
    if (assignment) filter.assignment = new Types.ObjectId(assignment);
    if (student) filter.student = new Types.ObjectId(student);
    if (status) filter.status = status;
    const [data, total] = await Promise.all([
      Submission.find(filter)
        .populate('student', 'name code')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ submittedAt: -1 })
        .lean(),
      Submission.countDocuments(filter),
    ]);
    return { data: data as unknown as ISubmission[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async gradeSubmission(id: string, data: { score?: number; feedback?: string }, userId: string): Promise<ISubmission | null> {
    return Submission.findByIdAndUpdate(
      id,
      { $set: { score: data.score, feedback: data.feedback, status: 'graded', gradedBy: new Types.ObjectId(userId), gradedAt: new Date() } },
      { new: true }
    );
  }
}

export const dmsFinLmsService = new DmsFinLmsService();
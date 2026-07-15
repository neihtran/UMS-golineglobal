import { Request, Response } from 'express';
import { admissionService } from '../services/admission.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// ─── AdmissionBatch ─────────────────────────────────────────────────────────────

const createBatch = asyncHandler(async (req: Request, res: Response) => {
  try {
    const batch = await admissionService.createBatch(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: batch });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const listBatches = asyncHandler(async (req: Request, res: Response) => {
  const result = await admissionService.listBatches({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
    year: req.query.year ? Number(req.query.year) : undefined,
    admissionType: req.query.admissionType as string,
    status: req.query.status as string,
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const getBatchById = asyncHandler(async (req: Request, res: Response) => {
  const batch = await admissionService.getBatchById(req.params.id);
  if (!batch) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đợt tuyển sinh' } });
    return;
  }
  res.json({ success: true, data: batch });
});

const updateBatch = asyncHandler(async (req: Request, res: Response) => {
  const batch = await admissionService.updateBatch(req.params.id, req.body, req.user!._id.toString());
  if (!batch) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đợt tuyển sinh' } });
    return;
  }
  res.json({ success: true, data: batch });
});

const deleteBatch = asyncHandler(async (req: Request, res: Response) => {
  const ok = await admissionService.deleteBatch(req.params.id);
  if (!ok) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đợt tuyển sinh' } });
    return;
  }
  res.json({ success: true, message: 'Đã xóa đợt tuyển sinh' });
});

// ─── AdmissionStudent ──────────────────────────────────────────────────────────

const createStudent = asyncHandler(async (req: Request, res: Response) => {
  try {
    const student = await admissionService.createStudent(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: student });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const listStudents = asyncHandler(async (req: Request, res: Response) => {
  const result = await admissionService.listStudents({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
    batch: req.query.batch as string,
    status: req.query.status as string,
    search: req.query.search as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const getStudentById = asyncHandler(async (req: Request, res: Response) => {
  const student = await admissionService.getStudentById(req.params.id);
  if (!student) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy thí sinh' } });
    return;
  }
  res.json({ success: true, data: student });
});

const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await admissionService.updateStudent(req.params.id, req.body, req.user!._id.toString());
  if (!student) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy thí sinh' } });
    return;
  }
  res.json({ success: true, data: student });
});

const enrollStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await admissionService.enrollStudent(req.params.id, req.body, req.user!._id.toString());
  if (!student) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy thí sinh' } });
    return;
  }
  res.json({ success: true, data: student, message: 'Đã nhập học thành công' });
});

const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  const ok = await admissionService.deleteStudent(req.params.id);
  if (!ok) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy thí sinh' } });
    return;
  }
  res.json({ success: true, message: 'Đã xóa thí sinh' });
});

export const admissionController = {
  // Batch
  createBatch, listBatches, getBatchById, updateBatch, deleteBatch,
  // Student
  createStudent, listStudents, getStudentById, updateStudent, enrollStudent, deleteStudent,
};

import { Request, Response } from 'express';
import { studentManagementService } from '../services/studentManagement.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// ─── StudentStatusHistory ──────────────────────────────────────────────────────

const createStatusChange = asyncHandler(async (req: Request, res: Response) => {
  try {
    const statusChange = await studentManagementService.createStatusChange(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: statusChange });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const listStatusHistory = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentManagementService.listStatusHistory({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
    student: req.query.student as string,
    status: req.query.status as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

// ─── StudentReservation ───────────────────────────────────────────────────────

const createReservation = asyncHandler(async (req: Request, res: Response) => {
  try {
    const reservation = await studentManagementService.createReservation(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: reservation });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const listReservations = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentManagementService.listReservations({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
    student: req.query.student as string,
    status: req.query.status as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const approveReservation = asyncHandler(async (req: Request, res: Response) => {
  const reservation = await studentManagementService.approveReservation(req.params.id, req.user!._id.toString());
  if (!reservation) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy yêu cầu bảo lưu' } });
    return;
  }
  res.json({ success: true, data: reservation, message: 'Đã duyệt bảo lưu' });
});

const cancelReservation = asyncHandler(async (req: Request, res: Response) => {
  const reservation = await studentManagementService.cancelReservation(req.params.id);
  if (!reservation) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy yêu cầu bảo lưu' } });
    return;
  }
  res.json({ success: true, data: reservation, message: 'Đã hủy yêu cầu bảo lưu' });
});

// ─── StudentDropout ──────────────────────────────────────────────────────────

const createDropout = asyncHandler(async (req: Request, res: Response) => {
  try {
    const dropout = await studentManagementService.createDropout(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: dropout });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const listDropouts = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentManagementService.listDropouts({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
    student: req.query.student as string,
    status: req.query.status as string,
    dropoutType: req.query.dropoutType as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const approveDropout = asyncHandler(async (req: Request, res: Response) => {
  const dropout = await studentManagementService.approveDropout(req.params.id, req.user!._id.toString());
  if (!dropout) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy yêu cầu thôi học' } });
    return;
  }
  res.json({ success: true, data: dropout, message: 'Đã duyệt thôi học' });
});

const cancelDropout = asyncHandler(async (req: Request, res: Response) => {
  const dropout = await studentManagementService.cancelDropout(req.params.id);
  if (!dropout) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy yêu cầu thôi học' } });
    return;
  }
  res.json({ success: true, data: dropout, message: 'Đã hủy yêu cầu thôi học' });
});

// ─── StudentMajorChange ───────────────────────────────────────────────────────

const createMajorChange = asyncHandler(async (req: Request, res: Response) => {
  try {
    const change = await studentManagementService.createMajorChange(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: change });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const listMajorChanges = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentManagementService.listMajorChanges({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
    student: req.query.student as string,
    status: req.query.status as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const approveMajorChange = asyncHandler(async (req: Request, res: Response) => {
  const change = await studentManagementService.approveMajorChange(req.params.id, req.user!._id.toString());
  if (!change) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy yêu cầu chuyển ngành' } });
    return;
  }
  res.json({ success: true, data: change, message: 'Đã duyệt chuyển ngành' });
});

const cancelMajorChange = asyncHandler(async (req: Request, res: Response) => {
  const change = await studentManagementService.cancelMajorChange(req.params.id);
  if (!change) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy yêu cầu chuyển ngành' } });
    return;
  }
  res.json({ success: true, data: change, message: 'Đã hủy yêu cầu chuyển ngành' });
});

// ─── StudentClassChange ───────────────────────────────────────────────────────

const createClassChange = asyncHandler(async (req: Request, res: Response) => {
  try {
    const change = await studentManagementService.createClassChange(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: change });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const listClassChanges = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentManagementService.listClassChanges({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
    student: req.query.student as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const approveClassChange = asyncHandler(async (req: Request, res: Response) => {
  const change = await studentManagementService.approveClassChange(req.params.id, req.user!._id.toString());
  if (!change) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy yêu cầu chuyển lớp' } });
    return;
  }
  res.json({ success: true, data: change, message: 'Đã duyệt chuyển lớp' });
});

const cancelClassChange = asyncHandler(async (req: Request, res: Response) => {
  const change = await studentManagementService.cancelClassChange(req.params.id);
  if (!change) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy yêu cầu chuyển lớp' } });
    return;
  }
  res.json({ success: true, data: change, message: 'Đã hủy yêu cầu chuyển lớp' });
});

export const studentManagementController = {
  // StatusHistory
  createStatusChange, listStatusHistory,
  // Reservation
  createReservation, listReservations, approveReservation, cancelReservation,
  // Dropout
  createDropout, listDropouts, approveDropout, cancelDropout,
  // MajorChange
  createMajorChange, listMajorChanges, approveMajorChange, cancelMajorChange,
  // ClassChange
  createClassChange, listClassChanges, approveClassChange, cancelClassChange,
};

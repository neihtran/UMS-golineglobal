import { Request, Response } from 'express';
import { scheduleService } from '../services/schedule.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// ─── ClassSchedule ──────────────────────────────────────────────────────────

const createSchedule = asyncHandler(async (req: Request, res: Response) => {
  try {
    const schedule = await scheduleService.createSchedule(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: schedule });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const listSchedules = asyncHandler(async (req: Request, res: Response) => {
  const result = await scheduleService.listSchedules({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 50,
    course: req.query.course as string,
    lecturer: req.query.lecturer as string,
    room: req.query.room as string,
    dayOfWeek: req.query.dayOfWeek ? Number(req.query.dayOfWeek) : undefined,
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const getScheduleById = asyncHandler(async (req: Request, res: Response) => {
  const schedule = await scheduleService.getScheduleById(req.params.id);
  if (!schedule) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy lịch học' } });
    return;
  }
  res.json({ success: true, data: schedule });
});

const getSchedulesByCourse = asyncHandler(async (req: Request, res: Response) => {
  const schedules = await scheduleService.getSchedulesByCourse(req.params.courseId);
  res.json({ success: true, data: schedules });
});

const updateSchedule = asyncHandler(async (req: Request, res: Response) => {
  const schedule = await scheduleService.updateSchedule(req.params.id, req.body, req.user!._id.toString());
  if (!schedule) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy lịch học' } });
    return;
  }
  res.json({ success: true, data: schedule });
});

const deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
  const ok = await scheduleService.deleteSchedule(req.params.id);
  if (!ok) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy lịch học' } });
    return;
  }
  res.json({ success: true, message: 'Đã xóa lịch học' });
});

// ─── ScheduleChange ───────────────────────────────────────────────────────

const createScheduleChange = asyncHandler(async (req: Request, res: Response) => {
  try {
    const change = await scheduleService.createScheduleChange(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: change });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const listScheduleChanges = asyncHandler(async (req: Request, res: Response) => {
  const result = await scheduleService.listScheduleChanges({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
    schedule: req.query.schedule as string,
    status: req.query.status as string,
    changeType: req.query.changeType as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const approveScheduleChange = asyncHandler(async (req: Request, res: Response) => {
  const change = await scheduleService.approveScheduleChange(req.params.id, req.user!._id.toString());
  if (!change) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy yêu cầu thay đổi' } });
    return;
  }
  res.json({ success: true, data: change, message: 'Đã duyệt thay đổi lịch' });
});

const rejectScheduleChange = asyncHandler(async (req: Request, res: Response) => {
  const change = await scheduleService.rejectScheduleChange(req.params.id);
  if (!change) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy yêu cầu thay đổi' } });
    return;
  }
  res.json({ success: true, data: change, message: 'Đã từ chối thay đổi lịch' });
});

// ─── GPAHistory ───────────────────────────────────────────────────────────

const calculateGPA = asyncHandler(async (req: Request, res: Response) => {
  const { studentId, academicTermId } = req.params;
  const gpa = await scheduleService.calculateGPA(studentId, academicTermId);
  if (!gpa) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy dữ liệu để tính GPA' } });
    return;
  }
  res.json({ success: true, data: gpa });
});

const getGPAHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await scheduleService.getGPAHistory(req.params.studentId);
  res.json({ success: true, data: history });
});

// ─── AcademicWarning ─────────────────────────────────────────────────────

const createWarning = asyncHandler(async (req: Request, res: Response) => {
  try {
    const warning = await scheduleService.createWarning(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: warning });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const listWarnings = asyncHandler(async (req: Request, res: Response) => {
  const result = await scheduleService.listWarnings({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
    student: req.query.student as string,
    academicTerm: req.query.academicTerm as string,
    warningType: req.query.warningType as string,
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const resolveWarning = asyncHandler(async (req: Request, res: Response) => {
  const { resolutionNote } = req.body as { resolutionNote: string };
  const warning = await scheduleService.resolveWarning(req.params.id, resolutionNote, req.user!._id.toString());
  if (!warning) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy cảnh báo' } });
    return;
  }
  res.json({ success: true, data: warning, message: 'Đã giải quyết cảnh báo' });
});

// ─── StudentLog ───────────────────────────────────────────────────────────

const getStudentLogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await scheduleService.getStudentLogs(
    req.params.studentId,
    Number(req.query.page) || 1,
    Number(req.query.pageSize) || 50
  );
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

export const scheduleController = {
  // ClassSchedule
  createSchedule, listSchedules, getScheduleById, getSchedulesByCourse, updateSchedule, deleteSchedule,
  // ScheduleChange
  createScheduleChange, listScheduleChanges, approveScheduleChange, rejectScheduleChange,
  // GPAHistory
  calculateGPA, getGPAHistory,
  // AcademicWarning
  createWarning, listWarnings, resolveWarning,
  // StudentLog
  getStudentLogs,
};

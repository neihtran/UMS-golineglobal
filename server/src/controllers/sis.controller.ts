import { Request, Response } from 'express';
import { sisService } from '../services/sis.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// ─── Students ───────────────────────────────────────────────────────────────

const listStudents = asyncHandler(async (req: Request, res: Response) => {
  const result = await sisService.listStudents({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    search: req.query.search as string,
    department: req.query.department as string,
    courseYear: req.query.courseYear ? Number(req.query.courseYear) : undefined,
    status: req.query.status as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const getStudentById = asyncHandler(async (req: Request, res: Response) => {
  const s = await sisService.getStudentById(req.params.id);
  if (!s) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy sinh viên' } }); return; }
  res.json({ success: true, data: s });
});

const createStudent = asyncHandler(async (req: Request, res: Response) => {
  try {
    const s = await sisService.createStudent(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: s });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const s = await sisService.updateStudent(req.params.id, req.body, req.user!._id.toString());
  if (!s) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy sinh viên' } }); return; }
  res.json({ success: true, data: s });
});

const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  const ok = await sisService.deleteStudent(req.params.id);
  if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy sinh viên' } }); return; }
  res.json({ success: true, message: 'Đã xóa sinh viên' });
});

const getStudentStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await sisService.getStudentStats();
  res.json({ success: true, data: stats });
});

// ─── Subjects ───────────────────────────────────────────────────────────────

const listSubjects = asyncHandler(async (req: Request, res: Response) => {
  const result = await sisService.listSubjects({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
    search: req.query.search as string,
    department: req.query.department as string,
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const getSubjectById = asyncHandler(async (req: Request, res: Response) => {
  const s = await sisService.getSubjectById(req.params.id);
  if (!s) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy môn học' } }); return; }
  res.json({ success: true, data: s });
});

const createSubject = asyncHandler(async (req: Request, res: Response) => {
  try {
    const s = await sisService.createSubject(req.body);
    res.status(201).json({ success: true, data: s });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const updateSubject = asyncHandler(async (req: Request, res: Response) => {
  const s = await sisService.updateSubject(req.params.id, req.body);
  if (!s) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy môn học' } }); return; }
  res.json({ success: true, data: s });
});

const deleteSubject = asyncHandler(async (req: Request, res: Response) => {
  const ok = await sisService.deleteSubject(req.params.id);
  if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy môn học' } }); return; }
  res.json({ success: true, message: 'Đã xóa môn học' });
});

// ─── Courses ────────────────────────────────────────────────────────────────

const listCourses = asyncHandler(async (req: Request, res: Response) => {
  const result = await sisService.listCourses({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    subject: req.query.subject as string,
    semester: req.query.semester ? Number(req.query.semester) : undefined,
    academicYear: req.query.academicYear as string,
    status: req.query.status as string,
    lecturer: req.query.lecturer as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const getCourseById = asyncHandler(async (req: Request, res: Response) => {
  const c = await sisService.getCourseById(req.params.id);
  if (!c) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy lớp học phần' } }); return; }
  res.json({ success: true, data: c });
});

const createCourse = asyncHandler(async (req: Request, res: Response) => {
  try {
    const c = await sisService.createCourse(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: c });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const updateCourse = asyncHandler(async (req: Request, res: Response) => {
  const c = await sisService.updateCourse(req.params.id, req.body, req.user!._id.toString());
  if (!c) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy lớp học phần' } }); return; }
  res.json({ success: true, data: c });
});

const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  const ok = await sisService.deleteCourse(req.params.id);
  if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy lớp học phần' } }); return; }
  res.json({ success: true, message: 'Đã xóa lớp học phần' });
});

// ─── Enrollments ────────────────────────────────────────────────────────────

const listEnrollments = asyncHandler(async (req: Request, res: Response) => {
  const result = await sisService.listEnrollments({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    student: req.query.student as string,
    course: req.query.course as string,
    status: req.query.status as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const createEnrollment = asyncHandler(async (req: Request, res: Response) => {
  try {
    const e = await sisService.createEnrollment(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: e });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'ENROLLMENT_ERROR', message: error.message } });
  }
});

const gradeEnrollment = asyncHandler(async (req: Request, res: Response) => {
  const e = await sisService.gradeEnrollment(req.params.id, req.body, req.user!._id.toString());
  if (!e) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đăng ký' } }); return; }
  res.json({ success: true, data: e, message: 'Đã ghi nhận điểm' });
});

const deleteEnrollment = asyncHandler(async (req: Request, res: Response) => {
  const ok = await sisService.deleteEnrollment(req.params.id);
  if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đăng ký' } }); return; }
  res.json({ success: true, message: 'Đã hủy đăng ký' });
});

// ─── Curricula ──────────────────────────────────────────────────────────────

const listCurricula = asyncHandler(async (req: Request, res: Response) => {
  const result = await sisService.listCurricula({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    department: req.query.department as string,
    status: req.query.status as string,
    degreeType: req.query.degreeType as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const getCurriculumById = asyncHandler(async (req: Request, res: Response) => {
  const c = await sisService.getCurriculumById(req.params.id);
  if (!c) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy chương trình' } }); return; }
  res.json({ success: true, data: c });
});

const createCurriculum = asyncHandler(async (req: Request, res: Response) => {
  try {
    const c = await sisService.createCurriculum(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: c });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const updateCurriculum = asyncHandler(async (req: Request, res: Response) => {
  const c = await sisService.updateCurriculum(req.params.id, req.body, req.user!._id.toString());
  if (!c) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy chương trình' } }); return; }
  res.json({ success: true, data: c });
});

const deleteCurriculum = asyncHandler(async (req: Request, res: Response) => {
  const ok = await sisService.deleteCurriculum(req.params.id);
  if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy chương trình' } }); return; }
  res.json({ success: true, message: 'Đã xóa chương trình' });
});

export const sisController = {
  listStudents, getStudentById, createStudent, updateStudent, deleteStudent, getStudentStats,
  listSubjects, getSubjectById, createSubject, updateSubject, deleteSubject,
  listCourses, getCourseById, createCourse, updateCourse, deleteCourse,
  listEnrollments, createEnrollment, gradeEnrollment, deleteEnrollment,
  listCurricula, getCurriculumById, createCurriculum, updateCurriculum, deleteCurriculum,
};
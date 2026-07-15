// @ts-nocheck
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
  res.json({ 
    success: true, 
    data: result.data, 
    total: result.total,
    page: result.page, 
    pageSize: result.pageSize, 
    totalPages: result.totalPages 
  });
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

const getEnrollmentById = asyncHandler(async (req: Request, res: Response) => {
  const e = await sisService.getEnrollmentById(req.params.id);
  if (!e) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đăng ký' } }); return; }
  res.json({ success: true, data: e });
});

const updateEnrollment = asyncHandler(async (req: Request, res: Response) => {
  const e = await sisService.updateEnrollment(req.params.id, req.body);
  if (!e) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đăng ký' } }); return; }
  res.json({ success: true, data: e });
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

// ─── Graduation Sessions ───────────────────────────────────────────────────

const createGraduationSession = asyncHandler(async (req: Request, res: Response) => {
  try {
    const s = await sisService.createGraduationSession(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: s });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const listGraduationSessions = asyncHandler(async (req: Request, res: Response) => {
  const result = await sisService.listGraduationSessions({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    status: req.query.status as string,
    semester: req.query.semester as string,
    academicYear: req.query.academicYear as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const getGraduationSessionById = asyncHandler(async (req: Request, res: Response) => {
  const s = await sisService.getGraduationSessionById(req.params.id);
  if (!s) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đợt xét' } }); return; }
  res.json({ success: true, data: s });
});

const updateGraduationSession = asyncHandler(async (req: Request, res: Response) => {
  const s = await sisService.updateGraduationSession(req.params.id, req.body, req.user!._id.toString());
  if (!s) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đợt xét' } }); return; }
  res.json({ success: true, data: s });
});

const deleteGraduationSession = asyncHandler(async (req: Request, res: Response) => {
  const ok = await sisService.deleteGraduationSession(req.params.id);
  if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đợt xét' } }); return; }
  res.json({ success: true, message: 'Đã xóa đợt xét' });
});

const getGraduationSessionStudents = asyncHandler(async (req: Request, res: Response) => {
  const result = await sisService.getGraduationSessionStudents(req.params.id);
  res.json({ success: true, data: result.data, pagination: result.pagination });
});

// ─── Graduations ───────────────────────────────────────────────────────────

const createGraduation = asyncHandler(async (req: Request, res: Response) => {
  try {
    const g = await sisService.createGraduation(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: g });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const listGraduations = asyncHandler(async (req: Request, res: Response) => {
  const result = await sisService.listGraduations({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    student: req.query.student as string,
    session: req.query.session as string,
    status: req.query.status as string,
    graduationYear: req.query.graduationYear ? Number(req.query.graduationYear) : undefined,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const getGraduationById = asyncHandler(async (req: Request, res: Response) => {
  const g = await sisService.getGraduationById(req.params.id);
  if (!g) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hồ sơ tốt nghiệp' } }); return; }
  res.json({ success: true, data: g });
});

const updateGraduation = asyncHandler(async (req: Request, res: Response) => {
  const g = await sisService.updateGraduation(req.params.id, req.body, req.user!._id.toString());
  if (!g) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hồ sơ tốt nghiệp' } }); return; }
  res.json({ success: true, data: g });
});

const issueDiploma = asyncHandler(async (req: Request, res: Response) => {
  const { diplomaNo, diplomaDate } = req.body as { diplomaNo: string; diplomaDate: string };
  if (!diplomaNo || !diplomaDate) {
    res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Thiếu số hiệu hoặc ngày cấp bằng' } });
    return;
  }
  const g = await sisService.issueDiploma(req.params.id, diplomaNo, diplomaDate, req.user!._id.toString());
  if (!g) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hồ sơ tốt nghiệp' } }); return; }
  res.json({ success: true, data: g, message: 'Đã cấp bằng tốt nghiệp' });
});

const deleteGraduation = asyncHandler(async (req: Request, res: Response) => {
  const ok = await sisService.deleteGraduation(req.params.id);
  if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hồ sơ tốt nghiệp' } }); return; }
  res.json({ success: true, message: 'Đã xóa hồ sơ tốt nghiệp' });
});

// ─── Internships ───────────────────────────────────────────────────────────

const createInternship = asyncHandler(async (req: Request, res: Response) => {
  try {
    const i = await sisService.createInternship(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: i });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const listInternships = asyncHandler(async (req: Request, res: Response) => {
  const result = await sisService.listInternships({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    status: req.query.status as string,
    major: req.query.major as string,
    search: req.query.search as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const getInternshipById = asyncHandler(async (req: Request, res: Response) => {
  const i = await sisService.getInternshipById(req.params.id);
  if (!i) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hồ sơ thực tập' } }); return; }
  res.json({ success: true, data: i });
});

const updateInternship = asyncHandler(async (req: Request, res: Response) => {
  const i = await sisService.updateInternship(req.params.id, req.body, req.user!._id.toString());
  if (!i) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hồ sơ thực tập' } }); return; }
  res.json({ success: true, data: i });
});

const deleteInternship = asyncHandler(async (req: Request, res: Response) => {
  const ok = await sisService.deleteInternship(req.params.id);
  if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hồ sơ thực tập' } }); return; }
  res.json({ success: true, message: 'Đã xóa hồ sơ thực tập' });
});

// ─── Student Profiles ────────────────────────────────────────────────────────

const getStudentProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await sisService.getStudentProfile(req.params.studentId);
  if (!profile) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hồ sơ sinh viên' } }); return; }
  res.json({ success: true, data: profile });
});

const createOrUpdateStudentProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    const profile = await sisService.createOrUpdateStudentProfile(req.params.studentId, req.body);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } });
  }
});

// ─── Enrollment Lock/Unlock ────────────────────────────────────────────────

const lockEnrollment = asyncHandler(async (req: Request, res: Response) => {
  try {
    const enrollment = await sisService.lockEnrollment(req.params.id, req.user!._id.toString());
    if (!enrollment) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đăng ký' } }); return; }
    res.json({ success: true, data: enrollment, message: 'Đã khóa điểm' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'LOCK_ERROR', message: error.message } });
  }
});

const unlockEnrollment = asyncHandler(async (req: Request, res: Response) => {
  try {
    const enrollment = await sisService.unlockEnrollment(req.params.id);
    if (!enrollment) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đăng ký' } }); return; }
    res.json({ success: true, data: enrollment, message: 'Đã mở khóa điểm' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'UNLOCK_ERROR', message: error.message } });
  }
});

const cancelEnrollment = asyncHandler(async (req: Request, res: Response) => {
  try {
    const enrollment = await sisService.cancelEnrollment(req.params.id);
    if (!enrollment) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đăng ký' } }); return; }
    res.json({ success: true, data: enrollment, message: 'Đã hủy đăng ký' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CANCEL_ERROR', message: error.message } });
  }
});

// ─── Training Systems ───────────────────────────────────────────────────────

const listTrainingSystems = asyncHandler(async (req: Request, res: Response) => {
  const result = await sisService.listTrainingSystems({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    search: req.query.search as string,
    status: req.query.status as string,
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const getTrainingSystemById = asyncHandler(async (req: Request, res: Response) => {
  const ts = await sisService.getTrainingSystemById(req.params.id);
  if (!ts) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hệ đào tạo' } }); return; }
  res.json({ success: true, data: ts });
});

const createTrainingSystem = asyncHandler(async (req: Request, res: Response) => {
  try {
    const ts = await sisService.createTrainingSystem(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: ts });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const updateTrainingSystem = asyncHandler(async (req: Request, res: Response) => {
  const ts = await sisService.updateTrainingSystem(req.params.id, req.body, req.user!._id.toString());
  if (!ts) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hệ đào tạo' } }); return; }
  res.json({ success: true, data: ts });
});

const deleteTrainingSystem = asyncHandler(async (req: Request, res: Response) => {
  const ok = await sisService.deleteTrainingSystem(req.params.id);
  if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hệ đào tạo' } }); return; }
  res.json({ success: true, message: 'Đã xóa hệ đào tạo' });
});

// ─── Specializations ───────────────────────────────────────────────────────

const listSpecializations = asyncHandler(async (req: Request, res: Response) => {
  const result = await sisService.listSpecializations({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    search: req.query.search as string,
    major: req.query.major as string,
    status: req.query.status as string,
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const getSpecializationById = asyncHandler(async (req: Request, res: Response) => {
  const sp = await sisService.getSpecializationById(req.params.id);
  if (!sp) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy chuyên ngành' } }); return; }
  res.json({ success: true, data: sp });
});

const createSpecialization = asyncHandler(async (req: Request, res: Response) => {
  try {
    const sp = await sisService.createSpecialization(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: sp });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const updateSpecialization = asyncHandler(async (req: Request, res: Response) => {
  const sp = await sisService.updateSpecialization(req.params.id, req.body, req.user!._id.toString());
  if (!sp) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy chuyên ngành' } }); return; }
  res.json({ success: true, data: sp });
});

const deleteSpecialization = asyncHandler(async (req: Request, res: Response) => {
  const ok = await sisService.deleteSpecialization(req.params.id);
  if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy chuyên ngành' } }); return; }
  res.json({ success: true, message: 'Đã xóa chuyên ngành' });
});

// ─── Academic Terms ───────────────────────────────────────────────────────

const listAcademicTerms = asyncHandler(async (req: Request, res: Response) => {
  const result = await sisService.listAcademicTerms({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    academicYear: req.query.academicYear as string,
    semester: req.query.semester ? Number(req.query.semester) : undefined,
    status: req.query.status as string,
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});

const getAcademicTermById = asyncHandler(async (req: Request, res: Response) => {
  const at = await sisService.getAcademicTermById(req.params.id);
  if (!at) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy học kỳ' } }); return; }
  res.json({ success: true, data: at });
});

const getCurrentAcademicTerm = asyncHandler(async (_req: Request, res: Response) => {
  const at = await sisService.getCurrentAcademicTerm();
  if (!at) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không có học kỳ hiện tại' } }); return; }
  res.json({ success: true, data: at });
});

const createAcademicTerm = asyncHandler(async (req: Request, res: Response) => {
  try {
    const at = await sisService.createAcademicTerm(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: at });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const updateAcademicTerm = asyncHandler(async (req: Request, res: Response) => {
  const at = await sisService.updateAcademicTerm(req.params.id, req.body, req.user!._id.toString());
  if (!at) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy học kỳ' } }); return; }
  res.json({ success: true, data: at });
});

const deleteAcademicTerm = asyncHandler(async (req: Request, res: Response) => {
  const ok = await sisService.deleteAcademicTerm(req.params.id);
  if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy học kỳ' } }); return; }
  res.json({ success: true, message: 'Đã xóa học kỳ' });
});

export const sisController = {
  listStudents, getStudentById, createStudent, updateStudent, deleteStudent, getStudentStats,
  listSubjects, getSubjectById, createSubject, updateSubject, deleteSubject,
  listCourses, getCourseById, createCourse, updateCourse, deleteCourse,
  listEnrollments, getEnrollmentById, createEnrollment, updateEnrollment, gradeEnrollment, deleteEnrollment,
  lockEnrollment, unlockEnrollment, cancelEnrollment,
  listCurricula, getCurriculumById, createCurriculum, updateCurriculum, deleteCurriculum,
  listGraduationSessions, getGraduationSessionById, getGraduationSessionStudents, createGraduationSession, updateGraduationSession, deleteGraduationSession,
  listGraduations, getGraduationById, createGraduation, updateGraduation, issueDiploma, deleteGraduation,
  listInternships, getInternshipById, createInternship, updateInternship, deleteInternship,
  // Student Profiles
  getStudentProfile, createOrUpdateStudentProfile,
  // Training Systems
  listTrainingSystems, getTrainingSystemById, createTrainingSystem, updateTrainingSystem, deleteTrainingSystem,
  // Specializations
  listSpecializations, getSpecializationById, createSpecialization, updateSpecialization, deleteSpecialization,
  // Academic Terms
  listAcademicTerms, getAcademicTermById, getCurrentAcademicTerm, createAcademicTerm, updateAcademicTerm, deleteAcademicTerm,
};
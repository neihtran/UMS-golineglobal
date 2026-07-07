/**
 * Mock API routes — serves realistic data without MongoDB
 * Mirrors the real backend route structure.
 */
import { Router, Request, Response } from 'express';
import {
  VIEN_CHUC, STUDENTS, DEPARTMENTS, SUBJECTS, COURSES,
  DOCUMENTS, TASKS, ENROLLMENTS, BOOKS, TUITION,
  LEAVE_REQUESTS, EXPENSES, RECRUITMENT, DISCIPLINE,
  APPOINTMENTS, KTX_ROOMS, KTX_REQUESTS, EXAMS,
  OCR_JOBS, INTEGRATIONS, USERS, AUDIT_LOGS,
  SALARY_SHEETS, RESEARCH_PROJECTS, QA_ASSESSMENTS,
  CONTRACT_HISTORY, INTERNSHIPS, API_KEYS,
  STAFF_TRAINING, STAFF_ATTACHMENTS,
} from './data.js';

const router = Router();

// ─── Auth ────────────────────────────────────────────────────────────────────

router.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body as { email: string };

  const found = USERS.find((u) => u.email === email);
  if (!found) {
    res.status(401).json({ success: false, error: { message: 'Tài khoản không tồn tại' } });
    return;
  }

  const user = {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
    avatar: found.avatar,
    permissions: found.permissions,
    unit: found.department,
    lastLogin: found.lastLogin,
    mfaEnabled: found.mfaEnabled === 'enabled',
  };

  res.json({
    success: true,
    user,
    accessToken: `mock-${found.id}-jwt-token`,
    refreshToken: `mock-${found.id}-refresh-token`,
  });
});

router.get('/auth/me', (_req: Request, res: Response) => {
  const u = USERS[0];
  res.json({
    success: true,
    data: {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      permissions: u.permissions,
      unit: u.department,
      lastLogin: u.lastLogin,
      mfaEnabled: u.mfaEnabled === 'enabled',
    },
  });
});

router.post('/auth/refresh', (_req: Request, res: Response) => {
  res.json({ success: true, data: { accessToken: 'mock-jwt-token-refreshed' } });
});

router.post('/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Đăng xuất thành công' });
});

// ─── HRM Stats ────────────────────────────────────────────────────────────────

router.get('/hrm/stats', (_req: Request, res: Response) => {
  const byStatus = {
    active: VIEN_CHUC.filter((v) => v.status === 'active').length,
    trial: VIEN_CHUC.filter((v) => v.status === 'trial').length,
    onLeave: VIEN_CHUC.filter((v) => v.status === 'leave').length,
    inactive: VIEN_CHUC.filter((v) => v.status === 'inactive').length,
  };
  const byContractType = [
    { type: 'Cơ hữu', count: VIEN_CHUC.filter((v) => v.contractType === 'Cơ hữu').length },
    { type: 'Thỉnh giảng', count: VIEN_CHUC.filter((v) => v.contractType === 'Thỉnh giảng').length },
    { type: 'Thử việc', count: VIEN_CHUC.filter((v) => v.contractType === 'Thử việc').length },
  ];
  const byDepartment = DEPARTMENTS.map((d) => ({
    name: d.name,
    count: VIEN_CHUC.filter((v) => v.department?._id === d._id).length,
  })).filter((d) => d.count > 0);
  res.json({
    success: true,
    data: {
      total: VIEN_CHUC.length,
      byStatus,
      byDepartment,
      byContractType,
      expiringContractsThisMonth: 1,
    },
  });
});

// ─── VienChuc ────────────────────────────────────────────────────────────────

// All contracts list (MUST be before /:id to avoid "contracts" being captured as :id)
router.get('/hrm/vien-chuc/contracts', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, search, type, sortBy, sortDir } = req.query as any;
  let filtered = [...CONTRACT_HISTORY];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) => c.employeeName?.toLowerCase().includes(q) || c.employeeCode?.toLowerCase().includes(q)
    );
  }
  if (type) filtered = filtered.filter((c) => c.type === type);
  if (sortBy === 'year') {
    filtered.sort((a, b) => sortDir === 'asc' ? a.year - b.year : b.year - a.year);
  }
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/hrm/vien-chuc', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, search, status, department } = req.query as any;
  let filtered = [...VIEN_CHUC];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (v) => v.name.toLowerCase().includes(q) || v.code.toLowerCase().includes(q)
    );
  }
  if (status) filtered = filtered.filter((v) => v.status === status);
  if (department) filtered = filtered.filter((v) => v.department?._id === department);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  const data = filtered.slice(start, start + +pageSize);
  res.json({
    success: true,
    data,
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/hrm/vien-chuc/:id', (req: Request, res: Response) => {
  const vc = VIEN_CHUC.find((v) => v._id === req.params.id);
  if (!vc) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy viên chức' } }); return; }
  res.json({ success: true, data: vc });
});

router.post('/hrm/vien-chuc', (req: Request, res: Response) => {
  const newVc = { _id: `vc-${Date.now()}`, code: `VC-2024-${String(VIEN_CHUC.length + 1).padStart(3, '0')}`, ...req.body };
  VIEN_CHUC.push(newVc);
  res.status(201).json({ success: true, data: newVc });
});

router.patch('/hrm/vien-chuc/:id', (req: Request, res: Response) => {
  const idx = VIEN_CHUC.findIndex((v) => v._id === req.params.id);
  if (idx === -1) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } }); return; }
  VIEN_CHUC[idx] = { ...VIEN_CHUC[idx], ...req.body };
  res.json({ success: true, data: VIEN_CHUC[idx] });
});

router.delete('/hrm/vien-chuc/:id', (req: Request, res: Response) => {
  const idx = VIEN_CHUC.findIndex((v) => v._id === req.params.id);
  if (idx === -1) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } }); return; }
  VIEN_CHUC.splice(idx, 1);
  res.json({ success: true, message: 'Đã xóa viên chức' });
});

// VienChuc sub-resources
router.get('/hrm/vien-chuc/:id/contracts', (req: Request, res: Response) => {
  const contracts = CONTRACT_HISTORY.filter((c) => c.employeeId === req.params.id);
  res.json({ success: true, data: contracts });
});

router.get('/hrm/vien-chuc/:id/salary', (req: Request, res: Response) => {
  const sheets = SALARY_SHEETS.filter((s) => s.employeeId === req.params.id).map((s) => ({
    _id: s._id,
    employeeId: s.employeeId,
    date: `${s.month}-01`,
    baseSalary: s.baseSalary,
    allowance: s.allowances,
    insurance: s.deductions - (s.bonus || 0),
    netSalary: s.netSalary,
  }));
  res.json({ success: true, data: sheets });
});

router.get('/hrm/vien-chuc/:id/discipline', (req: Request, res: Response) => {
  const discs = DISCIPLINE.filter((d) => d.employeeId === req.params.id).map((d) => ({
    _id: d._id,
    employeeId: d.employeeId,
    year: new Date(d.date).getFullYear(),
    type: d.type === 'warning' ? 'Khen thuong' : 'Ky luat',
    note: d.reason || d.description || '',
    level: d.type === 'warning' ? ('warning' as const) : ('error' as const),
  }));
  res.json({ success: true, data: discs });
});

router.get('/hrm/vien-chuc/:id/appointments', (req: Request, res: Response) => {
  const apts = APPOINTMENTS.filter((a) => a.employeeId === req.params.id).map((a) => ({
    _id: a._id,
    employeeId: a.employeeId,
    type: a.type,
    title: a.title,
    decisionNo: `QD-${a._id.replace('apt-', '')}-2024`,
    decisionDate: a.fromDate,
    effectiveDate: a.fromDate,
    signer: 'Hiệu trưởng',
    status: a.status === 'approved' ? 'Đã phê duyệt' : a.status === 'pending' ? 'Chờ duyệt' : 'Từ chối',
    statusVariant: a.status === 'approved' ? 'success' as const : a.status === 'pending' ? 'warning' as const : 'error' as const,
    isCurrent: a.status === 'approved' && a.toDate === '',
    note: a.note,
  }));
  res.json({ success: true, data: apts });
});

router.get('/hrm/vien-chuc/:id/training', (req: Request, res: Response) => {
  const records = STAFF_TRAINING.filter((t) => t.employeeId === req.params.id);
  res.json({ success: true, data: records });
});

router.get('/hrm/vien-chuc/:id/attachments', (req: Request, res: Response) => {
  const records = STAFF_ATTACHMENTS.filter((a) => a.employeeId === req.params.id);
  res.json({ success: true, data: records });
});

// All contracts list
router.get('/hrm/vien-chuc/contracts', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10 } = req.query as any;
  const total = CONTRACT_HISTORY.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: CONTRACT_HISTORY.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

// ─── Departments ─────────────────────────────────────────────────────────────

router.get('/departments', (req: Request, res: Response) => {
  const { page = 1, pageSize = 50, search, type } = req.query as any;
  let filtered = [...DEPARTMENTS];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q));
  }
  if (type) filtered = filtered.filter((d) => d.type === type);
  res.json({
    success: true,
    data: filtered,
    pagination: { page: +page, pageSize: +pageSize, total: filtered.length, totalPages: 1 },
  });
});

// ─── Leave ───────────────────────────────────────────────────────────────────

router.get('/leave', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, status } = req.query as any;
  let filtered = [...LEAVE_REQUESTS];
  if (status) filtered = filtered.filter((l) => l.status === status);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/leave/:employeeId/balance', (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const year = new Date().getFullYear();
  const records = LEAVE_REQUESTS.filter((l) => l.employeeId === employeeId && l.status === 'approved');

  const byType: Record<string, { used: number }> = {};
  for (const r of records) {
    if (!byType[r.type]) byType[r.type] = { used: 0 };
    byType[r.type].used += r.days;
  }

  const TYPE_CONFIG = [
    { type: 'annual', label: 'Nghỉ phép năm', entitled: 12, color: '#16A34A' },
    { type: 'sick', label: 'Nghỉ ốm', entitled: 30, color: '#2D5D8A' },
    { type: 'unpaid', label: 'Nghỉ không lương', entitled: 0, color: '#94A3B8' },
    { type: 'maternity', label: 'Nghỉ thai sản', entitled: 180, color: '#7C3AED' },
    { type: 'paternity', label: 'Nghỉ phép cha', entitled: 5, color: '#D97706' },
    { type: 'other', label: 'Khác', entitled: 0, color: '#6B7280' },
  ];

  const byTypeResult = TYPE_CONFIG.map((cfg) => {
    const used = byType[cfg.type]?.used ?? 0;
    return {
      type: cfg.type,
      label: cfg.label,
      entitled: cfg.entitled,
      used,
      remaining: cfg.entitled > 0 ? Math.max(0, cfg.entitled - used) : 0,
      color: cfg.color,
    };
  });

  const history = records.map((r) => ({
    id: r._id,
    type: r.type,
    reason: r.reason,
    start: r.startDate,
    end: r.endDate,
    days: r.days,
    status: r.status,
    approver: r.approver || '—',
  }));

  res.json({
    success: true,
    data: {
      employeeId,
      year,
      byType: byTypeResult,
      history,
    },
  });
});

// ─── Recruitment ─────────────────────────────────────────────────────────────

router.get('/recruitment', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, status } = req.query as any;
  let filtered = [...RECRUITMENT];
  if (status) filtered = filtered.filter((r) => r.status === status);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.post('/recruitment', (req: Request, res: Response) => {
  const newItem = { _id: `rec-${Date.now()}`, code: `TD-2024-${String(RECRUITMENT.length + 1).padStart(3, '0')}`, ...req.body };
  RECRUITMENT.push(newItem);
  res.status(201).json({ success: true, data: newItem });
});

router.patch('/recruitment/:id', (req: Request, res: Response) => {
  const idx = RECRUITMENT.findIndex((r) => r._id === req.params.id);
  if (idx === -1) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } }); return; }
  RECRUITMENT[idx] = { ...RECRUITMENT[idx], ...req.body };
  res.json({ success: true, data: RECRUITMENT[idx] });
});

router.delete('/recruitment/:id', (req: Request, res: Response): void => {
  const idx = RECRUITMENT.findIndex((r) => r._id === req.params.id);
  if (idx !== -1) RECRUITMENT.splice(idx, 1);
  res.json({ success: true, message: 'Đã xóa' });
});

// ─── Discipline ───────────────────────────────────────────────────────────────

router.get('/discipline', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10 } = req.query as any;
  const total = DISCIPLINE.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: DISCIPLINE.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

// ─── Salary Sheets ────────────────────────────────────────────────────────────

router.get('/salary-sheets', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, month } = req.query as any;
  let filtered = [...SALARY_SHEETS];
  if (month) filtered = filtered.filter((s) => s.month === month);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

// ─── Appointments ───────────────────────────────────────────────────────────

router.get('/appointments', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, status } = req.query as any;
  let filtered = [...APPOINTMENTS];
  if (status) filtered = filtered.filter((a) => a.status === status);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

// ─── SIS Stats ───────────────────────────────────────────────────────────────

router.get('/sis/stats', (_req: Request, res: Response) => {
  const byStatus = {
    studying: STUDENTS.filter((s) => s.status === 'studying').length,
    graduated: STUDENTS.filter((s) => s.status === 'graduated').length,
    suspended: STUDENTS.filter((s) => s.status === 'suspended').length,
  };
  const byDept = DEPARTMENTS.map((d) => ({
    name: d.name,
    count: STUDENTS.filter((s) => s.department?._id === d._id).length,
  })).filter((d) => d.count > 0);
  res.json({
    success: true,
    data: {
      total: STUDENTS.length,
      byStatus,
      byDepartment: byDept,
      totalSubjects: SUBJECTS.length,
      totalEnrollments: ENROLLMENTS.length,
    },
  });
});

// ─── Students ────────────────────────────────────────────────────────────────

router.get('/sis/students', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, search, status } = req.query as any;
  let filtered = [...STUDENTS];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (s) => s.name.toLowerCase().includes(q) || s.msv.toLowerCase().includes(q)
    );
  }
  if (status) filtered = filtered.filter((s) => s.status === status);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/sis/students/:id', (req: Request, res: Response) => {
  const s = STUDENTS.find((s) => s._id === req.params.id);
  if (!s) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy sinh viên' } }); return; }
  res.json({ success: true, data: s });
});

router.post('/sis/students', (req: Request, res: Response) => {
  const newS = { _id: `sv-${Date.now()}`, msv: `SV-2024-${String(STUDENTS.length + 1).padStart(4, '0')}`, ...req.body };
  STUDENTS.push(newS);
  res.status(201).json({ success: true, data: newS });
});

router.patch('/sis/students/:id', (req: Request, res: Response) => {
  const idx = STUDENTS.findIndex((s) => s._id === req.params.id);
  if (idx === -1) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } }); return; }
  STUDENTS[idx] = { ...STUDENTS[idx], ...req.body };
  res.json({ success: true, data: STUDENTS[idx] });
});

// ─── Subjects ────────────────────────────────────────────────────────────────

router.get('/sis/subjects', (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, search } = req.query as any;
  let filtered = [...SUBJECTS];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
  }
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/sis/subjects/:id', (req: Request, res: Response) => {
  const s = SUBJECTS.find((s) => s._id === req.params.id || s.code === req.params.id);
  if (!s) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy môn học' } }); return; }
  res.json({ success: true, data: s });
});

// ─── Enrollments ─────────────────────────────────────────────────────────────

router.get('/sis/enrollments', (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, studentId, semester } = req.query as any;
  let filtered = [...ENROLLMENTS];
  if (studentId) filtered = filtered.filter((e) => e.studentId === studentId);
  if (semester) filtered = filtered.filter((e) => e.semester === semester);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

// ─── Internships ─────────────────────────────────────────────────────────────

router.get('/sis/internships', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, status } = req.query as any;
  let filtered = [...INTERNSHIPS];
  if (status) filtered = filtered.filter((i) => i.status === status);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

// ─── LMS ─────────────────────────────────────────────────────────────────────

router.get('/lms/courses', (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, search } = req.query as any;
  let filtered = [...COURSES];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/lms/courses/:id', (req: Request, res: Response) => {
  const c = COURSES.find((c) => c._id === req.params.id);
  if (!c) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy khóa học' } }); return; }
  res.json({ success: true, data: c });
});

router.get('/lms/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalCourses: COURSES.length,
      activeStudents: STUDENTS.filter((s) => s.status === 'studying').length,
      completionRate: 79,
    },
  });
});

// ─── EXAM ────────────────────────────────────────────────────────────────────

router.get('/exam/exams', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, status } = req.query as any;
  let filtered = [...EXAMS];
  if (status) filtered = filtered.filter((e) => e.status === status);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/exam/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalExams: EXAMS.length,
      upcoming: EXAMS.filter((e) => e.status === 'scheduled').length,
      completed: EXAMS.filter((e) => e.status === 'completed').length,
    },
  });
});

// ─── DMS ─────────────────────────────────────────────────────────────────────

router.get('/dms/documents', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, type, urgency } = req.query as any;
  let filtered = [...DOCUMENTS];
  if (type) filtered = filtered.filter((d) => d.type === type);
  if (urgency) filtered = filtered.filter((d) => d.urgency === urgency);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/dms/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      total: DOCUMENTS.length,
      pending: DOCUMENTS.filter((d) => d.workflow?.some((w) => w.status === 'pending')).length,
      approved: DOCUMENTS.filter((d) => d.workflow?.every((w) => w.status === 'approved')).length,
    },
  });
});

// ─── WMS ─────────────────────────────────────────────────────────────────────

router.get('/wms/projects', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, status } = req.query as any;
  const projects = RESEARCH_PROJECTS.map((p) => ({
    _id: p._id, name: p.title, code: p.code, description: p.title,
    status: p.status === 'active' ? 'active' : p.status === 'draft' ? 'planning' : 'completed',
    priority: 'high' as const, department: p.dept, managerName: p.leader, managerId: 'user-002',
    startDate: p.startDate, dueDate: p.deadline, progress: p.progress,
    tags: [p.level, p.field], memberNames: p.members, createdBy: 'user-001', createdByName: 'Admin',
    createdAt: p.startDate, updatedAt: new Date().toISOString(),
  }));
  let filtered = projects;
  if (status) filtered = filtered.filter((p) => p.status === status);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/wms/tasks', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, status } = req.query as any;
  let filtered = [...TASKS];
  if (status) filtered = filtered.filter((t) => t.status === status);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  const paged = filtered.slice(start, start + +pageSize).map((t) => ({
    ...t,
    assignedToName: t.assignee,
    assignedTo: t.assigneeId,
    attachmentCount: t.attachments ?? 0,
    commentCount: t.comments ?? 0,
    priority: t.priority as 'low' | 'medium' | 'high' | 'critical',
  }));
  res.json({
    success: true,
    data: paged,
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/wms/tasks/:id', (req: Request, res: Response) => {
  const t = TASKS.find((t) => t._id === req.params.id);
  if (!t) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } }); return; }
  res.json({ success: true, data: { ...t, assignedToName: t.assignee, assignedTo: t.assigneeId } });
});

router.get('/wms/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      total: TASKS.length,
      inProgress: TASKS.filter((t) => t.status === 'in_progress').length,
      done: TASKS.filter((t) => t.status === 'done').length,
      overdue: TASKS.filter((t) => t.status !== 'done' && new Date(t.dueDate) < new Date()).length,
    },
  });
});

// ─── FIN ──────────────────────────────────────────────────────────────────────

router.get('/fin/tuition', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, status } = req.query as any;
  let filtered = [...TUITION];
  if (status) filtered = filtered.filter((t) => t.status === status);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/fin/expenses', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, status } = req.query as any;
  let filtered = [...EXPENSES];
  if (status) filtered = filtered.filter((e) => e.status === status);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/fin/stats', (_req: Request, res: Response) => {
  const totalRevenue = TUITION.reduce((s, t) => s + t.total, 0);
  const totalExpense = EXPENSES.reduce((s, e) => s + e.amount, 0);
  res.json({
    success: true,
    data: {
      totalRevenue,
      totalExpense,
      balance: totalRevenue - totalExpense,
      unpaidCount: TUITION.filter((t) => t.status === 'unpaid').length,
    },
  });
});

// ─── KTX ──────────────────────────────────────────────────────────────────────

router.get('/ktx/rooms', (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, status, building } = req.query as any;
  // Map raw KTX data to Room interface
  const mapped = KTX_ROOMS.map((r) => ({
    _id: r._id,
    roomNumber: r.room,
    building: r.block,
    floor: r.floor,
    roomType: 'dorm' as const,
    capacity: r.capacity,
    currentOccupancy: r.occupied,
    status: r.status as Room['status'],
    genderAllowed: r.gender === 'Nam' ? 'male' as const : r.gender === 'Nữ' ? 'female' as const : 'mixed' as const,
    floorType: 'concrete' as const,
    hasAC: true,
    hasFan: true,
    hasWifi: true,
    hasWaterHeater: false,
    hasDesk: true,
    hasWardrobe: true,
    amenities: ['wifi', 'fan', 'desk', 'wardrobe'],
    monthlyRent: r.price,
    depositAmount: r.price * 2,
    images: [],
    note: r.issues > 0 ? `${r.issues} vấn đề cần xử lý` : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  let filtered = mapped;
  if (status) filtered = filtered.filter((r) => r.status === status);
  if (building) filtered = filtered.filter((r) => r.building === building);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

// Cast helper for TypeScript
type Room = { status: string };

router.get('/ktx/requests', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, status } = req.query as any;
  let filtered = [...KTX_REQUESTS];
  if (status) filtered = filtered.filter((r) => r.status === status);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

// ─── LIB ─────────────────────────────────────────────────────────────────────

router.get('/lib/books', (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, search } = req.query as any;
  const mapped = BOOKS.map((b) => ({
    _id: b._id,
    title: b.title,
    authorNames: [b.author],
    publisherName: b.publisher,
    publishedYear: b.year,
    categoryName: b.category,
    language: b.language === 'EN' ? 'English' : 'Tiếng Việt',
    totalCopies: b.copies,
    availableCopies: b.available,
    borrowCount: b.borrowed,
    isbn: b.isbn,
    barcode: b.code,
    type: 'physical' as const,
    status: b.available > 0 ? 'available' as const : 'borrowed' as const,
    location: `Kệ ${b.code?.slice(0, 2)}`,
    keywords: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  let filtered = mapped;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (b) => b.title.toLowerCase().includes(q) || b.isbn?.toLowerCase().includes(q) || b.authorNames?.[0]?.toLowerCase().includes(q)
    );
  }
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/lib/borrow-records', (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, status } = req.query as any;
  const now = new Date();
  const mapped = Array.from({ length: 12 }, (_, i) => {
    const monthsAgo = i;
    const borrowDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, Math.floor(Math.random() * 20) + 1);
    const dueDate = new Date(borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    const isOverdue = dueDate < now && Math.random() > 0.5;
    const recStatus = isOverdue ? 'overdue' : status || 'borrowed';
    return {
      _id: `br-${i + 1}`,
      bookId: BOOKS[i % BOOKS.length]?._id ?? 'book-001',
      bookTitle: BOOKS[i % BOOKS.length]?.title ?? 'Sách mẫu',
      readerId: STUDENTS[i % STUDENTS.length]?._id ?? 'sv-001',
      readerName: STUDENTS[i % STUDENTS.length]?.name ?? 'Sinh viên',
      readerCode: STUDENTS[i % STUDENTS.length]?.msv ?? 'SV-0000',
      readerType: 'student' as const,
      borrowedDate: borrowDate.toISOString(),
      dueDate: dueDate.toISOString(),
      status: recStatus as 'borrowed' | 'returned' | 'overdue' | 'lost' | 'renewed',
      renewCount: 0,
      maxRenew: 2,
      fineAmount: isOverdue ? Math.floor(Math.random() * 50000) : 0,
      finePaid: 0,
      fineStatus: 'none' as const,
      borrowedBy: 'staff-001',
      note: '',
      createdAt: borrowDate.toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
  let filtered = mapped;
  if (status) filtered = filtered.filter((r) => r.status === status);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/lib/borrow-records/overdue', (_req: Request, res: Response) => {
  const overdue = Array.from({ length: 3 }, (_, i) => {
    const borrowDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dueDate = new Date(borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    return {
      _id: `br-ov-${i + 1}`,
      bookId: BOOKS[i]?._id ?? 'book-001',
      bookTitle: BOOKS[i]?.title ?? 'Sách mẫu',
      readerId: STUDENTS[i]?._id ?? 'sv-001',
      readerName: STUDENTS[i]?.name ?? 'Sinh viên',
      readerCode: STUDENTS[i]?.msv ?? 'SV-0000',
      readerType: 'student' as const,
      borrowedDate: borrowDate.toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'overdue' as const,
      renewCount: 0,
      maxRenew: 2,
      fineAmount: 30000 + i * 15000,
      finePaid: 0,
      fineStatus: 'pending' as const,
      borrowedBy: 'staff-001',
      note: 'Quá hạn trả sách',
      createdAt: borrowDate.toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
  res.json({ success: true, data: overdue });
});

router.get('/lib/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalBooks: BOOKS.reduce((s, b) => s + b.copies, 0),
      borrowed: BOOKS.reduce((s, b) => s + b.borrowed, 0),
      available: BOOKS.reduce((s, b) => s + b.available, 0),
    },
  });
});

// ─── QA ──────────────────────────────────────────────────────────────────────

router.get('/qa/standards', (req: Request, res: Response) => {
  const { page = 1, pageSize = 50 } = req.query as any;
  const standards = Array.from({ length: 8 }, (_, i) => ({
    _id: `std-${i + 1}`,
    code: `TC${i + 1}`,
    title: [
      'Năng lực và Tự chủ của Trường ĐH',
      'Đội ngũ giảng viên và nhân viên',
      'Chương trình đào tạo và Hoạt động dạy học',
      'Nghiên cứu khoa học và Chuyển giao công nghệ',
      'Hỗ trợ sinh viên và Nghiên cứu sinh',
      'Đánh giá chất lượng nội bộ',
      'Điều kiện đảm bảo chất lượng',
      'Dữ liệu và Thông tin',
    ][i],
    description: 'Tiêu chuẩn kiểm định AUN-QA',
    type: 'accreditation' as const,
    version: '3.0',
    effectiveDate: '2024-01-01',
    department: DEPARTMENTS[0]._id,
    departmentName: DEPARTMENTS[0].name,
    criteria: Array.from({ length: 3 }, (_, j) => ({
      code: `TC${i + 1}.${j + 1}`,
      description: `Tiêu chí ${i + 1}.${j + 1}`,
      minScore: 5,
      weight: 10,
    })),
    totalCriteria: 3,
    isActive: i < 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  const total = standards.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: standards.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/qa/evidences', (req: Request, res: Response) => {
  const { page = 1, pageSize = 50, standardId } = req.query as any;
  const evidences = Array.from({ length: 12 }, (_, i) => ({
    _id: `ev-${i + 1}`,
    title: `Minh chứng ${i + 1} - Báo cáo công tác đào tạo`,
    standardId: standardId || `std-${(i % 8) + 1}`,
    standardTitle: `Tiêu chuẩn ${(i % 8) + 1}`,
    criterionCode: `TC${(i % 8) + 1}.1`,
    type: 'document' as const,
    fileSize: 1024 * 1024 * (Math.floor(Math.random() * 10) + 1),
    status: ['draft', 'submitted', 'approved', 'rejected'][i % 4] as 'draft' | 'submitted' | 'approved' | 'rejected',
    uploadedBy: VIEN_CHUC[i % VIEN_CHUC.length]._id,
    uploadedByName: VIEN_CHUC[i % VIEN_CHUC.length].name,
    tags: ['aun-qa', 'bien-soan'],
    createdAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  const total = evidences.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: evidences.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/qa/assessments', (req: Request, res: Response) => {
  const { page = 1, pageSize = 50 } = req.query as any;
  const assessments = Array.from({ length: 8 }, (_, i) => ({
    _id: `asmt-${i + 1}`,
    title: `Đánh giá Tiêu chuẩn ${i + 1} - HK1 2024-2025`,
    standardId: `std-${i + 1}`,
    standardTitle: `Tiêu chuẩn ${i + 1}`,
    department: DEPARTMENTS[0]._id,
    departmentName: DEPARTMENTS[0].name,
    assessorId: VIEN_CHUC[0]._id,
    assessorName: VIEN_CHUC[0].name,
    status: ['draft', 'in_progress', 'submitted', 'reviewed', 'approved'][i % 5] as 'draft' | 'in_progress' | 'submitted' | 'reviewed' | 'approved',
    assessmentDate: new Date(2024, 10 + i, 15).toISOString(),
    results: [],
    overallScore: 0,
    maxOverallScore: 5,
    overallPercentage: Math.floor(Math.random() * 30) + 60,
    overallResult: 'good' as const,
    createdAt: new Date(2024, 9, 1).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  const total = assessments.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: assessments.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/qa/complaints', (req: Request, res: Response) => {
  const { page = 1, pageSize = 50 } = req.query as any;
  const complaints = Array.from({ length: 6 }, (_, i) => ({
    _id: `comp-${i + 1}`,
    title: ['Khiếu nại về điểm thi môn CS101', 'Phản ánh về phòng học A201', 'Khiếu nại thời gian thi', 'Phản ánh dịch vụ thư viện', 'Khiếu nại học phí', 'Phản ánh chất lượng giảng dạy'][i],
    description: 'Nội dung khiếu nại chi tiết',
    type: ['academic', 'facility', 'administrative', 'service', 'financial', 'academic'][i] as 'academic' | 'administrative' | 'harassment' | 'discrimination' | 'facility' | 'service' | 'other',
    priority: ['low', 'normal', 'normal', 'high', 'urgent', 'normal'][i] as 'low' | 'normal' | 'high' | 'urgent',
    status: ['received', 'investigating', 'pending_response', 'resolved', 'escalated', 'closed'][i % 6] as 'received' | 'investigating' | 'pending_response' | 'resolved' | 'escalated' | 'closed',
    complainantId: STUDENTS[i % STUDENTS.length]._id,
    complainantName: STUDENTS[i % STUDENTS.length].name,
    department: DEPARTMENTS[0]._id,
    departmentName: DEPARTMENTS[0].name,
    evidenceUrls: [],
    anonymous: false,
    createdAt: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  const total = complaints.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: complaints.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/qa/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalStandards: 8,
      completed: 3,
      inProgress: 2,
    },
  });
});

// ─── INT ─────────────────────────────────────────────────────────────────────

router.get('/int/integrations', (req: Request, res: Response) => {
  const { page = 1, pageSize = 50 } = req.query as any;
  let filtered = [...INTEGRATIONS];
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/int/integration-logs', (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, integrationId } = req.query as any;
  const now = new Date();
  const logs = Array.from({ length: 20 }, (_, i) => ({
    _id: `log-${i + 1}`,
    integrationId: integrationId || INTEGRATIONS[i % INTEGRATIONS.length]._id,
    integrationName: INTEGRATIONS[i % INTEGRATIONS.length].name,
    type: 'sync' as const,
    level: ['info', 'warning', 'error'][i % 3] as 'info' | 'warning' | 'error',
    status: i % 5 === 0 ? 'failed' : 'success' as 'success' | 'failed' | 'partial',
    endpoint: '/api/sync',
    method: 'POST',
    duration: Math.floor(Math.random() * 5000) + 100,
    recordsProcessed: Math.floor(Math.random() * 100) + 10,
    createdAt: new Date(now.getTime() - i * 2 * 60 * 60 * 1000).toISOString(),
  }));
  let filtered = logs;
  if (integrationId) filtered = filtered.filter((l) => l.integrationId === integrationId);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/int/integrations/:id/logs', (req: Request, res: Response) => {
  const now = new Date();
  const logs = Array.from({ length: 8 }, (_, i) => ({
    _id: `log-${req.params.id}-${i + 1}`,
    integrationId: req.params.id,
    type: 'sync' as const,
    level: 'info' as const,
    status: 'success' as const,
    duration: Math.floor(Math.random() * 3000) + 50,
    recordsProcessed: Math.floor(Math.random() * 50) + 5,
    createdAt: new Date(now.getTime() - i * 3 * 60 * 60 * 1000).toISOString(),
  }));
  res.json({ success: true, data: logs });
});

// ─── BI ──────────────────────────────────────────────────────────────────────

router.get('/bi/reports', (req: Request, res: Response) => {
  const { page = 1, pageSize = 20 } = req.query as any;
  const reports = Array.from({ length: 6 }, (_, i) => ({
    _id: `rpt-${i + 1}`,
    title: ['Báo cáo tuyển sinh', 'Báo cáo học phí', 'Báo cáo nhân sự', 'Báo cáo điểm thi', 'Báo cáo thư viện', 'Báo cáo KTX'][i],
    name: ['Báo cáo tuyển sinh', 'Báo cáo học phí', 'Báo cáo nhân sự', 'Báo cáo điểm thi', 'Báo cáo thư viện', 'Báo cáo KTX'][i],
    type: ['enrollment', 'financial', 'hr', 'academic', 'library', 'facility'][i] as 'enrollment' | 'academic' | 'financial' | 'hr' | 'attendance' | 'research' | 'custom',
    category: 'Tổng hợp',
    isPublic: true,
    visibility: 'public' as const,
    allowedRoles: [],
    allowedDepartments: [],
    dataSource: 'MongoDB',
    parameters: [],
    chartType: 'table' as const,
    columns: [],
    runCount: Math.floor(Math.random() * 50) + 5,
    favoriteCount: Math.floor(Math.random() * 20),
    createdBy: VIEN_CHUC[0]._id,
    createdByName: VIEN_CHUC[0].name,
    tags: ['aun-qa'],
    createdAt: new Date(Date.now() - i * 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  const total = reports.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: reports.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/bi/report-schedules', (req: Request, res: Response) => {
  const { page = 1, pageSize = 20 } = req.query as any;
  const schedules = Array.from({ length: 4 }, (_, i) => ({
    _id: `sch-${i + 1}`,
    reportId: `rpt-${i + 1}`,
    reportTitle: ['Báo cáo tuyển sinh', 'Báo cáo học phí', 'Báo cáo nhân sự', 'Báo cáo điểm thi'][i],
    name: ['Lịch BDTS', 'Lịch BHPhí', 'Lịch BNS', 'Lịch BĐT'][i],
    frequency: ['daily', 'weekly', 'monthly', 'quarterly'][i % 4] as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom',
    recipients: [],
    exportFormat: 'pdf' as const,
    status: 'active' as const,
    nextRunAt: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
    lastRunAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString(),
    lastRunStatus: 'success' as const,
    runCount: Math.floor(Math.random() * 30) + 5,
    createdBy: VIEN_CHUC[0]._id,
    createdByName: VIEN_CHUC[0].name,
    createdAt: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  const total = schedules.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: schedules.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

// ─── RIT ─────────────────────────────────────────────────────────────────────

router.get('/rit/projects', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, status } = req.query as any;
  let filtered = [...RESEARCH_PROJECTS];
  if (status) filtered = filtered.filter((p) => p.status === status);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/rit/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalProjects: RESEARCH_PROJECTS.length,
      activeProjects: RESEARCH_PROJECTS.filter((p) => p.status === 'active').length,
      totalBudget: RESEARCH_PROJECTS.reduce((s, p) => s + p.budget, 0),
    },
  });
});

// ─── OCR ─────────────────────────────────────────────────────────────────────

router.get('/ocr/jobs', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, status } = req.query as any;
  let filtered = [...OCR_JOBS];
  if (status) filtered = filtered.filter((j) => j.status === status);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/ocr/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalJobs: OCR_JOBS.length,
      processed: OCR_JOBS.filter((j) => j.status === 'done').length,
      pending: OCR_JOBS.filter((j) => ['processing', 'review'].includes(j.status)).length,
    },
  });
});

// ─── BI ──────────────────────────────────────────────────────────────────────

router.get('/bi/dashboard', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalStudents: STUDENTS.length,
      totalStaff: VIEN_CHUC.length,
      totalRevenue: TUITION.reduce((s, t) => s + t.total, 0),
      enrollmentRate: 87,
    },
  });
});

// ─── HRM Monthly Trend ─────────────────────────────────────────────────────────

router.get('/hrm/stats/monthly-trend', (_req: Request, res: Response) => {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const monthKey = d.toISOString().slice(0, 7);
    const prevCount = Math.max(0, VIEN_CHUC.length - (11 - i) * 2 + Math.floor(Math.random() * 5));
    const count = prevCount + Math.floor(Math.random() * 5);
    return {
      month: monthKey,
      label: `T${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`,
      count,
      active: Math.floor(count * 0.85),
      trial: Math.floor(count * 0.1),
      inactive: Math.floor(count * 0.05),
    };
  });
  res.json({ success: true, data: months });
});

// ─── Leave Stats ───────────────────────────────────────────────────────────────

router.get('/leave/stats', (_req: Request, res: Response) => {
  const pending = LEAVE_REQUESTS.filter((l) => l.status === 'pending').length;
  const approved = LEAVE_REQUESTS.filter((l) => l.status === 'approved').length;
  const rejected = LEAVE_REQUESTS.filter((l) => l.status === 'rejected').length;
  res.json({
    success: true,
    data: {
      total: LEAVE_REQUESTS.length,
      pending,
      approved,
      rejected,
      approvedPercent: LEAVE_REQUESTS.length > 0 ? Math.round((approved / LEAVE_REQUESTS.length) * 100) : 0,
    },
  });
});

router.get('/leave/balance/:employeeId', (req: Request, res: Response) => {
  const employeeId = req.params.employeeId;
  const vc = VIEN_CHUC.find((v) => v._id === employeeId);
  const byType = [
    { type: 'annual', label: 'Nghỉ phép năm', entitled: 12, used: Math.floor(Math.random() * 8), remaining: 12, color: '#2563EB' },
    { type: 'sick', label: 'Nghỉ ốm', entitled: 6, used: Math.floor(Math.random() * 3), remaining: 6, color: '#DC2626' },
    { type: 'personal', label: 'Nghỉ việc riêng', entitled: 3, used: Math.floor(Math.random() * 2), remaining: 3, color: '#7C3AED' },
    { type: 'unpaid', label: 'Nghỉ không lương', entitled: 30, used: 0, remaining: 30, color: '#6B7280' },
  ].map((t) => ({ ...t, remaining: t.entitled - t.used }));

  const history = LEAVE_REQUESTS.filter((l) => l.employeeId === employeeId).slice(0, 5).map((l) => ({
    id: l._id,
    type: l.type,
    startDate: l.startDate,
    endDate: l.endDate,
    status: l.status,
    reason: l.reason,
  }));

  res.json({
    success: true,
    data: {
      employeeId,
      year: new Date().getFullYear(),
      byType,
      history,
    },
  });
});

// ─── Portal Announcements ───────────────────────────────────────────────────────

router.get('/portal/announcements', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10 } = req.query as any;
  const ANNOUNCEMENTS = [
    { _id: 'ann-001', title: 'Thông báo về lịch thi học kỳ 2 năm học 2025-2026', content: 'Trường thông báo lịch thi học kỳ 2 sẽ bắt đầu từ ngày 15/06/2026. Sinh viên cần chuẩn bị đầy đủ giấy tờ.', category: 'academic', priority: 'high', authorId: 'vc-001', authorName: 'PGS.TS. Nguyễn Thị Lan', department: 'Phòng Đào tạo', views: 1523, isPinned: true, isActive: true, createdAt: '2026-06-01T08:00:00Z', updatedAt: '2026-06-01T08:00:00Z' },
    { _id: 'ann-002', title: 'Kế hoạch nghỉ hè cho cán bộ và giảng viên', content: 'Kế hoạch nghỉ hè được triển khai từ ngày 01/07/2026 đến 15/08/2026. Các đơn vị sắp xếp công việc trước ngày 28/06.', category: 'hr', priority: 'normal', authorId: 'vc-002', authorName: 'TS. Trần Văn Minh', department: 'Phòng Tổ chức', views: 892, isPinned: false, isActive: true, createdAt: '2026-06-03T10:30:00Z', updatedAt: '2026-06-03T10:30:00Z' },
    { _id: 'ann-003', title: 'Thông báo thu học phí học kỳ 3 năm học 2025-2026', content: 'Sinh viên thực hiện đóng học phí qua cổng thanh toán trực tuyến trước ngày 20/07/2026. Học phí tăng 5% so với HK trước.', category: 'financial', priority: 'high', authorId: 'vc-003', authorName: 'ThS. Lê Thị Hương', department: 'Phòng Tài chính', views: 2341, isPinned: true, isActive: true, createdAt: '2026-06-05T09:00:00Z', updatedAt: '2026-06-05T09:00:00Z' },
    { _id: 'ann-004', title: 'Kết quả đánh giá kiểm định chất lượng giáo dục AUN-QA', content: 'Trường đã hoàn thành đánh giá ngoài và đạt 7/8 tiêu chuẩn. Kết quả chi tiết được công bố trên cổng thông tin.', category: 'quality', priority: 'normal', authorId: 'vc-004', authorName: 'PGS.TS. Hoàng Văn Nam', department: 'Phòng Khảo thí & Đảm bảo chất lượng', views: 567, isPinned: false, isActive: true, createdAt: '2026-06-07T14:00:00Z', updatedAt: '2026-06-07T14:00:00Z' },
    { _id: 'ann-005', title: 'Tuyển sinh chương trình Thạc sĩ chuyên ngành CNTT 2026', content: 'Trường thông báo tuyển sinh Chương trình Thạc sĩ CNTT đợt 2 năm 2026. Hạn nộp hồ sơ: 30/07/2026.', category: 'admission', priority: 'normal', authorId: 'vc-005', authorName: 'TS. Phạm Thị Mai', department: 'Khoa Công nghệ thông tin', views: 1102, isPinned: false, isActive: true, createdAt: '2026-06-10T11:00:00Z', updatedAt: '2026-06-10T11:00:00Z' },
    { _id: 'ann-006', title: 'Cảnh báo an ninh mạng - Lừa đảo email giả mạo', content: 'Phòng CNTT cảnh báo về các email giả mạo đang lan truyền. Cán bộ không mở link lạ từ email không rõ nguồn gốc.', category: 'security', priority: 'high', authorId: 'vc-006', authorName: 'CN. Vũ Đình Tuấn', department: 'Phòng CNTT', views: 3201, isPinned: false, isActive: true, createdAt: '2026-06-12T08:30:00Z', updatedAt: '2026-06-12T08:30:00Z' },
  ];
  const total = ANNOUNCEMENTS.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: ANNOUNCEMENTS.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/portal/notifications', (req: Request, res: Response) => {
  const { page = 1, pageSize = 20 } = req.query as any;
  const NOTIFICATIONS = [
    { _id: 'notif-001', title: 'Đơn nghỉ phép của bạn đã được phê duyệt', content: 'Đơn nghỉ phép ngày 15-16/07/2026 đã được Trưởng phòng duyệt.', type: 'approval', isRead: false, createdAt: '2026-07-06T10:00:00Z' },
    { _id: 'notif-002', title: 'Có bình luận mới trong công việc "Hoàn thiện báo cáo QAF"', content: 'Nguyễn Thị Lan đã bình luận: "Phần minh chứng cần bổ sung thêm biên bản họp."', type: 'comment', isRead: false, createdAt: '2026-07-06T09:30:00Z' },
    { _id: 'notif-003', title: 'Nhắc nhở: Hạn nộp báo cáo công tác tháng 6', content: 'Bạn còn 2 ngày để nộp báo cáo công tác tháng 6/2026. Vui lòng truy cập hệ thống WMS để cập nhật.', type: 'reminder', isRead: false, createdAt: '2026-07-06T08:00:00Z' },
    { _id: 'notif-004', title: 'Cập nhật chính sách học phí mới', content: 'Từ học kỳ 3, học phí được điều chỉnh tăng 5%. Xem chi tiết tại mục Tài chính.', type: 'announcement', isRead: true, createdAt: '2026-07-05T16:00:00Z' },
    { _id: 'notif-005', title: 'Lịch họp giao ban tháng 7/2026', content: 'Cuộc họp giao ban tháng 7 sẽ diễn ra vào ngày 10/07/2026 lúc 14:00 tại Hội trường A. Tham dự bắt buộc.', type: 'event', isRead: true, createdAt: '2026-07-04T11:00:00Z' },
    { _id: 'notif-006', title: 'Tài liệu mới được chia sẻ: "Hướng dẫn quy trình tuyển dụng"', content: 'Phòng Tổ chức đã chia sẻ tài liệu mới trong thư viện số. Truy cập DMS để tải về.', type: 'document', isRead: true, createdAt: '2026-07-03T14:30:00Z' },
    { _id: 'notif-007', title: 'Thông báo nghỉ lễ Quốc khánh 2/9', content: 'Trường nghỉ lễ Quốc khánh từ ngày 01/09 đến 03/09/2026. Lịch học và lịch trực được điều chỉnh.', type: 'holiday', isRead: true, createdAt: '2026-07-01T09:00:00Z' },
    { _id: 'notif-008', title: 'Cảm ơn bạn đã hoàn thành khảo sát hài lòng người học', content: 'Kết quả khảo sát cho thấy mức độ hài lòng đạt 87%. Cảm ơn sự đóng góp của bạn.', type: 'survey', isRead: true, createdAt: '2026-06-28T10:00:00Z' },
  ];
  const total = NOTIFICATIONS.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: NOTIFICATIONS.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/portal/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      announcements: 6,
      unreadNotifications: 3,
    },
  });
});

// ─── DCE ─────────────────────────────────────────────────────────────────────

router.get('/dce/competencies', (req: Request, res: Response) => {
  const { page = 1, pageSize = 20 } = req.query as any;
  const COMPETENCIES = [
    { _id: 'comp-001', code: 'DCV-01', name: 'Kỹ năng sử dụng máy tính cơ bản', description: 'Sử dụng thành thạo hệ điều hành, phần mềm văn phòng', category: 'IT', level: 'foundation', duration: 20, credits: 2, department: DEPARTMENTS[0]._id, departmentName: DEPARTMENTS[0].name, enrollmentCount: 245, certifiedCount: 210, status: 'active', tags: ['IT', 'văn phòng', 'cơ bản'], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
    { _id: 'comp-002', code: 'DCV-02', name: 'Kỹ năng an toàn thông tin', description: 'Nhận diện và phòng tránh các mối đe dọa an ninh mạng, mã độc, lừa đảo', category: 'Security', level: 'intermediate', duration: 16, credits: 1.5, department: DEPARTMENTS[0]._id, departmentName: DEPARTMENTS[0].name, enrollmentCount: 189, certifiedCount: 156, status: 'active', tags: ['Security', 'an ninh', 'cyber'], createdAt: '2024-01-15T00:00:00Z', updatedAt: '2026-05-20T00:00:00Z' },
    { _id: 'comp-003', code: 'DCV-03', name: 'Kỹ năng làm việc nhóm trực tuyến', description: 'Phối hợp hiệu quả qua các công cụ như Zoom, Teams, Google Meet', category: 'Collaboration', level: 'foundation', duration: 12, credits: 1, department: DEPARTMENTS[1]._id, departmentName: DEPARTMENTS[1].name, enrollmentCount: 312, certifiedCount: 289, status: 'active', tags: ['Collaboration', 'teamwork', 'remote'], createdAt: '2024-02-01T00:00:00Z', updatedAt: '2026-06-10T00:00:00Z' },
    { _id: 'comp-004', code: 'DCV-04', name: 'Kỹ năng quản lý thời gian', description: 'Lập kế hoạch, ưu tiên công việc, sử dụng công cụ quản lý dự án', category: 'Productivity', level: 'intermediate', duration: 18, credits: 2, department: DEPARTMENTS[2]._id, departmentName: DEPARTMENTS[2].name, enrollmentCount: 178, certifiedCount: 145, status: 'active', tags: ['Productivity', 'time-management'], createdAt: '2024-03-01T00:00:00Z', updatedAt: '2026-04-15T00:00:00Z' },
    { _id: 'comp-005', code: 'DCV-05', name: 'Kỹ năng giao tiếp số', description: 'Viết email chuyên nghiệp, trình bày nội dung trực tuyến, thuyết trình qua web', category: 'Communication', level: 'foundation', duration: 14, credits: 1, department: DEPARTMENTS[3]._id, departmentName: DEPARTMENTS[3].name, enrollmentCount: 267, certifiedCount: 234, status: 'active', tags: ['Communication', 'presentation'], createdAt: '2024-03-15T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
    { _id: 'comp-006', code: 'DCV-06', name: 'Phân tích dữ liệu cơ bản', description: 'Sử dụng Excel nâng cao, Power BI để trực quan hóa và phân tích dữ liệu', category: 'Data', level: 'advanced', duration: 30, credits: 3, department: DEPARTMENTS[4]._id, departmentName: DEPARTMENTS[4].name, enrollmentCount: 134, certifiedCount: 98, status: 'active', tags: ['Data', 'Power BI', 'Excel'], createdAt: '2024-04-01T00:00:00Z', updatedAt: '2026-06-20T00:00:00Z' },
  ];
  const total = COMPETENCIES.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: COMPETENCIES.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/dce/courses', (req: Request, res: Response) => {
  const { page = 1, pageSize = 20 } = req.query as any;
  const COURSES = [
    { _id: 'dce-course-001', code: 'DCS-01', name: 'Khóa học Năng lực số cho người mới bắt đầu', description: 'Tổng quan về năng lực số, các công cụ cơ bản trong thời đại số hóa', instructorId: VIEN_CHUC[0]._id, instructorName: VIEN_CHUC[0].name, department: DEPARTMENTS[0].name, category: 'foundation', level: 'foundation', enrollmentCount: 320, certifiedCount: 287, avgScore: 8.4, duration: 40, credits: 3, status: 'active', tags: ['foundation', 'digital-literacy'], createdAt: '2024-01-10T00:00:00Z', updatedAt: '2026-06-15T00:00:00Z' },
    { _id: 'dce-course-002', code: 'DCS-02', name: 'Ứng dụng AI trong công tác hành chính', description: 'Sử dụng ChatGPT, Copilot và các công cụ AI để nâng cao hiệu suất làm việc', instructorId: VIEN_CHUC[1]._id, instructorName: VIEN_CHUC[1].name, department: DEPARTMENTS[1].name, category: 'AI', level: 'advanced', enrollmentCount: 156, certifiedCount: 134, avgScore: 9.1, duration: 24, credits: 2, status: 'active', tags: ['AI', 'productivity', 'advanced'], createdAt: '2024-03-01T00:00:00Z', updatedAt: '2026-06-20T00:00:00Z' },
    { _id: 'dce-course-003', code: 'DCS-03', name: 'Thiết kế tài liệu số với Canva', description: 'Tạo tài liệu hướng dẫn, bài thuyết trình chuyên nghiệp bằng Canva', instructorId: VIEN_CHUC[2]._id, instructorName: VIEN_CHUC[2].name, department: DEPARTMENTS[2].name, category: 'Design', level: 'intermediate', enrollmentCount: 198, certifiedCount: 176, avgScore: 8.7, duration: 16, credits: 1.5, status: 'active', tags: ['design', 'canva', 'documentation'], createdAt: '2024-04-01T00:00:00Z', updatedAt: '2026-05-30T00:00:00Z' },
  ];
  const total = COURSES.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: COURSES.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/dce/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalCompetencies: 6,
      totalCourses: 3,
      enrolledStaff: 876,
      certifiedStaff: 1320,
      averageScore: 8.7,
    },
  });
});

// ─── PMS ─────────────────────────────────────────────────────────────────────

router.get('/pms/members', (req: Request, res: Response) => {
  const { page = 1, pageSize = 20 } = req.query as any;
  const PMS_MEMBERS = [
    { _id: 'pms-001', name: 'Nguyễn Văn Minh', code: 'ĐCS-001', dateOfBirth: '1975-03-15', gender: 'Nam', position: 'Đảng viên chính thức', unit: DEPARTMENTS[0].name, joinDate: '2000-06-01', status: 'active', trainingCount: 12, disciplines: 0, note: '', createdAt: '2020-01-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
    { _id: 'pms-002', name: 'Trần Thị Hương', code: 'ĐCS-002', dateOfBirth: '1980-07-22', gender: 'Nữ', position: 'Đảng viên chính thức', unit: DEPARTMENTS[1].name, joinDate: '2005-03-20', status: 'active', trainingCount: 8, disciplines: 0, note: '', createdAt: '2020-01-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
    { _id: 'pms-003', name: 'Lê Văn Nam', code: 'ĐCS-003', dateOfBirth: '1972-11-08', gender: 'Nam', position: 'Đảng ủy viên', unit: DEPARTMENTS[2].name, joinDate: '1998-07-01', status: 'active', trainingCount: 15, disciplines: 0, note: 'UV Đảng ủy nhiệm kỳ 2025-2030', createdAt: '2020-01-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
    { _id: 'pms-004', name: 'Phạm Thị Lan', code: 'ĐCS-004', dateOfBirth: '1985-05-30', gender: 'Nữ', position: 'Đảng viên chính thức', unit: DEPARTMENTS[3].name, joinDate: '2010-09-15', status: 'active', trainingCount: 6, disciplines: 0, note: '', createdAt: '2020-01-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
    { _id: 'pms-005', name: 'Hoàng Văn Tuấn', code: 'ĐCS-005', dateOfBirth: '1978-09-12', gender: 'Nam', position: 'Bí thư Chi bộ', unit: DEPARTMENTS[0].name, joinDate: '1999-12-01', status: 'active', trainingCount: 18, disciplines: 0, note: 'Bí thư Chi bộ nhiệm kỳ 2025-2028', createdAt: '2020-01-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
    { _id: 'pms-006', name: 'Vũ Thị Mai', code: 'ĐCS-006', dateOfBirth: '1990-02-14', gender: 'Nữ', position: 'Đảng viên dự bị', unit: DEPARTMENTS[4].name, joinDate: '2024-06-15', status: 'probation', trainingCount: 2, disciplines: 0, note: 'Đang trong thời gian dự bị', createdAt: '2024-06-15T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  ];
  const total = PMS_MEMBERS.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: PMS_MEMBERS.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/pms/reports', (req: Request, res: Response) => {
  const { page = 1, pageSize = 10 } = req.query as any;
  const PMS_REPORTS = [
    { _id: 'pms-rpt-001', title: 'Báo cáo công tác Đảng 6 tháng đầu năm 2026', type: 'periodic', period: '2026-H1', department: DEPARTMENTS[0].name, status: 'submitted', submittedBy: 'Nguyễn Văn Minh', submittedAt: '2026-06-30T16:00:00Z', createdAt: '2026-06-25T00:00:00Z', updatedAt: '2026-06-30T16:00:00Z' },
    { _id: 'pms-rpt-002', title: 'Báo cáo kết nạp Đảng viên mới quý 2/2026', type: 'quarterly', period: '2026-Q2', department: DEPARTMENTS[0].name, status: 'approved', submittedBy: 'Lê Văn Nam', submittedAt: '2026-06-28T10:00:00Z', createdAt: '2026-06-20T00:00:00Z', updatedAt: '2026-06-28T10:00:00Z' },
    { _id: 'pms-rpt-003', title: 'Báo cáo kiểm điểm Đảng viên cuối năm 2025', type: 'annual', period: '2025', department: DEPARTMENTS[1].name, status: 'approved', submittedBy: 'Trần Thị Hương', submittedAt: '2025-12-15T14:00:00Z', createdAt: '2025-12-10T00:00:00Z', updatedAt: '2025-12-15T14:00:00Z' },
  ];
  const total = PMS_REPORTS.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: PMS_REPORTS.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

// ─── VienChuc sub-resources ───────────────────────────────────────────────────

router.get('/hrm/vien-chuc/:id/training', (req: Request, res: Response) => {
  const vc = VIEN_CHUC.find((v) => v._id === req.params.id);
  if (!vc) { res.status(404).json({ success: false, error: { message: 'Không tìm thấy' } }); return; }
  const trainings = [
    { _id: `train-001-${req.params.id}`, employeeId: req.params.id, employeeName: vc.name, courseName: 'Khóa bồi dưỡng nghiệp vụ Sư phạm', provider: 'Trường ĐHSPHN', startDate: '2025-07-10', endDate: '2025-07-25', hours: 90, certificate: 'Có', certificateNumber: `CD-2025-${req.params.id.slice(-4)}`, status: 'completed', score: 8.5, type: 'pedagogy', location: 'Hà Nội', fee: 2500000, createdAt: '2025-07-01T00:00:00Z' },
    { _id: `train-002-${req.params.id}`, employeeId: req.params.id, employeeName: vc.name, courseName: 'Ứng dụng AI trong giảng dạy đại học', provider: 'Viện CNTT - ĐHQGHN', startDate: '2025-03-15', endDate: '2025-04-05', hours: 40, certificate: 'Có', certificateNumber: `CD-2025-AI-${req.params.id.slice(-4)}`, status: 'completed', score: 9.2, type: 'IT', location: 'Hà Nội', fee: 1500000, createdAt: '2025-03-01T00:00:00Z' },
    { _id: `train-003-${req.params.id}`, employeeId: req.params.id, employeeName: vc.name, courseName: 'Nghiệp vụ kiểm định chất lượng giáo dục', provider: 'Cục Khảo thí và ĐBCLGD', startDate: '2024-11-20', endDate: '2024-11-30', hours: 60, certificate: 'Có', certificateNumber: `CD-2024-KD-${req.params.id.slice(-4)}`, status: 'completed', score: 8.0, type: 'quality', location: 'Hà Nội', fee: 3000000, createdAt: '2024-11-10T00:00:00Z' },
    { _id: `train-004-${req.params.id}`, employeeId: req.params.id, employeeName: vc.name, courseName: 'Phát triển chương trình đào tạo theo CDIO', provider: 'Trường ĐHBK Hà Nội', startDate: '2024-08-05', endDate: '2024-08-20', hours: 48, certificate: 'Có', certificateNumber: `CD-2024-CDIO-${req.params.id.slice(-4)}`, status: 'completed', score: 8.8, type: 'curriculum', location: 'Hà Nội', fee: 2000000, createdAt: '2024-07-25T00:00:00Z' },
    { _id: `train-005-${req.params.id}`, employeeId: req.params.id, employeeName: vc.name, courseName: 'Kỹ năng lãnh đạo và quản lý', provider: 'Học viện Hành chính Quốc gia', startDate: '2026-08-10', endDate: '2026-08-20', hours: 80, certificate: 'Đang học', certificateNumber: '', status: 'in_progress', score: 0, type: 'leadership', location: 'Hà Nội', fee: 5000000, createdAt: '2026-07-01T00:00:00Z' },
  ];
  res.json({ success: true, data: trainings });
});

router.get('/hrm/vien-chuc/:id/attachments', (req: Request, res: Response) => {
  const vc = VIEN_CHUC.find((v) => v._id === req.params.id);
  if (!vc) { res.status(404).json({ success: false, error: { message: 'Không tìm thấy' } }); return; }
  const attachments = [
    { _id: `att-001-${req.params.id}`, employeeId: req.params.id, type: 'cv', name: 'Sơ yếu lý lịch', fileName: 'so-yeu-ly-lich.pdf', fileSize: 245760, mimeType: 'application/pdf', uploadedBy: 'Nguyễn Văn Minh', uploadedAt: '2020-03-15T10:00:00Z', url: '#' },
    { _id: `att-002-${req.params.id}`, employeeId: req.params.id, type: 'diploma', name: 'Bằng tốt nghiệp ĐH', fileName: 'bang-dai-hoc.pdf', fileSize: 512000, mimeType: 'application/pdf', uploadedBy: 'Nguyễn Văn Minh', uploadedAt: '2020-03-15T10:05:00Z', url: '#' },
    { _id: `att-003-${req.params.id}`, employeeId: req.params.id, type: 'certificate', name: 'Chứng chỉ nghiệp vụ sư phạm', fileName: 'chung-chi-nvsp.pdf', fileSize: 180224, mimeType: 'application/pdf', uploadedBy: 'Nguyễn Văn Minh', uploadedAt: '2020-03-15T10:10:00Z', url: '#' },
    { _id: `att-004-${req.params.id}`, employeeId: req.params.id, type: 'id_card', name: 'CMND/CCCD mặt trước', fileName: 'cccd-mt.pdf', fileSize: 102400, mimeType: 'application/pdf', uploadedBy: 'Nguyễn Văn Minh', uploadedAt: '2020-03-15T10:15:00Z', url: '#' },
    { _id: `att-005-${req.params.id}`, employeeId: req.params.id, type: 'health_cert', name: 'Giấy khám sức khỏe', fileName: 'giay-kham-sk.pdf', fileSize: 153600, mimeType: 'application/pdf', uploadedBy: 'Nguyễn Văn Minh', uploadedAt: '2020-03-15T10:20:00Z', url: '#' },
  ];
  res.json({ success: true, data: attachments });
});

// ─── WMS Task Comments ────────────────────────────────────────────────────────

router.get('/wms/tasks/:id/comments', (req: Request, res: Response) => {
  const taskId = req.params.id;
  const comments = [
    { _id: `cmt-001-${taskId}`, taskId, authorId: 'vc-001', authorName: 'Nguyễn Văn Minh', authorRole: 'Trưởng phòng', content: 'Đã hoàn thành phần thu thập dữ liệu. Đang tiến hành phân tích số liệu thống kê.', createdAt: '2026-07-05T14:30:00Z', mentions: [] },
    { _id: `cmt-002-${taskId}`, taskId, authorId: 'vc-002', authorName: 'Trần Thị Lan', authorRole: 'Chuyên viên', content: 'Tôi đã cập nhật file báo cáo tổng hợp. Vui lòng xem lại phần kết luận.', createdAt: '2026-07-06T09:00:00Z', mentions: ['vc-001'] },
    { _id: `cmt-003-${taskId}`, taskId, authorId: 'vc-001', authorName: 'Nguyễn Văn Minh', authorRole: 'Trưởng phòng', content: 'Đã xem. Kết luận cần bổ sung thêm biên bản cuộc họp. Deadline gia hạn đến 15/07.', createdAt: '2026-07-06T10:15:00Z', mentions: [] },
  ];
  res.json({ success: true, data: comments });
});

// ─── PMS ─────────────────────────────────────────────────────────────────────

router.get('/sessions', (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, search } = req.query as any;
  const SESSIONS_DATA = [
    { _id: 's01', userId: USERS[0]._id, userName: USERS[0].name, userEmail: USERS[0].email, userRole: USERS[0].role, device: 'Chrome on Windows', browser: 'Chrome 126', os: 'Windows 11', ip: '10.0.1.45', location: 'Hà Nội, VN', loginTime: '2026-07-06 08:00:00', lastActivity: '2026-07-06 11:30:15', status: 'active' as const, isCurrent: true },
    { _id: 's02', userId: USERS[1]._id, userName: USERS[1].name, userEmail: USERS[1].email, userRole: USERS[1].role, device: 'Safari on macOS', browser: 'Safari 17', os: 'macOS Sonoma', ip: '10.0.2.18', location: 'Hà Nội, VN', loginTime: '2026-07-06 09:00:00', lastActivity: '2026-07-06 11:28:44', status: 'active' as const, isCurrent: false },
    { _id: 's03', userId: USERS[0]._id, userName: USERS[0].name, userEmail: USERS[0].email, userRole: USERS[0].role, device: 'Firefox on Windows', browser: 'Firefox 127', os: 'Windows 10', ip: '203.162.45.67', location: 'Hồ Chí Minh, VN', loginTime: '2026-07-05 22:10:00', lastActivity: '2026-07-05 22:10:33', status: 'active' as const, isCurrent: false },
    { _id: 's04', userId: USERS[2]._id, userName: USERS[2].name, userEmail: USERS[2].email, userRole: USERS[2].role, device: 'Edge on Windows', browser: 'Edge 125', os: 'Windows 10', ip: '10.0.3.22', location: 'Hà Nội, VN', loginTime: '2026-07-06 07:45:00', lastActivity: '2026-07-06 10:55:02', status: 'active' as const, isCurrent: false },
    { _id: 's05', userId: USERS[3]._id, userName: USERS[3].name, userEmail: USERS[3].email, userRole: USERS[3].role, device: 'Chrome on Android', browser: 'Chrome Mobile 126', os: 'Android 14', ip: '113.23.45.67', location: 'Hải Phòng, VN', loginTime: '2026-07-01 13:55:00', lastActivity: '2026-07-01 14:00:00', status: 'expired' as const, isCurrent: false },
    { _id: 's06', userId: USERS[4]._id, userName: USERS[4].name, userEmail: USERS[4].email, userRole: USERS[4].role, device: 'Chrome on iPhone', browser: 'Safari Mobile 17', os: 'iOS 17', ip: '118.71.22.33', location: 'Đà Nẵng, VN', loginTime: '2026-07-04 16:15:00', lastActivity: '2026-07-04 16:20:00', status: 'expired' as const, isCurrent: false },
    { _id: 's07', userId: USERS[5]._id, userName: USERS[5].name, userEmail: USERS[5].email, userRole: USERS[5].role, device: 'Chrome on Windows', browser: 'Chrome 126', os: 'Windows 11', ip: '14.162.78.90', location: 'Cần Thơ, VN', loginTime: '2026-07-06 09:05:00', lastActivity: '2026-07-06 09:10:22', status: 'active' as const, isCurrent: false },
    { _id: 's08', userId: USERS[6]._id, userName: USERS[6].name, userEmail: USERS[6].email, userRole: USERS[6].role, device: 'Chrome on Windows', browser: 'Chrome 126', os: 'Windows 10', ip: '10.0.3.55', location: 'Hà Nội, VN', loginTime: '2026-07-06 08:00:00', lastActivity: '2026-07-06 11:15:00', status: 'active' as const, isCurrent: false },
    { _id: 's09', userId: USERS[7]._id, userName: USERS[7].name, userEmail: USERS[7].email, userRole: USERS[7].role, device: 'Safari on iPad', browser: 'Safari 18', os: 'iPadOS 18', ip: '10.0.1.1', location: 'Hà Nội, VN', loginTime: '2026-07-06 07:00:00', lastActivity: '2026-07-06 07:30:00', status: 'active' as const, isCurrent: false },
    { _id: 's10', userId: USERS[8]._id, userName: USERS[8].name, userEmail: USERS[8].email, userRole: USERS[8].role, device: 'Chrome on Windows', browser: 'Chrome 126', os: 'Windows 11', ip: '10.0.1.2', location: 'Hà Nội, VN', loginTime: '2026-07-05 08:30:00', lastActivity: '2026-07-05 16:45:00', status: 'active' as const, isCurrent: false },
    { _id: 's11', userId: USERS[9]._id, userName: USERS[9].name, userEmail: USERS[9].email, userRole: USERS[9].role, device: 'Chrome on macOS', browser: 'Chrome 126', os: 'macOS Sonoma', ip: '10.0.2.50', location: 'Hà Nội, VN', loginTime: '2026-07-06 07:45:00', lastActivity: '2026-07-06 08:10:00', status: 'active' as const, isCurrent: false },
  ];
  let filtered = [...SESSIONS_DATA];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (s) => s.userName.toLowerCase().includes(q) || s.userEmail.toLowerCase().includes(q)
    );
  }
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.post('/sessions/:id/revoke', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Đã thu hồi phiên đăng nhập' });
});

router.post('/sessions/revoke-all', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Đã thu hồi tất cả phiên đăng nhập' });
});

// ─── IAM ─────────────────────────────────────────────────────────────────────

router.get('/users', (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, search, role, status } = req.query as Record<string, string>;
  let filtered = [...USERS];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (u) => (u.name ?? u.email).toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }
  if (role) filtered = filtered.filter((u) => u.role === role);
  if (status) filtered = filtered.filter((u) => u.status === status);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

router.get('/users/:id', (req: Request, res: Response) => {
  const u = USERS.find((u) => u._id === req.params.id);
  if (!u) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy người dùng' } }); return; }
  res.json({ success: true, data: u });
});

router.post('/users', (req: Request, res: Response) => {
  const newUser = { _id: `user-${Date.now()}`, ...req.body };
  USERS.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

router.patch('/users/:id', (req: Request, res: Response) => {
  const idx = USERS.findIndex((u) => u._id === req.params.id);
  if (idx === -1) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } }); return; }
  USERS[idx] = { ...USERS[idx], ...req.body };
  res.json({ success: true, data: USERS[idx] });
});

router.delete('/users/:id', (req: Request, res: Response) => {
  const idx = USERS.findIndex((u) => u._id === req.params.id);
  if (idx === -1) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } }); return; }
  USERS.splice(idx, 1);
  res.json({ success: true, message: 'Đã xóa tài khoản' });
});

router.post('/users/:id/lock', (req: Request, res: Response) => {
  const idx = USERS.findIndex((u) => u._id === req.params.id);
  if (idx === -1) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } }); return; }
  USERS[idx] = { ...USERS[idx], status: 'locked' };
  res.json({ success: true, message: 'Đã khóa tài khoản' });
});

router.post('/users/:id/unlock', (req: Request, res: Response) => {
  const idx = USERS.findIndex((u) => u._id === req.params.id);
  if (idx === -1) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } }); return; }
  USERS[idx] = { ...USERS[idx], status: 'active' };
  res.json({ success: true, message: 'Đã mở khóa tài khoản' });
});

// ─── IAM Dashboard ────────────────────────────────────────────────────────────

router.get('/iam/dashboard', (_req: Request, res: Response) => {
  const totalUsers = USERS.length;
  const activeUsers = USERS.filter((u) => u.status === 'active').length;
  const lockedUsers = USERS.filter((u) => u.status === 'locked').length;
  const today = new Date().toISOString().split('T')[0];
  const loginsToday = AUDIT_LOGS.filter((l) => l.action === 'LOGIN' && l.timestamp.startsWith(today)).length;

  const roleStats: Record<string, number> = {};
  USERS.forEach((u) => {
    roleStats[u.role] = (roleStats[u.role] || 0) + 1;
  });

  const roleCards = Object.entries(roleStats).map(([role, count]) => {
    const labelMap: Record<string, string> = {
      SUPER_ADMIN: 'Quản trị viên',
      ADMIN: 'Quản trị viên',
      HIEU_TRUONG: 'Hiệu trưởng',
      PHO_HIEU_TRUONG: 'Phó Hiệu trưởng',
      TRUONG_KHOA: 'Trưởng khoa',
      PHO_TRUONG_KHOA: 'Phó trưởng khoa',
      GIAO_VIEN: 'Giảng viên',
      CAN_BO_PHAN_CONG: 'Cán bộ phân công',
      CHUYEN_VIEN: 'Chuyên viên',
      NHAN_VIEN: 'Nhân viên',
      SINH_VIEN: 'Sinh viên',
      KHAI_THA: 'Khai thác',
    };
    const colorMap: Record<string, string> = {
      SUPER_ADMIN: '#1E3A5F',
      ADMIN: '#1E3A5F',
      HIEU_TRUONG: '#1E3A5F',
      PHO_HIEU_TRUONG: '#1E3A5F',
      TRUONG_KHOA: '#2563EB',
      PHO_TRUONG_KHOA: '#2563EB',
      GIAO_VIEN: '#7C3AED',
      CAN_BO_PHAN_CONG: '#7C3AED',
      CHUYEN_VIEN: '#6B7280',
      NHAN_VIEN: '#6B7280',
      SINH_VIEN: '#059669',
      KHAI_THA: '#059669',
    };
    return {
      name: labelMap[role] || role,
      users: count,
      color: colorMap[role] || '#6B7280',
      icon: '👤',
      active: true,
      perms: ['—'],
      matrix: [true, true, true, false, false, true],
    };
  });

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        activeUsers,
        lockedUsers,
        loginsToday,
        activePercent: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0',
      },
      roles: roleCards,
      recentAudit: AUDIT_LOGS.slice(0, 10),
    },
  });
});

router.get('/api-keys', (_req: Request, res: Response) => {
  res.json({ success: true, data: API_KEYS });
});

router.post('/api-keys', (req: Request, res: Response) => {
  const { name, description, scopes } = req.body as { name: string; description: string; scopes: string[] };
  const newKey = {
    _id: `key${Date.now()}`,
    name: name || 'API Key mới',
    description: description || '',
    keyPreview: `ums_${Date.now()}_sk_••••••••••••••••••${Math.random().toString(36).slice(2, 6)}`,
    createdBy: 'Nguyễn Văn Admin',
    createdAt: new Date().toISOString().split('T')[0],
    lastUsed: '—',
    scopes: scopes || [],
    status: 'active',
    usage: 0,
    dailyLimit: 10000,
  };
  API_KEYS.push(newKey);
  res.status(201).json({ success: true, data: newKey });
});

router.patch('/api-keys/:id/toggle', (req: Request, res: Response) => {
  const idx = API_KEYS.findIndex((k) => k._id === req.params.id);
  if (idx === -1) { res.status(404).json({ success: false, error: { message: 'Không tìm thấy API key' } }); return; }
  API_KEYS[idx] = {
    ...API_KEYS[idx],
    status: API_KEYS[idx].status === 'active' ? 'inactive' : 'active',
  };
  res.json({ success: true, data: API_KEYS[idx] });
});

router.delete('/api-keys/:id', (req: Request, res: Response) => {
  const idx = API_KEYS.findIndex((k) => k._id === req.params.id);
  if (idx === -1) { res.status(404).json({ success: false, error: { message: 'Không tìm thấy API key' } }); return; }
  API_KEYS.splice(idx, 1);
  res.json({ success: true, message: 'Đã xóa API key' });
});

// ─── Audit Logs ──────────────────────────────────────────────────────────────

router.get('/audit-logs', (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, action, status } = req.query as any;
  let filtered = [...AUDIT_LOGS];
  if (action) filtered = filtered.filter((a) => a.action === action);
  if (status) filtered = filtered.filter((a) => a.status === status);
  const total = filtered.length;
  const start = (+page - 1) * +pageSize;
  res.json({
    success: true,
    data: filtered.slice(start, start + +pageSize),
    pagination: { page: +page, pageSize: +pageSize, total, totalPages: Math.ceil(total / +pageSize) },
  });
});

// ─── Dashboard (generic stats) ────────────────────────────────────────────────

router.get('/dashboard/summary', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalStudents: STUDENTS.length,
      totalStaff: VIEN_CHUC.length,
      totalCourses: COURSES.length,
      totalExams: EXAMS.length,
    },
  });
});

export default router;

import { Request, Response } from 'express';
import { hrmService } from '../services/hrm.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const hrmController = {
  // ─── VienChuc ─────────────────────────────────────────────────────────────

  // GET /api/hrm/vien-chuc
  getVienChucList: asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 10,
      search: req.query.search as string,
      status: req.query.status as string,
      department: req.query.department as string,
      sortBy: req.query.sortBy as string,
      sortDir: req.query.sortDir as 'asc' | 'desc',
    };

    const result = await hrmService.listVienChuc(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }),

  // GET /api/hrm/vien-chuc/:id
  getVienChucById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const VienChuc = await hrmService.getVienChucById(id);

    if (!VienChuc) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy viên chức' },
      });
      return;
    }

    res.json({ success: true, data: VienChuc });
  }),

  // POST /api/hrm/vien-chuc
  createVienChuc: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const VienChuc = await hrmService.createVienChuc(req.body, userId!);

    res.status(201).json({ success: true, data: VienChuc });
  }),

  // PATCH /api/hrm/vien-chuc/:id
  updateVienChuc: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?._id.toString();
    const VienChuc = await hrmService.updateVienChuc(id, req.body, userId!);

    if (!VienChuc) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy viên chức' },
      });
      return;
    }

    res.json({ success: true, data: VienChuc });
  }),

  // DELETE /api/hrm/vien-chuc/:id
  deleteVienChuc: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await hrmService.deleteVienChuc(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy viên chức' },
      });
      return;
    }

    res.json({ success: true, message: 'Đã xóa viên chức' });
  }),

  // GET /api/hrm/vien-chuc-stats
  getVienChucStats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await hrmService.getVienChucStats();
    res.json({ success: true, data: stats });
  }),

  // ─── Departments ───────────────────────────────────────────────────────────

  // GET /api/hrm/departments
  getDepartmentList: asyncHandler(async (req: Request, res: Response) => {
    const departments = await hrmService.listDepartments({
      type: req.query.type as string,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    });

    res.json({ success: true, data: departments });
  }),

  // GET /api/hrm/departments/:id
  getDepartmentById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const department = await hrmService.getDepartmentById(id);

    if (!department) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy đơn vị' },
      });
      return;
    }

    res.json({ success: true, data: department });
  }),

  // POST /api/hrm/departments
  createDepartment: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const department = await hrmService.createDepartment(req.body, userId!);

    res.status(201).json({ success: true, data: department });
  }),

  // PATCH /api/hrm/departments/:id
  updateDepartment: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const department = await hrmService.updateDepartment(id, req.body);

    if (!department) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy đơn vị' },
      });
      return;
    }

    res.json({ success: true, data: department });
  }),

  // DELETE /api/hrm/departments/:id
  deleteDepartment: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
      const deleted = await hrmService.deleteDepartment(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Không tìm thấy đơn vị' },
        });
        return;
      }

      res.json({ success: true, message: 'Đã xóa đơn vị' });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'DELETE_ERROR', message: error.message },
      });
    }
  }),

  // ─── Leave Requests ────────────────────────────────────────────────────────

  // GET /api/hrm/leave-requests
  getLeaveRequestList: asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 10,
      status: req.query.status as string,
      employeeId: req.query.employeeId as string,
    };

    const result = await hrmService.listLeaveRequests(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }),

  // POST /api/hrm/leave-requests
  createLeaveRequest: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const userName = req.user?.displayName || '';
    const request = await hrmService.createLeaveRequest(req.body, userId!, userName);

    res.status(201).json({ success: true, data: request });
  }),

  // ─── Contracts ────────────────────────────────────────────────────────────

  // GET /api/hrm/contracts
  listContracts: asyncHandler(async (req: Request, res: Response) => {
    const result = await hrmService.listContracts({
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 10,
      employee: req.query.employee as string,
      type: req.query.type as string,
      status: req.query.status as string,
    });
    res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
  }),

  // GET /api/hrm/contracts/:id
  getContractById: asyncHandler(async (req: Request, res: Response) => {
    const contract = await hrmService.getContractById(req.params.id);
    if (!contract) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hợp đồng' } });
      return;
    }
    res.json({ success: true, data: contract });
  }),

  // POST /api/hrm/contracts
  createContract: asyncHandler(async (req: Request, res: Response) => {
    try {
      const contract = await hrmService.createContract(req.body, req.user!._id.toString());
      res.status(201).json({ success: true, data: contract });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
    }
  }),

  // PATCH /api/hrm/contracts/:id
  updateContract: asyncHandler(async (req: Request, res: Response) => {
    const contract = await hrmService.updateContract(req.params.id, req.body, req.user!._id.toString());
    if (!contract) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hợp đồng' } });
      return;
    }
    res.json({ success: true, data: contract });
  }),

  // DELETE /api/hrm/contracts/:id
  deleteContract: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await hrmService.deleteContract(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hợp đồng' } });
      return;
    }
    res.json({ success: true, message: 'Đã xóa hợp đồng' });
  }),

  // ─── Salary Sheets ────────────────────────────────────────────────────────

  // GET /api/hrm/salary-sheets
  listSalarySheets: asyncHandler(async (req: Request, res: Response) => {
    const result = await hrmService.listSalarySheets({
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 10,
      month: req.query.month ? Number(req.query.month) : undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
      department: req.query.department as string,
      status: req.query.status as string,
    });
    res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
  }),

  // GET /api/hrm/salary-sheets/:id
  getSalarySheetById: asyncHandler(async (req: Request, res: Response) => {
    const sheet = await hrmService.getSalarySheetById(req.params.id);
    if (!sheet) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bảng lương' } });
      return;
    }
    res.json({ success: true, data: sheet });
  }),

  // POST /api/hrm/salary-sheets
  createSalarySheet: asyncHandler(async (req: Request, res: Response) => {
    try {
      const sheet = await hrmService.createSalarySheet(req.body, req.user!._id.toString());
      res.status(201).json({ success: true, data: sheet });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
    }
  }),

  // POST /api/hrm/salary-sheets/:id/approve
  approveSalarySheet: asyncHandler(async (req: Request, res: Response) => {
    const sheet = await hrmService.approveSalarySheet(req.params.id, req.user!._id.toString());
    if (!sheet) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bảng lương' } });
      return;
    }
    res.json({ success: true, data: sheet, message: 'Đã phê duyệt bảng lương' });
  }),
};

import { Request, Response } from 'express';
import { iamService } from '../services/iam.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await iamService.listUsers({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    search: req.query.search as string,
    role: req.query.role as string,
    status: req.query.status as any,
    department: req.query.department as string,
    sortBy: req.query.sortBy as string,
    sortDir: req.query.sortDir as 'asc' | 'desc',
  });
  res.json({
    success: true,
    data: result.data,
    pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages },
  });
});

const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await iamService.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy người dùng' } });
    return;
  }
  res.json({ success: true, data: user });
});

const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await iamService.createUser(req.body, req.user!._id.toString());
  res.status(201).json({ success: true, data: user });
});

const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await iamService.updateUser(req.params.id, req.body, req.user!._id.toString());
  if (!user) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy người dùng' } });
    return;
  }
  res.json({ success: true, data: user });
});

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const deleted = await iamService.deleteUser(req.params.id, req.user!._id.toString());
    if (!deleted) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy người dùng' } });
      return;
    }
    res.json({ success: true, message: 'Đã xóa người dùng' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } });
  }
});

const lockUser = asyncHandler(async (req: Request, res: Response) => {
  const reason = req.body.reason || 'Khóa bởi quản trị viên';
  const user = await iamService.lockUser(req.params.id, req.user!._id.toString(), reason);
  if (!user) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy người dùng' } });
    return;
  }
  res.json({ success: true, data: user, message: 'Đã khóa tài khoản' });
});

const unlockUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await iamService.unlockUser(req.params.id, req.user!._id.toString());
  if (!user) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy người dùng' } });
    return;
  }
  res.json({ success: true, data: user, message: 'Đã mở khóa tài khoản' });
});

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Mật khẩu phải có ít nhất 6 ký tự' } });
    return;
  }
  const ok = await iamService.resetPassword(req.params.id, newPassword, req.user!._id.toString());
  if (!ok) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy người dùng' } });
    return;
  }
  res.json({ success: true, message: 'Đã reset mật khẩu' });
});

const getUserStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await iamService.getUserStats();
  res.json({ success: true, data: stats });
});

const listRoles = asyncHandler(async (_req: Request, res: Response) => {
  const roles = await iamService.listRoles();
  res.json({ success: true, data: roles });
});

const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const role = await iamService.getRoleById(req.params.id);
  if (!role) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy role' } });
    return;
  }
  res.json({ success: true, data: role });
});

const createRole = asyncHandler(async (req: Request, res: Response) => {
  try {
    const role = await iamService.createRole(req.body);
    res.status(201).json({ success: true, data: role });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await iamService.updateRole(req.params.id, req.body);
  if (!role) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy role' } });
    return;
  }
  res.json({ success: true, data: role });
});

const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  try {
    const deleted = await iamService.deleteRole(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy role' } });
      return;
    }
    res.json({ success: true, message: 'Đã xóa role' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } });
  }
});

const listTenants = asyncHandler(async (req: Request, res: Response) => {
  const tenants = await iamService.listTenants({
    status: req.query.status as string,
    plan: req.query.plan as string,
    search: req.query.search as string,
  });
  res.json({ success: true, data: tenants });
});

const getTenantById = asyncHandler(async (req: Request, res: Response) => {
  const tenant = await iamService.getTenantById(req.params.id);
  if (!tenant) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy tenant' } });
    return;
  }
  res.json({ success: true, data: tenant });
});

const createTenant = asyncHandler(async (req: Request, res: Response) => {
  try {
    const tenant = await iamService.createTenant(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: tenant });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

const updateTenant = asyncHandler(async (req: Request, res: Response) => {
  const tenant = await iamService.updateTenant(req.params.id, req.body);
  if (!tenant) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy tenant' } });
    return;
  }
  res.json({ success: true, data: tenant });
});

const deleteTenant = asyncHandler(async (req: Request, res: Response) => {
  try {
    const deleted = await iamService.deleteTenant(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy tenant' } });
      return;
    }
    res.json({ success: true, message: 'Đã xóa tenant' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } });
  }
});

const listAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await iamService.listAuditLogs({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 50,
    userId: req.query.userId as string,
    action: req.query.action as string,
    resource: req.query.resource as string,
    status: req.query.status as any,
    fromDate: req.query.fromDate as string,
    toDate: req.query.toDate as string,
  });
  res.json({
    success: true,
    data: result.data,
    pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages },
  });
});

const getAuditLogStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await iamService.getAuditLogStats();
  res.json({ success: true, data: stats });
});

const listSessions = asyncHandler(async (req: Request, res: Response) => {
  const sessions = await iamService.listSessions(req.query.userId as string);
  res.json({ success: true, data: sessions });
});

const revokeSession = asyncHandler(async (req: Request, res: Response) => {
  const ok = await iamService.revokeSession(req.params.id);
  if (!ok) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy session' } });
    return;
  }
  res.json({ success: true, message: 'Đã thu hồi session' });
});

const revokeAllUserSessions = asyncHandler(async (req: Request, res: Response) => {
  const count = await iamService.revokeAllUserSessions(req.params.userId);
  res.json({ success: true, message: `Đã thu hồi ${count} session`, count });
});

export const iamController = {
  // User
  listUsers, getUserById, createUser, updateUser, deleteUser, lockUser, unlockUser, resetPassword, getUserStats,
  // Role
  listRoles, getRoleById, createRole, updateRole, deleteRole,
  // Tenant
  listTenants, getTenantById, createTenant, updateTenant, deleteTenant,
  // Audit
  listAuditLogs, getAuditLogStats,
  // Session
  listSessions, revokeSession, revokeAllUserSessions,
};
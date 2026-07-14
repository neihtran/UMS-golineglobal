import { User as UserModel, IUser, ROLES } from '../models/User.js';
import { RoleModel, IRole } from '../models/Role.js';
import { Tenant, ITenant } from '../models/Tenant.js';
import { Session, ISession } from '../models/Session.js';
import { AuditLog, IAuditLog } from '../models/AuditLog.js';
import { Types } from 'mongoose';
import type { FilterQuery } from 'mongoose';
import { CreateUserInput, UpdateUserInput, UserFiltersInput, CreateTenantInput, AuditLogFiltersInput } from '../validators/iam.validator.js';

// ─── IAM Service ────────────────────────────────────────────────────────────
export class IamService {
  // ─── User Management ─────────────────────────────────────────────────────

  async createUser(data: CreateUserInput, createdBy: string): Promise<IUser> {
    const existing = await UserModel.findOne({
      $or: [{ email: data.email.toLowerCase() }, { username: data.username }],
    });
    if (existing) {
      throw new Error('Email hoặc username đã tồn tại');
    }

    const user = new UserModel({
      ...data,
      email: data.email.toLowerCase(),
      department: data.department ? new Types.ObjectId(data.department) : undefined,
      status: 'active',
    });
    await user.save();

    await AuditLog.create({
      userId: new Types.ObjectId(createdBy),
      action: 'CREATE',
      resource: 'User',
      resourceId: user._id.toString(),
      status: 'success',
      details: `Tạo user: ${user.displayName} (${user.email})`,
      timestamp: new Date(),
    });

    return user.toObject() as IUser;
  }

  async getUserById(id: string): Promise<IUser | null> {
    return UserModel.findById(id)
      .select('-password -mfaSecret -refreshToken')
      .populate('department', 'name code');
  }

  async listUsers(filters: UserFiltersInput) {
    const {
      page = 1, pageSize = 10, search, role, status, department,
      sortBy = 'createdAt', sortDir = 'desc',
    } = filters;

    const filter: FilterQuery<IUser> = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (department) filter.department = new Types.ObjectId(department);
    if (search) {
      filter.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj: Record<string, 1 | -1> = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      UserModel.find(filter)
        .select('-password -mfaSecret -refreshToken')
        .populate('department', 'name code')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort(sortObj)
        .lean(),
      UserModel.countDocuments(filter),
    ]);

    return { data: data as unknown as IUser[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async updateUser(id: string, data: UpdateUserInput, updatedBy: string): Promise<IUser | null> {
    const updateData: Record<string, any> = { ...data };
    if (data.department) updateData.department = new Types.ObjectId(data.department);

    const user = await UserModel.findByIdAndUpdate(
      id, { $set: updateData }, { new: true, runValidators: true }
    ).select('-password -mfaSecret -refreshToken');

    if (user) {
      await AuditLog.create({
        userId: new Types.ObjectId(updatedBy),
        action: 'UPDATE',
        resource: 'User',
        resourceId: id,
        status: 'success',
        details: `Cập nhật user: ${user.displayName}`,
        timestamp: new Date(),
      });
    }

    return user;
  }

  async deleteUser(id: string, deletedBy: string): Promise<boolean> {
    const user = await UserModel.findById(id);
    if (!user) return false;
    if (user.role === ROLES.SUPER_ADMIN) {
      throw new Error('Không thể xóa tài khoản SUPER_ADMIN');
    }

    await Session.deleteMany({ userId: id });
    const result = await UserModel.findByIdAndDelete(id);

    if (result) {
      await AuditLog.create({
        userId: new Types.ObjectId(deletedBy),
        action: 'DELETE',
        resource: 'User',
        resourceId: id,
        status: 'success',
        details: `Xóa user: ${user.displayName}`,
        timestamp: new Date(),
      });
    }
    return !!result;
  }

  async lockUser(id: string, lockedBy: string, reason: string): Promise<IUser | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: { status: 'locked', lockReason: 'manual' } },
      { new: true }
    ).select('-password -mfaSecret -refreshToken');

    if (user) {
      await Session.deleteMany({ userId: id });
      await AuditLog.create({
        userId: new Types.ObjectId(lockedBy),
        action: 'UPDATE',
        resource: 'User',
        resourceId: id,
        status: 'success',
        details: `Khóa user: ${user.displayName} - Lý do: ${reason}`,
        timestamp: new Date(),
      });
    }
    return user;
  }

  async unlockUser(id: string, unlockedBy: string): Promise<IUser | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: { status: 'active' }, $unset: { lockReason: 1, passwordExpiresAt: 1 } },
      { new: true }
    ).select('-password -mfaSecret -refreshToken');

    if (user) {
      await AuditLog.create({
        userId: new Types.ObjectId(unlockedBy),
        action: 'UPDATE',
        resource: 'User',
        resourceId: id,
        status: 'success',
        details: `Mở khóa user: ${user.displayName}`,
        timestamp: new Date(),
      });
    }
    return user;
  }

  async resetPassword(id: string, newPassword: string, resetBy: string): Promise<boolean> {
    const user = await UserModel.findById(id);
    if (!user) return false;

    user.password = newPassword;
    await user.save();

    await Session.deleteMany({ userId: id });
    await AuditLog.create({
      userId: new Types.ObjectId(resetBy),
      action: 'UPDATE',
      resource: 'User',
      resourceId: id,
      status: 'success',
      details: `Reset mật khẩu cho: ${user.displayName}`,
      timestamp: new Date(),
    });
    return true;
  }

  async getUserStats() {
    const [total, byRole, byStatus, recentLogins] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      UserModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      UserModel.find({ lastLogin: { $exists: true } })
        .sort({ lastLogin: -1 })
        .limit(10)
        .select('displayName email role lastLogin')
        .lean(),
    ]);

    return {
      total,
      byRole: byRole.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {} as Record<string, number>),
      byStatus: byStatus.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {} as Record<string, number>),
      recentLogins,
    };
  }

  // ─── Role Management ─────────────────────────────────────────────────────

  async createRole(data: { code: string; name: string; description?: string; level: number; permissions: string[] }): Promise<IRole> {
    const existing = await RoleModel.findOne({ code: data.code });
    if (existing) throw new Error(`Role ${data.code} đã tồn tại`);

    const role = new RoleModel({ ...data, isSystem: true, isActive: true });
    await role.save();
    return role;
  }

  async listRoles() {
    return RoleModel.find().sort({ level: -1 }).lean();
  }

  async getRoleById(id: string): Promise<IRole | null> {
    return RoleModel.findById(id);
  }

  async updateRole(id: string, data: Partial<IRole>): Promise<IRole | null> {
    return RoleModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  }

  async deleteRole(id: string): Promise<boolean> {
    const role = await RoleModel.findById(id);
    if (!role) return false;
    if (role.isSystem) throw new Error('Không thể xóa role hệ thống');
    const result = await RoleModel.findByIdAndDelete(id);
    return !!result;
  }

  // ─── Tenant Management ───────────────────────────────────────────────────

  async createTenant(data: CreateTenantInput, createdBy: string): Promise<ITenant> {
    const existing = await Tenant.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new Error(`Tenant ${data.code} đã tồn tại`);

    const tenant = new Tenant({
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      createdBy: new Types.ObjectId(createdBy),
    });
    await tenant.save();
    return tenant;
  }

  async listTenants(filters?: { status?: string; plan?: string; search?: string }) {
    const filter: FilterQuery<ITenant> = {};
    if (filters?.status) filter.status = filters.status;
    if (filters?.plan) filter.plan = filters.plan;
    if (filters?.search) {
      filter.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { code: { $regex: filters.search, $options: 'i' } },
      ];
    }
    return Tenant.find(filter).sort({ createdAt: -1 }).lean();
  }

  async getTenantById(id: string): Promise<ITenant | null> {
    return Tenant.findById(id);
  }

  async updateTenant(id: string, data: Partial<CreateTenantInput>): Promise<ITenant | null> {
    const updateData: Record<string, any> = { ...data };
    if (data.expiresAt) updateData.expiresAt = new Date(data.expiresAt);
    return Tenant.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
  }

  async deleteTenant(id: string): Promise<boolean> {
    const userCount = await UserModel.countDocuments({ department: { $in: await this.getTenantDepartments(id) } });
    if (userCount > 0) {
      throw new Error(`Không thể xóa tenant: còn ${userCount} người dùng liên quan`);
    }
    const result = await Tenant.findByIdAndDelete(id);
    return !!result;
  }

  private async getTenantDepartments(_tenantId: string): Promise<Types.ObjectId[]> {
    return [];
  }

  // ─── Audit Log ───────────────────────────────────────────────────────────

  async listAuditLogs(filters: AuditLogFiltersInput) {
    const {
      page = 1, pageSize = 50, userId, action, resource, status, fromDate, toDate,
    } = filters;

    const filter: FilterQuery<IAuditLog> = {};
    if (userId) filter.userId = new Types.ObjectId(userId);
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (status) filter.status = status;
    if (fromDate || toDate) {
      filter.timestamp = {};
      if (fromDate) filter.timestamp.$gte = new Date(fromDate);
      if (toDate) filter.timestamp.$lte = new Date(toDate);
    }

    const [data, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'displayName email')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ timestamp: -1 })
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return { data: data as unknown as IAuditLog[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getAuditLogStats() {
    const [byAction, byResource, recentFailures] = await Promise.all([
      AuditLog.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AuditLog.aggregate([
        { $group: { _id: '$resource', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      AuditLog.find({ status: 'failure' })
        .sort({ timestamp: -1 })
        .limit(20)
        .lean(),
    ]);

    return { byAction, byResource, recentFailures };
  }

  // ─── Session Management ──────────────────────────────────────────────────

  async listSessions(userId?: string) {
    const filter: FilterQuery<ISession> = { isActive: true };
    if (userId) filter.userId = new Types.ObjectId(userId);
    return Session.find(filter)
      .populate('userId', 'displayName email')
      .sort({ lastActivityAt: -1 })
      .lean();
  }

  async revokeSession(id: string): Promise<boolean> {
    const result = await Session.findByIdAndUpdate(id, { isActive: false }, { new: true });
    return !!result;
  }

  async revokeAllUserSessions(userId: string): Promise<number> {
    const result = await Session.updateMany(
      { userId: new Types.ObjectId(userId), isActive: true },
      { isActive: false }
    );
    return result.modifiedCount;
  }
}

export const iamService = new IamService();
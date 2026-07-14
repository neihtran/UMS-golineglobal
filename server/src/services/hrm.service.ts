import { VienChuc as VienChucModel, IVienChuc } from '../models/VienChuc.js';
import { Department, IDepartment } from '../models/Department.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { Contract, IContract } from '../models/Contract.js';
import { SalarySheet, ISalarySheet } from '../models/SalarySheet.js';
import { Types } from 'mongoose';
import type { FilterQuery } from 'mongoose';

// ─── DTOs ────────────────────────────────────────────────────────────────────
export interface CreateVienChucDto {
  code: string;
  name: string;
  dob?: string;
  cccd?: string;
  gender?: 'Nam' | 'Nữ';
  ethnicity?: string;
  religion?: string;
  address?: string;
  contact?: string;
  phone?: string;
  email?: string;
  title?: string;
  position?: string;
  department?: string;
  contractType?: 'Cơ hữu' | 'Thỉnh giảng' | 'Thử việc';
  salary?: number;
  joinDate?: string;
  education?: string;
  major?: string;
  school?: string;
  gradYear?: number;
  avatar?: string;
  supervisor?: string;
}

export interface UpdateVienChucDto extends Partial<CreateVienChucDto> {
  status?: 'active' | 'trial' | 'leave' | 'inactive';
}

export interface VienChucFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  department?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// ─── HRM Service ─────────────────────────────────────────────────────────────
export class HrmService {
  // ─── VienChuc CRUD ─────────────────────────────────────────────────────────

  async createVienChuc(data: CreateVienChucDto, userId: string): Promise<IVienChuc> {
    const VienChucData: Record<string, any> = {
      ...data,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    };

    if (data.department) {
      VienChucData.department = new Types.ObjectId(data.department);
    }
    if (data.supervisor) {
      VienChucData.supervisor = new Types.ObjectId(data.supervisor);
    }

    const newVienChuc = new VienChucModel(VienChucData);
    await newVienChuc.save();
    
    return newVienChuc.populate('department') as unknown as IVienChuc;
  }

  async getVienChucById(id: string): Promise<IVienChuc | null> {
    return VienChucModel.findById(id)
      .populate('department', 'name code shortName')
      .populate('supervisor', 'name email')
      .populate('createdBy', 'displayName email')
      .populate('updatedBy', 'displayName email');
  }

  async listVienChuc(filters: VienChucFilters) {
    const {
      page = 1,
      pageSize = 10,
      search,
      status,
      department,
      sortBy = 'createdAt',
      sortDir = 'desc',
    } = filters;

    const filter: FilterQuery<IVienChuc> = {};

    if (status) filter.status = status;
    if (department) filter.department = new Types.ObjectId(department);
    
    // Text search on name and code
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj: Record<string, 1 | -1> = {
      [sortBy]: sortDir === 'asc' ? 1 : -1,
    };

    const [data, total] = await Promise.all([
      VienChucModel.find(filter)
        .populate('department', 'name code shortName')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort(sortObj)
        .lean(),
      VienChucModel.countDocuments(filter),
    ]);

    return {
      data: data as unknown as IVienChuc[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateVienChuc(id: string, data: UpdateVienChucDto, userId: string): Promise<IVienChuc | null> {
    const updateData: Record<string, any> = {
      ...data,
      updatedBy: new Types.ObjectId(userId),
    };

    if (data.department) {
      updateData.department = new Types.ObjectId(data.department);
    }
    if (data.supervisor) {
      updateData.supervisor = new Types.ObjectId(data.supervisor);
    }

    return VienChucModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('department', 'name code shortName')
      .populate('supervisor', 'name email');
  }

  async deleteVienChuc(id: string): Promise<boolean> {
    const result = await VienChucModel.findByIdAndDelete(id);
    return !!result;
  }

  // ─── Statistics ────────────────────────────────────────────────────────────

  async getVienChucStats() {
    const [total, byStatus, byDepartment, byContractType] = await Promise.all([
      VienChucModel.countDocuments(),
      VienChucModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      VienChucModel.aggregate([
        { $match: { department: { $ne: null } } },
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            totalSalary: { $sum: { $ifNull: ['$salary', 0] } },
          },
        },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'dept',
          },
        },
        { $unwind: '$dept' },
        {
          $project: {
            _id: '$dept._id',
            name: '$dept.name',
            code: '$dept.code',
            count: 1,
            totalSalary: 1,
          },
        },
        { $sort: { count: -1 } },
      ]),
      VienChucModel.aggregate([
        { $group: { _id: '$contractType', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {} as Record<string, number>),
      byDepartment,
      byContractType: byContractType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {} as Record<string, number>),
    };
  }

  // ─── Department CRUD ──────────────────────────────────────────────────────

  async createDepartment(data: Partial<IDepartment>, _userId: string): Promise<IDepartment> {
    const dept = new Department(data);
    await dept.save();
    return dept;
  }

  async listDepartments(options?: { type?: string; isActive?: boolean }) {
    const filter: Record<string, any> = {};
    if (options?.type) filter.type = options.type;
    if (options?.isActive !== undefined) filter.isActive = options.isActive;

    return Department.find(filter).sort({ type: 1, name: 1 }).lean();
  }

  async getDepartmentById(id: string): Promise<IDepartment | null> {
    return Department.findById(id);
  }

  async updateDepartment(id: string, data: Partial<IDepartment>): Promise<IDepartment | null> {
    return Department.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  }

  async deleteDepartment(id: string): Promise<boolean> {
    // Check if department has VienChuc
    const count = await VienChucModel.countDocuments({ department: id });
    if (count > 0) {
      throw new Error(`Không thể xóa: có ${count} viên chức đang thuộc đơn vị này`);
    }
    const result = await Department.findByIdAndDelete(id);
    return !!result;
  }

  // ─── Leave Request CRUD ────────────────────────────────────────────────────

  async createLeaveRequest(data: {
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
  }, userId: string, userName: string): Promise<any> {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const request = new LeaveRequest({
      employeeId: new Types.ObjectId(userId),
      employeeName: userName,
      type: data.type,
      startDate,
      endDate,
      reason: data.reason,
      days,
    });

    await request.save();
    return request;
  }

  async listLeaveRequests(filters: { page?: number; pageSize?: number; status?: string; employeeId?: string }) {
    const { page = 1, pageSize = 10, status, employeeId } = filters;
    
    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (employeeId) filter.employeeId = new Types.ObjectId(employeeId);

    const [data, total] = await Promise.all([
      LeaveRequest.find(filter)
        .populate('approver', 'displayName')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean(),
      LeaveRequest.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // ─── Contract CRUD ────────────────────────────────────────────────────────

  async createContract(data: {
    code: string; employee: string; type: any; startDate: string; endDate?: string;
    salary: number; notes?: string;
  }, userId: string): Promise<IContract> {
    const existing = await Contract.findOne({ code: data.code });
    if (existing) throw new Error(`Mã hợp đồng ${data.code} đã tồn tại`);

    const contract = new Contract({
      ...data,
      employee: new Types.ObjectId(data.employee),
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    await contract.save();
    return contract;
  }

  async listContracts(filters: { page?: number; pageSize?: number; employee?: string; type?: string; status?: string }) {
    const { page = 1, pageSize = 10, employee, type, status } = filters;
    const filter: FilterQuery<IContract> = {};
    if (employee) filter.employee = new Types.ObjectId(employee);
    if (type) filter.type = type;
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      Contract.find(filter)
        .populate('employee', 'name code')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean(),
      Contract.countDocuments(filter),
    ]);
    return { data: data as unknown as IContract[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getContractById(id: string): Promise<IContract | null> {
    return Contract.findById(id)
      .populate('employee', 'name code email')
      .populate('signedBy', 'displayName');
  }

  async updateContract(id: string, data: Partial<IContract>, userId: string): Promise<IContract | null> {
    return Contract.findByIdAndUpdate(
      id, { $set: { ...data, updatedBy: new Types.ObjectId(userId) } },
      { new: true, runValidators: true }
    );
  }

  async deleteContract(id: string): Promise<boolean> {
    const result = await Contract.findByIdAndDelete(id);
    return !!result;
  }

  // ─── Salary Sheet CRUD ────────────────────────────────────────────────────

  async createSalarySheet(data: {
    month: number; year: number; department?: string; items: any[]; notes?: string;
  }, userId: string): Promise<ISalarySheet> {
    const items = data.items.map((item: any) => {
      const gross = item.baseSalary + item.allowance + item.bonus;
      const net = gross - item.deduction - item.insurance - item.tax;
      return {
        employee: new Types.ObjectId(item.employee),
        baseSalary: item.baseSalary,
        allowance: item.allowance || 0,
        bonus: item.bonus || 0,
        deduction: item.deduction || 0,
        insurance: item.insurance || 0,
        tax: item.tax || 0,
        netSalary: net,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.netSalary, 0);

    const sheet = new SalarySheet({
      month: data.month,
      year: data.year,
      department: data.department ? new Types.ObjectId(data.department) : undefined,
      items,
      totalAmount,
      totalEmployees: items.length,
      notes: data.notes,
      status: 'draft',
      createdBy: new Types.ObjectId(userId),
    });
    await sheet.save();
    return sheet;
  }

  async listSalarySheets(filters: { page?: number; pageSize?: number; month?: number; year?: number; department?: string; status?: string }) {
    const { page = 1, pageSize = 10, month, year, department, status } = filters;
    const filter: FilterQuery<ISalarySheet> = {};
    if (month) filter.month = month;
    if (year) filter.year = year;
    if (department) filter.department = new Types.ObjectId(department);
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      SalarySheet.find(filter)
        .populate('department', 'name code')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ year: -1, month: -1 })
        .lean(),
      SalarySheet.countDocuments(filter),
    ]);
    return { data: data as unknown as ISalarySheet[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getSalarySheetById(id: string): Promise<ISalarySheet | null> {
    return SalarySheet.findById(id)
      .populate('department', 'name code')
      .populate('items.employee', 'name code')
      .populate('approvedBy', 'displayName');
  }

  async approveSalarySheet(id: string, userId: string): Promise<ISalarySheet | null> {
    return SalarySheet.findByIdAndUpdate(
      id,
      { $set: { status: 'approved', approvedBy: new Types.ObjectId(userId), approvedAt: new Date() } },
      { new: true }
    );
  }
}

export const hrmService = new HrmService();

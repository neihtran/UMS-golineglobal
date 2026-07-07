import { Request, Response } from 'express';
import { User } from '@/models/User.js';
import { Types } from 'mongoose';
import { hashPassword, comparePassword } from '@/utils/password.js';
import { logger } from '@/utils/logger.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { buildTextSearch } from '@/utils/filter.js';
import { buildMongooseQuery } from '@/types/api.types.js';
import type { CreateUserInput, UpdateUserInput, UserQueryInput } from '@/validators/hrm.validator.js';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as unknown as UserQueryInput;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 10;

  const { filter: baseFilter } = buildMongooseQuery({ page, pageSize, sortBy: q.sortBy, sortDir: q.sortDir });

  // Build filter
  const filter: Record<string, unknown> = { ...baseFilter };
  delete filter.page;
  delete filter.pageSize;

  if (q.role) filter.role = q.role;
  if (q.status) filter.status = q.status;
  if (q.department) filter.department = new Types.ObjectId(q.department);
  if (q.search) {
    filter.$text = { $search: q.search };
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshToken -mfaSecret -__v')
      .populate('department', 'name code shortName')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshToken -mfaSecret -__v')
    .populate('department', 'name code shortName');

  if (!user) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Người dùng không tồn tại' },
    });
    return;
  }

  res.json({ success: true, data: user });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as CreateUserInput;

  // Check for existing email/username
  const existing = await User.findOne({
    $or: [{ email: body.email.toLowerCase() }, { username: body.username.toLowerCase() }],
  });
  if (existing) {
    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: existing.email === body.email.toLowerCase()
          ? 'Email đã được sử dụng'
          : 'Username đã được sử dụng',
      },
    });
    return;
  }

  const hashedPassword = await hashPassword(body.password);

  const user = await User.create({
    email: body.email.toLowerCase(),
    username: body.username.toLowerCase(),
    password: hashedPassword,
    displayName: body.displayName,
    role: body.role,
    department: body.department ? new Types.ObjectId(body.department) : undefined,
    title: body.title,
    phone: body.phone,
    avatar: body.avatar,
    status: 'active',
    mfaEnabled: 'disabled',
    failedLoginAttempts: 0,
    permissions: [],
  });

  const saved = await User.findById(user._id)
    .select('-password -refreshToken -mfaSecret -__v')
    .populate('department', 'name code shortName');

  res.status(201).json({ success: true, data: saved });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as UpdateUserInput;
  const updates: Record<string, unknown> = {};

  // Only allow updating certain fields
  const allowedFields = ['displayName', 'role', 'department', 'title', 'phone', 'avatar', 'status', 'permissions'];
  for (const field of allowedFields) {
    if (field in body) {
      if (field === 'department') {
        updates[field] = body.department ? new Types.ObjectId(body.department) : null;
      } else {
        updates[field] = body[field as keyof UpdateUserInput];
      }
    }
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  )
    .select('-password -refreshToken -mfaSecret -__v')
    .populate('department', 'name code shortName');

  if (!user) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Người dùng không tồn tại' },
    });
    return;
  }

  res.json({ success: true, data: user });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Người dùng không tồn tại' },
    });
    return;
  }

  // Soft delete — just mark as inactive
  await User.findByIdAndUpdate(req.params.id, { $set: { status: 'inactive' } });

  res.json({ success: true, message: 'Đã vô hiệu hóa tài khoản' });
});

export const lockUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { status: 'locked', lockReason: 'manual' } },
    { new: true }
  ).select('-password -refreshToken -mfaSecret -__v');

  if (!user) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Người dùng không tồn tại' },
    });
    return;
  }

  res.json({ success: true, data: user, message: 'Đã khóa tài khoản' });
});

export const unlockUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { status: 'active', failedLoginAttempts: 0, lockReason: undefined } },
    { new: true }
  ).select('-password -refreshToken -mfaSecret -__v');

  if (!user) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Người dùng không tồn tại' },
    });
    return;
  }

  res.json({ success: true, data: user, message: 'Đã mở khóa tài khoản' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { newPassword } = req.body;
  if (!newPassword) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Mật khẩu mới không được để trống' },
    });
    return;
  }

  const hashedPassword = await hashPassword(newPassword);
  await User.findByIdAndUpdate(req.params.id, {
    $set: { password: hashedPassword, failedLoginAttempts: 0, status: 'active' },
  });

  res.json({ success: true, message: 'Đã đặt lại mật khẩu' });
});

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token là bắt buộc'),
});

export const mfaVerifySchema = z.object({
  tempToken: z.string().min(1, 'Temp token là bắt buộc'),
  code: z.string().length(6, 'Mã MFA phải có 6 chữ số'),
});

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  username: z.string().min(3, 'Username phải có ít nhất 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  displayName: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type MfaVerifyInput = z.infer<typeof mfaVerifySchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

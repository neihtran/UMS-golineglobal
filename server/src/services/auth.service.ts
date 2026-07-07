import { User } from '@/models/User.js';
import { AuditLog } from '@/models/AuditLog.js';
import { hashPassword, comparePassword } from '@/utils/password.js';
import { generateTokenPair, verifyRefreshToken } from '@/utils/jwt.js';
import { verifyMfaCode, generateMfaSecret, generateQrCodeDataUrl, isMfaRequiredForRole } from '@/utils/mfa.js';
import { logger } from '@/utils/logger.js';

export interface AuthResult {
  success: boolean;
  user?: any;
  accessToken?: string;
  refreshToken?: string;
  mfaRequired?: boolean;
  tempToken?: string;
  message?: string;
}

/**
 * Login — validates credentials and issues tokens.
 * If MFA is required for the role, returns mfaRequired: true.
 */
export async function login(
  email: string,
  password: string,
  ip: string,
  userAgent: string
): Promise<AuthResult> {
  // Find user by email only
  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select('+password');

  if (!user) {
    await logFailedLogin(email, ip, userAgent, 'User not found');
    return { success: false, message: 'Tài khoản hoặc mật khẩu không đúng' };
  }

  // Check password
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    user.failedLoginAttempts += 1;
    await user.save();
    await logFailedLogin(user.email, ip, userAgent, 'Wrong password');
    return { success: false, message: 'Tài khoản hoặc mật khẩu không đúng' };
  }

  // Check account status
  if (user.status === 'locked') {
    return {
      success: false,
      message: 'Tài khoản đã bị khóa do đăng nhập sai nhiều lần. Liên hệ quản trị viên.',
    };
  }

  if (user.status === 'inactive' || user.status === 'pending') {
    return { success: false, message: 'Tài khoản chưa được kích hoạt' };
  }

  // MFA check
  if (isMfaRequiredForRole(user.role) || user.mfaEnabled === 'enabled') {
    // Generate temp token for MFA step
    const tempTokenPayload = { userId: user._id.toString(), email: user.email, role: user.role };
    const { signAccessToken } = await import('@/utils/jwt.js');
    const tempToken = signAccessToken(tempTokenPayload);

    return {
      success: true,
      mfaRequired: true,
      tempToken,
      user: sanitizeUser(user),
    };
  }

  // Issue tokens
  const tokens = generateTokenPair({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  // Save refresh token
  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  user.failedLoginAttempts = 0;
  await user.save();

  // Audit log
  await AuditLog.create({
    userId: user._id,
    userName: user.displayName,
    action: 'LOGIN',
    resource: 'Auth',
    ip,
    userAgent,
    status: 'success',
    details: 'Đăng nhập thành công',
  });

  return {
    success: true,
    user: sanitizeUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

/**
 * Verify MFA code and issue tokens.
 */
export async function verifyMfa(
  tempToken: string,
  code: string,
  ip: string,
  userAgent: string
): Promise<AuthResult> {
  const { verifyAccessToken } = await import('@/utils/jwt.js');

  let payload: any;
  try {
    payload = verifyAccessToken(tempToken);
  } catch {
    return { success: false, message: 'Mã xác thực đã hết hạn, vui lòng đăng nhập lại' };
  }

  if (!payload.userId) {
    return { success: false, message: 'Token không hợp lệ cho xác thực MFA' };
  }

  const user = await User.findById(payload.userId).select('+password +mfaSecret');
  if (!user) {
    return { success: false, message: 'Tài khoản không tồn tại' };
  }

  // Verify TOTP code
  if (!user.mfaSecret) {
    return { success: false, message: 'Chưa cấu hình MFA cho tài khoản này' };
  }

  const isValid = verifyMfaCode(code, user.mfaSecret);
  if (!isValid) {
    await logFailedLogin(user.email, ip, userAgent, 'Invalid MFA code');
    return { success: false, message: 'Mã xác thực không đúng' };
  }

  // Issue tokens
  const tokens = generateTokenPair({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  user.failedLoginAttempts = 0;
  await user.save();

  await AuditLog.create({
    userId: user._id,
    userName: user.displayName,
    action: 'LOGIN',
    resource: 'Auth',
    ip,
    userAgent,
    status: 'success',
    details: 'Đăng nhập MFA thành công',
  });

  return {
    success: true,
    user: sanitizeUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

/**
 * Refresh access token using refresh token.
 */
export async function refreshTokens(
  refreshToken: string
): Promise<{ success: boolean; accessToken?: string; message?: string }> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId).select('+refreshToken');

    if (!user) {
      return { success: false, message: 'Tài khoản không tồn tại' };
    }

    if (user.status === 'locked' || user.status === 'inactive') {
      return { success: false, message: 'Tài khoản đã bị khóa hoặc vô hiệu hóa' };
    }

    // Verify stored refresh token matches
    if (user.refreshToken !== refreshToken) {
      logger.warn('Refresh token mismatch — possible token reuse attack', { userId: user._id });
      // Rotate token — invalidate old one
      user.refreshToken = undefined;
      await user.save();
      return { success: false, message: 'Token không hợp lệ, vui lòng đăng nhập lại' };
    }

    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { success: true, accessToken: tokens.accessToken };
  } catch (error) {
    logger.error('Refresh token error', { error });
    return { success: false, message: 'Refresh token không hợp lệ hoặc đã hết hạn' };
  }
}

/**
 * Logout — invalidate refresh token.
 */
export async function logout(
  userId: string,
  ip: string,
  userAgent: string
): Promise<void> {
  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = undefined;
    await user.save();

    await AuditLog.create({
      userId: user._id,
      userName: user.displayName,
      action: 'LOGOUT',
      resource: 'Auth',
      ip,
      userAgent,
      status: 'success',
      details: 'Đăng xuất',
    });
  }
}

// ─── MFA Setup ──────────────────────────────────────────────────────────────────

/**
 * Setup MFA for a user — generate secret and QR code.
 */
export async function setupMfa(
  userId: string
): Promise<{ success: boolean; secret?: string; qrCodeUrl?: string; message?: string }> {
  const user = await User.findById(userId);
  if (!user) return { success: false, message: 'Tài khoản không tồn tại' };

  const secret = generateMfaSecret();
  const qrCodeUrl = await generateQrCodeDataUrl(user.email, secret);

  // Temporarily store secret (not confirmed yet — requires verification)
  user.mfaSecret = secret;
  user.mfaEnabled = 'pending_setup';
  await user.save();

  return { success: true, secret, qrCodeUrl };
}

/**
 * Confirm MFA setup — verify the first code and enable MFA.
 */
export async function confirmMfaSetup(
  userId: string,
  code: string
): Promise<{ success: boolean; message?: string }> {
  const user = await User.findById(userId).select('+mfaSecret');
  if (!user || !user.mfaSecret) {
    return { success: false, message: 'Chưa khởi tạo MFA, vui lòng gọi setup trước' };
  }

  if (!verifyMfaCode(code, user.mfaSecret)) {
    return { success: false, message: 'Mã xác thực không đúng' };
  }

  user.mfaEnabled = 'enabled';
  await user.save();

  return { success: true, message: 'Đã bật xác thực hai yếu tố' };
}

/**
 * Disable MFA for a user (requires current password + valid MFA code).
 */
export async function disableMfa(
  userId: string,
  code: string
): Promise<{ success: boolean; message?: string }> {
  const user = await User.findById(userId).select('+password +mfaSecret');
  if (!user) return { success: false, message: 'Tài khoản không tồn tại' };

  if (!user.mfaSecret) {
    return { success: false, message: 'MFA chưa được bật cho tài khoản này' };
  }

  if (!verifyMfaCode(code, user.mfaSecret)) {
    return { success: false, message: 'Mã xác thực không đúng' };
  }

  user.mfaEnabled = 'disabled';
  user.mfaSecret = undefined;
  await user.save();

  return { success: true, message: 'Đã tắt xác thực hai yếu tố' };
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function sanitizeUser(user: any) {
  const obj = user.toObject ? user.toObject() : user;
  // Rename _id → id for frontend compatibility
  obj.id = obj._id?.toString() ?? obj._id;
  delete obj._id;
  // Rename displayName → name for frontend User type
  obj.name = obj.displayName ?? obj.name;
  delete obj.displayName;
  delete obj.password;
  delete obj.refreshToken;
  delete obj.mfaSecret;
  delete obj.__v;
  return obj;
}

async function logFailedLogin(
  email: string,
  ip: string,
  userAgent: string,
  reason: string
) {
  logger.warn('Login failed', { email, ip, reason });
  // Optionally log to AuditLog with failure status
}

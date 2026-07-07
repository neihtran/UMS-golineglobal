import { Request, Response } from 'express';
import { User } from '@/models/User.js';
import { AuditLog } from '@/models/AuditLog.js';
import { logger } from '@/utils/logger.js';
import {
  login,
  verifyMfa,
  refreshTokens,
  logout,
  setupMfa,
  confirmMfaSetup,
  disableMfa,
} from '@/services/auth.service.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';

const getClientInfo = (req: Request) => ({
  ip: (req.ip as string) || req.socket.remoteAddress || 'unknown',
  userAgent: req.get('user-agent') || 'unknown',
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { ip, userAgent } = getClientInfo(req);

  const result = await login(email, password, ip, userAgent);

  if (!result.success) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: result.message! } });
    return;
  }

  if (result.mfaRequired) {
    res.json({
      success: true,
      mfaRequired: true,
      user: result.user,
      tempToken: result.tempToken,
    });
    return;
  }

  res.json({
    success: true,
    mfaRequired: false,
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

export const mfaVerifyHandler = asyncHandler(async (req: Request, res: Response) => {
  const { tempToken, code } = req.body;
  const { ip, userAgent } = getClientInfo(req);

  const result = await verifyMfa(tempToken, code, ip, userAgent);

  if (!result.success) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: result.message! } });
    return;
  }

  res.json({
    success: true,
    mfaRequired: false,
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

export const refreshHandler = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const result = await refreshTokens(refreshToken);

  if (!result.success) {
    res.status(401).json({ success: false, error: { code: 'TOKEN_EXPIRED', message: result.message! } });
    return;
  }

  res.json({ success: true, data: { accessToken: result.accessToken } });
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    const { ip, userAgent } = getClientInfo(req);
    await logout(req.user._id.toString(), ip, userAgent);
  }

  res.json({ success: true, message: 'Đăng xuất thành công' });
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id)
    .select('-password -refreshToken -mfaSecret -__v')
    .populate('department', 'name code shortName');

  res.json({ success: true, data: user });
});

export const setupMfaHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await setupMfa(req.user!._id.toString());

  if (!result.success) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: result.message! } });
    return;
  }

  res.json({
    success: true,
    data: {
      secret: result.secret,
      qrCodeUrl: result.qrCodeUrl,
    },
  });
});

export const confirmMfaHandler = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;
  const result = await confirmMfaSetup(req.user!._id.toString(), code);

  if (!result.success) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: result.message! } });
    return;
  }

  res.json({ success: true, message: result.message });
});

export const disableMfaHandler = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;
  const result = await disableMfa(req.user!._id.toString(), code);

  if (!result.success) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: result.message! } });
    return;
  }

  res.json({ success: true, message: result.message });
});

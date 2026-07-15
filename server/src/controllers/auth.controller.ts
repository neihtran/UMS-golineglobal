import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const authController = {
  // POST /api/auth/login
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const ip = req.ip;
    const userAgent = req.get('user-agent');

    const result = await authService.login(email, password, ip, userAgent);
    
    res.json({
      success: true,
      ...result,
    });
  }),

  // POST /api/auth/mfa
  verifyMfa: asyncHandler(async (req: Request, res: Response) => {
    const { tempToken, code } = req.body;
    const ip = req.ip;
    const userAgent = req.get('user-agent');

    const result = await authService.verifyMfa(tempToken, code, ip, userAgent);
    
    res.json({
      success: true,
      ...result,
    });
  }),

  // POST /api/auth/refresh
  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const result = await authService.refreshToken(refreshToken);
    
    res.json({
      success: true,
      data: result,
    });
  }),

  // POST /api/auth/logout
  logout: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const ip = req.ip;
    const userAgent = req.get('user-agent');

    await authService.logout(userId || undefined, ip, userAgent);
    
    res.json({
      success: true,
      message: 'Đăng xuất thành công',
    });
  }),

  // GET /api/auth/me
  getCurrentUser: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
      });
      return;
    }

    const user = await authService.getCurrentUser(userId);
    
    res.json({
      success: true,
      data: user,
    });
  }),

  // POST /api/auth/mfa/setup
  setupMfa: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
      });
      return;
    }

    const result = await authService.setupMfa(userId);
    
    res.json({
      success: true,
      data: result,
    });
  }),

  // POST /api/auth/mfa/enable
  enableMfa: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const { code } = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
      });
      return;
    }

    const result = await authService.enableMfa(userId, code);
    
    res.json({
      success: true,
      data: result,
    });
  }),

  // POST /api/auth/register - Create new user (admin only or signup)
  register: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, username, displayName, fullName, role } = req.body;
    const name = displayName || fullName || username || email.split('@')[0];

    const user = await authService.register({
      email,
      password,
      username: username || email.split('@')[0],
      displayName: name,
      role: role || 'SINH_VIEN',
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
    });
  }),
};

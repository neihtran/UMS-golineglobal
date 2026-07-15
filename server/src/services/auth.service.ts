import { signAccessToken, signRefreshToken, verifyRefreshToken, TokenPayload } from '../utils/jwt.js';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { AppError } from '../middleware/error.middleware.js';

// ─── Auth Service ─────────────────────────────────────────────────────────────
export class AuthService {
  // Login with email/password
  async login(email: string, password: string, ip?: string, userAgent?: string) {
    const { User } = await import('../models/User.js');
    const { AuditLog } = await import('../models/AuditLog.js');
    
    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      // Log failed attempt
      await this.logFailedLogin(email, ip, userAgent, 'User not found');
      throw new AppError('Email hoặc mật khẩu không đúng', 401, 'INVALID_CREDENTIALS');
    }

    // Check if account is locked
    if (user.status === 'locked') {
      throw new AppError('Tài khoản đã bị khóa', 403, 'ACCOUNT_LOCKED');
    }

    if (user.status === 'inactive') {
      throw new AppError('Tài khoản đã bị vô hiệu hóa', 403, 'ACCOUNT_INACTIVE');
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      // Increment failed attempts
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.status = 'locked';
        user.lockReason = 'failed_attempts';
      }
      await user.save();

      await this.logFailedLogin(email, ip, userAgent, 'Invalid password');
      throw new AppError('Email hoặc mật khẩu không đúng', 401, 'INVALID_CREDENTIALS');
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lastLogin = new Date();

    // Check if MFA is required for this role
    const mfaRequiredRoles = ['SUPER_ADMIN', 'ADMIN', 'HIEU_TRUONG', 'PHO_HIEU_TRUONG'];
    const requiresMfa = mfaRequiredRoles.includes(user.role);

    // If MFA is enabled and required, return temp token
    if (user.mfaEnabled && requiresMfa) {
      const tempToken = this.generateTempToken(user._id.toString());
      await user.save();
      
      return {
        mfaRequired: true,
        tempToken,
        userId: user._id.toString(),
      };
    }

    // Generate tokens
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Log successful login
    await AuditLog.create({
      userId: user._id,
      userName: user.displayName,
      userEmail: user.email,
      action: 'LOGIN',
      resource: 'Auth',
      ip,
      userAgent,
      status: 'success',
      details: 'Đăng nhập thành công',
      timestamp: new Date(),
    });

    // Return user without sensitive data
    const userResponse = await User.findById(user._id)
      .select('-password -mfaSecret -refreshToken')
      .populate('department', 'name code');

    return {
      user: userResponse,
      accessToken,
      refreshToken,
    };
  }

  // Verify MFA code
  async verifyMfa(tempToken: string, code: string, ip?: string, userAgent?: string) {
    const { User } = await import('../models/User.js');
    const { AuditLog } = await import('../models/AuditLog.js');
    
    // Verify temp token
    let userId: string;
    try {
      const decoded = this.verifyTempToken(tempToken);
      userId = decoded.userId;
    } catch {
      throw new Error('Temp token không hợp lệ hoặc đã hết hạn');
    }

    const user = await User.findById(userId).select('+mfaSecret');
    if (!user || !user.mfaSecret) {
      throw new Error('Người dùng không tìm thấy hoặc chưa bật MFA');
    }

    // Verify TOTP code
    const isValid = authenticator.verify({
      token: code,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new Error('Mã MFA không đúng');
    }

    // Generate tokens
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Log MFA login
    await AuditLog.create({
      userId: user._id,
      userName: user.displayName,
      userEmail: user.email,
      action: 'LOGIN',
      resource: 'Auth',
      ip,
      userAgent,
      status: 'success',
      details: 'Đăng nhập MFA thành công',
      timestamp: new Date(),
    });

    const userResponse = await User.findById(user._id)
      .select('-password -mfaSecret -refreshToken')
      .populate('department', 'name code');

    return {
      user: userResponse,
      accessToken,
      refreshToken,
    };
  }

  // Refresh access token
  async refreshToken(refreshToken: string) {
    const { User } = await import('../models/User.js');
    
    try {
      const decoded = verifyRefreshToken(refreshToken);
      
      const user = await User.findById(decoded.userId).select('+refreshToken');
      if (!user || user.refreshToken !== refreshToken) {
        throw new Error('Refresh token không hợp lệ');
      }

      if (user.status !== 'active') {
        throw new Error('Tài khoản không hoạt động');
      }

      // Generate new access token
      const payload: TokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = signAccessToken(payload);

      return { accessToken };
    } catch {
      throw new Error('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }

  // Logout
  async logout(userId: string | undefined, ip?: string, userAgent?: string) {
    const { User } = await import('../models/User.js');
    const { AuditLog } = await import('../models/AuditLog.js');
    
    if (!userId) return;
    
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = undefined;
      await user.save();

      await AuditLog.create({
        userId: user._id,
        userName: user.displayName,
        userEmail: user.email,
        action: 'LOGOUT',
        resource: 'Auth',
        ip,
        userAgent,
        status: 'success',
        details: 'Đăng xuất thành công',
        timestamp: new Date(),
      });
    }
  }

  // Setup MFA
  async setupMfa(userId: string) {
    const { User } = await import('../models/User.js');
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Người dùng không tìm thấy');
    }

    // Generate new secret
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'UMS-University', secret);

    // Generate QR code
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    // Save secret temporarily (not enabled yet)
    user.mfaSecret = secret;
    await user.save();

    return {
      secret,
      qrCode,
    };
  }

  // Enable MFA after verification
  async enableMfa(userId: string, code: string) {
    const { User } = await import('../models/User.js');
    
    const user = await User.findById(userId).select('+mfaSecret');
    if (!user || !user.mfaSecret) {
      throw new Error('Chưa thiết lập MFA');
    }

    // Verify the code first
    const isValid = authenticator.verify({
      token: code,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new Error('Mã MFA không đúng');
    }

    user.mfaEnabled = true;
    await user.save();

    return { success: true };
  }

  // Get current user
  async getCurrentUser(userId: string) {
    const { User } = await import('../models/User.js');
    
    const user = await User.findById(userId)
      .select('-password -mfaSecret -refreshToken')
      .populate('department', 'name code');
    
    if (!user) {
      throw new Error('Người dùng không tìm thấy');
    }

    return user;
  }

  // ─── Helper Methods ─────────────────────────────────────────────────────────
  
  private generateTempToken(userId: string): string {
    const payload = {
      userId,
      type: 'mfa_temp',
      exp: Date.now() + 5 * 60 * 1000, // 5 minutes
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  private verifyTempToken(token: string): { userId: string } {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      if (payload.exp < Date.now()) {
        throw new Error('Token expired');
      }
      return { userId: payload.userId };
    } catch {
      throw new Error('Invalid token');
    }
  }

  // Register new user
  async register(data: {
    email: string;
    password: string;
    username: string;
    displayName: string;
    role?: string;
  }) {
    const { User } = await import('../models/User.js');

    // Check duplicate
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      const err: any = new Error('Email đã tồn tại');
      err.statusCode = 409;
      err.code = 'EMAIL_EXISTS';
      throw err;
    }

    const user = await User.create({
      email: data.email,
      username: data.username,
      displayName: data.displayName,
      password: data.password,  // User.pre('save') will hash automatically
      role: data.role || 'SINH_VIEN',
      isActive: true,
    });

    return user;
  }

  private async logFailedLogin(email: string, ip?: string, userAgent?: string, reason?: string) {
    const { User } = await import('../models/User.js');
    const { AuditLog } = await import('../models/AuditLog.js');
    
    // Try to find user by email for audit
    const user = await User.findOne({ email });
    
    await AuditLog.create({
      userId: user?._id,
      userName: user?.displayName || email,
      userEmail: email,
      action: 'LOGIN',
      resource: 'Auth',
      ip,
      userAgent,
      status: 'failure',
      details: reason,
      timestamp: new Date(),
    });
  }
}

export const authService = new AuthService();

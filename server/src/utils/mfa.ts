import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { MFA_REQUIRED_ROLES } from '@/middleware/role.middleware.js';

const ISSUER = process.env.TOTP_ISSUER || 'UMS-University';

// Configure TOTP (30-second window, 6 digits)
authenticator.options = {
  step: 30,
  digits: 6,
  algorithm: 'sha1' as any,
};

/**
 * Generate a new TOTP secret for a user.
 */
export function generateMfaSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Generate TOTP URI for QR code.
 * @param email - User's email (used as account name)
 * @param secret - The TOTP secret
 */
export function generateOtpAuthUri(email: string, secret: string): string {
  return authenticator.keyuri(email, ISSUER, email);
}

/**
 * Generate QR code as data URL (base64 PNG).
 * @param email - User's email
 * @param secret - The TOTP secret
 */
export async function generateQrCodeDataUrl(
  email: string,
  secret: string
): Promise<string> {
  const otpauth = generateOtpAuthUri(email, secret);
  return QRCode.toDataURL(otpauth, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    margin: 2,
    width: 256,
  });
}

/**
 * Verify a TOTP code.
 * @param code - 6-digit code from authenticator app
 * @param secret - User's TOTP secret
 */
export function verifyMfaCode(code: string, secret: string): boolean {
  try {
    // Allow 1 window tolerance (1 minute buffer)
    return authenticator.verify({ token: code, secret });
  } catch {
    return false;
  }
}

/**
 * Check if a role requires MFA setup.
 */
export function isMfaRequiredForRole(role: string): boolean {
  return MFA_REQUIRED_ROLES.includes(role);
}

/**
 * Mask a secret for display (show first 4 + last 4 chars).
 */
export function maskSecret(secret: string): string {
  if (secret.length <= 8) return '***';
  return secret.slice(0, 4) + '****' + secret.slice(-4);
}

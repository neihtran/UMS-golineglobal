import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plain password. Use bcrypt with salt rounds = 12.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compare plain password with hashed password.
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Validate password strength.
 * Rules: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit.
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  if (!/[A-Z]/.test(password)) errors.push('Mật khẩu phải chứa ít nhất 1 chữ hoa');
  if (!/[a-z]/.test(password)) errors.push('Mật khẩu phải chứa ít nhất 1 chữ thường');
  if (!/[0-9]/.test(password)) errors.push('Mật khẩu phải chứa ít nhất 1 chữ số');
  if (!/[^A-Za-z0-9]/.test(password))
    errors.push('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt');

  return { valid: errors.length === 0, errors };
}

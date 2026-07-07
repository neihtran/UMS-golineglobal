/**
 * Auth service — wraps backend auth endpoints.
 * Called by authStore actions.
 */
import { apiClient } from '@/lib/apiClient';
import type { User } from '@/types/auth.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface MfaChallengeResponse {
  mfaRequired: true;
  tempToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}

export const authService = {
  /**
   * POST /api/auth/login
   * Returns either AuthResponse OR MfaChallengeResponse
   */
  login: (data: LoginRequest) =>
    apiClient.post<{ success: boolean } & (AuthResponse | MfaChallengeResponse)>(
      '/auth/login',
      data
    ),

  /**
   * POST /api/auth/mfa — verify TOTP code after MFA challenge
   */
  verifyMfa: (tempToken: string, code: string) =>
    apiClient.post<{ success: true; data: AuthResponse }>('/auth/mfa', { tempToken, code }),

  /**
   * POST /api/auth/refresh — get new access token
   */
  refresh: (refreshToken: string) =>
    apiClient.post<{ success: true; data: RefreshResponse }>('/auth/refresh', { refreshToken }),

  /**
   * GET /api/auth/me — get current user profile
   */
  me: () =>
    apiClient.get<{ success: true; data: User }>('/auth/me'),

  /**
   * POST /api/auth/logout
   */
  logout: () =>
    apiClient.post<{ success: true }>('/auth/logout'),

  /**
   * POST /api/auth/mfa/setup — generate MFA secret and QR code
   */
  setupMfa: () =>
    apiClient.post<{ success: true; data: { secret: string; qrCodeUrl: string } }>(
      '/auth/mfa/setup'
    ),

  /**
   * POST /api/auth/mfa/confirm — verify first code and enable MFA
   */
  confirmMfa: (code: string) =>
    apiClient.post<{ success: true; message: string }>('/auth/mfa/confirm', { code }),

  /**
   * DELETE /api/auth/mfa — disable MFA
   */
  disableMfa: (code: string) =>
    apiClient.delete<{ success: true; message: string }>('/auth/mfa', {
      data: { code },
    }),
};

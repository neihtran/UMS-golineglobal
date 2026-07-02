import { useAuth } from '@/app/providers';
import type { Role } from '@/types/auth.types';

/**
 * Check if the current user has a specific permission.
 * Supports wildcard: "iam.*" matches "iam.users", "iam.roles", etc.
 * Returns false if user is not authenticated.
 */
export function usePermission(permission: string): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

/**
 * Check if the current user has one of the specified roles.
 */
export function useRole(roles: Role | Role[]): boolean {
  const { hasRole } = useAuth();
  return hasRole(roles);
}

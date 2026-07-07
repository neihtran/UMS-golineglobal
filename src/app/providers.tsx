// Re-export AuthProvider and useAuth from the dedicated file.
// This file exists so the AuthProvider chunk is isolated from the router chunk,
// preventing Vite HMR invalidation of the auth context when router.tsx changes.
export { AuthProvider, useAuth } from './providers/AuthProvider';

import type { AuthUser } from '@/types/auth';

export function getPostLoginRoute(role: AuthUser['role'] | undefined): '/dashboard' | '/admin' {
  return role === 'admin' ? '/admin' : '/dashboard';
}

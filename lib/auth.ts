/**
 * Authentication helper functions
 * 
 * TODO: Replace with NextAuth session handling once authentication is implemented.
 * For now, this provides a temporary development solution.
 */

import { prisma } from './prisma';

/**
 * Get the current authenticated user
 * 
 * TEMPORARY: In development, returns the first active admin user.
 * This will be replaced with NextAuth session handling.
 * 
 * @returns Promise<{ id: string; isAdmin: boolean; isActive: boolean } | null>
 */
export async function getCurrentUser(): Promise<{
  id: string;
  isAdmin: boolean;
  isActive: boolean;
} | null> {
  try {
    // TEMPORARY: Get first active admin user for development
    // TODO: Replace with NextAuth session: getServerSession() or auth()
    const user = await prisma.user.findFirst({
      where: {
        isAdmin: true,
        isActive: true,
      },
      select: {
        id: true,
        isAdmin: true,
        isActive: true,
      },
      orderBy: {
        createdAt: 'asc', // Get the first created admin (usually the seed admin)
      },
    });

    if (!user) {
      console.warn('[AUTH] No active admin user found in database');
      return null;
    }

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('[AUTH] Current user:', { 
        id: user.id, 
        isAdmin: user.isAdmin, 
        isActive: user.isActive 
      });
    }

    return user;
  } catch (error) {
    console.error('[AUTH] Error getting current user:', error);
    return null;
  }
}

/**
 * Get the current user ID
 * 
 * @returns Promise<string | null>
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}


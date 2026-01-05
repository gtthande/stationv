/**
 * Role-Based Access Control (RBAC) helper functions
 * 
 * This module provides utilities for checking user permissions based on
 * the UserPermission model in the Prisma schema.
 * 
 * Note: The current schema uses direct User-Permission mapping (no roles).
 */

import { prisma } from './db';

/**
 * Check if a user has a specific permission
 * 
 * @param userId - The ID of the user to check (UUID string)
 * @param permissionKey - The permission key to check (e.g., 'inventory.view', 'jobcard.create')
 * @returns Promise<boolean> - True if the user has the permission, false otherwise
 * 
 * @example
 * ```typescript
 * const canReadInventory = await can(userId, 'inventory.view');
 * if (canReadInventory) {
 *   // User can read inventory
 * }
 * ```
 */
export async function can(userId: string, permissionKey: string): Promise<boolean> {
  try {
    const userPermission = await prisma.userPermission.findFirst({
      where: {
        userId: userId,
        permission: {
          key: permissionKey,
          isActive: true,
        },
        user: {
          isActive: true,
        },
      },
    });

    return userPermission !== null;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Get all permissions for a user
 * 
 * @param userId - The ID of the user (UUID string)
 * @returns Promise<string[]> - Array of permission keys
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const userPermissions = await prisma.userPermission.findMany({
      where: {
        userId: userId,
        user: {
          isActive: true,
        },
        permission: {
          isActive: true,
        },
      },
      include: {
        permission: true,
      },
    });

    return userPermissions.map(up => up.permission.key);
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Check if a user has any of the specified permissions
 * 
 * @param userId - The ID of the user to check (UUID string)
 * @param permissionKeys - Array of permission keys to check
 * @returns Promise<boolean> - True if the user has at least one of the permissions
 */
export async function canAny(
  userId: string,
  permissionKeys: string[]
): Promise<boolean> {
  if (permissionKeys.length === 0) {
    return false;
  }

  const userPermissions = await getUserPermissions(userId);
  return permissionKeys.some(key => userPermissions.includes(key));
}

/**
 * Check if a user has all of the specified permissions
 * 
 * @param userId - The ID of the user to check (UUID string)
 * @param permissionKeys - Array of permission keys to check
 * @returns Promise<boolean> - True if the user has all of the permissions
 */
export async function canAll(
  userId: string,
  permissionKeys: string[]
): Promise<boolean> {
  if (permissionKeys.length === 0) {
    return true;
  }

  const userPermissions = await getUserPermissions(userId);
  return permissionKeys.every(key => userPermissions.includes(key));
}

/**
 * Get all permissions for a user with full details
 * 
 * @param userId - The ID of the user (UUID string)
 * @returns Promise<Array<{id: string, key: string, description: string, module: string}>>
 */
export async function getUserPermissionsWithDetails(userId: string) {
  try {
    const userPermissions = await prisma.userPermission.findMany({
      where: {
        userId: userId,
        user: {
          isActive: true,
        },
        permission: {
          isActive: true,
        },
      },
      include: {
        permission: true,
      },
    });

    return userPermissions.map(up => ({
      id: up.permission.id,
      key: up.permission.key,
      description: up.permission.description,
      module: up.permission.module,
      category: up.permission.category,
    }));
  } catch (error) {
    console.error('Error getting user permissions with details:', error);
    return [];
  }
}

/**
 * Note: getUserRoles() is not available in the current schema.
 * The schema uses direct User-Permission mapping without roles.
 * Use getUserPermissions() or getUserPermissionsWithDetails() instead.
 */

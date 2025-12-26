/**
 * Role-Based Access Control (RBAC) helper functions
 * 
 * This module provides utilities for checking user permissions based on
 * their assigned roles and the permissions associated with those roles.
 */

import { prisma } from './db';

/**
 * Check if a user has a specific permission
 * 
 * @param userId - The ID of the user to check
 * @param permissionCode - The permission code to check (e.g., 'inventory:read', 'jobs:write')
 * @returns Promise<boolean> - True if the user has the permission, false otherwise
 * 
 * @example
 * ```typescript
 * const canReadInventory = await can(userId, 'inventory:read');
 * if (canReadInventory) {
 *   // User can read inventory
 * }
 * ```
 */
export async function can(userId: number, permissionCode: string): Promise<boolean> {
  try {
    // Get all roles for the user
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: userId,
        user: {
          isActive: true,
        },
      },
      include: {
        role: true,
      },
    });

    if (userRoles.length === 0) {
      return false;
    }

    const roleIds = userRoles.map(ur => ur.roleId);

    // Check if any of the user's roles have the requested permission
    const hasPermission = await prisma.rolePermission.findFirst({
      where: {
        roleId: {
          in: roleIds,
        },
        permission: {
          code: permissionCode,
        },
      },
    });

    return hasPermission !== null;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Get all permissions for a user (across all their roles)
 * 
 * @param userId - The ID of the user
 * @returns Promise<string[]> - Array of permission codes
 */
export async function getUserPermissions(userId: number): Promise<string[]> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: userId,
        user: {
          isActive: true,
        },
      },
      include: {
        role: true,
      },
    });

    if (userRoles.length === 0) {
      return [];
    }

    const roleIds = userRoles.map(ur => ur.roleId);

    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        roleId: {
          in: roleIds,
        },
      },
      include: {
        permission: true,
      },
    });

    // Extract unique permission codes
    const permissionCodes = new Set(
      rolePermissions.map(rp => rp.permission.code)
    );

    return Array.from(permissionCodes);
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Check if a user has any of the specified permissions
 * 
 * @param userId - The ID of the user to check
 * @param permissionCodes - Array of permission codes to check
 * @returns Promise<boolean> - True if the user has at least one of the permissions
 */
export async function canAny(
  userId: number,
  permissionCodes: string[]
): Promise<boolean> {
  if (permissionCodes.length === 0) {
    return false;
  }

  const userPermissions = await getUserPermissions(userId);
  return permissionCodes.some(code => userPermissions.includes(code));
}

/**
 * Check if a user has all of the specified permissions
 * 
 * @param userId - The ID of the user to check
 * @param permissionCodes - Array of permission codes to check
 * @returns Promise<boolean> - True if the user has all of the permissions
 */
export async function canAll(
  userId: number,
  permissionCodes: string[]
): Promise<boolean> {
  if (permissionCodes.length === 0) {
    return true;
  }

  const userPermissions = await getUserPermissions(userId);
  return permissionCodes.every(code => userPermissions.includes(code));
}

/**
 * Get all roles for a user
 * 
 * @param userId - The ID of the user
 * @returns Promise<Array<{id: number, name: string, description: string | null}>>
 */
export async function getUserRoles(userId: number) {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: userId,
        user: {
          isActive: true,
        },
      },
      include: {
        role: true,
      },
    });

    return userRoles.map(ur => ({
      id: ur.role.id,
      name: ur.role.name,
      description: ur.role.description,
    }));
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
}


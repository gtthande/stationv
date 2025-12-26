/**
 * RBAC helper function tests
 * 
 * These tests verify that the RBAC permission checking functions work correctly.
 * Note: These are unit tests that should be run with a test database.
 */

import { can, getUserPermissions, canAny, canAll, getUserRoles } from '../rbac';
import { prisma } from '../db';

// Mock Prisma client for testing
jest.mock('../db', () => ({
  prisma: {
    userRole: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    rolePermission: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('RBAC Functions', () => {
  const mockUserId = 1;
  const mockPermissionCode = 'inventory:read';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('can', () => {
    it('should return true when user has the permission', async () => {
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([
        { userId: mockUserId, roleId: 1, role: { id: 1, name: 'Admin' } },
      ]);

      (prisma.rolePermission.findFirst as jest.Mock).mockResolvedValue({
        roleId: 1,
        permissionId: 1,
        permission: { code: mockPermissionCode },
      });

      const result = await can(mockUserId, mockPermissionCode);
      expect(result).toBe(true);
    });

    it('should return false when user does not have the permission', async () => {
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([
        { userId: mockUserId, roleId: 1, role: { id: 1, name: 'Viewer' } },
      ]);

      (prisma.rolePermission.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await can(mockUserId, mockPermissionCode);
      expect(result).toBe(false);
    });

    it('should return false when user has no roles', async () => {
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([]);

      const result = await can(mockUserId, mockPermissionCode);
      expect(result).toBe(false);
    });

    it('should return false on database error', async () => {
      (prisma.userRole.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await can(mockUserId, mockPermissionCode);
      expect(result).toBe(false);
    });
  });

  describe('getUserPermissions', () => {
    it('should return all permissions for a user', async () => {
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([
        { userId: mockUserId, roleId: 1, role: { id: 1, name: 'Admin' } },
        { userId: mockUserId, roleId: 2, role: { id: 2, name: 'Manager' } },
      ]);

      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue([
        { roleId: 1, permission: { code: 'inventory:read' } },
        { roleId: 1, permission: { code: 'inventory:write' } },
        { roleId: 2, permission: { code: 'jobs:read' } },
      ]);

      const permissions = await getUserPermissions(mockUserId);
      expect(permissions).toContain('inventory:read');
      expect(permissions).toContain('inventory:write');
      expect(permissions).toContain('jobs:read');
      expect(permissions.length).toBe(3);
    });

    it('should return empty array when user has no roles', async () => {
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([]);

      const permissions = await getUserPermissions(mockUserId);
      expect(permissions).toEqual([]);
    });
  });

  describe('canAny', () => {
    it('should return true if user has at least one permission', async () => {
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([
        { userId: mockUserId, roleId: 1, role: { id: 1, name: 'Admin' } },
      ]);

      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue([
        { roleId: 1, permission: { code: 'inventory:read' } },
      ]);

      const result = await canAny(mockUserId, ['inventory:read', 'jobs:write']);
      expect(result).toBe(true);
    });

    it('should return false if user has none of the permissions', async () => {
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([
        { userId: mockUserId, roleId: 1, role: { id: 1, name: 'Viewer' } },
      ]);

      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue([
        { roleId: 1, permission: { code: 'inventory:read' } },
      ]);

      const result = await canAny(mockUserId, ['jobs:write', 'admin:manage']);
      expect(result).toBe(false);
    });
  });

  describe('canAll', () => {
    it('should return true if user has all permissions', async () => {
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([
        { userId: mockUserId, roleId: 1, role: { id: 1, name: 'Admin' } },
      ]);

      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue([
        { roleId: 1, permission: { code: 'inventory:read' } },
        { roleId: 1, permission: { code: 'inventory:write' } },
      ]);

      const result = await canAll(mockUserId, ['inventory:read', 'inventory:write']);
      expect(result).toBe(true);
    });

    it('should return false if user is missing any permission', async () => {
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([
        { userId: mockUserId, roleId: 1, role: { id: 1, name: 'Viewer' } },
      ]);

      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue([
        { roleId: 1, permission: { code: 'inventory:read' } },
      ]);

      const result = await canAll(mockUserId, ['inventory:read', 'inventory:write']);
      expect(result).toBe(false);
    });
  });

  describe('getUserRoles', () => {
    it('should return all roles for a user', async () => {
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([
        {
          userId: mockUserId,
          roleId: 1,
          role: { id: 1, name: 'Admin', description: 'Administrator role' },
        },
        {
          userId: mockUserId,
          roleId: 2,
          role: { id: 2, name: 'Manager', description: 'Manager role' },
        },
      ]);

      const roles = await getUserRoles(mockUserId);
      expect(roles).toHaveLength(2);
      expect(roles[0]).toEqual({
        id: 1,
        name: 'Admin',
        description: 'Administrator role',
      });
    });

    it('should return empty array when user has no roles', async () => {
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([]);

      const roles = await getUserRoles(mockUserId);
      expect(roles).toEqual([]);
    });
  });
});


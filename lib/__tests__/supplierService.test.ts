/**
 * Supplier Service Tests
 * 
 * Unit tests for supplier service with RBAC permission checks.
 */

import {
  getSuppliers,
  getSupplierById,
  getSupplierByCode,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  SupplierServiceError,
} from '../services/supplierService';
import { can } from '../rbac';
import { prisma } from '../db';

// Mock dependencies
jest.mock('../rbac');
jest.mock('../db', () => ({
  prisma: {
    supplier: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockCan = can as jest.MockedFunction<typeof can>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('SupplierService', () => {
  const mockUserId = 'user-123';
  const mockSupplierId = BigInt(1);
  const mockSupplier = {
    id: mockSupplierId,
    code: 'SUP001',
    name: 'Test Supplier',
    contactName: 'John Doe',
    email: 'john@supplier.com',
    phone: '+254712345678',
    country: 'Kenya',
    city: 'Nairobi',
    address: '123 Main St',
    notes: 'Test notes',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCan.mockResolvedValue(true); // Default: user has permission
  });

  describe('getSuppliers', () => {
    it('should return suppliers when user has permission', async () => {
      mockPrisma.supplier.findMany.mockResolvedValue([mockSupplier]);

      const result = await getSuppliers(mockUserId);

      expect(mockCan).toHaveBeenCalledWith(mockUserId, 'admin.manage_suppliers');
      expect(mockPrisma.supplier.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Supplier');
    });

    it('should filter by activeOnly when provided', async () => {
      mockPrisma.supplier.findMany.mockResolvedValue([mockSupplier]);

      await getSuppliers(mockUserId, { activeOnly: true });

      expect(mockPrisma.supplier.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    });

    it('should filter by search term when provided', async () => {
      mockPrisma.supplier.findMany.mockResolvedValue([mockSupplier]);

      await getSuppliers(mockUserId, { search: 'Test' });

      expect(mockPrisma.supplier.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Test' } },
            { code: { contains: 'Test' } },
            { email: { contains: 'Test' } },
            { contactName: { contains: 'Test' } },
          ],
        },
        orderBy: { name: 'asc' },
      });
    });

    it('should throw error when user lacks permission', async () => {
      mockCan.mockResolvedValue(false);

      await expect(getSuppliers(mockUserId)).rejects.toThrow(SupplierServiceError);
      await expect(getSuppliers(mockUserId)).rejects.toThrow('Permission denied');
    });

    it('should handle database errors', async () => {
      mockPrisma.supplier.findMany.mockRejectedValue(new Error('Database error'));

      await expect(getSuppliers(mockUserId)).rejects.toThrow(SupplierServiceError);
      await expect(getSuppliers(mockUserId)).rejects.toThrow('Failed to fetch suppliers');
    });
  });

  describe('getSupplierById', () => {
    it('should return supplier when found and user has permission', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(mockSupplier);

      const result = await getSupplierById(mockUserId, mockSupplierId);

      expect(mockCan).toHaveBeenCalledWith(mockUserId, 'admin.manage_suppliers');
      expect(mockPrisma.supplier.findUnique).toHaveBeenCalledWith({
        where: { id: mockSupplierId },
      });
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Test Supplier');
    });

    it('should return null when supplier not found', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(null);

      const result = await getSupplierById(mockUserId, mockSupplierId);

      expect(result).toBeNull();
    });

    it('should throw error when user lacks permission', async () => {
      mockCan.mockResolvedValue(false);

      await expect(getSupplierById(mockUserId, mockSupplierId)).rejects.toThrow(
        SupplierServiceError
      );
    });
  });

  describe('getSupplierByCode', () => {
    it('should return supplier when found and user has permission', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(mockSupplier);

      const result = await getSupplierByCode(mockUserId, 'SUP001');

      expect(mockCan).toHaveBeenCalledWith(mockUserId, 'admin.manage_suppliers');
      expect(mockPrisma.supplier.findUnique).toHaveBeenCalledWith({
        where: { code: 'SUP001' },
      });
      expect(result).not.toBeNull();
    });

    it('should return null when supplier not found', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(null);

      const result = await getSupplierByCode(mockUserId, 'INVALID');

      expect(result).toBeNull();
    });
  });

  describe('createSupplier', () => {
    const createData = {
      code: 'SUP002',
      name: 'New Supplier',
      contactName: 'Jane Doe',
      email: 'jane@supplier.com',
      phone: '+254798765432',
      country: 'Kenya',
      city: 'Mombasa',
      address: '456 Beach Rd',
      notes: 'New supplier notes',
      isActive: true,
    };

    it('should create supplier when user has permission and data is valid', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(null); // No duplicate
      mockPrisma.supplier.create.mockResolvedValue({
        ...mockSupplier,
        ...createData,
        id: BigInt(2),
      });

      const result = await createSupplier(mockUserId, createData);

      expect(mockCan).toHaveBeenCalledWith(mockUserId, 'admin.manage_suppliers');
      expect(mockPrisma.supplier.create).toHaveBeenCalled();
      expect(result.name).toBe('New Supplier');
    });

    it('should throw error when name is missing', async () => {
      await expect(createSupplier(mockUserId, { name: '' })).rejects.toThrow(
        SupplierServiceError
      );
      await expect(createSupplier(mockUserId, { name: '' })).rejects.toThrow(
        'Supplier name is required'
      );
    });

    it('should throw error when code already exists', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(mockSupplier); // Duplicate exists

      await expect(createSupplier(mockUserId, { ...createData, code: 'SUP001' })).rejects.toThrow(
        SupplierServiceError
      );
      await expect(createSupplier(mockUserId, { ...createData, code: 'SUP001' })).rejects.toThrow(
        'already exists'
      );
    });

    it('should throw error when user lacks permission', async () => {
      mockCan.mockResolvedValue(false);

      await expect(createSupplier(mockUserId, createData)).rejects.toThrow(SupplierServiceError);
    });

    it('should handle Prisma unique constraint errors', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(null);
      mockPrisma.supplier.create.mockRejectedValue({
        code: 'P2002',
        message: 'Unique constraint violation',
      });

      await expect(createSupplier(mockUserId, createData)).rejects.toThrow(SupplierServiceError);
      await expect(createSupplier(mockUserId, createData)).rejects.toThrow(
        'Supplier code already exists'
      );
    });
  });

  describe('updateSupplier', () => {
    const updateData = {
      name: 'Updated Supplier',
      email: 'updated@supplier.com',
    };

    it('should update supplier when user has permission and supplier exists', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(mockSupplier); // Supplier exists
      mockPrisma.supplier.update.mockResolvedValue({
        ...mockSupplier,
        ...updateData,
      });

      const result = await updateSupplier(mockUserId, mockSupplierId, updateData);

      expect(mockCan).toHaveBeenCalledWith(mockUserId, 'admin.manage_suppliers');
      expect(mockPrisma.supplier.update).toHaveBeenCalled();
      expect(result.name).toBe('Updated Supplier');
    });

    it('should throw error when supplier not found', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(null);

      await expect(updateSupplier(mockUserId, mockSupplierId, updateData)).rejects.toThrow(
        SupplierServiceError
      );
      await expect(updateSupplier(mockUserId, mockSupplierId, updateData)).rejects.toThrow(
        'Supplier not found'
      );
    });

    it('should throw error when name is set to empty', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(mockSupplier);

      await expect(
        updateSupplier(mockUserId, mockSupplierId, { name: '' })
      ).rejects.toThrow(SupplierServiceError);
      await expect(
        updateSupplier(mockUserId, mockSupplierId, { name: '' })
      ).rejects.toThrow('cannot be empty');
    });

    it('should throw error when code already exists', async () => {
      const existingWithCode = { ...mockSupplier, code: 'SUP002' };
      mockPrisma.supplier.findUnique
        .mockResolvedValueOnce(mockSupplier) // Original supplier
        .mockResolvedValueOnce(existingWithCode); // Duplicate code

      await expect(
        updateSupplier(mockUserId, mockSupplierId, { code: 'SUP002' })
      ).rejects.toThrow(SupplierServiceError);
    });
  });

  describe('deleteSupplier', () => {
    it('should soft delete supplier when user has permission', async () => {
      mockPrisma.supplier.update.mockResolvedValue({
        ...mockSupplier,
        isActive: false,
      });

      const result = await deleteSupplier(mockUserId, mockSupplierId);

      expect(mockCan).toHaveBeenCalledWith(mockUserId, 'admin.manage_suppliers');
      expect(mockPrisma.supplier.update).toHaveBeenCalledWith({
        where: { id: mockSupplierId },
        data: { isActive: false },
      });
      expect(result.isActive).toBe(false);
    });

    it('should throw error when supplier not found', async () => {
      mockPrisma.supplier.update.mockRejectedValue({
        code: 'P2025',
        message: 'Record not found',
      });

      await expect(deleteSupplier(mockUserId, mockSupplierId)).rejects.toThrow(
        SupplierServiceError
      );
      await expect(deleteSupplier(mockUserId, mockSupplierId)).rejects.toThrow(
        'Supplier not found'
      );
    });

    it('should throw error when user lacks permission', async () => {
      mockCan.mockResolvedValue(false);

      await expect(deleteSupplier(mockUserId, mockSupplierId)).rejects.toThrow(
        SupplierServiceError
      );
    });
  });
});


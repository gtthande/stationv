/**
 * Supplier Service
 * 
 * Business logic for supplier management with RBAC permission checks.
 * All methods require appropriate permissions before execution.
 */

import { prisma } from '../db';
import { can } from '../rbac';
import type { Supplier } from '../types';

/**
 * Error class for supplier service operations
 */
export class SupplierServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SupplierServiceError';
  }
}

/**
 * Input type for creating a supplier
 */
export interface CreateSupplierInput {
  code?: string | null;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive?: boolean;
}

/**
 * Input type for updating a supplier
 */
export interface UpdateSupplierInput {
  code?: string | null;
  name?: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive?: boolean;
}

/**
 * Get all suppliers (with optional filtering)
 * 
 * @param userId - User ID for permission check
 * @param options - Optional filters (activeOnly, search)
 * @returns Array of suppliers
 * @throws SupplierServiceError if user lacks permission
 */
export async function getSuppliers(
  userId: string,
  options?: {
    activeOnly?: boolean;
    search?: string;
  }
): Promise<Supplier[]> {
  // Check permission - using admin.manage_suppliers for view access
  // In future, could add admin.view_suppliers for read-only access
  const hasPermission = await can(userId, 'admin.manage_suppliers');
  if (!hasPermission) {
    throw new SupplierServiceError(
      'Permission denied: admin.manage_suppliers required',
      'PERMISSION_DENIED'
    );
  }

  try {
    const where: any = {};

    if (options?.activeOnly) {
      where.isActive = true;
    }

    if (options?.search) {
      const searchTerm = options.search;
      where.OR = [
        { name: { contains: searchTerm } },
        { code: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { contactName: { contains: searchTerm } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return suppliers.map(mapPrismaToSupplier);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw new SupplierServiceError(
      'Failed to fetch suppliers',
      'FETCH_ERROR'
    );
  }
}

/**
 * Get a single supplier by ID
 * 
 * @param userId - User ID for permission check
 * @param supplierId - Supplier ID
 * @returns Supplier or null if not found
 * @throws SupplierServiceError if user lacks permission
 */
export async function getSupplierById(
  userId: string,
  supplierId: bigint
): Promise<Supplier | null> {
  const hasPermission = await can(userId, 'admin.manage_suppliers');
  if (!hasPermission) {
    throw new SupplierServiceError(
      'Permission denied: admin.manage_suppliers required',
      'PERMISSION_DENIED'
    );
  }

  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    return supplier ? mapPrismaToSupplier(supplier) : null;
  } catch (error) {
    console.error('Error fetching supplier:', error);
    throw new SupplierServiceError(
      'Failed to fetch supplier',
      'FETCH_ERROR'
    );
  }
}

/**
 * Get a supplier by code
 * 
 * @param userId - User ID for permission check
 * @param code - Supplier code
 * @returns Supplier or null if not found
 * @throws SupplierServiceError if user lacks permission
 */
export async function getSupplierByCode(
  userId: string,
  code: string
): Promise<Supplier | null> {
  const hasPermission = await can(userId, 'admin.manage_suppliers');
  if (!hasPermission) {
    throw new SupplierServiceError(
      'Permission denied: admin.manage_suppliers required',
      'PERMISSION_DENIED'
    );
  }

  try {
    const supplier = await prisma.supplier.findUnique({
      where: { code },
    });

    return supplier ? mapPrismaToSupplier(supplier) : null;
  } catch (error) {
    console.error('Error fetching supplier by code:', error);
    throw new SupplierServiceError(
      'Failed to fetch supplier',
      'FETCH_ERROR'
    );
  }
}

/**
 * Create a new supplier
 * 
 * @param userId - User ID for permission check
 * @param data - Supplier data
 * @returns Created supplier
 * @throws SupplierServiceError if user lacks permission or validation fails
 */
export async function createSupplier(
  userId: string,
  data: CreateSupplierInput
): Promise<Supplier> {
  const hasPermission = await can(userId, 'admin.manage_suppliers');
  if (!hasPermission) {
    throw new SupplierServiceError(
      'Permission denied: admin.manage_suppliers required',
      'PERMISSION_DENIED'
    );
  }

  // Validation
  if (!data.name || data.name.trim().length === 0) {
    throw new SupplierServiceError(
      'Supplier name is required',
      'VALIDATION_ERROR'
    );
  }

  // Check for duplicate code if provided
  if (data.code) {
    const existing = await prisma.supplier.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      throw new SupplierServiceError(
        `Supplier with code "${data.code}" already exists`,
        'DUPLICATE_CODE'
      );
    }
  }

  try {
    const supplier = await prisma.supplier.create({
      data: {
        code: data.code || null,
        name: data.name.trim(),
        contactName: data.contactName?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        country: data.country?.trim() || data.country || 'Kenya',
        city: data.city?.trim() || null,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
        isActive: data.isActive ?? true,
      },
    });

    return mapPrismaToSupplier(supplier);
  } catch (error: any) {
    console.error('Error creating supplier:', error);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      throw new SupplierServiceError(
        'Supplier code already exists',
        'DUPLICATE_CODE'
      );
    }

    throw new SupplierServiceError(
      'Failed to create supplier',
      'CREATE_ERROR'
    );
  }
}

/**
 * Update an existing supplier
 * 
 * @param userId - User ID for permission check
 * @param supplierId - Supplier ID
 * @param data - Updated supplier data
 * @returns Updated supplier
 * @throws SupplierServiceError if user lacks permission or validation fails
 */
export async function updateSupplier(
  userId: string,
  supplierId: bigint,
  data: UpdateSupplierInput
): Promise<Supplier> {
  const hasPermission = await can(userId, 'admin.manage_suppliers');
  if (!hasPermission) {
    throw new SupplierServiceError(
      'Permission denied: admin.manage_suppliers required',
      'PERMISSION_DENIED'
    );
  }

  // Check if supplier exists
  const existing = await prisma.supplier.findUnique({
    where: { id: supplierId },
  });

  if (!existing) {
    throw new SupplierServiceError(
      'Supplier not found',
      'NOT_FOUND'
    );
  }

  // Validation
  if (data.name !== undefined && (!data.name || data.name.trim().length === 0)) {
    throw new SupplierServiceError(
      'Supplier name cannot be empty',
      'VALIDATION_ERROR'
    );
  }

  // Check for duplicate code if being changed
  if (data.code !== undefined && data.code !== existing.code) {
    if (data.code) {
      const duplicate = await prisma.supplier.findUnique({
        where: { code: data.code },
      });
      if (duplicate) {
        throw new SupplierServiceError(
          `Supplier with code "${data.code}" already exists`,
          'DUPLICATE_CODE'
        );
      }
    }
  }

  try {
    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        ...(data.code !== undefined && { code: data.code || null }),
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.contactName !== undefined && { contactName: data.contactName?.trim() || null }),
        ...(data.email !== undefined && { email: data.email?.trim() || null }),
        ...(data.phone !== undefined && { phone: data.phone?.trim() || null }),
        ...(data.country !== undefined && { country: data.country?.trim() || null }),
        ...(data.city !== undefined && { city: data.city?.trim() || null }),
        ...(data.address !== undefined && { address: data.address?.trim() || null }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return mapPrismaToSupplier(supplier);
  } catch (error: any) {
    console.error('Error updating supplier:', error);
    
    if (error.code === 'P2002') {
      throw new SupplierServiceError(
        'Supplier code already exists',
        'DUPLICATE_CODE'
      );
    }

    if (error.code === 'P2025') {
      throw new SupplierServiceError(
        'Supplier not found',
        'NOT_FOUND'
      );
    }

    throw new SupplierServiceError(
      'Failed to update supplier',
      'UPDATE_ERROR'
    );
  }
}

/**
 * Delete a supplier (soft delete by setting isActive to false)
 * 
 * @param userId - User ID for permission check
 * @param supplierId - Supplier ID
 * @returns Updated supplier
 * @throws SupplierServiceError if user lacks permission
 */
export async function deleteSupplier(
  userId: string,
  supplierId: bigint
): Promise<Supplier> {
  const hasPermission = await can(userId, 'admin.manage_suppliers');
  if (!hasPermission) {
    throw new SupplierServiceError(
      'Permission denied: admin.manage_suppliers required',
      'PERMISSION_DENIED'
    );
  }

  try {
    // Soft delete by setting isActive to false
    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: { isActive: false },
    });

    return mapPrismaToSupplier(supplier);
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    
    if (error.code === 'P2025') {
      throw new SupplierServiceError(
        'Supplier not found',
        'NOT_FOUND'
      );
    }

    throw new SupplierServiceError(
      'Failed to delete supplier',
      'DELETE_ERROR'
    );
  }
}

/**
 * Map Prisma Supplier model to Supplier interface
 */
function mapPrismaToSupplier(prismaSupplier: any): Supplier {
  return {
    id: prismaSupplier.id,
    code: prismaSupplier.code,
    name: prismaSupplier.name,
    contactName: prismaSupplier.contactName,
    email: prismaSupplier.email,
    phone: prismaSupplier.phone,
    country: prismaSupplier.country,
    city: prismaSupplier.city,
    address: prismaSupplier.address,
    notes: prismaSupplier.notes,
    isActive: prismaSupplier.isActive,
    createdAt: prismaSupplier.createdAt,
    updatedAt: prismaSupplier.updatedAt,
  };
}


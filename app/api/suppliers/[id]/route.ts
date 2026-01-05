import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { getCurrentUserId } from '@/lib/auth'
import { z } from 'zod'

// Zod schema for updating a supplier (all fields optional)
const updateSupplierSchema = z.object({
  code: z.string().max(50).optional().nullable(),
  name: z.string().min(1).max(255).optional(),
  contactName: z.string().max(255).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

/**
 * GET /api/suppliers/[id]
 * Fetch a single supplier by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user ID (temporary: gets first active admin until NextAuth is set up)
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authenticated user found' },
        { status: 401 }
      )
    }
    
    // Check permission (super user bypass is handled in can())
    const hasPermission = await can(userId, 'suppliers:read')
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Permission denied', message: 'suppliers:read permission required' },
        { status: 403 }
      )
    }

    const { id } = params
    const supplierId = BigInt(id)

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found', supplierId: id },
        { status: 404 }
      )
    }

    // Convert bigint ID to string for JSON serialization
    const serializedSupplier = {
      id: String(supplier.id),
      code: supplier.code,
      name: supplier.name,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      country: supplier.country,
      city: supplier.city,
      address: supplier.address,
      notes: supplier.notes,
      isActive: supplier.isActive,
      createdAt: supplier.createdAt.toISOString(),
      updatedAt: supplier.updatedAt.toISOString(),
    }

    return NextResponse.json(serializedSupplier, { status: 200 })
  } catch (error: any) {
    console.error('[API] GET /api/suppliers/[id] - Error:', error)
    
    // Handle invalid BigInt conversion
    if (error.message?.includes('Invalid') || error.message?.includes('BigInt')) {
      return NextResponse.json(
        { error: 'Invalid supplier ID format' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch supplier', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/suppliers/[id]
 * Update a supplier (partial updates allowed)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user ID (temporary: gets first active admin until NextAuth is set up)
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authenticated user found' },
        { status: 401 }
      )
    }
    
    // Check permission (super user bypass is handled in can())
    const hasPermission = await can(userId, 'suppliers:update')
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Permission denied', message: 'suppliers:update permission required' },
        { status: 403 }
      )
    }

    const { id } = params
    const supplierId = BigInt(id)
    const body = await request.json()

    // Validate with Zod
    const validationResult = updateSupplierSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if supplier exists
    const existing = await prisma.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Supplier not found', supplierId: id },
        { status: 404 }
      )
    }

    // Check for duplicate code if being changed
    if (data.code !== undefined && data.code !== existing.code) {
      if (data.code) {
        const duplicate = await prisma.supplier.findUnique({
          where: { code: data.code },
        })
        if (duplicate) {
          return NextResponse.json(
            { error: `Supplier with code "${data.code}" already exists` },
            { status: 400 }
          )
        }
      }
    }

    // Build update data object (only include provided fields)
    const updateData: any = {}
    if (data.code !== undefined) updateData.code = data.code || null
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.contactName !== undefined) updateData.contactName = data.contactName?.trim() || null
    if (data.email !== undefined) updateData.email = data.email?.trim() || null
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null
    if (data.country !== undefined) updateData.country = data.country?.trim() || null
    if (data.city !== undefined) updateData.city = data.city?.trim() || null
    if (data.address !== undefined) updateData.address = data.address?.trim() || null
    if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    // Update supplier
    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: updateData,
    })

    // Convert bigint ID to string for JSON serialization
    const serializedSupplier = {
      id: String(supplier.id),
      code: supplier.code,
      name: supplier.name,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      country: supplier.country,
      city: supplier.city,
      address: supplier.address,
      notes: supplier.notes,
      isActive: supplier.isActive,
      createdAt: supplier.createdAt.toISOString(),
      updatedAt: supplier.updatedAt.toISOString(),
    }

    return NextResponse.json(serializedSupplier, { status: 200 })
  } catch (error: any) {
    console.error('[API] PATCH /api/suppliers/[id] - Error:', error)
    
    // Handle invalid BigInt conversion
    if (error.message?.includes('Invalid') || error.message?.includes('BigInt')) {
      return NextResponse.json(
        { error: 'Invalid supplier ID format' },
        { status: 400 }
      )
    }

    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Supplier code already exists' },
        { status: 400 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update supplier', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/suppliers/[id]
 * Soft delete a supplier (sets is_active = false)
 * Never deletes rows from the database
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user ID (temporary: gets first active admin until NextAuth is set up)
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authenticated user found' },
        { status: 401 }
      )
    }
    
    // Check permission (super user bypass is handled in can())
    const hasPermission = await can(userId, 'suppliers:deactivate')
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Permission denied', message: 'suppliers:deactivate permission required' },
        { status: 403 }
      )
    }

    const { id } = params
    const supplierId = BigInt(id)

    // Check if supplier exists
    const existing = await prisma.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Supplier not found', supplierId: id },
        { status: 404 }
      )
    }

    // Soft delete by setting isActive to false
    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: { isActive: false },
    })

    // Convert bigint ID to string for JSON serialization
    const serializedSupplier = {
      id: String(supplier.id),
      code: supplier.code,
      name: supplier.name,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      country: supplier.country,
      city: supplier.city,
      address: supplier.address,
      notes: supplier.notes,
      isActive: supplier.isActive,
      createdAt: supplier.createdAt.toISOString(),
      updatedAt: supplier.updatedAt.toISOString(),
    }

    return NextResponse.json(
      {
        message: 'Supplier deactivated successfully',
        supplierId: id,
        supplier: serializedSupplier,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[API] DELETE /api/suppliers/[id] - Error:', error)
    
    // Handle invalid BigInt conversion
    if (error.message?.includes('Invalid') || error.message?.includes('BigInt')) {
      return NextResponse.json(
        { error: 'Invalid supplier ID format' },
        { status: 400 }
      )
    }

    // Handle Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to deactivate supplier', message: error.message },
      { status: 500 }
    )
  }
}


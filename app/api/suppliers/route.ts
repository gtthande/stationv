import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { getCurrentUserId } from '@/lib/auth'
import { z } from 'zod'

// Zod schema for creating a supplier
const createSupplierSchema = z.object({
  code: z.string().max(50).optional().nullable(),
  name: z.string().min(1).max(255),
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
 * GET /api/suppliers
 * List suppliers with pagination, search, and filtering
 * 
 * Query parameters:
 * - search: Search by name OR code (optional)
 * - is_active: Filter by active status (default: true)
 * - take: Number of records to return (default: 50)
 * - skip: Number of records to skip (default: 0)
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const isActiveParam = searchParams.get('is_active')
    const isActive = isActiveParam === null ? true : isActiveParam === 'true'
    const take = parseInt(searchParams.get('take') || '50', 10)
    const skip = parseInt(searchParams.get('skip') || '0', 10)

    // Build where clause
    const where: any = {
      isActive: isActive,
    }

    // Add search filter (name OR code)
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ]
    }

    // Fetch suppliers with pagination
    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        take: Math.min(take, 100), // Cap at 100
        skip,
        orderBy: { name: 'asc' },
      }),
      prisma.supplier.count({ where }),
    ])

    // Convert bigint IDs to strings for JSON serialization
    const serializedSuppliers = suppliers.map(s => ({
      id: String(s.id),
      code: s.code,
      name: s.name,
      contactName: s.contactName,
      email: s.email,
      phone: s.phone,
      country: s.country,
      city: s.city,
      address: s.address,
      notes: s.notes,
      isActive: s.isActive,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }))

    return NextResponse.json(
      {
        data: serializedSuppliers,
        pagination: {
          total,
          take,
          skip,
          hasMore: skip + take < total,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[API] GET /api/suppliers - Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suppliers', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/suppliers
 * Create a new supplier
 * 
 * Required fields:
 * - name: Supplier name (required)
 * 
 * Optional fields:
 * - code: Unique supplier code
 * - contactName, email, phone, country, city, address, notes
 * - isActive: Defaults to true
 */
export async function POST(request: NextRequest) {
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
    const hasPermission = await can(userId, 'suppliers:create')
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Permission denied', message: 'suppliers:create permission required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate with Zod
    const validationResult = createSupplierSchema.safeParse(body)
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

    // Check for duplicate code if provided
    if (data.code) {
      const existing = await prisma.supplier.findUnique({
        where: { code: data.code },
      })
      if (existing) {
        return NextResponse.json(
          { error: `Supplier with code "${data.code}" already exists` },
          { status: 400 }
        )
      }
    }

    // Create supplier
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

    return NextResponse.json(serializedSupplier, { status: 201 })
  } catch (error: any) {
    console.error('[API] POST /api/suppliers - Error:', error)
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Supplier code already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create supplier', message: error.message },
      { status: 500 }
    )
  }
}


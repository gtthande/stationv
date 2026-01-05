import { NextRequest, NextResponse } from 'next/server'
import { getSupplierById, updateSupplier, deleteSupplier } from '@/lib/services/supplierService'

// TODO: Get userId from authenticated session
// For now, using a placeholder - replace with actual session handling
const getUserId = async (): Promise<string> => {
  // TODO: Extract from NextAuth session or JWT token
  return 'placeholder-user-id'
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId()
    const { id } = params
    const supplierId = BigInt(id)

    const supplier = await getSupplierById(userId, supplierId)

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found', supplierId: id },
        { status: 404 }
      )
    }

    // Convert bigint ID to string for JSON serialization
    const serializedSupplier = {
      ...supplier,
      id: String(supplier.id),
    }

    return NextResponse.json(serializedSupplier, { status: 200 })
  } catch (error: any) {
    console.error('[API] GET /api/admin/suppliers/[id] - Error:', error)
    
    if (error.code === 'PERMISSION_DENIED') {
      return NextResponse.json(
        { error: 'Permission denied', message: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch supplier', message: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId()
    const { id } = params
    const supplierId = BigInt(id)
    const body = await request.json()
    const {
      code,
      name,
      contactName,
      email,
      phone,
      country,
      city,
      address,
      notes,
      isActive,
    } = body

    // Build update data object
    const updateData: any = {}
    if (code !== undefined) updateData.code = code || null
    if (name !== undefined) updateData.name = name
    if (contactName !== undefined) updateData.contactName = contactName || null
    if (email !== undefined) updateData.email = email || null
    if (phone !== undefined) updateData.phone = phone || null
    if (country !== undefined) updateData.country = country || null
    if (city !== undefined) updateData.city = city || null
    if (address !== undefined) updateData.address = address || null
    if (notes !== undefined) updateData.notes = notes || null
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    const supplier = await updateSupplier(userId, supplierId, updateData)

    // Convert bigint ID to string for JSON serialization
    const serializedSupplier = {
      ...supplier,
      id: String(supplier.id),
    }

    return NextResponse.json(serializedSupplier, { status: 200 })
  } catch (error: any) {
    console.error('[API] PATCH /api/admin/suppliers/[id] - Error:', error)
    
    if (error.code === 'PERMISSION_DENIED') {
      return NextResponse.json(
        { error: 'Permission denied', message: error.message },
        { status: 403 }
      )
    }

    if (error.code === 'NOT_FOUND') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    if (error.code === 'VALIDATION_ERROR' || error.code === 'DUPLICATE_CODE') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update supplier', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId()
    const { id } = params
    const supplierId = BigInt(id)

    const supplier = await deleteSupplier(userId, supplierId)

    // Convert bigint ID to string for JSON serialization
    const serializedSupplier = {
      ...supplier,
      id: String(supplier.id),
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
    console.error('[API] DELETE /api/admin/suppliers/[id] - Error:', error)
    
    if (error.code === 'PERMISSION_DENIED') {
      return NextResponse.json(
        { error: 'Permission denied', message: error.message },
        { status: 403 }
      )
    }

    if (error.code === 'NOT_FOUND') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete supplier', message: error.message },
      { status: 500 }
    )
  }
}


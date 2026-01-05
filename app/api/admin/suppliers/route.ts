import { NextRequest, NextResponse } from 'next/server'
import { getSuppliers, createSupplier } from '@/lib/services/supplierService'

// TODO: Get userId from authenticated session
// For now, using a placeholder - replace with actual session handling
const getUserId = async (): Promise<string> => {
  // TODO: Extract from NextAuth session or JWT token
  return 'placeholder-user-id'
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'
    const search = searchParams.get('search') || undefined

    const suppliers = await getSuppliers(userId, {
      activeOnly,
      search,
    })

    // Convert bigint IDs to strings for JSON serialization
    const serializedSuppliers = suppliers.map(s => ({
      ...s,
      id: String(s.id),
    }))

    return NextResponse.json(serializedSuppliers, { status: 200 })
  } catch (error: any) {
    console.error('[API] GET /api/admin/suppliers - Error:', error)
    
    if (error.code === 'PERMISSION_DENIED') {
      return NextResponse.json(
        { error: 'Permission denied', message: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch suppliers', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
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

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const supplier = await createSupplier(userId, {
      code: code || null,
      name: name.trim(),
      contactName: contactName || null,
      email: email || null,
      phone: phone || null,
      country: country || null,
      city: city || null,
      address: address || null,
      notes: notes || null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    })

    // Convert bigint ID to string for JSON serialization
    const serializedSupplier = {
      ...supplier,
      id: String(supplier.id),
    }

    return NextResponse.json(serializedSupplier, { status: 201 })
  } catch (error: any) {
    console.error('[API] POST /api/admin/suppliers - Error:', error)
    
    if (error.code === 'PERMISSION_DENIED') {
      return NextResponse.json(
        { error: 'Permission denied', message: error.message },
        { status: 403 }
      )
    }

    if (error.code === 'VALIDATION_ERROR' || error.code === 'DUPLICATE_CODE') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create supplier', message: error.message },
      { status: 500 }
    )
  }
}


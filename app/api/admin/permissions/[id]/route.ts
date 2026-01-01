import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permission = await prisma.permission.findUnique({
      where: { id: params.id },
    })

    if (!permission) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      )
    }

    await prisma.auditLog.create({
      data: {
        userId: null,
        action: 'permission.view',
        module: 'Admin',
        details: { permissionId: params.id },
      },
    })

    return NextResponse.json(permission)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch permission', message: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { key, description, module, category, isActive } = body

    const existing = await prisma.permission.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      )
    }

    // Check key uniqueness if changing
    if (key && key !== existing.key) {
      const duplicate = await prisma.permission.findUnique({
        where: { key },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: 'Permission key already exists' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (key) updateData.key = key
    if (description) updateData.description = description
    if (module) updateData.module = module
    if (category !== undefined) updateData.category = category
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    const permission = await prisma.permission.update({
      where: { id: params.id },
      data: updateData,
    })

    await prisma.auditLog.create({
      data: {
        userId: null,
        action: 'permission.updated',
        module: 'Admin',
        details: { permissionId: params.id, changes: updateData },
      },
    })

    return NextResponse.json(permission)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update permission', message: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.permission.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      )
    }

    // Soft delete - set isActive to false
    await prisma.permission.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    await prisma.auditLog.create({
      data: {
        userId: null,
        action: 'permission.deleted',
        module: 'Admin',
        details: { permissionId: params.id, permissionKey: existing.key },
      },
    })

    return NextResponse.json({ message: 'Permission deactivated successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete permission', message: (error as Error).message },
      { status: 500 }
    )
  }
}


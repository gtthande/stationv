import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const module = searchParams.get('module')

    const permissions = await prisma.permission.findMany({
      where: module ? { module } : {},
      orderBy: [
        { module: 'asc' },
        { key: 'asc' },
      ],
    })

    await prisma.auditLog.create({
      data: {
        userId: null,
        action: 'permission.list',
        module: 'Admin',
        details: { count: permissions.length, filterModule: module },
      },
    })

    return NextResponse.json(permissions)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch permissions', message: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, description, module, category, isActive } = body

    if (!key || !description || !module) {
      return NextResponse.json(
        { error: 'Key, description, and module are required' },
        { status: 400 }
      )
    }

    // Check uniqueness
    const existing = await prisma.permission.findUnique({
      where: { key },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Permission key already exists' },
        { status: 400 }
      )
    }

    const permission = await prisma.permission.create({
      data: {
        key,
        description,
        module,
        category,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: null,
        action: 'permission.created',
        module: 'Admin',
        details: { permissionKey: key },
      },
    })

    return NextResponse.json(permission, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create permission', message: (error as Error).message },
      { status: 500 }
    )
  }
}


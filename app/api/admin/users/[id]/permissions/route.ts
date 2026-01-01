import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Check authentication (isAdmin or admin.manage_permissions)

    const { id } = params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', userId: id },
        { status: 404 }
      )
    }

    // Fetch user's permissions
    const userPermissions = await prisma.userPermission.findMany({
      where: { userId: id },
      include: {
        permission: true,
      },
      orderBy: {
        permission: {
          module: 'asc',
        },
      },
    })

    // Format response
    const permissions = userPermissions.map((up) => ({
      id: up.permission.id,
      key: up.permission.key,
      description: up.permission.description,
      module: up.permission.module,
      category: up.permission.category,
      grantedAt: up.grantedAt,
      grantedBy: up.grantedBy,
    }))

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: null, // TODO: Get from session
        action: 'user.permissions.list',
        module: 'Admin',
        details: {
          targetUserId: id,
          permissionCount: permissions.length,
        },
      },
    })

    return NextResponse.json({
      userId: id,
      userName: user.name,
      userEmail: user.email,
      permissions,
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permissions', message: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Check authentication (isAdmin or admin.manage_permissions)

    const { id } = params
    const body = await request.json()
    const { permissionId, permissionKey } = body

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', userId: id },
        { status: 404 }
      )
    }

    // Find permission by ID or key
    let permission
    if (permissionId) {
      permission = await prisma.permission.findUnique({
        where: { id: permissionId },
      })
    } else if (permissionKey) {
      permission = await prisma.permission.findUnique({
        where: { key: permissionKey },
      })
    } else {
      return NextResponse.json(
        { error: 'Either permissionId or permissionKey is required' },
        { status: 400 }
      )
    }

    if (!permission) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      )
    }

    // Check if permission already granted
    const existing = await prisma.userPermission.findUnique({
      where: {
        userId_permissionId: {
          userId: id,
          permissionId: permission.id,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Permission already granted', permission },
        { status: 200 }
      )
    }

    // Grant permission
    await prisma.userPermission.create({
      data: {
        userId: id,
        permissionId: permission.id,
        grantedBy: null, // TODO: Get from session
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: null,
        action: 'user.permission.granted',
        module: 'Admin',
        details: {
          targetUserId: id,
          permissionKey: permission.key,
        },
      },
    })

    return NextResponse.json({
      message: 'Permission granted successfully',
      permission: {
        id: permission.id,
        key: permission.key,
        description: permission.description,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error granting permission:', error)
    return NextResponse.json(
      { error: 'Failed to grant permission', message: (error as Error).message },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; permissionId: string } }
) {
  try {
    const { id, permissionId } = params

    // Delete user permission
    const deleted = await prisma.userPermission.deleteMany({
      where: {
        userId: id,
        permissionId: permissionId,
      },
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Permission not found or not granted to this user' },
        { status: 404 }
      )
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: null,
        action: 'user.permission.revoked',
        module: 'Admin',
        details: { targetUserId: id, permissionId },
      },
    })

    return NextResponse.json({ message: 'Permission revoked successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to revoke permission', message: (error as Error).message },
      { status: 500 }
    )
  }
}


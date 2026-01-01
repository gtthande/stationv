import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Check authentication and permissions (isAdmin or admin.manage_users)

    const { id } = params

    // Fetch user by ID with permissions
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userPermissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    // If user not found, return 404
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', userId: id },
        { status: 404 }
      )
    }

    // Sanitize response (exclude password)
    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdBy: user.createdBy,
      permissions: user.userPermissions.map((up) => ({
        id: up.permission.id,
        key: up.permission.key,
        description: up.permission.description,
        module: up.permission.module,
        grantedAt: up.grantedAt,
        grantedBy: up.grantedBy,
      })),
    }

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: null, // TODO: Get from authenticated session
        action: 'user.view',
        module: 'Admin',
        details: {
          viewedUserId: id,
          viewedUserEmail: user.email,
        },
      },
    })

    return NextResponse.json(sanitizedUser, { status: 200 })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user', message: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Check authentication and permissions (isAdmin or admin.manage_users)

    const { id } = params
    const body = await request.json()
    const { name, email, isAdmin, isActive } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found', userId: id },
        { status: 404 }
      )
    }

    // Build update data object
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (isAdmin !== undefined) updateData.isAdmin = Boolean(isAdmin)
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    // If email is being changed, check uniqueness
    if (email && email !== existingUser.email) {
      // Normalize email
      const normalizedEmail = email.toLowerCase().trim()
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(normalizedEmail)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }

      const emailExists = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
      
      // Use normalized email in update
      updateData.email = normalizedEmail
    } else if (email) {
      // Even if not changing, normalize it
      updateData.email = email.toLowerCase().trim()
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: null, // TODO: Get from authenticated session
        action: 'user.updated',
        module: 'Admin',
        details: {
          targetUserId: id,
          changes: updateData,
        },
      },
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json(userWithoutPassword, { status: 200 })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user', message: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Check authentication and permissions (isAdmin or admin.manage_users)

    const { id } = params

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found', userId: id },
        { status: 404 }
      )
    }

    // Soft delete: Set isActive to false instead of actually deleting
    // This preserves audit trail and referential integrity
    const deletedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    })

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: null, // TODO: Get from authenticated session
        action: 'user.deleted',
        module: 'Admin',
        details: {
          deletedUserId: id,
          deletedUserEmail: deletedUser.email,
          deletedUserName: deletedUser.name,
        },
      },
    })

    return NextResponse.json(
      { 
        message: 'User deactivated successfully',
        userId: id 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user', message: (error as Error).message },
      { status: 500 }
    )
  }
}


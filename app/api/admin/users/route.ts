import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcrypt'

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // For now, assume the user is authenticated and is admin
    // In production, verify JWT/session and check isAdmin or admin.manage_users permission

    // Fetch all users with their permissions
    const users = await prisma.user.findMany({
      include: {
        userPermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform data to exclude password and format permissions
    const sanitizedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      permissions: user.userPermissions.map((up) => ({
        id: up.permission.id,
        key: up.permission.key,
        description: up.permission.description,
        module: up.permission.module,
      })),
    }))

    // Create audit log entry (non-blocking - don't fail request if audit log fails)
    try {
      await prisma.auditLog.create({
        data: {
          userId: null, // TODO: Get from authenticated session
          action: 'user.list',
          module: 'Admin',
          details: {
            userCount: sanitizedUsers.length,
          },
        },
      })
    } catch (auditError) {
      console.warn('[API] GET /api/admin/users - Audit log creation failed (non-blocking):', auditError)
    }

    return NextResponse.json(sanitizedUsers, { status: 200 })
  } catch (error) {
    console.error('[API] GET /api/admin/users - Error:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Check authentication and permissions (isAdmin or admin.manage_users)

    // Parse request body
    const body = await request.json()
    const { name, email, password, isAdmin, isActive } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Normalize email to prevent duplicates (john@x.com vs John@X.com)
    const normalizedEmail = email.toLowerCase().trim()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        isAdmin: Boolean(isAdmin),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        createdBy: null, // TODO: Get from authenticated session
      },
    })

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: null, // TODO: Get from authenticated session
        action: 'user.created',
        module: 'Admin',
        details: {
          newUserId: newUser.id,
          newUserEmail: newUser.email,
          newUserName: newUser.name,
          isAdmin: newUser.isAdmin,
        },
      },
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user', message: (error as Error).message },
      { status: 500 }
    )
  }
}


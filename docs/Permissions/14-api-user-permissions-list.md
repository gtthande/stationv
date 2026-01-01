# Prompt 14: API Route - List User's Permissions

## Objective
Create endpoint to get all permissions assigned to a specific user.

## Task
Create `app/api/admin/users/[id]/permissions/route.ts` with GET handler.

## Implementation

```typescript
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
```

## Test

```bash
curl http://localhost:3000/api/admin/users/USER_ID/permissions
```

Expected response:
```json
{
  "userId": "uuid",
  "userName": "George Thande",
  "userEmail": "gtthande@gmail.com",
  "permissions": [
    {
      "id": "uuid",
      "key": "admin.manage_users",
      "description": "Manage users",
      "module": "Admin",
      "category": "Write",
      "grantedAt": "2025-01-01T00:00:00.000Z",
      "grantedBy": null
    }
  ]
}
```

---
**Next Step**: Prompt 15 - Grant permission to user

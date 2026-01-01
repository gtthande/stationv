# Prompt 15: API Route - Grant Permission to User

## Objective
Create endpoint to grant a permission to a user.

## Task
Add POST handler to `app/api/admin/users/[id]/permissions/route.ts`.

## Implementation

Add to the existing file:

```typescript
// ... existing GET handler ...

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
```

## Test

```bash
curl -X POST http://localhost:3000/api/admin/users/USER_ID/permissions \
  -H "Content-Type: application/json" \
  -d '{"permissionKey": "inventory.view"}'
```

---
**Next Step**: Prompt 16 - Revoke permission from user

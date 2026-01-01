# Prompts 16-21: Permission Management & Audit APIs

## Prompt 16: Revoke Permission from User

Create `app/api/admin/users/[id]/permissions/[permissionId]/route.ts`:

```typescript
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
```

---

## Prompt 17: List All Permissions

Create `app/api/admin/permissions/route.ts`:

```typescript
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
```

---

## Prompt 18: View Single Permission

Create `app/api/admin/permissions/[id]/route.ts`:

```typescript
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
```

---

## Prompt 19: Create Permission

Add POST to `app/api/admin/permissions/route.ts`:

```typescript
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
```

---

## Prompt 20: Update Permission

Add PATCH to `app/api/admin/permissions/[id]/route.ts`:

```typescript
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
```

---

## Prompt 21: Delete Permission

Add DELETE to `app/api/admin/permissions/[id]/route.ts`:

```typescript
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
```

---
**All API routes complete! Next: Prompt 22 - UI Components**

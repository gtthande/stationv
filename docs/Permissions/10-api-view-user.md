# Prompt 10: API Route - View Single User

## Objective
Create the API endpoint to get details of a single user by ID.

## Task
Create `app/api/admin/users/[id]/route.ts` with a GET handler.

## Implementation

Create the file `app/api/admin/users/[id]/route.ts`:

```typescript
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
```

## Features

- ✅ Fetches user by ID from URL parameter
- ✅ Includes permissions with grant details
- ✅ Returns 404 if user not found
- ✅ Excludes password field
- ✅ Creates audit log entry
- ✅ Proper error handling

## URL Parameter Handling

Next.js automatically parses the `[id]` from the URL:
- Request: `GET /api/admin/users/abc-123-def`
- Params: `{ id: 'abc-123-def' }`

## Test the Endpoint

```bash
# Get George Thande's ID from Prisma Studio first
npx prisma studio

# Then test (replace USER_ID with actual UUID)
curl http://localhost:3000/api/admin/users/USER_ID

# Or use Thunder Client
GET http://localhost:3000/api/admin/users/USER_ID
```

Expected 200 response:
```json
{
  "id": "uuid",
  "name": "George Thande",
  "email": "gtthande@gmail.com",
  "isActive": true,
  "isAdmin": true,
  "lastLogin": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "createdBy": null,
  "permissions": [...]
}
```

Expected 404 response:
```json
{
  "error": "User not found",
  "userId": "invalid-id"
}
```

## Reference
- Next.js Dynamic Routes: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
- Dev Profile: Error handling patterns

---
**Next Step**: Prompt 11 - Create user endpoint

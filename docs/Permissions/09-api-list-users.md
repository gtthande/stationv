# Prompt 09: API Route - List Users

## Objective
Create the API endpoint to list all users with their permissions.

## Task
Create `app/api/admin/users/route.ts` with a GET handler.

## Implementation

Create the file `app/api/admin/users/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Create audit log entry
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

    return NextResponse.json(sanitizedUsers, { status: 200 })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', message: (error as Error).message },
      { status: 500 }
    )
  }
}
```

## Also Create lib/prisma.ts

Create `lib/prisma.ts` for the Prisma client singleton:

```typescript
import { PrismaClient } from '@prisma/client'

declare global {
  // allow global `var` for prisma caching in dev
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
```

## Features

- ✅ Fetches all users from database
- ✅ Includes their permissions
- ✅ Excludes password field (security)
- ✅ Orders by creation date (newest first)
- ✅ Creates audit log entry
- ✅ Proper error handling
- ✅ Returns 200 on success, 500 on error

## Security Notes

- Password is excluded from response
- TODO: Add actual authentication check (will add in later prompts)
- TODO: Verify admin permissions before allowing access

## Test the Endpoint

```bash
# Start dev server
npm run dev

# Test with curl
curl http://localhost:3000/api/admin/users

# Or use Thunder Client / Postman
GET http://localhost:3000/api/admin/users
```

Expected response:
```json
[
  {
    "id": "uuid",
    "name": "George Thande",
    "email": "gtthande@gmail.com",
    "isActive": true,
    "isAdmin": true,
    "lastLogin": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "permissions": [
      {
        "id": "uuid",
        "key": "inventory.view",
        "description": "View inventory and batches",
        "module": "Inventory"
      },
      // ... 69 more permissions
    ]
  }
]
```

## Reference
- Next.js App Router API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Dev Profile: API best practices

---
**Next Step**: Prompt 10 - View single user endpoint

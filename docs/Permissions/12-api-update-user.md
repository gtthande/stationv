# Prompt 12: API Route - Update User

## Objective
Create the API endpoint to update an existing user's details.

## Task
Add a PATCH handler to `app/api/admin/users/[id]/route.ts`.

## Implementation

Update `app/api/admin/users/[id]/route.ts` to add the PATCH handler:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ... existing GET handler ...

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

    // Build update data object
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    // email is handled above in validation block
    if (isAdmin !== undefined) updateData.isAdmin = Boolean(isAdmin)
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

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
```

## Features

- ✅ Updates only provided fields (partial update)
- ✅ Validates email format if email is changed
- ✅ Checks email uniqueness if email is changed
- ✅ Returns 404 if user not found
- ✅ Excludes password from response
- ✅ Creates audit log with changes
- ✅ Proper error handling

## Updateable Fields

- `name`: User's full name
- `email`: Email address (validated and checked for uniqueness)
- `isAdmin`: Admin flag
- `isActive`: Active status

## Test the Endpoint

```bash
# Update a user (replace USER_ID with actual UUID)
curl -X PATCH http://localhost:3000/api/admin/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "isActive": false
  }'
```

Expected 200 response:
```json
{
  "id": "uuid",
  "name": "John Smith",
  "email": "john@example.com",
  "isActive": false,
  "isAdmin": false,
  "lastLogin": null,
  "createdAt": "2025-01-01T12:00:00.000Z",
  "updatedAt": "2025-01-01T12:30:00.000Z",
  "createdBy": null
}
```

Expected error responses:
```json
// User not found
{ "error": "User not found", "userId": "invalid-id" }

// Duplicate email
{ "error": "Email already in use" }

// Invalid email
{ "error": "Invalid email format" }
```

## Reference
- Prisma Update: https://www.prisma.io/docs/concepts/components/prisma-client/crud#update
- Dev Profile: Partial updates best practices

---
**Next Step**: Prompt 13 - Delete user endpoint

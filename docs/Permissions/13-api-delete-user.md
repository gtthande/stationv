# Prompt 13: API Route - Delete User

## Objective
Create the API endpoint to delete (deactivate) a user.

## Task
Add a DELETE handler to `app/api/admin/users/[id]/route.ts`.

## Implementation

Update `app/api/admin/users/[id]/route.ts` to add the DELETE handler:

```typescript
// ... existing GET and PATCH handlers ...

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
```

## Features

- ✅ Soft delete (sets `isActive` to false)
- ✅ Preserves user data for audit trail
- ✅ Maintains referential integrity
- ✅ Returns 404 if user not found
- ✅ Creates audit log entry
- ✅ Proper error handling

## Why Soft Delete?

**Reasons for soft delete instead of hard delete:**
1. Preserves audit trail (who created what, when)
2. Maintains referential integrity (audit logs, permissions)
3. Allows reactivation if needed
4. Compliance with data retention policies
5. Historical reports remain accurate

## Hard Delete Option (Use with Caution)

If you need to actually delete the user:

```typescript
// Hard delete - use ONLY if absolutely necessary
await prisma.user.delete({
  where: { id },
})
```

**⚠️ Warning:** Hard delete will cascade delete all related records due to `onDelete: Cascade` in schema.

## Test the Endpoint

```bash
# Deactivate a user (replace USER_ID with actual UUID)
curl -X DELETE http://localhost:3000/api/admin/users/USER_ID
```

Expected 200 response:
```json
{
  "message": "User deactivated successfully",
  "userId": "uuid"
}
```

Expected 404 response:
```json
{
  "error": "User not found",
  "userId": "invalid-id"
}
```

## Verify Soft Delete

After deleting, check that:
- User still exists in database
- `isActive` is now `false`
- User no longer appears in active user lists
- User cannot log in
- Audit logs preserved

## Reference
- Soft Delete Pattern: Common in enterprise applications
- Dev Profile: Data retention best practices

---
**Next Step**: Prompt 14 - List user's permissions endpoint

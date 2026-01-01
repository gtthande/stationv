# Prompt 11: API Route - Create User

## Objective
Create the API endpoint to create a new user with validation and password hashing.

## Task
Add a POST handler to `app/api/admin/users/route.ts`.

## Implementation

Update `app/api/admin/users/route.ts` to add the POST handler:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcrypt'

// ... existing GET handler ...

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
```

## Validation Rules

- ✅ Name: Required, non-empty
- ✅ Email: Required, valid format, unique
- ✅ Password: Required, minimum 8 characters
- ✅ isAdmin: Optional, defaults to false
- ✅ isActive: Optional, defaults to true

## Security Features

- ✅ Password hashed with bcrypt (10 salt rounds)
- ✅ Password never stored in plain text
- ✅ Password excluded from response
- ✅ Email uniqueness enforced
- ✅ Input validation

## Test the Endpoint

```bash
# Create a new user
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "isAdmin": false,
    "isActive": true
  }'
```

Expected 201 response:
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "isActive": true,
  "isAdmin": false,
  "lastLogin": null,
  "createdAt": "2025-01-01T12:00:00.000Z",
  "updatedAt": "2025-01-01T12:00:00.000Z",
  "createdBy": null
}
```

Expected 400 error responses:
```json
// Missing fields
{ "error": "Name, email, and password are required" }

// Invalid email
{ "error": "Invalid email format" }

// Duplicate email
{ "error": "Email already in use" }

// Short password
{ "error": "Password must be at least 8 characters" }
```

## Install bcrypt

If not already installed:
```bash
npm install bcrypt
npm install -D @types/bcrypt
```

**Note on bcrypt vs bcryptjs:**
- Use `bcrypt` for better performance (native C++ bindings)
- Use `bcryptjs` if you encounter installation issues on Windows/XAMPP
- Both have the same API, so switching is easy

If you need to switch:
```bash
npm uninstall bcrypt
npm install bcryptjs
```

Then update imports to use `bcryptjs` instead of `bcrypt`.

## Reference
- bcrypt: https://www.npmjs.com/package/bcrypt
- Dev Profile: Password security best practices

---
**Next Step**: Prompt 12 - Update user endpoint

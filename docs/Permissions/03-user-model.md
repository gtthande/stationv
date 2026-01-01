# Prompt 03: Add User Model

## Objective
Add the User model to the Prisma schema as specified in the Station-2100 spec.

## Task
Add the complete User model to `prisma/schema.prisma` with all required fields, relations, and indexes.

## Implementation

Add this model to your `prisma/schema.prisma` file:

```prisma
model User {
  id              String           @id @default(uuid())
  name            String
  email           String           @unique
  password        String           // bcrypt hashed
  isActive        Boolean          @default(true)
  isAdmin         Boolean          @default(false)
  lastLogin       DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  createdBy       String?
  
  // Relations
  userPermissions UserPermission[]
  auditLogs       AuditLog[]
  
  // Indexes
  @@index([email])
  @@map("users")
}
```

## Field Descriptions

- `id`: UUID primary key
- `name`: User's full name
- `email`: Unique email address (used for login)
- `password`: bcrypt hashed password (never stored in plain text)
- `isActive`: Whether user account is active (soft delete)
- `isAdmin`: Super admin flag (bypass permission checks)
- `lastLogin`: Last successful login timestamp (nullable)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last modification timestamp (auto-updated)
- `createdBy`: UUID of user who created this account (nullable)

## Relations

- `userPermissions`: One-to-many with UserPermission (junction table)
- `auditLogs`: One-to-many with AuditLog (for tracking user actions)

## Naming Conventions

- Model name: PascalCase (`User`)
- Fields: camelCase (`isActive`, `createdAt`)
- Table mapping: snake_case (`users`)
- Follow dev profile conventions

## Reference
- Station-2100 Spec: Section 9 (User Management)
- Dev Profile: Database naming conventions

---
**Next Step**: Prompt 04 - Add Permission model

# Prompt 03: Prisma Schema (Models Only)

## Objective
Define the complete database schema for the Admin & Permissions system WITHOUT running migrations.

## Task
Add all 4 models to `prisma/schema.prisma`: User, Permission, UserPermission, and AuditLog.

## Prerequisites
- ✅ Prompt 01 completed (Guardrails established)
- ✅ Prompt 02 completed (Prisma configured, .env exists)

## Instructions for Cursor

### Update prisma/schema.prisma

Replace the entire file with this complete schema:

```prisma
// Prisma Schema for Station-2100
// Phase 1: Admin & Permissions System

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════════════════════════
// USER MODEL
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
// PERMISSION MODEL
// ═══════════════════════════════════════════════════════════

model Permission {
  id              String           @id @default(uuid())
  key             String           @unique  // e.g., "inventory.view"
  description     String
  module          String           // e.g., "Inventory", "JobCard", "Admin"
  category        String?          // e.g., "Read", "Write", "Approve"
  isActive        Boolean          @default(true)
  createdAt       DateTime         @default(now())
  
  // Relations
  userPermissions UserPermission[]
  
  // Indexes
  @@index([module])
  @@index([key])
  @@map("permissions")
}

// ═══════════════════════════════════════════════════════════
// USER-PERMISSION JUNCTION TABLE
// ═══════════════════════════════════════════════════════════

model UserPermission {
  id           String      @id @default(uuid())
  user         User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId       String
  permission   Permission  @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  permissionId String
  grantedBy    String?     // Who granted this permission
  grantedAt    DateTime    @default(now())
  
  // Constraints
  @@unique([userId, permissionId])
  @@index([userId])
  @@index([permissionId])
  @@map("user_permissions")
}

// ═══════════════════════════════════════════════════════════
// AUDIT LOG MODEL
// ═══════════════════════════════════════════════════════════

model AuditLog {
  id          String   @id @default(uuid())
  user        User?    @relation(fields: [userId], references: [id])
  userId      String?
  action      String   // e.g., "user.created", "permission.granted"
  module      String   // e.g., "Admin", "Inventory"
  details     Json?    // Additional context
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())
  
  // Indexes
  @@index([userId])
  @@index([action])
  @@index([timestamp])
  @@map("audit_logs")
}
```

## Important Notes

### Field Descriptions

**User Model:**
- `id`: UUID primary key
- `email`: Unique login identifier
- `password`: bcrypt hashed (NEVER plain text)
- `isActive`: Soft delete flag
- `isAdmin`: Super admin bypass flag
- `lastLogin`: Track user activity

**Permission Model:**
- `key`: Dot-notation (e.g., `inventory.view`)
- `module`: Groups permissions (Inventory, JobCard, Admin, etc.)
- `category`: Optional grouping (Read, Write, Approve, Delete)

**UserPermission Model:**
- Junction table (many-to-many)
- `@@unique([userId, permissionId])`: One permission per user (no duplicates)
- `onDelete: Cascade`: If user/permission deleted, remove link

**AuditLog Model:**
- `userId`: Nullable (system actions have no user)
- `details`: JSON for flexible context
- `action`: Dot-notation (e.g., `user.created`, `permission.granted`)

### What NOT to Do

❌ Do NOT run `prisma migrate` yet
❌ Do NOT generate Prisma client yet  
❌ Do NOT create seed file yet
❌ Do NOT modify the `customers` table

## Verification Checklist

- [ ] `prisma/schema.prisma` has all 4 models defined
- [ ] All models have correct `@@map` directives
- [ ] All indexes are in place
- [ ] Cascade deletes configured on UserPermission
- [ ] No syntax errors in schema (VS Code should show no red squiggles)
- [ ] File saved

## Expected State

At this point:
- ✅ Schema is defined
- ✅ No tables created yet
- ✅ No migrations run
- ✅ No Prisma client generated
- ✅ Ready for Prisma client singleton (Prompt 04)

---

**Next Step:** Prompt 04 - Prisma Client Singleton

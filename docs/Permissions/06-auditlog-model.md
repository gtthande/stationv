# Prompt 06: Add AuditLog Model

## Objective
Add the AuditLog model for tracking all system actions and changes.

## Task
Add the AuditLog model to `prisma/schema.prisma`.

## Implementation

Add this model to your `prisma/schema.prisma` file:

```prisma
model AuditLog {
  id          String   @id @default(uuid())
  user        User?    @relation(fields: [userId], references: [id])
  userId      String?
  action      String   // e.g., "user.created", "permission.granted"
  module      String   // e.g., "Admin", "Inventory"
  details     Json?    // Additional context as JSON
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

## Field Descriptions

- `id`: UUID primary key
- `user`: Optional relation to User (nullable for system actions)
- `userId`: Foreign key to User (nullable)
- `action`: Action performed (e.g., `user.created`, `permission.granted`, `inventory.issued`)
- `module`: Module where action occurred (`Admin`, `Inventory`, `JobCard`, etc.)
- `details`: JSON field for additional context (flexible structure)
- `ipAddress`: IP address of the requestor (nullable)
- `userAgent`: Browser/client user agent (nullable)
- `timestamp`: When the action occurred

## Action Naming Convention

Actions follow the pattern: `resource.action`

Examples:
- `user.created`
- `user.updated`
- `user.deleted`
- `permission.granted`
- `permission.revoked`
- `inventory.received`
- `jobcard.closed`

## Indexes

- `userId`: For finding all actions by a specific user
- `action`: For filtering by action type
- `timestamp`: For time-based queries and sorting

## Usage Example

```typescript
// Log a user creation action
await prisma.auditLog.create({
  data: {
    userId: adminUser.id,
    action: "user.created",
    module: "Admin",
    details: {
      newUserId: newUser.id,
      newUserEmail: newUser.email
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  }
});
```

## JSON Details Structure (Examples)

```json
// User created
{
  "newUserId": "uuid",
  "newUserEmail": "email@example.com"
}

// Permission granted
{
  "targetUserId": "uuid",
  "permissionKey": "inventory.view"
}

// User updated
{
  "targetUserId": "uuid",
  "changes": {
    "isActive": true,
    "isAdmin": false
  }
}
```

## Reference
- Station-2100 Spec: Section 9 (Permissions & Audit)
- Dev Profile: Audit logging best practices

---
**Next Step**: Prompt 07 - Run Prisma migration

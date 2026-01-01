# Prompt 04: Add Permission Model

## Objective
Add the Permission model to the Prisma schema as specified in the Station-2100 spec.

## Task
Add the complete Permission model to `prisma/schema.prisma`.

## Implementation

Add this model to your `prisma/schema.prisma` file:

```prisma
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
```

## Field Descriptions

- `id`: UUID primary key
- `key`: Unique permission key (e.g., `inventory.view`, `jobcard.create`)
- `description`: Human-readable description of what this permission allows
- `module`: Which module this permission belongs to (`Inventory`, `JobCard`, `Rotables`, `Tools`, `Admin`, `Reports`)
- `category`: Optional categorization (`Read`, `Write`, `Approve`, `Delete`)
- `isActive`: Whether this permission is currently active
- `createdAt`: When the permission was created

## Permission Key Format

Permission keys follow the pattern: `module.action`

Examples:
- `inventory.view`
- `inventory.create`
- `inventory.approve_receipt`
- `jobcard.add_labour`
- `admin.manage_users`

## Relations

- `userPermissions`: One-to-many with UserPermission (junction table)

## Indexes

- `module`: For filtering permissions by module
- `key`: For fast lookup by permission key

## Reference
- Station-2100 Spec: Appendix A (Complete Permission Reference)
- All 70+ permissions listed in the spec

---
**Next Step**: Prompt 05 - Add UserPermission junction model

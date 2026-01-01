# Prompt 05: Add UserPermission Junction Model

## Objective
Add the UserPermission junction model to link Users and Permissions in a many-to-many relationship.

## Task
Add the UserPermission model to `prisma/schema.prisma`.

## Implementation

Add this model to your `prisma/schema.prisma` file:

```prisma
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
```

## Field Descriptions

- `id`: UUID primary key
- `user`: Relation to User model
- `userId`: Foreign key to User
- `permission`: Relation to Permission model
- `permissionId`: Foreign key to Permission
- `grantedBy`: UUID of admin who granted this permission (nullable)
- `grantedAt`: Timestamp when permission was granted

## Constraints

- **Unique Constraint**: A user cannot have the same permission twice
  - `@@unique([userId, permissionId])`
  
- **Cascade Delete**: If a user or permission is deleted, remove the junction record
  - `onDelete: Cascade` on both relations

## Indexes

- `userId`: For quickly finding all permissions for a user
- `permissionId`: For finding all users with a specific permission

## Usage Example

When granting a permission to a user:
```typescript
await prisma.userPermission.create({
  data: {
    userId: "user-uuid",
    permissionId: "permission-uuid",
    grantedBy: "admin-uuid"
  }
});
```

## Reference
- Station-2100 Spec: Section 9 (User Management & Permissions)
- Dev Profile: Database best practices

---
**Next Step**: Prompt 06 - Add AuditLog model

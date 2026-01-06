# Warehouses Reference Module

## Overview

Warehouses is a simple, admin-only reference data module in Station-2100. It provides basic warehouse management for use in inventory operations.

**Key Characteristics:**
- **Admin-only access** (Super Admin and Admin roles)
- **Simple reference data** (optional - 95% of installs will never add more warehouses)
- **Minimal fields**: name + isActive only
- **No advanced features** (no search, pagination, or complex permissions)
- Used primarily as dropdown options in inventory
- **Default warehouses seeded**: Main Warehouse, Consumables, Owner Supplied

---

## Model

### Database Schema

```prisma
model Warehouse {
  id          BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  name        String   @unique @db.VarChar(255)
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at") @db.DateTime(0)
  updatedAt   DateTime @updatedAt @map("updated_at") @db.DateTime(0)
  
  @@map("warehouses")
}
```

### Fields

- **id**: BigInt (auto-increment) - Primary key
- **name**: String (required, unique, max 255 chars) - Warehouse name
- **isActive**: Boolean (default: true) - Soft delete flag
- **createdAt**: DateTime - Creation timestamp
- **updatedAt**: DateTime - Last update timestamp

---

## Access Rules

### Permissions

- **Super Admin**: Full access (create, edit, view, deactivate)
- **Admin**: Create and edit access
- **All other users**: No UI access, read-only via relations only

### RBAC Implementation

Access is controlled via admin check (`isAdmin === true`) rather than granular permissions. The service layer and API routes enforce admin-only access.

---

## UI

### Location

- **Route**: `/admin/warehouses`
- **Navigation**: Admin → Warehouses (Admin sub-module)

### Features

- **Simple Table**: Name | Active status
- **Simple Modal**: Name input + Active checkbox
- **No Advanced Features**: No search, pagination, or filtering
- **No Detail Pages**: All operations via modal

### Components

- Main page: `app/admin/warehouses/page.tsx`
- Inline form component (no separate file)

---

## API

### Endpoints

#### GET /api/warehouses

List all warehouses (admin-only).

**Query Parameters:**
- `active_only` (optional): Filter by active status

**Response:**
```json
{
  "data": [
    {
      "id": "1",
      "name": "Main Warehouse",
      "isActive": true,
      "createdAt": "2026-01-06T00:00:00.000Z",
      "updatedAt": "2026-01-06T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/warehouses

Create a new warehouse (admin-only).

**Request Body:**
```json
{
  "name": "Main Warehouse",
  "isActive": true
}
```

**Required Fields:**
- `name`: Warehouse name (required, unique)

**Optional Fields:**
- `isActive`: Defaults to true

#### GET /api/warehouses/[id]

Fetch a single warehouse by ID (admin-only).

#### PATCH /api/warehouses/[id]

Update a warehouse (admin-only, partial updates allowed).

**Request Body:**
```json
{
  "name": "Updated Name",
  "isActive": false
}
```

#### DELETE /api/warehouses/[id]

Soft delete a warehouse by setting `isActive` to false (admin-only).

**Note**: Never deletes rows from the database.

---

## Service Layer

### Location

`lib/services/warehouseService.ts`

### Methods

- `getWarehouses(activeOnly?: boolean)`: Get all warehouses
- `getWarehouseById(warehouseId: bigint)`: Get single warehouse
- `createWarehouse(data: CreateWarehouseInput)`: Create warehouse
- `updateWarehouse(warehouseId: bigint, data: UpdateWarehouseInput)`: Update warehouse
- `deleteWarehouse(warehouseId: bigint)`: Soft delete warehouse

### Input Types

```typescript
interface CreateWarehouseInput {
  name: string;
  isActive?: boolean;
}

interface UpdateWarehouseInput {
  name?: string;
  isActive?: boolean;
}
```

---

## Default Data

### Seed Script

Location: `prisma/seed-warehouses.ts`

**Default Warehouses:**
1. Main Warehouse
2. Consumables
3. Owner Supplied

**To seed:**
```bash
npx tsx prisma/seed-warehouses.ts
```

---

## Usage in Inventory

Warehouses are used as dropdown options in inventory operations. Other modules access warehouses via relations only (read-only), not through the UI.

---

## Migration

### From Previous Schema

The warehouses model was simplified by removing:
- `code` field
- `description` field
- `type` enum field

**Migration Steps:**

1. **Backup database**
2. **Run SQL migration** (see `prisma/migrations/simplify_warehouses.sql`)
3. **Run Prisma migration:**
   ```bash
   npx prisma migrate dev --name simplify_warehouses
   ```
4. **Reseed warehouses:**
   ```bash
   npx tsx prisma/seed-warehouses.ts
   ```

### Rollback

If rollback is needed, restore from backup. The migration removes columns and cannot be easily reversed.

---

## Verification Checklist

After migration and seeding:

- [ ] Warehouses load successfully at `/admin/warehouses`
- [ ] Seed data visible (Main Warehouse, Consumables, Owner Supplied)
- [ ] RBAC enforced (403 for non-admin users)
- [ ] Super-user bypass works (admin can access)
- [ ] Create warehouse works
- [ ] Edit warehouse works
- [ ] Deactivate warehouse works (soft delete)
- [ ] Reactivate warehouse works
- [ ] No regressions in Suppliers or Customers modules
- [ ] Inventory can access warehouses as dropdown options

---

## Files

### Created/Modified

1. `prisma/schema.prisma` - Simplified Warehouse model
2. `prisma/seed-warehouses.ts` - Updated seed script
3. `lib/services/warehouseService.ts` - Simplified service layer
4. `app/api/warehouses/route.ts` - Simplified API route
5. `app/api/warehouses/[id]/route.ts` - Simplified detail API route
6. `app/admin/warehouses/page.tsx` - New simplified UI page
7. `lib/types.ts` - Updated Warehouse interface
8. `docs/warehouses-reference.md` - This documentation

### Removed

- `app/dashboard/warehouses/` - Old complex UI (replaced by `/admin/warehouses`)
- Detail page components (no longer needed)

---

## Notes

- Warehouses are NOT a full module like Suppliers
- 95% of installs never add more warehouses beyond the defaults
- No deletes (soft disable via `isActive` only)
- Simple reference data, not operational data

---

**Last Updated:** 2026-01-06  
**Status:** ✅ Complete


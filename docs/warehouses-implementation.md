# Warehouses Module Implementation

## Overview

The Warehouses module is a **simple, admin-only reference data module** in Station-2100. It provides basic warehouse management for use in inventory operations and future modules.

**Key Characteristics:**
- **Admin-only access** (Super Admin and Admin roles)
- **Simple reference data** (name + active flag only)
- **Seeded once during setup** (Main Warehouse, Consumables, Owner Supplied)
- **Rarely modified** (95% of installs will never add more warehouses)
- **Used as reference selector** in Inventory and future modules
- **Intentionally minimal** - designed for stability, not complexity

**Status**: ✅ Complete  
**Access**: Admin-only (`/admin/warehouses`)  
**Route**: `/admin/warehouses`  
**Navigation**: Admin → Warehouses (Admin sub-module)

---

## Design Philosophy

### Why Simple?

Warehouses are **reference data**, not transactional data. They serve as:
- Dropdown options in inventory forms
- Reference identifiers for batch tracking
- Simple categorization (Main, Consumables, Owner Supplied)

**Design Decisions:**
- **No code field**: Name is unique and sufficient
- **No description**: Name is self-explanatory
- **No type enum**: Not needed for current use cases
- **No relations**: Warehouses are standalone reference data
- **No search/pagination**: Simple list is sufficient (typically 3-5 warehouses)

### Stability Over Features

This module is intentionally minimal because:
1. **95% of installs** will use only the 3 seeded warehouses
2. **Reference data** should be stable and rarely changed
3. **Complexity adds risk** without business value
4. **Future needs** can be addressed if/when they arise

---

## Database Schema

### Prisma Model

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

- **id**: BigInt (auto-increment, unsigned) - Primary key
- **name**: String (required, unique, max 255 chars) - Warehouse name
- **isActive**: Boolean (default: true) - Soft delete flag
- **createdAt**: DateTime - Creation timestamp
- **updatedAt**: DateTime - Last update timestamp

### Indexes

- Primary key on `id`
- Unique index on `name`

---

## Seed Data

### Default Warehouses

The seed script (`prisma/seed-warehouses.ts`) creates three default warehouses:

1. **Main Warehouse**
   - Primary warehouse for standard inventory items

2. **Consumables**
   - Warehouse for consumable items

3. **Owner Supplied**
   - Warehouse for owner-supplied items

### Running the Seed

```bash
# Run the seed script
npx tsx prisma/seed-warehouses.ts
```

The script is **idempotent** - safe to re-run multiple times.

---

## Access Rules

### Permissions

- **Super Admin**: Full access (create, edit, view, deactivate)
- **Admin**: Full access (create, edit, view, deactivate)
- **All other users**: No UI access, read-only via relations only

### RBAC Implementation

Access is controlled via admin check (`isAdmin === true`) rather than granular permissions. The service layer and API routes enforce admin-only access.

**Note**: This is simpler than Suppliers/Customers because Warehouses are reference data, not operational data.

---

## Service Layer

**File**: `lib/services/warehouseService.ts`

### Methods

#### `getWarehouses(activeOnly?: boolean)`
- **Access**: Admin-only
- **Options**: 
  - `activeOnly?: boolean` - Filter by active status
- **Returns**: `Promise<Warehouse[]>`

#### `getWarehouseById(warehouseId: bigint)`
- **Access**: Admin-only
- **Returns**: `Promise<Warehouse | null>`

#### `createWarehouse(data: CreateWarehouseInput)`
- **Access**: Admin-only
- **Validation**: 
  - Name is required and must be unique
- **Returns**: `Promise<Warehouse>`

#### `updateWarehouse(warehouseId: bigint, data: UpdateWarehouseInput)`
- **Access**: Admin-only
- **Validation**: 
  - Warehouse must exist
  - Name cannot be empty if provided
  - Name must be unique if changed
- **Returns**: `Promise<Warehouse>`

#### `deleteWarehouse(warehouseId: bigint)`
- **Access**: Admin-only
- **Note**: Soft delete (sets `isActive` to `false`)
- **Returns**: `Promise<Warehouse>`

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

### Error Handling

All methods throw `WarehouseServiceError` with:
- **Message**: Human-readable error message
- **Code**: Error code for programmatic handling:
  - `VALIDATION_ERROR` - Input validation failed
  - `DUPLICATE_NAME` - Warehouse name already exists
  - `NOT_FOUND` - Warehouse not found
  - `FETCH_ERROR` - Database fetch error
  - `CREATE_ERROR` - Database create error
  - `UPDATE_ERROR` - Database update error
  - `DELETE_ERROR` - Database delete error

---

## API Routes

### GET /api/warehouses

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

### POST /api/warehouses

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

### GET /api/warehouses/[id]

Fetch a single warehouse by ID (admin-only).

**Response**: Single warehouse object (same structure as list item)

### PATCH /api/warehouses/[id]

Update a warehouse (admin-only, partial updates allowed).

**Request Body:**
```json
{
  "name": "Updated Name",
  "isActive": false
}
```

### DELETE /api/warehouses/[id]

Soft delete a warehouse by setting `isActive` to `false` (admin-only).

**Note**: Never deletes rows from the database.

---

## UI Components

### Main Page

**File**: `app/admin/warehouses/page.tsx`

**Features:**
- Simple table view (Name | Active status)
- Create warehouse modal
- Edit warehouse modal
- Deactivate/Reactivate confirmation dialogs
- **No search, pagination, or filtering** (intentionally minimal)

### Form Component

**Inline form** (no separate file) with:
- Name input (required)
- Active checkbox
- Submit/Cancel buttons

---

## Future Usage

### Inventory Integration

Warehouses will be used in:
- **Batches**: Each batch can be assigned to a warehouse
- **Stock Movements**: Transfers between warehouses
- **Job Card Parts**: Parts can be sourced from different warehouses

### Design for Stability

When Inventory module is implemented:
- Warehouses will appear as **dropdown selectors**
- No complex warehouse management needed
- Simple reference lookup is sufficient

---

## Files Structure

### Created Files

1. `prisma/schema.prisma` - Warehouse model
2. `prisma/seed-warehouses.ts` - Seed script for initial warehouses
3. `lib/services/warehouseService.ts` - Business logic service
4. `app/api/warehouses/route.ts` - Main API route (GET, POST)
5. `app/api/warehouses/[id]/route.ts` - Detail API route (GET, PATCH, DELETE)
6. `app/admin/warehouses/page.tsx` - Main warehouses page
7. `docs/warehouses-implementation.md` - This documentation

### Modified Files

1. `lib/types.ts` - Warehouse interface
2. `docs/PROJECT_ROADMAP.md` - Updated status
3. `docs/architecture.md` - Added to reference data section

---

## Verification Checklist

- [x] Prisma schema updated with Warehouse model
- [x] Prisma client regenerated
- [x] Seed script created (`prisma/seed-warehouses.ts`)
- [x] Service layer created (`warehouseService.ts`)
- [x] API routes created (GET, POST, PATCH, DELETE)
- [x] UI page created (`/admin/warehouses`)
- [x] Admin-only access enforced
- [x] Default warehouses seeded
- [x] Documentation complete

---

## Testing Checklist

After setup:

- [x] Warehouses load successfully at `/admin/warehouses`
- [x] Seed data visible (Main, Consumables, Owner Supplied)
- [x] Admin access works
- [x] Non-admin users cannot access
- [x] Create warehouse works
- [x] Edit warehouse works
- [x] Deactivate warehouse works (soft delete)
- [x] Reactivate warehouse works
- [x] No 500 errors
- [x] Prisma client aligned with schema

---

## Important Notes

### Why This Module is Simple

1. **Reference data** - Not transactional, rarely changed
2. **95% use case** - Most installs use only 3 warehouses
3. **Stability** - Simple = stable = reliable
4. **Future-proof** - Can add features if needed, but probably won't need to

### Do NOT Add Complexity

- ❌ Don't add code/description/type fields
- ❌ Don't add search/pagination
- ❌ Don't add complex permissions
- ❌ Don't add relations or foreign keys
- ✅ Keep it simple and stable

---

**Last Updated**: 2026-01-06  
**Module**: Warehouses  
**Status**: ✅ Complete (Admin-only Reference Module)

# Warehouses Refactor Summary

## Overview

Warehouses module has been refactored from a full-featured module (like Suppliers) into a simple, admin-only reference data module.

**Date:** 2026-01-06  
**Status:** ✅ Complete

---

## Changes Made

### 1. Database Schema

**File:** `prisma/schema.prisma`

**Removed:**
- `code` field (String, unique)
- `description` field (Text)
- `type` enum field (WarehouseType)

**Kept:**
- `id` (BigInt, primary key)
- `name` (String, now unique)
- `isActive` (Boolean)
- `createdAt`, `updatedAt` (timestamps)

**Migration:** See `prisma/migrations/simplify_warehouses.sql`

---

### 2. Service Layer

**File:** `lib/services/warehouseService.ts`

**Simplified:**
- Removed `userId` parameter from all methods (admin-only access)
- Removed search and pagination options
- Removed `getWarehouseByCode()` method
- Simplified input types (only `name` and `isActive`)

**Methods:**
- `getWarehouses(activeOnly?: boolean)`
- `getWarehouseById(warehouseId: bigint)`
- `createWarehouse(data: CreateWarehouseInput)`
- `updateWarehouse(warehouseId: bigint, data: UpdateWarehouseInput)`
- `deleteWarehouse(warehouseId: bigint)`

---

### 3. API Routes

**Files:**
- `app/api/warehouses/route.ts`
- `app/api/warehouses/[id]/route.ts`

**Changes:**
- Changed from `inventory.manage_warehouses` permission to admin-only check
- Removed pagination, search, and filtering
- Simplified request/response bodies
- Removed `code`, `description`, `type` fields

**Access Control:**
- All endpoints now check `isAdmin === true` via `getCurrentUser()`
- Super-user bypass remains intact

---

### 4. UI

**New Location:** `app/admin/warehouses/page.tsx`

**Removed:**
- `/dashboard/warehouses` (old location)
- Detail pages (`/dashboard/warehouses/[id]`)
- Complex table with search, pagination
- WarehouseForm, WarehousesTable components

**New Features:**
- Simple table: Name | Active
- Simple modal: Name input + Active checkbox
- Inline form component (no separate file)
- No search, pagination, or filtering

**Navigation:**
- Updated `app/dashboard/admin/page.tsx` to point to `/admin/warehouses`
- Updated `app/admin/layout.tsx` to include Warehouses nav item
- Updated `components/layout/Topbar.tsx` to include `/admin/warehouses`

---

### 5. Types

**File:** `lib/types.ts`

**Updated Warehouse interface:**
```typescript
export interface Warehouse {
  id: bigint;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 6. Seed Script

**File:** `prisma/seed-warehouses.ts`

**Updated:**
- Removed `code`, `description`, `type` fields
- Now seeds only: name and isActive
- Uses `name` as unique key for upsert

**Default Warehouses:**
1. Main Warehouse
2. Consumables
3. Owner Supplied

---

### 7. Documentation

**Created:**
- `docs/warehouses-reference.md` - Complete reference documentation
- `docs/warehouses-refactor-summary.md` - This file
- `prisma/migrations/simplify_warehouses.sql` - Migration SQL

---

## Files to Remove (Optional Cleanup)

The following files are no longer used and can be safely removed:

- `app/dashboard/warehouses/page.tsx`
- `app/dashboard/warehouses/[id]/page.tsx`
- `app/dashboard/warehouses/_components/WarehousesTable.tsx`
- `app/dashboard/warehouses/_components/WarehouseForm.tsx`
- `app/dashboard/warehouses/[id]/_components/WarehouseDetailClient.tsx`
- `app/dashboard/warehouses/[id]/_components/WarehouseCard.tsx`
- `app/dashboard/warehouses/[id]/_components/WarehouseTabs.tsx`

**Note:** These files are left in place for now. Remove after verification.

---

## Migration Steps

### 1. Backup Database
```bash
# Create backup before migration
mysqldump -u [user] -p [database] > backup_before_warehouses_refactor.sql
```

### 2. Run SQL Migration
```bash
# Run the SQL migration
mysql -u [user] -p [database] < prisma/migrations/simplify_warehouses.sql
```

### 3. Run Prisma Migration
```bash
# Generate and apply Prisma migration
npx prisma migrate dev --name simplify_warehouses
```

### 4. Reseed Warehouses
```bash
# Reseed with simplified data
npx tsx prisma/seed-warehouses.ts
```

### 5. Verify
- Check `/admin/warehouses` loads correctly
- Verify seed data appears
- Test create, edit, deactivate operations
- Verify admin-only access works

---

## Verification Checklist

After migration:

- [ ] Database migration applied successfully
- [ ] Prisma schema synced
- [ ] Warehouses load at `/admin/warehouses`
- [ ] Seed data visible (Main Warehouse, Consumables, Owner Supplied)
- [ ] Create warehouse works
- [ ] Edit warehouse works
- [ ] Deactivate warehouse works (soft delete)
- [ ] Reactivate warehouse works
- [ ] Admin-only access enforced (403 for non-admin)
- [ ] Super-user bypass works
- [ ] No regressions in Suppliers module
- [ ] No regressions in Customers module
- [ ] Inventory can access warehouses as dropdown (if implemented)

---

## Rollback Plan

If rollback is needed:

1. **Restore database from backup:**
   ```bash
   mysql -u [user] -p [database] < backup_before_warehouses_refactor.sql
   ```

2. **Revert Prisma schema:**
   - Restore previous Warehouse model with `code`, `description`, `type`

3. **Revert code changes:**
   - Restore old service layer, API routes, and UI
   - Use git to revert commits if needed

**Note:** The migration removes columns and cannot be easily reversed without a backup.

---

## Access Rules Summary

| Role | Create | Edit | View | Deactivate |
|------|--------|------|------|------------|
| Super Admin | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ |
| Other Users | ❌ | ❌ | ❌ | ❌ |

**Note:** Other users can access warehouses read-only via relations (e.g., in inventory dropdowns), but cannot access the UI.

---

## Next Steps

1. **Run migration** (see Migration Steps above)
2. **Test thoroughly** (see Verification Checklist)
3. **Remove old files** (optional cleanup)
4. **Update any inventory code** that references old warehouse fields (`code`, `type`, `description`)

---

**Last Updated:** 2026-01-06  
**Status:** ✅ Ready for Migration


# Prompt 06: Seed Permissions (70+ System Permissions)

## Objective
Populate the `permissions` table with all 70+ permissions from the Station-2100 specification.

## Task
Create a seed script that inserts ONLY the permissions. No users yet.

## Prerequisites
- ✅ Prompts 01-05 completed
- ✅ Database tables exist (users, permissions, user_permissions, audit_logs)
- ✅ Tables are empty

## Instructions for Cursor

### Create prisma/seed-permissions.ts

Create a dedicated seed file for permissions:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding permissions...')

  const permissionsData = [
    // ══════════════════════════════════════════════════════
    // INVENTORY MODULE (17 permissions)
    // ══════════════════════════════════════════════════════
    { key: 'inventory.view', description: 'View inventory and batches', module: 'Inventory', category: 'Read' },
    { key: 'inventory.create', description: 'Create product records', module: 'Inventory', category: 'Write' },
    { key: 'inventory.edit', description: 'Edit product details', module: 'Inventory', category: 'Write' },
    { key: 'inventory.delete', description: 'Delete products', module: 'Inventory', category: 'Delete' },
    { key: 'inventory.receive', description: 'Receive new batches', module: 'Inventory', category: 'Write' },
    { key: 'inventory.approve_receipt', description: 'Approve received batches', module: 'Inventory', category: 'Approve' },
    { key: 'inventory.issue', description: 'Issue stock', module: 'Inventory', category: 'Write' },
    { key: 'inventory.approve_issue', description: 'Approve stock issues', module: 'Inventory', category: 'Approve' },
    { key: 'inventory.adjust', description: 'Create adjustments', module: 'Inventory', category: 'Write' },
    { key: 'inventory.approve_adjustment', description: 'Approve adjustments', module: 'Inventory', category: 'Approve' },
    { key: 'inventory.return', description: 'Return stock', module: 'Inventory', category: 'Write' },
    { key: 'inventory.approve_return', description: 'Approve returns', module: 'Inventory', category: 'Approve' },
    { key: 'inventory.quarantine', description: 'Place on hold', module: 'Inventory', category: 'Write' },
    { key: 'inventory.view_cost', description: 'View cost data', module: 'Inventory', category: 'Read' },
    { key: 'inventory.edit_pricing', description: 'Modify prices', module: 'Inventory', category: 'Write' },
    { key: 'inventory.view_supplier', description: 'View supplier info', module: 'Inventory', category: 'Read' },
    { key: 'inventory.manage_locations', description: 'Manage bin/rack/row', module: 'Inventory', category: 'Write' },

    // ══════════════════════════════════════════════════════
    // JOB CARD MODULE (14 permissions)
    // ══════════════════════════════════════════════════════
    { key: 'jobcard.view', description: 'View job cards', module: 'JobCard', category: 'Read' },
    { key: 'jobcard.create', description: 'Create jobs', module: 'JobCard', category: 'Write' },
    { key: 'jobcard.edit', description: 'Edit job details', module: 'JobCard', category: 'Write' },
    { key: 'jobcard.delete', description: 'Delete jobs', module: 'JobCard', category: 'Delete' },
    { key: 'jobcard.add_labour', description: 'Add labour entries', module: 'JobCard', category: 'Write' },
    { key: 'jobcard.edit_labour', description: 'Edit labour', module: 'JobCard', category: 'Write' },
    { key: 'jobcard.add_parts', description: 'Add parts', module: 'JobCard', category: 'Write' },
    { key: 'jobcard.remove_parts', description: 'Remove parts', module: 'JobCard', category: 'Write' },
    { key: 'jobcard.close', description: 'Close jobs', module: 'JobCard', category: 'Approve' },
    { key: 'jobcard.reopen', description: 'Reopen closed jobs', module: 'JobCard', category: 'Approve' },
    { key: 'jobcard.view_cost', description: 'View costs', module: 'JobCard', category: 'Read' },
    { key: 'jobcard.edit_invoice', description: 'Edit invoice number', module: 'JobCard', category: 'Write' },
    { key: 'jobcard.print', description: 'Print job cards', module: 'JobCard', category: 'Read' },
    { key: 'jobcard.view_profit', description: 'View profitability', module: 'JobCard', category: 'Read' },

    // ══════════════════════════════════════════════════════
    // ROTABLES MODULE (10 permissions)
    // ══════════════════════════════════════════════════════
    { key: 'rotables.view', description: 'View rotables', module: 'Rotables', category: 'Read' },
    { key: 'rotables.create', description: 'Add rotables', module: 'Rotables', category: 'Write' },
    { key: 'rotables.edit', description: 'Edit details', module: 'Rotables', category: 'Write' },
    { key: 'rotables.delete', description: 'Delete rotables', module: 'Rotables', category: 'Delete' },
    { key: 'rotables.install', description: 'Mark installed', module: 'Rotables', category: 'Write' },
    { key: 'rotables.remove', description: 'Mark removed', module: 'Rotables', category: 'Write' },
    { key: 'rotables.service', description: 'Record service', module: 'Rotables', category: 'Write' },
    { key: 'rotables.view_service_cost', description: 'View service costs', module: 'Rotables', category: 'Read' },
    { key: 'rotables.edit_service_cost', description: 'Edit service costs', module: 'Rotables', category: 'Write' },
    { key: 'rotables.view_alerts', description: 'View overdue alerts', module: 'Rotables', category: 'Read' },

    // ══════════════════════════════════════════════════════
    // TOOLS MODULE (11 permissions)
    // ══════════════════════════════════════════════════════
    { key: 'tools.view', description: 'View tools', module: 'Tools', category: 'Read' },
    { key: 'tools.create', description: 'Add tools', module: 'Tools', category: 'Write' },
    { key: 'tools.edit', description: 'Edit details', module: 'Tools', category: 'Write' },
    { key: 'tools.delete', description: 'Delete tools', module: 'Tools', category: 'Delete' },
    { key: 'tools.issue', description: 'Issue tools', module: 'Tools', category: 'Write' },
    { key: 'tools.return', description: 'Return tools', module: 'Tools', category: 'Write' },
    { key: 'tools.view_cost', description: 'View purchase cost', module: 'Tools', category: 'Read' },
    { key: 'tools.calibrate', description: 'Record calibration', module: 'Tools', category: 'Write' },
    { key: 'tools.view_calibration', description: 'View calibration dates', module: 'Tools', category: 'Read' },
    { key: 'tools.mark_missing', description: 'Report missing', module: 'Tools', category: 'Write' },
    { key: 'tools.resolve_missing', description: 'Clear missing status', module: 'Tools', category: 'Write' },

    // ══════════════════════════════════════════════════════
    // ADMIN MODULE (10 permissions)
    // ══════════════════════════════════════════════════════
    { key: 'admin.view_settings', description: 'View settings', module: 'Admin', category: 'Read' },
    { key: 'admin.edit_settings', description: 'Modify settings', module: 'Admin', category: 'Write' },
    { key: 'admin.manage_users', description: 'Manage users', module: 'Admin', category: 'Write' },
    { key: 'admin.manage_permissions', description: 'Assign permissions', module: 'Admin', category: 'Write' },
    { key: 'admin.manage_warehouses', description: 'Configure warehouses', module: 'Admin', category: 'Write' },
    { key: 'admin.manage_suppliers', description: 'Manage suppliers', module: 'Admin', category: 'Write' },
    { key: 'admin.manage_customers', description: 'Manage customers', module: 'Admin', category: 'Write' },
    { key: 'admin.view_audit_logs', description: 'View audit logs', module: 'Admin', category: 'Read' },
    { key: 'admin.export_data', description: 'Export data', module: 'Admin', category: 'Read' },
    { key: 'admin.backup_restore', description: 'Backup/restore', module: 'Admin', category: 'Write' },

    // ══════════════════════════════════════════════════════
    // REPORTS MODULE (8 permissions)
    // ══════════════════════════════════════════════════════
    { key: 'reports.view_stock', description: 'Stock reports', module: 'Reports', category: 'Read' },
    { key: 'reports.view_movement', description: 'Movement reports', module: 'Reports', category: 'Read' },
    { key: 'reports.view_jobcards', description: 'Job card reports', module: 'Reports', category: 'Read' },
    { key: 'reports.view_financial', description: 'Financial reports', module: 'Reports', category: 'Read' },
    { key: 'reports.view_rotables', description: 'Rotable reports', module: 'Reports', category: 'Read' },
    { key: 'reports.view_tools', description: 'Tool reports', module: 'Reports', category: 'Read' },
    { key: 'reports.export', description: 'Export reports', module: 'Reports', category: 'Write' },
    { key: 'reports.schedule', description: 'Schedule reports', module: 'Reports', category: 'Write' },
  ]

  console.log(`📝 Inserting ${permissionsData.length} permissions...`)

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {}, // Don't update if exists
      create: {
        key: perm.key,
        description: perm.description,
        module: perm.module,
        category: perm.category || null,
        isActive: true,
      },
    })
  }

  console.log(`✅ ${permissionsData.length} permissions inserted successfully`)
  
  // Verify
  const count = await prisma.permission.count()
  console.log(`📊 Total permissions in database: ${count}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding permissions:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Update package.json

Add the seed command to `package.json`:

```json
{
  "name": "stationv",
  "prisma": {
    "seed": "ts-node prisma/seed-permissions.ts"
  },
  "scripts": {
    "dev": "next dev -p 3000",
    "seed:permissions": "ts-node prisma/seed-permissions.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "@types/node": "20.0.0",
    "prisma": "^5.0.0",
    "ts-node": "^10.0.0",
    "typescript": "5.0.0"
  }
}
```

### Run the Seed

```bash
npm run seed:permissions
```

**Expected output:**
```
🌱 Seeding permissions...
📝 Inserting 70 permissions...
✅ 70 permissions inserted successfully
📊 Total permissions in database: 70
```

## Verification

### Check in Prisma Studio

```bash
npx prisma studio
```

Navigate to `permissions` table:
- ✅ Should see 70 records
- ✅ Grouped by module (Inventory, JobCard, Rotables, Tools, Admin, Reports)
- ✅ Each has key, description, module, category

### Check in phpMyAdmin

Open `stationv` → `permissions` table:
- ✅ 70 rows
- ✅ Keys follow pattern: `module.action`
- ✅ All have `isActive = 1`

## Verification Checklist

- [ ] `prisma/seed-permissions.ts` created
- [ ] `package.json` updated with seed script
- [ ] Seed ran successfully (`npm run seed:permissions`)
- [ ] 70 permissions in database
- [ ] All modules represented (Inventory, JobCard, Rotables, Tools, Admin, Reports)
- [ ] No errors in console

## Database State

**After Prompt 06:**
- ✅ `permissions` table: 70 records
- ✅ `users` table: empty (next prompt)
- ✅ `user_permissions` table: empty (next prompt)
- ✅ `audit_logs` table: empty (next prompt)

---

**Next Step:** Prompt 07 - Seed Admin User (George Thande)

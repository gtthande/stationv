# Prompt 08: Seed Database with All Permissions

## Objective
Create a comprehensive seed script that populates the database with all 70+ permissions from the Station-2100 spec and creates the initial admin user (George Thande).

## Task
Create `prisma/seed.ts` with a complete seeding script.

## Implementation

Create the file `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // ═══════════════════════════════════════════════════════════
  // STEP 1: Create All 70+ Permissions from Station-2100 Spec
  // ═══════════════════════════════════════════════════════════

  const permissionsData = [
    // ─────────────────────────────────────────────────────────
    // INVENTORY MODULE (17 permissions)
    // ─────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────
    // JOB CARD MODULE (14 permissions)
    // ─────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────
    // ROTABLES MODULE (10 permissions)
    // ─────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────
    // TOOLS MODULE (11 permissions)
    // ─────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────
    // ADMIN MODULE (10 permissions)
    // ─────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────
    // REPORTS MODULE (8 permissions)
    // ─────────────────────────────────────────────────────────
    { key: 'reports.view_stock', description: 'Stock reports', module: 'Reports', category: 'Read' },
    { key: 'reports.view_movement', description: 'Movement reports', module: 'Reports', category: 'Read' },
    { key: 'reports.view_jobcards', description: 'Job card reports', module: 'Reports', category: 'Read' },
    { key: 'reports.view_financial', description: 'Financial reports', module: 'Reports', category: 'Read' },
    { key: 'reports.view_rotables', description: 'Rotable reports', module: 'Reports', category: 'Read' },
    { key: 'reports.view_tools', description: 'Tool reports', module: 'Reports', category: 'Read' },
    { key: 'reports.export', description: 'Export reports', module: 'Reports', category: 'Write' },
    { key: 'reports.schedule', description: 'Schedule reports', module: 'Reports', category: 'Write' },
  ]

  console.log(`📝 Creating ${permissionsData.length} permissions...`)

  // Upsert all permissions
  const permissions = []
  for (const perm of permissionsData) {
    const created = await prisma.permission.upsert({
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
    permissions.push(created)
  }

  console.log(`✅ Created ${permissions.length} permissions`)

  // ═══════════════════════════════════════════════════════════
  // STEP 2: Create Admin User (George Thande)
  // ═══════════════════════════════════════════════════════════

  console.log('👤 Creating admin user: George Thande...')

  // Hash password
  const hashedPassword = await bcrypt.hash('Station-2100', 10)

  // Create or update admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'gtthande@gmail.com' },
    update: {}, // Don't update if exists
    create: {
      name: 'George Thande',
      email: 'gtthande@gmail.com',
      password: hashedPassword,
      isActive: true,
      isAdmin: true,
    },
  })

  console.log(`✅ Admin user created: ${adminUser.name} (${adminUser.email})`)

  // ═══════════════════════════════════════════════════════════
  // STEP 3: Grant ALL Permissions to Admin User
  // ═══════════════════════════════════════════════════════════

  console.log('🔐 Granting ALL permissions to admin user...')

  let grantedCount = 0
  for (const permission of permissions) {
    await prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId: adminUser.id,
          permissionId: permission.id,
        },
      },
      update: {}, // Don't update if exists
      create: {
        userId: adminUser.id,
        permissionId: permission.id,
        grantedBy: null, // System grant
      },
    })
    grantedCount++
  }

  console.log(`✅ Granted ${grantedCount} permissions to ${adminUser.name}`)

  // ═══════════════════════════════════════════════════════════
  // STEP 4: Create Initial Audit Log Entry
  // ═══════════════════════════════════════════════════════════

  await prisma.auditLog.create({
    data: {
      userId: null, // System action
      action: 'system.seed',
      module: 'System',
      details: {
        permissionsCreated: permissions.length,
        adminUserCreated: true,
        adminEmail: adminUser.email,
      },
      timestamp: new Date(),
    },
  })

  console.log('✅ Audit log entry created')

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════

  console.log('\n' + '═'.repeat(60))
  console.log('🎉 DATABASE SEED COMPLETE!')
  console.log('═'.repeat(60))
  console.log(`📊 Permissions Created: ${permissions.length}`)
  console.log(`👤 Admin User: ${adminUser.name}`)
  console.log(`📧 Email: ${adminUser.email}`)
  console.log(`🔑 Password: Station-2100`)
  console.log(`✅ All permissions granted to admin`)
  console.log('═'.repeat(60) + '\n')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## Update package.json

Add the seed command to your `package.json`:

```json
{
  "name": "stationv",
  "version": "1.0.0",
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  },
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "prisma:migrate": "prisma migrate dev --name init",
    "prisma:seed": "prisma db seed"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "bcrypt": "^5.1.1",
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.0",
    "@types/node": "20.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "prisma": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "ts-node": "^10.0.0",
    "typescript": "5.0.0"
  }
}
```

## Run the Seed

```bash
# Run the seed script
npx prisma db seed
```

## Expected Output

```
🌱 Starting database seed...
📝 Creating 70 permissions...
✅ Created 70 permissions
👤 Creating admin user: George Thande...
✅ Admin user created: George Thande (gtthande@gmail.com)
🔐 Granting ALL permissions to admin user...
✅ Granted 70 permissions to George Thande
✅ Audit log entry created

════════════════════════════════════════════════════════════
🎉 DATABASE SEED COMPLETE!
════════════════════════════════════════════════════════════
📊 Permissions Created: 70
👤 Admin User: George Thande
📧 Email: gtthande@gmail.com
🔑 Password: Station-2100
✅ All permissions granted to admin
════════════════════════════════════════════════════════════
```

## Verify in Prisma Studio

```bash
npx prisma studio
```

Check:
- ✅ `permissions` table has 70 records
- ✅ `users` table has George Thande
- ✅ `user_permissions` table has 70 records (linking George to all permissions)
- ✅ `audit_logs` table has 1 seed entry

## Reference
- Station-2100 Spec: Appendix A (Complete Permission Reference)
- Dev Profile: Seeding best practices

---
**Next Step**: Prompt 09 - API route to list users

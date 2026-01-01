# Prompt 07: Seed Admin User (George Thande)

## Objective
Create the initial super admin user and grant ALL permissions.

## Task
Create a seed script that creates George Thande and assigns all 70 permissions.

## Prerequisites
- ✅ Prompts 01-06 completed
- ✅ Database tables exist and are migrated
- ✅ 70 permissions exist in `permissions` table
- ✅ bcrypt installed (`npm install bcrypt @types/bcrypt`)

## Instructions for Cursor

### Install bcrypt (if not installed)

```bash
npm install bcrypt
npm install -D @types/bcrypt
```

**Note on bcrypt vs bcryptjs:**
- `bcrypt` is faster (native C++ bindings)
- `bcryptjs` is pure JavaScript (easier to install, especially on Windows)

If you encounter installation issues on Windows/XAMPP:
```bash
npm uninstall bcrypt
npm install bcryptjs
npm install -D @types/bcryptjs
```

Then in your code, use:
```typescript
import * as bcrypt from 'bcryptjs'
```

For this tutorial, we'll use `bcrypt`, but switch to `bcryptjs` if you hit issues.

### Create prisma/seed-admin.ts

```typescript
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('👤 Creating admin user...')

  // Normalize email to prevent duplicates
  const adminEmail = 'gtthande@gmail.com'.toLowerCase()

  // Hash password
  const hashedPassword = await bcrypt.hash('Station-2100', 10)

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {}, // Don't update if exists
    create: {
      name: 'George Thande',
      email: adminEmail,
      password: hashedPassword,
      isActive: true,
      isAdmin: true,
      createdBy: null, // System-created user
    },
  })

  console.log(`✅ Admin user created: ${admin.name} (${admin.email})`)

  // Get ALL permissions
  const allPermissions = await prisma.permission.findMany()
  console.log(`🔐 Found ${allPermissions.length} permissions to assign...`)

  // Grant ALL permissions to admin
  let grantedCount = 0
  for (const permission of allPermissions) {
    await prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId: admin.id,
          permissionId: permission.id,
        },
      },
      update: {}, // Don't update if exists
      create: {
        userId: admin.id,
        permissionId: permission.id,
        grantedBy: null, // System grant
      },
    })
    grantedCount++
  }

  console.log(`✅ Granted ${grantedCount} permissions to ${admin.name}`)

  // Create initial audit log entry
  await prisma.auditLog.create({
    data: {
      userId: null, // System action
      action: 'system.seed.admin_user',
      module: 'System',
      details: {
        adminUserId: admin.id,
        adminEmail: admin.email,
        permissionsGranted: grantedCount,
      },
      timestamp: new Date(),
    },
  })

  console.log('✅ Audit log entry created')

  // Summary
  console.log('\n' + '═'.repeat(60))
  console.log('🎉 ADMIN USER SETUP COMPLETE')
  console.log('═'.repeat(60))
  console.log(`👤 Name: ${admin.name}`)
  console.log(`📧 Email: ${admin.email}`)
  console.log(`🔑 Password: Station-2100`)
  console.log(`✅ Permissions: ${grantedCount}/${allPermissions.length}`)
  console.log(`🔐 Is Admin: Yes`)
  console.log(`✅ Status: Active`)
  console.log('═'.repeat(60) + '\n')
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin user:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

### Update package.json

Add another seed script:

```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "seed:permissions": "ts-node prisma/seed-permissions.ts",
    "seed:admin": "ts-node prisma/seed-admin.ts"
  }
}
```

### Run the Seed

```bash
npm run seed:admin
```

**Expected output:**
```
👤 Creating admin user...
✅ Admin user created: George Thande (gtthande@gmail.com)
🔐 Found 70 permissions to assign...
✅ Granted 70 permissions to George Thande
✅ Audit log entry created

════════════════════════════════════════════════════════════
🎉 ADMIN USER SETUP COMPLETE
════════════════════════════════════════════════════════════
👤 Name: George Thande
📧 Email: gtthande@gmail.com
🔑 Password: Station-2100
✅ Permissions: 70/70
🔐 Is Admin: Yes
✅ Status: Active
════════════════════════════════════════════════════════════
```

## Verification

### Check in Prisma Studio

```bash
npx prisma studio
```

Navigate to tables:

**users table:**
- ✅ 1 record: George Thande
- ✅ email: gtthande@gmail.com
- ✅ password: hashed (bcrypt - should start with `$2b$`)
- ✅ isAdmin: true
- ✅ isActive: true

**user_permissions table:**
- ✅ 70 records
- ✅ All linking George's userId to permission IDs
- ✅ grantedBy: null (system grant)

**audit_logs table:**
- ✅ 1 record
- ✅ action: "system.seed.admin_user"
- ✅ details: JSON with admin info

### Check Password Hash

In Prisma Studio, click on George's record:
- Password should be a long hash like: `$2b$10$abc...xyz`
- Should NOT be plain text "Station-2100"

## Security Note

**Never commit the password to git!**

The password `Station-2100` is only for initial setup. In production:
1. Change this password immediately
2. Use environment variables for initial passwords
3. Force password change on first login

## Verification Checklist

- [ ] `prisma/seed-admin.ts` created
- [ ] bcrypt installed
- [ ] `package.json` updated with seed script
- [ ] Seed ran successfully (`npm run seed:admin`)
- [ ] George Thande exists in users table
- [ ] Password is bcrypt hashed (not plain text)
- [ ] 70 user_permissions records exist
- [ ] Audit log entry created
- [ ] isAdmin = true
- [ ] isActive = true

## Database State

**After Prompt 07:**
- ✅ `users` table: 1 record (George Thande)
- ✅ `permissions` table: 70 records
- ✅ `user_permissions` table: 70 records (George has all permissions)
- ✅ `audit_logs` table: 1 record (seed log)

---

**Next Step:** Prompt 08 - Verify Complete Setup

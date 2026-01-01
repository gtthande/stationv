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


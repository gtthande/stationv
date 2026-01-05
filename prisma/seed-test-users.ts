/**
 * Seed Test Users for RBAC Validation (DEV ONLY)
 * 
 * Creates 4 test users with specific permission sets for development/testing.
 * 
 * USERS:
 * 1. Inventory Manager - suppliers, inventory, reports
 * 2. Workshop Manager - jobcards, inventory approvals
 * 3. Workshop Operator - jobcards view/update, inventory requests
 * 4. Engineer - jobcards view, inventory view
 * 
 * PASSWORD: DevPass123! (for all users)
 */

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

/**
 * Permission mapping: Maps requested permission keys to actual database keys
 * If a requested key doesn't exist, we try the mapped key as fallback
 */
const permissionMapping: Record<string, string[]> = {
  'suppliers:read': ['suppliers:read', 'admin.manage_suppliers'],
  'suppliers:create': ['suppliers:create', 'admin.manage_suppliers'],
  'suppliers:update': ['suppliers:update', 'admin.manage_suppliers'],
  'jobcards:create': ['jobcards:create', 'jobcard.create'],
  'jobcards:approve': ['jobcards:approve', 'jobcard.close'], // Approve is typically close
  'jobcards:close': ['jobcards:close', 'jobcard.close'],
  'jobcards:view': ['jobcards:view', 'jobcard.view'],
  'jobcards:update': ['jobcards:update', 'jobcard.edit'],
  'inventory.request_issue': ['inventory.request_issue', 'inventory.issue'],
  'reports.view': [
    'reports.view',
    'reports.view_stock',
    'reports.view_movement',
    'reports.view_jobcards',
  ],
}

// Test users configuration
const testUsers = [
  {
    name: 'Inventory Manager',
    email: 'inventory.manager@station2100.local',
    isAdmin: false,
    permissions: [
      'suppliers:read',
      'suppliers:create',
      'suppliers:update',
      'inventory.receive',
      'inventory.adjust',
      'inventory.view',
      'reports.view',
    ],
  },
  {
    name: 'Workshop Manager',
    email: 'workshop.manager@station2100.local',
    isAdmin: false,
    permissions: [
      'jobcards:create',
      'jobcards:approve',
      'jobcards:close',
      'inventory.view',
      'inventory.approve_issue',
    ],
  },
  {
    name: 'Workshop Operator',
    email: 'workshop.operator@station2100.local',
    isAdmin: false,
    permissions: [
      'jobcards:view',
      'jobcards:update',
      'inventory.request_issue',
    ],
  },
  {
    name: 'Engineer',
    email: 'engineer@station2100.local',
    isAdmin: false,
    permissions: [
      'jobcards:view',
      'inventory.view',
    ],
  },
]

// Password for all test users
const TEST_PASSWORD = 'DevPass123!'

async function main() {
  console.log('🌱 Seeding test users for RBAC validation...\n')

  // Hash password once (same for all users)
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10)
  console.log('✅ Password hashed\n')

  const results: Array<{
    user: { id: string; name: string; email: string }
    permissionsFound: string[]
    permissionsMissing: string[]
    permissionMappingUsed: Record<string, string[]>
  }> = []

  // Process each test user
  for (const userConfig of testUsers) {
    console.log(`👤 Creating user: ${userConfig.name} (${userConfig.email})`)

    // Normalize email
    const normalizedEmail = userConfig.email.toLowerCase().trim()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      console.log(`⚠️  User already exists: ${existingUser.id}`)
      console.log(`   Skipping creation (following additive-only rule)\n`)
      continue
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name: userConfig.name,
        email: normalizedEmail,
        password: hashedPassword,
        isActive: true,
        isAdmin: userConfig.isAdmin,
        createdBy: null, // System-created
      },
    })

    console.log(`✅ User created: ${user.id}`)

    // Fetch permissions by key (with fallback mapping)
    const permissionsFound: string[] = []
    const permissionsMissing: string[] = []
    const permissionMappingUsed: Record<string, string[]> = {} // Track which mapped keys were used

    for (const requestedKey of userConfig.permissions) {
      // Try requested key first, then mapped alternatives
      const keysToTry = permissionMapping[requestedKey] || [requestedKey]
      const foundKeys: string[] = []

      // Special handling for reports.view which maps to multiple permissions
      if (requestedKey === 'reports.view' && keysToTry.length > 1) {
        // Grant all report view permissions
        for (const keyToTry of keysToTry.slice(1)) {
          // Skip the first one (reports.view) and try the mapped ones
          const permission = await prisma.permission.findUnique({
            where: { key: keyToTry },
          })

          if (permission && permission.isActive) {
            await prisma.userPermission.upsert({
              where: {
                userId_permissionId: {
                  userId: user.id,
                  permissionId: permission.id,
                },
              },
              update: {},
              create: {
                userId: user.id,
                permissionId: permission.id,
                grantedBy: null,
              },
            })
            foundKeys.push(keyToTry)
          }
        }

        if (foundKeys.length > 0) {
          permissionsFound.push(requestedKey)
          permissionMappingUsed[requestedKey] = foundKeys
          console.log(`   ✓ Mapped "${requestedKey}" → ${foundKeys.join(', ')}`)
        } else {
          permissionsMissing.push(requestedKey)
          console.log(`   ⚠️  Permission not found: ${requestedKey}`)
        }
      } else {
        // Standard single permission lookup
        let permission = null
        let actualKeyUsed = requestedKey

        for (const keyToTry of keysToTry) {
          permission = await prisma.permission.findUnique({
            where: { key: keyToTry },
          })

          if (permission && permission.isActive) {
            actualKeyUsed = keyToTry
            break
          }
        }

        if (permission && permission.isActive) {
          // Grant permission to user
          await prisma.userPermission.upsert({
            where: {
              userId_permissionId: {
                userId: user.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              userId: user.id,
              permissionId: permission.id,
              grantedBy: null,
            },
          })
          permissionsFound.push(requestedKey)
          if (actualKeyUsed !== requestedKey) {
            permissionMappingUsed[requestedKey] = [actualKeyUsed]
            console.log(`   ✓ Mapped "${requestedKey}" → "${actualKeyUsed}"`)
          }
        } else {
          permissionsMissing.push(requestedKey)
          console.log(`   ⚠️  Permission not found: ${requestedKey}`)
        }
      }
    }

    console.log(`   ✅ Granted ${permissionsFound.length} permissions`)
    if (permissionsMissing.length > 0) {
      console.log(`   ⚠️  Missing ${permissionsMissing.length} permissions`)
    }
    console.log()

    results.push({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      permissionsFound,
      permissionsMissing,
      permissionMappingUsed,
    })
  }

  // Create audit log entry
  await prisma.auditLog.create({
    data: {
      userId: null, // System action
      action: 'system.seed.test_users',
      module: 'System',
      details: {
        usersCreated: results.length,
        totalPermissionsGranted: results.reduce(
          (sum, r) => sum + r.permissionsFound.length,
          0
        ),
        users: results.map((r) => ({
          userId: r.user.id,
          email: r.user.email,
          permissionsCount: r.permissionsFound.length,
        })),
      },
      timestamp: new Date(),
    },
  })

  // Summary
  console.log('═'.repeat(60))
  console.log('🎉 TEST USERS SEED COMPLETE')
  console.log('═'.repeat(60))
  console.log(`\n📊 Summary:`)
  console.log(`   Users created: ${results.length}`)
  console.log(`   Total permissions granted: ${results.reduce(
    (sum, r) => sum + r.permissionsFound.length,
    0
  )}`)

  console.log(`\n👥 Created Users:`)
  for (const result of results) {
    console.log(`\n   ${result.user.name}`)
    console.log(`   📧 Email: ${result.user.email}`)
    console.log(`   🔑 Password: ${TEST_PASSWORD}`)
    console.log(`   🆔 User ID: ${result.user.id}`)
    console.log(`   ✅ Permissions (${result.permissionsFound.length}):`)
    for (const perm of result.permissionsFound) {
      const mapped = result.permissionMappingUsed[perm]
      if (mapped && mapped.length > 0) {
        if (mapped.length === 1) {
          console.log(`      • ${perm} → ${mapped[0]}`)
        } else {
          console.log(`      • ${perm} → ${mapped.join(', ')}`)
        }
      } else {
        console.log(`      • ${perm}`)
      }
    }
    if (result.permissionsMissing.length > 0) {
      console.log(`   ⚠️  Missing Permissions (${result.permissionsMissing.length}):`)
      for (const perm of result.permissionsMissing) {
        console.log(`      • ${perm}`)
      }
    }
  }

  console.log(`\n${'═'.repeat(60)}\n`)

  // List all missing permissions across all users
  const allMissing = results.flatMap((r) => r.permissionsMissing)
  const uniqueMissing = [...new Set(allMissing)]
  if (uniqueMissing.length > 0) {
    console.log('⚠️  MISSING PERMISSIONS (not found in database):')
    for (const perm of uniqueMissing) {
      console.log(`   • ${perm}`)
    }
    console.log(
      '\n   Note: These permissions may need to be added to the permissions table.\n'
    )
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding test users:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


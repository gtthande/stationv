/**
 * Add Mapped Permissions to Existing Test Users
 * 
 * This script adds permissions using the mapping logic to existing test users.
 * It's additive only - doesn't remove existing permissions.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Permission mapping (same as seed script)
const permissionMapping: Record<string, string[]> = {
  'suppliers:read': ['suppliers:read', 'admin.manage_suppliers'],
  'suppliers:create': ['suppliers:create', 'admin.manage_suppliers'],
  'suppliers:update': ['suppliers:update', 'admin.manage_suppliers'],
  'jobcards:create': ['jobcards:create', 'jobcard.create'],
  'jobcards:approve': ['jobcards:approve', 'jobcard.close'],
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

const testUsers = [
  {
    name: 'Inventory Manager',
    email: 'inventory.manager@station2100.local',
    requestedPermissions: [
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
    requestedPermissions: [
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
    requestedPermissions: [
      'jobcards:view',
      'jobcards:update',
      'inventory.request_issue',
    ],
  },
  {
    name: 'Engineer',
    email: 'engineer@station2100.local',
    requestedPermissions: ['jobcards:view', 'inventory.view'],
  },
]

async function main() {
  console.log('🔧 Adding mapped permissions to existing test users...\n')

  for (const userConfig of testUsers) {
    const user = await prisma.user.findUnique({
      where: { email: userConfig.email },
    })

    if (!user) {
      console.log(`⚠️  User not found: ${userConfig.email}\n`)
      continue
    }

    console.log(`👤 ${userConfig.name} (${user.email})`)

    // Get existing permissions
    const existingPermissions = await prisma.userPermission.findMany({
      where: { userId: user.id },
      include: { permission: true },
    })
    const existingKeys = new Set(existingPermissions.map((up) => up.permission.key))

    let addedCount = 0
    const addedKeys: string[] = []

    for (const requestedKey of userConfig.requestedPermissions) {
      // Skip if already granted
      if (existingKeys.has(requestedKey)) {
        continue
      }

      // Try mapped alternatives
      const keysToTry = permissionMapping[requestedKey] || [requestedKey]

      // Special handling for reports.view
      if (requestedKey === 'reports.view' && keysToTry.length > 1) {
        for (const keyToTry of keysToTry.slice(1)) {
          if (existingKeys.has(keyToTry)) continue

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
            addedKeys.push(keyToTry)
            addedCount++
          }
        }
        if (addedKeys.length > 0) {
          console.log(`   ✓ Added: ${requestedKey} → ${addedKeys.slice(-keysToTry.length + 1).join(', ')}`)
        }
      } else {
        // Standard single permission
        for (const keyToTry of keysToTry) {
          if (existingKeys.has(keyToTry)) {
            addedKeys.push(keyToTry)
            break
          }

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
            addedKeys.push(keyToTry)
            addedCount++
            if (keyToTry !== requestedKey) {
              console.log(`   ✓ Added: ${requestedKey} → ${keyToTry}`)
            } else {
              console.log(`   ✓ Added: ${keyToTry}`)
            }
            break
          }
        }
      }
    }

    if (addedCount === 0) {
      console.log(`   (no new permissions added)`)
    } else {
      console.log(`   ✅ Added ${addedCount} permission(s)`)
    }
    console.log()
  }

  console.log('✅ Done!\n')
}

main()
  .catch((e) => {
    console.error('❌ Error:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


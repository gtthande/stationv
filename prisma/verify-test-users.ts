/**
 * Verify Test Users and Their Permissions
 * 
 * Lists all test users and their assigned permissions for verification.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const testUserEmails = [
  'inventory.manager@station2100.local',
  'workshop.manager@station2100.local',
  'workshop.operator@station2100.local',
  'engineer@station2100.local',
]

async function main() {
  console.log('🔍 Verifying test users and permissions...\n')

  for (const email of testUserEmails) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userPermissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    if (!user) {
      console.log(`❌ User not found: ${email}\n`)
      continue
    }

    console.log(`👤 ${user.name}`)
    console.log(`   📧 Email: ${user.email}`)
    console.log(`   🆔 User ID: ${user.id}`)
    console.log(`   ✅ Active: ${user.isActive}`)
    console.log(`   👑 Admin: ${user.isAdmin}`)
    console.log(`   🔐 Permissions (${user.userPermissions.length}):`)

    if (user.userPermissions.length === 0) {
      console.log(`      (none)`)
    } else {
      // Group by module
      const byModule: Record<string, string[]> = {}
      for (const up of user.userPermissions) {
        const module = up.permission.module
        if (!byModule[module]) {
          byModule[module] = []
        }
        byModule[module].push(up.permission.key)
      }

      for (const [module, keys] of Object.entries(byModule)) {
        console.log(`      ${module}:`)
        for (const key of keys.sort()) {
          console.log(`         • ${key}`)
        }
      }
    }
    console.log()
  }

  // Summary
  const allUsers = await prisma.user.findMany({
    where: {
      email: {
        in: testUserEmails,
      },
    },
    include: {
      userPermissions: true,
    },
  })

  console.log('═'.repeat(60))
  console.log('📊 Summary')
  console.log('═'.repeat(60))
  console.log(`Total test users: ${allUsers.length}`)
  console.log(
    `Total permissions granted: ${allUsers.reduce(
      (sum, u) => sum + u.userPermissions.length,
      0
    )}`
  )
  console.log('═'.repeat(60))
}

main()
  .catch((e) => {
    console.error('❌ Error verifying test users:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


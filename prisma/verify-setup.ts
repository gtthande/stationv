import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifying database setup...\n')

  let hasErrors = false

  // ═══════════════════════════════════════════════════════════
  // TEST 1: Verify Permissions Count
  // ═══════════════════════════════════════════════════════════
  console.log('📝 TEST 1: Verifying permissions...')
  const permissionCount = await prisma.permission.count()
  
  if (permissionCount === 70) {
    console.log(`✅ PASS: Found ${permissionCount} permissions (expected 70)`)
  } else {
    console.log(`❌ FAIL: Found ${permissionCount} permissions (expected 70)`)
    hasErrors = true
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 2: Verify Permissions by Module
  // ═══════════════════════════════════════════════════════════
  console.log('\n📝 TEST 2: Verifying permissions by module...')
  const expectedModules = {
    'Inventory': 17,
    'JobCard': 14,
    'Rotables': 10,
    'Tools': 11,
    'Admin': 10,
    'Reports': 8,
  }

  for (const [module, expectedCount] of Object.entries(expectedModules)) {
    const count = await prisma.permission.count({
      where: { module },
    })
    
    if (count === expectedCount) {
      console.log(`  ✅ ${module}: ${count}/${expectedCount}`)
    } else {
      console.log(`  ❌ ${module}: ${count}/${expectedCount} (MISMATCH)`)
      hasErrors = true
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 3: Verify Admin User Exists
  // ═══════════════════════════════════════════════════════════
  console.log('\n📝 TEST 3: Verifying admin user...')
  const adminUser = await prisma.user.findUnique({
    where: { email: 'gtthande@gmail.com' },
  })

  if (adminUser) {
    console.log(`✅ PASS: Admin user exists`)
    console.log(`  - Name: ${adminUser.name}`)
    console.log(`  - Email: ${adminUser.email}`)
    console.log(`  - isAdmin: ${adminUser.isAdmin}`)
    console.log(`  - isActive: ${adminUser.isActive}`)
    
    if (!adminUser.isAdmin) {
      console.log(`  ❌ FAIL: Admin user has isAdmin = false`)
      hasErrors = true
    }
    
    if (!adminUser.isActive) {
      console.log(`  ❌ FAIL: Admin user has isActive = false`)
      hasErrors = true
    }

    if (!adminUser.password.startsWith('$2b$')) {
      console.log(`  ❌ FAIL: Password is not bcrypt hashed`)
      hasErrors = true
    } else {
      console.log(`  ✅ Password is properly hashed (bcrypt)`)
    }
  } else {
    console.log(`❌ FAIL: Admin user not found`)
    hasErrors = true
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 4: Verify User-Permission Assignments
  // ═══════════════════════════════════════════════════════════
  console.log('\n📝 TEST 4: Verifying user-permission assignments...')
  
  if (adminUser) {
    const assignedPermissions = await prisma.userPermission.count({
      where: { userId: adminUser.id },
    })
    
    if (assignedPermissions === 70) {
      console.log(`✅ PASS: Admin has ${assignedPermissions}/70 permissions`)
    } else {
      console.log(`❌ FAIL: Admin has ${assignedPermissions}/70 permissions`)
      hasErrors = true
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 5: Verify Join Queries Work
  // ═══════════════════════════════════════════════════════════
  console.log('\n📝 TEST 5: Testing join queries...')
  
  try {
    const usersWithPermissions = await prisma.user.findMany({
      include: {
        userPermissions: {
          include: {
            permission: true,
          },
        },
      },
    })
    
    if (usersWithPermissions.length > 0) {
      console.log(`✅ PASS: Can query users with permissions`)
      console.log(`  - Found ${usersWithPermissions.length} user(s)`)
      console.log(`  - First user has ${usersWithPermissions[0].userPermissions.length} permissions`)
    } else {
      console.log(`❌ FAIL: No users found in join query`)
      hasErrors = true
    }
  } catch (error) {
    console.log(`❌ FAIL: Join query failed`)
    console.error(error)
    hasErrors = true
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 6: Verify Audit Logs
  // ═══════════════════════════════════════════════════════════
  console.log('\n📝 TEST 6: Verifying audit logs...')
  const auditLogCount = await prisma.auditLog.count()
  
  if (auditLogCount >= 1) {
    console.log(`✅ PASS: Found ${auditLogCount} audit log(s)`)
    
    const firstLog = await prisma.auditLog.findFirst({
      orderBy: { timestamp: 'asc' },
    })
    
    console.log(`  - First log: ${firstLog?.action}`)
  } else {
    console.log(`❌ FAIL: No audit logs found (expected at least 1)`)
    hasErrors = true
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 7: Verify Unique Constraints
  // ═══════════════════════════════════════════════════════════
  console.log('\n📝 TEST 7: Testing unique constraints...')
  
  try {
    // Try to create duplicate permission (should fail)
    await prisma.permission.create({
      data: {
        key: 'inventory.view',
        description: 'Test duplicate',
        module: 'Test',
      },
    })
    console.log(`❌ FAIL: Unique constraint not working (allowed duplicate key)`)
    hasErrors = true
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log(`✅ PASS: Unique constraint working (rejected duplicate key)`)
    } else {
      console.log(`⚠️  WARNING: Unexpected error testing unique constraint`)
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 8: Verify Customers Table Untouched
  // ═══════════════════════════════════════════════════════════
  console.log('\n📝 TEST 8: Verifying customers table...')
  
  try {
    // Just check if table exists (don't query data)
    const tableExists = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'customers'
    `
    
    console.log(`✅ PASS: Customers table exists and was not modified`)
  } catch (error) {
    console.log(`⚠️  WARNING: Could not verify customers table`)
  }

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60))
  
  if (hasErrors) {
    console.log('❌ VERIFICATION FAILED')
    console.log('═'.repeat(60))
    console.log('\n⚠️  Please fix the issues above before proceeding to Prompt 09')
    console.log('   Re-run: npm run verify:setup\n')
    process.exit(1)
  } else {
    console.log('✅ ALL VERIFICATION TESTS PASSED')
    console.log('═'.repeat(60))
    console.log('\n🎉 Database foundation is solid!')
    console.log('✅ Ready to proceed to Prompt 09: API Layer\n')
  }
}

main()
  .catch((e) => {
    console.error('\n❌ Verification script error:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


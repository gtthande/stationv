/**
 * Script to load inventory views into the database
 * Run with: npx tsx scripts/load-inventory-views.ts
 */

import { prisma } from '../lib/prisma';
import { readFileSync } from 'fs';
import { join } from 'path';

async function loadViews() {
  try {
    console.log('Loading inventory views...');
    
    // Read the SQL file
    const sqlPath = join(process.cwd(), 'sql', 'inventory_views.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    
    // Remove comments and split into statements
    const statements = sql
      .split('\n')
      .map(line => {
        // Remove full-line comments
        if (line.trim().startsWith('--')) {
          return '';
        }
        // Remove inline comments (but preserve -- in strings would be complex, so we'll be careful)
        const commentIndex = line.indexOf('--');
        if (commentIndex > 0 && !line.substring(0, commentIndex).includes("'")) {
          return line.substring(0, commentIndex).trim();
        }
        return line;
      })
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'; // Add semicolon back
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      try {
        await prisma.$executeRawUnsafe(statement);
        console.log(`✓ Statement ${i + 1} executed successfully`);
      } catch (error: any) {
        // Ignore "view doesn't exist" errors for DROP VIEW statements
        if ((error.message?.includes("doesn't exist") || 
             error.message?.includes("Unknown table") ||
             error.code === 'P2010') && 
            statement.toUpperCase().includes('DROP VIEW')) {
          console.log(`⚠ View doesn't exist (expected for first run): ${statement.substring(0, 60)}...`);
        } else {
          console.error(`✗ Error executing statement ${i + 1}:`, error.message);
          console.error(`Statement was: ${statement.substring(0, 200)}...`);
          throw error;
        }
      }
    }
    
    console.log('\n✅ All views loaded successfully!');
    
    // Verify views exist
    const views = await prisma.$queryRaw<Array<{ TABLE_NAME: string }>>`
      SELECT TABLE_NAME 
      FROM information_schema.VIEWS 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('vw_inventory_list', 'vw_stock_card_batches')
    `;
    
    console.log('\n📊 Verification:');
    console.log(`Found ${views.length} views:`);
    views.forEach(v => console.log(`  - ${v.TABLE_NAME}`));
    
  } catch (error: any) {
    console.error('❌ Error loading views:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

loadViews();


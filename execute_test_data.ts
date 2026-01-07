/**
 * Test Data Execution Script
 * 
 * Executes SQL test data files in the correct order.
 * This is a TEMPORARY execution script - not part of the application.
 * 
 * Uses mysql2 directly to support MySQL variables and multi-statement execution.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import * as mysql from 'mysql2/promise';
import { config } from 'dotenv';

// Load .env file from project root
config({ path: join(process.cwd(), '.env') });

// Parse DATABASE_URL: mysql://user:password@host:port/database
// Handles empty passwords: mysql://root:@localhost:3306/stationv
function parseDatabaseUrl(url: string) {
  // Try with password first: mysql://user:password@host:port/database
  let match = url.match(/mysql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/(.+)/);
  if (match) {
    return {
      user: match[1],
      password: match[2] || '', // Empty password is allowed
      host: match[3],
      port: parseInt(match[4]),
      database: match[5],
    };
  }
  // Try without password: mysql://user@host:port/database (not standard but handle it)
  match = url.match(/mysql:\/\/([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (match) {
    return {
      user: match[1],
      password: '',
      host: match[2],
      port: parseInt(match[3]),
      database: match[4],
    };
  }
  throw new Error(`Invalid DATABASE_URL format: ${url}`);
}

const SQL_FILES = [
  '01_quarantine_test.sql',
  '02_wip_test.sql',
  '03_out_test.sql',
  '04_withheld_test.sql',
  '05_validation.sql',
];

async function executeSQLFile(connection: mysql.Connection, fileName: string): Promise<void> {
  const filePath = join(process.cwd(), 'sql', 'test_data', fileName);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Executing: ${fileName}`);
  console.log('='.repeat(60));
  
  try {
    const sql = readFileSync(filePath, 'utf-8');
    
    // Execute as multi-statement query to preserve MySQL variables
    const [results] = await connection.query(sql);
    
    // For validation file, show results
    if (fileName === '05_validation.sql') {
      console.log('\nValidation Results:');
      if (Array.isArray(results) && results.length > 0) {
        // Results may be an array of result sets
        results.forEach((resultSet: any, index: number) => {
          if (Array.isArray(resultSet) && resultSet.length > 0) {
            console.log(`\nResult Set ${index + 1}:`);
            console.table(resultSet.slice(0, 10)); // Show first 10 rows
            if (resultSet.length > 10) {
              console.log(`... and ${resultSet.length - 10} more rows`);
            }
          }
        });
      }
    }
    
    console.log(`✓ ${fileName} executed successfully`);
  } catch (error: any) {
    console.error(`✗ Error executing ${fileName}:`);
    console.error(error.message);
    if (error.sql) {
      console.error('SQL:', error.sql.substring(0, 200));
    }
    // Continue with next file even if one fails
  }
}

async function main() {
  let databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn('Warning: DATABASE_URL not found in .env file');
    console.warn('Attempting default connection: mysql://root:@localhost:3306/stationv');
    console.warn('If this fails, please create .env file with: DATABASE_URL="mysql://user:password@localhost:3306/stationv"');
    databaseUrl = 'mysql://root:@localhost:3306/stationv';
  }

  console.log('Starting test data execution...');
  const dbConfig = parseDatabaseUrl(databaseUrl);
  console.log(`Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
  
  let connection: mysql.Connection | null = null;
  
  try {
    // Create connection with multipleStatements enabled
    connection = await mysql.createConnection({
      ...dbConfig,
      multipleStatements: true,
    });
    
    for (const file of SQL_FILES) {
      await executeSQLFile(connection, file);
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('Test data execution complete!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Review validation results above');
    console.log('2. Check Inventory UI to verify all states display');
    console.log('3. Verify stock cards show correct breakdowns');
  } catch (error: any) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();


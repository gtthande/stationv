# Prompt 05: Run Database Migration

## Objective
Create the 4 database tables (users, permissions, user_permissions, audit_logs) by running a Prisma migration.

## Task
Execute Prisma migration commands to materialize the schema into actual database tables.

## Prerequisites
- ✅ Prompt 01 completed (Guardrails)
- ✅ Prompt 02 completed (Database connection)
- ✅ Prompt 03 completed (Schema defined)
- ✅ Prompt 04 completed (Prisma client singleton created)
- ✅ MySQL is running (XAMPP)

## Instructions

### Step 1: Generate Prisma Client

First, generate the Prisma Client from your schema:

```bash
npx prisma generate
```

**What this does:**
- Reads `prisma/schema.prisma`
- Generates TypeScript types
- Creates Prisma Client methods
- Installs to `node_modules/@prisma/client`

**Expected output:**
```
✔ Generated Prisma Client (4.x.x) to ./node_modules/@prisma/client
```

### Step 2: Create and Run Migration

Now create the database tables:

```bash
npx prisma migrate dev --name admin_rbac_init
```

**What this does:**
- Creates SQL migration file in `prisma/migrations/`
- Runs the migration against your database
- Creates 4 new tables
- Updates `_prisma_migrations` table (Prisma's internal tracking)

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": MySQL database "stationv" at "localhost:3306"

Applying migration `20250101000000_admin_rbac_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20250101000000_admin_rbac_init/
    └─ migration.sql

Your database is now in sync with your schema.
```

### Step 3: Verify Tables in phpMyAdmin

Open phpMyAdmin and check the `stationv` database:

**Expected tables:**
- ✅ `audit_logs` (new)
- ✅ `customers` (existing - unchanged)
- ✅ `permissions` (new)
- ✅ `users` (new)
- ✅ `user_permissions` (new)
- ✅ `_prisma_migrations` (Prisma internal tracking)

### Step 4: Verify Table Structure

Click on each new table and verify columns:

**users table should have:**
- id (varchar, primary key)
- name (varchar)
- email (varchar, unique)
- password (varchar)
- isActive (tinyint)
- isAdmin (tinyint)
- lastLogin (datetime, nullable)
- createdAt (datetime)
- updatedAt (datetime)
- createdBy (varchar, nullable)

**permissions table should have:**
- id (varchar, primary key)
- key (varchar, unique)
- description (varchar)
- module (varchar)
- category (varchar, nullable)
- isActive (tinyint)
- createdAt (datetime)

**user_permissions table should have:**
- id (varchar, primary key)
- userId (varchar, foreign key → users.id)
- permissionId (varchar, foreign key → permissions.id)
- grantedBy (varchar, nullable)
- grantedAt (datetime)
- UNIQUE constraint on (userId, permissionId)

**audit_logs table should have:**
- id (varchar, primary key)
- userId (varchar, nullable, foreign key → users.id)
- action (varchar)
- module (varchar)
- details (json, nullable)
- ipAddress (varchar, nullable)
- userAgent (varchar, nullable)
- timestamp (datetime)

## Alternative: Use Prisma Studio

Instead of phpMyAdmin, you can use Prisma Studio:

```bash
npx prisma studio
```

This opens a web UI at `http://localhost:5555` where you can:
- View all tables
- See table structures
- Browse data (empty for now)

## Troubleshooting

### Error: "Database does not exist"

**Solution:**
```sql
-- Run in phpMyAdmin
CREATE DATABASE stationv;
```

### Error: "Can't reach database server"

**Check:**
- XAMPP MySQL is running
- Port 3306 is correct
- Credentials in .env are correct

### Error: "Table already exists"

If you ran migrations before:

**Option 1 - Reset (WARNING: Deletes all data)**
```bash
npx prisma migrate reset
```

**Option 2 - Continue with existing tables**
```bash
npx prisma migrate resolve --applied "20250101000000_admin_rbac_init"
```

### Error: "Customers table will be dropped"

**This should NOT happen** if schema is correct.

**Check:** Verify `prisma/schema.prisma` does NOT include a `Customer` model.

## Verification Checklist

- [ ] `npx prisma generate` succeeded
- [ ] `npx prisma migrate dev --name admin_rbac_init` succeeded
- [ ] Migration file created in `prisma/migrations/`
- [ ] 4 new tables exist in database
- [ ] `customers` table still exists (unchanged)
- [ ] Table structures match schema
- [ ] Foreign keys are set up correctly
- [ ] Indexes are created

## Expected File Structure

```
stationv/
├── .env
├── lib/
│   └── prisma.ts
├── node_modules/
│   └── @prisma/
│       └── client/           ← Generated Prisma Client
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       └── 20250101000000_admin_rbac_init/    ← New migration
│           └── migration.sql
└── ...
```

## Database State

**Before Prompt 05:**
- `stationv` database exists
- Only `customers` table

**After Prompt 05:**
- ✅ 4 new tables created
- ✅ `customers` unchanged
- ✅ All foreign keys set up
- ✅ All indexes created
- ✅ Ready for seed data

---

**Next Step:** Prompt 06 - Seed Permissions

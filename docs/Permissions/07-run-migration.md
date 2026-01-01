# Prompt 07: Run Prisma Migration

## Objective
Apply the Prisma schema to the MySQL database by running a migration.

## Task
Execute the Prisma migration command to create the new tables in the `stationv` database.

## Commands to Run

```bash
# Generate Prisma Client (updates TypeScript types)
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name init
```

## What This Does

1. **Creates Migration Files**: Generates SQL migration files in `prisma/migrations/`
2. **Creates Tables**: Executes SQL to create these tables:
   - `users`
   - `permissions`
   - `user_permissions`
   - `audit_logs`
3. **Updates Prisma Client**: Regenerates the TypeScript client with new models

## Expected Output

You should see output like:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": MySQL database "stationv" at "localhost:3306"

MySQL database stationv created at localhost:3306

Applying migration `20250101000000_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20250101000000_init/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (4.x.x) to ./node_modules/@prisma/client
```

## Verify in phpMyAdmin

After migration, check phpMyAdmin:
- ✅ `users` table exists with correct columns
- ✅ `permissions` table exists
- ✅ `user_permissions` table exists
- ✅ `audit_logs` table exists
- ✅ `customers` table still exists (untouched)
- ✅ All foreign keys are properly set up

## Verify with Prisma Studio

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can browse the tables.

## Important Notes

- ✅ The `customers` table will NOT be affected
- ✅ Only new tables are created
- ✅ This is a **development** migration (safe to re-run in dev)
- ⚠️ In production, you'd use `npx prisma migrate deploy`

## Troubleshooting

**Error: "Database does not exist"**
```bash
# Create the database first
npx prisma db push --accept-data-loss
```

**Error: "Connection refused"**
- Check MySQL is running
- Verify credentials in .env
- Check port 3306 is correct

**Want to reset and start over?**
```bash
# WARNING: Deletes all data!
npx prisma migrate reset
```

## Reference
- Prisma Migrations: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Dev Profile: Database management best practices

---
**Next Step**: Prompt 08 - Create seed script with all permissions

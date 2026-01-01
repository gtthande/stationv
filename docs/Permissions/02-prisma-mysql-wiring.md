# Prompt 02: Prisma + MySQL Wiring

## Objective
Safely connect to the existing MySQL database without making any schema changes.

## Task
Configure Prisma to connect to the `stationv` database in XAMPP MySQL.

## Prerequisites
- ✅ Prompt 01 completed (Project guardrails established)
- ✅ MySQL running via XAMPP
- ✅ Database `stationv` exists

## Instructions for Cursor

### Step 1: Create .env File

Create a `.env` file in the project root:

```env
# Database Connection
DATABASE_URL="mysql://root:@localhost:3306/stationv"

# Note: Update credentials if your MySQL has a password
# Format: mysql://USERNAME:PASSWORD@localhost:3306/stationv
```

**Important:**
- If MySQL has a password, update `root:` to `root:yourpassword`
- Port `3306` is the default MySQL port
- Database name is `stationv` (must match existing database)

### Step 2: Create Prisma Configuration

Create `prisma/schema.prisma`:

```prisma
// Prisma Schema for Station-2100
// Phase 1: Admin & Permissions System

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Models will be added in Prompt 03
```

### Step 3: Verify Connection

Do NOT run any migrations yet. Just verify the configuration is correct.

If needed, test the connection with:
```bash
npx prisma db pull --force
```

This will show if Prisma can connect (it will see the `customers` table).

**Do NOT keep the pulled schema** - we'll define our own in Prompt 03.

## Verification Checklist

- [ ] `.env` file exists in project root
- [ ] `DATABASE_URL` points to `stationv` database
- [ ] `prisma/schema.prisma` exists with datasource configured
- [ ] Prisma can connect to database (run `npx prisma db pull` to test)
- [ ] No migrations have been run yet
- [ ] No models defined yet (only generator and datasource)

## Expected File Structure

```
stationv/
├── .env                    ← New (DATABASE_URL)
├── prisma/
│   └── schema.prisma       ← New (generator + datasource only)
├── package.json
└── ... (other project files)
```

## Troubleshooting

**Error: "Can't reach database server"**
- Check MySQL is running in XAMPP
- Verify credentials in .env
- Check port is 3306

**Error: "Database stationv does not exist"**
- Create database in phpMyAdmin first
- Or run: `CREATE DATABASE stationv;` in MySQL

**Error: "Access denied"**
- Check username/password in .env
- Default XAMPP MySQL: username `root`, no password

---

**Next Step:** Prompt 03 - Prisma Schema (Models Only)

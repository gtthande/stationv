# Prompt 02: Prisma Schema Setup

## Objective
Set up the Prisma schema file with the correct generator and datasource configuration.

## Task
Create or update `prisma/schema.prisma` with the basic configuration for MySQL connection.

## Requirements

1. **File Location**: `prisma/schema.prisma`
2. **Configuration**:
   - Prisma Client generator
   - MySQL datasource using environment variable

## Implementation

```prisma
// Prisma Schema for Station-2100
// Generator configuration
generator client {
  provider = "prisma-client-js"
}

// Database configuration
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Models will be added in subsequent prompts
```

## Important Notes

- The `datasource db` points to the `stationv` MySQL database via `DATABASE_URL`
- The generator will create the Prisma Client for TypeScript
- Do NOT alter existing tables (e.g., `customers`)
- Follow the dev profile coding style for consistency

## Verification

After creating the file:
```bash
# Generate Prisma Client (should succeed)
npx prisma generate

# Pull existing schema to verify connection
npx prisma db pull
```

## Reference
- Prisma Docs: https://www.prisma.io/docs/concepts/components/prisma-schema
- Dev Profile: Naming conventions and file structure

---
**Next Step**: Prompt 03 - Add User model

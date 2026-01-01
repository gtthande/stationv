# Prompt 04: Prisma Client Singleton

## Objective
Create a properly configured Prisma client singleton to prevent connection leaks and enable proper caching in development.

## Task
Create `lib/prisma.ts` with a singleton pattern for Prisma Client.

## Prerequisites
- ✅ Prompt 01 completed (Guardrails)
- ✅ Prompt 02 completed (Prisma configured)
- ✅ Prompt 03 completed (Schema defined)

## Instructions for Cursor

### Create lib/prisma.ts

```typescript
import { PrismaClient } from '@prisma/client'

declare global {
  // Allow global `var` for Prisma caching in development
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
```

## Why This Pattern?

### Problem It Solves

In Next.js development with Hot Module Replacement (HMR):
- Every code change reloads modules
- Without singleton: Creates new Prisma Client each time
- Result: Connection pool exhaustion, warnings like "Already 10 Prisma Clients active"

### Solution

**Development:**
- Store Prisma Client in `global.prisma`
- Reuse same instance across HMR reloads
- Prevents connection leaks

**Production:**
- Create new instance (no HMR in production)
- Clean connection handling

### Logging Configuration

```typescript
log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
```

**Development:** Shows errors and warnings (helpful for debugging)
**Production:** Only shows errors (less noise)

You can add more logging if needed:
- `'query'` - Show all SQL queries (verbose!)
- `'info'` - Show connection info
- `'warn'` - Show warnings
- `'error'` - Show errors

## File Location

Create the file at:
```
lib/prisma.ts
```

If the `lib` directory doesn't exist, create it first.

## Usage Example

Other files will import this singleton:

```typescript
import { prisma } from '@/lib/prisma'

// Now use prisma safely
const users = await prisma.user.findMany()
```

## Important Notes

### Do NOT Do This (Anti-Pattern)

```typescript
// ❌ BAD - Creates new client every time
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default prisma
```

### Do This (Correct Pattern)

```typescript
// ✅ GOOD - Singleton with global caching
import { prisma } from '@/lib/prisma'
```

## Verification Checklist

- [ ] `lib/` directory exists
- [ ] `lib/prisma.ts` file created
- [ ] Singleton pattern implemented correctly
- [ ] Global variable declared for TypeScript
- [ ] Logging configured
- [ ] No syntax errors
- [ ] File saved

## Expected File Structure

```
stationv/
├── .env
├── lib/
│   └── prisma.ts           ← New (Prisma client singleton)
├── prisma/
│   └── schema.prisma
├── package.json
└── ...
```

## Next Steps Preparation

This singleton will be used:
- ✅ In Prompt 05 (Migration - to verify connection)
- ✅ In Prompt 06 (Seed - to insert data)
- ✅ In Prompt 09+ (API routes - to query data)

---

**Next Step:** Prompt 05 - Run Migration

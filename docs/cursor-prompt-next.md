# Cursor Prompt: Next Development Cycle

## Current State Summary

**Project**: Station-2100 Aviation Maintenance System
**Workflow**: Cubic Matrix v5 (Architecture → Plan → Code → Test → Handoff → Cursor Prompt)
**Phase Completed**: Dev Mode Setup

### What's Been Implemented

1. **Prisma Schema** (`prisma/schema.prisma`)
   - Complete database schema converted from SQL
   - All tables, relationships, and enums defined
   - Ready for migration

2. **Database Connection** (`lib/db.ts`)
   - Singleton Prisma client
   - Development logging configured

3. **RBAC System** (`lib/rbac.ts`)
   - `can()` function for permission checking
   - `getUserPermissions()` for getting all user permissions
   - `canAny()` and `canAll()` for multiple permission checks
   - `getUserRoles()` for role retrieval
   - Full error handling

4. **Test Infrastructure**
   - Jest configuration with Next.js support
   - RBAC test suite
   - Coverage thresholds defined

5. **Configuration**
   - TypeScript path aliases configured
   - Package.json scripts added
   - Gitignore updated

### Current Project State

- ✅ Project skeleton with Next.js 14 App Router
- ✅ TypeScript types defined (`lib/types.ts`)
- ✅ MySQL schema defined (`sql/schema.sql`)
- ✅ Prisma schema created (`prisma/schema.prisma`)
- ✅ Database connection utility (`lib/db.ts`)
- ✅ RBAC helper functions (`lib/rbac.ts`)
- ✅ Test infrastructure set up
- ⏳ Database connection (requires MySQL setup)
- ⏳ NextAuth.js authentication (not configured)
- ⏳ Service layer (not implemented)
- ⏳ API routes (not implemented)
- ⏳ UI components (placeholders only)

## Next Priority: Database Setup & Authentication

### Task 1: Database Setup (HIGH PRIORITY)

**Objective**: Set up MySQL database and generate Prisma client

**Steps**:
1. Create MySQL database `station2100_dev`
2. Configure `.env` file with `DATABASE_URL`
3. Run `npm run db:generate` to generate Prisma client
4. Run `npm run db:push` to push schema to database
5. Create seed script for initial data (roles, permissions, admin user)

**Acceptance Criteria**:
- [ ] Database connection successful
- [ ] Prisma client generated without errors
- [ ] Schema pushed to database
- [ ] Initial roles and permissions seeded
- [ ] Admin user created for testing

**Files to Create/Modify**:
- `prisma/seed.ts` - Database seeding script
- `.env` - Environment variables (if not exists)
- `package.json` - Add seed script

**Context**:
- Prisma schema is ready in `prisma/schema.prisma`
- Database connection utility ready in `lib/db.ts`
- SQL schema reference: `sql/schema.sql`

### Task 2: NextAuth.js Configuration (HIGH PRIORITY)

**Objective**: Set up authentication with NextAuth.js

**Steps**:
1. Create NextAuth configuration file
2. Set up credentials provider
3. Create login page
4. Add session provider to root layout
5. Create middleware for route protection
6. Add session checks to dashboard routes

**Acceptance Criteria**:
- [ ] Users can log in with username/password
- [ ] Sessions persist correctly
- [ ] Protected routes redirect to login
- [ ] Session data accessible in components
- [ ] Logout functionality works

**Files to Create**:
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API route
- `app/login/page.tsx` - Login page
- `lib/auth.ts` - Auth configuration
- `middleware.ts` - Route protection middleware

**Context**:
- NextAuth.js 4.22.0 already installed
- RBAC helpers ready in `lib/rbac.ts`
- Dashboard layout exists in `app/(dashboard)/layout.tsx`

### Task 3: Service Layer Foundation (MEDIUM PRIORITY)

**Objective**: Create base service utilities and first service implementation

**Steps**:
1. Create `lib/services/` directory structure
2. Create base service class/utilities
3. Implement inventory service with RBAC checks
4. Add error handling and validation
5. Create service tests

**Acceptance Criteria**:
- [ ] Base service utilities created
- [ ] Inventory service implemented
- [ ] RBAC checks integrated
- [ ] Error handling works
- [ ] Service tests pass

**Files to Create**:
- `lib/services/base.ts` - Base service utilities
- `lib/services/inventory.service.ts` - Inventory service
- `lib/services/__tests__/inventory.service.test.ts` - Service tests

**Context**:
- RBAC helpers available in `lib/rbac.ts`
- Prisma client available via `lib/db.ts`
- Types defined in `lib/types.ts`

## Implementation Guidelines

### Follow Cubic Matrix v5 Workflow

1. **Architecture**: Review requirements and current state
2. **Plan**: Break down tasks, define acceptance criteria
3. **Code**: Implement following best practices
4. **Test**: Write tests for new code
5. **Handoff**: Document what was done
6. **Cursor Prompt**: Generate next cycle prompt

### Code Quality Standards

- ✅ TypeScript strict mode
- ✅ Error handling for all database operations
- ✅ RBAC checks on all data access
- ✅ Type safety maintained
- ✅ Code documentation (JSDoc comments)
- ✅ Test coverage > 70%

### Database Considerations

- Use Prisma migrations for schema changes
- Seed script for initial data
- Test database for integration tests
- Transaction support for complex operations

### Authentication Considerations

- Password hashing (bcrypt)
- Session management
- CSRF protection
- Secure cookie settings
- Role-based route protection

## Relevant Code References

### Database
- Schema: `prisma/schema.prisma`
- Connection: `lib/db.ts`
- Types: `lib/types.ts`

### RBAC
- Helpers: `lib/rbac.ts`
- Tests: `lib/__tests__/rbac.test.ts`

### Project Structure
- Architecture: `docs/architecture.md`
- Workflow: `docs/cubic-matrix-v5-workflow.md`
- Plan: `docs/dev-mode-plan.md`

## Environment Setup

Before starting, ensure:
1. MySQL server is running
2. Database `station2100_dev` exists (or create it)
3. `.env` file configured with `DATABASE_URL`
4. Dependencies installed: `npm install`

## Success Criteria

After completing the next cycle:
- ✅ Database connected and Prisma client generated
- ✅ Users can authenticate
- ✅ Sessions work correctly
- ✅ Protected routes enforce authentication
- ✅ RBAC integrated with authentication
- ✅ Service layer foundation ready

---

**Ready to proceed with**: Database Setup & NextAuth.js Configuration
**Workflow**: Continue following Cubic Matrix v5 methodology
**Priority**: Correctness over speed


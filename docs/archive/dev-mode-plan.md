# Station-2100 Development Mode Plan

## Phase 1: UI Scaffolding ✅ (Current)

**Current Phase:** UI-first dashboard scaffold with dummy data. All charts and module pages display static placeholder data.

### Current Architecture State

**Frontend Layer**:
- Next.js 14 App Router with route groups
- React 18 with TypeScript
- Tailwind CSS for styling
- shadcn UI components (installed, not configured)
- Dashboard layout with sidebar navigation
- **All data is placeholder/mocked** - charts and components use static dummy data

**Data Layer**:
- MySQL schema defined in `sql/schema.sql`
- TypeScript interfaces in `lib/types.ts`
- Prisma installed but not configured
- No database connection established

**Security Layer**:
- NextAuth.js installed but not configured
- RBAC tables defined in schema
- No permission checking implemented

**Service Layer**:
- Not implemented
- No API routes or server actions
- No business logic layer

### Architecture Requirements

1. **Database Connection**: MySQL via Prisma
2. **Authentication**: NextAuth.js with credentials provider
3. **RBAC**: Permission-based access control with `can()` helper
4. **Service Layer**: Data services wrapping Prisma with RBAC checks
5. **API Layer**: Next.js API routes or server actions
6. **UI Layer**: React components with proper state management

## Phase 2: Plan

### Task Breakdown

#### 2.1 Database Setup (Priority: HIGH)
- [ ] Create Prisma schema from SQL schema
- [ ] Configure database connection
- [ ] Generate Prisma client
- [ ] Run initial migrations
- [ ] Seed initial data (roles, permissions, admin user)

**Acceptance Criteria**:
- Prisma schema matches SQL schema
- Database connection successful
- Prisma client generates correctly
- Migrations run without errors

#### 2.2 Authentication Setup (Priority: HIGH)
- [ ] Configure NextAuth.js
- [ ] Create credentials provider
- [ ] Set up session management
- [ ] Create login page
- [ ] Add session checks to dashboard routes

**Acceptance Criteria**:
- Users can log in with credentials
- Sessions persist correctly
- Protected routes redirect to login
- Session data accessible in components

#### 2.3 RBAC Implementation (Priority: HIGH)
- [ ] Create `can()` helper function
- [ ] Implement permission checking logic
- [ ] Create middleware for route protection
- [ ] Add permission checks to services

**Acceptance Criteria**:
- `can(userId, permission)` works correctly
- Permissions computed from user roles
- Middleware blocks unauthorized access
- Services enforce RBAC

#### 2.4 Service Layer (Priority: MEDIUM)
- [ ] Create base service class/utilities
- [ ] Implement inventory service
- [ ] Implement job card service
- [ ] Implement user/role service
- [ ] Add RBAC checks to all services

**Acceptance Criteria**:
- Services wrap Prisma calls
- All services check permissions
- Error handling implemented
- Type-safe service methods

#### 2.5 API Layer (Priority: MEDIUM)
- [ ] Create API route structure
- [ ] Implement inventory endpoints
- [ ] Implement job card endpoints
- [ ] Add request validation
- [ ] Add error responses

**Acceptance Criteria**:
- API routes follow REST conventions
- Request validation works
- Proper HTTP status codes
- Error messages are clear

#### 2.6 UI Components (Priority: MEDIUM)
- [ ] Configure shadcn UI
- [ ] Create form components
- [ ] Create table components
- [ ] Create modal components
- [ ] Implement inventory UI
- [ ] Implement job card UI

**Acceptance Criteria**:
- Components are reusable
- Forms validate input
- Tables are sortable/filterable
- Modals work correctly
- UI matches design requirements

#### 2.7 Testing (Priority: MEDIUM)
- [ ] Set up test framework (Jest/Vitest)
- [ ] Create test utilities
- [ ] Write service unit tests
- [ ] Write RBAC tests
- [ ] Write component tests
- [ ] Write E2E tests for workflows

**Acceptance Criteria**:
- Test coverage > 70%
- All critical paths tested
- RBAC tests pass
- E2E tests cover main workflows

### Dependencies

```
Database Setup
  └─> Authentication Setup
       └─> RBAC Implementation
            └─> Service Layer
                 └─> API Layer
                      └─> UI Components
                           └─> Testing
```

### Risk Assessment

**High Risk**:
- Database connection issues
- Prisma schema migration complexity
- RBAC permission logic correctness

**Medium Risk**:
- NextAuth.js configuration
- Service layer performance
- UI component complexity

**Low Risk**:
- TypeScript type safety
- Tailwind CSS styling
- Component reusability

## Phase 3: Code (Implementation Plan)

### Step 1: Prisma Setup
1. Convert SQL schema to Prisma schema
2. Add database URL to environment variables
3. Generate Prisma client
4. Create migration scripts
5. Seed initial data

### Step 2: Authentication
1. Configure NextAuth.js
2. Create auth API route
3. Create login page
4. Add session provider
5. Protect dashboard routes

### Step 3: RBAC
1. Create `lib/rbac.ts` with `can()` function
2. Create permission checking utilities
3. Add RBAC middleware
4. Test permission logic

### Step 4: Services
1. Create `lib/services/` directory
2. Implement base service utilities
3. Create inventory service
4. Create job card service
5. Add RBAC checks

### Step 5: API Routes
1. Create `app/api/` structure
2. Implement inventory endpoints
3. Implement job card endpoints
4. Add validation middleware

### Step 6: UI Components
1. Configure shadcn UI
2. Create shared components
3. Build inventory pages
4. Build job card pages

## Phase 4: Test Plan

### Unit Tests
- Service methods
- RBAC helper functions
- Utility functions
- Type conversions

### Integration Tests
- API endpoints
- Database operations
- Authentication flow
- Permission checks

### Component Tests
- Form validation
- Table rendering
- Modal interactions
- Navigation

### E2E Tests
- User login flow
- Inventory receiving workflow
- Job card creation workflow
- Permission-based access

## Phase 5: Handoff Checklist

- [ ] Implementation summary written
- [ ] Configuration documented
- [ ] Environment variables documented
- [ ] API documentation updated
- [ ] Known issues listed
- [ ] Next steps identified

## Phase 6: Cursor Prompt Template

```
Continue development of Station-2100 following Cubic Matrix v5 workflow.

Current State:
- [Summary of what's been implemented]
- [Current phase and progress]

Next Priority:
- [Specific task to work on]

Context:
- [Relevant code references]
- [Important decisions made]

Acceptance Criteria:
- [What needs to be true for this to be complete]
```




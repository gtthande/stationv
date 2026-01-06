# Station‑2100 Architecture

This document provides a high‑level overview of the Station‑2100 architecture and current implementation status.

## Current Phase: Core Reference Data Stable

**Status:** Core reference data modules are complete and stable. Database, API routes, and service layers are implemented for Suppliers, Customers, and Warehouses. These modules form the foundation for future inventory and operational modules.

### What's Implemented

- ✅ **Frontend UI** – Next.js 14 App Router with React 18, Tailwind CSS, and shadcn UI
- ✅ **Dashboard Layout** – AppShell with Sidebar and Topbar components
- ✅ **Database** – MySQL connected with Prisma ORM, schema applied
- ✅ **API Routes** – RESTful API endpoints implemented for Suppliers, Customers, Warehouses
- ✅ **Service Layer** – Business logic with RBAC checks for Suppliers, Customers, Warehouses
- ✅ **RBAC Integration** – Permission checks enforced at service layer
- ✅ **Core Reference Modules** – Suppliers, Customers, Warehouses (complete and stable)
- ✅ **Theme System** – Light/dark mode toggle using next-themes
- ✅ **Component Library** – Card, Button, chart components, and form components
- ⏳ **Authentication** – NextAuth.js integration (planned)
- ⏳ **Operational Modules** – Inventory, Job Cards, Rotables, Tools (planned)

## Architecture Layers

### Frontend (Current)

- **App Router Structure:**
  - `app/layout.tsx` – Root layout with global CSS and ThemeProvider
  - `app/dashboard/layout.tsx` – Dashboard layout with AppShell
  - `app/dashboard/page.tsx` – Main dashboard with KPI cards and module summaries
  - Module pages under `app/dashboard/*/page.tsx`

- **Components:**
  - `components/layout/` – AppShell, Sidebar, Topbar, ThemeToggle
  - `components/charts/` – InventoryLine, InventoryPie, ModuleBar, ModuleLine, ModulePie
  - `components/dashboard/` – SummaryCard
  - `components/ui/` – Card, Button (shadcn-style)

- **Styling:**
  - Tailwind CSS with custom color palette
  - CSS variables for theme tokens
  - Responsive design with mobile-first approach

### Backend (Implemented)

- **API / Services** – Next.js API routes with Server Actions pattern
- **Database** – MySQL with Prisma ORM (connected and operational)
- **Service Layer** – Business logic with RBAC checks (`lib/services/`)
- **RBAC** – Permission checks enforced at service layer (`lib/rbac.ts`)
- **Authentication** – NextAuth.js (planned for future phase)

## Core Reference Modules

The foundation of Station-2100 consists of three stable reference data modules that are complete and production-ready:

### ✅ Suppliers Module
- **Status:** Complete and stable
- **Access:** Admin-only (permission: `admin.manage_suppliers`)
- **Features:** Full CRUD operations, active/inactive management
- **Usage:** Referenced by inventory batches and procurement workflows
- **Implementation:** Database schema, service layer, API routes, UI components, RBAC checks

### ✅ Customers Module
- **Status:** Complete and stable
- **Access:** Admin-only (permission: `admin.manage_customers`)
- **Features:** Full CRUD operations, imported historical data
- **Usage:** Referenced by job cards and billing workflows
- **Implementation:** Database schema, service layer, API routes, UI components, RBAC checks, data import completed

### ✅ Warehouses Module (Admin Reference Data)
- **Status:** Complete and stable
- **Access:** Admin-only (no granular permissions required)
- **Structure:** Simple (name + active flag only)
- **Seeded Defaults:**
  - Main Warehouse
  - Consumables
  - Owner Supplied
- **Usage:** Referenced by inventory only (not transactional)
- **Design Philosophy:** Intentionally minimal - 95% of installs never add more warehouses
- **Implementation:** Database schema, service layer, API routes, admin UI, seed script
- **Key Characteristics:**
  - **Reference data, not operational entities** - Warehouses are logical stock segregation points, not physical locations
  - **Admin-managed** - Only administrators can create or modify warehouses
  - **Designed for stability** - Core inventory logic assumes warehouses already exist
  - **Rarely changed** - Once configured, warehouses remain stable throughout system operation

## Operational Modules (Planned)

1. **Dashboard** – Overview with KPI cards and module summaries (UI scaffold complete)
2. **Inventory** – Stock tracking and batch management (planned - depends on reference data)
3. **Job Cards** – Work order management (planned - depends on Inventory)
4. **Rotables** – Serialized parts tracking (planned)
5. **Tools** – Tool inventory management (planned)
6. **Reports** – Analytics and reporting (planned)
7. **Admin** – User and role management (partial - users/permissions implemented)
   - **Settings** – System configuration (Admin sub-module, RBAC protected, planned)

## Development Plan

### Phase 1: UI-First (✅ Complete)
- Dashboard layout and navigation
- Module summary cards with charts
- Theme system
- Responsive design

### Phase 2: Database & Prisma (Next)
1. Set up MySQL database
2. Apply schema from `sql/schema.sql`
3. Connect Prisma client
4. Generate Prisma client

### Phase 3: Authentication (Future)
1. Set up NextAuth.js
2. Implement credentials provider
3. Add session middleware
4. Protect dashboard routes

### Phase 4: API & Services (✅ Core Reference Complete)
1. ✅ Create API routes for Suppliers module
2. ✅ Create API routes for Customers module
3. ✅ Create API routes for Warehouses module
4. ✅ Implement data services with Prisma (Suppliers, Customers, Warehouses)
5. ✅ Add RBAC checks using `lib/rbac.ts` (all reference modules)
6. ⏳ Implement for operational modules (Inventory, Job Cards, etc.)

### Phase 5: Forms & Interactions (✅ Core Reference Complete)
1. ✅ Build form components (Suppliers, Customers, Warehouses)
2. ✅ Implement CRUD operations (Suppliers, Customers, Warehouses)
3. ✅ Add validation (all reference modules)
4. ✅ Connect to API routes (all reference modules)
5. ✅ Import customer data (completed)
6. ⏳ Implement for operational modules

### Phase 6: Testing (Future)
1. Unit tests for services
2. Component tests
3. E2E tests for workflows

## File Structure

```
app/
  layout.tsx              # Root layout with global CSS
  page.tsx                # Landing page
  dashboard/
    layout.tsx            # Dashboard layout with AppShell
    page.tsx              # Main dashboard
    suppliers/
      page.tsx            # Suppliers page (complete implementation)
      _components/         # Suppliers UI components
    [module]/page.tsx     # Other module pages (placeholders)
  api/
    suppliers/            # Suppliers API routes (complete)
      route.ts            # GET (list), POST (create)
      [id]/route.ts       # GET, PATCH, DELETE

components/
  layout/                 # AppShell, Sidebar, Topbar, ThemeToggle
  charts/                 # Chart components (Recharts)
  dashboard/              # Dashboard-specific components
  ui/                     # Reusable UI components

lib/
  rbac.ts                 # RBAC types and helpers (used in Suppliers)
  types.ts                # TypeScript types
  ThemeProvider.tsx       # Theme context provider
  chartTheme.ts           # Chart styling configuration
  utils.ts                # Utility functions
  db.ts                   # Database client (connected for Suppliers)
  prisma.ts               # Prisma client singleton
  services/
    supplierService.ts    # Suppliers service layer with RBAC

prisma/
  schema.prisma           # Prisma schema (not yet connected)

sql/
  schema.sql              # MySQL schema definition
```

## Navigation Structure

The application uses a hierarchical navigation structure:

- **Top-level modules**: Dashboard, Inventory, Job Cards, Rotables, Tools, Suppliers, Customers, Reports, Admin
- **Admin sub-modules**: Users, Permissions, Audit Logs, **Warehouses**, **Settings**

**Note**: Warehouses and Settings are Admin configuration modules by design. They are accessed via the Admin navigation menu (`/admin/warehouses`), not as top-level operational modules. This reflects their role as system configuration features rather than day-to-day operational tools.

## Core Reference Data Architecture

### Design Principles

The core reference modules (Suppliers, Customers, Warehouses) form a stable foundation layer:

1. **Stability First** – These modules are complete and will not be modified during operational module development
2. **Reference Only** – They provide master data for transactional modules (Inventory, Job Cards)
3. **Admin-Controlled** – All reference data is managed by administrators
4. **Simple Structure** – Minimal complexity ensures reliability and maintainability

### Module Characteristics

**Suppliers:**
- Active CRUD operations
- Used across inventory & procurement
- Full traceability to batches and purchases

**Customers:**
- Imported and stable
- Used in job cards & billing
- Historical data preserved

**Warehouses:**
- Admin-only reference data (not operational entities)
- Simple structure (name, active)
- Seeded defaults (Main Warehouse, Consumables, Owner Supplied)
- Rarely changed (95% of installs never add more)
- Referenced by inventory only (not transactional)
- **Purpose:** Logical stock segregation, not physical locations
- **Design:** Intentionally minimal for stability and reliability
- **Assumption:** Core inventory logic assumes warehouses already exist

### Integration Pattern

Future operational modules will **reference** but **not modify** core reference data:

```
Reference Data Layer (Stable)
├── Suppliers (CRUD by Admin)
├── Customers (CRUD by Admin)
└── Warehouses (CRUD by Admin)

Operational Modules (Future)
├── Inventory → References: Suppliers, Warehouses
├── Job Cards → References: Customers, Suppliers
└── Rotables → References: Suppliers
```

This separation ensures reference data stability while allowing operational modules to evolve independently.

### Warehouses: Reference Data Design Principles

**Warehouses are reference data, not operational entities:**
- Warehouses represent logical stock segregation points, not physical locations
- They are used for organizing inventory batches and tracking stock by category
- The system assumes warehouses exist before inventory operations begin

**Warehouses are admin-managed:**
- Only administrators can create, modify, or deactivate warehouses
- No granular permissions required - admin access is sufficient
- Changes are infrequent and controlled

**Warehouses are designed to be stable:**
- Simple structure (name + active flag) ensures reliability
- Default warehouses cover 95% of use cases
- Core inventory logic assumes warehouses already exist
- No frequent changes expected during normal operations

**Core inventory logic assumes warehouses already exist:**
- When implementing inventory modules, warehouses are treated as pre-existing reference data
- Inventory batches reference warehouses via foreign keys
- No warehouse creation logic needed in inventory workflows
- Warehouse selection is a simple dropdown from existing records

## Important Notes

- **Do NOT run `npm run build`** during development. Use `npm run dev` only.
- All data is currently dummy/static data in components.
- No database connections are active.
- No authentication is required to access dashboard (will be added later).
- Work one module at a time when implementing backend features.
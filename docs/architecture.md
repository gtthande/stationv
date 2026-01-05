# Station‑2100 Architecture

This document provides a high‑level overview of the Station‑2100 architecture and current implementation status.

## Current Phase: UI-First Scaffold

**Status:** Dashboard UI is complete with placeholder/mocked data. Backend services, database, and authentication are not yet implemented. All data displayed in charts and components is static dummy data for UI demonstration purposes only.

### What's Implemented

- ✅ **Frontend UI** – Next.js 14 App Router with React 18, Tailwind CSS, and shadcn UI
- ✅ **Dashboard Layout** – AppShell with Sidebar and Topbar components
- ✅ **Module Pages** – All module routes exist with placeholder content
- ✅ **Charts** – Recharts integration for pie charts, line charts, and bar charts
- ✅ **Theme System** – Light/dark mode toggle using next-themes
- ✅ **Component Library** – Card, Button, and chart components
- ⏳ **Database** – Schema defined in `sql/schema.sql` and `prisma/schema.prisma`, but not connected
- ⏳ **API Routes** – Not implemented yet
- ⏳ **Authentication** – Not implemented yet
- ⏳ **RBAC** – Types and helpers exist in `lib/rbac.ts`, but not integrated

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

### Backend (Planned)

- **API / Services** – Will use Next.js API routes or Server Actions
- **Database** – MySQL with Prisma ORM
- **Authentication** – NextAuth.js
- **RBAC** – Role-based access control with permission checks

## Core Modules

Module implementation status:

1. **Dashboard** – Overview with KPI cards and module summaries (UI only, mocked data)
2. **Inventory** – Stock tracking and batch management (UI only, placeholder)
3. **Job Cards** – Work order management (UI only, placeholder)
4. **Rotables** – Serialized parts tracking (UI only, placeholder)
5. **Tools** – Tool inventory management (UI only, placeholder)
6. **Suppliers** – ✅ **COMPLETE** – Database, API routes, and Dashboard UI implemented
7. **Customers** – Customer management (UI only, placeholder)
8. **Reports** – Analytics and reporting (UI only, placeholder)
9. **Admin** – User and role management (partial - users/permissions implemented)
10. **Settings** – System configuration (UI only, placeholder)

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

### Phase 4: API & Services (In Progress)
1. ✅ Create API routes for Suppliers module
2. ✅ Implement data services with Prisma (Suppliers)
3. ✅ Add RBAC checks using `lib/rbac.ts` (Suppliers)
4. ⏳ Replace dummy data with real queries (other modules)

### Phase 5: Forms & Interactions (In Progress)
1. ✅ Build form components (Suppliers)
2. ✅ Implement CRUD operations (Suppliers)
3. ✅ Add validation (Suppliers)
4. ✅ Connect to API routes (Suppliers)
5. ⏳ Implement for other modules

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

## Important Notes

- **Do NOT run `npm run build`** during development. Use `npm run dev` only.
- All data is currently dummy/static data in components.
- No database connections are active.
- No authentication is required to access dashboard (will be added later).
- Work one module at a time when implementing backend features.
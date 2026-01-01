# Station-2100 Admin & Permissions System - Complete Implementation

## 🎯 OBJECTIVE
Build a complete user management and permissions system for Station-2100, an aviation maintenance & inventory management system. This is the foundation for the entire application - ALL future modules depend on this permissions layer.

---

## 📋 DEVELOPMENT GUIDELINES

### Follow This Development Profile
**Reference this profile for ALL coding decisions:**
https://github.com/gtthande/dev-profiles/blob/main/Dev_Profile_and_Cursor_Prompt_Pack.md

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS (modern, professional design)
- **Backend**: Next.js API Routes
- **Database**: MySQL (`stationv` database - already exists)
- **ORM**: Prisma Client
- **Auth**: bcrypt for password hashing
- **UI Components**: Custom components with Tailwind (clean, aviation-industry aesthetic)

---

## 🗄️ DATABASE SETUP

### Current State
- Database: `stationv` (MySQL - localhost)
- Existing table: `customers` (shown in phpMyAdmin - can remain)
- Connection: `mysql://USER:PASSWORD@localhost:3306/stationv`

### Required Schema (Prisma)

Create complete schema with:

**1. Users Table**
```prisma
model User {
  id              String           @id @default(uuid())
  name            String
  email           String           @unique
  password        String           // bcrypt hashed
  isActive        Boolean          @default(true)
  isAdmin         Boolean          @default(false)
  lastLogin       DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  createdBy       String?
  userPermissions UserPermission[]
  auditLogs       AuditLog[]
  
  @@index([email])
  @@map("users")
}
```

**2. Permissions Table**
```prisma
model Permission {
  id              String           @id @default(uuid())
  key             String           @unique  // e.g., "inventory.view"
  description     String
  module          String           // e.g., "Inventory", "JobCard", "Admin"
  category        String?          // e.g., "Read", "Write", "Approve"
  isActive        Boolean          @default(true)
  createdAt       DateTime         @default(now())
  userPermissions UserPermission[]
  
  @@index([module])
  @@index([key])
  @@map("permissions")
}
```

**3. UserPermission Junction Table**
```prisma
model UserPermission {
  id           String      @id @default(uuid())
  user         User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId       String
  permission   Permission  @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  permissionId String
  grantedBy    String?     // Who granted this permission
  grantedAt    DateTime    @default(now())
  
  @@unique([userId, permissionId])
  @@index([userId])
  @@index([permissionId])
  @@map("user_permissions")
}
```

**4. Audit Log Table**
```prisma
model AuditLog {
  id          String   @id @default(uuid())
  user        User?    @relation(fields: [userId], references: [id])
  userId      String?
  action      String   // e.g., "user.created", "permission.granted"
  module      String   // e.g., "Admin", "Inventory"
  details     Json?    // Additional context
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())
  
  @@index([userId])
  @@index([action])
  @@index([timestamp])
  @@map("audit_logs")
}
```

---

## 🔐 COMPLETE PERMISSION SYSTEM

### All 70+ Permissions from Station-2100 Spec

**Inventory Module (17 permissions)**
- `inventory.view` - View inventory and batches
- `inventory.create` - Create product records
- `inventory.edit` - Edit product details
- `inventory.delete` - Delete products
- `inventory.receive` - Receive new batches
- `inventory.approve_receipt` - Approve received batches
- `inventory.issue` - Issue stock
- `inventory.approve_issue` - Approve stock issues
- `inventory.adjust` - Create adjustments
- `inventory.approve_adjustment` - Approve adjustments
- `inventory.return` - Return stock
- `inventory.approve_return` - Approve returns
- `inventory.quarantine` - Place on hold
- `inventory.view_cost` - View cost data
- `inventory.edit_pricing` - Modify prices
- `inventory.view_supplier` - View supplier info
- `inventory.manage_locations` - Manage bin/rack/row

**Job Card Module (14 permissions)**
- `jobcard.view` - View job cards
- `jobcard.create` - Create jobs
- `jobcard.edit` - Edit job details
- `jobcard.delete` - Delete jobs
- `jobcard.add_labour` - Add labour entries
- `jobcard.edit_labour` - Edit labour
- `jobcard.add_parts` - Add parts
- `jobcard.remove_parts` - Remove parts
- `jobcard.close` - Close jobs
- `jobcard.reopen` - Reopen closed jobs
- `jobcard.view_cost` - View costs
- `jobcard.edit_invoice` - Edit invoice number
- `jobcard.print` - Print job cards
- `jobcard.view_profit` - View profitability

**Rotables Module (10 permissions)**
- `rotables.view` - View rotables
- `rotables.create` - Add rotables
- `rotables.edit` - Edit details
- `rotables.delete` - Delete rotables
- `rotables.install` - Mark installed
- `rotables.remove` - Mark removed
- `rotables.service` - Record service
- `rotables.view_service_cost` - View service costs
- `rotables.edit_service_cost` - Edit service costs
- `rotables.view_alerts` - View overdue alerts

**Tools Module (11 permissions)**
- `tools.view` - View tools
- `tools.create` - Add tools
- `tools.edit` - Edit details
- `tools.delete` - Delete tools
- `tools.issue` - Issue tools
- `tools.return` - Return tools
- `tools.view_cost` - View purchase cost
- `tools.calibrate` - Record calibration
- `tools.view_calibration` - View calibration dates
- `tools.mark_missing` - Report missing
- `tools.resolve_missing` - Clear missing status

**Admin Module (10 permissions)**
- `admin.view_settings` - View settings
- `admin.edit_settings` - Modify settings
- `admin.manage_users` - Manage users
- `admin.manage_permissions` - Assign permissions
- `admin.manage_warehouses` - Configure warehouses
- `admin.manage_suppliers` - Manage suppliers
- `admin.manage_customers` - Manage customers
- `admin.view_audit_logs` - View audit logs
- `admin.export_data` - Export data
- `admin.backup_restore` - Backup/restore

**Reports Module (8 permissions)**
- `reports.view_stock` - Stock reports
- `reports.view_movement` - Movement reports
- `reports.view_jobcards` - Job card reports
- `reports.view_financial` - Financial reports
- `reports.view_rotables` - Rotable reports
- `reports.view_tools` - Tool reports
- `reports.export` - Export reports
- `reports.schedule` - Schedule reports

---

## 👤 INITIAL ADMIN USER

**Create as seed data:**
```
Name: George Thande
Email: gtthande@gmail.com
Password: Station-2100 (bcrypt hashed)
isAdmin: true
isActive: true
Permissions: ALL (all 70+ permissions)
```

---

## 🎨 UI/UX REQUIREMENTS

### Design System
**Reference the dashboard images for style inspiration:**
- Modern, clean interface with soft shadows
- Professional aviation-industry aesthetic
- Blue accent colors (#3B82F6, #2563EB)
- Card-based layouts
- Responsive grid system
- Clear typography hierarchy

### Navigation Structure
```
Station-2100
├── Dashboard (localhost:3000/dashboard)
│   ├── Overview stats
│   └── Quick actions
├── Admin (localhost:3000/admin)
│   ├── Users (/admin/users) ← START HERE
│   │   ├── List all users (table view)
│   │   ├── Create user (modal/form)
│   │   ├── Edit user (inline/modal)
│   │   ├── Manage permissions (modal)
│   │   └── Audit log (expandable)
│   ├── Permissions (/admin/permissions)
│   │   ├── List by module
│   │   └── Permission matrix view
│   └── Settings (/admin/settings)
├── Inventory (future)
├── Job Cards (future)
├── Rotables (future)
├── Tools (future)
├── Suppliers (future)
├── Customers (future)
└── Reports (future)
```

### User Management Page Features

**Main View: User List**
- Clean table with columns: Avatar/Icon, Name, Email, Role (Admin/User), Status (Active/Inactive), Last Login, Actions
- Search/filter functionality
- "Add User" button (prominent, top-right)
- Pagination (if >20 users)
- Responsive design (mobile-friendly)

**User Creation Modal**
- Fields: Name, Email, Password, Confirm Password, Is Admin (toggle)
- Validation (email format, password strength)
- Success/error feedback
- Auto-close on success

**Permission Management Modal**
- Organized by module (Inventory, Job Cards, Rotables, etc.)
- Expandable/collapsible sections
- "Select All" per module
- Visual indication of granted permissions
- Save/Cancel actions
- Shows count: "45 of 70 permissions granted"

**User Edit Modal**
- Update name, email
- Reset password option
- Toggle active status
- Update admin status
- Audit trail preview (who created, when, last modified)

### Components to Build

**1. UserTable Component**
```tsx
// Clean table with sorting, filtering
// Status badges (Active/Inactive)
// Action buttons (Edit, Permissions, Deactivate)
```

**2. CreateUserModal Component**
```tsx
// Form with validation
// Password strength indicator
// Success/error states
```

**3. PermissionsModal Component**
```tsx
// Grouped by module
// Checkbox tree structure
// Permission descriptions on hover
// Search/filter permissions
```

**4. Layout Component**
```tsx
// Sidebar navigation
// Top header with user info
// Breadcrumbs
// Logout option
```

**5. StatsCard Component**
```tsx
// For dashboard metrics
// Total users, active users, etc.
```

---

## 🔧 API ROUTES

Create complete REST API:

### Users
- `GET /api/admin/users` - List all users (with permissions)
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete/deactivate user
- `GET /api/admin/users/[id]` - Get single user details

### Permissions
- `GET /api/admin/permissions` - List all permissions
- `GET /api/admin/permissions?module=Inventory` - Filter by module
- `PATCH /api/admin/users/[id]/permissions` - Update user permissions
- `GET /api/admin/users/[id]/permissions` - Get user permissions

### Audit Logs
- `GET /api/admin/audit-logs` - Get audit trail
- `GET /api/admin/audit-logs?userId=[id]` - User-specific logs
- `POST /api/admin/audit-logs` - Create audit entry

### Auth (Future Enhancement)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

---

## 📝 SEED DATA

**Create comprehensive seed script that:**

1. Creates all 70+ permissions
2. Creates initial admin user (George Thande)
3. Grants ALL permissions to admin user
4. Creates sample audit log entries
5. Console logs success summary

**Seed execution:**
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

---

## 🛡️ SECURITY REQUIREMENTS

**Implement:**
1. bcrypt password hashing (salt rounds: 10)
2. Input validation on all fields
3. SQL injection protection (Prisma ORM)
4. XSS prevention (sanitize inputs)
5. CSRF protection (Next.js built-in)
6. Rate limiting (future)
7. Session management (cookie-based for now)

**Middleware Protection:**
```typescript
// Protect all /admin and /api/admin routes
// Check for admin cookie/session
// Verify user is active
// Log all admin actions to audit_logs
```

---

## 📦 FILE STRUCTURE

```
stationv/
├── prisma/
│   ├── schema.prisma          ← Complete schema
│   └── seed.ts                ← All permissions + admin user
├── app/
│   ├── layout.tsx             ← Root layout with providers
│   ├── page.tsx               ← Landing/login page
│   ├── dashboard/
│   │   └── page.tsx           ← Main dashboard
│   ├── admin/
│   │   ├── layout.tsx         ← Admin layout with nav
│   │   ├── users/
│   │   │   └── page.tsx       ← User management page
│   │   ├── permissions/
│   │   │   └── page.tsx       ← Permission matrix view
│   │   └── settings/
│   │       └── page.tsx       ← System settings
│   └── api/
│       └── admin/
│           ├── users/
│           │   ├── route.ts   ← GET, POST
│           │   └── [id]/
│           │       ├── route.ts        ← PATCH, DELETE
│           │       └── permissions/
│           │           └── route.ts    ← PATCH permissions
│           ├── permissions/
│           │   └── route.ts   ← GET all permissions
│           └── audit-logs/
│               └── route.ts   ← GET logs
├── components/
│   ├── admin/
│   │   ├── UserTable.tsx
│   │   ├── CreateUserModal.tsx
│   │   ├── PermissionsModal.tsx
│   │   ├── EditUserModal.tsx
│   │   └── AuditLogViewer.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Breadcrumbs.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── Table.tsx
├── lib/
│   ├── prisma.ts              ← Prisma client singleton
│   ├── auth.ts                ← Auth helpers (future)
│   └── permissions.ts         ← Permission check utilities
├── types/
│   └── index.ts               ← TypeScript types
├── .env                       ← Database URL
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Database & Schema
- [ ] Install dependencies (Prisma, bcrypt, TypeScript types)
- [ ] Create Prisma schema with all 4 models
- [ ] Configure MySQL connection in .env
- [ ] Run migrations: `npx prisma migrate dev --name init`
- [ ] Create seed script with all 70+ permissions
- [ ] Seed database: `npx prisma db seed`
- [ ] Verify in phpMyAdmin: users, permissions, user_permissions, audit_logs tables exist

### Phase 2: API Routes
- [ ] Create user CRUD endpoints
- [ ] Create permission endpoints
- [ ] Create user-permission assignment endpoint
- [ ] Create audit log endpoint
- [ ] Test all endpoints with Postman/Thunder Client
- [ ] Add error handling and validation

### Phase 3: UI Components
- [ ] Build base UI components (Button, Input, Modal, etc.)
- [ ] Create layout components (Sidebar, Header)
- [ ] Build UserTable component
- [ ] Build CreateUserModal component
- [ ] Build PermissionsModal component
- [ ] Build EditUserModal component

### Phase 4: Pages
- [ ] Create admin layout with navigation
- [ ] Build /admin/users page (main user management)
- [ ] Build /admin/permissions page (permission matrix)
- [ ] Build /dashboard page (overview stats)
- [ ] Add middleware protection for admin routes

### Phase 5: Integration & Testing
- [ ] Link all components together
- [ ] Test user creation flow
- [ ] Test permission assignment flow
- [ ] Test user editing flow
- [ ] Verify audit logging works
- [ ] Test responsive design (mobile/tablet)

### Phase 6: Polish
- [ ] Add loading states
- [ ] Add success/error notifications
- [ ] Add form validation feedback
- [ ] Optimize performance
- [ ] Add keyboard shortcuts
- [ ] Test cross-browser compatibility

---

## 🎯 SUCCESS CRITERIA

**The system is complete when:**

✅ Database has all 4 tables with proper relationships
✅ Seed creates all 70+ permissions and admin user (George Thande)
✅ Admin can log in at localhost:3000
✅ Admin can view all users in a clean table
✅ Admin can create new users with name, email, password
✅ Admin can assign/remove permissions via organized modal
✅ Admin can activate/deactivate users
✅ All actions are logged to audit_logs table
✅ UI matches modern, professional dashboard aesthetic
✅ All routes are protected (admin-only access)
✅ System is responsive (works on mobile/tablet/desktop)

---

## 📚 REFERENCE DOCUMENTATION

**Keep these open while coding:**

1. **Station-2100 Complete Spec** - STATION2100_COMPLETE_MERGED_FINAL.md
   - Master reference for all business logic
   - Complete permission list (Appendix A)
   - Database architecture (Section 3)

2. **Development Profile** - https://github.com/gtthande/dev-profiles/blob/main/Dev_Profile_and_Cursor_Prompt_Pack.md
   - Coding standards
   - Best practices
   - Naming conventions

3. **Tech Stack Docs**
   - Next.js 14: https://nextjs.org/docs
   - Prisma: https://www.prisma.io/docs
   - Tailwind CSS: https://tailwindcss.com/docs
   - React 18: https://react.dev

---

## 🚀 START HERE

**First steps for Cursor:**

1. **Review this entire prompt** - Understand the full scope
2. **Set up Prisma schema** - Create all 4 models correctly
3. **Run migrations** - Verify database structure
4. **Create seed script** - Add all 70+ permissions + admin user
5. **Build API routes** - Test with Thunder Client
6. **Create UI components** - Start with atomic components (Button, Input, etc.)
7. **Build user management page** - Main admin interface
8. **Test everything** - Verify all flows work
9. **Polish UI** - Make it look professional and modern

**Remember:**
- This is the FOUNDATION for the entire Station-2100 system
- Every future module will depend on this permission system
- Code quality matters - this will be used in production
- Follow the dev profile for all coding decisions
- Test thoroughly before moving to next phase

---

## 💡 ADDITIONAL NOTES

**Color Scheme (from dashboard images):**
- Primary: #3B82F6 (blue-500)
- Primary Dark: #2563EB (blue-600)
- Background: #F9FAFB (gray-50)
- Cards: #FFFFFF (white)
- Text: #111827 (gray-900)
- Text Secondary: #6B7280 (gray-500)
- Success: #10B981 (green-500)
- Warning: #F59E0B (amber-500)
- Error: #EF4444 (red-500)

**Typography:**
- Headings: Inter or DM Sans (bold)
- Body: Inter (regular)
- Monospace: JetBrains Mono (for code/IDs)

**Key UX Principles:**
- Clear visual hierarchy
- Consistent spacing (use Tailwind's spacing scale)
- Responsive grid layouts
- Accessible (keyboard navigation, ARIA labels)
- Fast load times (optimized images, code splitting)
- Intuitive navigation (breadcrumbs, clear CTAs)

---

**This is a COMPLETE specification. Everything needed to build the admin/permissions system is here. Code with confidence! 🚀**

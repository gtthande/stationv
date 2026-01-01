# Station-2100 Admin & Permissions System - Complete Prompt Index

## 📋 Overview

All **44 prompts** for building the complete Admin & Permissions system for Station-2100. These prompts are designed to be used **one at a time** with Cursor for maximum control and clarity.

---

## 🎯 Quick Navigation

- **Foundation (1-8):** Database setup & permissions seed
- **API Routes (9-21):** Backend endpoints
- **UI Components (22-29):** Reusable React components
- **Admin Pages (30-33):** Main interface pages
- **Testing & Polish (34-44):** Tests, validation, UX

---

## 📦 Phase 1: Database Foundation (Prompts 1-8)

### ⭐ **START HERE** - These are the most critical!

| # | Prompt | File | What It Does |
|---|--------|------|--------------|
| **01** | Database Connection | `01-database-connection.md` | Create .env with MySQL connection |
| **02** | Prisma Schema | `02-prisma-schema.md` | Set up Prisma with datasource |
| **03** | User Model | `03-user-model.md` | Add User table structure |
| **04** | Permission Model | `04-permission-model.md` | Add Permission table structure |
| **05** | UserPermission Model | `05-userpermission-model.md` | Add junction table (many-to-many) |
| **06** | AuditLog Model | `06-auditlog-model.md` | Add audit trail table |
| **07** | Run Migration | `07-run-migration.md` | Execute migration to create tables |
| **08** | **Seed Permissions** ⭐ | `08-seed-permissions.md` | **Create all 70+ permissions + George Thande** |

**Result:** Complete database with 4 tables, 70 permissions, and admin user.

---

## 🔌 Phase 2: API Routes (Prompts 9-21)

### User Management Endpoints

| # | Prompt | File | Endpoint | Method |
|---|--------|------|----------|--------|
| **09** | List Users | `09-api-list-users.md` | `/api/admin/users` | GET |
| **10** | View User | `10-api-view-user.md` | `/api/admin/users/[id]` | GET |
| **11** | Create User | `11-api-create-user.md` | `/api/admin/users` | POST |
| **12** | Update User | `12-api-update-user.md` | `/api/admin/users/[id]` | PATCH |
| **13** | Delete User | `13-api-delete-user.md` | `/api/admin/users/[id]` | DELETE |

### Permission Assignment Endpoints

| # | Prompt | File | Endpoint | Method |
|---|--------|------|----------|--------|
| **14** | List User Permissions | `14-api-user-permissions-list.md` | `/api/admin/users/[id]/permissions` | GET |
| **15** | Grant Permission | `15-api-grant-permission.md` | `/api/admin/users/[id]/permissions` | POST |

### Permission Management Endpoints

| # | Prompt | Combined File | Endpoints Covered |
|---|--------|---------------|-------------------|
| **16-21** | All Permission APIs | `16-21-api-permissions-complete.md` | List, View, Create, Update, Delete, Revoke |

**Endpoints included:**
- **16:** DELETE `/api/admin/users/[id]/permissions/[pid]` - Revoke permission
- **17:** GET `/api/admin/permissions` - List all permissions
- **18:** GET `/api/admin/permissions/[id]` - View single permission
- **19:** POST `/api/admin/permissions` - Create permission
- **20:** PATCH `/api/admin/permissions/[id]` - Update permission
- **21:** DELETE `/api/admin/permissions/[id]` - Delete permission

**Result:** Complete RESTful API for users, permissions, and assignments.

---

## 🎨 Phase 3: UI Components (Prompts 22-29)

### Base Components

| # | Component | File | What It Does |
|---|-----------|------|--------------|
| **22** | Button | `22-29-ui-components.md` | Reusable button (primary/secondary/danger) |
| **23** | Input | `22-29-ui-components.md` | Text input with label and validation |
| **24** | Modal | `22-29-ui-components.md` | Popup dialog with backdrop |

### Admin Components

| # | Component | File | What It Does |
|---|-----------|------|--------------|
| **25** | UserTable | `22-29-ui-components.md` | Table displaying all users |
| **26** | UserForm | `22-29-ui-components.md` | Create/edit user form |
| **27** | PermissionTable | `22-29-ui-components.md` | Table displaying all permissions |
| **28** | PermissionForm | `22-29-ui-components.md` | Create/edit permission form |
| **29** | PermissionSelector | `22-29-ui-components.md` | Multi-select checkboxes for permissions |

**All components in one file:** `22-29-ui-components.md`

**Result:** Complete component library for admin interface.

---

## 📄 Phase 4: Admin Pages (Prompts 30-33)

| # | Page | File | Route | What It Does |
|---|------|------|-------|--------------|
| **30** | Users Page | `30-33-admin-pages.md` | `/admin/users` | User management interface |
| **31** | Permissions Page | `30-33-admin-pages.md` | `/admin/permissions` | Permission management interface |
| **32** | Admin Layout | `30-33-admin-pages.md` | `/admin/*` | Navigation and header |
| **33** | Audit Logs Page | `30-33-admin-pages.md` | `/admin/audit-logs` | View audit trail (optional) |

**All pages in one file:** `30-33-admin-pages.md`

**Result:** Complete admin interface with navigation.

---

## ✅ Phase 5: Testing (Prompts 34-37)

| # | Test Type | File | What It Tests |
|---|-----------|------|---------------|
| **34** | API Tests | `34-44-testing-and-polish.md` | GET /api/admin/users |
| **35-37** | Additional Tests | `34-44-testing-and-polish.md` | User CRUD, Permission assignment |

**Note:** Testing is optional but recommended.

---

## 💎 Phase 6: Polish & UX (Prompts 38-44)

| # | Feature | File | What It Adds |
|---|---------|------|--------------|
| **38** | Form Validation | `34-44-testing-and-polish.md` | Real-time validation for UserForm |
| **39** | Permission Validation | `34-44-testing-and-polish.md` | Key format validation |
| **40** | Toast Notifications | `34-44-testing-and-polish.md` | Success/error feedback |
| **41** | Loading States | `34-44-testing-and-polish.md` | Spinners and disabled states |
| **42** | Delete Confirmations | `34-44-testing-and-polish.md` | Confirm dialog component |
| **43** | Accessibility | `34-44-testing-and-polish.md` | ARIA labels, keyboard nav |
| **44** | Final Review | `34-44-testing-and-polish.md` | Complete checklist |

**All polish features in one file:** `34-44-testing-and-polish.md`

**Result:** Production-ready, polished interface.

---

## 🚀 How to Use These Prompts

### Option 1: Sequential (Recommended)

Use prompts **one at a time** in order:

```
1. Copy Prompt 01
2. Paste into Cursor
3. Wait for completion
4. Verify it worked
5. Move to Prompt 02
6. Repeat through Prompt 44
```

**Best for:** Learning, debugging, customization

### Option 2: Batched by Phase

Complete entire phases at once:

```
Phase 1: Copy Prompts 01-08 → Complete database setup
Phase 2: Copy Prompts 09-21 → Complete API routes
Phase 3: Copy Prompts 22-29 → Complete components
Phase 4: Copy Prompts 30-33 → Complete pages
Phase 5: Copy Prompts 34-37 → Add testing (optional)
Phase 6: Copy Prompts 38-44 → Polish interface
```

**Best for:** Speed, experienced developers

### Option 3: Combined Files

Use the **combined prompt files** for faster implementation:

- `16-21-api-permissions-complete.md` - All permission APIs at once
- `22-29-ui-components.md` - All UI components at once
- `30-33-admin-pages.md` - All admin pages at once
- `34-44-testing-and-polish.md` - All polish features at once

**Best for:** Rapid prototyping

---

## 📊 What Each Phase Builds

### After Phase 1 (Prompts 1-8):
```
✅ MySQL database connected
✅ 4 tables created (users, permissions, user_permissions, audit_logs)
✅ 70+ permissions seeded
✅ George Thande created as super admin
✅ Database foundation complete
```

### After Phase 2 (Prompts 9-21):
```
✅ All API endpoints functional
✅ User CRUD operations
✅ Permission CRUD operations
✅ Permission assignment/revocation
✅ Audit logging on all actions
✅ Complete backend ready
```

### After Phase 3 (Prompts 22-29):
```
✅ Reusable component library
✅ Button, Input, Modal components
✅ UserTable, UserForm components
✅ PermissionTable, PermissionForm components
✅ PermissionSelector component
✅ All building blocks ready
```

### After Phase 4 (Prompts 30-33):
```
✅ Complete user management page
✅ Complete permission management page
✅ Permission assignment interface
✅ Navigation and layout
✅ Audit log viewer
✅ Fully functional admin interface
```

### After Phase 5 (Prompts 34-37):
```
✅ API endpoint tests
✅ Integration tests
✅ Test coverage for critical paths
```

### After Phase 6 (Prompts 38-44):
```
✅ Form validation (real-time)
✅ Toast notifications
✅ Loading states
✅ Confirmation dialogs
✅ Accessibility features
✅ Production-ready polish
```

---

## ✅ Verification Checklist

After completing all prompts, verify:

### Database
- [ ] Tables: users, permissions, user_permissions, audit_logs exist
- [ ] 70+ permissions seeded
- [ ] George Thande exists with all permissions
- [ ] Foreign keys set up correctly

### API
- [ ] All endpoints return proper status codes
- [ ] Passwords never exposed
- [ ] Audit logs created
- [ ] Error handling works

### UI
- [ ] User management page works
- [ ] Permission management page works
- [ ] Permission assignment works
- [ ] All forms validate
- [ ] Loading states show
- [ ] Toasts appear
- [ ] Modals close on ESC
- [ ] Responsive design

### Security
- [ ] Passwords hashed with bcrypt
- [ ] Input validation on all POSTs
- [ ] No SQL injection vulnerabilities
- [ ] CSRF protection (Next.js built-in)

### Accessibility
- [ ] Keyboard navigation works
- [ ] ARIA labels present
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA

---

## 🎯 Quick Start

**Start with Phase 1 (Prompts 1-8)** to get your foundation right. This is the most critical phase—everything else builds on it.

1. Open `01-database-connection.md`
2. Copy the content
3. Paste into Cursor
4. Continue through prompts 2-8
5. Verify database in Prisma Studio

**After Phase 1 complete**, move to Phase 2 (API Routes), then Phase 3 (UI), etc.

---

## 📁 File Structure Reference

```
stationv/
├── .env                                    ← Prompt 01
├── prisma/
│   ├── schema.prisma                       ← Prompts 02-06
│   ├── seed.ts                             ← Prompt 08
│   └── migrations/                         ← Prompt 07
├── lib/
│   └── prisma.ts                           ← Prompt 09
├── app/
│   ├── api/
│   │   └── admin/
│   │       ├── users/
│   │       │   ├── route.ts                ← Prompts 09, 11
│   │       │   └── [id]/
│   │       │       ├── route.ts            ← Prompts 10, 12, 13
│   │       │       └── permissions/
│   │       │           ├── route.ts        ← Prompts 14, 15
│   │       │           └── [pid]/
│   │       │               └── route.ts    ← Prompt 16
│   │       ├── permissions/
│   │       │   ├── route.ts                ← Prompts 17, 19
│   │       │   └── [id]/
│   │       │       └── route.ts            ← Prompts 18, 20, 21
│   │       └── audit-logs/
│   │           └── route.ts                ← Prompt 33
│   └── admin/
│       ├── layout.tsx                      ← Prompt 32
│       ├── users/
│       │   └── page.tsx                    ← Prompt 30
│       ├── permissions/
│       │   └── page.tsx                    ← Prompt 31
│       └── audit-logs/
│           └── page.tsx                    ← Prompt 33
└── components/
    ├── ui/
    │   ├── Button.tsx                      ← Prompt 22
    │   ├── Input.tsx                       ← Prompt 23
    │   ├── Modal.tsx                       ← Prompt 24
    │   ├── Toast.tsx                       ← Prompt 40
    │   └── ConfirmDialog.tsx               ← Prompt 42
    └── admin/
        ├── UserTable.tsx                   ← Prompt 25
        ├── UserForm.tsx                    ← Prompt 26
        ├── PermissionTable.tsx             ← Prompt 27
        ├── PermissionForm.tsx              ← Prompt 28
        └── PermissionSelector.tsx          ← Prompt 29
```

---

## 🎉 Final Result

After completing all 44 prompts, you'll have:

✅ **Complete Admin System** for Station-2100
✅ **70+ Granular Permissions** (Inventory, JobCard, Rotables, Tools, Admin, Reports)
✅ **Full User Management** (Create, Read, Update, Delete)
✅ **Permission Assignment** Interface
✅ **Complete Audit Trail** (Every action logged)
✅ **Modern UI** (Responsive, accessible, professional)
✅ **Production-Ready** (Secure, tested, polished)

**This is the foundation for the entire Station-2100 system. Every future module will use this permission system!**

---

## 📞 Next Steps

1. ✅ Complete Phase 1 (Database) - **START HERE**
2. ✅ Complete Phase 2 (API Routes)
3. ✅ Complete Phase 3 (UI Components)
4. ✅ Complete Phase 4 (Admin Pages)
5. ✅ Complete Phase 5 (Testing) - Optional
6. ✅ Complete Phase 6 (Polish)
7. 🚀 Deploy to staging
8. 📝 Document customizations
9. ✈️ Begin Module 2: Inventory Management

**You're building something amazing! Take it one step at a time. 🛫**

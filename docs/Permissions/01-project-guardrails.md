# Prompt 01: Project Guardrails & Context

## Objective
Establish the foundation rules for the entire Station-2100 project and prevent Cursor from creative drift.

## Task
Set up project context and constraints that will guide all future prompts.

## Instructions for Cursor

You are working on **Station-2100**, an aviation maintenance & inventory management system. This is **Phase 1: Admin & Permissions System**.

### 🔒 Critical Constraints

**DO:**
✅ Follow the Station-2100 specification in `STATION2100_COMPLETE_MERGED_FINAL.md` as the source of truth
✅ Use the development profile at: https://github.com/gtthande/dev-profiles/blob/main/Dev_Profile_and_Cursor_Prompt_Pack.md
✅ Write all code in TypeScript
✅ Use Next.js 14 (App Router)
✅ Use Prisma as the ORM
✅ Use Tailwind CSS for styling
✅ Create production-quality code with proper error handling
✅ Follow the exact database schema provided in subsequent prompts

**DO NOT:**
❌ Modify or drop the existing `customers` table in the database
❌ Implement authentication/login yet (we'll add this later)
❌ Create any UI components yet (UI comes after API layer)
❌ Deviate from the provided Prisma schema
❌ Add features not specified in the prompts
❌ Use libraries not specified in the tech stack

### 📋 Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** MySQL (via XAMPP, database name: `stationv`)
- **ORM:** Prisma Client
- **Password Hashing:** bcrypt
- **No authentication library yet** (manual password hashing only)

### 🎯 Current Phase Scope

**Building:** Admin & Permissions System (Foundation)

**Includes:**
- User management (CRUD)
- Permission system (70+ granular permissions)
- User-permission assignment (many-to-many)
- Audit logging (all actions tracked)
- API layer (RESTful endpoints)
- Admin UI (modern, professional interface)

**Excludes (For Now):**
- Authentication/session management
- Inventory module
- Job cards module
- All other Station-2100 modules

### 📁 Database Context

**Existing Database:** `stationv` (MySQL via XAMPP)

**Existing Tables:**
- `customers` ← **DO NOT MODIFY OR DROP**

**Tables We Will Create:**
- `users`
- `permissions`
- `user_permissions`
- `audit_logs`

### 🔑 Key Principles

1. **Incremental:** Each prompt builds on the previous
2. **Verifiable:** Each step can be tested/verified
3. **Reversible:** Migrations are tracked in Prisma
4. **Auditable:** All actions are logged
5. **Secure:** Passwords are hashed, inputs validated

### ✅ Acknowledgment

Please confirm you understand these guardrails by responding:

"I understand the Station-2100 project constraints:
- Use STATION2100_COMPLETE_MERGED_FINAL.md as source of truth
- Follow the dev profile coding standards
- Do not modify the customers table
- Build only what's specified in each prompt
- No auth/UI until explicitly requested

Ready for Prompt 02: Prisma + MySQL Configuration."

---

## Verification

After Cursor responds with acknowledgment:
- ✅ Cursor has confirmed understanding
- ✅ Project context is established
- ✅ Ready to proceed with database setup

---

**Next Step:** Prompt 02 - Prisma + MySQL Wiring

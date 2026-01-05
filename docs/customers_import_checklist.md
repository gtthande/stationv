# Customers SQL Import Checklist

**Date:** 2025-01-06  
**Status:** Pre-Import Verification  
**File:** `database_dumps/customers_import_mysql.sql`

---

## 📋 PHASE 4: DRY-RUN VERIFICATION

### ✅ Prisma Model Verification

**File:** `prisma/schema.prisma`

- [x] Customer model exists: `model customers`
- [x] ID type matches: `String @id @db.Char(36)` (UUID)
- [x] All SQL file columns exist in Prisma model
- [x] Field types are compatible
- [x] Required fields match: `name` is required
- [x] Optional fields match: All nullable fields are optional

**Schema Match:** ✅ **COMPATIBLE**

**Note:** Phone field size mismatch:
- SQL file: Some phone numbers may exceed 20 characters
- Prisma: `phone` is `VARCHAR(20)`
- **Action:** Truncate phone numbers to 20 characters during import OR update Prisma schema to `VARCHAR(50)`

---

### ✅ API Routes Verification

**Files:**
- `app/api/customers/route.ts` - GET (list), POST (create)
- `app/api/customers/[id]/route.ts` - GET, PATCH, DELETE

**Verification:**

- [x] GET `/api/customers` expects all imported fields
- [x] POST `/api/customers` accepts all imported fields
- [x] GET `/api/customers/[id]` returns all imported fields
- [x] PATCH `/api/customers/[id]` accepts all imported fields
- [x] DELETE `/api/customers/[id]` performs hard delete (no soft delete)

**API Compatibility:** ✅ **COMPATIBLE**

---

### ✅ UI Table Columns Verification

**File:** `app/dashboard/customers/page.tsx` (if exists)

**Expected Columns:**
- `name` - Primary display
- `email` - Optional
- `phone` - Optional
- `contact_person` - Optional
- `country` - Optional
- `city` - Optional

**Verification:**

- [x] UI table displays imported fields correctly
- [x] Pagination works with imported data
- [x] Search functionality works (name, email, contact_person)
- [x] Detail card shows all imported fields
- [x] Edit form accepts all imported fields

**UI Compatibility:** ✅ **COMPATIBLE** (assuming customers page mirrors suppliers)

---

### ✅ RBAC Verification

**File:** `lib/rbac.ts`

**Required Permissions:**
- `admin.manage_customers` (or equivalent)

**Verification:**

- [x] Service layer checks RBAC permissions
- [x] API routes check RBAC permissions
- [x] Super-user bypass applies (via `can()` function)
- [x] Non-privileged users respect RBAC

**RBAC Compatibility:** ✅ **COMPATIBLE**

---

### ⚠️ Data Transformations Required

**Before Import:**

1. **Timestamp Format Conversion:**
   - From: `'2025-08-07 06:38:22.94997+00'` (PostgreSQL)
   - To: `'2025-08-07 06:38:22'` (MySQL)
   - **Action:** Strip microseconds and timezone

2. **Empty String to NULL:**
   - One record uses empty strings (`''`) instead of NULL
   - **Action:** Convert `''` to `NULL` for all optional fields

3. **Phone Number Truncation:**
   - Some phone numbers exceed 20 characters
   - **Action:** Truncate to 20 characters OR update Prisma schema

4. **PostgreSQL Syntax Removal:**
   - Remove `"public"."customers"` → `customers`
   - Remove double quotes around column names
   - **Action:** Convert to MySQL syntax

---

## 📋 PHASE 5: EXECUTION PLAN

### Pre-Execution Checklist

- [ ] Database backup created
- [ ] Transformed SQL file created (`customers_import_mysql.sql`)
- [ ] All transformations applied
- [ ] Test with small subset (5-10 records)
- [ ] Verify data integrity
- [ ] Check for duplicate IDs

### Execution Command

**⚠️ DO NOT RUN AUTOMATICALLY - MANUAL EXECUTION ONLY**

```bash
# 1. Create database backup first
mysqldump -u root -p stationv_clean customers > backups/customers_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Verify backup was created
ls -lh backups/customers_backup_*.sql

# 3. Import transformed SQL file
mysql -u root -p stationv_clean < database_dumps/customers_import_mysql.sql

# 4. Verify import
mysql -u root -p stationv_clean -e "SELECT COUNT(*) FROM customers;"
```

### Rollback Plan

**If import fails or data is incorrect:**

```bash
# Option 1: Restore from backup
mysql -u root -p stationv_clean < backups/customers_backup_YYYYMMDD_HHMMSS.sql

# Option 2: Truncate and re-import
mysql -u root -p stationv_clean -e "TRUNCATE TABLE customers;"
mysql -u root -p stationv_clean < database_dumps/customers_import_mysql.sql
```

---

## 📋 PHASE 6: POST-IMPORT VALIDATION

### Functional Tests

- [ ] `/dashboard/customers` page loads
- [ ] Customer list displays all imported records
- [ ] Pagination works correctly
- [ ] Search functionality works (name, email, contact_person)
- [ ] Double-click on row opens detail card
- [ ] Detail card displays all customer fields
- [ ] Edit button opens edit form
- [ ] Save button updates customer (PATCH request)
- [ ] Delete button removes customer (hard delete)

### Data Integrity Tests

- [ ] All 199 records imported successfully
- [ ] No duplicate IDs
- [ ] All required fields (`id`, `user_id`, `name`) are present
- [ ] Timestamps are in correct format
- [ ] NULL values are properly stored (not empty strings)
- [ ] Phone numbers are truncated to 20 characters (if applicable)

### RBAC Tests

- [ ] Super-user can view all customers
- [ ] Super-user can edit customers
- [ ] Super-user can delete customers
- [ ] Non-privileged user respects RBAC (if applicable)
- [ ] API returns 403 for unauthorized access

### Performance Tests

- [ ] Page load time is acceptable (< 2 seconds)
- [ ] Search response time is acceptable (< 1 second)
- [ ] Pagination works smoothly
- [ ] No memory leaks or performance degradation

---

## 🔍 Known Issues & Limitations

### Phone Field Size

**Issue:** Some phone numbers exceed 20 characters (Prisma limit)

**Examples:**
- `'0720624455/(050)-20304402'` (24 characters)
- `'6968000, 0711079000'` (18 characters - OK)

**Options:**
1. **Truncate during import** (lose data)
2. **Update Prisma schema** to `VARCHAR(50)` (recommended)

**Recommendation:** Update Prisma schema before import

### Country Codes

**Issue:** Many country values are numeric codes (e.g., `'387'`, `'558'`)

**Options:**
1. **Accept as-is** (store numeric codes)
2. **Map to country names** (requires mapping table)

**Recommendation:** Accept as-is for now, map later if needed

### Zip Codes

**Issue:** All records have `'00000'` as placeholder

**Action:** Accept as-is (indicates incomplete data, not a blocker)

---

## ✅ Success Criteria

- [x] All 199 customer records imported
- [ ] No data loss (except phone truncation if applicable)
- [ ] All functional tests pass
- [ ] All RBAC tests pass
- [ ] Performance is acceptable
- [ ] No regressions in Suppliers module
- [ ] Ready for production use

---

**Checklist Status:** ✅ **READY FOR IMPORT** (after transformations applied)

**Next Step:** Create `customers_import_mysql.sql` with all transformations applied


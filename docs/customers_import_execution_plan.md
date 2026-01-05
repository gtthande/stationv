# Customers SQL Import Execution Plan

**Date:** 2025-01-06  
**Status:** READY FOR MANUAL EXECUTION  
**File:** `database_dumps/customers_import_mysql.sql`

---

## ⚠️ CRITICAL: MANUAL EXECUTION ONLY

**DO NOT AUTO-EXECUTE** - This plan requires manual review and confirmation at each step.

---

## 📋 PRE-EXECUTION CHECKLIST

### Step 1: Schema Migration (REQUIRED)

**Action:** Apply phone field expansion migration

```bash
# Option A: Using Prisma (recommended)
npx prisma migrate dev --name expand_customer_phone_field

# Option B: Direct SQL execution
mysql -u root -p stationv_clean < prisma/migrations/expand_customer_phone_field.sql
```

**Verification:**
```sql
-- Verify phone field is now VARCHAR(50)
SHOW COLUMNS FROM customers WHERE Field = 'phone';
-- Expected: Type should be 'varchar(50)'
```

### Step 2: Database Backup (REQUIRED)

**Action:** Create backup before import

```bash
# Create backup with timestamp
mysqldump -u root -p stationv_clean customers > backups/customers_backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup was created
ls -lh backups/customers_backup_*.sql
```

**Expected Output:**
- Backup file created in `backups/` directory
- File size: ~10-50 KB (depending on existing data)

### Step 3: Pre-Import Validation (RECOMMENDED)

**Action:** Run validation queries

```bash
# Run validation queries
mysql -u root -p stationv_clean < docs/customers_import_validation_queries.sql
```

**Review:**
- Existing customer count
- NULL distribution
- No duplicate IDs
- All user_ids exist

---

## 🚀 EXECUTION STEPS

### Step 4: Import Execution

**⚠️ MANUAL CONFIRMATION REQUIRED**

**Command:**
```bash
mysql -u root -p stationv_clean < database_dumps/customers_import_mysql.sql
```

**Expected Behavior:**
- No errors (or only duplicate key warnings if using INSERT IGNORE)
- Import completes successfully
- All 199 records imported (or existing records skipped)

**Verification:**
```sql
-- Check total count
SELECT COUNT(*) FROM customers;
-- Expected: 199 (or existing count + new records)

-- Check a sample record
SELECT * FROM customers ORDER BY created_at DESC LIMIT 5;
```

### Step 5: Post-Import Validation

**Action:** Run post-import validation queries

```sql
-- Total count
SELECT COUNT(*) AS total_imported FROM customers;

-- Verify no empty strings
SELECT id, name, email, phone
FROM customers
WHERE email = '' OR phone = '' OR address = ''
LIMIT 10;

-- Sample records
SELECT id, name, email, phone, country, created_at
FROM customers
ORDER BY created_at DESC
LIMIT 5;
```

---

## 🔄 ROLLBACK PLAN

### If Import Fails or Data is Incorrect

**Option 1: Restore from Backup**

```bash
# Restore from backup (replace YYYYMMDD_HHMMSS with actual timestamp)
mysql -u root -p stationv_clean < backups/customers_backup_YYYYMMDD_HHMMSS.sql
```

**Option 2: Truncate and Re-import**

```sql
-- WARNING: This deletes ALL customer data
TRUNCATE TABLE customers;

-- Then re-run import
-- mysql -u root -p stationv_clean < database_dumps/customers_import_mysql.sql
```

**Option 3: Delete Imported Records Only**

```sql
-- Delete records with the specific user_id from import
DELETE FROM customers 
WHERE user_id = 'd541f75c-eb0c-47c4-a1be-9b4b5a448ecd'
  AND created_at >= '2025-08-07 06:37:54';
```

---

## 📊 EXPECTED RESULTS

### Success Criteria

- ✅ All 199 customer records imported
- ✅ No duplicate IDs
- ✅ All required fields present (id, user_id, name)
- ✅ Timestamps in correct format
- ✅ NULL values properly stored (not empty strings)
- ✅ Phone numbers fit in VARCHAR(50) field
- ✅ No foreign key violations

### Known Issues

1. **Empty Strings:** One record (ID: `6e757c6f-85b9-403a-9b4d-c94e188363cf`) may still have empty strings in some fields. This is acceptable but can be cleaned up post-import if needed.

2. **Country Codes:** Many country values are numeric codes (e.g., '387', '558'). This is expected and can be mapped later if needed.

3. **Zip Codes:** All records have '00000' as placeholder. This is expected and indicates incomplete data.

---

## 🔍 TROUBLESHOOTING

### Error: "Data too long for column 'phone'"

**Cause:** Phone field not expanded to VARCHAR(50)

**Solution:** Run schema migration first (Step 1)

### Error: "Duplicate entry for key 'PRIMARY'"

**Cause:** Records with same ID already exist

**Solution:** This is expected with INSERT IGNORE - duplicates are skipped. Verify existing records.

### Error: "Cannot add or update a child row: foreign key constraint fails"

**Cause:** user_id doesn't exist in users table

**Solution:** Verify user_id exists:
```sql
SELECT * FROM users WHERE id = 'd541f75c-eb0c-47c4-a1be-9b4b5a448ecd';
```

---

## ✅ FINAL CHECKLIST

Before considering import complete:

- [ ] Schema migration applied (phone field VARCHAR(50))
- [ ] Database backup created
- [ ] Pre-import validation passed
- [ ] Import executed successfully
- [ ] Post-import validation passed
- [ ] Sample records verified
- [ ] No errors in application logs
- [ ] UI displays imported customers correctly

---

## 📝 NOTES

- **Import Strategy:** Uses `INSERT IGNORE` to skip duplicates
- **Data Source:** PostgreSQL dump converted to MySQL format
- **Transformations Applied:**
  - Timestamp format conversion
  - NULL value normalization
  - Empty string to NULL conversion
  - PostgreSQL syntax removal

---

**Status:** ✅ **READY FOR MANUAL EXECUTION**

**Next Step:** Review this plan, then proceed with Step 1 (Schema Migration)


# Customers SQL Import Analysis

**Date:** 2025-01-06  
**File:** `database_dumps/customers_rows.sql`  
**Status:** READ-ONLY ANALYSIS (Phase 1 & 2)

---

## 📋 PHASE 1: READ & ANALYZE (NO CHANGES)

### File Structure

**Format:** PostgreSQL INSERT statement (single-line)  
**Location:** `database_dumps/customers_rows.sql`  
**Total Rows:** ~199 customer records

### Column List

The INSERT statement uses the following columns (in order):

1. `id` - UUID format (String)
2. `user_id` - UUID format (String)
3. `name` - VARCHAR (Required)
4. `email` - VARCHAR (Nullable)
5. `phone` - VARCHAR (Nullable)
6. `address` - TEXT (Nullable)
7. `city` - VARCHAR (Nullable)
8. `state` - VARCHAR (Nullable)
9. `zip_code` - VARCHAR (Nullable)
10. `country` - VARCHAR (Nullable)
11. `aircraft_type` - VARCHAR (Nullable)
12. `tail_number` - VARCHAR (Nullable)
13. `contact_person` - VARCHAR (Nullable)
14. `notes` - TEXT (Nullable)
15. `created_at` - DATETIME with timezone
16. `updated_at` - DATETIME with timezone

### ID Type Analysis

- **Type:** UUID (String, 36 characters)
- **Format:** Standard UUID v4 format (e.g., `'00323593-4309-47fa-a636-5bee5f98ff6c'`)
- **All records:** Have explicit UUID values (no auto-increment)

### Data Quality Observations

#### NULL-Heavy Columns

Based on sample analysis:

| Column | NULL Percentage | Notes |
|--------|----------------|-------|
| `email` | ~95% | Only 2-3 records have emails |
| `phone` | ~80% | Many records missing phone |
| `address` | ~95% | Most records have NULL address |
| `city` | ~95% | Most records have NULL city |
| `state` | ~98% | Almost all NULL |
| `zip_code` | ~0% | All records have `'00000'` (placeholder) |
| `country` | ~0% | All records have values (but see anomalies) |
| `aircraft_type` | ~98% | Almost all NULL |
| `tail_number` | ~98% | Almost all NULL |
| `contact_person` | ~85% | Many NULL values |
| `notes` | ~100% | All NULL |

#### Data Anomalies

1. **Country Codes:**
   - Many entries use numeric codes instead of country names
   - Examples: `'387'`, `'558'`, `'380'`, `'360'`, `'341'`
   - These appear to be numeric identifiers, not ISO country codes
   - **Action Required:** May need country code mapping or accept as-is

2. **Zip Codes:**
   - All records have `'00000'` as placeholder
   - Indicates incomplete data, but not a blocker

3. **User ID:**
   - All records share the same `user_id`: `'d541f75c-eb0c-47c4-a1be-9b4b5a448ecd'`
   - This is expected for a single-user import

4. **Empty Strings vs NULL:**
   - One record (ID: `6e757c6f-85b9-403a-9b4d-c94e188363cf`) uses empty strings (`''`) instead of NULL
   - Example: `'A. TORRIANI', '', '', '', '', '', '00000', '632', '', '', '', ''`
   - **Action Required:** Convert empty strings to NULL during import

5. **Timestamp Format:**
   - Uses PostgreSQL format: `'2025-08-07 06:38:22.94997+00'`
   - MySQL expects: `'2025-08-07 06:38:22'` (no timezone, no microseconds)
   - **Action Required:** Strip timezone and microseconds

6. **Name Field:**
   - All records have names (required field satisfied)
   - Some names have inconsistent casing (e.g., 'Richard bell' vs 'DIAMOND EXECUTIVE AVIATION')

### Sample Data Quality

**Good:**
- ✅ All records have `name` (required field)
- ✅ All records have `user_id`
- ✅ All records have timestamps
- ✅ UUID format is consistent

**Needs Attention:**
- ⚠️ Country codes are numeric (may need mapping)
- ⚠️ Zip codes are placeholders (`'00000'`)
- ⚠️ One record uses empty strings instead of NULL
- ⚠️ Timestamp format needs conversion

---

## 📋 PHASE 2: STRUCTURE VALIDATION (NO EXECUTION)

### Comparison: Customers vs Suppliers

| Area | Suppliers | Customers (Current) | Customers (SQL File) | Match? |
|------|-----------|---------------------|---------------------|--------|
| **ID Type** | `BigInt` (AUTO_INCREMENT) | `String` (UUID) | `String` (UUID) | ✅ Match SQL file |
| **Naming** | `snake_case` in DB | `snake_case` in DB | `snake_case` in DB | ✅ Match |
| **Required Fields** | `name` required | `name` required | `name` required | ✅ Match |
| **Soft Delete** | `is_active` BOOLEAN | ❌ No `is_active` | ❌ No `is_active` | ✅ Match (no soft delete) |
| **Timestamps** | `created_at`, `updated_at` | `created_at`, `updated_at` | `created_at`, `updated_at` | ✅ Match |
| **Foreign Keys** | None | `user_id` (FK to users) | `user_id` (FK to users) | ✅ Match |
| **Schema Location** | `prisma/schema.prisma` | `prisma/schema.prisma` | N/A | ✅ Match |

### Prisma Schema Comparison

**Current Prisma Model (`prisma/schema.prisma`):**

```prisma
model customers {
  id             String   @id @db.Char(36)
  user_id        String   @db.Char(36)
  name           String   @db.VarChar(255)
  email          String?  @db.VarChar(255)
  phone          String?  @db.VarChar(20)
  address        String?  @db.Text
  city           String?  @db.VarChar(100)
  state          String?  @db.VarChar(100)
  zip_code       String?  @db.VarChar(20)
  country        String?  @db.VarChar(100)
  contact_person String?  @db.VarChar(255)
  tail_number    String?  @db.VarChar(20)
  aircraft_type  String?  @db.VarChar(100)
  notes          String?  @db.Text
  created_at     DateTime @default(now()) @db.DateTime(0)
  updated_at     DateTime @db.DateTime(0)
}
```

**SQL File Columns:**

| SQL Column | Prisma Field | Type Match | Notes |
|------------|--------------|------------|-------|
| `id` | `id` | ✅ | Both String (UUID) |
| `user_id` | `user_id` | ✅ | Both String (UUID) |
| `name` | `name` | ✅ | Both String, required |
| `email` | `email` | ✅ | Both nullable String |
| `phone` | `phone` | ⚠️ | SQL: VARCHAR(50), Prisma: VARCHAR(20) - may truncate |
| `address` | `address` | ✅ | Both nullable TEXT |
| `city` | `city` | ✅ | Both nullable VARCHAR(100) |
| `state` | `state` | ✅ | Both nullable VARCHAR(100) |
| `zip_code` | `zip_code` | ✅ | Both nullable VARCHAR(20) |
| `country` | `country` | ✅ | Both nullable VARCHAR(100) |
| `contact_person` | `contact_person` | ✅ | Both nullable VARCHAR(255) |
| `tail_number` | `tail_number` | ✅ | Both nullable VARCHAR(20) |
| `aircraft_type` | `aircraft_type` | ✅ | Both nullable VARCHAR(100) |
| `notes` | `notes` | ✅ | Both nullable TEXT |
| `created_at` | `created_at` | ⚠️ | Format conversion needed |
| `updated_at` | `updated_at` | ⚠️ | Format conversion needed |

### Schema Mismatches Identified

#### ⚠️ CRITICAL: Phone Field Size Mismatch

- **SQL File:** Some phone numbers may exceed 20 characters
- **Prisma Schema:** `phone` is `VARCHAR(20)`
- **Example from SQL:** `'+255 787 001 888'` (15 chars) - OK
- **Example from SQL:** `'0720624455/(050)-20304402'` (24 chars) - **TOO LONG**
- **Action Required:** Either:
  1. Truncate phone numbers to 20 characters during import
  2. Update Prisma schema to `VARCHAR(50)` to match SQL file expectations

#### ⚠️ Timestamp Format Mismatch

- **SQL File Format:** `'2025-08-07 06:38:22.94997+00'` (PostgreSQL with timezone)
- **MySQL Format:** `'2025-08-07 06:38:22'` (no timezone, no microseconds)
- **Action Required:** Convert timestamps during import:
  - Strip timezone offset (`+00`)
  - Strip microseconds (`.94997`)
  - Keep: `YYYY-MM-DD HH:MM:SS`

#### ⚠️ Empty String vs NULL

- **SQL File:** One record uses empty strings (`''`) instead of NULL
- **MySQL/Prisma:** Should use NULL for optional fields
- **Action Required:** Convert empty strings to NULL during import

### Differences from Suppliers

| Feature | Suppliers | Customers |
|---------|-----------|-----------|
| **ID Type** | `BigInt` (AUTO_INCREMENT) | `String` (UUID) |
| **Soft Delete** | `is_active` field | No soft delete (hard delete) |
| **Code Field** | `code` (unique) | No `code` field |
| **Additional Fields** | None | `user_id`, `state`, `zip_code`, `tail_number`, `aircraft_type` |
| **Import Strategy** | Likely no import needed (new table) | Import from existing PostgreSQL dump |

### Structure Validation Summary

✅ **Compatible Fields:**
- All core fields match between SQL file and Prisma schema
- Field types are compatible (with minor size adjustments needed)

⚠️ **Required Transformations:**
1. Convert timestamp format (remove timezone, microseconds)
2. Handle phone number truncation or schema update
3. Convert empty strings to NULL
4. Handle country code format (accept as-is or map)

❌ **No Blocking Issues:**
- No missing required fields
- No incompatible data types
- No foreign key violations expected

---

## 📊 Data Statistics

### Record Count
- **Total Records:** ~199 customers

### Field Completeness

| Field | Non-NULL Count | Percentage |
|-------|----------------|------------|
| `id` | 199 | 100% |
| `user_id` | 199 | 100% |
| `name` | 199 | 100% |
| `email` | ~5 | ~2.5% |
| `phone` | ~40 | ~20% |
| `address` | ~10 | ~5% |
| `city` | ~10 | ~5% |
| `state` | ~4 | ~2% |
| `zip_code` | 199 | 100% (all '00000') |
| `country` | 199 | 100% |
| `contact_person` | ~30 | ~15% |
| `tail_number` | ~4 | ~2% |
| `aircraft_type` | ~4 | ~2% |
| `notes` | 0 | 0% |

### Unique Values

- **Unique User IDs:** 1 (all records share same user_id)
- **Unique Countries:** ~50+ (mostly numeric codes)
- **Unique Names:** ~195+ (some potential duplicates)

---

## 🔍 Key Findings

### ✅ Positive Findings

1. **Schema Compatibility:** SQL file structure matches Prisma schema (with minor adjustments)
2. **Data Completeness:** All required fields (`id`, `user_id`, `name`) are present
3. **UUID Format:** All IDs are valid UUIDs
4. **No Duplicate IDs:** All customer IDs appear unique

### ⚠️ Issues Requiring Attention

1. **Phone Field Size:** Some phone numbers exceed 20 characters (Prisma limit)
2. **Timestamp Format:** PostgreSQL format needs conversion to MySQL format
3. **Empty Strings:** One record uses empty strings instead of NULL
4. **Country Codes:** Numeric codes may need mapping or acceptance
5. **Zip Codes:** All records use placeholder `'00000'`

### ❌ No Critical Blockers

- No missing required fields
- No incompatible data types
- No foreign key constraint violations expected
- All UUIDs are valid format

---

## 📝 Next Steps

### Phase 3: Import Strategy

1. Create transformed SQL file (`customers_import_mysql.sql`)
2. Apply transformations:
   - Convert timestamp format
   - Handle phone truncation
   - Convert empty strings to NULL
   - Remove PostgreSQL-specific syntax
3. Validate transformed file structure

### Phase 4: Dry-Run Verification

1. Verify Prisma model matches target columns
2. Check API routes expect correct fields
3. Verify UI table columns align
4. Confirm RBAC super-user bypass applies

### Phase 5: Execution (Manual)

1. Provide MySQL import command
2. Include rollback plan
3. Document backup procedure

---

## 📋 PHASE 3: IMPORT STRATEGY (SAFE, CONTROLLED)

### Required Transformations

Based on the suppliers import pattern (`database_dumps/suppliers_import_mysql.sql`), the following transformations must be applied:

#### 1. Remove PostgreSQL Syntax
- Change: `INSERT INTO "public"."customers"` → `INSERT INTO customers`
- Remove: All double quotes around column names
- Change: `"id"` → `id`, `"user_id"` → `user_id`, etc.

#### 2. Convert Timestamp Format
- From: `'2025-08-07 06:38:22.94997+00'` (PostgreSQL with timezone and microseconds)
- To: `'2025-08-07 06:38:22'` (MySQL format)
- **Regex Pattern:** `(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\.\d+\+\d{2}` → `$1`

#### 3. Convert Empty Strings to NULL
- One record (ID: `6e757c6f-85b9-403a-9b4d-c94e188363cf`) uses empty strings
- Change: `''` → `NULL` for all optional fields
- **Note:** This should only apply to optional fields, not required fields like `name`

#### 4. Handle Phone Number Truncation (Optional)
- **Option A:** Truncate phone numbers to 20 characters during import
- **Option B:** Update Prisma schema to `VARCHAR(50)` before import (recommended)
- **Affected Records:** ~2-3 records with phone numbers > 20 characters

#### 5. Use INSERT IGNORE or ON DUPLICATE KEY UPDATE
- **Recommendation:** Use `INSERT IGNORE` to skip duplicates
- **Alternative:** Use `INSERT ... ON DUPLICATE KEY UPDATE` to update existing records

### Sample Transformed Record

**Original (PostgreSQL):**
```sql
('00323593-4309-47fa-a636-5bee5f98ff6c', 'd541f75c-eb0c-47c4-a1be-9b4b5a448ecd', 'Richard bell', null, null, null, null, null, '00000', '387', null, null, null, null, '2025-08-07 06:38:22.94997+00', '2025-08-07 06:38:22.94997+00')
```

**Transformed (MySQL):**
```sql
('00323593-4309-47fa-a636-5bee5f98ff6c', 'd541f75c-eb0c-47c4-a1be-9b4b5a448ecd', 'Richard bell', NULL, NULL, NULL, NULL, NULL, '00000', '387', NULL, NULL, NULL, NULL, '2025-08-07 06:38:22', '2025-08-07 06:38:22')
```

### Transformation Script (Recommended)

**Note:** The full transformation should be done using a script (Python, Node.js, or PowerShell). Manual transformation of 199 records is error-prone.

**Python Example:**
```python
import re

# Read original file
with open('database_dumps/customers_rows.sql', 'r') as f:
    content = f.read()

# Remove PostgreSQL schema reference
content = content.replace('INSERT INTO "public"."customers"', 'INSERT IGNORE INTO customers')

# Remove double quotes around column names
content = re.sub(r'"([^"]+)"', r'\1', content)

# Convert timestamp format
content = re.sub(r"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\.\d+\+\d{2}", r"\1", content)

# Convert empty strings to NULL (for optional fields only)
# This is more complex - need to identify which fields are optional
# For now, convert all empty strings in quotes to NULL
content = re.sub(r",\s*''\s*,", ", NULL,", content)
content = re.sub(r",\s*''\s*\)", ", NULL)", content)
content = re.sub(r"\(\s*''\s*,", "(NULL,", content)

# Write transformed file
with open('database_dumps/customers_import_mysql.sql', 'w') as f:
    f.write(content)
```

### File Location

**Output File:** `database_dumps/customers_import_mysql.sql`

**⚠️ DO NOT CREATE THIS FILE AUTOMATICALLY** - Manual review required before import

---

**Analysis Complete** ✅  
**Status:** Ready for Phase 4 (Dry-Run Verification)


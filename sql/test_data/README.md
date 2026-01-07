# Inventory Test Data - Station-2100

## Overview

This directory contains **EXECUTABLE** SQL scripts to create controlled test data that exercises all inventory states in Station-2100:

- **In Stock** - Approved batches with remaining quantity
- **Quarantine** - PENDING or QUARANTINED batches
- **WIP** - Parts issued to OPEN job cards
- **Out** - Parts issued to CLOSED job cards
- **Withheld** - Negative adjustment transactions

## Purpose

This is a **DATA-PLAY / MODEL-VALIDATION PHASE** to:
- Populate realistic test data for the existing Inventory UI
- Validate that all inventory states display correctly
- Verify the MySQL views calculate correctly
- Test the reconciliation formula: `TOTAL = In Stock + Quarantine + WIP + Out + Withheld`

## Important Rules

⚠️ **STRICT RULES (MANDATORY):**
- ✅ DO NOT modify any existing tables' structure
- ✅ DO NOT modify MySQL views
- ✅ DO NOT modify API routes
- ✅ DO NOT modify UI components
- ✅ DO NOT refactor Prisma schema
- ✅ DO NOT delete or overwrite existing production data
- ✅ ADDITIVE INSERTS ONLY
- ✅ Mark all created data clearly as TEST data
- ✅ Use comments in SQL to explain intent

## Files

### 00_find_target_parts.sql
**Purpose:** Helper queries to identify existing products and batches to use for test data.

**Usage:**
1. Run this file first to find products with multiple batches
2. Review the output to understand available data
3. The other scripts will automatically use this data

**Key Queries:**
- Products with multiple batches (preferred for test data)
- Detailed batch information for selected products
- Available users, customers, warehouses, suppliers
- Stock adjustment reasons

### 01_quarantine_test.sql
**Purpose:** Create QUARANTINE state by setting batches to PENDING or QUARANTINED status.

**What it does:**
1. Automatically finds products with multiple APPROVED batches
2. Updates one batch to `PENDING` status
3. Updates another batch to `QUARANTINED` status (if available)
4. Verifies changes in views

**Result:**
- Inventory list shows both In Stock and Quarantine quantities
- Stock card shows split quantities by status

**Executable:** ✅ Yes - runs automatically, no manual ID replacement needed

### 02_wip_test.sql
**Purpose:** Create WIP state by issuing parts to OPEN job cards.

**What it does:**
1. Creates test customer (if needed)
2. Creates OPEN job card (marked as TEST)
3. Issues parts from APPROVED batches to job card
4. Updates batch `remaining_quantity`
5. Creates inventory transaction (audit trail)
6. Verifies WIP state

**Result:**
- Inventory shows WIP > 0
- Batch breakdown reflects issued qty
- WIP table populated

**Executable:** ✅ Yes - runs automatically, no manual ID replacement needed

### 03_out_test.sql
**Purpose:** Create OUT state by issuing parts to CLOSED job cards.

**What it does:**
1. Creates test customer (if needed)
2. Creates CLOSED job card (marked as TEST)
3. Issues parts from APPROVED batches to job card
4. Updates batch `remaining_quantity`
5. Creates inventory transaction (audit trail)
6. Verifies OUT state

**Alternative:** Can also close an existing OPEN job card to move quantities from WIP to OUT.

**Result:**
- Inventory shows Out > 0
- WIP decreases (if job was previously OPEN)
- Out increases

**Executable:** ✅ Yes - runs automatically, no manual ID replacement needed

### 04_withheld_test.sql
**Purpose:** Create WITHHELD state by creating negative adjustment transactions.

**What it does:**
1. Creates stock adjustment reasons (if needed)
2. Identifies APPROVED batches for adjustments
3. Creates negative adjustment transactions (quantity < 0)
4. Uses different dates and small quantities
5. Verifies WITHHELD state

**Result:**
- Withheld > 0 in inventory views
- Reconciliation still balances

**Executable:** ✅ Yes - runs automatically, no manual ID replacement needed

### 05_validation.sql
**Purpose:** Read-only validation queries to verify all test data was created correctly.

**Validations:**
1. Inventory List View - Check state breakdowns
2. Inventory Part Totals View - Detailed breakdown per product
3. Stock Card Batches View - Verify batch statuses
4. Stock Card WIP View - Verify WIP allocations
5. Stock Card Movements View - Verify transaction history
6. Negative Stock Check - Should return no rows
7. FIFO Verification - Verify batch ordering
8. Test Data Identification - Find all test data
9. Reconciliation Summary - Overall status
10. State Coverage Check - Verify all states represented

**Expected Results:**
- ✅ All states appear in inventory views
- ✅ No negative stock detected
- ✅ FIFO ordering preserved
- ✅ Reconciliation formula balances
- ✅ Test data clearly identified

## Execution Order

**IMPORTANT:** Execute scripts in this exact order:

```bash
# 1. Find target parts (optional - for reference)
mysql -u your_user -p your_database < sql/test_data/00_find_target_parts.sql

# 2. Create quarantine state
mysql -u your_user -p your_database < sql/test_data/01_quarantine_test.sql

# 3. Create WIP state
mysql -u your_user -p your_database < sql/test_data/02_wip_test.sql

# 4. Create OUT state
mysql -u your_user -p your_database < sql/test_data/03_out_test.sql

# 5. Create WITHHELD state
mysql -u your_user -p your_database < sql/test_data/04_withheld_test.sql

# 6. Validate the results
mysql -u your_user -p your_database < sql/test_data/05_validation.sql
```

**Or execute all at once:**

```bash
mysql -u your_user -p your_database < sql/test_data/01_quarantine_test.sql && \
mysql -u your_user -p your_database < sql/test_data/02_wip_test.sql && \
mysql -u your_user -p your_database < sql/test_data/03_out_test.sql && \
mysql -u your_user -p your_database < sql/test_data/04_withheld_test.sql && \
mysql -u your_user -p your_database < sql/test_data/05_validation.sql
```

## Script Features

### Automatic Data Discovery
All scripts automatically:
- Find existing products with batches
- Locate active users, warehouses, suppliers
- Use FIFO ordering for batch selection
- Handle missing data gracefully

### Idempotent Execution
All scripts are **idempotent** - they can be run multiple times safely:
- Use `ON DUPLICATE KEY UPDATE` for inserts
- Check for existing data before creating
- Won't create duplicate test data

### Test Data Marking
All test data is clearly marked:
- **Customers:** `code LIKE 'TEST-%'` or `name LIKE '%TEST%'`
- **Job Cards:** `job_number LIKE 'TEST-%'` or `title LIKE '%TEST%'`
- **Adjustments:** `notes LIKE '%TEST%'` or `reason_code IN ('DAMAGE', 'LOSS', 'EXPIRED', 'TEST')`

## Prerequisites

Before running the scripts, ensure you have:

1. **Active Products** - At least one product with `is_active = 1`
2. **Approved Batches** - At least one batch with:
   - `status = 'APPROVED'`
   - `remaining_quantity > 0`
3. **Active Users** - At least one user with `is_active = 1`
4. **Active Warehouses** - At least one warehouse with `is_active = 1`
5. **Active Customers** - Scripts will create test customers if needed

**For best results:**
- Have products with **multiple batches** (at least 2-3 per product)
- Have batches with sufficient `remaining_quantity` (at least 10 units)
- Have batches spread across different dates (for FIFO testing)

## Verification in UI

After executing the test data scripts:

1. **Inventory List Page:**
   - Should show products with In Stock, Quarantine, WIP, Out, Withheld
   - Status column should show "Quarantine" for products with quarantine > 0

2. **Stock Card Page:**
   - Batches section should show different status categories
   - WIP section should show open job cards
   - Movements section should show adjustments

3. **Reconciliation:**
   - Total Received = In Stock + Quarantine + WIP + Out + Withheld
   - Balance Delta should be near zero (within 0.01)

## Troubleshooting

### No products with multiple batches?
- Scripts will still work but may only create limited test data
- Consider creating additional batches for existing products first
- Or use products with single batches (scripts will adapt)

### No APPROVED batches found?
- Ensure you have batches with `status = 'APPROVED'` and `remaining_quantity > 0`
- Check that products have `is_active = 1`

### Negative stock detected?
- Check that batch `remaining_quantity` is updated when issuing parts
- Verify that adjustment quantities are negative
- Ensure no manual batch updates conflict with test data

### Reconciliation doesn't balance?
- Check that all transactions have `status = 'APPROVED'`
- Verify that job card statuses are correct (OPEN for WIP, CLOSED for OUT)
- Ensure batch statuses are correct (APPROVED for In Stock, PENDING/QUARANTINED for Quarantine)
- Check that `total_received` matches sum of all states

### Views not updating?
- Views are read-only and calculated on-the-fly
- Refresh the query or check for syntax errors in view definitions
- Ensure all required tables have data

### Script errors?
- Check that all foreign key constraints are satisfied
- Verify that required tables exist (users, warehouses, products, batches)
- Ensure MySQL user has INSERT, UPDATE, SELECT permissions

## Cleaning Up Test Data

To remove test data (if needed):

```sql
-- Delete test job card parts
DELETE jcp FROM job_card_parts jcp
INNER JOIN job_cards jc ON jcp.job_card_id = jc.id
WHERE jc.job_number LIKE 'TEST-%';

-- Delete test job cards
DELETE FROM job_cards WHERE job_number LIKE 'TEST-%';

-- Delete test customers
DELETE FROM customers WHERE code LIKE 'TEST-%';

-- Delete test adjustments
DELETE it FROM inventory_transactions it
INNER JOIN stock_adjustment_reasons sar ON it.stock_adjustment_reason_id = sar.id
WHERE it.notes LIKE '%TEST%' OR sar.code = 'TEST';

-- Note: Batch statuses should be manually reverted if needed
-- UPDATE batches SET status = 'APPROVED' WHERE batch_code LIKE 'TEST-%';
```

## Next Steps

After test data is validated:
- ✅ Verify in UI that all states display correctly
- ✅ Check that stock cards show correct breakdowns
- ✅ Confirm that charts/reports reflect the test data
- ✅ Document any issues or discrepancies

## Notes

- All SQL files use comments to explain intent
- Scripts are self-contained and executable
- Test data can be safely deleted by filtering on test markers
- Production data is never modified (only test data is created)
- Scripts handle edge cases (missing data, single batches, etc.)

---

**Last Updated:** 2026-01-06  
**Project:** Station-2100  
**Purpose:** Inventory Test Data Generation

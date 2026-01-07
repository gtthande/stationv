# Inventory Views - MySQL Source of Truth

## Overview

This document describes the MySQL views created to serve as the single source of truth for inventory data, matching the Inventory UI logic exactly.

## Views Created

### 1. `vw_inventory_part_totals`
**Purpose:** Aggregated inventory totals per product

**Columns:**
- `product_id` - Product ID
- `part_number` - Part number
- `product_name` - Product name
- `description` - Product description
- `unit_of_measure` - Unit of measure
- `total_received` - Sum of all batch quantities received
- `in_stock` - Approved batches remaining quantity
- `quarantine` - PENDING or QUARANTINED batches remaining quantity
- `wip` - Parts issued to OPEN jobs
- `out` - Parts issued to CLOSED jobs
- `withheld` - Negative adjustments from inventory_transactions
- `calculated_total` - Sum of in_stock + quarantine + wip + out + withheld
- `balance_delta` - Difference between total_received and calculated_total

**Formula:** `TOTAL = IN STOCK + QUARANTINE + WIP + OUT + WITHHELD`

**Usage:** Summary calculations, reconciliation checks

---

### 2. `vw_inventory_list`
**Purpose:** List of all active products with their calculated totals and status

**Columns:**
- `product_id` - Product ID
- `part_number` - Part number
- `product_name` - Product name
- `description` - Product description
- `unit_of_measure` - Unit of measure
- `is_active` - Product active status
- `total_received`, `in_stock`, `quarantine`, `wip`, `out`, `withheld` - From vw_inventory_part_totals
- `status` - Derived status: 'Active', 'Inactive', or 'Quarantine'
- `batch_count` - Number of batches for this product
- `created_at`, `updated_at` - Timestamps

**Usage:** Inventory list page, product catalog with stock status

---

### 3. `vw_stock_card_batches`
**Purpose:** All batches for products with full details

**Columns:**
- `batch_id` - Batch ID
- `product_id` - Product ID
- `part_number` - Part number
- `product_name` - Product name
- `batch_code` - Batch code
- `warehouse_id`, `warehouse_name` - Warehouse information
- `location_id` - Location ID
- `supplier_id`, `supplier_name`, `supplier_code` - Supplier information
- `reference_doc` - Reference document
- `received_quantity` - Original quantity received
- `remaining_quantity` - Current remaining quantity
- `currency`, `fx_rate` - Currency and exchange rate
- `landed_cost_per_unit`, `fitting_price_per_unit` - Cost information
- `status` - Batch status (PENDING, APPROVED, QUARANTINED, DEPLETED)
- `status_category` - UI grouping: 'In Stock', 'Quarantine', 'Depleted'
- `expiry_date` - Expiry date
- `received_by`, `approved_by` - User IDs
- `received_at`, `approved_at` - Timestamps
- `quantity_issued` - Calculated: received_quantity - remaining_quantity

**Usage:** Stock card batch listing, batch-level truth

---

### 4. `vw_stock_card_wip`
**Purpose:** WIP allocations showing parts issued to OPEN jobs

**Columns:**
- `job_card_part_id` - Job card part ID
- `job_card_id` - Job card ID
- `job_number` - Job number
- `job_title` - Job title
- `job_status` - Job status (should be 'OPEN')
- `batch_id`, `batch_code` - Batch information
- `product_id`, `part_number`, `product_name` - Product information
- `quantity` - Quantity issued
- `unit_cost_local`, `unit_price_local` - Cost/price per unit
- `total_cost_local`, `total_price_local` - Total cost/price
- `source_type` - Source type (MAIN_WAREHOUSE, CONSUMABLE, OWNER_SUPPLIED)
- `issued_by`, `received_by` - User IDs
- `issued_at` - When part was issued
- `opened_at` - When job was opened
- `customer_id`, `customer_name` - Customer information
- `aircraft_reg` - Aircraft registration (from job_cards.aircraft_reg)

**Usage:** Stock card WIP section, work in progress tracking

**Filter:** Only includes job cards with status = 'OPEN'

---

### 5. `vw_stock_card_movements`
**Purpose:** Transaction movements/audit trail for products

**Columns:**
- `transaction_id` - Transaction ID
- `batch_id`, `batch_code` - Batch information
- `product_id`, `part_number`, `product_name` - Product information
- `transaction_type` - Type (RECEIPT, ISSUE, ADJUSTMENT, TRANSFER)
- `direction` - Direction (IN, OUT)
- `quantity` - Transaction quantity
- `unit_cost_local`, `total_cost_local` - Cost information
- `job_card_part_id`, `job_card_id`, `job_number`, `job_title` - Job card information (if applicable)
- `from_warehouse_id`, `from_warehouse_name` - Source warehouse (if transfer)
- `to_warehouse_id`, `to_warehouse_name` - Destination warehouse (if transfer)
- `stock_adjustment_reason_id`, `adjustment_reason_code`, `adjustment_reason_description` - Adjustment reason (if applicable)
- `created_by`, `approved_by` - User IDs
- `transaction_status` - Transaction status (PENDING, APPROVED, REJECTED)
- `notes` - Transaction notes
- `transaction_date`, `created_at` - Timestamps

**Usage:** Stock card movements section, transaction history

**Order:** Results ordered by transaction_date DESC, created_at DESC

---

## Installation

### Prerequisites
- MySQL 5.7.11+ (for CREATE OR REPLACE VIEW support)
- All required tables must exist:
  - `products`
  - `batches`
  - `job_cards`
  - `job_card_parts`
  - `inventory_transactions`
  - `warehouses`
  - `suppliers`
  - `customers`
  - `stock_adjustment_reasons`

### Installation Steps

1. **Create the views:**
   ```bash
   mysql -u your_user -p your_database < sql/inventory_views.sql
   ```

2. **Validate the views:**
   ```bash
   mysql -u your_user -p your_database < sql/validate_inventory_views.sql
   ```

### Verification

Run the validation script to verify all views compile and return data:
```sql
SELECT * FROM vw_inventory_list LIMIT 5;
SELECT * FROM vw_inventory_part_totals LIMIT 5;
SELECT * FROM vw_stock_card_batches LIMIT 5;
SELECT * FROM vw_stock_card_wip LIMIT 5;
SELECT * FROM vw_stock_card_movements LIMIT 5;
```

---

## Logic Matching

The views match the logic in `lib/inventory/calculations.ts`:

### Status Derivation
- **In Stock:** Batches with `status = 'APPROVED'` and `remaining_quantity > 0`
- **Quarantine:** Batches with `status IN ('PENDING', 'QUARANTINED')`
- **WIP:** Parts in `job_card_parts` where `job_cards.status = 'OPEN'` and `batch_id IS NOT NULL`
- **Out:** Parts in `job_card_parts` where `job_cards.status = 'CLOSED'` and `batch_id IS NOT NULL`
- **Withheld:** Negative adjustments from `inventory_transactions` where `transaction_type = 'ADJUSTMENT'`, `quantity < 0`, and `status = 'APPROVED'` (matches UI logic: `type === 'ADJUSTMENT' && qty < 0`)

### Reconciliation Formula
```
TOTAL_RECEIVED = IN_STOCK + QUARANTINE + WIP + OUT + WITHHELD
```

The `balance_delta` column in `vw_inventory_part_totals` shows the difference. A balanced inventory should have `ABS(balance_delta) < 0.01`.

---

## Performance Considerations

1. **Indexes:** Ensure the following indexes exist for optimal performance:
   - `batches.product_id`
   - `batches.status`
   - `job_card_parts.batch_id`
   - `job_card_parts.job_card_id`
   - `job_cards.status`
   - `inventory_transactions.batch_id`
   - `inventory_transactions.transaction_type`
   - `inventory_transactions.direction`

2. **View Dependencies:** `vw_inventory_list` depends on `vw_inventory_part_totals`. If you need to recreate views, drop them in reverse dependency order.

3. **Subqueries:** The views use correlated subqueries for WIP, OUT, and WITHHELD calculations. For large datasets, consider materialized views or caching strategies.

---

## Maintenance

### Updating Views
If you need to modify a view:
```sql
-- Drop and recreate
DROP VIEW IF EXISTS vw_inventory_part_totals;
-- Then run the CREATE VIEW statement from inventory_views.sql
```

### Viewing View Definitions
```sql
SHOW CREATE VIEW vw_inventory_part_totals;
```

---

## Notes

- All views are **READ-ONLY** - they do not modify any underlying tables
- Views filter out inactive products (`is_active = 0`) where applicable
- The views use `COALESCE` to handle NULL values and return 0 for empty aggregations
- Batch-level truth is maintained - all calculations are derived from batch data
- The views are deterministic - same data will always produce same results

---

## Troubleshooting

### View Creation Errors

**Error: "Table doesn't exist"**
- Ensure all required tables exist and are accessible
- Check table names match exactly (case-sensitive in some MySQL configurations)

**Error: "Column doesn't exist"**
- Verify column names match the schema
- Check for typos in column references

**Error: "Unknown column in field list"**
- Ensure all referenced columns exist in the joined tables
- Check for missing table aliases

### Performance Issues

If views are slow:
1. Check that indexes exist on foreign key columns
2. Consider adding indexes on frequently filtered columns
3. For very large datasets, consider materialized views or summary tables

---

## Related Files

- `sql/inventory_views.sql` - View definitions
- `sql/validate_inventory_views.sql` - Validation script
- `lib/inventory/calculations.ts` - TypeScript calculation logic (should match views)
- `sql/schema.sql` - Database schema reference

